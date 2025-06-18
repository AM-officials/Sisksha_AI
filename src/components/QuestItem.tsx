import React, { useState, useEffect } from 'react';
import { Check, Award, AlertCircle, Medal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import QuestService, { Quest } from '@/services/QuestService';
import { Progress } from '@/components/ui/progress';

interface QuestItemProps {
  quest: Quest;
  onQuestComplete?: () => void;
  onQuestUpdate?: (updatedQuest?: Quest) => void;
}

const QuestItem: React.FC<QuestItemProps> = ({
  quest,
  onQuestComplete,
  onQuestUpdate
}) => {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [claiming, setClaiming] = useState(false);
  const [localQuest, setLocalQuest] = useState(quest);
  
  // Update local quest when prop changes
  useEffect(() => {
    setLocalQuest(quest);
  }, [quest]);
  
  const handleClaim = async () => {
    if (!user || claiming) return;
    
    setClaiming(true);
    
    try {
      const result = await QuestService.claimQuestReward(
        user.id, 
        quest.id,
        quest.xp_reward
      );
      
      if (result.success) {
        // Update local state first for immediate UI feedback
        setLocalQuest(prev => ({
          ...prev,
          is_claimed: true,
          current_progress: prev.required_progress
        }));
        
        toast({
          title: "Quest Completed!",
          description: `You earned ${quest.xp_reward} XP.`,
          duration: 3000,
        });
        
        // If there's a next quest in the progression
        if (result.nextQuest) {
          toast({
            title: "New Quest Available!",
            description: `"${result.nextQuest.title}" has been unlocked.`,
            duration: 5000,
          });
          
          // Update the quest list with the new quest
          if (onQuestUpdate) {
            onQuestUpdate(result.nextQuest);
          }
        }
        
        // Update local user state with new XP
        if (user) {
          const newQuestsCompleted = (user.questsCompleted || 0) + 1;
          updateUserProfile({ 
            xp: (user.xp || 0) + quest.xp_reward,
            questsCompleted: newQuestsCompleted
          });
        }
        
        if (onQuestComplete) {
          onQuestComplete();
        }
        
      } else {
        toast({
          title: "Could not claim reward",
          description: result.error || "An error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error claiming quest reward:", error);
      toast({
        title: "Error",
        description: "Failed to claim quest reward.",
        variant: "destructive",
      });
    } finally {
      setClaiming(false);
    }
  };
  
  const renderProgress = () => {
    if (!localQuest.required_progress) return null;
    
    const progress = Math.min(localQuest.current_progress, localQuest.required_progress);
    const percentage = Math.round((progress / localQuest.required_progress) * 100);
    
    return (
      <div className="mt-2 w-full">
        <div className="flex justify-between text-xs mb-1">
          <span>{progress}/{localQuest.required_progress}</span>
          <span>{percentage}%</span>
        </div>
        <Progress value={percentage} className="h-1.5" />
      </div>
    );
  };

  // Check if the quest is complete
  const isComplete = localQuest.current_progress >= localQuest.required_progress;
  
  // Check if it's a daily quest that was already claimed today
  const isDailyClaimed = localQuest.category === 'daily' && localQuest.is_claimed;

  // Determine the badge icon based on category
  const renderCategoryBadge = () => {
    if (localQuest.category === 'warrior') {
      return (
        <div className="absolute top-2 right-2 bg-siksha-yellow rounded-full p-1">
          <Medal className="w-3 h-3 text-siksha-purple-dark" />
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex flex-col hover-lift relative">
      {renderCategoryBadge()}
      
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-medium">{localQuest.title}</h3>
          <p className="text-sm text-muted-foreground">{localQuest.description}</p>
          
          {renderProgress()}
        </div>
        
        <div className="flex flex-col items-end ml-4">
          <span className="text-sm font-bold text-siksha-purple">+{localQuest.xp_reward} XP</span>
          
          {localQuest.is_claimed && localQuest.category === 'warrior' ? (
            <div className="w-8 h-8 bg-siksha-green rounded-full flex items-center justify-center mt-2">
              <Check className="w-4 h-4 text-siksha-purple-dark" />
            </div>
          ) : isDailyClaimed ? (
            <div className="mt-2">
              <Button 
                variant="ghost" 
                size="sm"
                disabled={true}
              >
                <Check className="w-4 h-4 mr-1" /> Claimed Today
              </Button>
            </div>
          ) : (
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-2"
              onClick={handleClaim}
              disabled={!isComplete || claiming}
            >
              {claiming ? 'Claiming...' : isComplete ? 'Claim' : 'In Progress'}
            </Button>
          )}
        </div>
      </div>
      
      {localQuest.category === 'daily' && (
        <div className="mt-2 text-xs text-muted-foreground flex items-center">
          <AlertCircle className="w-3 h-3 mr-1" />
          Resets daily at midnight
        </div>
      )}
    </div>
  );
};

export default React.memo(QuestItem);
