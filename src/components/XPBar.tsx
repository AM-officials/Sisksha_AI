
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import QuestService from '@/services/QuestService';

const XPBar: React.FC = () => {
  const { user } = useAuth();
  const [xpInfo, setXpInfo] = useState({
    currentLevelXp: 0,
    nextLevelXp: 100,
    totalXpNeeded: 100
  });
  
  useEffect(() => {
    const loadXpInfo = async () => {
      if (user && user.level) {
        const xpData = await QuestService.getXpForNextLevel(user.level);
        setXpInfo({
          currentLevelXp: xpData.currentLevelXp,
          nextLevelXp: xpData.nextLevelXp,
          totalXpNeeded: xpData.totalXpNeeded
        });
      }
    };
    
    loadXpInfo();
  }, [user?.level, user?.xp]);
  
  const xp = user?.xp || 0;
  const level = user?.level || 1;
  
  // Calculate progress towards next level
  const levelProgress = xp - xpInfo.currentLevelXp;
  const percentage = Math.min(100, (levelProgress / xpInfo.nextLevelXp) * 100);
  
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1 text-xs">
        <span>Level {level}</span>
        <span>{levelProgress}/{xpInfo.nextLevelXp} XP</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-siksha-purple progress-animation"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default XPBar;
