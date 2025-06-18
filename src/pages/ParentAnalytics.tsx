import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import TimeTrackingService from '@/services/TimeTrackingService';
import StreakService from '@/services/StreakService';
import AchievementService from '@/services/AchievementService';
import SyllabusService from '@/services/SyllabusService';
import { supabase } from '@/integrations/supabase/client';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import NotesService from '@/services/NotesService';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
};

const getLast4Weeks = () => {
  const weeks = [];
  const now = new Date();
  for (let i = 3; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    weeks.push(d);
  }
  return weeks;
};

const ParentAnalytics: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studyTimeData, setStudyTimeData] = useState<any>(null);
  const [streakData, setStreakData] = useState<any>(null);
  const [topicAccuracyData, setTopicAccuracyData] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [meterData, setMeterData] = useState<any>(null);
  const [sessionRanges, setSessionRanges] = useState<any[]>([]);
  const [notesCount, setNotesCount] = useState<number>(0);
  const [flashcardsCount, setFlashcardsCount] = useState<number>(0);
  const [todayCounts, setTodayCounts] = useState({ notes: 0, flashcards: 0, quizzes: 0 });

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    (async () => {
      // Weekly study time (per day)
      const last7Days = getLast7Days();
      const dayLabels = last7Days.map(d => d.toLocaleDateString(undefined, { weekday: 'short' }));
      const dayDates = last7Days.map(d => d.toISOString().split('T')[0]);
      const studyMinutes: number[] = [];
      for (const date of dayDates) {
        const { data, error } = await supabase
          .from('usage_stats')
          .select('session_minutes')
          .eq('user_id', user.id)
          .eq('date', date);
        if (error || !data) {
          studyMinutes.push(0);
        } else {
          studyMinutes.push(data.reduce((sum: number, row: any) => sum + row.session_minutes, 0));
        }
      }
      setStudyTimeData({
        labels: dayLabels,
        datasets: [
          {
            label: 'Minutes Studied',
            data: studyMinutes,
            backgroundColor: 'rgba(102, 51, 153, 0.7)',
            borderRadius: 8,
          },
        ],
      });

      // Streak progress (last 4 weeks)
      const streakDays = await StreakService.getStreakDays(user.id);
      const last4Weeks = getLast4Weeks();
      const weekLabels = last4Weeks.map((d, i) => `Week ${i + 1}`);
      const weekStreaks = last4Weeks.map((weekStart) => {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return streakDays.filter((date: string) => {
          const d = new Date(date);
          return d >= weekStart && d <= weekEnd;
        }).length;
      });
      setStreakData({
        labels: weekLabels,
        datasets: [
          {
            label: 'Streak Days',
            data: weekStreaks,
            borderColor: '#a21caf',
            backgroundColor: 'rgba(168, 85, 247, 0.2)',
            tension: 0.4,
            fill: true,
          },
        ],
      });

      // Topic Accuracy
      // 1. Get all syllabi for the user
      const syllabi = await SyllabusService.getUserSyllabi(user.id);
      let allTopics: any[] = [];
      for (const syllabus of syllabi) {
        const topics = await SyllabusService.getTopics(syllabus.id);
        allTopics = allTopics.concat(topics);
      }
      // 2. For each topic, get quiz attempts and calculate accuracy
      const topicLabels: string[] = [];
      const topicAccuracies: number[] = [];
      for (const topic of allTopics) {
        // Get all quiz attempts for this topic
        const { data: attempts, error } = await supabase
          .from('quiz_attempts')
          .select('score, total')
          .eq('user_id', user.id)
          .eq('topic_id', topic.id);
        if (error || !attempts || attempts.length === 0) continue;
        const totalScore = attempts.reduce((sum: number, a: any) => sum + a.score, 0);
        const totalPossible = attempts.reduce((sum: number, a: any) => sum + a.total, 0);
        if (totalPossible === 0) continue;
        const accuracy = Math.round((totalScore / totalPossible) * 100);
        topicLabels.push(topic.topic_title || `Topic ${topic.topic_number}`);
        topicAccuracies.push(accuracy);
      }
      setTopicAccuracyData({
        labels: topicLabels,
        datasets: [
          {
            label: 'Accuracy (%)',
            data: topicAccuracies,
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderRadius: 8,
          },
        ],
      });

      // Achievements overview
      const achievementsList = await AchievementService.getUserAchievements(user.id);
      setAchievements(achievementsList);

      // Fetch today's generation counts
      const today = new Date().toISOString().split('T')[0];
      
      // First try to get today's stats
      const { data: genCounts, error: genCountsError } = await supabase
        .from('daily_stats')
        .select('notes_generated, flashcards_generated, quizzes_given')
        .eq('user_id', user.id)
        .eq('date', today);

      if (genCountsError) {
        console.error('Error fetching daily stats:', genCountsError);
        // Initialize with zeros if table doesn't exist
        setTodayCounts({ notes: 0, flashcards: 0, quizzes: 0 });
      } else if (genCounts && genCounts.length > 0) {
        setTodayCounts({
          notes: genCounts[0].notes_generated || 0,
          flashcards: genCounts[0].flashcards_generated || 0,
          quizzes: genCounts[0].quizzes_given || 0,
        });
      } else {
        // No record for today, try to create one
        try {
          const { data: newRecord } = await supabase
            .from('daily_stats')
            .insert({
              user_id: user.id,
              date: today,
              notes_generated: 0,
              flashcards_generated: 0,
              quizzes_given: 0
            })
            .select()
            .single();
          
          if (newRecord) {
            setTodayCounts({
              notes: newRecord.notes_generated || 0,
              flashcards: newRecord.flashcards_generated || 0,
              quizzes: newRecord.quizzes_given || 0,
            });
          } else {
            setTodayCounts({ notes: 0, flashcards: 0, quizzes: 0 });
          }
        } catch (e) {
          console.error('Failed to initialize daily stats:', e);
          setTodayCounts({ notes: 0, flashcards: 0, quizzes: 0 });
        }
      }

      // Fetch all-time stats for meter graph
      const { data: allTimeStats, error: allTimeError } = await supabase
        .from('daily_stats')
        .select('notes_generated, flashcards_generated, quizzes_given')
        .eq('user_id', user.id);

      if (allTimeError) {
        console.error('Error fetching all-time stats:', allTimeError);
      }

      const totalNotes = allTimeStats?.reduce((sum, day) => sum + (day.notes_generated || 0), 0) || 0;
      const totalFlashcards = allTimeStats?.reduce((sum, day) => sum + (day.flashcards_generated || 0), 0) || 0;
      const totalQuizzes = allTimeStats?.reduce((sum, day) => sum + (day.quizzes_given || 0), 0) || 0;

      setMeterData({
        labels: ['Notes Generated', 'Flashcards Generated', 'Quizzes Given'],
        datasets: [
          {
            label: 'Total Count',
            data: [totalNotes, totalFlashcards, totalQuizzes],
            backgroundColor: [
              'rgba(102, 51, 153, 0.7)',
              'rgba(236, 72, 153, 0.7)',
              'rgba(59, 130, 246, 0.7)',
            ],
            borderRadius: 8,
          },
        ],
      });

      // Study session time ranges (last 7 days)
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const sevenDaysAgo = new Date(startOfDay);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      
      const { data: sessions, error: sessionsError } = await supabase
        .from('study_sessions')
        .select('start_time, end_time')
        .eq('user_id', user.id)
        .gte('start_time', sevenDaysAgo.toISOString())
        .order('start_time', { ascending: false });  // Order by most recent first

      let sessionRangesByDay: any = {};
      let totalStudyTime = 0;
      
      if (sessions && !sessionsError) {
        sessions.forEach((s: any) => {
          const start = new Date(s.start_time);
          const end = new Date(s.end_time);
          const day = start.toLocaleDateString();
          
          if (!sessionRangesByDay[day]) {
            sessionRangesByDay[day] = {
              ranges: [],
              totalMinutes: 0
            };
          }
          
          const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
          totalStudyTime += durationMinutes;
          
          sessionRangesByDay[day].ranges.push({
            start,
            end,
            durationMinutes
          });
          sessionRangesByDay[day].totalMinutes += durationMinutes;
        });
      }

      // Sort days descending (most recent first)
      const sortedDays = Object.keys(sessionRangesByDay).sort((a, b) => 
        new Date(b).getTime() - new Date(a).getTime()
      );
      
      setSessionRanges(sortedDays.map(day => ({
        day,
        ...sessionRangesByDay[day],
        ranges: sessionRangesByDay[day].ranges.sort((a: any, b: any) => 
          b.start.getTime() - a.start.getTime()
        )
      })));

      // Notes count
      const { data: notes, error: notesError } = await supabase
        .from('notes')
        .select('id')
        .eq('user_id', user.id);
      console.log('Notes:', notes, notesError);
      setNotesCount(notes && !notesError ? notes.length : 0);
      // Flashcards count
      // @ts-ignore
      const { data: flashcards, error: flashcardsError } = await supabase
        .from('flashcards')
        .select('id')
        .eq('user_id', user.id);
      console.log('Flashcards:', flashcards, flashcardsError);
      setFlashcardsCount(flashcards && !flashcardsError ? flashcards.length : 0);

      setLoading(false);
    })();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-siksha-purple via-indigo-500 to-siksha-pink">
        <div className="text-white text-2xl font-bold animate-pulse">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-siksha-purple via-indigo-500 to-siksha-pink pb-20">
      <div className="max-w-3xl mx-auto px-4 pt-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">Parental Analytics</h1>
          <Button variant="outline" className="text-siksha-purple bg-white/80" onClick={() => navigate(-1)}>
            Back to Profile
          </Button>
        </div>
        {/* Study Sessions and Notes/Flashcards Count Card */}
        <div className="mb-8">
          <Card className="shadow-xl bg-white/90">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-4 text-siksha-purple">Recent Study Sessions & Notes/Flashcards/Quizzes</h2>
              <div className="mb-4">
                <h3 className="font-semibold text-siksha-purple mb-2">Study Sessions (Last 7 Days)</h3>
                {sessionRanges.length === 0 ? (
                  <div className="text-gray-500">No study sessions recorded.</div>
                ) : (
                  <ul className="space-y-4">
                    {sessionRanges.map(({ day, ranges, totalMinutes }) => {
                      const isToday = new Date(day).toDateString() === new Date().toDateString();
                      return (
                        <li key={day} className={`${isToday ? 'bg-siksha-purple/10 p-3 rounded-lg' : ''}`}>
                          <div className="flex justify-between items-center mb-2">
                            <span className={`font-medium ${isToday ? 'text-siksha-purple' : 'text-indigo-700'}`}>
                              {isToday ? 'Today' : day}
                            </span>
                            <span className="text-sm text-gray-600">
                              Total: {totalMinutes} minutes
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {ranges.map((r: any, idx: number) => (
                              <span 
                                key={idx} 
                                className={`inline-block ${
                                  isToday 
                                    ? 'bg-siksha-purple/20 text-siksha-purple' 
                                    : 'bg-indigo-100 text-indigo-700'
                                } rounded px-3 py-1 text-sm`}
                              >
                                {r.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                –
                                {r.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                <span className="text-xs ml-1">({r.durationMinutes}m)</span>
                              </span>
                            ))}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              <div className="flex gap-8 mt-4">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-siksha-purple">{todayCounts.notes}</span>
                  <span className="text-xs text-gray-600">Notes Generated Today</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-siksha-pink">{todayCounts.flashcards}</span>
                  <span className="text-xs text-gray-600">Flashcards Generated Today</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-siksha-green">{todayCounts.quizzes}</span>
                  <span className="text-xs text-gray-600">Quizzes Given Today</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Meter Graph */}
        <div className="mb-8">
          <Card className="shadow-xl bg-white/90">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-4 text-siksha-purple">Study Activity Summary</h2>
              {meterData && meterData.datasets[0].data.some((v: number) => v > 0) ? (
                <Bar
                  data={meterData}
                  options={{
                    indexAxis: 'y',
                    plugins: { legend: { display: false } },
                    scales: { x: { beginAtZero: true } },
                  }}
                />
              ) : (
                <div className="text-gray-500">No study activity data available.</div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card className="shadow-xl bg-white/90">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-4 text-siksha-purple">Weekly Study Time</h2>
              <Bar data={studyTimeData} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
            </CardContent>
          </Card>
          <Card className="shadow-xl bg-white/90">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-4 text-siksha-purple">Streak Progress</h2>
              <Line data={streakData} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="shadow-xl bg-white/90">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-4 text-siksha-purple">Topic Accuracy</h2>
              <Bar data={topicAccuracyData} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100 } } }} />
            </CardContent>
          </Card>
          <Card className="shadow-xl bg-white/90 flex flex-col justify-center items-center">
            <CardContent className="p-6 w-full">
              <h2 className="text-lg font-bold mb-4 text-siksha-purple">Achievements Overview</h2>
              <div className="flex flex-col gap-2 items-center">
                <div className="w-10 h-10 rounded-full bg-siksha-purple flex items-center justify-center text-white font-bold text-xl">{achievements.filter(a => a.earned).length}</div>
                <p className="text-siksha-purple font-semibold">Achievements Earned</p>
                <div className="w-10 h-10 rounded-full bg-siksha-pink flex items-center justify-center text-white font-bold text-xl">{achievements.filter(a => !a.earned).length}</div>
                <p className="text-siksha-pink font-semibold">In Progress</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ParentAnalytics; 