import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Mascot from '@/components/Mascot';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import XPBar from '@/components/XPBar';
import QuestItem from '@/components/QuestItem';
import StreakCalendar from '@/components/StreakCalendar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Clock, BookText, PenLine, Award, Medal, Users, BarChart3, ClipboardList, MessageCircle, X, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TimeTrackingService from '@/services/TimeTrackingService';
import StreakService from '@/services/StreakService';
import QuestService, { Quest } from '@/services/QuestService';
import AchievementService from '@/services/AchievementService';
import MentorChat from '../components/MentorChat';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Canvas } from '@react-three/fiber';
import InteractiveMascot3D from '@/components/InteractiveMascot3D';

// Add this function before the component
async function resetDailyQuestClaims(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  
  // First get all daily quests
  const { data: dailyQuests } = await supabase
    .from('quests')
    .select('id')
    .eq('category', 'daily');

  if (!dailyQuests) return;

  const dailyQuestIds = dailyQuests.map(q => q.id);

  // Then get and reset only daily quests
  const { data: userQuests } = await supabase
    .from('user_quests')
    .select('id, quest_id, is_claimed, last_updated')
    .eq('user_id', userId)
    .in('quest_id', dailyQuestIds);  // Only get daily quests

  for (const uq of userQuests || []) {
    if (uq.is_claimed && uq.last_updated) {
      const lastUpdated = new Date(uq.last_updated).toISOString().split('T')[0];
      if (lastUpdated !== today) {
        await supabase
          .from('user_quests')
          .update({ is_claimed: false })
          .eq('id', uq.id);
      }
    }
  }
}

const Home: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [streakCalendarOpen, setStreakCalendarOpen] = useState(false);
  const [streakDays, setStreakDays] = useState<string[]>([]);
  const [todayTime, setTodayTime] = useState(0);
  const [weekTime, setWeekTime] = useState(0);
  const [dailyQuests, setDailyQuests] = useState<Quest[]>([]);
  const [warriorQuests, setWarriorQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeQuestTab, setActiveQuestTab] = useState<string>("daily");
  const [mentorChatOpen, setMentorChatOpen] = useState(false);
  const [restoreEligible, setRestoreEligible] = useState<{ eligible: boolean, missedDate: string | null, previousStreak: number }>({ eligible: false, missedDate: null, previousStreak: 1 });
  const [missedDays, setMissedDays] = useState<string[]>([]);
  const [restoring, setRestoring] = useState(false);
  const [classroomMode, setClassroomMode] = useState(false);
  const [activeClassSection, setActiveClassSection] = useState('Feed');
  const [viewAssignmentModal, setViewAssignmentModal] = useState(false);
  const [submitAssignmentModal, setSubmitAssignmentModal] = useState(false);
  const [viewClassmateModal, setViewClassmateModal] = useState(false);
  const [viewAnalyticsModal, setViewAnalyticsModal] = useState(false);
  const [selectedClassmate, setSelectedClassmate] = useState<any>(null);
  const [joinClassModalOpen, setJoinClassModalOpen] = useState(false);
  const [classIdInput, setClassIdInput] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');
  const navigate = useNavigate();
  
  // Load streak days and missed days when component mounts
  useEffect(() => {
    loadStreakData();
    loadTimeData();
    loadQuestsData();
    checkForAchievements();
    loadRestoreEligibility();
    loadMissedDays();
  }, []);
  
  // Record daily login and update streak
  useEffect(() => {
    StreakService.recordDailyLogin(user.id).then(() => {
      // After recording login, check restore eligibility again
      loadRestoreEligibility();
    });
    
    // Initialize quests for new users
    if (user.questsCompleted === 0) {
      QuestService.initializeQuestsForNewUser(user.id);
    }
  }, [user]);
  
  // Start time tracking when component mounts
  useEffect(() => {
    const timeTracker = TimeTrackingService.getInstance();
    timeTracker.startSession(user.id);
    
    return () => {
      timeTracker.endSession();
    };
  }, [user]);
  
  useEffect(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const today = now.toISOString().split('T')[0];
    const resetKey = `dailyQuestReset_${today}`;

    // Only run if after 00:01 and not already reset today
    if ((hours > 0 || (hours === 0 && minutes >= 1)) && !localStorage.getItem(resetKey)) {
      resetDailyQuestClaims(user.id).then(() => {
        localStorage.setItem(resetKey, 'true');
      });
    }
  }, [user]);
  
  const loadStreakData = async () => {
    const days = await StreakService.getStreakDays(user.id);
    setStreakDays(days);
  };
  
  const loadTimeData = async () => {
    const today = await TimeTrackingService.getTimeSpentToday(user.id);
    const week = await TimeTrackingService.getTimeSpentThisWeek(user.id);
    
    setTodayTime(today);
    setWeekTime(week);
  };
  
  const loadQuestsData = async () => {
    setLoading(true);
    
    // Load quests by category
    const daily = await QuestService.getQuestsByCategory(user.id, 'daily');
    const warrior = await QuestService.getQuestsByCategory(user.id, 'warrior');
    
    setDailyQuests(daily);
    setWarriorQuests(warrior);
    
    setLoading(false);
  };
  
  const checkForAchievements = async () => {
    const newAchievements = await AchievementService.checkForNewAchievements(user.id);
    
    // Show notifications for new achievements
    newAchievements.forEach(achievement => {
      toast({
        title: "Achievement Unlocked!",
        description: `${achievement.title}: ${achievement.description}`,
        duration: 5000,
      });
    });
  };
  
  const handleQuestComplete = async () => {
    // Only check for achievements in the background, do not reload the quest list
    checkForAchievements();
  };
  
  const handleQuestUpdate = (newQuest?: Quest) => {
    if (!newQuest) return;
    // Update the specific quest category without affecting others
    if (newQuest.category === 'warrior') {
      setWarriorQuests(current => {
        const questIndex = current.findIndex(q => q.id === newQuest.id);
        if (questIndex === -1) {
          return [...current, newQuest];
        }
        const updatedQuests = [...current];
        updatedQuests[questIndex] = newQuest;
        return updatedQuests;
      });
    } else if (newQuest.category === 'daily') {
      setDailyQuests(current => {
        const questIndex = current.findIndex(q => q.id === newQuest.id);
        if (questIndex === -1) {
          return [...current, newQuest];
        }
        const updatedQuests = [...current];
        updatedQuests[questIndex] = newQuest;
        return updatedQuests;
      });
    }
  };

  // Mock data for classroom mode
  const classFeed = [
    { id: 1, type: 'announcement', content: 'Welcome to the new semester! 🎉', date: '2024-06-01' },
    { id: 2, type: 'material', content: 'Chapter 1 Notes uploaded.', date: '2024-06-02' },
    { id: 3, type: 'announcement', content: 'Quiz on Friday. Prepare well!', date: '2024-06-03' },
  ];
  const assignments = [
    { id: 1, title: 'Math Quiz 1', due: '2024-06-10', status: 'Pending' },
    { id: 2, title: 'Science Assignment', due: '2024-06-12', status: 'Submitted' },
  ];
  const classmates = [
    { id: 1, name: 'Aarav Sharma', avatar: '/avatar1.png', progress: 80 },
    { id: 2, name: 'Isha Patel', avatar: '/avatar2.png', progress: 92 },
    { id: 3, name: 'Rohan Singh', avatar: '/avatar3.png', progress: 75 },
  ];

  // Classroom Mode UI
  const renderClassroomMode = () => (
    <div className="min-h-screen pb-20">
      {/* Classroom Topbar */}
      <div className="flex items-center justify-between px-2 py-3 bg-white/90 rounded-2xl shadow mb-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <BookOpen className="w-7 h-7 text-siksha-purple" />
          <div>
            <div className="font-bold text-siksha-purple text-lg">Classroom: 10-B</div>
            <div className="text-xs text-indigo-400">Mathematics | Mrs. Kapoor</div>
          </div>
        </div>
        <Button variant="outline" className="rounded-xl text-siksha-purple border-siksha-purple font-semibold" onClick={() => setClassroomMode(false)}>
          <X className="w-4 h-4 mr-1" /> Personal Space
        </Button>
      </div>
      {/* Section Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {['Feed', 'Assignments', 'Classmates', 'Analytics'].map(section => (
          <button
            key={section}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${activeClassSection === section ? 'bg-siksha-purple text-white shadow' : 'bg-indigo-50 text-siksha-purple hover:bg-indigo-100'}`}
            onClick={() => setActiveClassSection(section)}
          >
            {section}
          </button>
        ))}
      </div>
      {/* Section Content */}
      <div className="rounded-2xl bg-white shadow p-4 min-h-[300px]">
        {activeClassSection === 'Feed' && (
          <div className="space-y-4">
            {classFeed.map(item => (
              <div key={item.id} className="p-4 rounded-xl bg-indigo-50 flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-siksha-purple" />
                <div>
                  <div className="font-medium text-siksha-purple">{item.type === 'announcement' ? 'Announcement' : 'Material'}</div>
                  <div className="text-sm text-indigo-400">{item.content}</div>
                  <div className="text-xs text-indigo-300 mt-1">{item.date}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeClassSection === 'Assignments' && (
          <div className="space-y-4">
            {assignments.map(a => (
              <div key={a.id} className="flex items-center justify-between p-4 rounded-xl bg-indigo-50">
                <div>
                  <div className="font-semibold text-siksha-purple">{a.title}</div>
                  <div className="text-xs text-indigo-400">Due: {a.due}</div>
                </div>
                <div className="flex gap-2 items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${a.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{a.status}</span>
                  <Button size="sm" variant="outline" className="rounded-xl text-siksha-purple border-siksha-purple" onClick={() => setViewAssignmentModal(true)}>
                    View
                  </Button>
                  {a.status === 'Pending' && (
                    <Button size="sm" className="rounded-xl bg-siksha-purple text-white" onClick={() => setSubmitAssignmentModal(true)}>
                      Submit
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {activeClassSection === 'Classmates' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {classmates.map(mate => (
              <div key={mate.id} className="flex flex-col items-center bg-indigo-50 rounded-xl p-4 cursor-pointer hover:scale-[1.03] transition" onClick={() => { setSelectedClassmate(mate); setViewClassmateModal(true); }}>
                <img src={mate.avatar} alt={mate.name} className="w-14 h-14 rounded-full mb-2 bg-siksha-yellow object-cover" />
                <div className="font-semibold text-siksha-purple text-sm">{mate.name}</div>
                <div className="text-xs text-indigo-400">Progress: {mate.progress}%</div>
              </div>
            ))}
          </div>
        )}
        {activeClassSection === 'Analytics' && (
          <div className="flex flex-col items-center justify-center min-h-[200px]">
            <BarChart3 className="w-12 h-12 text-siksha-purple mb-2" />
            <div className="font-bold text-siksha-purple text-lg mb-1">Class Analytics</div>
            <div className="text-indigo-400 text-sm mb-2">See your progress, leaderboard, and more!</div>
            <Button className="rounded-xl bg-siksha-purple text-white" onClick={() => setViewAnalyticsModal(true)}>
              View Analytics
            </Button>
          </div>
        )}
      </div>
      {/* Modals (UI only) */}
      <Dialog open={viewAssignmentModal} onOpenChange={setViewAssignmentModal}>
        <DialogContent className="max-w-md w-full">
          <DialogTitle>Assignment / Quiz Details</DialogTitle>
          <div className="mt-2 text-sm text-indigo-400">This is a preview of the assignment or quiz. (UI only)</div>
          <Button className="mt-4 w-full bg-siksha-purple text-white rounded-xl" onClick={() => setViewAssignmentModal(false)}>Close</Button>
        </DialogContent>
      </Dialog>
      <Dialog open={submitAssignmentModal} onOpenChange={setSubmitAssignmentModal}>
        <DialogContent className="max-w-md w-full">
          <DialogTitle>Submit Assignment</DialogTitle>
          <div className="mt-2 text-sm text-indigo-400">Upload your file or enter your answer. (UI only)</div>
          <Button className="mt-4 w-full bg-siksha-purple text-white rounded-xl" onClick={() => setSubmitAssignmentModal(false)}>Submit</Button>
        </DialogContent>
      </Dialog>
      <Dialog open={viewClassmateModal} onOpenChange={setViewClassmateModal}>
        <DialogContent className="max-w-md w-full">
          <DialogTitle>Classmate Profile</DialogTitle>
          <div className="flex flex-col items-center gap-2 mt-2">
            <img src={selectedClassmate?.avatar} alt={selectedClassmate?.name} className="w-16 h-16 rounded-full bg-siksha-yellow object-cover" />
            <div className="font-bold text-siksha-purple text-lg">{selectedClassmate?.name}</div>
            <div className="text-indigo-400 text-sm">Progress: {selectedClassmate?.progress}%</div>
            <Button className="mt-2 w-full bg-siksha-purple text-white rounded-xl" onClick={() => setViewClassmateModal(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={viewAnalyticsModal} onOpenChange={setViewAnalyticsModal}>
        <DialogContent className="max-w-md w-full">
          <DialogTitle>Class Analytics</DialogTitle>
          <div className="mt-2 text-sm text-indigo-400">Analytics and leaderboard coming soon! (UI only)</div>
          <Button className="mt-4 w-full bg-siksha-purple text-white rounded-xl" onClick={() => setViewAnalyticsModal(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    </div>
  );

  // Format time display
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} mins`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours} hours`;
    }
  };

  const loadMissedDays = async () => {
    const missed = await StreakService.getMissedStreakDays(user.id);
    setMissedDays(missed);
  };

  const loadRestoreEligibility = async () => {
    const eligibility = await StreakService.getStreakRestoreEligibility(user.id);
    console.log('Streak restore eligibility:', eligibility);
    setRestoreEligible(eligibility);
  };

  const handleRestoreStreak = async () => {
    console.log('Attempting to restore streak...');
    setRestoring(true);
    try {
      const success = await StreakService.restoreStreak(user.id);
      if (success) {
        console.log('Streak restored successfully');
        // Refresh all streak-related data
        await Promise.all([
          loadStreakData(),
          loadRestoreEligibility(),
          loadMissedDays()
        ]);
        // Update the user profile in context to show new streak
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          if (profile) {
            updateUserProfile(profile);
          }
        }
        toast({ 
          title: 'Streak Restored!', 
          description: 'Your streak has been restored.', 
          duration: 4000 
        });
      } else {
        console.log('Streak restore failed');
        toast({ 
          title: 'Restore Failed', 
          description: 'Unable to restore streak. Please try again.', 
          duration: 4000 
        });
      }
    } catch (error) {
      console.error('Error restoring streak:', error);
      toast({ 
        title: 'Error', 
        description: 'An error occurred while restoring your streak.', 
        duration: 4000 
      });
    } finally {
      setRestoring(false);
    }
  };

  // Helper: check if student is in a classroom
  const [studentClassroomId, setStudentClassroomId] = useState<string | null>(null);
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data, error } = await supabase
        .from('students')
        .select('classroom_id')
        .eq('id', user.id)
        .maybeSingle();
      console.log('Student classroom fetch:', { data, error });
      if (!error && data) {
        setStudentClassroomId(data.classroom_id);
      } else {
        setStudentClassroomId(null);
      }
    })();
  }, [user]);

  // Handler for joining classroom
  const handleJoinClassroom = async () => {
    setJoining(true);
    setJoinError('');
    setJoinSuccess('');
    try {
      // Fetch the classroom to get its school_id
      const { data: classroom, error: classError } = await supabase
        .from('classrooms')
        .select('id, school_id')
        .eq('id', classIdInput)
        .single();
      if (classError || !classroom) {
        setJoinError('Classroom not found. Please check the ID.');
        setJoining(false);
        return;
      }
      // Update student record with classroom_id and school_id
      const { error: updateError } = await supabase
        .from('students')
        .update({ classroom_id: classIdInput, school_id: classroom.school_id })
        .eq('id', user.id);
      if (updateError) {
        setJoinError('Failed to join classroom.');
        setJoining(false);
        return;
      }
      setJoinSuccess('Successfully joined the classroom!');
      setStudentClassroomId(classIdInput);
      setJoinError('');
      setTimeout(() => setJoinClassModalOpen(false), 1200);
    } catch (err) {
      setJoinError('An error occurred.');
    } finally {
      setJoining(false);
    }
  };

  // Handler for leaving classroom
  const handleLeaveClassroom = async () => {
    setJoining(true);
    setJoinError('');
    setJoinSuccess('');
    try {
      const { error: updateError } = await supabase
        .from('students')
        .update({ classroom_id: null })
        .eq('id', user.id);
      if (updateError) {
        setJoinError('Failed to leave classroom.');
        setJoining(false);
        return;
      }
      setStudentClassroomId(null);
      setJoinSuccess('You have left the classroom.');
    } catch (err) {
      setJoinError('An error occurred.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <TopBar />
      
      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="flex items-start gap-4 mb-6">
          <div style={{ width: 90, height: 90 }}>
            <Mascot size="md" expression="happy" onClick={() => setMentorChatOpen(true)} />
          </div>
          <div className="bg-siksha-purple-light rounded-lg p-4 flex-1 relative">
            <div className="absolute w-3 h-3 bg-siksha-purple-light transform rotate-45 -left-1.5 top-4"></div>
            <p className="text-siksha-purple-dark">
              Hi {user?.name || 'there'}! Welcome back to your learning journey. 
              Ready to continue where you left off?
            </p>
          </div>
        </div>
        
        <div className="mb-6">
          <XPBar />
        </div>
        
        <div className="mb-8">
          <Button
            className="w-full py-6 text-lg rounded-2xl bg-siksha-purple text-white font-bold shadow-lg hover:bg-indigo-700 transition"
            onClick={() => {
              if (studentClassroomId) {
                navigate('/classroom_mode');
              } else {
                setJoinClassModalOpen(true);
              }
            }}
          >
            <BookOpen className="w-7 h-7 mr-2 inline-block align-middle" /> Enter Classroom
          </Button>
          {studentClassroomId && (
            <Button
              className="w-full mt-2 py-3 rounded-2xl bg-red-500 text-white font-bold shadow-lg hover:bg-red-700 transition"
              onClick={handleLeaveClassroom}
              disabled={joining}
            >
              Leave Classroom
            </Button>
          )}
        </div>
        {classroomMode ? renderClassroomMode() : (
          <>
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-4">Usage Stats</h2>
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-4 hover-lift">
                  <h3 className="text-xs text-muted-foreground mb-1">Today</h3>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-siksha-purple" />
                    <span className="font-bold">{formatTime(todayTime)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Resets at midnight</p>
                </Card>
                <Card className="p-4 hover-lift">
                  <h3 className="text-xs text-muted-foreground mb-1">This Week</h3>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-siksha-purple" />
                    <span className="font-bold">{formatTime(weekTime)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Resets on Monday</p>
                </Card>
              </div>
            </div>
            
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Your Streak</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStreakCalendarOpen(true)}
                >
                  View Calendar
                </Button>
              </div>
              
              <Card className="p-4 hover-lift">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Current Streak</p>
                    <p className="text-2xl font-bold">{user?.streak || 0} days</p>
                  </div>
                  <div className="w-12 h-12 bg-siksha-yellow rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold">🔥</span>
                  </div>
                </div>

                {restoreEligible.eligible && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 mb-2">
                      Your {restoreEligible.previousStreak} day streak was broken! Restore it now to continue your progress.
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      disabled={restoring}
                      onClick={handleRestoreStreak}
                    >
                      {restoring ? 'Restoring...' : 'Restore Streak'}
                    </Button>
                  </div>
                )}
              </Card>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold mb-4">Quests</h2>
                <NavLink to="/profile">
                  <Button variant="ghost" size="sm">
                    <Award className="w-4 h-4 mr-1" />
                    Achievements
                  </Button>
                </NavLink>
              </div>
              
              {loading ? (
                <div className="py-8 text-center text-muted-foreground">
                  Loading quests...
                </div>
              ) : (
                <Tabs defaultValue="daily" value={activeQuestTab} onValueChange={setActiveQuestTab}>
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="daily" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Daily Quests
                    </TabsTrigger>
                    <TabsTrigger value="warrior" className="flex items-center gap-2">
                      <Medal className="h-4 w-4" />
                      Warrior's Path
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="daily" className="mt-0">
                    {dailyQuests.length > 0 ? (
                      <div className="space-y-3">
                        {dailyQuests.map((quest) => (
                          <QuestItem
                            key={quest.id}
                            quest={quest}
                            onQuestComplete={handleQuestComplete}
                            onQuestUpdate={handleQuestUpdate}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        No daily quests available right now. Check back later!
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="warrior" className="mt-0">
                    {warriorQuests.length > 0 ? (
                      <div className="space-y-3">
                        {warriorQuests.map((quest) => (
                          <QuestItem
                            key={quest.id}
                            quest={quest}
                            onQuestComplete={handleQuestComplete}
                            onQuestUpdate={handleQuestUpdate}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        No warrior quests available right now. Complete daily quests to unlock more!
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </>
        )}
      </div>
      
      <BottomNav />
      
      <StreakCalendar
        open={streakCalendarOpen}
        onOpenChange={setStreakCalendarOpen}
        streak={user?.streak || 0}
        streakDays={streakDays}
        missedDays={missedDays}
      />
      
      <Dialog open={mentorChatOpen} onOpenChange={setMentorChatOpen}>
        <DialogContent className="p-0 max-w-md w-full">
          <DialogTitle>Mentor Chat</DialogTitle>
          <DialogDescription className="sr-only">AI-powered mentor chat to help with your learning progress</DialogDescription>
          <MentorChat user={user} onClose={() => setMentorChatOpen(false)} />
        </DialogContent>
      </Dialog>
      <Dialog open={joinClassModalOpen} onOpenChange={setJoinClassModalOpen}>
        <DialogContent className="max-w-xs w-full">
          <DialogTitle>Join a Classroom</DialogTitle>
          <div className="mt-2 text-sm text-indigo-400">Enter your classroom ID (UUID) to join.</div>
          <input
            className="w-full mt-3 mb-2 px-3 py-2 border rounded-xl focus:outline-none"
            placeholder="Classroom UUID"
            value={classIdInput}
            onChange={e => setClassIdInput(e.target.value)}
            disabled={joining}
          />
          {joinError && <div className="text-red-500 text-sm mb-2">{joinError}</div>}
          {joinSuccess && <div className="text-green-600 text-sm mb-2">{joinSuccess}</div>}
          <Button className="w-full bg-siksha-purple text-white mt-2" onClick={handleJoinClassroom} disabled={joining || !classIdInput}>
            {joining ? 'Joining...' : 'Join Classroom'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
