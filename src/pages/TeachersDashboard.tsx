import React, { useState, useEffect } from 'react';
import { Menu, BookOpen, Users, ClipboardList, MessageCircle, BarChart3, UserCircle, Bell, Plus, Paperclip, Eye, Bot, X, LogOut, Trash2, Ban, CircleCheck, School } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
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

const navItems = [
  { label: 'Home', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'My Classes', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Quizzes & Materials', icon: <ClipboardList className="w-5 h-5" /> },
  { label: 'Messages', icon: <MessageCircle className="w-5 h-5" /> },
  { label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Profile', icon: <UserCircle className="w-5 h-5" /> },
];

const stats = [
  { label: 'Classes', value: 5 },
  { label: 'Students', value: 120 },
  { label: 'Pending Grading', value: 8 },
  { label: 'Upcoming Sessions', value: 2 },
];

const recentActivity = [
  { text: 'Student A completed Quiz 3' },
  { text: 'Student B requested help' },
  { text: 'Quiz 5 assigned to Class 8A' },
  { text: 'Flashcards created for Class 7B' },
  { text: 'Student C joined Class 6C' },
];

const HomeSection = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statList, setStatList] = useState(stats);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;
    
    const fetchDashboardStats = async () => {
      setLoading(true);
      try {
        // Get assigned classes count
        const { data: classData, error: classError } = await supabase
          .from('classrooms')
          .select('id')
          .or(`class_teacher_id.eq.${user.id},teachers.cs.{${user.id}}`)
          .eq('active', true);
          
        if (classError) throw classError;
        
        // Get students count from assigned classes
        const classIds = (classData || []).map(c => c.id);
        let studentsCount = 0;
        
        if (classIds.length > 0) {
          const { data: studentsData, error: studentsError } = await supabase
            .from('students')
            .select('id')
            .in('classroom_id', classIds)
            .eq('active', true);
            
          if (studentsError) throw studentsError;
          studentsCount = studentsData?.length || 0;
        }
        
        // Get number of quizzes created by this teacher
        const { data: quizzesData, error: quizzesError } = await supabase
          .from('quizzes')
          .select('id')
          .eq('teacher_id', user.id);
          
        if (quizzesError) throw quizzesError;
        
        // Get number of assignments/materials created by this teacher
        const { data: materialsData, error: materialsError } = await supabase
          .from('materials')
          .select('id')
          .eq('teacher_id', user.id);
          
        if (materialsError) throw materialsError;
        
        // Update stats
        setStatList([
          { label: 'Classes', value: classIds.length },
          { label: 'Students', value: studentsCount },
          { label: 'Quizzes', value: quizzesData?.length || 0 },
          { label: 'Assignments', value: materialsData?.length || 0 }
        ]);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        // Keep default stats on error
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardStats();
  }, [user]);

  if (loading) return <div className="min-h-[200px] flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-[200px] flex items-center justify-center text-red-500">{error}</div>;

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-6">
        {statList.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl shadow p-3 sm:p-6 flex flex-col items-center">
            <span className="text-xs sm:text-sm text-indigo-400 font-semibold mb-1">{stat.label}</span>
            <span className="text-2xl sm:text-3xl font-bold text-siksha-purple">{stat.value}</span>
          </div>
        ))}
      </div>
      {/* Recent Activity */}
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-bold text-siksha-purple mb-2">Recent Activity</h3>
        <div className="flex flex-col gap-2 pb-2">
          {recentActivity.length === 0 ? (
            <div className="text-indigo-300">No recent activity.</div>
          ) : (
            recentActivity.map((activity, idx) => (
              <div key={idx} className="bg-indigo-100 text-siksha-purple rounded-xl px-3 py-2 text-xs sm:text-sm shadow">
                {activity.text}
              </div>
            ))
          )}
        </div>
      </div>
      <div className="mt-6 text-center text-indigo-300">Welcome to your teacher dashboard!</div>
    </>
  );
};

const MyClassesSection = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [studentsByClass, setStudentsByClass] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    (async () => {
      try {
        const { data: classData, error: classError } = await supabase
          .from('classrooms')
          .select(`
            id,
            name,
            class_teacher_id,
            teachers,
            active
          `)
          .eq('active', true)
          .or(`class_teacher_id.eq.${user.id},teachers.cs.{${user.id}}`);
        
        if (classError) throw classError;
        
        // Filter classrooms where this teacher is either class teacher or in teachers array
        const teacherClasses = (classData || []).filter(cls => {
          const isClassTeacher = cls.class_teacher_id === user.id;
          const isInTeachers = Array.isArray(cls.teachers) && cls.teachers.includes(user.id);
          return isClassTeacher || isInTeachers;
        });
        
        setClasses(teacherClasses);
        
        // Fetch students for these classes
        const studentsMap = {};
        if (teacherClasses.length > 0) {
          const { data: studentsData, error: studentsError } = await supabase
            .from('students')
            .select('id, name, email, classroom_id')
            .in('classroom_id', teacherClasses.map(c => c.id));
          
          if (studentsError) throw studentsError;
          (studentsData || []).forEach(s => {
            if (!studentsMap[s.classroom_id]) studentsMap[s.classroom_id] = [];
            studentsMap[s.classroom_id].push(s);
          });
        }
        setStudentsByClass(studentsMap);
      } catch (err) {
        console.error('Error in classroom fetch:', err);
        setError('Failed to load classes or students: ' + (err.message || ''));
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) return <div className="min-h-[200px] flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-[200px] flex items-center justify-center text-red-500">{error}</div>;
  if (classes.length === 0) return <div className="min-h-[200px] flex items-center justify-center text-gray-500">No classes assigned yet.</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {classes.map((cls) => (
        <div key={cls.id} className="bg-white rounded-2xl shadow p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-siksha-purple text-lg">{cls.name}</h3>
              <p className="text-sm text-gray-500">Classroom ID: {cls.id}</p>
            </div>
            <Button 
              size="sm" 
              className="bg-siksha-purple text-white"
            >
              View Details
            </Button>
          </div>
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-gray-500">Students:</span>{' '}
              <span className="font-medium text-indigo-600">
                {studentsByClass[cls.id]?.length || 0}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Role:</span>{' '}
              <span className="font-medium text-indigo-600">
                {cls.class_teacher_id === user.id ? 'Class Teacher' : 'Subject Teacher'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const MessagesSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [tab, setTab] = useState('inbox');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [composeModal, setComposeModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Form state for compose
  const [composeForm, setComposeForm] = useState({
    recipient: '',
    subject: '',
    message: '',
    recipientType: 'student', // 'student', 'class', 'school'
    isAnnouncement: false
  });
  const [submittingMessage, setSubmittingMessage] = useState(false);
  const [recipients, setRecipients] = useState([]);

  // Fetch classes and students for the teacher
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchClassesAndStudents = async () => {
      try {
        // Fetch classes assigned to this teacher
        const { data: classData, error: classError } = await supabase
          .from('classrooms')
          .select('id, name, class_teacher_id, teachers')
          .or(`class_teacher_id.eq.${user.id},teachers.cs.{${user.id}}`)
          .eq('active', true);
        
        if (classError) throw classError;
        
        const teacherClasses = (classData || []).filter(cls => 
          cls.class_teacher_id === user.id || 
          (Array.isArray(cls.teachers) && cls.teachers.includes(user.id))
        );
        
        setClasses(teacherClasses);
        
        // Fetch students in these classes
        let studentsData = [];
        if (teacherClasses.length > 0) {
          const { data: fetchedStudents, error: studentsError } = await supabase
            .from('students')
            .select('id, name, email, classroom_id')
            .in('classroom_id', teacherClasses.map(c => c.id));
            
          if (studentsError) throw studentsError;
          studentsData = fetchedStudents || [];
          setStudents(studentsData);
        }
        
        // Build recipients list for the dropdown
        const allRecipients = [
          ...((teacherClasses || []).map(c => ({ id: c.id, name: c.name, type: 'classroom' }))),
          ...((studentsData || []).map(s => ({ id: s.id, name: s.name, email: s.email, type: 'student' })))
        ];
        
        setRecipients(allRecipients);
        
      } catch (err) {
        console.error('Error fetching classes and students:', err);
        toast({
          title: 'Error',
          description: 'Failed to load classes and students',
          variant: 'destructive'
        });
      }
    };
    
    fetchClassesAndStudents();
  }, [user]);

  // Fetch messages
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchMessages = async () => {
      setLoading(true);
      setError('');
      try {
        // Try using the message_details view first
        const { data, error } = await supabase
          .from('message_details')
          .select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('sent_at', { ascending: false });
        
        if (error) {
          console.error('Error with message_details view:', error);
          
          // Fallback to directly querying messages table
          const { data: messagesData, error: messagesError } = await supabase
            .from('messages')
            .select(`
              id, 
              subject, 
              body, 
              sender_id, 
              receiver_id, 
              receiver_type,
              is_announcement, 
              sent_at, 
              read_at,
              attachment_url
            `)
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
            .order('sent_at', { ascending: false });
          
          if (messagesError) throw messagesError;
          
          // Process messages to add names
          const processedMessages = await enhanceMessagesWithNames(messagesData || []);
          setMessages(processedMessages);
        } else {
          setMessages(data || []);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    // Helper function to add names to messages when using fallback
    const enhanceMessagesWithNames = async (messagesData) => {
      const senderIds = [...new Set(messagesData.map(m => m.sender_id))];
      const receiverIds = [...new Set(messagesData.map(m => m.receiver_id))];
      
      // Build lookup maps for names
      const nameMap = {};
      
      // Get teacher names
      try {
        const { data: teachersData } = await supabase
          .from('teachers')
          .select('id, name')
          .in('id', [...senderIds, ...receiverIds]);
          
        if (teachersData) {
          teachersData.forEach(t => { nameMap[t.id] = `Teacher: ${t.name}`; });
        }
      } catch (err) {
        console.error('Error fetching teacher names:', err);
      }
      
      // Get student names
      try {
        const { data: studentsData } = await supabase
          .from('students')
          .select('id, name')
          .in('id', [...senderIds, ...receiverIds]);
          
        if (studentsData) {
          studentsData.forEach(s => { nameMap[s.id] = `Student: ${s.name}`; });
        }
      } catch (err) {
        console.error('Error fetching student names:', err);
      }
      
      // Get classroom names
      try {
        const { data: classroomsData } = await supabase
          .from('classrooms')
          .select('id, name')
          .in('id', [...senderIds, ...receiverIds]);
          
        if (classroomsData) {
          classroomsData.forEach(c => { nameMap[c.id] = `Class: ${c.name}`; });
        }
      } catch (err) {
        console.error('Error fetching classroom names:', err);
      }
      
      // Process messages with names
      return messagesData.map(message => ({
        ...message,
        sender_name: nameMap[message.sender_id] || (message.sender_id === user.id ? 'Me (Teacher)' : 'Unknown'),
        receiver_name: nameMap[message.receiver_id] || (
          message.receiver_type === 'announcement' ? 'All Users' : 'Unknown'
        )
      }));
    };

    fetchMessages();
  }, [user]);

  // Function to send a message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!composeForm.subject || !composeForm.message || !composeForm.recipient) {
      toast({
        title: 'Missing information',
        description: 'Please fill all fields before sending',
        variant: 'destructive'
      });
      return;
    }
    
    setSubmittingMessage(true);
    try {
      // Get recipient type from selected recipient
      const recipient = recipients.find(r => r.id === composeForm.recipient);
      const recipientType = recipient?.type || composeForm.recipientType;
      
      // Create message object - Make sure all IDs are strings to prevent type issues
      const newMessage = {
        subject: composeForm.subject,
        body: composeForm.message,
        sender_id: user.id.toString(),
        receiver_id: composeForm.recipient.toString(),
        receiver_type: recipientType,
        is_announcement: composeForm.isAnnouncement,
        sent_at: new Date().toISOString(),
        read_at: null
      };
      
      console.log("Sending message with payload:", newMessage);
      
      // Try direct insert with minimal columns to avoid any potential reference issues
      const { data, error } = await supabase
        .from('messages')
        .insert({
          subject: composeForm.subject,
          body: composeForm.message,
          sender_id: user.id.toString(),
          receiver_id: composeForm.recipient.toString(),
          receiver_type: recipientType,
          is_announcement: composeForm.isAnnouncement,
          sent_at: new Date().toISOString()
        })
        .select('id, subject, body, sender_id, receiver_id, receiver_type, is_announcement, sent_at');
      
      if (error) {
        console.error('Message insert error details:', error);
        throw error;
      }
      
      // Add the new message to our state
      if (data && data[0]) {
        setMessages(prev => [
          {
            ...data[0],
            sender_name: 'Me (Teacher)',
            receiver_name: recipient?.name || 'Unknown'
          },
          ...prev
        ]);
        
        toast({
          title: 'Success',
          description: 'Message sent successfully'
        });
        
        // Reset form and close modal
        setComposeForm({
          recipient: '',
          subject: '',
          message: '',
          recipientType: 'student',
          isAnnouncement: false
        });
        setComposeModal(false);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      let errorMessage = 'Failed to send message';
      
      if (err.message) {
        errorMessage += ': ' + err.message;
        
        // Special handling for common errors
        if (err.message.includes('permission denied')) {
          errorMessage = 'Permission denied. Please try again or contact support.';
        }
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setSubmittingMessage(false);
    }
  };

  // View message details
  const viewMessage = (message) => {
    setSelectedMessage(message);
    setShowMessageModal(true);
    
    // Mark as read if it's an incoming message and not already read
    if (message.receiver_id === user.id && !message.read_at) {
      supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', message.id)
        .then(({ error }) => {
          if (error) console.error('Error marking message as read:', error);
          else {
            // Update local state
            setMessages(prev => 
              prev.map(m => m.id === message.id ? { ...m, read_at: new Date().toISOString() } : m)
            );
          }
        });
    }
  };

  // Delete a message
  const deleteMessage = async (messageId) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);
      
      if (error) throw error;
      
      setMessages(prev => prev.filter(m => m.id !== messageId));
      setShowMessageModal(false);
      
      toast({
        title: 'Success',
        description: 'Message deleted successfully'
      });
    } catch (err) {
      console.error('Error deleting message:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive'
      });
    }
  };

  // Helper to determine if a message is in inbox or sent
  const isInInbox = (message) => message.receiver_id === user.id;
  const isInSent = (message) => message.sender_id === user.id;

  // Filter messages based on the active tab
  const inboxMessages = messages.filter(isInInbox);
  const sentMessages = messages.filter(isInSent);

  // Get the sender/receiver name
  const getParticipantName = (message, isSender = true) => {
    // If using message_details view
    if (message.sender_name && message.receiver_name) {
      return isSender ? message.sender_name : message.receiver_name;
    }
    
    // Otherwise calculate from participants
    const id = isSender ? message.sender_id : message.receiver_id;
    const type = !isSender ? message.receiver_type : null;
    
    // For classroom messages
    if (type === 'classroom') {
      const classroom = classes.find(c => c.id === id);
      return classroom ? `Class: ${classroom.name}` : `Class: ${id}`;
    }
    
    // For student messages
    if (type === 'student') {
      const student = students.find(s => s.id === id);
      return student ? `Student: ${student.name}` : `Student: ${id}`;
    }
    
    // If it's a message from the current user
    if (id === user.id) {
      return 'Me (Teacher)';
    }
    
    // Default fallback
    return 'Unknown';
  };

  if (loading) return <div className="min-h-[200px] flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-[200px] flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div>
      {/* Header with compose button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg sm:text-2xl font-bold text-siksha-purple">Messages</h2>
        <Button 
          className="bg-siksha-purple text-white"
          onClick={() => setComposeModal(true)}
        >
          Compose Message
        </Button>
      </div>
      
      {/* Messages tab interface */}
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
        </TabsList>
        
        <TabsContent value="inbox" className="bg-white rounded-2xl shadow">
          {inboxMessages.length === 0 ? (
            <div className="p-6 text-center text-gray-400">No messages in inbox</div>
          ) : (
            <div className="divide-y">
              {inboxMessages.map(message => (
                <div 
                  key={message.id} 
                  className={`p-4 hover:bg-indigo-50 cursor-pointer ${!message.read_at ? 'bg-blue-50' : ''}`}
                  onClick={() => viewMessage(message)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-siksha-purple">{message.subject}</p>
                      <p className="text-sm text-gray-500">From: {getParticipantName(message, true)}</p>
                      <CollapsibleMessageBody text={message.body} />
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(message.sent_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="sent" className="bg-white rounded-2xl shadow">
          {sentMessages.length === 0 ? (
            <div className="p-6 text-center text-gray-400">No sent messages</div>
          ) : (
            <div className="divide-y">
              {sentMessages.map(message => (
                <div 
                  key={message.id} 
                  className="p-4 hover:bg-indigo-50 cursor-pointer"
                  onClick={() => viewMessage(message)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-siksha-purple">
                        {message.subject}
                        {message.is_announcement && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                            Announcement
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">To: {getParticipantName(message, false)}</p>
                      <CollapsibleMessageBody text={message.body} />
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(message.sent_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Compose Message Modal */}
      <Dialog open={composeModal} onOpenChange={setComposeModal}>
        <DialogContent className="max-w-md">
          <DialogTitle>Compose Message</DialogTitle>
          <DialogDescription className="sr-only">Create a new message</DialogDescription>
          <form onSubmit={sendMessage} className="space-y-4">
            <div>
              <Label htmlFor="recipient">Recipient</Label>
              <select
                id="recipient"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 bg-white text-siksha-purple focus:outline-none"
                value={composeForm.recipient}
                onChange={(e) => {
                  const selectedRecipient = recipients.find(r => r.id === e.target.value);
                  setComposeForm(prev => ({ 
                    ...prev, 
                    recipient: e.target.value,
                    recipientType: selectedRecipient?.type || 'student'
                  }));
                }}
                required
              >
                <option value="">Select Recipient</option>
                <optgroup label="Classes">
                  {recipients.filter(r => r.type === 'classroom').map(r => (
                    <option key={r.id} value={r.id}>Class: {r.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Students">
                  {recipients.filter(r => r.type === 'student').map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </optgroup>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is-announcement"
                checked={composeForm.isAnnouncement}
                onChange={(e) => setComposeForm(prev => ({ ...prev, isAnnouncement: e.target.checked }))}
                className="mr-2"
              />
              <Label htmlFor="is-announcement">Send as Announcement</Label>
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={composeForm.subject}
                onChange={(e) => setComposeForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter subject"
                required
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <textarea
                id="message"
                className="w-full min-h-[120px] rounded-md border border-gray-300 p-2"
                value={composeForm.message}
                onChange={(e) => setComposeForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Type your message here..."
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setComposeModal(false)}>Cancel</Button>
              <Button type="submit" className="bg-siksha-purple text-white" disabled={submittingMessage}>
                {submittingMessage ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* View Message Modal */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent className="max-w-md">
          <DialogTitle>{selectedMessage?.subject || 'Message'}</DialogTitle>
          <DialogDescription className="sr-only">Message details</DialogDescription>
          {selectedMessage && (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400">
                  {isInInbox(selectedMessage) ? 'From' : 'To'}:
                </p>
                <p className="font-medium">
                  {isInInbox(selectedMessage) 
                    ? getParticipantName(selectedMessage, true)
                    : getParticipantName(selectedMessage, false)
                  }
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Subject:</p>
                <p className="font-medium">{selectedMessage.subject}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Message:</p>
                <div className="mt-1">
                  <CollapsibleMessageBody text={selectedMessage.body} maxLength={500} />
                </div>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>
                  {new Date(selectedMessage.sent_at).toLocaleString()}
                </span>
                {selectedMessage.read_at && isInSent(selectedMessage) && (
                  <span>Read: {new Date(selectedMessage.read_at).toLocaleString()}</span>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  variant="outline" 
                  className="text-red-500 border-red-200 hover:bg-red-50"
                  onClick={() => deleteMessage(selectedMessage.id)}
                >
                  Delete
                </Button>
                <Button variant="outline" onClick={() => setShowMessageModal(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Quizzes and Materials Section
const QuizzesMaterialsSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('quizzes');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [classroomOptions, setClassroomOptions] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState('all');
  const [quizModal, setQuizModal] = useState(false);
  const [materialModal, setMaterialModal] = useState(false);
  const [quizDetailsModal, setQuizDetailsModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizSubmissions, setQuizSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  
  // Form state for creating a new quiz
  const [quizForm, setQuizForm] = useState({
    title: '',
    classroom_id: '',
    due_date: '',
    is_form_quiz: false, // Always create MCQ quizzes
    questions: [{ question: '', options: ['', '', '', ''], correctOption: 0 }]
  });
  
  // Form state for creating a new material
  const [materialForm, setMaterialForm] = useState({
    title: '',
    description: '', // This field exists in materials form
    classroom_id: '',
    type: 'document', // 'document', 'image', 'video', etc.
    file: null
  });

  // Fetch classrooms, quizzes, and materials on component mount
  useEffect(() => {
    if (!user?.id) return;
    
    fetchData();
    
      // No debugging code needed
    
    // No additional setup needed
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch classrooms assigned to this teacher
      const { data: classroomsData, error: classroomsError } = await supabase
        .from('classrooms')
        .select('id, name')
        .or(`class_teacher_id.eq.${user.id},teachers.cs.{${user.id}}`)
        .eq('active', true)
        .order('name');
        
      if (classroomsError) throw classroomsError;
      
      setClassroomOptions([
        { id: 'all', name: 'All Classrooms' },
        ...(classroomsData || [])
      ]);
      
      if (!classroomsData || classroomsData.length === 0) {
        setQuizzes([]);
        setMaterials([]);
        setLoading(false);
        return;
      }
      
      const classIds = classroomsData.map(c => c.id);
      
      // Fetch quizzes
      const { data: quizzesData, error: quizzesError } = await supabase
        .from('quizzes')
        .select(`
          id,
          title,
          created_at,
          is_form_quiz,
          is_active,
          due_date,
          classroom_id,
          teacher_id,
          classrooms(name)
        `)
        .eq('teacher_id', user.id)
        .in('classroom_id', classIds)
        .order('created_at', { ascending: false });
        
      if (quizzesError) throw quizzesError;
      
      // Fetch materials
      const { data: materialsData, error: materialsError } = await supabase
        .from('materials')
        .select(`
          id,
          title,
          description,
          created_at,
          type,
          is_active,
          classroom_id,
          teacher_id,
          file_url,
          classrooms(name)
        `)
        .eq('teacher_id', user.id)
        .in('classroom_id', classIds)
        .order('created_at', { ascending: false });
        
      if (materialsError) throw materialsError;
      
      setQuizzes(quizzesData || []);
      setMaterials(materialsData || []);
    } catch (err) {
      console.error('Error fetching learning resources:', err);
      setError('Failed to load resources. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load resources",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new quiz
  const createQuiz = async (e) => {
    e.preventDefault();
    
    if (!quizForm.classroom_id || !quizForm.title) {
      toast({
        title: "Error",
        description: "Please select a classroom and provide a title",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare quiz data with questions directly in the quiz record
      const questions = quizForm.questions.map(q => ({
        text: q.question,
        options: q.options,
        correctOption: q.correctOption
      }));
      
      const quizData = {
        title: quizForm.title,
        classroom_id: quizForm.classroom_id,
        teacher_id: user.id,
        is_form_quiz: quizForm.is_form_quiz,
        is_active: true,
        due_date: quizForm.due_date || null,
        created_at: new Date().toISOString(),
        questions: questions // Store the questions directly in the quizzes table
      };
      
      // Insert quiz record
      const { data: quizResult, error: quizError } = await supabase
        .from('quizzes')
        .insert(quizData)
        .select();
        
      if (quizError) throw quizError;
      
      // Clear form and refresh data
      setQuizForm({
        title: '',
        classroom_id: '',
        due_date: '',
        is_form_quiz: false,
        questions: [{ question: '', options: ['', '', '', ''], correctOption: 0 }]
      });
      
      setQuizModal(false);
      fetchData();
      
      toast({
        title: "Success",
        description: "Quiz created successfully",
      });
    } catch (err) {
      console.error('Error creating quiz:', err);
      toast({
        title: "Error",
        description: "Failed to create quiz",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new material
  const createMaterial = async (e) => {
    e.preventDefault();
    
    if (!materialForm.classroom_id || !materialForm.title || !materialForm.file) {
      toast({
        title: "Error",
        description: "Please select a classroom, provide a title and upload a file",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Starting material creation...");
      
      // Prepare file for upload
      const file = materialForm.file;
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      
      console.log(`Attempting upload to "materials" bucket with file name: ${fileName}`);
      
      // Upload directly to the materials bucket - we know it exists but is private
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('materials')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }
      
      console.log("Upload successful:", uploadData);
      
      // Get signed URL since the bucket is private
      const { data: signedData } = await supabase.storage
        .from('materials')
        .createSignedUrl(fileName, 60 * 60 * 24 * 7); // 7 days expiry
      
      let fileUrl = '';
      
      if (signedData?.signedUrl) {
        fileUrl = signedData.signedUrl;
        console.log("Generated signed URL:", fileUrl);
      } else {
        // Fallback to try getting a download URL
        const { data: urlData } = await supabase.storage
          .from('materials')
          .getPublicUrl(fileName);
          
        fileUrl = urlData?.publicUrl || '';
        console.log("Fallback to public URL:", fileUrl);
      }
      
      // Insert material record
      const { data: materialResult, error: materialError } = await supabase
        .from('materials')
        .insert({
          title: materialForm.title,
          description: materialForm.description,
          classroom_id: materialForm.classroom_id,
          teacher_id: user.id,
          type: materialForm.type,
          file_url: fileUrl,
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select();
        
      if (materialError) throw materialError;
      
      console.log("Material created successfully:", materialResult);
      
      // Clear form and refresh data
      setMaterialForm({
        title: '',
        description: '',
        classroom_id: '',
        type: 'document',
        file: null
      });
      
      setMaterialModal(false);
      fetchData();
      
      toast({
        title: "Success",
        description: "Material added successfully with file"
      });
    } catch (err) {
      console.error('Error creating material:', err);
      toast({
        title: "Error",
        description: "Failed to add material: " + (err.message || "Unknown error"),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add a question to the quiz form
  const addQuestion = () => {
    setQuizForm(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        { question: '', options: ['', '', '', ''], correctOption: 0 }
      ]
    }));
  };

  // Handle question form changes
  const handleQuestionChange = (index, field, value, optionIndex = null) => {
    setQuizForm(prev => {
      const newQuestions = [...prev.questions];
      
      if (field === 'option' && optionIndex !== null) {
        newQuestions[index].options[optionIndex] = value;
      } else if (field === 'correctOption') {
        newQuestions[index].correctOption = value;
      } else {
        newQuestions[index][field] = value;
      }
      
      return { ...prev, questions: newQuestions };
    });
  };
  
  // Handle file input change for materials
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 10MB",
          variant: "destructive"
        });
        return;
      }
      
      setMaterialForm(prev => ({ ...prev, file }));
    }
  };
  
  // View quiz details and submissions
  const viewQuizDetails = async (quiz) => {
    setSelectedQuiz(quiz);
    setLoadingSubmissions(true);
    setQuizSubmissions([]);
    
    try {
      // Fetch submissions for this quiz
      const { data, error } = await supabase
        .from('quiz_submissions')
        .select(`
          id,
          score,
          status,
          is_graded,
          submitted_at,
          student_id,
          students(name, email)
        `)
        .eq('quiz_id', quiz.id);
        
      if (error) throw error;
      
      setQuizSubmissions(data || []);
      setQuizDetailsModal(true);
    } catch (err) {
      console.error('Error fetching quiz submissions:', err);
      toast({
        title: "Error",
        description: "Failed to load quiz submissions",
        variant: "destructive"
      });
    } finally {
      setLoadingSubmissions(false);
    }
  };
  
  // Toggle active status of a resource
  const toggleResourceStatus = async (resource, type) => {
    try {
      const { error } = await supabase
        .from(type === 'quiz' ? 'quizzes' : 'materials')
        .update({ is_active: !resource.is_active })
        .eq('id', resource.id);
        
      if (error) throw error;
      
      // Update local state
      if (type === 'quiz') {
        setQuizzes(prev => 
          prev.map(q => q.id === resource.id ? { ...q, is_active: !resource.is_active } : q)
        );
      } else {
        setMaterials(prev => 
          prev.map(m => m.id === resource.id ? { ...m, is_active: !resource.is_active } : m)
        );
      }
      
      toast({
        title: "Success",
        description: `${type === 'quiz' ? 'Quiz' : 'Material'} ${resource.is_active ? 'disabled' : 'enabled'} successfully`,
      });
    } catch (err) {
      console.error(`Error toggling ${type} status:`, err);
      toast({
        title: "Error",
        description: `Failed to update ${type} status`,
        variant: "destructive"
      });
    }
  };
  
  // Delete a resource (quiz or material)
  const deleteResource = async (resource, type) => {
    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from(type === 'quiz' ? 'quizzes' : 'materials')
        .delete()
        .eq('id', resource.id);
        
      if (error) throw error;
      
      // Update local state
      if (type === 'quiz') {
        setQuizzes(prev => prev.filter(q => q.id !== resource.id));
      } else {
        setMaterials(prev => prev.filter(m => m.id !== resource.id));
      }
      
      toast({
        title: "Success",
        description: `${type === 'quiz' ? 'Quiz' : 'Material'} deleted successfully`,
      });
    } catch (err) {
      console.error(`Error deleting ${type}:`, err);
      toast({
        title: "Error",
        description: `Failed to delete ${type}`,
        variant: "destructive"
      });
    }
  };
  
  // Group items by date
  const groupItemsByDate = (items) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return {
      today: items.filter(item => new Date(item.created_at) >= today),
      thisWeek: items.filter(item => 
        new Date(item.created_at) >= weekAgo && 
        new Date(item.created_at) < today
      ),
      older: items.filter(item => new Date(item.created_at) < weekAgo)
    };
  };
  
  // Filter resources by selected classroom
  const filteredQuizzes = selectedClassroom === 'all' 
    ? quizzes 
    : quizzes.filter(q => q.classroom_id === selectedClassroom);
    
  const filteredMaterials = selectedClassroom === 'all'
    ? materials
    : materials.filter(m => m.classroom_id === selectedClassroom);
    
  // Group by date
  const groupedQuizzes = groupItemsByDate(filteredQuizzes);
  const groupedMaterials = groupItemsByDate(filteredMaterials);
  
  // Render resource card
  const renderResourceCard = (item, type) => (
    <div 
      key={item.id} 
      className={`bg-white rounded-xl shadow p-4 transition-all ${!item.is_active ? 'opacity-60' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-siksha-purple">{item.title}</h4>
        <div className="flex gap-2">
          <Button 
            onClick={() => type === 'quiz' ? viewQuizDetails(item) : window.open(item.file_url, '_blank')} 
            size="sm" 
            className="bg-siksha-purple text-white"
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
          <Button 
            onClick={() => deleteResource(item, type)}
            size="sm" 
            className="bg-red-500 text-white hover:bg-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="text-xs text-gray-500 mb-2">
        {item.classrooms?.name && `Class: ${item.classrooms.name}`}
      </div>
      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.description}</p>
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>
        {type === 'quiz' && item.due_date && (
          <span className="text-amber-600">Due: {new Date(item.due_date).toLocaleDateString()}</span>
        )}
        <div className="flex items-center">
          <label className="inline-flex items-center cursor-pointer">
            <span className={`mr-1 ${item.is_active ? 'text-green-500' : 'text-red-500'}`}>
              {item.is_active ? 'Active' : 'Inactive'}
            </span>
            <input
              type="checkbox"
              className="sr-only"
              checked={item.is_active}
              onChange={() => toggleResourceStatus(item, type)}
            />
            <span className={`w-9 h-5 bg-gray-200 rounded-full transition-all ${item.is_active ? 'bg-green-200' : 'bg-red-200'}`}>
              <span 
                className={`block w-4 h-4 mt-0.5 ml-0.5 rounded-full transition-all ${item.is_active ? 'bg-green-500 translate-x-4' : 'bg-red-500'}`}
              />
            </span>
          </label>
        </div>
      </div>
    </div>
  );
  
  // Render section with date grouping
  const renderDateSection = (title, items, type) => {
    if (items.length === 0) return null;
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-medium text-siksha-purple mb-3">{title}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => renderResourceCard(item, type))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header with action buttons */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-siksha-purple">Learning Resources</h2>
        <div className="flex gap-2">
          <Button 
            className="bg-siksha-purple text-white"
            onClick={() => activeTab === 'quizzes' ? setQuizModal(true) : setMaterialModal(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Create {activeTab === 'quizzes' ? 'Quiz' : 'Material'}
          </Button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mb-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
              <TabsTrigger value="materials">Learning Materials</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
          
          {/* Filter by classroom */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <select 
                className="rounded-xl border border-gray-200 px-3 py-2 bg-white text-siksha-purple focus:outline-none"
                value={selectedClassroom}
                onChange={(e) => setSelectedClassroom(e.target.value)}
              >
                {classroomOptions.map(classroom => (
                  <option key={classroom.id} value={classroom.id}>{classroom.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Contents */}
          <TabsContent value="quizzes" className="space-y-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-siksha-purple border-t-transparent rounded-full"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-8">{error}</div>
            ) : filteredQuizzes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No quizzes found. Create your first quiz!
              </div>
            ) : (
              <>
                {renderDateSection('Today', groupedQuizzes.today, 'quiz')}
                {renderDateSection('This Week', groupedQuizzes.thisWeek, 'quiz')}
                {renderDateSection('Older', groupedQuizzes.older, 'quiz')}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="materials" className="space-y-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-siksha-purple border-t-transparent rounded-full"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-8">{error}</div>
            ) : filteredMaterials.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No materials found. Upload your first material!
              </div>
            ) : (
              <>
                {renderDateSection('Today', groupedMaterials.today, 'material')}
                {renderDateSection('This Week', groupedMaterials.thisWeek, 'material')}
                {renderDateSection('Older', groupedMaterials.older, 'material')}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-siksha-purple mb-6">Classroom Analytics</h2>
              <ClassroomAnalyticsComponent 
                isTeacher={true}
                userId={user.id}
                showClassroomSelector={true}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Create Quiz Modal */}
      <Dialog open={quizModal} onOpenChange={setQuizModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogTitle>Create New Quiz</DialogTitle>
          <DialogDescription className="sr-only">Create a new quiz</DialogDescription>
          
          <form onSubmit={createQuiz} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quiz-title">Quiz Title</Label>
                <Input 
                  id="quiz-title" 
                  value={quizForm.title} 
                  onChange={(e) => setQuizForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter quiz title" 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="quiz-classroom">Assign to Class</Label>
                <select 
                  id="quiz-classroom" 
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 bg-white text-siksha-purple focus:outline-none"
                  value={quizForm.classroom_id}
                  onChange={(e) => setQuizForm(prev => ({ ...prev, classroom_id: e.target.value }))}
                  required
                >
                  <option value="">Select a classroom</option>
                  {classroomOptions.filter(c => c.id !== 'all').map(classroom => (
                    <option key={classroom.id} value={classroom.id}>{classroom.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Description removed as it doesn't exist in the database */}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quiz-due-date">Due Date (Optional)</Label>
                <Input 
                  id="quiz-due-date" 
                  type="date" 
                  value={quizForm.due_date}
                  onChange={(e) => setQuizForm(prev => ({ ...prev, due_date: e.target.value }))}
                />
              </div>
              {/* Quiz type selector removed - always MCQ */}
            </div>
            
                          <div className="border border-gray-200 rounded-md p-4 space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-siksha-purple">Quiz Questions</h4>
                  <Button 
                    type="button" 
                    onClick={addQuestion} 
                    className="bg-siksha-purple text-white"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Question
                  </Button>
                </div>
                
                {quizForm.questions.map((q, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4">
                    <div className="mb-4">
                      <Label htmlFor={`question-${index}`}>Question {index + 1}</Label>
                      <Input 
                        id={`question-${index}`} 
                        value={q.question}
                        onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                        placeholder="Enter your question" 
                        required 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Options</Label>
                      {q.options.map((option, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input 
                            type="radio"
                            name={`correct-${index}`}
                            checked={q.correctOption === optIdx}
                            onChange={() => handleQuestionChange(index, 'correctOption', optIdx)}
                            className="mr-2"
                          />
                          <Input 
                            value={option}
                            onChange={(e) => handleQuestionChange(index, 'option', e.target.value, optIdx)}
                            placeholder={`Option ${optIdx + 1}`} 
                            required 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setQuizModal(false)}>Cancel</Button>
              <Button type="submit" className="bg-siksha-purple text-white" disabled={loading}>
                {loading ? 'Creating...' : 'Create Quiz'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Create Material Modal */}
      <Dialog open={materialModal} onOpenChange={setMaterialModal}>
        <DialogContent className="max-w-md">
          <DialogTitle>Upload Learning Material</DialogTitle>
          <DialogDescription className="sr-only">Upload a new learning material</DialogDescription>
          
          <form onSubmit={createMaterial} className="space-y-4">
            <div>
              <Label htmlFor="material-title">Title</Label>
              <Input 
                id="material-title" 
                value={materialForm.title}
                onChange={(e) => setMaterialForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter material title" 
                required 
              />
            </div>
            
            <div>
              <Label htmlFor="material-classroom">Assign to Class</Label>
              <select 
                id="material-classroom" 
                className="w-full rounded-xl border border-gray-200 px-3 py-2 bg-white text-siksha-purple focus:outline-none"
                value={materialForm.classroom_id}
                onChange={(e) => setMaterialForm(prev => ({ ...prev, classroom_id: e.target.value }))}
                required
              >
                <option value="">Select a classroom</option>
                {classroomOptions.filter(c => c.id !== 'all').map(classroom => (
                  <option key={classroom.id} value={classroom.id}>{classroom.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="material-type">Type</Label>
              <select 
                id="material-type" 
                className="w-full rounded-xl border border-gray-200 px-3 py-2 bg-white text-siksha-purple focus:outline-none"
                value={materialForm.type}
                onChange={(e) => setMaterialForm(prev => ({ ...prev, type: e.target.value }))}
                required
              >
                <option value="document">Document</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="presentation">Presentation</option>
                <option value="worksheet">Worksheet</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="material-description">Description</Label>
              <textarea 
                id="material-description" 
                className="w-full min-h-[100px] rounded-md border border-gray-300 p-2"
                value={materialForm.description}
                onChange={(e) => setMaterialForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Material description"
              />
            </div>
            
            <div>
              <Label htmlFor="material-file">Upload File</Label>
              <div className="mt-1 flex items-center">
                <label 
                  htmlFor="material-file" 
                  className="bg-white border border-gray-300 rounded-md p-2 w-full cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-center justify-center">
                    <Paperclip className="w-5 h-5 mr-2 text-siksha-purple" />
                    <span className="text-gray-500">{materialForm.file ? materialForm.file.name : "Choose file"}</span>
                  </div>
                  <input 
                    id="material-file" 
                    type="file" 
                    onChange={handleFileChange} 
                    className="hidden" 
                    required={!materialForm.file}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">Max file size: 10MB</p>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setMaterialModal(false)}>Cancel</Button>
              <Button type="submit" className="bg-siksha-purple text-white" disabled={loading}>
                {loading ? 'Uploading...' : 'Upload Material'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Quiz Details Modal */}
      <Dialog open={quizDetailsModal} onOpenChange={setQuizDetailsModal}>
        <DialogContent className="max-w-3xl">
          <DialogTitle>{selectedQuiz?.title || 'Quiz Details'}</DialogTitle>
          <DialogDescription className="sr-only">Quiz details and submissions</DialogDescription>
          
          {selectedQuiz && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm text-gray-500">Class</h4>
                  <p className="font-medium">{selectedQuiz.classrooms?.name || 'Unknown Class'}</p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500">Due Date</h4>
                  <p className="font-medium">
                    {selectedQuiz.due_date 
                      ? new Date(selectedQuiz.due_date).toLocaleDateString() 
                      : 'No due date'}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm text-gray-500">Description</h4>
                <p>No description available</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-siksha-purple mb-2">Student Submissions</h4>
                {loadingSubmissions ? (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin h-6 w-6 border-4 border-siksha-purple border-t-transparent rounded-full"></div>
                  </div>
                ) : quizSubmissions.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">No submissions yet</div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {quizSubmissions.map(sub => (
                          <tr key={sub.id}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm font-medium">{sub.students?.name || 'Unknown Student'}</div>
                              <div className="text-xs text-gray-500">{sub.students?.email}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                sub.status === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : sub.status === 'started' 
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-blue-100 text-blue-800'
                              }`}>{sub.status}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              {sub.submitted_at ? new Date(sub.submitted_at).toLocaleString() : '-'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {sub.is_graded ? (
                                <span className="font-medium">{sub.score || 0}/100</span>
                              ) : (
                                <span className="text-amber-500 text-sm">Pending</span>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <Button size="sm" className="bg-siksha-purple text-white">View</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setQuizDetailsModal(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const AnalyticsSection = () => {
  const { user } = useAuth();
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [classrooms, setClassrooms] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchTeacherClassrooms = async () => {
      try {
        console.log('Fetching teacher classrooms for analytics...');
        const { data, error } = await supabase
          .from('classrooms')
          .select('id, name')
          .or(`class_teacher_id.eq.${user.id},teachers.cs.{${user.id}}`)
          .order('name');
          
        if (error) throw error;
        
        console.log('Teacher classrooms:', data);
        
        if (data && data.length > 0) {
          setClassrooms(data);
          
          // Check if 6A classroom exists and select it by default
          const classroomId6A = data.find(c => c.name === '6A')?.id;
          if (classroomId6A) {
            console.log('Found 6A classroom, selecting it by default:', classroomId6A);
            setSelectedClassroom(classroomId6A);
          } else {
            console.log('6A classroom not found, using first classroom:', data[0].id);
            setSelectedClassroom(data[0].id);
          }
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching classrooms:', err);
        setLoading(false);
      }
    };
    
    fetchTeacherClassrooms();
  }, [user?.id]);

  // Add handler for classroom selection change
  const handleClassroomChange = (e) => {
    const newClassroomId = e.target.value;
    console.log('Selected classroom changed to:', newClassroomId);
    setSelectedClassroom(newClassroomId);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-siksha-purple mb-4">Classroom Analytics</h3>
      
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-siksha-purple"></div>
        </div>
      ) : classrooms.length > 0 ? (
        <>
          <div className="bg-white rounded-xl p-4 shadow mb-6">
            <label className="block text-sm font-medium mb-2">Select Classroom:</label>
            <select 
              value={selectedClassroom}
              onChange={handleClassroomChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {classrooms.map(classroom => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.name}
                </option>
              ))}
            </select>
          </div>
          
          <ClassroomAnalyticsComponent
            isTeacher={true}
            userId={user.id}
            classroomId={selectedClassroom}
            showClassroomSelector={false}
          />
        </>
      ) : (
        <div className="bg-white rounded-xl p-6 shadow text-center">
          <p className="text-indigo-400">No classrooms found. Please create a classroom first.</p>
        </div>
      )}
    </div>
  );
};

const ProfileSection = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subjects: [],
    bio: '',
    profile_image_url: ''
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Fetch teacher profile data
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchTeacherProfile = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('teachers')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setForm({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            subjects: data.subjects || [],
            bio: data.bio || '',
            profile_image_url: data.profile_image_url || ''
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeacherProfile();
  }, [user]);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle subject selection
  const handleSubjectChange = (e) => {
    const value = e.target.value;
    setForm(prev => {
      if (e.target.checked) {
        return { ...prev, subjects: [...prev.subjects, value] };
      } else {
        return { ...prev, subjects: prev.subjects.filter(s => s !== value) };
      }
    });
  };
  
  // Handle profile image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image must be less than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please upload an image file",
          variant: "destructive"
        });
        return;
      }
      
      setProfileImage(file);
    }
  };
  
  // Save profile changes
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      let profile_image_url = form.profile_image_url;
      
      // Upload new profile image if selected
      if (profileImage) {
        const fileExt = profileImage.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase
          .storage
          .from('profile-images')
          .upload(fileName, profileImage, { upsert: true });
          
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase
          .storage
          .from('profile-images')
          .getPublicUrl(fileName);
          
        profile_image_url = urlData.publicUrl;
      }
      
      // Update teacher profile
      const { error: updateError } = await supabase
        .from('teachers')
        .update({
          name: form.name,
          phone: form.phone,
          subjects: form.subjects,
          bio: form.bio,
          profile_image_url
        })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      setForm(prev => ({
        ...prev,
        profile_image_url
      }));
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setProfileImage(null);
    }
  };
  
  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoadingPassword(true);
    setPasswordError('');
    
    // Validation
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError('New passwords do not match');
      setLoadingPassword(false);
      return;
    }
    
    // Check if new password is same as current
    if (passwordForm.new === passwordForm.current) {
      setPasswordError('New password must be different from the current password');
      setLoadingPassword(false);
      return;
    }
    
    try {
      // Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email, 
        password: passwordForm.current
      });
      
      if (signInError) {
        setPasswordError('Current password is incorrect');
        setLoadingPassword(false);
        return;
      }
      
      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.new
      });
      
      if (updateError) throw updateError;
      
      // Reset form
      setPasswordForm({
        current: '',
        new: '',
        confirm: ''
      });
      
      toast({
        title: "Success",
        description: "Password updated successfully",
      });
    } catch (err) {
      console.error('Error updating password:', err);
      setPasswordError('Failed to update password');
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive"
      });
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Picture Section */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
            <div className="relative">
              <img 
                src={form.profile_image_url || "/avatar.png"} 
                alt="Profile" 
                className="w-40 h-40 rounded-full object-cover border-4 border-indigo-100"
              />
              <label 
                htmlFor="profile-image" 
                className="absolute bottom-0 right-0 bg-siksha-purple text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </label>
              <input 
                id="profile-image" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload} 
              />
            </div>
            <h3 className="text-xl font-semibold mt-4">{form.name}</h3>
            <p className="text-gray-500 text-sm">{form.email}</p>

            {profileImage && (
              <div className="mt-4 text-sm text-indigo-600">
                New image selected: {profileImage.name}
              </div>
            )}

            <div className="mt-6 w-full">
              <Button 
                type="button" 
                className="w-full bg-red-500 hover:bg-red-600 text-white" 
                onClick={async () => { await logout(); navigate('/'); }}
              >
                <LogOut className="w-4 h-4 mr-2" /> Log out
              </Button>
            </div>
          </div>
        </div>
        
        {/* Profile Details Section */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-siksha-purple">Profile Details</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={form.name} 
                    onChange={handleInputChange} 
                    placeholder="Your Name" 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    name="email" 
                    value={form.email} 
                    disabled
                    placeholder="Your Email"
                  />
                  <p className="text-xs text-gray-500 mt-1">Contact admin to change email</p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  value={form.phone} 
                  onChange={handleInputChange} 
                  placeholder="Phone Number"
                />
              </div>
              
              <div>
                <Label className="mb-1 block">Subjects</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['Mathematics', 'Science', 'English', 'History', 'Geography', 'Arts', 'Physical Education', 'Computer Science'].map(subject => (
                    <div key={subject} className="flex items-center">
                      <input 
                        type="checkbox" 
                        id={`subject-${subject}`} 
                        value={subject}
                        checked={form.subjects.includes(subject)}
                        onChange={handleSubjectChange}
                        className="mr-2"
                      />
                      <label htmlFor={`subject-${subject}`} className="text-sm">{subject}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="bio">Bio</Label>
                <textarea 
                  id="bio" 
                  name="bio" 
                  value={form.bio} 
                  onChange={handleInputChange} 
                  placeholder="Tell us about yourself"
                  className="w-full min-h-[100px] rounded-md border border-gray-300 p-2"
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  className="bg-siksha-purple text-white" 
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
              
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
            </form>
          </div>
          
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-siksha-purple">Change Password</h3>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <Input 
                  id="current-password" 
                  type="password" 
                  value={passwordForm.current} 
                  onChange={e => setPasswordForm(prev => ({ ...prev, current: e.target.value }))}
                  placeholder="Enter current password" 
                  required 
                />
              </div>
              
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input 
                  id="new-password" 
                  type="password" 
                  value={passwordForm.new}
                  onChange={e => setPasswordForm(prev => ({ ...prev, new: e.target.value }))}
                  placeholder="Enter new password" 
                  required 
                />
              </div>
              
              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input 
                  id="confirm-password" 
                  type="password" 
                  value={passwordForm.confirm}
                  onChange={e => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
                  placeholder="Confirm new password" 
                  required 
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  className="bg-siksha-purple text-white" 
                  disabled={loadingPassword}
                >
                  {loadingPassword ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
              
              {passwordError && (
                <div className="text-red-500 text-sm">{passwordError}</div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const sectionContent = {
  Home: <HomeSection />,
  'My Classes': <MyClassesSection />,
  'Quizzes & Materials': <QuizzesMaterialsSection />,
  Messages: <MessagesSection />,
  Analytics: <AnalyticsSection />,
  Profile: <ProfileSection />,
};

const TeachersDashboard: React.FC = () => {
  const { user, isLoading, profileError } = useAuth();
  const [selected, setSelected] = useState('Home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || profileError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="mb-4">
          {profileError || "You do not have permission to view this page or your session has expired."}
        </p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/30 transition-opacity duration-200 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Mobile Sidebar Navigation */}
      <nav
        className={`fixed left-0 top-0 h-full w-64 bg-white/95 border-r border-indigo-100 shadow-lg flex flex-col py-4 px-4 gap-4 transform transition-transform duration-200 z-50 sm:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center gap-2 mb-6 justify-between">
          <span className="font-bold text-siksha-purple text-lg">Siksha AI</span>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="p-2 rounded-full hover:bg-indigo-50"
            aria-label="Close sidebar"
          >
            <svg className="w-6 h-6 text-siksha-purple" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`flex items-center gap-3 py-2 px-3 rounded-xl font-medium text-base transition-all w-full text-left ${selected === item.label ? 'bg-indigo-100 text-siksha-purple font-bold shadow' : 'text-siksha-purple hover:bg-indigo-50'}`}
            onClick={() => { setSelected(item.label); setSidebarOpen(false); }}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      
      {/* Desktop Sidebar */}
      <aside className="hidden sm:flex w-56 bg-white/80 border-r border-indigo-100 flex-col py-4 px-4 gap-4 shadow-lg z-20">
        <div className="flex items-center gap-2 mb-6">
          <span className="font-bold text-siksha-purple text-lg">Siksha AI</span>
        </div>
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`flex items-center gap-3 py-2 px-3 rounded-xl font-medium text-base transition-all ${selected === item.label ? 'bg-indigo-100 text-siksha-purple font-bold shadow' : 'text-siksha-purple hover:bg-indigo-50'}`}
            onClick={() => setSelected(item.label)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </aside>
      
      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="flex items-center justify-between px-4 py-3 bg-white/80 border-b border-indigo-100 shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-2">
            {/* Mobile menu button */}
            <button className="sm:hidden p-2 rounded-full hover:bg-indigo-50" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6 text-siksha-purple" />
            </button>
            <img src="/avatar.png" alt="Teacher Avatar" className="w-8 h-8 rounded-full bg-siksha-yellow" />
            <span className="font-bold text-siksha-purple text-lg">Ms. Priya Sharma</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 px-3 py-2 rounded-xl bg-siksha-purple text-white font-semibold">
              <Plus className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Create New</span>
            </button>
            <button className="ml-2 p-2 rounded-full bg-indigo-100 text-siksha-purple relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>
        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-6 overflow-y-auto">
          {sectionContent[selected]}
        </main>
      </div>
    </div>
  );
};

export default TeachersDashboard; 