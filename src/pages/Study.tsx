import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BookText, PenLine, BookOpen, Upload, Brain, Trash2, Download, ClipboardList } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import SyllabusService from '@/services/SyllabusService';
import NotesService from '@/services/NotesService';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Tesseract from 'tesseract.js';
import { extractTextFromPDF } from '../utils/pdfExtract';
import FlashcardGallery from '../components/FlashcardGallery';
import QuizGallery from '../components/QuizGallery';
import QuizService, { QuizAttempt } from '@/services/QuizService';
import { supabase } from '@/integrations/supabase/client';
import { jsonrepair } from 'jsonrepair';
import { callAI } from '@/lib/ai';

const Study: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [notes, setNotes] = useState<{ id: string; title: string; content: string; date: Date }[]>([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const { toast } = useToast();
  
  const initialTab = searchParams.get('tab') || 'notes';
  
  const [inputMode, setInputMode] = useState<'syllabus' | 'document' | null>(null);
  const [syllabusInputType, setSyllabusInputType] = useState<'image' | 'text'>('image');
  const [syllabusImage, setSyllabusImage] = useState<File | null>(null);
  const [syllabusText, setSyllabusText] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const [syllabi, setSyllabi] = useState<any[]>([]);
  const [loadingSyllabi, setLoadingSyllabi] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingNoteFor, setGeneratingNoteFor] = useState<string | null>(null);
  const [noteHtml, setNoteHtml] = useState<string | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);
  const notePreviewRef = useRef<HTMLDivElement>(null);
  const [topicNotes, setTopicNotes] = useState<{ [topicId: string]: any[] }>({});
  const [expandedSyllabusId, setExpandedSyllabusId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [notesModalHtml, setNotesModalHtml] = useState<string | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [syllabusTopics, setSyllabusTopics] = useState<{ [syllabusId: string]: any[] }>({});
  const [detailedSessionCount, setDetailedSessionCount] = useState<number | null>(null);
  const [detailedGenerating, setDetailedGenerating] = useState(false);
  const [detailedProgress, setDetailedProgress] = useState<number>(0);
  const [detailedError, setDetailedError] = useState<string | null>(null);
  const [examGenerating, setExamGenerating] = useState(false);
  const [examProgress, setExamProgress] = useState<number>(0);
  const [examError, setExamError] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<any | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editingNoteName, setEditingNoteName] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editNameLoading, setEditNameLoading] = useState(false);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [flashcardLoading, setFlashcardLoading] = useState<{ [topicId: string]: boolean }>({});
  const [flashcardError, setFlashcardError] = useState<string | null>(null);
  const [showFlashcardGallery, setShowFlashcardGallery] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizLoading, setQuizLoading] = useState<{ [topicId: string]: boolean }>({});
  const [quizError, setQuizError] = useState<string | null>(null);
  const [showQuizGallery, setShowQuizGallery] = useState(false);
  const [topicHistoryOpen, setTopicHistoryOpen] = useState<string | null>(null);
  const [topicHistory, setTopicHistory] = useState<QuizAttempt[]>([]);
  const [topicHistoryLoading, setTopicHistoryLoading] = useState(false);
  const [currentQuizTopicId, setCurrentQuizTopicId] = useState<string | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{[key: number]: number}>({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizSubmissionResult, setQuizSubmissionResult] = useState<any | null>(null);
  const [syllabusAdded, setSyllabusAdded] = useState(false);
  const [selectedSyllabus, setSelectedSyllabus] = useState<any>(null);

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };
  
  const handleCreateNote = () => {
    if (!noteTitle.trim() || !noteContent.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both a title and content for your note.",
        variant: "destructive",
      });
      return;
    }
    
    const newNote = {
      id: `note-${Date.now()}`,
      title: noteTitle,
      content: noteContent,
      date: new Date()
    };
    
    setNotes([newNote, ...notes]);
    setNoteTitle('');
    setNoteContent('');
    
    toast({
      title: "Note Created!",
      description: "Your study note has been saved.",
    });
  };
  
  const handleImageUpload = () => {
    toast({
      title: "Image Processing",
      description: "This feature will be available soon!",
    });
  };
  
  const handleGenerateAI = () => {
    toast({
      title: "AI Study Materials",
      description: "This feature will be available soon!",
    });
  };

  // Fetch syllabi on mount or when user changes
  useEffect(() => {
    if (!user) return;
    setLoadingSyllabi(true);
    SyllabusService.getUserSyllabi(user.id)
      .then(setSyllabi)
      .catch(e => setError(e.message))
      .finally(() => setLoadingSyllabi(false));
  }, [user]);

  // Fetch topics for a syllabus when expanded
  useEffect(() => {
    if (!expandedSyllabusId) return;
    setLoadingTopics(true);
    SyllabusService.getTopics(expandedSyllabusId)
      .then(topics => setSyllabusTopics(prev => ({ ...prev, [expandedSyllabusId]: topics })))
      .catch(e => setError(e.message))
      .finally(() => setLoadingTopics(false));
  }, [expandedSyllabusId]);

  // Fetch topic history when topicHistoryOpen changes
  useEffect(() => {
    if (topicHistoryOpen && user && user.id) {
      setTopicHistoryLoading(true);
      QuizService.getAttempts({ userId: user.id, topicId: topicHistoryOpen })
        .then(setTopicHistory)
        .catch(() => setTopicHistory([]))
        .finally(() => setTopicHistoryLoading(false));
    }
  }, [topicHistoryOpen, user]);

  // Retry utility — retries up to maxRetries times with exponential back-off
  const retryWithFallback = async (apiCall: () => Promise<any>, maxRetries = 3) => {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await apiCall();
      } catch (error) {
        lastError = error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw new Error('All API attempts failed. Please try again later.');
  };

  // Call AI for topic group generation
  async function callLLMForTopics(syllabusText: string): Promise<{ heading: string, topics: { topic_number: number, topic_title: string, chapters_range: string }[] }> {
    const prompt = `You are an expert syllabus parser. Your ONLY job is to return a JSON object in the following format, and nothing else. Do NOT include any explanation, preamble, or extra text. If you understand, reply ONLY with the JSON object. Example:

{
  "heading": "Physics",
  "topics": [
    { "topic_number": 1, "topic_title": "Kinematics", "chapters_range": "Chapters 1-3" },
    { "topic_number": 2, "topic_title": "Dynamics", "chapters_range": "Chapters 4-6" }
  ]
}

Now, given this syllabus text, return ONLY the JSON object:
"""
${syllabusText}
"""`;
    const content = await callAI({
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048,
      temperature: 0.1,
    });
    try {
      const repaired = jsonrepair(content);
      const parsed = JSON.parse(repaired);
      if (!parsed.heading || !Array.isArray(parsed.topics)) {
        throw new Error('Invalid response structure');
      }
      parsed.topics = parsed.topics.map((topic: any, index: number) => ({
        topic_number: topic.topic_number || index + 1,
        topic_title: topic.topic_title || `Topic ${index + 1}`,
        chapters_range: topic.chapters_range || '',
      }));
      return parsed;
    } catch (e) {
      throw new Error('Sorry, the AI could not parse your syllabus. Please try again or rephrase the syllabus text.');
    }
  }


  // Handler for creating a syllabus
  const handleAnalyzeSyllabus = async () => {
    if (!user) return;
    try {
      setLoadingSyllabi(true);
      let rawText = '';
      let inputType = '';
      let originalFile = '';
      if (inputMode === 'syllabus') {
        inputType = syllabusInputType;
        if (syllabusInputType === 'image' && syllabusImage) {
          // Extract text from image using tesseract.js
          toast({ title: 'Extracting text from image...', description: 'This may take a few seconds.' });
          const { data: { text } } = await Tesseract.recognize(
            syllabusImage,
            'eng',
            { logger: m => console.log(m) }
          );
          rawText = text.trim();
          originalFile = syllabusImage.name;
          if (!rawText) {
            setError('Could not extract any text from the image. Please try another image.');
            setLoadingSyllabi(false);
            return;
          }
        } else if (syllabusInputType === 'text' && syllabusText.trim()) {
          rawText = syllabusText.trim();
        }
      } else if (inputMode === 'document' && documentFile) {
        inputType = documentFile.type;
        try {
          rawText = await extractTextFromPDF(documentFile);
          originalFile = documentFile.name;
          if (!rawText) {
            setError('Could not extract any text from the document. Please try another file.');
            setLoadingSyllabi(false);
            return;
          }
        } catch (err) {
          setError('Failed to extract text from document.');
          setLoadingSyllabi(false);
          return;
        }
      }
      if (!rawText) {
        setError('Please provide a valid syllabus input.');
        return;
      }
      // 1. Create syllabus record
      const newSyllabus = await SyllabusService.createSyllabus({
        userId: user.id,
        inputType,
        originalFile,
        rawText
      });
      // 2. Call LLM to analyze syllabus and generate topics
      const llmResult = await callLLMForTopics(rawText);
      // 3. Update syllabus with heading and analyzed=true
      await SyllabusService.updateSyllabus(newSyllabus.id, {
        subject_name: llmResult.heading,
        analyzed: true
      });
      // 4. Insert topics
      await SyllabusService.insertTopics(newSyllabus.id, llmResult.topics);
      // 5. Refresh syllabi list
      const updatedSyllabi = await SyllabusService.getUserSyllabi(user.id);
      setSyllabi(updatedSyllabi);
      setInputMode(null);
      setSyllabusImage(null);
      setSyllabusText('');
      setDocumentFile(null);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingSyllabi(false);
    }
  };

  // Call AI for note generation
  async function callLLMForNotes(topicTitle: string, chaptersRange: string): Promise<string> {
    const prompt = `Please generate clean, visually organized study notes for the topic provided. Ensure the notes are broken into clear sections and sub-sections with headings (like "Key Concepts," "Formulas," "Examples," "Definitions," etc.). Maintain proper paragraph spacing, and use bullet points or tables wherever appropriate to present information in a structured and eye-pleasing format. Each concept should be explained clearly in a short paragraph or concise bullet point, not merged into a wall of text. Use bold or italic styling to highlight key terms, and leave enough space between lines to make the notes easy to read and visually appealing. Avoid clustering too much information in a single block and ensure the output resembles well-organized revision material, not a dense transcript. Prioritize clarity, readability, and good formatting in markdown or plain text.\n\nTopic: ${topicTitle}.`;
    return callAI({
      messages: [{ role: 'system', content: prompt }],
      max_tokens: 2048,
      temperature: 0.5,
    });
  }

  // Utility to extract HTML and CSS from LLM response and combine for rendering
  function extractAndCombineHtmlCss(llmResponse: string): string {
    // Extract HTML code block
    const htmlMatch = llmResponse.match(/```html([\s\S]*?)```/i) || llmResponse.match(/<html[\s\S]*<\/html>/i);
    const html = htmlMatch ? (htmlMatch[1] || htmlMatch[0]) : llmResponse;
    // Extract CSS code block
    const cssMatch = llmResponse.match(/```css([\s\S]*?)```/i) || llmResponse.match(/<style[\s\S]*?<\/style>/i);
    const css = cssMatch ? (cssMatch[1] || cssMatch[0]) : '';
    // Combine
    return `<style>${css.trim()}</style>\n${html.trim()}`;
  }

  const handleGenerateNotes = async (topic: any, syllabusId: string) => {
    setGeneratingNoteFor(topic.id);
    setNoteLoading(true);
    setNoteError(null);
    try {
      // 1. Call LLM to generate notes
      const llmResponse = await callLLMForNotes(topic.topic_title, topic.chapters_range);
      // 2. Parse and combine HTML+CSS
      const htmlContent = extractAndCombineHtmlCss(llmResponse);
      // 3. Store in Supabase
      const note = await NotesService.insertNote({
        userId: user.id,
        topicId: topic.id,
        syllabusId: syllabusId,
        htmlContent: htmlContent,
        noteType: 'detailed',
      });
      if (note) {
        setNoteHtml(htmlContent);
        setShowNoteModal(true);
        await fetchNotesForTopic(topic.id);
      } else {
        throw new Error('Failed to save note');
      }
    } catch (e: any) {
      setNoteError(e.message);
      toast({
        title: "Error generating notes",
        description: e.message,
        variant: "destructive"
      });
    } finally {
      setGeneratingNoteFor(null);
      setNoteLoading(false);
    }
  };

  // Update handleDownloadPDF to accept HTML content and filename
  const handleDownloadPDF = async (htmlContent: string, filename: string = 'notes.pdf') => {
    const html2pdf = (await import('html2pdf.js')).default;
    // Inject print CSS for both detailed and exam mode notes
    const printStyle = `
      <style>
        @media print {
          body, .notes, .markdown-body { background: #fff !important; color: #222 !important; box-shadow: none !important; }
          .notes, .markdown-body { padding: 24px !important; margin: 0 !important; font-size: 1.1rem !important; line-height: 1.7 !important; }
          h1, h2, h3 { page-break-after: avoid; color: #4b2995 !important; }
          .highlight, .formula, .summary-box, .callout { page-break-inside: avoid; }
          .session-break { page-break-before: always; }
          p, ul, ol, table, pre, blockquote { margin-bottom: 1.2em !important; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; }
          th { background: #f3f3fa; }
          code, pre { background: #f6f8fa; border-radius: 4px; padding: 2px 6px; }
        }
        .notes, .markdown-body { padding: 24px; margin: 0; font-size: 1.1rem; line-height: 1.7; }
        p, ul, ol, table, pre, blockquote { margin-bottom: 1.2em; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background: #f3f3fa; }
        code, pre { background: #f6f8fa; border-radius: 4px; padding: 2px 6px; }
      </style>
    `;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = printStyle + htmlContent;
    document.body.appendChild(tempDiv);
    await html2pdf().from(tempDiv).set({ filename }).save();
    document.body.removeChild(tempDiv);
  };

  // Fetch notes for a topic
  const fetchNotesForTopic = async (topicId: string) => {
    try {
      const notes = await NotesService.getNotesForTopic(topicId);
      setTopicNotes(prev => ({ ...prev, [topicId]: notes }));
    } catch (e: any) {
      toast({
        title: 'Error fetching notes',
        description: e.message,
        variant: 'destructive',
      });
    }
  };

  // Delete note handler
  const handleDeleteNote = async (noteId: string, topicId: string) => {
    try {
      await NotesService.deleteNote(noteId, topicId);
      setTopicNotes(prev => ({
        ...prev,
        [topicId]: (prev[topicId] || []).filter(n => n.id !== noteId)
      }));
      toast({ title: 'Note deleted' });
    } catch (e: any) {
      toast({
        title: 'Error deleting note',
        description: e.message,
        variant: 'destructive',
      });
    }
  };

  // When topics change, fetch notes for each topic
  useEffect(() => {
    if (!syllabusTopics[expandedSyllabusId]?.length) return;
    syllabusTopics[expandedSyllabusId].forEach(topic => fetchNotesForTopic(topic.id));
    // eslint-disable-next-line
  }, [syllabusTopics, expandedSyllabusId]);

  const handleDeleteSyllabus = async (syllabusId: string) => {
    try {
      await SyllabusService.deleteSyllabus(syllabusId);
      setSyllabi(prev => prev.filter(s => s.id !== syllabusId));
      toast({ title: 'Syllabus deleted' });
      if (expandedSyllabusId && expandedSyllabusId === syllabusId) {
        setExpandedSyllabusId(null);
      }
    } catch (e: any) {
      let msg = e?.message || e?.toString() || 'Error deleting syllabus';
      if (msg.includes('foreign key')) {
        msg = 'Cannot delete syllabus because there are related notes, topics, or quiz attempts. Please contact support if this persists.';
      }
      toast({
        title: 'Error deleting syllabus',
        description: msg,
        variant: 'destructive',
      });
    }
  };

  // AI prompt for session count (detailed notes)
  async function getDetailedSessionCount(topicTitle: string): Promise<number> {
    const prompt = `You are an expert academic planner. For the topic: ${topicTitle}, tell me in how many sessions (each under 1000 words) you can generate highly detailed and engaging notes. Respond with only a numeric value (e.g., 5 or 7). Do not include any explanation, text, or additional comments. Output must be a single number only.`;
    const content = await callAI({
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 10,
      temperature: 0.1,
    });
    const num = parseInt(content.match(/\d+/)?.[0] || '1', 10);
    return Math.max(1, num);
  }

  // Multi-session detailed notes generation
  const handleGenerateDetailedNotes = async (topic: any, syllabusId: string) => {
    await incrementNotesGenerated();
    setDetailedGenerating(topic.id);
    setDetailedError(null);
    setDetailedProgress(0);
    try {
      // 1. Get session count
      let sessionCount = await getDetailedSessionCount(topic.topic_title);
      // Cap session count to 3 for development
      sessionCount = Math.min(sessionCount, 3);
      setDetailedSessionCount(sessionCount);
      let allSessionsHtml: string[] = [];
      for (let session = 1; session <= sessionCount; session++) {
        // 2. Prompt for each session
        const prompt = `You are now acting as an expert exam-board-certified tutor tasked with creating emergency, last-minute revision notes for the topic ${topic.topic_title}, specifically for session ${session} of ${sessionCount}. Your goal is to produce crystal-clear, concise, and high-yield notes that are perfect for quick exam revision and not for deep learning. Focus only on essential content that helps students score marks — such as important formulas, core concepts, key definitions, and must-know facts. Structure the notes using bullet points, clean tables, summary boxes, and sections that promote quick understanding.\n\nAdditionally, present the notes in a highly visually engaging format. Use HTML and CSS to style the output in a way that makes it attractive and easy to study. Apply bold and color-coded headings, highlight key takeaways using background boxes (like light yellow or blue), and include adequate spacing and padding to make the content breathable. Use emojis or visual icons to emphasize tips, alerts, and exam hacks (such as ⚠️ for warnings or 📌 for pinned concepts). Think of the end result as a stylish digital cheat sheet that a student would find both helpful and enjoyable to revise from, even under stress. Your final output should be a fully styled HTML document ready to render in a browser, with no code comments or extra explanations — only the styled, revision-ready content.`;
        const llmResponse = await callAI({
          messages: [{ role: 'system', content: prompt }],
          max_tokens: 2048,
          temperature: 0.5,
        });
        allSessionsHtml.push(llmResponse);
        setDetailedProgress(session / sessionCount);
        // Save each session as a note (optional: for progress tracking)
        await NotesService.insertNote({
          userId: user.id,
          topicId: topic.id,
          syllabusId,
          htmlContent: llmResponse,
          noteType: 'detailed',
          sessionNumber: session,
          totalSessions: sessionCount
        });
        // Add a 2-second delay between requests to avoid rate limits
        await new Promise(res => setTimeout(res, 2000));
      }
      // 3. Stitch all sessions together
      const stitchedHtml = allSessionsHtml.join('\n<!-- SESSION BREAK -->\n');
      // 4. Save stitched note as a single file (for file explorer display)
      await NotesService.insertNote({
        userId: user.id,
        topicId: topic.id,
        syllabusId,
        htmlContent: stitchedHtml,
        noteType: 'detailed',
        sessionNumber: null,
        totalSessions: sessionCount
      });
      await fetchNotesForTopic(topic.id);
      toast({ title: 'Detailed Notes Generated', description: `Generated ${sessionCount} sessions.` });
    } catch (e: any) {
      setDetailedError(e.message);
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setDetailedGenerating(null);
      setDetailedProgress(0);
    }
  };

  // AI prompt for session count (exam notes)
  async function getExamSessionCount(topicTitle: string): Promise<number> {
    const prompt = `You are an expert in creating concise and high-retention exam preparation material. For the topic: ${topicTitle}, determine how many short and focused sessions are required to generate complete emergency revision notes that are ideal for last-minute exam preparation. Each session should be under 700 words. Return only the number of required sessions in numeric form (e.g., 2 or 4). Do not include any extra text, explanation, or symbols — only a number as the answer.`;
    const content = await callAI({
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 10,
      temperature: 0.1,
    });
    const num = parseInt(content.match(/\d+/)?.[0] || '1', 10);
    return Math.max(1, num);
  }

  // Exam Mode: multi-session note generation
  const handleGenerateExamNotes = async (topic: any, syllabusId: string) => {
    await incrementNotesGenerated();
    setExamGenerating(topic.id);
    setExamError(null);
    setExamProgress(0);
    try {
      let sessionCount = await getExamSessionCount(topic.topic_title);
      sessionCount = Math.min(sessionCount, 3); // Cap for dev
      let allSessionsHtml: string[] = [];
      for (let session = 1; session <= sessionCount; session++) {
        const prompt = `You are now acting as an exam board-approved expert for rapid revision. Generate ultra-focused, high-impact emergency notes for the topic: ${topic.topic_title}. This is session ${session} of ${sessionCount}. These notes should cover only the most essential concepts, key definitions, and exam-relevant points that students need to memorize quickly. Prioritize formulas, one-line answers, and crucial tips with high exam probability. Present the information in a structured format using bullet points, short paragraphs, tables, and summary boxes.\n\nUse HTML and CSS to design the content with clean spacing, appealing fonts, highlight colors for keywords, and visual callouts to separate important sections. Ensure the overall layout is visually engaging and easy on the eyes, like a modern, minimalist cheat sheet. Add subtle visual flair to increase readability and retention — such as boxed key terms, color-coded sections, or icon-marked tips — so students find the notes attractive, easy to scan, and effective for last-minute revision. Prioritize clarity, aesthetics, and high retention.`;
        const llmResponse = await callAI({
          messages: [{ role: 'system', content: prompt }],
          max_tokens: 2048,
          temperature: 0.5,
        });
        allSessionsHtml.push(llmResponse);
        setExamProgress(session / sessionCount);
        await NotesService.insertNote({
          userId: user.id,
          topicId: topic.id,
          syllabusId,
          htmlContent: llmResponse,
          noteType: 'exam',
          sessionNumber: session,
          totalSessions: sessionCount
        });
        await new Promise(res => setTimeout(res, 2000));
      }
      const stitchedHtml = allSessionsHtml.join('\n<!-- SESSION BREAK -->\n');
      await NotesService.insertNote({
        userId: user.id,
        topicId: topic.id,
        syllabusId,
        htmlContent: stitchedHtml,
        noteType: 'exam',
        sessionNumber: null,
        totalSessions: sessionCount
      });
      await fetchNotesForTopic(topic.id);
      toast({ title: 'Exam Notes Generated', description: `Generated ${sessionCount} sessions.` });
    } catch (e: any) {
      setExamError(e.message);
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setExamGenerating(null);
      setExamProgress(0);
    }
  };

  const handleEditNote = (note: any) => {
    setEditingNote(note);
    setEditContent(note.html_content);
  };

  const handleSaveEdit = async () => {
    if (!editingNote) return;
    setEditLoading(true);
    try {
      await NotesService.updateNote(editingNote.id, { html_content: editContent }, editingNote.topic_id);
      await fetchNotesForTopic(editingNote.topic_id);
      setEditingNote(null);
      setEditContent('');
      toast({ title: 'Note updated!' });
    } catch (e: any) {
      toast({ title: 'Error updating note', description: e.message, variant: 'destructive' });
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteNoteFile = async (noteId: string, topicId: string) => {
    try {
      await NotesService.deleteNote(noteId, topicId);
      await fetchNotesForTopic(topicId);
      toast({ title: 'Note deleted' });
    } catch (e: any) {
      toast({ title: 'Error deleting note', description: e.message, variant: 'destructive' });
    }
  };

  const handleEditNoteName = (note: any) => {
    setEditingNoteName(note);
    setEditName(note.title || (note.note_type === 'exam' ? 'Exam Mode Notes' : 'Detailed Notes'));
  };

  const handleSaveEditName = async () => {
    if (!editingNoteName) return;
    setEditNameLoading(true);
    try {
      await NotesService.updateNoteTitle(editingNoteName.id, { title: editName }, editingNoteName.topic_id);
      await fetchNotesForTopic(editingNoteName.topic_id);
      setEditingNoteName(null);
      setEditName('');
      toast({ title: 'File name updated!' });
    } catch (e: any) {
      toast({ title: 'Error updating file name', description: e.message, variant: 'destructive' });
    } finally {
      setEditNameLoading(false);
    }
  };

  // LLM prompt for flashcard generation
  const FLASHCARD_PROMPT = (topicContent: string) => `You are a flashcard generator. Analyze the following topic content and extract the key concepts. Generate 20 high-quality flashcards in the format: 1. Front: [Question or keyword], Back: [Explanation or Answer]. Respond only in that structured format.\n\n${topicContent}`;

  // Handler to generate flashcards
  const handleGenerateFlashcards = async (topic: any) => {
    await incrementFlashcardsGenerated();
    setFlashcardLoading(prev => ({ ...prev, [topic.id]: true }));
    setFlashcardError(null);
    try {
      // 1. Get topic content (from notes or topic object)
      let topicContent = '';
      const notes = topicNotes[topic.id] || [];
      if (notes.length > 0) {
        topicContent = notes[0].html_content || notes[0].content || '';
      } else {
        topicContent = topic.topic_title || '';
      }
      if (!topicContent) throw new Error('No content found for this topic.');
      // 2. Call LLM
      const llmContent = await callAI({
        messages: [{ role: 'system', content: prompt }],
        max_tokens: 2048,
        temperature: 0.3,
      });
      // 3. Parse LLM response
      const parsed = parseFlashcardsFromLLM(llmContent);
      if (!parsed.length) throw new Error('No flashcards found in LLM response.');
      setFlashcards(parsed);
      setShowFlashcardGallery(true);
    } catch (e: any) {
      setFlashcardError(e.message);
    } finally {
      setFlashcardLoading(prev => ({ ...prev, [topic.id]: false }));
    }
  };

  // Utility to parse LLM response
  function parseFlashcardsFromLLM(llmContent: string) {
    // Expecting: 1. Front: ... Back: ...\n2. Front: ... Back: ...
    const regex = /\d+\.\s*Front:\s*(.*?)\s*Back:\s*(.*?)(?=\n\d+\.|$)/gs;
    const cards = [];
    let match;
    while ((match = regex.exec(llmContent)) !== null) {
      cards.push({ front: match[1].trim(), back: match[2].trim() });
    }
    return cards;
  }

  // Remove the old QUIZ_PROMPT and only use the new one with seed
  const QUIZ_PROMPT = (topicContent: string, seed: number) => `
You are an expert quiz generator. Generate 10 multiple-choice questions based on the content below.

Return your response as a JSON array, with each question as an object with these fields:
- "question": string (the question text)
- "options": array of 4 strings (the answer choices, in order A, B, C, D)
- "answer": string ("A", "B", "C", or "D" for the correct option)

IMPORTANT:
- Do NOT add any comments, explanations, or extra text before or after the JSON.
- Every question object MUST have all three fields: question, options, answer. If you are unsure, set answer to an empty string, but always include the key.
- The output MUST be valid JSON. Double-check for missing commas, quotes, or brackets.

Example:
[
  {
    "question": "What is the capital of France?",
    "options": ["Berlin", "London", "Paris", "Madrid"],
    "answer": "C"
  }
]

Content:
${topicContent}
`;

  // Handler to generate quiz questions
  function parseQuizQuestionsFromLLM(llmContent: string) {
    try {
      // First try to find a JSON array in the response
      const jsonStart = llmContent.indexOf('[');
      const jsonEnd = llmContent.lastIndexOf(']');
      if (jsonStart === -1 || jsonEnd === -1) {
        console.error('No JSON array found in LLM response');
        console.error('Raw content:', llmContent);
        throw new Error('No quiz questions found in LLM response');
      }

      // Extract the JSON string and clean it
      let jsonString = llmContent.slice(jsonStart, jsonEnd + 1);
      
      // Try to repair common JSON issues before parsing
      jsonString = jsonString
        .replace(/\n/g, ' ')  // Remove newlines
        .replace(/,\s*]/g, ']')  // Remove trailing commas
        .replace(/,\s*}/g, '}')  // Remove trailing commas in objects
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":')  // Ensure property names are quoted
        .replace(/:\s*'([^']*?)'/g, ':"$1"')  // Convert single quotes to double quotes
        .replace(/\\/g, '\\\\');  // Escape backslashes

      // Try to parse the cleaned JSON
      let questions;
      try {
        questions = JSON.parse(jsonString);
      } catch (e) {
        // If direct parsing fails, try jsonrepair
        console.warn('Direct JSON parse failed, trying jsonrepair');
        questions = JSON.parse(jsonrepair(jsonString));
      }

      // Validate structure
      if (!Array.isArray(questions)) {
        console.error('Parsed result is not an array:', questions);
        throw new Error('Invalid quiz format: not an array');
      }

      // Filter and validate each question
      const validQuestions = questions.filter(q => {
        try {
          return (
            typeof q === 'object' &&
            q !== null &&
            typeof q.question === 'string' &&
            Array.isArray(q.options) &&
            q.options.length === 4 &&
            q.options.every(opt => typeof opt === 'string') &&
            typeof q.answer === 'string' &&
            ['A', 'B', 'C', 'D'].includes(q.answer)
          );
        } catch (e) {
          console.warn('Invalid question format:', q);
          return false;
        }
      });

      if (validQuestions.length === 0) {
        throw new Error('No valid questions found in LLM response');
      }

      return validQuestions;
    } catch (e) {
      console.error('Error parsing quiz questions:', e);
      console.error('Raw content:', llmContent);
      throw new Error(`Failed to parse quiz questions: ${e.message}`);
    }
  }

  // Update handleGenerateQuiz to include better error handling
  const handleGenerateQuiz = async (topic: any) => {
    await incrementQuizzesGiven();
    setQuizLoading(prev => ({ ...prev, [topic.id]: true }));
    setQuizError(null);
    setCurrentQuizTopicId(topic.id);
    try {
      let topicContent = '';
      const notes = topicNotes[topic.id] || [];
      if (notes.length > 0) {
        topicContent = notes[0].html_content || notes[0].content || '';
      } else {
        topicContent = topic.topic_title || '';
      }
      if (!topicContent) throw new Error('No content found for this topic.');
      
      // Generate a random seed for this quiz
      const seed = Math.floor(Math.random() * 1000000);
      const prompt = QUIZ_PROMPT(topicContent, seed);
      const messages = [{ role: 'system', content: prompt }];
      
      let retryCount = 0;
      const maxRetries = 3;
      let questions = [];
      
      while (retryCount < maxRetries) {
        try {
          const data = await retryWithFallback(() =>
            callAI({
              messages,
              max_tokens: 2048,
              temperature: 0.3,
              top_p: 0.95,
              frequency_penalty: 0.5,
              presence_penalty: 0.5,
            })
          );

          const llmContent = data.choices?.[0]?.message?.content || '';
          questions = parseQuizQuestionsFromLLM(llmContent);
          
          // Check if we have valid questions
          const validQuestions = questions.filter(q => 
            q.question && 
            !q.question.includes('[Missing') && 
            q.options.every(opt => opt && !opt.includes('[Missing')) &&
            q.answer
          );

          if (validQuestions.length >= 8) {  // Accept if we have at least 8 valid questions
            // If we have more than 8 but less than 10, that's fine
            setQuizQuestions(validQuestions);
            break;
          } else {
            throw new Error(`Only got ${validQuestions.length} valid questions, need at least 8`);
          }
        } catch (e) {
          console.warn(`Attempt ${retryCount + 1} failed:`, e);
          retryCount++;
          if (retryCount === maxRetries) {
            throw new Error('Failed to generate valid quiz questions after multiple attempts');
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
      
      setShowQuizGallery(true);
      
    } catch (e: any) {
      const errorMessage = typeof e === 'string' ? e : e.message || 'Failed to generate quiz';
      setQuizError(errorMessage);
      console.error('Quiz generation error:', e);
      toast({
        title: "Error Generating Quiz",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setQuizLoading(prev => ({ ...prev, [topic.id]: false }));
    }
  };

  // Utility to get today's date in YYYY-MM-DD
  function getTodayDate() {
    return new Date().toISOString().split('T')[0];
  }

  // --- Study Session Tracking Logic ---
  useEffect(() => {
    if (!user) return;
    
    // Time tracking is handled globally by TimeTrackingService via usage_stats table.
    // The study_sessions table has RLS policies blocking inserts (403 Forbidden), 
    // so we skip writing to it here to avoid console errors.

    return () => {
      // Cleanup if needed
    };
  }, [user]);

  // --- Add increment logic to generate handlers ---
  const incrementNotesGenerated = async () => {
    if (!user) return;
    const today = getTodayDate();
    try {
      // Try RPC first
      const { error: rpcError } = await supabase.rpc('increment_notes_generated', { 
        arg_user_id: user.id, 
        arg_date: today 
      });
      
      if (rpcError) {
        console.error('RPC increment_notes_generated failed:', rpcError);
        // If RPC fails, try direct upsert
        const { data: existing } = await supabase
          .from('daily_stats')
          .select('notes_generated')
          .eq('user_id', user.id)
          .eq('date', today)
          .single();
        
        if (existing) {
          await supabase
            .from('daily_stats')
            .update({ notes_generated: existing.notes_generated + 1 })
            .eq('user_id', user.id)
            .eq('date', today);
        } else {
          await supabase
            .from('daily_stats')
            .insert({
              user_id: user.id,
              date: today,
              notes_generated: 1,
              flashcards_generated: 0,
              quizzes_given: 0
            });
        }
      }
    } catch (e) {
      console.error('Error incrementing notes:', e);
    }
  };

  const incrementFlashcardsGenerated = async () => {
    if (!user) return;
    const today = getTodayDate();
    try {
      // Try RPC first
      const { error: rpcError } = await supabase.rpc('increment_flashcards_generated', { 
        arg_user_id: user.id, 
        arg_date: today 
      });
      
      if (rpcError) {
        console.error('RPC increment_flashcards_generated failed:', rpcError);
        // If RPC fails, try direct upsert
        const { data: existing } = await supabase
          .from('daily_stats')
          .select('flashcards_generated')
          .eq('user_id', user.id)
          .eq('date', today)
          .single();
        
        if (existing) {
          await supabase
            .from('daily_stats')
            .update({ flashcards_generated: existing.flashcards_generated + 1 })
            .eq('user_id', user.id)
            .eq('date', today);
        } else {
          await supabase
            .from('daily_stats')
            .insert({
              user_id: user.id,
              date: today,
              notes_generated: 0,
              flashcards_generated: 1,
              quizzes_given: 0
            });
        }
      }
    } catch (e) {
      console.error('Error incrementing flashcards:', e);
    }
  };

  const incrementQuizzesGiven = async () => {
    if (!user) return;
    const today = getTodayDate();
    try {
      // Try RPC first
      const { error: rpcError } = await supabase.rpc('increment_quizzes_given', { 
        arg_user_id: user.id, 
        arg_date: today 
      });
      
      if (rpcError) {
        console.error('RPC increment_quizzes_given failed:', rpcError);
        // If RPC fails, try direct upsert
        const { data: existing } = await supabase
          .from('daily_stats')
          .select('quizzes_given')
          .eq('user_id', user.id)
          .eq('date', today)
          .single();
        
        if (existing) {
          await supabase
            .from('daily_stats')
            .update({ quizzes_given: existing.quizzes_given + 1 })
            .eq('user_id', user.id)
            .eq('date', today);
        } else {
          await supabase
            .from('daily_stats')
            .insert({
              user_id: user.id,
              date: today,
              notes_generated: 0,
              flashcards_generated: 0,
              quizzes_given: 1
            });
        }
      }
    } catch (e) {
      console.error('Error incrementing quizzes:', e);
    }
  };

  // Clean up the handleQuizAnswerChange function to only use quizAnswers
  const handleQuizAnswerChange = (questionIndex: number, optionIndex: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  // Update handleSubmitQuiz to remove quizUserAnswers
  const handleSubmitQuiz = async () => {
    setSubmittingQuiz(true);
    
    try {
      // Calculate score
      let score = 0;
      let totalQuestions = activeQuiz.questions.length;
      
      // For AI-generated quizzes
      activeQuiz.questions.forEach((q, idx) => {
        if (quizAnswers[idx] === q.correctOptionIndex) {
          score++;
        }
      });
      
      const scorePercentage = Math.round((score / totalQuestions) * 100);
      
      // For AI-generated quizzes (existing logic)
      // ...existing code for tracking AI quiz submissions...
      
      setShowQuizModal(false);
      
      // Add to user's stats
      incrementQuizzesGiven();
    } catch (err) {
      console.error('Error submitting quiz:', err);
      toast({
        title: 'Submission Error',
        description: 'Failed to submit your quiz. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmittingQuiz(false);
    }
  };

  // Clean up showQuizModal handler to update the right state
  const closeQuizModal = () => {
    setShowQuizModal(false);
    setActiveQuiz(null);
    setQuizAnswers({});
  };

  const downloadQuizAttachment = (url: string) => {
    if (!url) return;
    window.open(url, '_blank');
  };

  return (
    <main className="max-w-7xl mx-auto px-4 pb-20">
      <TopBar />
      
      <Tabs defaultValue={initialTab} onValueChange={handleTabChange} className="pt-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="notes">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Add Syllabus or Document</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 mb-2">
                <Button
                  variant={inputMode === 'syllabus' ? 'default' : 'outline'}
                  onClick={() => setInputMode('syllabus')}
                >
                  Upload Syllabus
                </Button>
                <Button
                  variant={inputMode === 'document' ? 'default' : 'outline'}
                  onClick={() => setInputMode('document')}
                >
                  Upload Document
                </Button>
              </div>
              {inputMode === 'syllabus' && (
                <div className="space-y-4">
                  <div className="flex gap-2 items-center">
                    <span className="text-sm font-medium">Syllabus Input:</span>
                    <Button
                      size="sm"
                      variant={syllabusInputType === 'image' ? 'default' : 'outline'}
                      onClick={() => setSyllabusInputType('image')}
                    >
                      Image (JPG/PNG)
                    </Button>
                    <Button
                      size="sm"
                      variant={syllabusInputType === 'text' ? 'default' : 'outline'}
                      onClick={() => setSyllabusInputType('text')}
                    >
                      Plain Text
                    </Button>
                  </div>
                  {syllabusInputType === 'image' && (
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        ref={imageInputRef}
                        style={{ display: 'none' }}
                        onChange={e => setSyllabusImage(e.target.files?.[0] || null)}
                      />
                      <Button
                        variant="outline"
                        onClick={() => imageInputRef.current?.click()}
                      >
                        {syllabusImage ? syllabusImage.name : 'Choose Image'}
                      </Button>
                    </div>
                  )}
                  {syllabusInputType === 'text' && (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Paste or type your syllabus here..."
                        rows={5}
                        value={syllabusText}
                        onChange={e => setSyllabusText(e.target.value)}
                      />
                    </div>
                  )}
                  <Button className="w-full bg-siksha-purple hover:bg-siksha-purple-dark" onClick={handleAnalyzeSyllabus} disabled={loadingSyllabi}>
                    {loadingSyllabi ? 'Analyzing...' : inputMode === 'syllabus' ? 'Analyze Syllabus' : 'Analyze Document'}
                  </Button>
                </div>
              )}
              {inputMode === 'document' && (
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="application/pdf,application/epub+zip"
                    ref={documentInputRef}
                    style={{ display: 'none' }}
                    onChange={e => setDocumentFile(e.target.files?.[0] || null)}
                  />
                  <Button
                    variant="outline"
                    onClick={() => documentInputRef.current?.click()}
                  >
                    {documentFile ? documentFile.name : 'Choose PDF or EPUB'}
                  </Button>
                  <Button
                    className="w-full bg-siksha-purple hover:bg-siksha-purple-dark"
                    onClick={handleAnalyzeSyllabus}
                    disabled={loadingSyllabi}
                  >
                    {loadingSyllabi ? 'Analyzing...' : 'Analyze Document'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {loadingSyllabi ? (
            <div className="text-center py-8">Loading syllabi...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Your Syllabi</h2>
              {syllabi.length > 0 ? (
                syllabi.map((syllabus) => {
                  const isExpanded = expandedSyllabusId === syllabus.id;
                  return (
                    <Card key={syllabus.id} className={`hover-lift cursor-pointer relative transition-all ${isExpanded ? 'ring-2 ring-siksha-purple' : ''}`} onClick={() => setExpandedSyllabusId(isExpanded ? null : syllabus.id)}>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 text-red-500 z-10"
                        onClick={e => { e.stopPropagation(); handleDeleteSyllabus(syllabus.id); }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <CardHeader>
                        <CardTitle className="text-lg">{syllabus.subject_name || syllabus.original_file || 'Untitled Syllabus'}</CardTitle>
                        <p className="text-xs text-muted-foreground">{new Date(syllabus.created_at).toLocaleDateString()}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs">{syllabus.input_type}</span>
                          {syllabus.analyzed ? <span className="text-green-600">Analyzed</span> : <span className="text-yellow-600">Pending</span>}
                        </div>
                        {isExpanded && (
                          <div className="mt-2">
                            <h3 className="text-base font-semibold mb-2">Topics</h3>
                            {loadingTopics && expandedSyllabusId === syllabus.id ? (
                              <div className="text-center py-4">Loading topics...</div>
                            ) : syllabusTopics[syllabus.id] && syllabusTopics[syllabus.id].length > 0 ? (
                              <ul className="space-y-4">
                                {syllabusTopics[syllabus.id].map(topic => {
                                  const isSelected = selectedTopicId === topic.id;
                                  const notesForTopic = topicNotes[topic.id] || [];
                                  const detailedNotes = notesForTopic.filter(n => n.note_type === 'detailed' && !n.session_number);
                                  const examNotes = notesForTopic.filter(n => n.note_type === 'exam' && !n.session_number);
                                  return (
                                    <li
                                      key={topic.id}
                                      className={`rounded p-3 transition-all ${isSelected ? 'bg-siksha-purple text-white' : 'bg-siksha-purple-light'} cursor-pointer`}
                                      onClick={e => { e.stopPropagation(); setSelectedTopicId(topic.id); }}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <div className="font-semibold text-base">{topic.topic_title || 'Untitled Topic'}</div>
                                          <div className="text-xs text-muted-foreground">{topic.chapters_range || 'No chapters specified'}</div>
                                        </div>
                                        {isSelected && (
                                          <div className="flex flex-col gap-2 ml-4">
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className={`transition-colors text-black bg-siksha-purple-light hover:bg-siksha-purple active:bg-siksha-purple focus:bg-siksha-purple`}
                                              style={{ backgroundColor: '#ede9fe' }}
                                              disabled={detailedGenerating}
                                              onClick={e => { e.stopPropagation(); handleGenerateDetailedNotes(topic, syllabus.id); }}
                                            >
                                              {detailedGenerating ? `Generating... (${Math.round(detailedProgress * 100)}%)` : 'Detailed Mode'}
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className={`transition-colors text-black bg-siksha-purple-light hover:bg-siksha-green active:bg-siksha-green focus:bg-siksha-green`}
                                              style={{ backgroundColor: '#ede9fe' }}
                                              disabled={examGenerating}
                                              onClick={e => { e.stopPropagation(); handleGenerateExamNotes(topic, syllabus.id); }}
                                            >
                                              {examGenerating ? `Generating... (${Math.round(examProgress * 100)}%)` : 'Exam Mode'}
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                      {/* File explorer style notes list: only show if selected */}
                                      {detailedError && isSelected && (
                                        <div className="text-xs text-red-500 mt-2">{detailedError}</div>
                                      )}
                                      {examError && isSelected && (
                                        <div className="text-xs text-red-500 mt-2">{examError}</div>
                                      )}
                                      {isSelected && detailedNotes.length > 0 && (
                                        <div className="mt-3">
                                          <div className="font-semibold text-xs mb-1 text-black">Files</div>
                                          <ul className="space-y-1">
                                            {detailedNotes.map(note => (
                                              <li key={note.id} className="flex items-center gap-2">
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  className="flex-1 text-left truncate text-black bg-white"
                                                  onClick={e => {
                                                    e.stopPropagation();
                                                    setNotesModalHtml(note.html_content);
                                                    setShowNotesModal(true);
                                                  }}
                                                >
                                                  {note.title || 'Detailed Notes'}
                                                </Button>
                                                <Button
                                                  size="icon"
                                                  variant="ghost"
                                                  title="Edit Name"
                                                  onClick={e => {
                                                    e.stopPropagation();
                                                    handleEditNoteName(note);
                                                  }}
                                                >
                                                  <BookText className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                  size="icon"
                                                  variant="ghost"
                                                  title="Delete"
                                                  onClick={e => {
                                                    e.stopPropagation();
                                                    handleDeleteNoteFile(note.id, note.topic_id);
                                                  }}
                                                >
                                                  <Trash2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                  size="icon"
                                                  variant="ghost"
                                                  title="Download as PDF"
                                                  onClick={e => {
                                                    e.stopPropagation();
                                                    handleDownloadPDF(note.html_content, 'detailed-notes.pdf');
                                                  }}
                                                >
                                                  <Download className="w-4 h-4" />
                                                </Button>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      {isSelected && examNotes.length > 0 && (
                                        <div className="mt-3">
                                          <div className="font-semibold text-xs mb-1 text-black">Files</div>
                                          <ul className="space-y-1">
                                            {examNotes.map(note => (
                                              <li key={note.id} className="flex items-center gap-2">
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  className="flex-1 text-left truncate text-black bg-white"
                                                  onClick={e => {
                                                    e.stopPropagation();
                                                    setNotesModalHtml(note.html_content);
                                                    setShowNotesModal(true);
                                                  }}
                                                >
                                                  {note.title || 'Exam Mode Notes'}
                                                </Button>
                                                <Button
                                                  size="icon"
                                                  variant="ghost"
                                                  title="Edit Name"
                                                  onClick={e => {
                                                    e.stopPropagation();
                                                    handleEditNoteName(note);
                                                  }}
                                                >
                                                  <BookText className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                  size="icon"
                                                  variant="ghost"
                                                  title="Delete"
                                                  onClick={e => {
                                                    e.stopPropagation();
                                                    handleDeleteNoteFile(note.id, note.topic_id);
                                                  }}
                                                >
                                                  <Trash2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                  size="icon"
                                                  variant="ghost"
                                                  title="Download as PDF"
                                                  onClick={e => {
                                                    e.stopPropagation();
                                                    handleDownloadPDF(note.html_content, 'exam-notes.pdf');
                                                  }}
                                                >
                                                  <Download className="w-4 h-4" />
                                                </Button>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </li>
                                  );
                                })}
                              </ul>
                            ) : (
                              <div className="text-center py-4 text-muted-foreground">No topics found for this syllabus.</div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <p className="text-center py-8 text-muted-foreground">You haven't uploaded any syllabi yet.</p>
              )}
            </div>
          )}
          {/* Notes Modal */}
          <Dialog open={showNotesModal} onOpenChange={setShowNotesModal}>
            <DialogContent className="max-w-2xl w-full">
              <DialogTitle>Generated Notes</DialogTitle>
              <DialogDescription>
                These are your generated study notes. You can review, download, or edit them.
              </DialogDescription>
              {notesModalHtml ? (
                <div className="bg-white rounded shadow p-4 max-h-[60vh] overflow-y-auto" style={{ minHeight: 200 }}>
                  <div dangerouslySetInnerHTML={{ __html: notesModalHtml }} />
                </div>
              ) : (
                <div className="text-center py-8">No notes found.</div>
              )}
            </DialogContent>
          </Dialog>
          {/* Edit Modal */}
          <Dialog open={!!editingNote} onOpenChange={open => { if (!open) setEditingNote(null); }}>
            <DialogContent className="max-w-2xl w-full">
              <DialogTitle>Edit Note</DialogTitle>
              <Textarea
                rows={16}
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="w-full font-mono text-xs"
              />
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setEditingNote(null)} disabled={editLoading}>Cancel</Button>
                <Button onClick={handleSaveEdit} disabled={editLoading}>
                  {editLoading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          {/* Edit Name Modal */}
          <Dialog open={!!editingNoteName} onOpenChange={open => { if (!open) setEditingNoteName(null); }}>
            <DialogContent className="max-w-md w-full">
              <DialogTitle>Edit File Name</DialogTitle>
              <Input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full"
                maxLength={64}
                placeholder="Enter file name"
              />
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setEditingNoteName(null)} disabled={editNameLoading}>Cancel</Button>
                <Button onClick={handleSaveEditName} disabled={editNameLoading || !editName.trim()}>
                  {editNameLoading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        <TabsContent value="flashcards">
          {showFlashcardGallery ? (
            <FlashcardGallery flashcards={flashcards} onClose={() => setShowFlashcardGallery(false)} />
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Your Syllabi</h2>
              {syllabi.length > 0 ? (
                syllabi.map((syllabus) => {
                  const isExpanded = expandedSyllabusId === syllabus.id;
                  return (
                    <Card key={syllabus.id} className={`hover-lift cursor-pointer relative transition-all ${isExpanded ? 'ring-2 ring-siksha-purple' : ''}`} onClick={() => setExpandedSyllabusId(isExpanded ? null : syllabus.id)}>
                      <CardHeader>
                        <CardTitle className="text-lg">{syllabus.subject_name || syllabus.original_file || 'Untitled Syllabus'}</CardTitle>
                        <p className="text-xs text-muted-foreground">{new Date(syllabus.created_at).toLocaleDateString()}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs">{syllabus.input_type}</span>
                          {syllabus.analyzed ? <span className="text-green-600">Analyzed</span> : <span className="text-yellow-600">Pending</span>}
                        </div>
                        {isExpanded && (
                          <div className="mt-2">
                            <h3 className="text-base font-semibold mb-2">Topics</h3>
                            {loadingTopics && expandedSyllabusId === syllabus.id ? (
                              <div className="text-center py-4">Loading topics...</div>
                            ) : syllabusTopics[syllabus.id] && syllabusTopics[syllabus.id].length > 0 ? (
                              <ul className="space-y-4">
                                {syllabusTopics[syllabus.id].map(topic => (
                                  <li key={topic.id} className="rounded p-3 transition-all bg-siksha-purple-light cursor-pointer">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="font-semibold text-base">{topic.topic_title || 'Untitled Topic'}</div>
                                        <div className="text-xs text-muted-foreground">{topic.chapters_range || 'No chapters specified'}</div>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="transition-colors text-black bg-siksha-yellow hover:bg-siksha-purple active:bg-siksha-purple focus:bg-siksha-purple"
                                        style={{ backgroundColor: '#FEF7CD' }}
                                        disabled={!!flashcardLoading[topic.id]}
                                        onClick={e => { e.stopPropagation(); handleGenerateFlashcards(topic); }}
                                      >
                                        {flashcardLoading[topic.id] ? 'Generating...' : 'Generate Flashcards'}
                                      </Button>
                                    </div>
                                    {flashcardError && (
                                      <div className="text-xs text-red-500 mt-2">{flashcardError}</div>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="text-center py-4 text-muted-foreground">No topics found for this syllabus.</div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <p className="text-center py-8 text-muted-foreground">You haven't uploaded any syllabi yet.</p>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="quizzes">
          {showQuizGallery ? (
            <QuizGallery 
              questions={quizQuestions} 
              onClose={() => {
                setShowQuizGallery(false);
                setCurrentQuizTopicId(null);
              }} 
              topicId={currentQuizTopicId || ''} 
            />
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Your Syllabi</h2>
              {syllabi.length > 0 ? (
                syllabi.map((syllabus) => {
                  const isExpanded = expandedSyllabusId === syllabus.id;
                  return (
                    <Card key={syllabus.id} className={`hover-lift cursor-pointer relative transition-all ${isExpanded ? 'ring-2 ring-siksha-purple' : ''}`} onClick={() => setExpandedSyllabusId(isExpanded ? null : syllabus.id)}>
                      <CardHeader>
                        <CardTitle className="text-lg">{syllabus.subject_name || syllabus.original_file || 'Untitled Syllabus'}</CardTitle>
                        <p className="text-xs text-muted-foreground">{new Date(syllabus.created_at).toLocaleDateString()}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs">{syllabus.input_type}</span>
                          {syllabus.analyzed ? <span className="text-green-600">Analyzed</span> : <span className="text-yellow-600">Pending</span>}
                        </div>
                        {isExpanded && (
                          <div className="mt-2">
                            <h3 className="text-base font-semibold mb-2">Topics</h3>
                            {loadingTopics && expandedSyllabusId === syllabus.id ? (
                              <div className="text-center py-4">Loading topics...</div>
                            ) : syllabusTopics[syllabus.id] && syllabusTopics[syllabus.id].length > 0 ? (
                              <ul className="space-y-4">
                                {syllabusTopics[syllabus.id].map(topic => (
                                  <li key={topic.id} className="rounded p-3 transition-all bg-siksha-purple-light cursor-pointer">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="font-semibold text-base">{topic.topic_title || 'Untitled Topic'}</div>
                                        <div className="text-xs text-muted-foreground">{topic.chapters_range || 'No chapters specified'}</div>
                                        {/* Show accuracy badge if available */}
                                        {user && (
                                          (() => {
                                            const attempts = topicHistoryOpen === topic.id ? topicHistory : [];
                                            const totalCorrect = attempts.reduce((acc, h) => acc + h.score, 0);
                                            const totalQuestions = attempts.reduce((acc, h) => acc + h.total, 0);
                                            const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : null;
                                            return accuracy !== null ? (
                                              <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded bg-siksha-green text-black font-semibold">Accuracy: {accuracy}%</span>
                                            ) : null;
                                          })()
                                        )}
                                      </div>
                                      <div className="flex flex-col gap-2 ml-4">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="transition-colors text-black bg-siksha-green hover:bg-siksha-purple active:bg-siksha-purple focus:bg-siksha-purple"
                                          style={{ backgroundColor: '#D1FADF' }}
                                          disabled={!!quizLoading[topic.id]}
                                          onClick={e => { e.stopPropagation(); handleGenerateQuiz(topic); }}
                                        >
                                          {quizLoading[topic.id] ? 'Generating...' : 'Generate Quiz'}
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="mt-1"
                                          onClick={e => { e.stopPropagation(); setTopicHistoryOpen(topic.id); }}
                                        >
                                          History
                                        </Button>
                                      </div>
                                    </div>
                                    {/* History Modal for this topic */}
                                    <Dialog open={topicHistoryOpen === topic.id} onOpenChange={open => setTopicHistoryOpen(open ? topic.id : null)}>
                                      <DialogContent className="max-w-md w-full">
                                        <DialogTitle>Quiz History</DialogTitle>
                                        <DialogDescription>
                                          View your previous quiz attempts and scores for this topic.
                                        </DialogDescription>
                                        {(() => {
                                          const totalCorrect = topicHistory.reduce((acc, h) => acc + h.score, 0);
                                          const totalQuestions = topicHistory.reduce((acc, h) => acc + h.total, 0);
                                          const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
                                          return <div className="mb-2 text-sm text-muted-foreground">Average Accuracy: <span className="font-semibold text-black">{accuracy}%</span></div>;
                                        })()}
                                        {topicHistoryLoading ? (
                                          <div className="text-center py-4">Loading...</div>
                                        ) : topicHistory.length === 0 ? (
                                          <div className="text-center py-4 text-muted-foreground">No attempts yet.</div>
                                        ) : (
                                          <ul className="divide-y divide-gray-200">
                                            {topicHistory.map((h, i) => (
                                              <li key={h.id} className="py-2 flex justify-between items-center">
                                                <span className="text-sm">{new Date(h.attempted_at).toLocaleDateString()}</span>
                                                <span className="font-semibold">{h.score} / {h.total}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        )}
                                      </DialogContent>
                                    </Dialog>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="text-center py-4 text-muted-foreground">No topics found for this syllabus.</div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <p className="text-center py-8 text-muted-foreground">You haven't uploaded any syllabi yet.</p>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Quiz Modal */}
      <Dialog open={showQuizModal} onOpenChange={closeQuizModal}>
        <DialogContent className="max-w-xl w-full max-h-[80vh] overflow-y-auto">
          <DialogTitle>{activeQuiz?.title || 'Quiz'}</DialogTitle>
          
          {quizSubmissionResult ? (
            <div className="space-y-4">
              <div className="text-center p-4 border rounded-lg bg-slate-50">
                <h3 className="text-xl font-bold mb-2">Quiz Submitted</h3>
                {quizSubmissionResult.score !== null ? (
                  <>
                    <div className="text-4xl font-bold text-indigo-600 mb-2">{quizSubmissionResult.score}%</div>
                    <p>You answered {quizSubmissionResult.correctAnswers} out of {quizSubmissionResult.totalQuestions} questions correctly.</p>
                  </>
                ) : (
                  <p>Your quiz has been submitted and is awaiting review.</p>
                )}
              </div>
              <Button onClick={closeQuizModal} className="w-full">Close</Button>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {activeQuiz?.questions?.map((question: any, qIndex: number) => (
                  <div key={qIndex} className="border rounded-lg p-4">
                    <p className="font-medium mb-3">{qIndex + 1}. {question.question}</p>
                    <div className="space-y-2">
                      {question.options.map((option: string, oIndex: number) => (
                        <div key={oIndex} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id={`q${qIndex}-o${oIndex}`}
                            name={`question-${qIndex}`}
                            checked={quizAnswers[qIndex] === oIndex}
                            onChange={() => handleQuizAnswerChange(qIndex, oIndex)}
                            className="text-indigo-600"
                          />
                          <Label htmlFor={`q${qIndex}-o${oIndex}`} className="cursor-pointer">{option}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={closeQuizModal}>Cancel</Button>
                <Button 
                  onClick={handleSubmitQuiz} 
                  disabled={submittingQuiz || Object.keys(quizAnswers).length < (activeQuiz?.questions?.length || 0)}
                >
                  {submittingQuiz ? 'Submitting...' : 'Submit Quiz'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Existing modals... */}
      
      <BottomNav />
    </main>
  );
};

export default Study;
