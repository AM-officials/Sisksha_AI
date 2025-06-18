import { supabase } from '@/integrations/supabase/client';

class TimeTrackingService {
  private static instance: TimeTrackingService;
  private lastHeartbeat: number | null = null;
  private sessionStartTime: number | null = null;
  private userId: string | null = null;
  private intervalId: number | null = null;
  private heartbeatIntervalMs = 60000; // 1 minute
  private todaysDate: string;

  private constructor() {
    // Get today's date in YYYY-MM-DD format
    this.todaysDate = new Date().toISOString().split('T')[0];
    
    // Check if we need to reset stats at midnight
    this.scheduleNextReset();
  }

  public static getInstance(): TimeTrackingService {
    if (!TimeTrackingService.instance) {
      TimeTrackingService.instance = new TimeTrackingService();
    }
    return TimeTrackingService.instance;
  }

  /**
   * Start a new tracking session for a user
   */
  public startSession(userId: string): void {
    if (this.userId === userId && this.intervalId !== null) {
      console.log('Session already active for this user');
      return;
    }

    // End any existing session
    this.endSession();

    this.userId = userId;
    const now = Date.now();
    this.sessionStartTime = now;
    this.lastHeartbeat = now;

    // Set up interval for heartbeats
    this.intervalId = window.setInterval(() => this.sendHeartbeat(), this.heartbeatIntervalMs);
    console.log(`Started time tracking for user ${userId}`);
  }

  /**
   * End the current tracking session
   */
  public async endSession(): Promise<void> {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;

      // Record any remaining time from last heartbeat to now
      if (this.userId && this.lastHeartbeat) {
        const now = Date.now();
        const timeSinceLastHeartbeat = now - this.lastHeartbeat;
        
        // Only record if it's less than 2 minutes (to avoid recording inactive time)
        if (timeSinceLastHeartbeat < this.heartbeatIntervalMs * 2) {
          await this.recordSessionTime(this.userId, this.lastHeartbeat, now);
        }
      }

      this.userId = null;
      this.sessionStartTime = null;
      this.lastHeartbeat = null;
      console.log('Ended time tracking session');
    }
  }

  /**
   * Send a heartbeat to keep the session alive and record time
   */
  private async sendHeartbeat(): Promise<void> {
    if (!this.userId || !this.lastHeartbeat) return;

    const now = Date.now();
    const timeSinceLastHeartbeat = now - this.lastHeartbeat;

    if (timeSinceLastHeartbeat > this.heartbeatIntervalMs * 2) {
      // If it's been too long since the last heartbeat, consider the user inactive
      // Just update the last heartbeat without recording time
      this.lastHeartbeat = now;
      return;
    }

    // Record the time between heartbeats (but only the heartbeat interval, not the actual time)
    // This prevents double recording
    const recordTime = Math.min(timeSinceLastHeartbeat, this.heartbeatIntervalMs);
    await this.recordSessionTime(this.userId, this.lastHeartbeat, this.lastHeartbeat + recordTime);
    this.lastHeartbeat = now;
    
    // Check if day has changed
    const currentDate = new Date().toISOString().split('T')[0];
    if (currentDate !== this.todaysDate) {
      console.log('Day changed, resetting daily stats');
      this.todaysDate = currentDate;
      await this.resetDailyStats();
      
      // Also check if it's Monday to reset weekly stats
      const today = new Date();
      if (today.getDay() === 1) { // Monday is 1
        console.log('It\'s Monday, resetting weekly stats');
        await this.resetWeeklyStats();
      }
    }
  }

  /**
   * Record time spent in a session to the database
   */
  private async recordSessionTime(
    userId: string,
    startTime: number,
    endTime: number
  ): Promise<void> {
    try {
      const sessionMinutes = Math.round((endTime - startTime) / 60000); // Convert ms to minutes
      if (sessionMinutes <= 0) return;

      // Get current day and date
      const now = new Date();
      const dateString = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const week = this.getWeekNumber(now);
      const month = now.getMonth() + 1; // 1-12
      const year = now.getFullYear();

      // Record time in the usage_stats table
      const { error } = await supabase.from('usage_stats').insert({
        user_id: userId,
        session_minutes: sessionMinutes,
        date: dateString,
        day,
        week,
        month,
        year
      });

      if (error) {
        console.error('Error recording session time:', error);
      } else {
        console.log(`Recorded ${sessionMinutes} minutes for user ${userId}`);
      }
    } catch (error) {
      console.error('Error in recordSessionTime:', error);
    }
  }

  /**
   * Get the ISO week number for a date
   */
  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  /**
   * Get total time spent today
   */
  public static async getTimeSpentToday(userId: string): Promise<number> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Cast to any to avoid TypeScript errors with the usage_stats table
      // This is a temporary solution until the types are updated
      const { data, error } = await (supabase as any)
        .from('usage_stats')
        .select('session_minutes')
        .eq('user_id', userId)
        .eq('date', today);

      if (error) {
        console.error('Error fetching today\'s time:', error);
        return 0;
      }

      if (!data || data.length === 0) {
        return 0;
      }

      // Sum up all minutes
      return data.reduce((total: number, row: any) => total + row.session_minutes, 0);
    } catch (error) {
      console.error('Error in getTimeSpentToday:', error);
      return 0;
    }
  }

  /**
   * Get total time spent this week
   */
  public static async getTimeSpentThisWeek(userId: string): Promise<number> {
    try {
      const today = new Date();
      const weekNumber = TimeTrackingService.getInstance().getWeekNumber(today);
      const year = today.getFullYear();

      // Cast to any to avoid TypeScript errors with the usage_stats table
      // This is a temporary solution until the types are updated
      const { data, error } = await (supabase as any)
        .from('usage_stats')
        .select('session_minutes')
        .eq('user_id', userId)
        .eq('week', weekNumber)
        .eq('year', year);

      if (error) {
        console.error('Error fetching this week\'s time:', error);
        return 0;
      }

      if (!data || data.length === 0) {
        return 0;
      }

      // Sum up all minutes
      return data.reduce((total: number, row: any) => total + row.session_minutes, 0);
    } catch (error) {
      console.error('Error in getTimeSpentThisWeek:', error);
      return 0;
    }
  }
  
  /**
   * Schedule the next reset at midnight
   */
  private scheduleNextReset(): void {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 1, 0, 0); // 00:01:00
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    console.log(`Scheduling next stats reset in ${timeUntilMidnight / 1000 / 60} minutes`);
    
    // Set timeout for midnight reset
    setTimeout(() => {
      this.resetDailyStats();
      
      // Check if it's Monday to reset weekly stats
      const resetDay = new Date();
      if (resetDay.getDay() === 1) { // Monday is 1
        this.resetWeeklyStats();
      }
      
      // Schedule the next reset
      this.scheduleNextReset();
    }, timeUntilMidnight);
  }
  
  /**
   * Reset daily stats at midnight
   */
  private async resetDailyStats(): Promise<void> {
    console.log('Resetting daily stats at midnight');
    // No need to delete data, we'll just query with the current date
    // This is handled automatically by the getTimeSpentToday method
  }
  
  /**
   * Reset weekly stats on Monday at midnight
   */
  private async resetWeeklyStats(): Promise<void> {
    console.log('Resetting weekly stats for Monday');
    // No need to delete data, we'll just query with the current week number
    // This is handled automatically by the getTimeSpentThisWeek method
  }
}

export default TimeTrackingService;
