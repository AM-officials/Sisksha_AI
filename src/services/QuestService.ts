import { supabase } from '@/integrations/supabase/client';
import TimeTrackingService from './TimeTrackingService';
import StreakService from './StreakService';

export type Quest = {
  id: string;
  title: string;
  description: string;
  xp_reward: number;
  type: 'one_time' | 'daily' | 'progressive';
  category: 'daily' | 'warrior';
  required_progress: number;
  next_quest_id: string | null;
  is_claimed: boolean;
  current_progress: number;
};

class QuestService {
  /**
   * Get all available quests for the current user
   */
  public static async getAvailableQuests(userId: string): Promise<Quest[]> {
    try {
      // Get all quests that aren't claimed yet or are daily quests
      const { data: userQuestsData, error: userQuestsError } = await supabase
        .from('user_quests')
        .select('quest_id, is_claimed, current_progress, last_updated')
        .eq('user_id', userId);

      if (userQuestsError) {
        console.error('Error fetching user quests:', userQuestsError);
        return [];
      }

      const userQuestMap = new Map();
      if (userQuestsData) {
        userQuestsData.forEach(uq => {
          userQuestMap.set(uq.quest_id, {
            is_claimed: uq.is_claimed,
            current_progress: uq.current_progress,
            last_updated: uq.last_updated
          });
        });
      }

      // Get all quests
      const { data: questsData, error: questsError } = await supabase
        .from('quests')
        .select('*');

      if (questsError) {
        console.error('Error fetching quests:', questsError);
        return [];
      }

      // Filter quests and merge with user data
      const availableQuests: Quest[] = [];
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      for (const quest of questsData || []) {
        const userQuestData = userQuestMap.get(quest.id);
        
        // For warrior quests, handle progressive logic
        if (quest.category === 'warrior') {
          // For progressive warrior quests, only show if it's the next in line
          if (quest.type === 'progressive') {
            // Check if this quest has a prerequisite
            const prerequisiteQuest = questsData.find(q => q.next_quest_id === quest.id);
            
            if (prerequisiteQuest) {
              // Check if prerequisite is claimed
              const prerequisiteUserData = userQuestMap.get(prerequisiteQuest.id);
              if (!prerequisiteUserData?.is_claimed) {
                continue; // Skip this quest if prerequisite isn't claimed
              }
              
              // IMPORTANT: Hide the completed prerequisite quest if the next one is available
              // Remove the completed quest from availableQuests if it exists
              const completedQuestIndex = availableQuests.findIndex(q => q.id === prerequisiteQuest.id);
              if (completedQuestIndex !== -1) {
                availableQuests.splice(completedQuestIndex, 1);
              }
            }
          }
          
          // For one-time warrior quests, only include unclaimed ones
          if (quest.type === 'one_time' && userQuestData?.is_claimed) {
            continue;
          }
          
          // Skip if already claimed (for progressive quests)
          if (quest.type === 'progressive' && userQuestData?.is_claimed) {
            continue;
          }
        }
        
        // For daily quests, check if they were already claimed today
        if (quest.category === 'daily' && userQuestData?.is_claimed) {
          const lastUpdated = new Date(userQuestData.last_updated).toISOString().split('T')[0];
          if (lastUpdated === today) {
            // Include claimed daily quests to show their status
            availableQuests.push({
              ...quest,
              type: quest.type as 'one_time' | 'daily' | 'progressive',
              category: quest.category as 'daily' | 'warrior',
              is_claimed: true,
              current_progress: userQuestData?.current_progress || 0
            });
            continue;
          }
        }

        availableQuests.push({
          ...quest,
          type: quest.type as 'one_time' | 'daily' | 'progressive',
          category: quest.category as 'daily' | 'warrior',
          is_claimed: userQuestData?.is_claimed || false,
          current_progress: userQuestData?.current_progress || 0
        });
      }

      return availableQuests;
    } catch (error) {
      console.error('Error in getAvailableQuests:', error);
      return [];
    }
  }

  /**
   * Get all quests that have been completed and can be claimed
   */
  public static async getCompletedQuests(userId: string): Promise<Quest[]> {
    const allQuests = await this.getAvailableQuests(userId);
    const completedQuests = [];
    
    for (const quest of allQuests) {
      const isComplete = await this.checkQuestCompletion(userId, quest);
      if (isComplete && !quest.is_claimed) {
        completedQuests.push({
          ...quest,
          current_progress: quest.required_progress // Set progress to max for UI
        });
      }
    }
    
    return completedQuests;
  }

  /**
   * Get quests by category
   */
  public static async getQuestsByCategory(userId: string, category: 'daily' | 'warrior'): Promise<Quest[]> {
    const allQuests = await this.getAvailableQuests(userId);
    const filteredQuests = allQuests.filter(quest => quest.category === category);
    
    // For each quest, update its current progress
    for (const quest of filteredQuests) {
      quest.current_progress = await this.getCurrentProgress(userId, quest);
    }
    
    return filteredQuests;
  }

  /**
   * Get current progress for a quest
   */
  public static async getCurrentProgress(userId: string, quest: Quest): Promise<number> {
    try {
      switch (quest.id) {
        case 'daily_login': {
          // Check if user logged in today
          const today = new Date().toISOString().split('T')[0];
          const { data, error } = await supabase
            .from('streak_logs')
            .select('login_date')
            .eq('user_id', userId)
            .eq('login_date', today)
            .maybeSingle();
          
          return data ? 1 : 0;
        }

        case 'study_15_minutes': {
          const todayMinutes = await TimeTrackingService.getTimeSpentToday(userId);
          return Math.min(todayMinutes, quest.required_progress);
        }

        case 'streak_3':
        case 'streak_5':
        case 'streak_10': {
          const userStreak = await StreakService.getCurrentStreak(userId);
          return Math.min(userStreak, quest.required_progress);
        }

        case 'first_login': {
          // Always completed since user is logged in
          return quest.required_progress;
        }

        case 'quest_master_5':
        case 'quest_master_10':
        case 'quest_master_20': {
          // Get total quests claimed
          const { data, error } = await supabase
            .from('profiles')
            .select('quests_completed')
            .eq('id', userId)
            .single();
            
          if (error || !data) {
            return 0;
          }
          
          return Math.min(data.quests_completed, quest.required_progress);
        }
          
        default:
          // For quests with custom tracking, check the user_quests table
          const { data, error } = await supabase
            .from('user_quests')
            .select('current_progress')
            .eq('user_id', userId)
            .eq('quest_id', quest.id)
            .maybeSingle();
          
          if (error || !data) {
            return 0;
          }
          
          return data.current_progress;
      }
    } catch (error) {
      console.error(`Error getting current progress for quest ${quest.id}:`, error);
      return 0;
    }
  }

  /**
   * Initialize daily quests for a new user
   */
  public static async initializeQuestsForNewUser(userId: string): Promise<void> {
    try {
      // Get all daily quests
      const { data: dailyQuests, error } = await supabase
        .from('quests')
        .select('*')
        .eq('category', 'daily');

      if (error) {
        console.error('Error fetching daily quests:', error);
        return;
      }

      // Initialize user_quests entries for daily quests
      const userQuestsData = dailyQuests.map(quest => ({
        user_id: userId,
        quest_id: quest.id,
        current_progress: 0,
        is_claimed: false,
        last_updated: new Date().toISOString()
      }));

      if (userQuestsData.length > 0) {
        const { error: insertError } = await supabase
          .from('user_quests')
          .upsert(userQuestsData, { onConflict: 'user_id,quest_id' });

        if (insertError) {
          console.error('Error initializing daily quests:', insertError);
        }
      }
    } catch (error) {
      console.error('Error in initializeQuestsForNewUser:', error);
    }
  }

  /**
   * Update user quest progress
   */
  public static async updateQuestProgress(
    userId: string, 
    questId: string, 
    progress: number
  ): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('user_quests')
        .upsert({
          user_id: userId,
          quest_id: questId,
          current_progress: progress,
          last_updated: new Date().toISOString()
        }, { onConflict: 'user_id,quest_id' });
      
      if (error) {
        console.error('Error updating quest progress:', error);
      }
    } catch (error) {
      console.error('Error in updateQuestProgress:', error);
    }
  }

  /**
   * Check if a quest is completed
   */
  public static async checkQuestCompletion(
    userId: string, 
    quest: Quest
  ): Promise<boolean> {
    const currentProgress = await this.getCurrentProgress(userId, quest);
    return currentProgress >= quest.required_progress;
  }

  /**
   * Claim reward for a completed quest
   */
  public static async claimQuestReward(
    userId: string,
    questId: string,
    xp: number
  ): Promise<{ success: boolean; error?: string; nextQuest?: Quest }> {
    try {
      // First, verify that the quest is actually completed
      const { data: questData, error: questError } = await supabase
        .from('quests')
        .select('*')
        .eq('id', questId)
        .single();
        
      if (questError || !questData) {
        return { success: false, error: 'Quest not found' };
      }
        
      const quest: Quest = {
        ...questData,
        type: questData.type as 'one_time' | 'daily' | 'progressive',
        category: questData.category as 'daily' | 'warrior',
        is_claimed: false,
        current_progress: 0
      };
        
      const isCompleted = await this.checkQuestCompletion(userId, quest);
      
      if (!isCompleted) {
        return { success: false, error: 'Quest not completed' };
      }
      
      // Check if quest is already claimed based on category
      const { data: claimCheck, error: claimError } = await supabase
        .from('user_quests')
        .select('is_claimed, last_updated')
        .eq('user_id', userId)
        .eq('quest_id', questId)
        .maybeSingle();
        
      // For warrior quests, check if already claimed ever (permanent claim)
      if (quest.category === 'warrior' && claimCheck?.is_claimed) {
        return { success: false, error: 'Warrior quest reward already claimed' };
      }
      // For daily quests, check if claimed today
      else if (quest.category === 'daily' && claimCheck?.is_claimed) {
        const today = new Date().toISOString().split('T')[0];
        const lastClaimedDate = new Date(claimCheck.last_updated).toISOString().split('T')[0];
        if (lastClaimedDate === today) {
          return { success: false, error: 'Daily reward already claimed today' };
        }
      }
      
      // Mark as claimed and update progress
      await supabase
        .from('user_quests')
        .upsert({
          user_id: userId,
          quest_id: questId,
          is_claimed: true,
          current_progress: quest.required_progress,
          last_updated: new Date().toISOString()
        }, { onConflict: 'user_id,quest_id' });
      
      // Update user XP and quests_completed count
      const { data: userProfileData, error: profileError } = await supabase
        .from('profiles')
        .select('xp, quests_completed')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return { success: false, error: 'Failed to update profile' };
      }
      
      const currentXp = userProfileData.xp || 0;
      const questsCompleted = userProfileData.quests_completed || 0;
      
      const newXp = currentXp + xp;
      const newQuestsCompleted = questsCompleted + 1;
      
      // Calculate new level based on XP
      const newLevel = await this.calculateLevel(newXp);
      
      await supabase
        .from('profiles')
        .update({
          xp: newXp,
          quests_completed: newQuestsCompleted,
          level: newLevel
        })
        .eq('id', userId);
      
      let nextQuest: Quest | undefined;
      
      // If this is a progressive warrior quest, assign the next one
      if (quest.type === 'progressive' && quest.next_quest_id) {
        const { data: nextQuestData, error: nextQuestError } = await supabase
          .from('quests')
          .select('*')
          .eq('id', quest.next_quest_id)
          .single();
          
        if (!nextQuestError && nextQuestData) {
          nextQuest = {
            ...nextQuestData,
            type: nextQuestData.type as 'one_time' | 'daily' | 'progressive',
            category: nextQuestData.category as 'daily' | 'warrior',
            is_claimed: false,
            current_progress: 0
          };
        }
      }
      
      return { 
        success: true,
        nextQuest
      };
    } catch (error) {
      console.error('Error in claimQuestReward:', error);
      return { success: false, error: 'Unknown error occurred' };
    }
  }
  
  /**
   * Calculate the level based on XP
   */
  public static async calculateLevel(xp: number): Promise<number> {
    let level = 1;
    let xpThreshold = 100; // XP needed for level 2
    let totalXpRequired = xpThreshold;
    
    while (xp >= totalXpRequired) {
      level++;
      // Increase XP requirement by 1.25x for next level
      xpThreshold = Math.round(xpThreshold * 1.25);
      totalXpRequired += xpThreshold;
    }
    
    return level;
  }
  
  /**
   * Get XP required for the next level
   */
  public static async getXpForNextLevel(currentLevel: number): Promise<{nextLevelXp: number, currentLevelXp: number, totalXpNeeded: number}> {
    let xpThreshold = 100; // Base XP for level 2
    let totalXpRequired = 0;
    
    // Calculate XP required for current level
    for (let i = 1; i < currentLevel; i++) {
      totalXpRequired += xpThreshold;
      xpThreshold = Math.round(xpThreshold * 1.25);
    }
    
    const currentLevelXp = totalXpRequired;
    const totalXpNeeded = totalXpRequired + xpThreshold;
    
    return {
      nextLevelXp: xpThreshold,
      currentLevelXp,
      totalXpNeeded
    };
  }
}

export default QuestService;
