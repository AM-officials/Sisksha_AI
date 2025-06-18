
import { supabase } from '@/integrations/supabase/client';
import TimeTrackingService from './TimeTrackingService';

export interface LeaderboardUser {
  id: string;
  name: string;
  xp: number;
  level: number;
  streak: number;
  achievements_count: number;
  weekly_minutes: number;
  class?: string;
  profile_image_url?: string;
}

export type SortBy = 'xp' | 'achievements' | 'weekly_usage' | 'streak';

class LeaderboardService {
  /**
   * Get global leaderboard with sorting options
   */
  public static async getGlobalLeaderboard(
    sortBy: SortBy = 'xp',
    limit: number = 50
  ): Promise<LeaderboardUser[]> {
    try {
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          xp,
          level,
          streak,
          class,
          profile_image_url
        `)
        .limit(limit * 2); // Get more to account for filtering

      if (profilesError) throw profilesError;

      if (!profiles || profiles.length === 0) {
        return [];
      }

      // Get achievements count for all users in batch
      const userIds = profiles.map(p => p.id);
      const { data: achievementCounts, error: achievementError } = await supabase
        .from('user_achievements')
        .select('user_id')
        .in('user_id', userIds);

      if (achievementError) throw achievementError;

      // Count achievements per user
      const achievementCountMap = new Map<string, number>();
      (achievementCounts || []).forEach(ac => {
        achievementCountMap.set(ac.user_id, (achievementCountMap.get(ac.user_id) || 0) + 1);
      });

      // Get weekly usage for all users
      const usersWithData = await Promise.all(
        profiles.map(async (profile) => {
          const weeklyMinutes = await TimeTrackingService.getTimeSpentThisWeek(profile.id);
          
          return {
            id: profile.id,
            name: profile.full_name || 'Anonymous',
            xp: profile.xp || 0,
            level: profile.level || 1,
            streak: profile.streak || 0,
            achievements_count: achievementCountMap.get(profile.id) || 0,
            weekly_minutes: weeklyMinutes,
            class: profile.class,
            profile_image_url: profile.profile_image_url
          };
        })
      );

      // Sort based on criteria
      let sortedUsers = [...usersWithData];
      switch (sortBy) {
        case 'xp':
          sortedUsers.sort((a, b) => b.xp - a.xp);
          break;
        case 'achievements':
          sortedUsers.sort((a, b) => b.achievements_count - a.achievements_count);
          break;
        case 'weekly_usage':
          sortedUsers.sort((a, b) => b.weekly_minutes - a.weekly_minutes);
          break;
        case 'streak':
          sortedUsers.sort((a, b) => b.streak - a.streak);
          break;
      }

      return sortedUsers.slice(0, limit);
    } catch (error) {
      console.error('Error fetching global leaderboard:', error);
      return [];
    }
  }

  /**
   * Get class-wise leaderboard
   */
  public static async getClassLeaderboard(
    userClass: string,
    sortBy: SortBy = 'xp',
    limit: number = 50
  ): Promise<LeaderboardUser[]> {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          xp,
          level,
          streak,
          class,
          profile_image_url
        `)
        .eq('class', userClass)
        .limit(limit);

      if (profilesError) throw profilesError;

      if (!profiles || profiles.length === 0) {
        return [];
      }

      // Get achievements count for class users
      const userIds = profiles.map(p => p.id);
      const { data: achievementCounts, error: achievementError } = await supabase
        .from('user_achievements')
        .select('user_id')
        .in('user_id', userIds);

      if (achievementError) throw achievementError;

      // Count achievements per user
      const achievementCountMap = new Map<string, number>();
      (achievementCounts || []).forEach(ac => {
        achievementCountMap.set(ac.user_id, (achievementCountMap.get(ac.user_id) || 0) + 1);
      });

      // Get weekly usage and build final data
      const usersWithData = await Promise.all(
        profiles.map(async (profile) => {
          const weeklyMinutes = await TimeTrackingService.getTimeSpentThisWeek(profile.id);
          
          return {
            id: profile.id,
            name: profile.full_name || 'Anonymous',
            xp: profile.xp || 0,
            level: profile.level || 1,
            streak: profile.streak || 0,
            achievements_count: achievementCountMap.get(profile.id) || 0,
            weekly_minutes: weeklyMinutes,
            class: profile.class,
            profile_image_url: profile.profile_image_url
          };
        })
      );

      // Sort based on criteria
      let sortedUsers = [...usersWithData];
      switch (sortBy) {
        case 'xp':
          sortedUsers.sort((a, b) => b.xp - a.xp);
          break;
        case 'achievements':
          sortedUsers.sort((a, b) => b.achievements_count - a.achievements_count);
          break;
        case 'weekly_usage':
          sortedUsers.sort((a, b) => b.weekly_minutes - a.weekly_minutes);
          break;
        case 'streak':
          sortedUsers.sort((a, b) => b.streak - a.streak);
          break;
      }

      return sortedUsers;
    } catch (error) {
      console.error('Error fetching class leaderboard:', error);
      return [];
    }
  }

  /**
   * Get user's current rank in global leaderboard
   */
  public static async getUserGlobalRank(userId: string, sortBy: SortBy = 'xp'): Promise<number> {
    try {
      const globalData = await this.getGlobalLeaderboard(sortBy, 1000); // Get more users for accurate ranking
      const userIndex = globalData.findIndex(user => user.id === userId);
      return userIndex >= 0 ? userIndex + 1 : 0;
    } catch (error) {
      console.error('Error getting user rank:', error);
      return 0;
    }
  }
}

export default LeaderboardService;
