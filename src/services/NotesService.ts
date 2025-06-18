import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default class NotesService {
  static async insertNote({ userId, topicId, syllabusId, htmlContent, pdfUrl, noteType, note_type, sessionNumber, totalSessions }: {
    userId: string,
    topicId: string,
    syllabusId: string,
    htmlContent: string,
    pdfUrl?: string,
    noteType?: string,
    note_type?: string,
    sessionNumber?: number,
    totalSessions?: number
  }): Promise<any> {
    const { data, error } = await supabase
      .from('notes')
      .insert([{
        user_id: userId,
        topic_id: topicId,
        syllabus_id: syllabusId,
        html_content: htmlContent,
        pdf_url: pdfUrl || null,
        note_type: noteType || null,
        session_number: sessionNumber ?? null,
        total_sessions: totalSessions ?? null
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async getNotesForTopic(topicId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('topic_id', topicId)
      .order('note_type', { ascending: true })
      .order('session_number', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  static async deleteNote(noteId: string, topicId: string): Promise<void> {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);
    if (error) throw error;
  }

  static async updateNote(noteId: string, update: { html_content: string }, topicId: string): Promise<void> {
    const { error } = await supabase
      .from('notes')
      .update({ html_content: update.html_content })
      .eq('id', noteId);
    if (error) throw error;
  }

  static async updateNoteTitle(noteId: string, update: { title: string }, topicId: string): Promise<void> {
    const { error } = await supabase
      .from('notes')
      .update({ title: update.title })
      .eq('id', noteId);
    if (error) throw error;
  }
} 