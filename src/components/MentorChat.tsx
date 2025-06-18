import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Loader2, X } from 'lucide-react';
import StreakService from '@/services/StreakService';
import TimeTrackingService from '@/services/TimeTrackingService';
import AchievementService from '@/services/AchievementService';
import QuestService from '@/services/QuestService';
import LeaderboardService from '@/services/LeaderboardService';
import './MentorChat.css';

const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL_DEEPSEEK = 'deepseek-llm-67b-chat'; // For English/Hindi
const MODEL_LLAMA3 = 'llama3-70b-8192'; // Use for all languages

interface MentorChatProps {
  user: any;
  onClose: () => void;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

type LanguageOption = 'en' | 'odia';

const MentorChat: React.FC<MentorChatProps> = ({ user, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [language, setLanguage] = useState<LanguageOption>('en');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch user stats on open
  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    (async () => {
      try {
        // Get leaderboard rank and total users
        let leaderboardData = null;
        try {
          const [rank, globalLeaderboard] = await Promise.all([
            LeaderboardService.getUserGlobalRank(user.id, 'xp'),
            LeaderboardService.getGlobalLeaderboard('xp', 1000),
          ]);
          if (rank && Array.isArray(globalLeaderboard)) {
            leaderboardData = { rank, totalUsers: globalLeaderboard.length };
          }
        } catch (e) {
          leaderboardData = null;
        }
        const [streak, todayTime, weekTime, achievements, dailyQuests, warriorQuests] = await Promise.all([
          StreakService.getCurrentStreak(user.id),
          TimeTrackingService.getTimeSpentToday(user.id),
          TimeTrackingService.getTimeSpentThisWeek(user.id),
          AchievementService.getUserAchievements(user.id),
          QuestService.getQuestsByCategory(user.id, 'daily'),
          QuestService.getQuestsByCategory(user.id, 'warrior'),
        ]);
        if (!isMounted) return;
        setUserStats({
          streak,
          todayTime,
          weekTime,
          achievements: achievements.filter(a => a.earned),
          xp: user.xp,
          level: user.level,
          questsCompleted: user.quests_completed,
          dailyQuests,
          warriorQuests,
          leaderboard: leaderboardData,
        });
      } catch (e) {
        setError('Failed to load your stats.');
      }
    })();
    return () => { isMounted = false; };
  }, [user]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // System prompt for the mentor
  const getSystemPrompt = () => {
    if (!userStats) return 'You are a helpful AI mentor.';
    const { streak, xp, level, todayTime, weekTime, achievements, questsCompleted, dailyQuests, warriorQuests, leaderboard } = userStats;
    const achievementTitles = achievements.map((a: any) => a.title).join(', ') || 'None yet';
    const dailyQuestTitles = dailyQuests.map((q: any) => q.title).join(', ') || 'None';
    const warriorQuestTitles = warriorQuests.map((q: any) => q.title).join(', ') || 'None';
    let leaderboardInfo = '';
    if (leaderboard && leaderboard.rank !== undefined) {
      leaderboardInfo = `\n- Leaderboard rank: ${leaderboard.rank} out of ${leaderboard.totalUsers} users`;
    }
    let languageInstruction = '';
    if (language === 'odia') {
      languageInstruction = '\nRespond in Odia language.';
    } else {
      languageInstruction = '\nRespond in English or Hindi, whichever the user uses.';
    }
    return `You are an AI mentor and coach for a student. The user's stats are:
- Streak: ${streak} days
- XP: ${xp}
- Level: ${level}
- Quests completed: ${questsCompleted}
- Achievements: ${achievementTitles}
- Daily usage today: ${todayTime} minutes
- Weekly usage: ${weekTime} minutes
- Daily quests: ${dailyQuestTitles}
- Warrior quests: ${warriorQuestTitles}${leaderboardInfo}
${languageInstruction}
Praise the user for their achievements and progress. If progress is lacking, offer motivational or constructive advice. Be positive, supportive, but also firm and honest. Always reference their real stats in your responses. Keep your answers short and actionable.`;
  };

  // Send message to Groq
  const sendMessage = async () => {
    if (!input.trim() || loading || !userStats) return;
    setLoading(true);
    setError(null);
    const newMessages: ChatMessage[] = [
      ...messages,
      { role: 'user' as const, content: input.trim() },
    ];
    setMessages(newMessages);
    setInput('');
    try {
      const systemPrompt = getSystemPrompt() || 'You are a helpful AI mentor.';
      const model = MODEL_LLAMA3; // Always use llama3-70b-8192
      const body = {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...newMessages.map(m => ({
            role: m.role === 'user' || m.role === 'assistant' ? m.role : 'user',
            content: m.content,
          })),
        ],
        max_tokens: 300,
        temperature: 0.8,
      };
      // Log the request body for debugging
      console.log('Groq request body:', body);
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Groq API error:', errorText);
        throw new Error('groq-fail');
      }
      const data = await response.json();
      const aiMessage = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
      setMessages([...newMessages, { role: 'assistant' as const, content: aiMessage }]);
    } catch (e: any) {
      setError('Your mentor seems to be taking a short nap!');
    } finally {
      setLoading(false);
    }
  };

  // Initial greeting from mentor
  useEffect(() => {
    if (userStats && messages.length === 0) {
      setMessages([
        {
          role: 'assistant' as const,
          content: `Hi ${user?.full_name || 'there'}! I'm your AI mentor. Ask me anything about your progress, or let me know if you need advice or motivation!`,
        },
      ]);
    }
    // eslint-disable-next-line
  }, [userStats]);

  return (
    <div className="flex flex-col h-[500px] w-full bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-siksha-purple text-white rounded-t-2xl">
        <span className="font-bold">AI Mentor Chat</span>
      </div>
      {/* Language Toggle */}
      <div className="flex items-center gap-2 px-4 py-2 border-b bg-siksha-purple-light">
        <span className="text-xs font-medium">Chat Language:</span>
        <Button
          size="sm"
          variant={language === 'en' ? 'default' : 'outline'}
          className={language === 'en' ? 'bg-siksha-purple text-white' : ''}
          onClick={() => setLanguage('en')}
        >
          English/Hindi
        </Button>
        <Button
          size="sm"
          variant={language === 'odia' ? 'default' : 'outline'}
          className={language === 'odia' ? 'bg-siksha-purple text-white' : ''}
          onClick={() => setLanguage('odia')}
        >
          Odia
        </Button>
      </div>
      <ScrollArea className="flex-1 px-4 py-2 overflow-y-auto" style={{ height: 320 }}>
        <div ref={scrollRef} className="space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-2xl px-3 py-2 max-w-[80%] text-sm ${msg.role === 'user' ? 'bg-siksha-purple text-white' : 'bg-siksha-purple-light text-siksha-purple-dark'} shadow-sm`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-3 py-2 bg-siksha-purple-light text-siksha-purple-dark flex items-center gap-2 shadow-sm">
                <Loader2 className="animate-spin w-4 h-4" /> Mentor is typing...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      {error && <div className="text-red-500 text-xs px-4 py-1">{error}</div>}
      <form
        className="flex items-center gap-2 px-4 py-3 border-t bg-white rounded-b-2xl"
        onSubmit={e => { e.preventDefault(); sendMessage(); }}
      >
        <Textarea
          className="flex-1 resize-none min-h-[36px] max-h-[80px] rounded-xl"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={loading || !userStats}
          rows={1}
        />
        <Button type="submit" disabled={loading || !input.trim() || !userStats}>
          Send
        </Button>
      </form>
    </div>
  );
};

export default MentorChat; 