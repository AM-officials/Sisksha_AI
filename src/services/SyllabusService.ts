import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

const LOCAL_SYLLABI_KEY = 'guestSyllabi';
const LOCAL_TOPICS_KEY = 'guestSyllabusTopics';

function getLocalSyllabi() {
  return JSON.parse(localStorage.getItem(LOCAL_SYLLABI_KEY) || '[]');
}

function setLocalSyllabi(syllabi: any[]) {
  localStorage.setItem(LOCAL_SYLLABI_KEY, JSON.stringify(syllabi));
}

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback UUID generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function getLocalTopics(syllabusId: string) {
  const all = JSON.parse(localStorage.getItem(LOCAL_TOPICS_KEY) || '{}');
  return all[syllabusId] || [];
}

function setLocalTopics(syllabusId: string, topics: any[]) {
  const all = JSON.parse(localStorage.getItem(LOCAL_TOPICS_KEY) || '{}');
  all[syllabusId] = topics;
  localStorage.setItem(LOCAL_TOPICS_KEY, JSON.stringify(all));
}

export default class SyllabusService {
  static async createSyllabus({ userId, inputType, originalFile, rawText }: {
    userId: string,
    inputType: string,
    originalFile?: string,
    rawText: string
  }): Promise<any> {
    const { data, error } = await supabase
      .from('syllabi')
      .insert([{
        user_id: userId,
        input_type: inputType,
        original_file: originalFile || null,
        raw_text: rawText,
        analyzed: false
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async getUserSyllabi(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('syllabi')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async getTopics(syllabusId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('syllabus_topics')
      .select('*')
      .eq('syllabus_id', syllabusId)
      .order('topic_number', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  static async insertTopics(syllabusId: string, topics: any[]): Promise<any[]> {
    const { data, error } = await supabase
      .from('syllabus_topics')
      .insert(topics.map(t => ({ ...t, syllabus_id: syllabusId })));
    if (error) throw error;
    return data || [];
  }

  static async updateSyllabus(id: string, updates: Partial<any>): Promise<any | null> {
    const { data, error } = await supabase
      .from('syllabi')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async deleteSyllabusCascade(syllabusId: string): Promise<void> {
    // 1. Get all topics for this syllabus
    const { data: topics, error: topicsError } = await supabase
      .from('syllabus_topics')
      .select('id')
      .eq('syllabus_id', syllabusId);
    if (topicsError) throw topicsError;
    const topicIds = (topics || []).map(t => t.id);

    // 2. Delete all quiz_attempts for these topics
    if (topicIds.length > 0) {
      const { error: quizError } = await supabase
        .from('quiz_attempts')
        .delete()
        .in('topic_id', topicIds);
      if (quizError) throw quizError;
    }

    // 3. Delete all notes for these topics (or for this syllabus)
    if (topicIds.length > 0) {
      const { error: notesError } = await supabase
        .from('notes')
        .delete()
        .in('topic_id', topicIds);
      if (notesError) throw notesError;
    }

    // 4. Delete all topics for this syllabus
    if (topicIds.length > 0) {
      const { error: topicsDelError } = await supabase
        .from('syllabus_topics')
        .delete()
        .in('id', topicIds);
      if (topicsDelError) throw topicsDelError;
    }

    // 5. Delete the syllabus itself
    const { error: syllabusError } = await supabase
      .from('syllabi')
      .delete()
      .eq('id', syllabusId);
    if (syllabusError) throw syllabusError;
  }

  static async deleteSyllabus(syllabusId: string): Promise<void> {
    return this.deleteSyllabusCascade(syllabusId);
  }
} 