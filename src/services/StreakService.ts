import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

class StreakService {
  /**
   * Get the complete streak history for a user
   */
  public static async getStreakDays(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('streak_logs')
        .select('login_date')
        .eq('user_id', userId)
        .order('login_date', { ascending: true });
      
      if (error) {
        console.error('Error fetching streak days:', error);
        return [];
      }
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Return array of dates in YYYY-MM-DD format
      return data.map(log => log.login_date);
    } catch (error) {
      console.error('Error in getStreakDays:', error);
      return [];
    }
  }
  
  /**
   * Get the current streak count for a user
   */
  public static async getCurrentStreak(userId: string): Promise<number> {
    try {
      // Get user's profile which contains the streak
      const { data, error } = await supabase
        .from('profiles')
        .select('streak')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching streak:', error);
        return 1; // Default to minimum streak
      }
      
      return data?.streak || 1;
    } catch (error) {
      console.error('Error in getCurrentStreak:', error);
      return 1;
    }
  }
  
  /**
   * Update the user's streak log for today
   * Will only create one record per day
   */
  public static async recordDailyLogin(userId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    try {
      // Check if we already have a log for today
      const { data: existingLog, error: checkError } = await supabase
        .from('streak_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('login_date', today)
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking existing streak log:', checkError);
        return;
      }
      
      // If we don't have a log for today, create one
      if (!existingLog) {
        const { error: insertError } = await supabase
          .from('streak_logs')
          .insert({
            user_id: userId,
            login_date: today
          });
        
        // Gracefully handle duplicate key error (code 23505)
        if (insertError && insertError.code !== '23505') {
          console.error('Error recording daily login:', insertError);
          return;
        }
        if (insertError && insertError.code === '23505') {
          // Duplicate, treat as success
          console.log('Streak log already exists for today (duplicate key), treating as success.');
        } else {
          console.log('Recorded login for today:', today);
        }
        // Calculate and update streak
        await this.updateUserStreak(userId);
      } else {
        console.log('Already logged in today, streak log exists.');
      }
    } catch (error) {
      console.error('Error in recordDailyLogin:', error);
    }
  }
  
  /**
   * Check if a user's streak can be restored and restore it
   * Only works if:
   * 1. Previous streak was > 1
   * 2. Streak was broken within last 24 hours
   */
  public static async tryRestoreStreak(userId: string): Promise<boolean> {
    try {
      // Get all streak logs for this user, ordered by date
      const { data: logs, error } = await supabase
        .from('streak_logs')
        .select('login_date')
        .eq('user_id', userId)
        .order('login_date', { ascending: false });
      
      if (error || !logs || logs.length === 0) {
        return false;
      }

      const dates = logs.map(log => new Date(log.login_date));
      dates.sort((a, b) => b.getTime() - a.getTime()); // Sort desc

      const now = new Date();
      now.setHours(0, 0, 0, 0);
      
      const mostRecentLogin = new Date(dates[0]);
      mostRecentLogin.setHours(0, 0, 0, 0);

      // Calculate time difference in hours
      const hoursSinceLastLogin = (now.getTime() - mostRecentLogin.getTime()) / (1000 * 60 * 60);

      // Only allow restore if last login was within 24 hours
      if (hoursSinceLastLogin > 24) {
        return false;
      }

      // Calculate what the streak was before it was broken
      let previousStreak = 1;
      for (let i = 1; i < dates.length; i++) {
        const currentDate = new Date(dates[i-1]);
        const previousDate = new Date(dates[i]);
        
        currentDate.setHours(0, 0, 0, 0);
        previousDate.setHours(0, 0, 0, 0);
        
        const diffTime = currentDate.getTime() - previousDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        if (diffDays === 1) {
          previousStreak++;
        } else {
          break;
        }
      }

      // Only restore if previous streak was greater than 1
      if (previousStreak <= 1) {
        return false;
      }

      // Add today's login and restore the streak
      const today = new Date().toISOString().split('T')[0];
      const { error: insertError } = await supabase
        .from('streak_logs')
        .insert({
          user_id: userId,
          login_date: today
        });

      if (insertError) {
        console.error('Error restoring streak:', insertError);
        return false;
      }

      // Update the streak in the profile
      await this.setUserStreak(userId, previousStreak + 1);
      console.log(`Restored streak for user ${userId} to ${previousStreak + 1} days`);
      return true;

    } catch (error) {
      console.error('Error in tryRestoreStreak:', error);
      return false;
    }
  }
  
  /**
   * Calculate and update the user's current streak
   */
  private static async updateUserStreak(userId: string): Promise<void> {
    try {
      const { data: logs, error } = await supabase
        .from('streak_logs')
        .select('login_date')
        .eq('user_id', userId)
        .order('login_date', { ascending: true });
      if (error) return;
      if (!logs || logs.length === 0) {
        await this.setUserStreak(userId, 1);
        return;
      }
      const { data: restoredDays } = await supabase
        .from('missed_streak_days')
        .select('missed_date')
        .eq('user_id', userId);
      const restoredDates = (restoredDays || []).map(d => d.missed_date);
      const now = new Date();
      const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const todayISO = today.toISOString();
      const dateStrings = logs.map(log => log.login_date).sort();
      let consecutiveDays = [dateStrings[0]];
      let lastDate = dateStrings[0];
      for (let i = 1; i < dateStrings.length; i++) {
        const currentDate = dateStrings[i];
        const diffDays = this.getDaysBetweenDatesRaw(lastDate, currentDate);
        const potentialRestoredDate = this.getNextDayRaw(lastDate);
        if (diffDays === 1 || (diffDays === 2 && restoredDates.includes(potentialRestoredDate))) {
          if (diffDays === 2) {
            consecutiveDays.push(potentialRestoredDate);
          }
          consecutiveDays.push(currentDate);
        } else {
          consecutiveDays = [currentDate];
        }
        lastDate = currentDate;
      }
      const lastLoginDate = dateStrings[dateStrings.length - 1];
      const diffToToday = this.getDaysBetweenDatesRaw(lastLoginDate, todayISO);
      const isRecentLogin = diffToToday === 0 || diffToToday === 1;
      const currentStreak = isRecentLogin ? consecutiveDays.length : 1;
      await this.setUserStreak(userId, currentStreak);
    } catch (error) {}
  }
  
  /**
   * Update user profile with new streak count
   * Ensures streak is never less than 1
   */
  private static async setUserStreak(userId: string, streak: number): Promise<void> {
    try {
      // Ensure streak is at least 1
      const finalStreak = Math.max(1, streak);
      
      const { error } = await supabase
        .from('profiles')
        .update({ streak: finalStreak })
        .eq('id', userId);
      
      if (error) {
        console.error('Error updating user streak:', error);
        return;
      }
        
      console.log(`Updated streak for user ${userId} to ${finalStreak} days`);
    } catch (error) {
      console.error('Error in setUserStreak:', error);
    }
  }

  /**
   * Check if the user is eligible for streak restore and return the missed date if so
   * Returns { eligible: boolean, missedDate: string | null, previousStreak: number }
   */
  public static async getStreakRestoreEligibility(userId: string): Promise<{ eligible: boolean, missedDate: string | null, previousStreak: number }> {
    try {
      // Get all streak logs for this user, ordered by date
      const { data: logs, error } = await supabase
        .from('streak_logs')
        .select('login_date')
        .eq('user_id', userId)
        .order('login_date', { ascending: true });

      if (error || !logs || logs.length < 2) {
        return { eligible: false, missedDate: null, previousStreak: 1 };
      }

      // Get restored days to handle them properly
      const { data: restoredDays } = await supabase
        .from('missed_streak_days')
        .select('missed_date')
        .eq('user_id', userId);

      const restoredDates = (restoredDays || []).map(d => d.missed_date);
      
      // Get current date in full ISO format (UTC)
      const now = new Date();
      const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const todayISO = today.toISOString();
      
      // Use full ISO strings for all calculations
      const dateStrings = logs.map(log => log.login_date).sort();

      // Build consecutive days sequence including restored days
      let consecutiveDays = [dateStrings[0]];
      let lastDate = dateStrings[0];

      for (let i = 1; i < dateStrings.length; i++) {
        const currentDate = dateStrings[i];
        const diffDays = this.getDaysBetweenDatesRaw(lastDate, currentDate);
        const potentialRestoredDate = this.getNextDayRaw(lastDate);
        if (diffDays === 1 || (diffDays === 2 && restoredDates.includes(potentialRestoredDate))) {
          if (diffDays === 2) {
            consecutiveDays.push(potentialRestoredDate);
          }
          consecutiveDays.push(currentDate);
        } else {
          consecutiveDays = [currentDate];
        }
        lastDate = currentDate;
      }

      const currentStreak = consecutiveDays.length;
      const lastLoginDate = dateStrings[dateStrings.length - 1];
      const diffToToday = this.getDaysBetweenDatesRaw(lastLoginDate, todayISO);

      if (diffToToday === 2) {
        const missedDate = this.getNextDayRaw(lastLoginDate);
        if (!restoredDates.includes(missedDate)) {
          return { eligible: true, missedDate, previousStreak: currentStreak };
        }
      }
      return { eligible: false, missedDate: null, previousStreak: currentStreak };
    } catch (error) {
      return { eligible: false, missedDate: null, previousStreak: 1 };
    }
  }

  /**
   * Helper for full ISO string
   */
  private static getDaysBetweenDatesRaw(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = d2.getTime() - d1.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  }

  private static getNextDayRaw(date: string): string {
    const d = new Date(date);
    d.setUTCDate(d.getUTCDate() + 1);
    return d.toISOString();
  }

  /**
   * Restore the user's streak by inserting missed day and today, and mark missed day for calendar
   * Returns true if restored, false otherwise
   */
  public static async restoreStreak(userId: string): Promise<boolean> {
    try {
      const eligibility = await this.getStreakRestoreEligibility(userId);
      if (!eligibility.eligible || !eligibility.missedDate) return false;
      const today = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate())).toISOString();
      const missedDate = eligibility.missedDate;
      const { data: existingLogs, error: checkError } = await supabase
        .from('streak_logs')
        .select('login_date')
        .eq('user_id', userId)
        .in('login_date', [missedDate, today]);
      if (checkError) return false;
      const existingDates = (existingLogs || []).map(log => log.login_date);
      const logsToInsert = [];
      if (!existingDates.includes(missedDate)) {
        logsToInsert.push({ user_id: userId, login_date: missedDate });
      }
      if (!existingDates.includes(today)) {
        logsToInsert.push({ user_id: userId, login_date: today });
      }
      if (logsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('streak_logs')
          .insert(logsToInsert);
        if (insertError) return false;
      }
      const { error: missedDayError } = await supabase
        .from('missed_streak_days')
        .upsert({ user_id: userId, missed_date: missedDate }, { onConflict: 'user_id,missed_date' });
      if (missedDayError) return false;
      const { data: allLogs } = await supabase
        .from('streak_logs')
        .select('login_date')
        .eq('user_id', userId)
        .order('login_date', { ascending: true });
      const { data: restoredDays } = await supabase
        .from('missed_streak_days')
        .select('missed_date')
        .eq('user_id', userId);
      if (!allLogs) return false;
      const dateStrings = allLogs.map(log => log.login_date).sort();
      const restoredDates = (restoredDays || []).map(d => d.missed_date);
      let consecutiveDays = [dateStrings[0]];
      let lastDate = dateStrings[0];
      for (let i = 1; i < dateStrings.length; i++) {
        const currentDate = dateStrings[i];
        const diffDays = this.getDaysBetweenDatesRaw(lastDate, currentDate);
        const potentialRestoredDate = this.getNextDayRaw(lastDate);
        if (diffDays === 1 || (diffDays === 2 && restoredDates.includes(potentialRestoredDate))) {
          if (diffDays === 2) {
            consecutiveDays.push(potentialRestoredDate);
          }
          consecutiveDays.push(currentDate);
        } else {
          consecutiveDays = [currentDate];
        }
        lastDate = currentDate;
      }
      const newStreak = consecutiveDays.length;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ streak: newStreak })
        .eq('id', userId);
      if (updateError) return false;
      return true;
    } catch (error) { return false; }
  }

  /**
   * Get all missed streak days for a user (for calendar marking)
   */
  public static async getMissedStreakDays(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('missed_streak_days')
      .select('missed_date')
      .eq('user_id', userId);
    if (error || !data) return [];
    return data.map(row => row.missed_date);
  }
}

export default StreakService;
