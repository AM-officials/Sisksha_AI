import React, { useState, useEffect } from 'react';
import { BookOpen, MessageCircle, ClipboardList, Users, BarChart3, X, User, Plus, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ClassroomAnalyticsComponent from '@/components/ClassroomAnalytics';

// Collapsible message body component for better handling of long messages and newlines
const CollapsibleMessageBody = ({ text, maxLength = 100 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasNewlines = text.includes('\n');
  const isLong = text.length > maxLength;
  const needsCollapse = isLong || hasNewlines;
  
  // Replace newlines with <br /> tags when rendering
  const formatText = (content) => {
    if (!content) return '';
    
    // Simple approach to avoid React.Fragment issues
    return <span className="whitespace-pre-wrap">{content}</span>;
  };
  
  if (!needsCollapse) {
    return <div className="text-sm mt-1">{formatText(text)}</div>;
  }
  
  return (
    <div className="text-sm mt-1">
      {isExpanded ? (
        <>
          <div className="whitespace-pre-line">{formatText(text)}</div>
          <button 
            onClick={() => setIsExpanded(false)} 
            className="text-xs text-indigo-600 hover:text-indigo-800 mt-1 font-medium"
          >
            Show less
          </button>
        </>
      ) : (
        <>
          <div className="whitespace-pre-line line-clamp-2">
            {formatText(text.substring(0, maxLength))}
            {text.length > maxLength && '...'}
          </div>
          <button 
            onClick={() => setIsExpanded(true)} 
            className="text-xs text-indigo-600 hover:text-indigo-800 mt-1 font-medium"
          >
            Show more
          </button>
        </>
      )}
    </div>
  );
};

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

const mockInbox = [
  { id: 1, from: 'Teacher: Mrs. Kapoor', subject: 'Quiz Reminder', date: '2024-06-05', preview: 'Don\'t forget the quiz on Friday!' },
  { id: 2, from: 'Teacher: Mrs. Kapoor', subject: 'Welcome!', date: '2024-06-01', preview: 'Welcome to the new semester!' },
];
const mockOutbox = [
  { id: 1, to: 'Teacher: Mrs. Kapoor', subject: 'Doubt in Math', date: '2024-06-04', preview: 'I have a doubt in algebra.' },
];

const mockAnnouncements = [
  { id: 1, content: 'Welcome to the new semester! 🎉', date: '2024-06-01' },
  { id: 2, content: 'Quiz on Friday. Prepare well!', date: '2024-06-03' },
];

const ClassroomMode: React.FC = () => {
  const [activeSection, setActiveSection] = useState('Feed');
  const [viewAssignmentModal, setViewAssignmentModal] = useState(false);
  const [submitAssignmentModal, setSubmitAssignmentModal] = useState(false);
  const [viewClassmateModal, setViewClassmateModal] = useState(false);
  const [viewAnalyticsModal, setViewAnalyticsModal] = useState(false);
  const [selectedClassmate, setSelectedClassmate] = useState<any>(null);
  const [feedTab, setFeedTab] = useState('announcements');
  const [showCompose, setShowCompose] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Teacher-assigned content
  const [classroomMaterials, setClassroomMaterials] = useState<any[]>([]);
  const [classroomQuizzes, setClassroomQuizzes] = useState<any[]>([]);
  const [loadingClassroomContent, setLoadingClassroomContent] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{[key: number]: number}>({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizSubmissionResult, setQuizSubmissionResult] = useState<any | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [viewMaterial, setViewMaterial] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'quizzes' | 'materials'>('quizzes');

  // Message-related state
  const [messages, setMessages] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [inboxMessages, setInboxMessages] = useState<any[]>([]);
  const [outboxMessages, setOutboxMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageError, setMessageError] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [submittingMessage, setSubmittingMessage] = useState(false);
  const [teachersList, setTeachersList] = useState<any[]>([]);
  const [studentClassroomId, setStudentClassroomId] = useState<string | null>(null);
  const [currentStudySession, setCurrentStudySession] = useState<string | null>(null);

  // Function to group items by date
  const groupItemsByDate = (items: any[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return {
      today: items.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate >= today;
      }),
      thisWeek: items.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate >= oneWeekAgo && itemDate < today;
      }),
      older: items.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate < oneWeekAgo;
      })
    };
  };

  // Fetch classroom content when component mounts
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchClassroomContent = async () => {
      setLoadingClassroomContent(true);
      try {
        // Get student's classroom ID
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('classroom_id')
          .eq('id', user.id)
          .single();
          
        if (studentError) throw studentError;
        
        if (studentData?.classroom_id) {
          // Fetch materials assigned to the student's classroom
          const { data: materials, error: materialsError } = await supabase
            .from('materials')
            .select('*')
            .eq('classroom_id', studentData.classroom_id)
            .eq('is_active', true)
            .order('created_at', { ascending: false });
            
          if (materialsError) throw materialsError;
          setClassroomMaterials(materials || []);
          
          // Fetch quizzes assigned to the student's classroom
          const { data: quizzes, error: quizzesError } = await supabase
            .from('quizzes')
            .select(`
              *,
              quiz_submissions(id, status, score, submitted_at)
            `)
            .eq('classroom_id', studentData.classroom_id)
            .eq('is_active', true)
            .order('created_at', { ascending: false });
            
          if (quizzesError) throw quizzesError;
          
          // Process quizzes to add submission status and fix questions format
          const processedQuizzes = (quizzes || []).map(quiz => {
            const submissions = quiz.quiz_submissions || [];
            const studentSubmission = submissions.find(sub => sub.student_id === user.id);
            
            // Calculate questions length properly whether in array or JSON format
            let questionsCount = 0;
            if (quiz.questions) {
              if (Array.isArray(quiz.questions)) {
                questionsCount = quiz.questions.length;
              } else if (typeof quiz.questions === 'string') {
                try {
                  const parsed = JSON.parse(quiz.questions);
                  questionsCount = Array.isArray(parsed) ? parsed.length : 0;
                } catch (e) {
                  console.log("Error parsing questions:", e);
                }
              }
            }
            
            return {
              ...quiz,
              questions: quiz.questions || [],
              questionsCount: questionsCount,
              status: studentSubmission?.status || 'pending',
              score: studentSubmission?.score,
              submitted_at: studentSubmission?.submitted_at
            };
          });
          
          setClassroomQuizzes(processedQuizzes);
        }
      } catch (err) {
        console.error('Error loading classroom content:', err);
        toast({
          title: 'Error',
          description: 'Failed to load classroom materials and quizzes',
          variant: 'destructive',
        });
      } finally {
        setLoadingClassroomContent(false);
      }
    };
    
    fetchClassroomContent();
  }, [user, toast]);

  // Fetch student's classroom, messages and announcements
  useEffect(() => {
    if (!user?.id) return;

    const fetchStudentData = async () => {
      setLoadingMessages(true);
      try {
        // Get student's classroom ID first
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('classroom_id')
          .eq('id', user.id)
          .single();
          
        if (studentError) throw studentError;
        
        if (studentData?.classroom_id) {
          setStudentClassroomId(studentData.classroom_id);
          
          // Fetch classroom data
          const { data: classroomData, error: classroomError } = await supabase
            .from('classrooms')
            .select('id, name, class_teacher_id, teachers, school_id')
            .eq('id', studentData.classroom_id)
            .single();
            
          if (classroomError) throw classroomError;
          
          // FETCH TEACHERS - Try multiple approaches with detailed logging
          if (classroomData) {
            console.log("Classroom data:", classroomData);
            let teachersFound = false;
            
            // Skip approach 1 (RPC) since it's not implemented in this database
            
                          // Approach 2: Try direct query with simple filters
              if (!teachersFound) {
                try {
                  if (classroomData.school_id) {
                    const { data: schoolTeachers, error: schoolError } = await supabase
                      .from('teachers')
                      .select('id, name')
                      .eq('school_id', classroomData.school_id);
                      
                    if (!schoolError && schoolTeachers && schoolTeachers.length > 0) {
                      setTeachersList(schoolTeachers);
                      teachersFound = true;
                    }
                  }
                } catch (err) {
                  // Silent catch - we'll try the next approach
                }
              }
            
            // Approach 3: Try without any filters
            if (!teachersFound) {
              try {
                const { data: allTeachers, error: allError } = await supabase
                  .from('teachers')
                  .select('id, name');
                  
                if (!allError && allTeachers && allTeachers.length > 0) {
                  setTeachersList(allTeachers);
                  teachersFound = true;
                }
              } catch (err) {
                // Silent catch - we'll try the next approach
              }
            }
            
            // Approach 4: Create a minimal fallback list if all else fails
            if (!teachersFound) {
              if (classroomData.class_teacher_id) {
                try {
                  // Use direct query instead of RPC function
                  const { data: teacher, error: teacherError } = await supabase
                    .from('teachers')
                    .select('id, name, email, subjects')
                    .eq('id', classroomData.class_teacher_id);
                    
                  if (!teacherError && teacher && teacher.length > 0) {
                    setTeachersList(teacher);
                    teachersFound = true;
                  }
                } catch (err) {
                  // Silent catch
                }
              }
              
              // Last resort: Create a placeholder list
              if (!teachersFound) {
                setTeachersList([]);
              }
            }
          }

          // FETCH MESSAGES - Use the enhanced message_details view
          try {
            const { data: messageDetailsData, error: messageDetailsError } = await supabase
              .from('message_details')
              .select('*')
              .or(`receiver_id.eq.${studentData.classroom_id},receiver_id.eq.${user.id},sender_id.eq.${user.id}`)
              .order('sent_at', { ascending: false });

            if (messageDetailsError) {
              throw messageDetailsError;
            }
            
            // Process messages with the sender_name and receiver_name from the view
            const processedMessages = messageDetailsData.map(msg => ({
              ...msg,
              senderName: msg.sender_id === user.id.toString() 
                ? 'Me' 
                : msg.sender_name 
                  ? `Teacher: ${msg.sender_name}` 
                  : msg.is_announcement 
                    ? 'Admin' 
                    : 'Unknown Teacher',
              receiverName: msg.receiver_id === user.id.toString() 
                ? 'Me' 
                : msg.receiver_id === studentData.classroom_id.toString() 
                  ? 'My Classroom' 
                  : msg.receiver_name 
                    ? `Teacher: ${msg.receiver_name}` 
                    : 'Unknown'
            }));
            
            // Filter messages into the appropriate categories
            const announcementMessages = processedMessages.filter(msg => 
              msg.receiver_id === studentData.classroom_id.toString() && 
              (msg.receiver_type === 'classroom' || msg.is_announcement)
            );
            
            const inboxMessagesData = processedMessages.filter(msg => 
              msg.receiver_id === user.id.toString() && 
              msg.receiver_type === 'student'
            );
            
            const outboxMessagesData = processedMessages.filter(msg => 
              msg.sender_id === user.id.toString()
            );
            
            setAnnouncements(announcementMessages || []);
            setInboxMessages(inboxMessagesData || []);
            setOutboxMessages(outboxMessagesData || []);
          } catch (viewError) {
            console.error('Error fetching messages from view:', viewError);
            
            // Fallback to direct approach with manual teacher lookup
            try {
              console.log("Falling back to direct message query");
              const { data: messagesData, error: messagesError } = await supabase
                .from('messages')
                .select('*')
                .or(`receiver_id.eq.${studentData.classroom_id},receiver_id.eq.${user.id},sender_id.eq.${user.id}`)
                .order('sent_at', { ascending: false });
                
              if (messagesError) {
                throw messagesError;
              }
              
              // Process messages with names and filter into categories
              const processedMessages = await enhanceMessagesWithNames(messagesData || [], studentData.classroom_id);
              
              setAnnouncements(processedMessages.filter(msg => 
                msg.receiver_id === studentData.classroom_id.toString() && 
                (msg.receiver_type === 'classroom' || msg.is_announcement)
              ));
              
              setInboxMessages(processedMessages.filter(msg => 
                msg.receiver_id === user.id.toString() && 
                msg.receiver_type === 'student'
              ));
              
              setOutboxMessages(processedMessages.filter(msg => 
                msg.sender_id === user.id.toString()
              ));
            } catch (err) {
              console.error("Error in message fallback approach:", err);
              setMessageError('Failed to load messages. Please try again later.');
            }
          }
        }
      } catch (err) {
        console.error('Error loading student messages:', err);
        setMessageError('Failed to load messages. Please try again later.');
      } finally {
        setLoadingMessages(false);
      }
    };
    
    // Helper function to add names to messages when using fallback
    const enhanceMessagesWithNames = async (messagesData, classroomId) => {
      console.log("Enhancing messages with names, raw data:", messagesData);
      
      // Extract unique IDs for looking up
      const senderIds = [...new Set(messagesData.map(m => m.sender_id))];
      const receiverIds = [...new Set(messagesData.map(m => m.receiver_id))];
      
      console.log("Unique sender IDs:", senderIds);
      console.log("Unique receiver IDs:", receiverIds);
      
      // Build lookup maps for names
      const nameMap = {};
      
      // Check which sender IDs are teachers using direct query instead of RPC
      for (const id of senderIds) {
        try {
          // Check if this is a teacher
          const { data: teacherData, error: teacherError } = await supabase
            .from('teachers')
            .select('id, name')
            .eq('id', id)
            .maybeSingle();
            
          if (!teacherError && teacherData) {
            nameMap[id as string] = teacherData.name;
          }
        } catch (err) {
          console.error(`Error checking if ${id} is a teacher:`, err);
        }
      }
      
      console.log("Name map after teacher lookups:", nameMap);
      
      // Add classroom name
      nameMap[classroomId] = 'My Classroom';
      nameMap[classroomId.toString()] = 'My Classroom';
      
      // Process messages with names
      const enhanced = messagesData.map(message => ({
        ...message,
        senderName: message.sender_id === user.id.toString() 
          ? 'Me' 
          : nameMap[message.sender_id] 
            ? `Teacher: ${nameMap[message.sender_id]}` 
            : message.is_announcement
              ? 'Admin'
              : 'Unknown Teacher',
        receiverName: message.receiver_type === 'announcement' 
          ? 'All Users' 
          : message.receiver_id === user.id.toString() 
            ? 'Me' 
            : message.receiver_id === classroomId.toString() 
              ? 'My Classroom' 
              : nameMap[message.receiver_id] 
                ? `Teacher: ${nameMap[message.receiver_id]}` 
                : 'Unknown'
      }));
      
      console.log("Enhanced messages:", enhanced);
      return enhanced;
    };
    
    fetchStudentData();
  }, [user]);

  // Start a study session when component mounts
  useEffect(() => {
    if (user?.id && studentClassroomId) {
      const startStudySession = async () => {
        try {
          // Check if the classroom_study_sessions table exists
          const { error: tableCheckError } = await supabase
            .from('classroom_study_sessions')
            .select('id')
            .limit(1);
          
          // If the table doesn't exist, log the error but don't try to create a session
          if (tableCheckError) {
            console.error('Study session tracking not available:', tableCheckError);
            return;
          }
          
          // Create a new study session
          const { data, error } = await supabase
            .from('classroom_study_sessions')
            .insert({
              student_id: user.id,
              classroom_id: studentClassroomId,
              start_time: new Date().toISOString()
            })
            .select('id')
            .single();
            
          if (error) {
            console.error('Error starting study session:', error);
            return;
          }
          
          if (data) {
            setCurrentStudySession(data.id);
            console.log('Study session started:', data.id);
          }
        } catch (err) {
          console.error('Failed to start study session:', err);
        }
      };
      
      startStudySession();
    }
    
    // End the study session when component unmounts
    return () => {
      if (currentStudySession) {
        const endStudySession = async () => {
          try {
            // Check if the table exists before trying to update
            const { error: tableCheckError } = await supabase
              .from('classroom_study_sessions')
              .select('id')
              .limit(1);
            
            if (tableCheckError) {
              console.error('Study session tracking not available:', tableCheckError);
              return;
            }
            
            await supabase
              .from('classroom_study_sessions')
              .update({
                end_time: new Date().toISOString()
              })
              .eq('id', currentStudySession);
              
            console.log('Study session ended:', currentStudySession);
          } catch (err) {
            console.error('Failed to end study session:', err);
          }
        };
        
        endStudySession();
      }
    };
  }, [user?.id, studentClassroomId]);

  // Update the handleSendMessage function with better error handling
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageSubject || !messageBody || !selectedTeacher) {
      toast({
        title: 'Missing information',
        description: 'Please fill all fields before sending',
        variant: 'destructive',
      });
      return;
    }

    // Validate if the selected teacher is a valid UUID
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(selectedTeacher);
    if (!isValidUUID) {
      toast({
        title: 'Invalid teacher selection',
        description: 'Please select a valid teacher from the dropdown',
        variant: 'destructive',
      });
      return;
    }
    
    // Verify the teacher exists using direct query instead of RPC
    try {
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('id')
        .eq('id', selectedTeacher)
        .maybeSingle();
        
      if (teacherError || !teacherData) {
        toast({
          title: 'Invalid teacher',
          description: 'The selected teacher does not exist in the system',
          variant: 'destructive',
        });
        return;
      }
    } catch (err) {
      console.error("Error checking if teacher exists:", err);
      // Continue anyway since this is just a pre-check
    }
    
    setSubmittingMessage(true);
    try {
      // Get the teacher's name for display
      let teacherName = "";
      const teacher = teachersList.find(t => t.id === selectedTeacher);
      if (teacher) {
        teacherName = teacher.name;
      } else {
        // Lookup the teacher name directly
        try {
          const { data: teacherData, error: teacherError } = await supabase
            .from('teachers')
            .select('name')
            .eq('id', selectedTeacher)
            .maybeSingle();
            
          if (!teacherError && teacherData) {
            teacherName = teacherData.name;
          }
        } catch (err) {
          console.error("Error looking up teacher name:", err);
          teacherName = "Selected Teacher";
        }
      }
      
      // Create the message data
      const messageData = {
        subject: messageSubject,
        body: messageBody,
        sender_id: user.id.toString(),
        receiver_id: selectedTeacher,
        receiver_type: 'teacher',
        is_announcement: false,
        sent_at: new Date().toISOString()
      };
      
      console.log('Sending message:', messageData);
      
      // Send to database
      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select('id, subject, body, sender_id, receiver_id, receiver_type, is_announcement, sent_at');
        
      if (error) {
        console.error('Message insert error:', error);
        throw error;
      }
      
      // Add the new message to outbox with receiver info
      if (data && data[0]) {
        setOutboxMessages(prev => [{
          ...data[0],
          receiverName: `Teacher: ${teacherName}`
        }, ...prev]);
      
        toast({
          title: 'Message Sent',
          description: 'Your message has been sent successfully'
        });
        
        // Reset form
        setMessageSubject('');
        setMessageBody('');
        setSelectedTeacher('');
        
        // Switch back to inbox tab
        setFeedTab('inbox');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      let errorMessage = 'Failed to send message';
      
      if (err.message) {
        errorMessage += ': ' + err.message;
        
        // Special handling for common errors
        if (err.message.includes('permission denied')) {
          errorMessage = 'Permission denied. Please try again or contact support.';
        } else if (err.message.includes('invalid input syntax for type uuid')) {
          errorMessage = 'Invalid teacher ID format. Please try selecting a different teacher.';
        }
      }
      
      toast({
        title: 'Send Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSubmittingMessage(false);
    }
  };

  // Group classroom content by date
  const groupedQuizzes = React.useMemo(() => groupItemsByDate(classroomQuizzes), [classroomQuizzes]);
  const groupedMaterials = React.useMemo(() => groupItemsByDate(classroomMaterials), [classroomMaterials]);

  const handleStartQuiz = (quiz) => {
    console.log("Starting quiz:", quiz);
    
    // Check if quiz is active
    if (!quiz.is_active) {
      toast({
        title: "Quiz Unavailable",
        description: "This quiz has been deactivated by your teacher.",
        variant: "destructive"
      });
      return;
    }
    
    // Process the quiz questions to ensure proper format
    let processedQuiz = {...quiz};
    let parsedQuestions = [];
    
    // Parse questions if they're stored as a string
    if (typeof quiz.questions === 'string') {
      try {
        parsedQuestions = JSON.parse(quiz.questions);
        console.log("Parsed questions from string:", parsedQuestions);
      } catch (e) {
        console.error("Error parsing questions:", e);
        parsedQuestions = [];
      }
    } else if (Array.isArray(quiz.questions)) {
      parsedQuestions = quiz.questions;
      console.log("Questions already in array format:", parsedQuestions);
    } else if (quiz.questions && typeof quiz.questions === 'object') {
      // Handle case where questions might be already parsed JSON object
      parsedQuestions = [quiz.questions];
      console.log("Questions as single object:", parsedQuestions);
    } else {
      console.error("Unknown question format:", typeof quiz.questions, quiz.questions);
      parsedQuestions = [];
    }
    
    processedQuiz.questions = parsedQuestions;
    console.log("Processed quiz questions:", processedQuiz.questions);
    
    // Check if we have questions to display
    if (!processedQuiz.questions || processedQuiz.questions.length === 0) {
      toast({
        title: "Quiz Error",
        description: "This quiz doesn't have any questions yet.",
        variant: "destructive"
      });
      return;
    }
    
    setActiveQuiz(processedQuiz);
    
    // For form quizzes, set up the question answers structure
    if (processedQuiz.questions && processedQuiz.questions.length > 0) {
      setQuizAnswers({});
    }
    
    // Check if a submission already exists
    const checkExistingSubmission = async () => {
      try {
        const { data, error } = await supabase
          .from('quiz_submissions')
          .select('*')
          .eq('quiz_id', quiz.id)
          .eq('student_id', user.id)
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          // If submission exists and is already submitted, show result
          if (data.status === 'completed') {
            setQuizSubmissionResult(data);
            setSubmittingQuiz(false);
            setShowQuizResult(true);
          } else {
            // If in progress, load the existing answers
            if (data.answers && Object.keys(data.answers).length > 0) {
              setQuizAnswers(data.answers.selections || {});
            }
            setShowQuizModal(true);
          }
        } else {
          // No submission exists, start fresh
          setShowQuizModal(true);
          
          // Create a new submission record with 'pending' status
          const { error: createError } = await supabase
            .from('quiz_submissions')
            .insert({
              quiz_id: quiz.id,
              student_id: user.id,
              status: 'in_progress',
              submitted_at: null,
              is_graded: false
            });
            
          if (createError) throw createError;
        }
      } catch (err) {
        console.error('Error checking quiz submission:', err);
        toast({
          title: 'Error',
          description: 'Could not start quiz. Please try again.',
          variant: 'destructive',
        });
      }
    };
    
    checkExistingSubmission();
  };

  const handleQuizAnswerChange = (questionIndex: number, optionIndex: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz || !user) return;
    
    // Validate that all questions have been answered
    const answeredQuestions = Object.keys(quizAnswers).length;
    const totalQuestions = activeQuiz.questions?.length || 0;
    
    if (answeredQuestions < totalQuestions) {
      toast({
        title: "Incomplete Quiz",
        description: `Please answer all questions. (${answeredQuestions}/${totalQuestions} answered)`,
        variant: "destructive"
      });
      return;
    }
    
    setSubmittingQuiz(true);
    
    try {
      // Calculate score (if the quiz has correct answers)
      let score = 0;
      let totalPossible = 0;
      
      // Make sure questions is an array
      const questions = Array.isArray(activeQuiz.questions) 
        ? activeQuiz.questions 
        : [];
      
      questions.forEach((q, idx) => {
        if (q && typeof q.correctOption === 'number') {
          totalPossible++;
          if (quizAnswers[idx] === q.correctOption) {
            score++;
          }
        } else if (q && typeof q.answer === 'number') {
          totalPossible++;
          if (quizAnswers[idx] === q.answer) {
            score++;
          }
        }
      });
      
      const scorePercentage = totalPossible > 0 ? Math.round((score / totalPossible) * 100) : null;
      
      // Update the submission record
      const { data: submissionData, error: submissionError } = await supabase
        .from('quiz_submissions')
        .update({
          score: scorePercentage,
          answers: { selections: quizAnswers },
          status: 'completed',
          is_graded: totalPossible > 0,
          submitted_at: new Date().toISOString()
        })
        .eq('quiz_id', activeQuiz.id)
        .eq('student_id', user.id)
        .select();
        
      if (submissionError) throw submissionError;
      
      // Update the quiz in the list
      setClassroomQuizzes(prev => 
        prev.map(q => q.id === activeQuiz.id ? { ...q, status: 'completed' } : q)
      );
      
      // Show result
      setQuizSubmissionResult({
        score: scorePercentage,
        totalQuestions,
        correctAnswers: score,
        submissionId: submissionData?.[0]?.id
      });
      
      setShowQuizModal(false);
      setShowQuizResult(true);
      
      toast({
        title: "Quiz Submitted",
        description: scorePercentage !== null 
          ? `Your score: ${scorePercentage}%` 
          : "Your quiz has been submitted for review."
      });
    } catch (err) {
      console.error('Error submitting quiz:', err);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your quiz. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const closeQuizModal = () => {
    setShowQuizModal(false);
    setActiveQuiz(null);
    setQuizAnswers({});
  };

  const closeQuizResultModal = () => {
    setShowQuizResult(false);
    setQuizSubmissionResult(null);
  };

  const classroomNavItems = [
    { label: 'Feed', icon: <MessageCircle className='w-6 h-6' /> },
    { label: 'Assignments', icon: <ClipboardList className='w-6 h-6' /> },
    { label: 'Classmates', icon: <Users className='w-6 h-6' /> },
    { label: 'Analytics', icon: <BarChart3 className='w-6 h-6' /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col pb-16">
      {/* Topbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/90 border-b border-indigo-100 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-siksha-purple" />
          <div>
            <div className="font-bold text-siksha-purple text-xl">Classroom: 10-B</div>
            <div className="text-xs text-indigo-400">Mathematics | Mrs. Kapoor</div>
          </div>
        </div>
        <Button variant="outline" className="rounded-xl text-siksha-purple border-siksha-purple font-semibold" onClick={() => navigate('/home')}>
          <X className="w-5 h-5 mr-1" /> Personal Space
        </Button>
      </div>
      {/* Main Content */}
      <main className="flex-1 w-full max-w-2xl mx-auto p-4">
        <div className="rounded-2xl bg-white shadow p-4 min-h-[300px]">
          {activeSection === 'Feed' && (
            <div>
              <Tabs value={feedTab} onValueChange={setFeedTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-4 w-full gap-1 bg-indigo-50 rounded-xl p-1">
                  <TabsTrigger value="announcements" className="rounded-lg text-xs sm:text-sm">Announcements</TabsTrigger>
                  <TabsTrigger value="inbox" className="rounded-lg text-xs sm:text-sm">Inbox</TabsTrigger>
                </TabsList>
                <TabsContent value="announcements">
                  <div className="space-y-3">
                    {loadingMessages ? (
                      <div className="p-6 text-center text-indigo-300">Loading announcements...</div>
                    ) : announcements.length === 0 ? (
                      <div className="text-indigo-300 text-center py-8">No announcements yet.</div>
                    ) : (
                      announcements.map(a => (
                        <div key={a.id} className="p-4 rounded-xl bg-indigo-50 flex items-center gap-3">
                          <MessageCircle className="w-5 h-5 text-siksha-purple" />
                          <div>
                            <div className="font-medium text-siksha-purple">
                              {a.is_announcement ? 'Announcement' : 'Message'} from {a.senderName}
                            </div>
                            <div className="font-medium text-siksha-purple">{a.subject}</div>
                            <CollapsibleMessageBody text={a.body} />
                            <div className="text-xs text-indigo-300 mt-1">{new Date(a.sent_at).toLocaleString()}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="inbox">
                  <div className="bg-white rounded-2xl shadow divide-y">
                    {loadingMessages ? (
                      <div className="p-6 text-center text-indigo-300">Loading messages...</div>
                    ) : inboxMessages.length === 0 ? (
                      <div className="p-6 text-center text-indigo-300">No messages in inbox.</div>
                    ) : (
                      inboxMessages.map(msg => (
                        <div key={msg.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-indigo-50 cursor-pointer">
                          <div>
                            <div className="font-bold text-siksha-purple text-sm">From: {msg.senderName}</div>
                            <div className="text-indigo-600 text-sm">{msg.subject}</div>
                            <CollapsibleMessageBody text={msg.body} />
                          </div>
                          <div className="text-xs text-indigo-400 mt-2 sm:mt-0">{new Date(msg.sent_at).toLocaleString()}</div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          {activeSection === 'Analytics' && (
            <div>
              <h3 className="font-bold text-siksha-purple text-lg mb-4">Analytics</h3>
              {studentClassroomId ? (
                <ClassroomAnalyticsComponent
                  isTeacher={false}
                  userId={user.id}
                  classroomId={studentClassroomId}
                  showPersonalToggle={true}
                />
              ) : (
                <div className="text-center py-8 text-indigo-300">
                  No classroom assigned. Please contact your teacher.
                </div>
              )}
            </div>
          )}
          {activeSection === 'Assignments' && (
            <div className="space-y-6">
              {loadingClassroomContent ? (
                <div className="flex justify-center items-center p-8">
                  <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
              ) : (
                <>
                  {/* Toggle between Quizzes and Materials */}
                  <div className="flex justify-center mb-4">
                    <div className="bg-indigo-100 rounded-xl p-1 flex w-full max-w-xs">
                      <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 ${
                          activeTab === 'quizzes' 
                            ? 'bg-white text-siksha-purple shadow-sm' 
                            : 'text-indigo-500 hover:bg-indigo-200'
                        }`}
                        onClick={() => setActiveTab('quizzes')}
                      >
                        Quizzes
                      </button>
                      <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 ${
                          activeTab === 'materials' 
                            ? 'bg-white text-siksha-purple shadow-sm' 
                            : 'text-indigo-500 hover:bg-indigo-200'
                        }`}
                        onClick={() => setActiveTab('materials')}
                      >
                        Materials
                      </button>
                    </div>
                  </div>
                  
                  {/* Quizzes Section */}
                  {activeTab === 'quizzes' && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-siksha-purple text-lg">Quizzes</h3>
                      
                      {/* Today's Quizzes */}
                      {groupedQuizzes.today.length > 0 && (
                        <div>
                          <h4 className="text-indigo-400 font-medium mb-2">Today</h4>
                          <div className="grid grid-cols-1 gap-3">
                            {groupedQuizzes.today.map(quiz => (
                              <div key={quiz.id} className="bg-white rounded-xl shadow p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h5 className="font-bold text-siksha-purple">{quiz.title}</h5>
                                    <p className="text-xs text-indigo-400">
                                      {quiz.questionsCount || 0} questions
                                    </p>
                                  </div>
                                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    quiz.status === 'completed' 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-indigo-100 text-indigo-700'
                                  }`}>
                                    {quiz.status === 'completed' ? 'Completed' : 'Pending'}
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">
                                  {quiz.description || 'No description provided.'}
                                </p>
                                {quiz.status === 'completed' ? (
                                  <div className="flex items-center justify-between">
                                    <div className="text-xs text-gray-500">
                                      Submitted: {new Date(quiz.submitted_at).toLocaleDateString()}
                                    </div>
                                    {quiz.score !== null && (
                                      <div className="text-sm font-medium text-green-600">
                                        Score: {quiz.score}%
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <Button 
                                    className="w-full bg-siksha-purple text-white"
                                    onClick={() => handleStartQuiz(quiz)}
                                  >
                                    Start Quiz
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* This Week's Quizzes */}
                      {groupedQuizzes.thisWeek.length > 0 && (
                        <div>
                          <h4 className="text-indigo-400 font-medium mb-2">This Week</h4>
                          <div className="grid grid-cols-1 gap-3">
                            {groupedQuizzes.thisWeek.map(quiz => (
                              <div key={quiz.id} className="bg-white rounded-xl shadow p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h5 className="font-bold text-siksha-purple">{quiz.title}</h5>
                                    <p className="text-xs text-indigo-400">
                                      {quiz.questionsCount || 0} questions
                                    </p>
                                  </div>
                                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    quiz.status === 'completed' 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-indigo-100 text-indigo-700'
                                  }`}>
                                    {quiz.status === 'completed' ? 'Completed' : 'Pending'}
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">
                                  {quiz.description || 'No description provided.'}
                                </p>
                                {quiz.status === 'completed' ? (
                                  <div className="flex items-center justify-between">
                                    <div className="text-xs text-gray-500">
                                      Submitted: {new Date(quiz.submitted_at).toLocaleDateString()}
                                    </div>
                                    {quiz.score !== null && (
                                      <div className="text-sm font-medium text-green-600">
                                        Score: {quiz.score}%
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <Button 
                                    className="w-full bg-siksha-purple text-white"
                                    onClick={() => handleStartQuiz(quiz)}
                                  >
                                    Start Quiz
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Older Quizzes */}
                      {groupedQuizzes.older.length > 0 && (
                        <div>
                          <h4 className="text-indigo-400 font-medium mb-2">Older</h4>
                          <div className="grid grid-cols-1 gap-3">
                            {groupedQuizzes.older.map(quiz => (
                              <div key={quiz.id} className="bg-white rounded-xl shadow p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h5 className="font-bold text-siksha-purple">{quiz.title}</h5>
                                    <p className="text-xs text-indigo-400">
                                      {quiz.questionsCount || 0} questions
                                    </p>
                                  </div>
                                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    quiz.status === 'completed' 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-indigo-100 text-indigo-700'
                                  }`}>
                                    {quiz.status === 'completed' ? 'Completed' : 'Pending'}
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">
                                  {quiz.description || 'No description provided.'}
                                </p>
                                {quiz.status === 'completed' ? (
                                  <div className="flex items-center justify-between">
                                    <div className="text-xs text-gray-500">
                                      Submitted: {new Date(quiz.submitted_at).toLocaleDateString()}
                                    </div>
                                    {quiz.score !== null && (
                                      <div className="text-sm font-medium text-green-600">
                                        Score: {quiz.score}%
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <Button 
                                    className="w-full bg-siksha-purple text-white"
                                    onClick={() => handleStartQuiz(quiz)}
                                  >
                                    Start Quiz
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {groupedQuizzes.today.length === 0 && 
                       groupedQuizzes.thisWeek.length === 0 && 
                       groupedQuizzes.older.length === 0 && (
                        <div className="text-center p-8 text-indigo-300">
                          No quizzes assigned yet.
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Materials Section */}
                  {activeTab === 'materials' && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-siksha-purple text-lg">Learning Materials</h3>
                      
                      {/* Today's Materials */}
                      {groupedMaterials.today.length > 0 && (
                        <div>
                          <h4 className="text-indigo-400 font-medium mb-2">Today</h4>
                          <div className="grid grid-cols-1 gap-3">
                            {groupedMaterials.today.map(material => (
                              <div key={material.id} className="bg-white rounded-xl shadow p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h5 className="font-bold text-siksha-purple">{material.title}</h5>
                                    <p className="text-xs text-indigo-400">
                                      {material.type || 'Document'}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">
                                  {material.description || 'No description provided.'}
                                </p>
                                <div className="flex justify-end">
                                  {material.file_url && (
                                    <Button 
                                      className="bg-siksha-purple text-white"
                                      onClick={() => {
                                        // If it's already a signed URL or public URL, open directly
                                        if (material.file_url.includes('?token=') || material.file_url.includes('storage.googleapi')) {
                                          window.open(material.file_url, '_blank');
                                        } else {
                                          // Otherwise try to get a new signed URL
                                          // Extract the file name from the URL
                                          const fileName = material.file_url.split('/').pop();
                                          
                                          if (fileName) {
                                            // Get a fresh signed URL
                                            supabase.storage
                                              .from('materials')
                                              .createSignedUrl(fileName, 60 * 60) // 1 hour expiry
                                              .then(({ data, error }) => {
                                                if (error) {
                                                  console.error('Error creating signed URL:', error);
                                                  toast({
                                                    title: "Error",
                                                    description: "Could not access this material. Please try again.",
                                                    variant: "destructive"
                                                  });
                                                  return;
                                                }
                                                
                                                if (data?.signedUrl) {
                                                  window.open(data.signedUrl, '_blank');
                                                }
                                              });
                                          } else {
                                            // Fallback to the original URL if we can't parse it
                                            window.open(material.file_url, '_blank');
                                          }
                                        }
                                      }}
                                    >
                                      View
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* This Week's Materials */}
                      {groupedMaterials.thisWeek.length > 0 && (
                        <div>
                          <h4 className="text-indigo-400 font-medium mb-2">This Week</h4>
                          <div className="grid grid-cols-1 gap-3">
                            {groupedMaterials.thisWeek.map(material => (
                              <div key={material.id} className="bg-white rounded-xl shadow p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h5 className="font-bold text-siksha-purple">{material.title}</h5>
                                    <p className="text-xs text-indigo-400">
                                      {material.type || 'Document'}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">
                                  {material.description || 'No description provided.'}
                                </p>
                                <div className="flex justify-end">
                                  {material.file_url && (
                                    <Button 
                                      className="bg-siksha-purple text-white"
                                      onClick={() => {
                                        // If it's already a signed URL or public URL, open directly
                                        if (material.file_url.includes('?token=') || material.file_url.includes('storage.googleapi')) {
                                          window.open(material.file_url, '_blank');
                                        } else {
                                          // Otherwise try to get a new signed URL
                                          // Extract the file name from the URL
                                          const fileName = material.file_url.split('/').pop();
                                          
                                          if (fileName) {
                                            // Get a fresh signed URL
                                            supabase.storage
                                              .from('materials')
                                              .createSignedUrl(fileName, 60 * 60) // 1 hour expiry
                                              .then(({ data, error }) => {
                                                if (error) {
                                                  console.error('Error creating signed URL:', error);
                                                  toast({
                                                    title: "Error",
                                                    description: "Could not access this material. Please try again.",
                                                    variant: "destructive"
                                                  });
                                                  return;
                                                }
                                                
                                                if (data?.signedUrl) {
                                                  window.open(data.signedUrl, '_blank');
                                                }
                                              });
                                          } else {
                                            // Fallback to the original URL if we can't parse it
                                            window.open(material.file_url, '_blank');
                                          }
                                        }
                                      }}
                                    >
                                      View
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Older Materials */}
                      {groupedMaterials.older.length > 0 && (
                        <div>
                          <h4 className="text-indigo-400 font-medium mb-2">Older</h4>
                          <div className="grid grid-cols-1 gap-3">
                            {groupedMaterials.older.map(material => (
                              <div key={material.id} className="bg-white rounded-xl shadow p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h5 className="font-bold text-siksha-purple">{material.title}</h5>
                                    <p className="text-xs text-indigo-400">
                                      {material.type || 'Document'}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">
                                  {material.description || 'No description provided.'}
                                </p>
                                <div className="flex justify-end">
                                  {material.file_url && (
                                    <Button 
                                      className="bg-siksha-purple text-white"
                                      onClick={() => {
                                        // If it's already a signed URL or public URL, open directly
                                        if (material.file_url.includes('?token=') || material.file_url.includes('storage.googleapi')) {
                                          window.open(material.file_url, '_blank');
                                        } else {
                                          // Otherwise try to get a new signed URL
                                          // Extract the file name from the URL
                                          const fileName = material.file_url.split('/').pop();
                                          
                                          if (fileName) {
                                            // Get a fresh signed URL
                                            supabase.storage
                                              .from('materials')
                                              .createSignedUrl(fileName, 60 * 60) // 1 hour expiry
                                              .then(({ data, error }) => {
                                                if (error) {
                                                  console.error('Error creating signed URL:', error);
                                                  toast({
                                                    title: "Error",
                                                    description: "Could not access this material. Please try again.",
                                                    variant: "destructive"
                                                  });
                                                  return;
                                                }
                                                
                                                if (data?.signedUrl) {
                                                  window.open(data.signedUrl, '_blank');
                                                }
                                              });
                                          } else {
                                            // Fallback to the original URL if we can't parse it
                                            window.open(material.file_url, '_blank');
                                          }
                                        }
                                      }}
                                    >
                                      View
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {groupedMaterials.today.length === 0 && 
                       groupedMaterials.thisWeek.length === 0 && 
                       groupedMaterials.older.length === 0 && (
                        <div className="text-center p-8 text-indigo-300">
                          No learning materials available yet.
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          {/* Other sections for Classmates and Analytics... */}
        </div>
        
        {/* Quiz Modal, Quiz Result Modal, and other modals... */}
      
        {/* Quiz Modal */}
        <Dialog open={showQuizModal} onOpenChange={setShowQuizModal}>
          <DialogContent className="sm:max-w-2xl">
            <DialogTitle className="text-xl font-bold text-siksha-purple">
              {activeQuiz?.title}
            </DialogTitle>
            <DialogDescription>
              {activeQuiz?.description || 'Answer all the questions and submit.'}
            </DialogDescription>
            
            {activeQuiz && activeQuiz.questions && activeQuiz.questions.length > 0 ? (
              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                {activeQuiz.questions.map((question, qIdx) => (
                  <div key={qIdx} className="bg-indigo-50 p-4 rounded-xl">
                    <h3 className="font-medium mb-3">
                      {qIdx + 1}. {question.text || question.questionText || "Question text missing"}
                    </h3>
                    <div className="space-y-2">
                      {(question.options || []).map((option, oIdx) => (
                        <div 
                          key={oIdx} 
                          className={`p-3 rounded-lg border cursor-pointer ${
                            quizAnswers[qIdx] === oIdx 
                              ? 'bg-indigo-100 border-indigo-300' 
                              : 'bg-white border-gray-200 hover:bg-indigo-50'
                          }`}
                          onClick={() => handleQuizAnswerChange(qIdx, oIdx)}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-indigo-300">
                No questions found in this quiz.
              </div>
            )}
            
            <div className="flex justify-end gap-3 mt-4">
              <Button 
                variant="outline" 
                onClick={closeQuizModal}
                disabled={submittingQuiz}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitQuiz}
                disabled={submittingQuiz}
                className="bg-siksha-purple text-white"
              >
                {submittingQuiz ? 'Submitting...' : 'Submit Quiz'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Quiz Result Modal */}
        <Dialog open={showQuizResult} onOpenChange={setShowQuizResult}>
          <DialogContent className="sm:max-w-md">
            <DialogTitle className="text-xl font-bold text-siksha-purple">
              Quiz Results
            </DialogTitle>
            
            {quizSubmissionResult && (
              <div className="text-center py-6">
                {quizSubmissionResult.score !== null ? (
                  <>
                    <div className="text-4xl font-bold text-siksha-purple mb-2">
                      {quizSubmissionResult.score}%
                    </div>
                    <div className="text-sm text-gray-600">
                      You got {quizSubmissionResult.correctAnswers || 0} correct out of {quizSubmissionResult.totalQuestions || 0} questions.
                    </div>
                  </>
                ) : (
                  <div className="text-lg font-medium text-siksha-purple">
                    Your quiz has been submitted.
                  </div>
                )}
              </div>
            )}
            
            <div className="flex justify-center">
              <Button 
                onClick={closeQuizResultModal}
                className="bg-siksha-purple text-white"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      {/* Bottom Classroom Navbar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-indigo-100 flex justify-around py-1 shadow-lg">
        {classroomNavItems.map((item) => (
          <button
            key={item.label}
            className={`flex flex-col items-center py-2 px-3 w-full ${activeSection === item.label ? 'text-siksha-purple' : 'text-gray-400'}`}
            onClick={() => setActiveSection(item.label)}
          >
            <div className={`w-6 h-6 mb-1 ${activeSection === item.label ? 'text-siksha-purple' : 'text-gray-400'}`}>{item.icon}</div>
            <span className="text-xs font-semibold">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ClassroomMode; 