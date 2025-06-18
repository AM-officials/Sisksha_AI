
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Achievement } from '@/services/AchievementService';
import { Progress } from '@/components/ui/progress';
import { Trophy, Flame, Award, Star, Calendar, BookOpen, Check } from 'lucide-react';

interface AchievementItemProps {
  achievement: Achievement;
}

const AchievementItem: React.FC<AchievementItemProps> = ({ achievement }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'trophy':
        return <Trophy className="text-siksha-yellow" />;
      case 'flame':
        return <Flame className="text-siksha-red" />;
      case 'award':
        return <Award className="text-siksha-green" />;
      case 'star':
        return <Star className="text-siksha-yellow" />;
      case 'calendar':
        return <Calendar className="text-siksha-purple" />;
      case 'book':
        return <BookOpen className="text-siksha-purple" />;
      case 'check':
        return <Check className="text-siksha-green" />;
      default:
        return <Trophy className="text-siksha-yellow" />;
    }
  };

  return (
    <Card className={`hover-lift ${achievement.earned ? '' : 'opacity-70'}`}>
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 flex items-center justify-center text-2xl mb-2">
            {renderIcon(achievement.icon)}
          </div>
          <h3 className="font-medium text-sm">{achievement.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
          
          {achievement.earned && achievement.earned_at && (
            <p className="text-xs mt-2 bg-siksha-green px-2 py-0.5 rounded-full">
              {formatDate(achievement.earned_at)}
            </p>
          )}
          
          {!achievement.earned && (
            <p className="text-xs mt-2 bg-gray-100 px-2 py-0.5 rounded-full">
              Not earned yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementItem;
