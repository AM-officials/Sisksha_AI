
import { supabase } from '@/integrations/supabase/client';

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  earned: boolean;
  earned_at?: string;
};

class AchievementService {
  /**
   * Get all achievements with earned status for the current user
   */
  public static async getUserAchievements(userId: string): Promise<Achievement[]> {
    try {
      // Get all achievements from the database
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('achievements')
        .select('*');
      
      if (achievementsError) {
        console.error('Error fetching achievements:', achievementsError);
        return [];
      }
      
      // Get user's earned achievements
      const { data: userAchievementsData, error: userAchievementsError } = await supabase
        .from('user_achievements')
        .select('achievement_id, earned_at')
        .eq('user_id', userId);
      
      if (userAchievementsError) {
        console.error('Error fetching user achievements:', userAchievementsError);
        return [];
      }
      
      // Create a map of earned achievements
      const earnedAchievements = new Map();
      if (userAchievementsData) {
        userAchievementsData.forEach(ua => {
          earnedAchievements.set(ua.achievement_id, ua.earned_at);
        });
      }
      
      // Combine the data
      const achievements: Achievement[] = achievementsData.map(achievement => {
        const earned = earnedAchievements.has(achievement.id);
        return {
          ...achievement,
          earned,
          earned_at: earnedAchievements.get(achievement.id)
        };
      });
      
      return achievements;
    } catch (error) {
      console.error('Error in getUserAchievements:', error);
      return [];
    }
  }
  
  /**
   * Award an achievement to a user
   */
  public static async awardAchievement(userId: string, achievementId: string): Promise<boolean> {
    try {
      // Check if already earned
      const { data: existingAchievement, error: checkError } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('achievement_id', achievementId)
        .maybeSingle();
      
      if (existingAchievement) {
        // Already earned
        return true;
      }
      
      // Get the achievement details
      const { data: achievementData, error: achievementError } = await supabase
        .from('achievements')
        .select('xp_reward')
        .eq('id', achievementId)
        .single();
      
      if (achievementError || !achievementData) {
        console.error('Achievement not found:', achievementError);
        return false;
      }
      
      // Award the achievement
      const { error: insertError } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievementId,
          earned_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('Error awarding achievement:', insertError);
        return false;
      }
      
      // Update user XP
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('xp')
        .eq('id', userId)
        .single();
      
      if (userError) {
        console.error('Error fetching user data:', userError);
        return false;
      }
      
      const newXp = (userData.xp || 0) + achievementData.xp_reward;
      
      // Calculate new level - using rpc instead of direct function call
      const { data: levelData } = await supabase.rpc('calculate_level', { 
        xp_points: newXp 
      });
      
      const newLevel = levelData || 1;
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          xp: newXp,
          level: newLevel
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error('Error updating user XP:', updateError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in awardAchievement:', error);
      return false;
    }
  }
  
  /**
   * Check and award achievements based on user activity
   */
  public static async checkForNewAchievements(userId: string): Promise<Achievement[]> {
    try {
      // Get user data
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('streak, quests_completed')
        .eq('id', userId)
        .single();
      
      if (userError) {
        console.error('Error fetching user data:', userError);
        return [];
      }
      
      const newlyEarned: Achievement[] = [];
      
      // Get all achievements
      const achievements = await this.getUserAchievements(userId);
      
      // Check for streak-based achievements
      if (userData.streak >= 3) {
        const achievement = achievements.find(a => a.id === 'streak_3');
        if (achievement && !achievement.earned) {
          const awarded = await this.awardAchievement(userId, 'streak_3');
          if (awarded) {
            newlyEarned.push({...achievement, earned: true});
          }
        }
      }
      
      if (userData.streak >= 5) {
        const achievement = achievements.find(a => a.id === 'streak_5');
        if (achievement && !achievement.earned) {
          const awarded = await this.awardAchievement(userId, 'streak_5');
          if (awarded) {
            newlyEarned.push({...achievement, earned: true});
          }
        }
      }
      
      if (userData.streak >= 10) {
        const achievement = achievements.find(a => a.id === 'streak_10');
        if (achievement && !achievement.earned) {
          const awarded = await this.awardAchievement(userId, 'streak_10');
          if (awarded) {
            newlyEarned.push({...achievement, earned: true});
          }
        }
      }
      
      // Check for quests-based achievements
      if (userData.quests_completed >= 5) {
        const achievement = achievements.find(a => a.id === 'quest_master_5');
        if (achievement && !achievement.earned) {
          const awarded = await this.awardAchievement(userId, 'quest_master_5');
          if (awarded) {
            newlyEarned.push({...achievement, earned: true});
          }
        }
      }
      
      if (userData.quests_completed >= 10) {
        const achievement = achievements.find(a => a.id === 'quest_master_10');
        if (achievement && !achievement.earned) {
          const awarded = await this.awardAchievement(userId, 'quest_master_10');
          if (awarded) {
            newlyEarned.push({...achievement, earned: true});
          }
        }
      }
      
      if (userData.quests_completed >= 20) {
        const achievement = achievements.find(a => a.id === 'quest_master_20');
        if (achievement && !achievement.earned) {
          const awarded = await this.awardAchievement(userId, 'quest_master_20');
          if (awarded) {
            newlyEarned.push({...achievement, earned: true});
          }
        }
      }
      
      return newlyEarned;
    } catch (error) {
      console.error('Error in checkForNewAchievements:', error);
      return [];
    }
  }
}

export default AchievementService;
