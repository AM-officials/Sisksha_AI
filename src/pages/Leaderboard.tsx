import React, { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Trophy, Star, Award, Users, Clock, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LeaderboardService, { LeaderboardUser, SortBy } from '@/services/LeaderboardService';
import { Button } from '@/components/ui/button';

const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('global');
  const [sortBy, setSortBy] = useState<SortBy>('xp');
  const [globalUsers, setGlobalUsers] = useState<LeaderboardUser[]>([]);
  const [classUsers, setClassUsers] = useState<LeaderboardUser[]>([]);
  const [userRank, setUserRank] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [hasClass, setHasClass] = useState(false);
  
  useEffect(() => {
    if (user) {
      setHasClass(!!user.class);
      loadLeaderboardData();
    }
  }, [user, sortBy, activeTab]);

  const loadLeaderboardData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load global leaderboard
      const globalData = await LeaderboardService.getGlobalLeaderboard(sortBy, 50);
      setGlobalUsers(globalData);

      // Load class leaderboard if user has a class
      if (user.class) {
        const classData = await LeaderboardService.getClassLeaderboard(user.class, sortBy, 50);
        setClassUsers(classData);
      }

      // Get user's rank
      const rank = await LeaderboardService.getUserGlobalRank(user.id, sortBy);
      setUserRank(rank);
    } catch (error) {
      console.error('Error loading leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSortIcon = (sortType: SortBy) => {
    switch (sortType) {
      case 'xp':
        return <Star className="w-4 h-4" />;
      case 'achievements':
        return <Award className="w-4 h-4" />;
      case 'weekly_usage':
        return <Clock className="w-4 h-4" />;
      case 'streak':
        return <Flame className="w-4 h-4" />;
    }
  };

  const formatValue = (user: LeaderboardUser, sortType: SortBy) => {
    switch (sortType) {
      case 'xp':
        return `${user.xp} XP`;
      case 'achievements':
        return `${user.achievements_count} achievements`;
      case 'weekly_usage':
        return `${user.weekly_minutes} min`;
      case 'streak':
        return `${user.streak} days`;
    }
  };
  
  const renderLeaderboard = (users: LeaderboardUser[]) => {
    if (loading) {
      return <div className="text-center py-8">Loading leaderboard...</div>;
    }

    if (users.length === 0) {
      return <div className="text-center py-8 text-muted-foreground">No users found</div>;
    }

    // Check if current user is in top 10
    const topUsers = users.slice(0, 10);
    const currentUserInTop = topUsers.some(u => u.id === user?.id);
    const currentUserData = users.find(u => u.id === user?.id);
    
    const displayUsers = [...topUsers];
    if (!currentUserInTop && currentUserData) {
      // Add current user at the end with their actual rank
      displayUsers.push({
        ...currentUserData,
        // Add a visual separator indicator
      });
    }
    
    return (
      <div>
        {/* Top 3 users */}
        <div className="flex justify-around mb-8">
          {topUsers.slice(0, 3).map((leaderUser, index) => {
            const sizes = [
              'order-2 scale-125',
              'order-1 mt-4',
              'order-3 mt-4'
            ];
            
            const colors = [
              'bg-siksha-yellow',
              'bg-gray-300',
              'bg-siksha-orange',
            ];
            
            return (
              <div 
                key={leaderUser.id} 
                className={`flex flex-col items-center ${sizes[index]}`}
              >
                <div className="relative">
                  <div className={`w-16 h-16 rounded-full ${colors[index]} flex items-center justify-center mb-2 shadow-md`}>
                    {leaderUser.profile_image_url ? (
                      <img 
                        src={leaderUser.profile_image_url} 
                        alt={leaderUser.name} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-siksha-purple rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>
                </div>
                
                <p className={`text-sm font-medium truncate max-w-[80px] text-center ${leaderUser.id === user?.id ? 'text-siksha-purple font-bold' : ''}`}>
                  {leaderUser.name}
                </p>
                <p className="text-xs text-muted-foreground">{formatValue(leaderUser, sortBy)}</p>
              </div>
            );
          })}
        </div>
        
        {/* Rest of the leaderboard */}
        <div className="space-y-2">
          {displayUsers.slice(3).map((leaderUser, index) => {
            const actualRank = index + 4;
            const isCurrentUser = leaderUser.id === user?.id;
            const isUserNotInTop = !currentUserInTop && isCurrentUser;
            
            return (
              <div key={`${leaderUser.id}-${index}`}>
                {isUserNotInTop && (
                  <div className="flex items-center justify-center py-2">
                    <div className="text-xs text-muted-foreground">...</div>
                  </div>
                )}
                <div
                  className={`flex items-center p-3 rounded-lg ${
                    isCurrentUser ? 'bg-siksha-purple/10 border border-siksha-purple' : 'bg-white shadow-sm'
                  }`}
                >
                  <div className="w-8 flex justify-center font-medium text-muted-foreground">
                    {isUserNotInTop ? userRank : actualRank}
                  </div>
                  
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-3">
                    {leaderUser.profile_image_url ? (
                      <img 
                        src={leaderUser.profile_image_url} 
                        alt={leaderUser.name} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <p className={`font-medium ${isCurrentUser ? 'text-siksha-purple' : ''}`}>
                      {leaderUser.name}
                    </p>
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-siksha-purple mr-1" />
                      <span className="text-xs">Level {leaderUser.level}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold">{formatValue(leaderUser, sortBy)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderClassPlaceholder = () => (
    <div className="text-center py-12">
      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">Join a Class</h3>
      <p className="text-muted-foreground mb-4">
        You need to be part of a class to view class rankings.
      </p>
      <Button variant="outline" onClick={() => window.location.href = '/profile'}>
        Update Profile
      </Button>
    </div>
  );
  
  return (
    <div className="min-h-screen pb-20">
      <TopBar />
      
      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <div className="flex items-center bg-siksha-purple/10 px-3 py-1 rounded-full">
            <Trophy className="w-4 h-4 text-siksha-purple mr-2" />
            <span className="text-sm font-medium text-siksha-purple-dark">
              Rank #{userRank}
            </span>
          </div>
        </div>

        {/* Sort selector */}
        <div className="mb-6">
          <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="xp">
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-2" />
                  Experience Points
                </div>
              </SelectItem>
              <SelectItem value="achievements">
                <div className="flex items-center">
                  <Award className="w-4 h-4 mr-2" />
                  Achievements
                </div>
              </SelectItem>
              <SelectItem value="weekly_usage">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Weekly Usage
                </div>
              </SelectItem>
              <SelectItem value="streak">
                <div className="flex items-center">
                  <Flame className="w-4 h-4 mr-2" />
                  Streak Count
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="class">My Class</TabsTrigger>
          </TabsList>
          
          <TabsContent value="global">
            {renderLeaderboard(globalUsers)}
          </TabsContent>
          
          <TabsContent value="class">
            {hasClass ? renderLeaderboard(classUsers) : renderClassPlaceholder()}
          </TabsContent>
        </Tabs>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Leaderboard;
