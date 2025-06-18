import React, { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '../context/AuthContext';
import { User, Trophy, Star, Clock, Flame, Calendar, Edit, BarChart3 } from 'lucide-react';
import StreakCalendar from '@/components/StreakCalendar';
import ProfileEdit from '@/components/ProfileEdit';
import { useNavigate } from 'react-router-dom';
import StreakService from '@/services/StreakService';
import AchievementService, { Achievement } from '@/services/AchievementService';
import AchievementItem from '@/components/AchievementItem';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [streakCalendarOpen, setStreakCalendarOpen] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [streakDays, setStreakDays] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch streak days and achievements
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.id) {
        try {
          setLoading(true);
          const days = await StreakService.getStreakDays(user.id);
          setStreakDays(days);
          
          const userAchievements = await AchievementService.getUserAchievements(user.id);
          setAchievements(userAchievements);
          
          setLoading(false);
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          setLoading(false);
        }
      }
    };
    
    loadUserData();
  }, [user?.id]);
  
  return (
    <div className="min-h-screen pb-20">
      <TopBar />
      
      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Profile Header */}
        <div className="mb-6">
          <Card className="bg-gradient-to-br from-siksha-purple to-siksha-purple-dark text-white p-6">
            <CardContent className="p-0 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-2 border-siksha-purple">
                    {user?.profileImage ? (
                      <img 
                        src={user.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-white" />
                    )}
                  </div>
                  
                  <div>
                    <h1 className="text-xl font-bold">{user?.name || 'User'}</h1>
                    <div className="flex items-center text-white/80 text-sm">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>Joined {new Date(user?.joinedDate || '').toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white"
                  onClick={() => setShowEditProfile(!showEditProfile)}
                  title="Edit Profile"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                <div className="text-center">
                  <p className="text-xs text-white/80">Level</p>
                  <div className="flex items-center justify-center mt-1">
                    <Star className="w-4 h-4 mr-1" />
                    <p className="font-bold">{user?.level || 1}</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-white/80">XP</p>
                  <p className="font-bold mt-1">{user?.xp || 0}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-white/80">Streak</p>
                  <div className="flex items-center justify-center mt-1">
                    <Flame className="w-4 h-4 mr-1" />
                    <p className="font-bold">{user?.streak || 1}</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-white/80">Quests</p>
                  <p className="font-bold mt-1">{user?.questsCompleted || 0}</p>
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-white/20 bg-white/10 hover:bg-white/20"
                  onClick={() => setStreakCalendarOpen(true)}
                >
                  <Flame className="w-4 h-4 mr-1" />
                  View Streak
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-white/20 bg-white/10 hover:bg-white/20"
                  onClick={() => navigate('/parent-analytics')}
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Parental Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Profile Edit Section - Only shown when edit button is clicked */}
        {showEditProfile && <ProfileEdit />}
        
        {/* Achievements Section */}
        <div>
          <h2 className="text-xl font-bold mb-4">Achievements</h2>
          <Tabs defaultValue="earned">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="earned">Earned</TabsTrigger>
              <TabsTrigger value="locked">In Progress</TabsTrigger>
            </TabsList>
            
            <TabsContent value="earned">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading achievements...
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {achievements
                    .filter(a => a.earned)
                    .map(achievement => (
                      <AchievementItem 
                        key={achievement.id} 
                        achievement={achievement}
                      />
                    ))}
                  
                  {achievements.filter(a => a.earned).length === 0 && (
                    <p className="col-span-2 text-center py-8 text-muted-foreground">
                      You haven't earned any achievements yet. Keep learning!
                    </p>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="locked">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading achievements...
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {achievements
                    .filter(a => !a.earned)
                    .map(achievement => (
                      <AchievementItem 
                        key={achievement.id} 
                        achievement={achievement}
                      />
                    ))}
                  
                  {achievements.filter(a => !a.earned).length === 0 && (
                    <p className="col-span-2 text-center py-8 text-muted-foreground">
                      You've earned all available achievements. Great job!
                    </p>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <BottomNav />
      
      <StreakCalendar
        open={streakCalendarOpen}
        onOpenChange={setStreakCalendarOpen}
        streak={user?.streak || 1}
        streakDays={streakDays}
      />
    </div>
  );
};

export default Profile;
