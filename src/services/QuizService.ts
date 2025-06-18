import { supabase } from '@/integrations/supabase/client';

export interface QuizAttempt {
  id: string;
  user_id: string;
  topic_id: string;
  score: number;
  total: number;
  attempted_at: string;
}

const QuizService = {
  async saveAttempt({ userId, topicId, score, total }: { userId: string; topicId: string; score: number; total: number; }) {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert([{ user_id: userId, topic_id: topicId, score, total }]);
    if (error) throw error;
    return data;
  },

  async getAttempts({ userId, topicId }: { userId: string; topicId: string; }) {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .order('attempted_at', { ascending: false });
    if (error) throw error;
    return data as QuizAttempt[];
  }
};

export default QuizService; 