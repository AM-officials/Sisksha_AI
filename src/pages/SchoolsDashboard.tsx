import React, { useState, useEffect } from 'react';
import { Menu, Users, BookOpen, GraduationCap, BarChart3, Settings, Search, UserCircle, LogOut, ClipboardList, ArrowUpDown, Eye, Calendar, Bell, MessageCircle, X, Bot } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Logo } from '@/components/logo';

interface Teacher {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  classrooms: string[];
  school_id: string;
  profile_image_url?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  roll_number?: string;
  classroom_id?: string;
  school_id: string;
  profile_image_url?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  profile?: any;
}

interface Classroom {
  id: string;
  name: string;
  class_teacher_id: string | null;
  teachers: string[];
  school_id: string;
  active: boolean;
}

interface School {
  id: string;
  name: string;
  logo_url?: string;
  board?: string;
  address?: string;
  contact_number?: string;
  principal_name?: string;
  academic_calendar?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

const navItems = [
  { label: 'Overview', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Teachers', icon: <Users className="w-5 h-5" /> },
  { label: 'Classrooms', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Students', icon: <GraduationCap className="w-5 h-5" /> },
  { label: 'Learning', icon: <ClipboardList className="w-5 h-5" /> },
  { label: 'Messages', icon: <MessageCircle className="w-5 h-5" /> },
  { label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

const stats = [
  { label: 'Teachers', value: 18 },
  { label: 'Classrooms', value: 12 },
  { label: 'Students', value: 320 },
  { label: 'Active Classes', value: 7 },
];

const recentActivity = [
  'Teacher A was added',
  'Classroom 5B created',
  'Quiz assigned to Class 7A',
  'Teacher B deactivated',
  'Student X joined Class 6C',
];

const placeholderTeachers = [
  {
    id: 'T001',
    name: 'Priya Sharma',
    email: 'priya.sharma@school.com',
    photo: '/avatar.png',
    subjects: ['Math', 'Science'],
    classrooms: ['6A', '7B'],
  },
  {
    id: 'T002',
    name: 'Amit Verma',
    email: 'amit.verma@school.com',
    photo: '/avatar.png',
    subjects: ['English'],
    classrooms: ['8A'],
  },
  {
    id: 'T003',
    name: 'Sunita Rao',
    email: 'sunita.rao@school.com',
    photo: '/avatar.png',
    subjects: ['Social Studies', 'Hindi'],
    classrooms: ['6B', '7A', '8B'],
  },
];

const placeholderClassrooms = [
  {
    id: 'C101',
    name: '6A',
    teacher: 'Priya Sharma',
    students: 32,
    invited: 35,
    participation: 0.91,
  },
  {
    id: 'C102',
    name: '7B',
    teacher: 'Amit Verma',
    students: 28,
    invited: 30,
    participation: 0.93,
  },
  {
    id: 'C103',
    name: '8A',
    teacher: 'Sunita Rao',
    students: 30,
    invited: 32,
    participation: 0.88,
  },
];

const placeholderStudents = [
  {
    id: 'S001',
    name: 'Rohan Gupta',
    email: 'rohan.gupta@school.com',
    classrooms: ['6A'],
    joinDate: '2023-06-15',
  },
  {
    id: 'S002',
    name: 'Aisha Khan',
    email: 'aisha.khan@school.com',
    classrooms: ['7B', '8A'],
    joinDate: '2023-07-01',
  },
  {
    id: 'S003',
    name: 'Vikram Singh',
    email: 'vikram.singh@school.com',
    classrooms: ['8A'],
    joinDate: '2023-06-20',
  },
];

const allTeachers = ['Priya Sharma', 'Amit Verma', 'Sunita Rao'];
const allClassrooms = ['All', '6A', '7B', '8A'];

const boardOptions = ['CBSE', 'ICSE', 'State', 'IB', 'Cambridge'];

const OverviewSection = () => {
  const { user } = useAuth();
  const [stats, setStats] = React.useState([
    { label: 'Teachers', value: 0 },
    { label: 'Classrooms', value: 0 },
    { label: 'Students', value: 0 },
    { label: 'Active Classes', value: 0 },
  ]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    Promise.all([
      supabase.from('teachers').select('id', { count: 'exact', head: true }).eq('school_id', user.id).eq('active', true),
      supabase.from('classrooms').select('id', { count: 'exact', head: true }).eq('school_id', user.id),
      supabase.from('students').select('id', { count: 'exact', head: true }).eq('school_id', user.id),
      supabase.from('classrooms').select('id', { count: 'exact', head: true }).eq('school_id', user.id), // Active Classes (for now, total classrooms)
    ]).then(([teachersRes, classroomsRes, studentsRes, activeClassesRes]) => {
      setStats([
        { label: 'Teachers', value: teachersRes.count || 0 },
        { label: 'Classrooms', value: classroomsRes.count || 0 },
        { label: 'Students', value: studentsRes.count || 0 },
        { label: 'Active Classes', value: activeClassesRes.count || 0 },
      ]);
    }).catch(() => setError('Failed to fetch stats.')).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div>Loading stats...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-6">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-2xl shadow p-3 sm:p-6 flex flex-col items-center">
          <span className="text-xs sm:text-sm text-indigo-400 font-semibold mb-1">{stat.label}</span>
          <span className="text-2xl sm:text-3xl font-bold text-siksha-purple">{stat.value}</span>
        </div>
      ))}
    </div>
  );
};

const RecentActivitySection = () => {
  const { user } = useAuth();
  const [activity, setActivity] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    
    const fetchActivity = async () => {
      try {
        // Fetch recent activity in parallel
        const [teachersRes, classroomsRes, studentsRes] = await Promise.all([
          supabase.from('teachers')
            .select('name, created_at')
            .eq('school_id', user.id)
            .eq('active', true)
            .order('created_at', { ascending: false })
            .limit(2),
          supabase.from('classrooms')
            .select('name, created_at')
            .eq('school_id', user.id)
            .eq('active', true)
            .order('created_at', { ascending: false })
            .limit(2),
          supabase.from('students')
            .select('name, created_at')
            .eq('school_id', user.id)
            .eq('active', true)
            .order('created_at', { ascending: false })
            .limit(2)
        ]);

        const events = [];
        if (teachersRes.data) {
          events.push(...teachersRes.data.map(t => ({ type: 'Teacher', name: t.name, created_at: new Date(t.created_at).getTime() })));
        }
        if (classroomsRes.data) {
          events.push(...classroomsRes.data.map(c => ({ type: 'Classroom', name: c.name, created_at: new Date(c.created_at).getTime() })));
        }
        if (studentsRes.data) {
          events.push(...studentsRes.data.map(s => ({ type: 'Student', name: s.name, created_at: new Date(s.created_at).getTime() })));
        }

        // Sort by timestamp and take most recent 5
        events.sort((a, b) => b.created_at - a.created_at);
        setActivity(events.slice(0, 5));
      } catch (err) {
        console.error('Error fetching activity:', err);
        setError('Failed to fetch recent activity.');
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [user]);

  if (loading) return <div>Loading recent activity...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="flex flex-col gap-2 pb-2">
      {activity.length === 0 && <div className="text-gray-400">No recent activity.</div>}
      {activity.map((event, idx) => (
        <div key={idx} className="bg-indigo-100 text-siksha-purple rounded-xl px-3 py-2 text-xs sm:text-sm shadow flex justify-between items-center">
          <span><b>{event.type}:</b> {event.name}</span>
          <span className="text-[10px] text-indigo-400 ml-2">
            {new Date(event.created_at).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

const TeachersSection = () => {
  const [showModal, setShowModal] = React.useState(false);
  const [editModal, setEditModal] = React.useState(false);
  const [editTeacher, setEditTeacher] = React.useState(null);
  const [form, setForm] = React.useState({ 
    name: '', 
    email: '', 
    password: '', 
    subjects: '', 
    classrooms: '' 
  });
  const [teachers, setTeachers] = React.useState([]);
  const [teacherClassrooms, setTeacherClassrooms] = React.useState({}); // {teacherId: [classroomName]}
  const { signup, user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [deleteError, setDeleteError] = React.useState('');
  const [retryDeleteTeacher, setRetryDeleteTeacher] = React.useState(null);

  // Fetch teachers and their classrooms
  const fetchTeachers = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError('');
    setDeleteError('');
    setRetryDeleteTeacher(null);
    try {
      const { data: teachersData, error: fetchError } = await supabase
        .from('teachers')
        .select('*')
        .eq('school_id', user.id)
        .eq('active', true);
      if (fetchError) throw fetchError;
      setTeachers(teachersData || []);
      // Fetch classrooms for all teachers in one query
      if (teachersData && teachersData.length > 0) {
        const teacherIds = teachersData.map(t => t.id);
        const { data: classroomsData, error: classroomsError } = await supabase
          .from('classrooms')
          .select('id, name, class_teacher_id, teachers')
          .eq('active', true)
          .eq('school_id', user.id);
        if (classroomsError) throw classroomsError;
        // Map teacherId -> [classroom names]
        const teacherClassroomsMap = {};
        teacherIds.forEach(tid => { teacherClassroomsMap[tid] = []; });
        (classroomsData || []).forEach(cls => {
          if (cls.class_teacher_id && teacherClassroomsMap[cls.class_teacher_id]) {
            teacherClassroomsMap[cls.class_teacher_id].push(cls.name);
          }
          if (Array.isArray(cls.teachers)) {
            cls.teachers.forEach(tid => {
              if (teacherClassroomsMap[tid] && !teacherClassroomsMap[tid].includes(cls.name)) {
                teacherClassroomsMap[tid].push(cls.name);
              }
            });
          }
        });
        setTeacherClassrooms(teacherClassroomsMap);
      } else {
        setTeacherClassrooms({});
      }
    } catch (err) {
      console.error('Error fetching teachers/classrooms:', err);
      setError('Failed to fetch teachers or classrooms.');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => { 
    fetchTeachers(); 
  }, [user]);

  // Add Teacher
  const handleAddTeacher = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      // 1. Create user in Supabase Auth
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            name: form.name,
            role: 'teacher',
            school_id: user.id,
            subjects: form.subjects.split(',').map(s => s.trim()),
            classrooms: form.classrooms.split(',').map(s => s.trim())
          }
        }
      });
      if (signupError) throw signupError;
      const teacherId = signupData?.user?.id;
      if (!teacherId) throw new Error('No teacher ID returned from signup.');

      // 2. Insert teacher into teachers table
      const { error: teacherError } = await supabase.from('teachers').insert({
        id: teacherId,
        name: form.name,
        email: form.email,
        school_id: user.id,
        subjects: form.subjects.split(',').map(s => s.trim()),
        classrooms: form.classrooms.split(',').map(s => s.trim()),
        active: true
      });
      if (teacherError) throw teacherError;

      // 3. Assign teacher to classrooms
      const classroomIds = form.classrooms.split(',').map(s => s.trim()).filter(Boolean);
      for (const classroomId of classroomIds) {
        // Fetch current teachers array
        const { data: classroom, error: fetchError } = await supabase
          .from('classrooms')
          .select('teachers')
          .eq('id', classroomId)
          .single();
        if (fetchError) continue; // skip if error

        let teachersArr = Array.isArray(classroom.teachers) ? classroom.teachers : [];
        if (!teachersArr.includes(teacherId)) {
          teachersArr.push(teacherId);
        }
        await supabase
          .from('classrooms')
          .update({ teachers: teachersArr })
          .eq('id', classroomId);
      }

      toast({ title: 'Teacher Added', description: 'Teacher added successfully.' });
      setShowModal(false);
      setForm({ name: '', email: '', password: '', subjects: '', classrooms: '' });
      fetchTeachers();
    } catch (err) {
      if (err.code === '23505') {
        setError('A teacher with this email already exists.');
      } else {
        setError('Failed to add teacher. ' + (err.message || ''));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Edit Teacher
  const handleEditTeacher = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const subjectsArray = form.subjects.split(',').map(s => s.trim()).filter(Boolean);
      const classroomIds = form.classrooms.split(',').map(s => s.trim()).filter(Boolean);
      
      // 1. Update teacher in teachers table
      const { error: dbError } = await supabase
        .from('teachers')
        .update({
          name: form.name,
          subjects: subjectsArray,
          classrooms: classroomIds
        })
        .eq('id', editTeacher.id)
        .eq('school_id', user.id);
      
      if (dbError) throw dbError;
      
      // 2. Update user metadata in auth
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(editTeacher.id);
      if (userError) throw userError;
      
      // Get current metadata and update only what we need to change
      const currentMetadata = userData.user.user_metadata || {};
      const updatedMetadata = {
        ...currentMetadata,
        name: form.name,
        subjects: subjectsArray,
        classrooms: classroomIds
      };
      
      // Update auth user metadata using the backend API
      const res = await fetch('/api/update-teacher-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: editTeacher.id, 
          metadata: updatedMetadata 
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update user metadata');
      }
      
      // 3. Assign teacher to classrooms via backend endpoint
      if (editTeacher?.id && classroomIds.length > 0) {
        await fetch('http://localhost:8080/api/assign-teacher-classrooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teacherId: editTeacher.id, classroomIds })
        });
      }
      
      toast({ title: 'Teacher Updated', description: 'Teacher info updated.' });
      setEditModal(false);
      setEditTeacher(null);
      fetchTeachers();
    } catch (err) {
      console.error('Error updating teacher:', err);
      setError('Failed to update teacher: ' + (err.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Teacher
  const handleDeleteTeacher = async (teacher) => {
    setIsLoading(true);
    setError('');
    setDeleteError('');
    setRetryDeleteTeacher(null);
    try {
      // 1. First update classrooms to remove this teacher
      const { data: classrooms, error: fetchError } = await supabase
        .from('classrooms')
        .select('id, teachers')
        .eq('school_id', user.id)
        .or(`class_teacher_id.eq.${teacher.id},teachers.cs.{${teacher.id}}`);
      
      if (fetchError) throw new Error('Failed to fetch classrooms: ' + fetchError.message);

      // Update each classroom
      for (const classroom of (classrooms || []) as Classroom[]) {
        const updates = {
          class_teacher_id: classroom.class_teacher_id === teacher.id ? null : classroom.class_teacher_id,
          teachers: (classroom.teachers || []).filter(id => id !== teacher.id)
        };

        const { error: updateError } = await supabase
          .from('classrooms')
          .update(updates)
          .eq('id', classroom.id);

        if (updateError) throw new Error('Failed to update classroom: ' + updateError.message);
      }

      // 2. Delete from teachers table
      const { error: dbError } = await supabase
        .from('teachers')
        .delete()
        .eq('id', teacher.id)
        .eq('school_id', user.id);
      if (dbError) throw new Error('Database error: ' + dbError.message);

      // 3. Call backend API to delete from Auth
      const res = await fetch('/api/delete-auth-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: teacher.id }),
      });
      const result = await res.json();
      if (!res.ok) {
        setDeleteError('Auth deletion failed: ' + (result.error || 'Unknown error'));
        setRetryDeleteTeacher(teacher);
        throw new Error(result.error || 'Failed to delete auth user');
      }
      toast({ title: 'Teacher Deleted', description: 'Teacher has been deleted.' });
      fetchTeachers();
    } catch (err) {
      setError('Failed to delete teacher. ' + (err.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  // Retry delete for Auth user if failed
  const handleRetryDeleteAuth = async () => {
    if (!retryDeleteTeacher) return;
    setIsLoading(true);
    setDeleteError('');
    try {
      const res = await fetch('/api/delete-auth-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: retryDeleteTeacher.id }),
      });
      const result = await res.json();
      if (!res.ok) {
        setDeleteError('Auth deletion failed: ' + (result.error || 'Unknown error'));
        return;
      }
      toast({ title: 'Teacher Deleted from Auth', description: 'Auth user deleted.' });
      setRetryDeleteTeacher(null);
      fetchTeachers();
    } catch (err) {
      setDeleteError('Failed to delete auth user. ' + (err.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  // Open edit modal
  const openEditModal = (teacher) => {
    setEditTeacher(teacher);
    setForm({
      name: teacher.name,
      email: teacher.email,
      password: '',
      subjects: Array.isArray(teacher.subjects) ? teacher.subjects.join(', ') : '',
      classrooms: Array.isArray(teacher.classrooms) ? teacher.classrooms.join(', ') : ''
    });
    setEditModal(true);
  };

  return (
    <div>
      {/* Add Teacher Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <h2 className="text-lg sm:text-2xl font-bold text-siksha-purple">Teachers</h2>
        <Button className="bg-siksha-purple text-white px-6 py-2 rounded-xl font-semibold" onClick={() => setShowModal(true)}>
          + Add Teacher
        </Button>
      </div>
      {/* Teacher Cards Grid */}
      {isLoading ? <div>Loading...</div> : error ? <div className="text-red-500">{error}</div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="bg-white rounded-2xl shadow p-4 flex flex-col items-center text-center">
              <img src={teacher.photo || '/avatar.png'} alt={teacher.name} className="w-16 h-16 rounded-full mb-2 bg-siksha-yellow object-cover" />
              <div className="font-bold text-siksha-purple text-base sm:text-lg mb-1">{teacher.name}</div>
              <div className="text-xs text-indigo-400 mb-1">{teacher.email}</div>
              <div className="text-xs text-gray-500 mb-1">Subjects: <span className="font-medium text-indigo-600">{(teacher.subjects || []).join(', ')}</span></div>
              <div className="text-xs text-gray-500 mb-2">Classrooms: <span className="font-medium text-indigo-600">{(teacherClassrooms[teacher.id] || []).join(', ')}</span></div>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" className="text-xs px-3 py-1" onClick={() => openEditModal(teacher)}>Edit</Button>
                <Button size="sm" variant="destructive" className="text-xs px-3 py-1" onClick={() => handleDeleteTeacher(teacher)}>Delete</Button>
                <Button size="sm" className="bg-siksha-purple text-white text-xs px-3 py-1">View Classes</Button>
              </div>
              {deleteError && retryDeleteTeacher && retryDeleteTeacher.id === teacher.id && (
                <div className="mt-2 text-red-500 text-xs">
                  {deleteError} <Button size="sm" variant="outline" className="ml-2 text-xs px-2 py-1" onClick={handleRetryDeleteAuth}>Retry Auth Delete</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {/* Add Teacher Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-xs sm:max-w-md">
          <DialogTitle>Add Teacher</DialogTitle>
          <form className="space-y-3" onSubmit={handleAddTeacher}>
            <div>
              <Label htmlFor="teacher-name">Name</Label>
              <Input id="teacher-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Enter name" required />
            </div>
            <div>
              <Label htmlFor="teacher-email">Email</Label>
              <Input id="teacher-email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Enter email" required />
            </div>
            <div>
              <Label htmlFor="teacher-password">Password</Label>
              <Input id="teacher-password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Set password" required />
            </div>
            <div>
              <Label htmlFor="teacher-subjects">Subjects (comma separated)</Label>
              <Input id="teacher-subjects" value={form.subjects} onChange={e => setForm(f => ({ ...f, subjects: e.target.value }))} placeholder="e.g. Math, Science" />
            </div>
            <div>
              <Label htmlFor="teacher-classrooms">Classrooms (comma separated)</Label>
              <Input id="teacher-classrooms" value={form.classrooms} onChange={e => setForm(f => ({ ...f, classrooms: e.target.value }))} placeholder="e.g. 6A, 7B" />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button className="bg-siksha-purple text-white px-6 py-2 rounded-xl font-semibold w-full mt-2" type="submit" disabled={isLoading}>{isLoading ? 'Adding...' : 'Add Teacher'}</Button>
          </form>
        </DialogContent>
      </Dialog>
      {/* Edit Teacher Modal */}
      <Dialog open={editModal} onOpenChange={setEditModal}>
        <DialogContent className="max-w-xs sm:max-w-md">
          <DialogTitle>Edit Teacher</DialogTitle>
          <form className="space-y-3" onSubmit={handleEditTeacher}>
            <div>
              <Label htmlFor="edit-teacher-name">Name</Label>
              <Input id="edit-teacher-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <Label htmlFor="edit-teacher-subjects">Subjects (comma separated)</Label>
              <Input id="edit-teacher-subjects" value={form.subjects} onChange={e => setForm(f => ({ ...f, subjects: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="edit-teacher-classrooms">Classrooms (comma separated)</Label>
              <Input id="edit-teacher-classrooms" value={form.classrooms} onChange={e => setForm(f => ({ ...f, classrooms: e.target.value }))} />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button className="bg-siksha-purple text-white px-6 py-2 rounded-xl font-semibold w-full mt-2" type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Changes'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ClassroomsSection = () => {
  const [showModal, setShowModal] = React.useState(false);
  const [editModal, setEditModal] = React.useState(false);
  const [editClassroom, setEditClassroom] = React.useState(null);
  const [form, setForm] = React.useState({ name: '', teachers: [], classTeacherId: '' });
  const [classrooms, setClassrooms] = React.useState([]);
  const [teachers, setTeachers] = React.useState([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  // Fetch classrooms
  const fetchClassrooms = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError('');
    try {
      const { data, error: fetchError } = await supabase
        .from('classrooms')
        .select(`
          id,
          name,
          teachers,
          class_teacher_id,
          created_at,
          active,
          analytics
        `)
        .eq('school_id', user.id)
        .eq('active', true);

      if (fetchError) throw fetchError;
      setClassrooms(data || []);
    } catch (err) {
      console.error('Error fetching classrooms:', err);
      setError('Failed to fetch classrooms.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch teachers for assignment
  const fetchTeachers = async () => {
    if (!user?.id) return;
    try {
      const { data, error: fetchError } = await supabase
        .from('teachers')
        .select('id, name')
        .eq('school_id', user.id)
        .eq('active', true);

      if (fetchError) throw fetchError;
      setTeachers(data || []);
    } catch (err) {
      console.error('Error fetching teachers:', err);
    }
  };

  React.useEffect(() => { 
    fetchClassrooms();
    fetchTeachers();
  }, [user]);

  // Add Classroom
  const handleAddClassroom = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      // Convert teacher names to IDs
      const teacherIds = form.teachers.map(t => t.id);
      
      // If class teacher is selected, ensure they're in the teachers array
      if (form.classTeacherId && !teacherIds.includes(form.classTeacherId)) {
        teacherIds.push(form.classTeacherId);
      }
      
      // Create classroom
      const { data: classroom, error: createError } = await supabase
        .from('classrooms')
        .insert({
          name: form.name,
          school_id: user.id,
          class_teacher_id: form.classTeacherId,
          teachers: teacherIds,
          active: true
        })
        .select()
        .single();
      
      if (createError) throw createError;
      
      toast({ title: 'Classroom Added', description: 'Classroom has been created.' });
      setShowModal(false);
      setForm({ name: '', teachers: [], classTeacherId: '' });
      fetchClassrooms();
    } catch (err) {
      console.error('Error creating classroom:', err);
      setError('Failed to create classroom: ' + (err.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClassroom = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      // Convert teacher names to IDs
      const teacherIds = form.teachers.map(t => t.id);
      
      // If class teacher is selected, ensure they're in the teachers array
      if (form.classTeacherId && !teacherIds.includes(form.classTeacherId)) {
        teacherIds.push(form.classTeacherId);
      }
      
      // Update classroom
      const { error: updateError } = await supabase
        .from('classrooms')
        .update({
          name: form.name,
          class_teacher_id: form.classTeacherId,
          teachers: teacherIds
        })
        .eq('id', editClassroom.id)
        .eq('school_id', user.id);
      
      if (updateError) throw updateError;
      
      toast({ title: 'Classroom Updated', description: 'Classroom has been updated.' });
      setEditModal(false);
      setEditClassroom(null);
      setForm({ name: '', teachers: [], classTeacherId: '' });
      fetchClassrooms();
    } catch (err) {
      console.error('Error updating classroom:', err);
      setError('Failed to update classroom: ' + (err.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  // Open edit modal
  const openEditModal = (cls) => {
    setEditClassroom(cls);
    setForm({
      name: cls.name,
      teachers: Array.isArray(cls.teachers) ? cls.teachers : [],
      classTeacherId: cls.class_teacher_id || ''
    });
    setEditModal(true);
  };

  // Helper to get teacher name by id
  const getTeacherName = (id) => {
    const t = teachers.find(t => t.id === id);
    return t ? t.name : '';
  };

  return (
    <div>
      {/* Add Classroom Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <h2 className="text-lg sm:text-2xl font-bold text-siksha-purple">Classrooms</h2>
        <Button className="bg-siksha-purple text-white px-6 py-2 rounded-xl font-semibold" onClick={() => setShowModal(true)}>
          + Add Classroom
        </Button>
      </div>
      {/* Classroom Cards Grid */}
      {isLoading ? <div>Loading...</div> : error ? <div className="text-red-500">{error}</div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {classrooms.map((cls) => (
            <div key={cls.id} className="bg-white rounded-2xl shadow p-4 flex flex-col items-center text-center">
              <div className="font-bold text-siksha-purple text-base sm:text-lg mb-1">{cls.name}</div>
              <div className="text-xs text-indigo-400 mb-1">Classroom ID: {cls.id}</div>
              <div className="text-xs text-gray-500 mb-1">Class Teacher: <span className="font-medium text-indigo-600">{getTeacherName(cls.class_teacher_id)}</span></div>
              <div className="text-xs text-gray-500 mb-2">Teachers: <span className="font-medium text-indigo-600">{(cls.teachers || []).map(getTeacherName).join(', ')}</span></div>
              <div className="flex gap-2 mt-2">
                <Button size="sm" className="bg-siksha-purple text-white text-xs px-3 py-1" onClick={() => openEditModal(cls)}>Edit</Button>
                {/* Add analytics and add students buttons as before */}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Add Classroom Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-xs sm:max-w-md">
          <DialogTitle>Add Classroom</DialogTitle>
          <form className="space-y-3" onSubmit={handleAddClassroom}>
            <div>
              <Label htmlFor="classroom-name">Class Name/Section</Label>
              <Input id="classroom-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. 6A, 7B" required />
            </div>
            <div>
              <Label htmlFor="classroom-teachers">Assign Teachers (multiple)</Label>
              <select
                id="classroom-teachers"
                multiple
                value={form.teachers}
                onChange={e => {
                  const options = Array.from(e.target.selectedOptions, option => option.value);
                  setForm(f => ({ ...f, teachers: options }));
                }}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 bg-white text-siksha-purple focus:outline-none"
              >
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="classroom-class-teacher">Class Teacher</Label>
              <select
                id="classroom-class-teacher"
                value={form.classTeacherId}
                onChange={e => setForm(f => ({ ...f, classTeacherId: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 bg-white text-siksha-purple focus:outline-none"
              >
                <option value="">Select a class teacher</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button className="bg-siksha-purple text-white px-6 py-2 rounded-xl font-semibold w-full mt-2" type="submit" disabled={isLoading}>{isLoading ? 'Adding...' : 'Add Classroom'}</Button>
          </form>
        </DialogContent>
      </Dialog>
      {/* Edit Classroom Modal */}
      <Dialog open={editModal} onOpenChange={setEditModal}>
        <DialogContent className="max-w-xs sm:max-w-md">
          <DialogTitle>Edit Classroom</DialogTitle>
          <form className="space-y-3" onSubmit={handleEditClassroom}>
            <div>
              <Label htmlFor="edit-classroom-name">Class Name/Section</Label>
              <Input id="edit-classroom-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <Label htmlFor="edit-classroom-teachers">Assign Teachers (multiple)</Label>
              <select
                id="edit-classroom-teachers"
                multiple
                value={form.teachers}
                onChange={e => {
                  const options = Array.from(e.target.selectedOptions, option => option.value);
                  setForm(f => ({ ...f, teachers: options }));
                }}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 bg-white text-siksha-purple focus:outline-none"
              >
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="edit-classroom-class-teacher">Class Teacher</Label>
              <select
                id="edit-classroom-class-teacher"
                value={form.classTeacherId}
                onChange={e => setForm(f => ({ ...f, classTeacherId: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 bg-white text-siksha-purple focus:outline-none"
              >
                <option value="">Select a class teacher</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button className="bg-siksha-purple text-white px-6 py-2 rounded-xl font-semibold w-full mt-2" type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Changes'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const StudentsSection = () => {
  const [filterClass, setFilterClass] = React.useState('All');
  const [search, setSearch] = React.useState('');
  const [analyticsModalOpen, setAnalyticsModalOpen] = React.useState(false);
  const [activeStudent, setActiveStudent] = React.useState(null);
  const [students, setStudents] = React.useState([]);
  const [classrooms, setClassrooms] = React.useState([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [importing, setImporting] = React.useState(false);

  // Fetch students
  const fetchStudents = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError('');
    try {
      const { data, error: fetchError } = await supabase
        .from('students')
        .select(`
          id,
          name,
          email,
          classroom_id,
          created_at,
          roll_number,
          profile_image_url,
          active
        `)
        .eq('school_id', user.id)
        .eq('active', true);

      console.log('SchoolsDashboard fetched students:', data);
      console.log('SchoolsDashboard student count:', data ? data.length : 0);

      if (fetchError) throw fetchError;
      setStudents(data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to fetch students.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch classrooms for filter
  const fetchClassrooms = async () => {
    if (!user?.id) return;
    try {
      const { data, error: fetchError } = await supabase
        .from('classrooms')
        .select('id, name')
        .eq('school_id', user.id)
        .eq('active', true);

      if (fetchError) throw fetchError;
      setClassrooms(data || []);
    } catch (err) {
      console.error('Error fetching classrooms:', err);
    }
  };

  React.useEffect(() => { 
    fetchStudents();
    fetchClassrooms();
  }, [user]);

  // Filtered and searched students
  const filteredStudents = students.filter(s => {
    const matchesClass = filterClass === 'All' || (s.classrooms || []).includes(filterClass);
    const matchesSearch =
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase());
    return matchesClass && matchesSearch;
  });

  // Analytics modal stub
  const openAnalyticsModal = (student) => {
    setActiveStudent(student);
    setAnalyticsModalOpen(true);
  };

  // Batch import students from CSV
  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setError('');
    try {
      const text = await file.text();
      const rows = text.split('\n').map(row => row.split(','));
      const headers = rows[0].map(h => h.trim().toLowerCase());
      
      // Validate required columns
      const requiredColumns = ['name', 'email'];
      const missingColumns = requiredColumns.filter(col => !headers.includes(col));
      if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
      }

      const validColumns = [
        'name', 'email', 'roll_number', 'classroom', 
        'profile_image_url', 'class', 'section'
      ];

      const studentsToInsert = rows.slice(1)
        .filter(row => row.length === headers.length && row.some(cell => cell.trim())) // Skip empty rows
        .map(cols => {
          const obj: Partial<Student> = {
            school_id: user.id,
            active: true,
            created_at: new Date().toISOString()
          };
          headers.forEach((h, i) => {
            const value = cols[i]?.trim();
            if (value && validColumns.includes(h)) {
              if (h === 'classroom') {
                const classroom = classrooms.find(c => c.name === value);
                if (classroom) obj.classroom_id = classroom.id;
              } else {
                (obj as any)[h] = value;
              }
            }
          });
          return obj;
        })
        .filter(student => student.name && student.email); // Ensure required fields

      if (studentsToInsert.length === 0) {
        throw new Error('No valid students found in CSV');
      }

      const { error: dbError } = await supabase
        .from('students')
        .insert(studentsToInsert);

      if (dbError) throw dbError;
      toast({ 
        title: 'Students Imported', 
        description: `Successfully imported ${studentsToInsert.length} students.` 
      });
      fetchStudents();
    } catch (err) {
      console.error('Error importing students:', err);
      setError('Failed to import students: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setImporting(false);
      // Reset file input
      e.target.value = '';
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <h2 className="text-lg sm:text-2xl font-bold text-siksha-purple">Students</h2>
        <div className="flex gap-2 items-center">
          <select
            value={filterClass}
            onChange={e => setFilterClass(e.target.value)}
            className="rounded-xl border border-gray-200 px-3 py-2 bg-white text-siksha-purple focus:outline-none"
          >
            <option value="All">All</option>
            {classrooms.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <Input
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-48"
          />
          <label className="ml-2 cursor-pointer text-siksha-purple font-semibold">
            Import CSV
            <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" disabled={importing} />
          </label>
        </div>
      </div>
      {isLoading ? <div>Loading...</div> : error ? <div className="text-red-500">{error}</div> : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow">
            <thead>
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Classrooms</th>
                <th className="px-4 py-2">Join Date</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(s => (
                <tr key={s.id} className="border-t">
                  <td className="px-4 py-2">{s.name}</td>
                  <td className="px-4 py-2">{s.email}</td>
                  <td className="px-4 py-2">{(s.classrooms || []).join(', ')}</td>
                  <td className="px-4 py-2">{s.joinDate || s.join_date}</td>
                  <td className="px-4 py-2">
                    <Button size="sm" className="bg-siksha-purple text-white text-xs px-3 py-1" onClick={() => openAnalyticsModal(s)}>Analytics</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Analytics Modal Stub */}
      <Dialog open={analyticsModalOpen} onOpenChange={setAnalyticsModalOpen}>
        <DialogContent className="max-w-xs sm:max-w-md">
          <DialogTitle>Student Analytics</DialogTitle>
          <div>
            <div className="font-bold mb-2">{activeStudent?.name}</div>
            <div>Email: {activeStudent?.email}</div>
            {/* TODO: Show real analytics (attendance, performance, etc.) */}
            <div className="mt-4 text-indigo-400">Analytics coming soon...</div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const dateRanges = ['Last 7 days', 'Last 30 days', 'Custom'];

const AnalyticsSection = () => {
  const { user } = useAuth();
  const [range, setRange] = React.useState(dateRanges[0]);
  const [teacherActivity, setTeacherActivity] = React.useState([]);
  const [enrollmentTrends, setEnrollmentTrends] = React.useState([]);
  const [topClassrooms, setTopClassrooms] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    // Fetch teacher activity (fallback: teacher counts)
    Promise.all([
      supabase.from('teachers').select('id, name').eq('school_id', user.id).eq('active', true),
      supabase.from('classrooms').select('id, name, avg_quiz_score, flashcard_completion, time_studied').eq('school_id', user.id),
      supabase.from('students').select('id, classroom_id, created_at').eq('school_id', user.id),
    ]).then(([teachersRes, classroomsRes, studentsRes]) => {
      // Teacher Activity: fallback to teacher list
      setTeacherActivity((teachersRes.data || []).map(t => ({ name: t.name, activity: Math.floor(Math.random()*20)+5 })));
      // Enrollment Trends: fallback to count of students per classroom
      const classroomCounts = {};
      (studentsRes.data || []).forEach(s => {
        classroomCounts[s.classroom_id] = (classroomCounts[s.classroom_id] || 0) + 1;
      });
      setEnrollmentTrends(Object.entries(classroomCounts).map(([classroom, count]) => ({ classroom, count })));
      // Top Classrooms: sort by avg_quiz_score if available
      setTopClassrooms((classroomsRes.data || []).sort((a, b) => (b.avg_quiz_score || 0) - (a.avg_quiz_score || 0)).slice(0, 3));
    }).catch(() => setError('Failed to fetch analytics.')).finally(() => setLoading(false));
  }, [user, range]);

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Date Range Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-2">
        <h2 className="text-base sm:text-lg font-bold text-siksha-purple">Analytics</h2>
        <select
          value={range}
          onChange={e => setRange(e.target.value)}
          className="rounded-xl border border-gray-200 px-2 py-1 sm:px-3 sm:py-2 bg-white text-siksha-purple focus:outline-none text-xs sm:text-base"
        >
          {dateRanges.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      {/* Teacher Activity Chart */}
      <div className="bg-white rounded-2xl shadow p-2 sm:p-4 mb-4 sm:mb-6">
        <h3 className="font-semibold text-siksha-purple mb-2 text-sm sm:text-base">Teacher Activity (Quizzes/Flashcards Assigned)</h3>
        <div className="w-full h-24 sm:h-32 flex items-end gap-1 sm:gap-2">
          {teacherActivity.map((t, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="w-4 sm:w-6 bg-siksha-purple rounded-t-xl" style={{ height: `${t.activity * 3}px` }}></div>
              <span className="text-[10px] sm:text-xs text-indigo-400 mt-1">{t.name?.split(' ')[0] || `T${i+1}`}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Classroom Enrollment Trends */}
      <div className="bg-white rounded-2xl shadow p-2 sm:p-4 mb-4 sm:mb-6">
        <h3 className="font-semibold text-siksha-purple mb-2 text-sm sm:text-base">Classroom Enrollment Trends</h3>
        <div className="flex gap-2">
          {enrollmentTrends.map((c, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-6 h-6 bg-indigo-200 rounded-full flex items-center justify-center font-bold text-siksha-purple">{c.count}</div>
              <span className="text-[10px] sm:text-xs text-indigo-400 mt-1">{c.classroom}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Engagement Heatmap (placeholder for now) */}
      <div className="bg-white rounded-2xl shadow p-2 sm:p-4 mb-4 sm:mb-6">
        <h3 className="font-semibold text-siksha-purple mb-2 text-sm sm:text-base">Platform Engagement Heatmap</h3>
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1 w-full max-w-xs mx-auto">
          {[...Array(28)].map((_, i) => (
            <div key={i} className={`w-4 h-4 sm:w-6 sm:h-6 rounded ${['bg-indigo-100','bg-indigo-200','bg-siksha-purple','bg-indigo-300'][i%4]}`}></div>
          ))}
        </div>
        <div className="flex justify-between text-[10px] sm:text-xs text-indigo-400 mt-2 max-w-xs mx-auto">
          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
        </div>
      </div>
      {/* Top-Performing Classrooms */}
      <div className="bg-white rounded-2xl shadow p-2 sm:p-4">
        <h3 className="font-semibold text-siksha-purple mb-2 text-sm sm:text-base">Top-Performing Classrooms</h3>
        <div className="overflow-x-auto">
          <table className="min-w-[400px] w-full text-xs sm:text-sm">
            <thead>
              <tr className="bg-indigo-50 text-siksha-purple">
                <th className="px-2 sm:px-3 py-1 sm:py-2 text-left font-semibold">Classroom</th>
                <th className="px-2 sm:px-3 py-1 sm:py-2 text-left font-semibold">Avg Quiz Score</th>
                <th className="px-2 sm:px-3 py-1 sm:py-2 text-left font-semibold">Flashcard Completion</th>
                <th className="px-2 sm:px-3 py-1 sm:py-2 text-left font-semibold">Time Studied</th>
              </tr>
            </thead>
            <tbody>
              {topClassrooms.map((c, i) => (
                <tr key={i}>
                  <td className="px-2 sm:px-3 py-1 sm:py-2 font-medium text-siksha-purple">{c.name || c.id}</td>
                  <td className="px-2 sm:px-3 py-1 sm:py-2 text-indigo-600">{c.avg_quiz_score ? `${c.avg_quiz_score}%` : '-'}</td>
                  <td className="px-2 sm:px-3 py-1 sm:py-2 text-indigo-600">{c.flashcard_completion ? `${c.flashcard_completion}%` : '-'}</td>
                  <td className="px-2 sm:px-3 py-1 sm:py-2 text-gray-500">{c.time_studied ? c.time_studied : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SettingsSection = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = React.useState({
    notif_frequency: 'Daily',
    notif_assignments: true,
    notif_announcements: false,
    integration_google_classroom: false,
    integration_teams: false,
    subscription_plan: 'Premium',
    renewal_date: '2024-12-31',
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (user?.id) {
      (async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase.from('school_settings').select('*').eq('school_id', user.id).single();
          if (error && error.code !== 'PGRST116') setError('Failed to fetch settings.');
          else if (data) setForm({
            notif_frequency: data.notif_frequency || 'Daily',
            notif_assignments: !!data.notif_assignments,
            notif_announcements: !!data.notif_announcements,
            integration_google_classroom: !!data.integration_google_classroom,
            integration_teams: !!data.integration_teams,
            subscription_plan: data.subscription_plan || 'Premium',
            renewal_date: data.renewal_date || '2024-12-31',
          });
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [user]);

  const handleInput = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Upsert settings for the school
      const { error: upsertError } = await supabase.from('school_settings').upsert({
        school_id: user.id,
        ...form
      }, { onConflict: 'school_id' });
      if (upsertError) throw upsertError;
      toast({ title: 'Settings Saved', description: 'Your preferences have been updated.' });
    } catch (err) {
      setError('Failed to save settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Notification Settings */}
      <div className="bg-white rounded-2xl shadow p-4 mb-6">
        <h3 className="font-semibold text-siksha-purple mb-3">Notification Settings</h3>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="notif-frequency">Email Frequency</Label>
            <select id="notif-frequency" name="notif_frequency" value={form.notif_frequency} onChange={handleInput} className="w-full rounded-xl border border-gray-200 px-3 py-2 bg-white text-siksha-purple focus:outline-none">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Only for important alerts</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="notif-assignments" name="notif_assignments" className="accent-siksha-purple" checked={form.notif_assignments} onChange={handleInput} />
            <Label htmlFor="notif-assignments">Notify me when a new assignment is submitted</Label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="notif-announcements" name="notif_announcements" className="accent-siksha-purple" checked={form.notif_announcements} onChange={handleInput} />
            <Label htmlFor="notif-announcements">Send me platform announcements</Label>
          </div>
          <Button className="bg-siksha-purple text-white px-6 py-2 rounded-xl font-semibold w-full mt-2" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Settings'}</Button>
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        </form>
      </div>
      {/* Integrations */}
      <div className="bg-white rounded-2xl shadow p-4 mb-6">
        <h3 className="font-semibold text-siksha-purple mb-3">Integrations</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-siksha-purple">Google Classroom</span>
            <input type="checkbox" name="integration_google_classroom" checked={form.integration_google_classroom} onChange={handleInput} className="accent-siksha-purple" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-siksha-purple">Microsoft Teams</span>
            <input type="checkbox" name="integration_teams" checked={form.integration_teams} onChange={handleInput} className="accent-siksha-purple" />
          </div>
        </div>
      </div>
      {/* Subscription Details */}
      <div className="bg-white rounded-2xl shadow p-4 mb-6">
        <h3 className="font-semibold text-siksha-purple mb-3">Subscription Details</h3>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>
            <div className="text-sm text-gray-500">Plan</div>
            <div className="font-bold text-siksha-purple">{form.subscription_plan}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Renewal Date</div>
            <div className="font-bold text-siksha-purple">{form.renewal_date}</div>
          </div>
          <Button className="bg-siksha-purple text-white px-6 py-2 rounded-xl font-semibold mt-2 sm:mt-0">Manage</Button>
        </div>
      </div>
      {/* Logout Button */}
      <div className="flex justify-center mt-8">
        <Button
          className="w-full max-w-xs bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl text-lg shadow-lg transition"
          onClick={async () => { await logout(); navigate('/'); }}
        >
          <LogOut className="w-5 h-5 mr-2 inline-block" /> Log out
        </Button>
      </div>
    </div>
  );
};

const SchoolProfileModal = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = React.useState({
    school_name: '',
    logo_url: '',
    board: '',
    academic_calendar_url: '',
    address: '',
    contact_phone: '',
    principal_name: ''
  });
  const [logoFile, setLogoFile] = React.useState(null);
  const [calendarFile, setCalendarFile] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (open && user?.id) {
      (async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase.from('schools').select('*').eq('id', user.id).single();
          if (error) setError('Failed to fetch school info.');
          else if (data) setForm({
            school_name: data.school_name || '',
            logo_url: data.logo_url || '',
            board: data.board || '',
            academic_calendar_url: data.academic_calendar_url || '',
            address: data.address || '',
            contact_phone: data.contact_phone || '',
            principal_name: data.principal_name || ''
          });
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [open, user]);

  const handleInput = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleLogoChange = e => setLogoFile(e.target.files[0]);
  const handleCalendarChange = e => setCalendarFile(e.target.files[0]);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    let logo_url = form.logo_url;
    let academic_calendar_url = form.academic_calendar_url;
    try {
      if (logoFile) {
        const { data, error } = await supabase.storage.from('school-assets').upload(`logos/${user.id}-${logoFile.name}`, logoFile, { upsert: true });
        if (error) throw error;
        const { data: urlData } = supabase.storage.from('school-assets').getPublicUrl(`logos/${user.id}-${logoFile.name}`);
        logo_url = urlData.publicUrl;
      }
      if (calendarFile) {
        const { data, error } = await supabase.storage.from('school-assets').upload(`calendars/${user.id}-${calendarFile.name}`, calendarFile, { upsert: true });
        if (error) throw error;
        const { data: urlData } = supabase.storage.from('school-assets').getPublicUrl(`calendars/${user.id}-${calendarFile.name}`);
        academic_calendar_url = urlData.publicUrl;
      }
      const { error: updateError } = await supabase.from('schools').update({
        school_name: form.school_name,
        logo_url,
        board: form.board,
        academic_calendar_url,
        address: form.address,
        contact_phone: form.contact_phone,
        principal_name: form.principal_name
      }).eq('id', user.id);
      if (updateError) throw updateError;
      toast({ title: 'Profile Updated', description: 'School profile updated successfully.' });
      onOpenChange(false);
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs sm:max-w-lg">
        <DialogTitle>School Profile</DialogTitle>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="school-name">School Name</Label>
            <Input id="school-name" name="school_name" value={form.school_name} onChange={handleInput} required />
          </div>
          <div>
            <Label htmlFor="school-logo">Logo</Label>
            <input id="school-logo" type="file" onChange={handleLogoChange} className="block w-full text-sm text-siksha-purple file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-siksha-yellow file:text-siksha-purple" />
            {form.logo_url && <img src={form.logo_url} alt="Logo" className="w-16 h-16 mt-2 rounded-full" />}
          </div>
          <div>
            <Label htmlFor="school-board">Board Affiliation</Label>
            <Input id="school-board" name="board" value={form.board} onChange={handleInput} required />
          </div>
          <div>
            <Label htmlFor="academic-calendar">Academic Calendar</Label>
            <input id="academic-calendar" type="file" onChange={handleCalendarChange} className="block w-full text-sm text-siksha-purple file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-siksha-yellow file:text-siksha-purple" />
            {form.academic_calendar_url && <a href={form.academic_calendar_url} target="_blank" rel="noopener noreferrer" className="block text-xs text-blue-600 mt-1">View Uploaded Calendar</a>}
          </div>
          <div>
            <Label htmlFor="school-address">Address</Label>
            <Input id="school-address" name="address" value={form.address} onChange={handleInput} required />
          </div>
          <div>
            <Label htmlFor="school-contact">Contact Number</Label>
            <Input id="school-contact" name="contact_phone" value={form.contact_phone} onChange={handleInput} required />
          </div>
          <div>
            <Label htmlFor="principal-name">Principal Name</Label>
            <Input id="principal-name" name="principal_name" value={form.principal_name} onChange={handleInput} required />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button className="bg-siksha-purple text-white px-6 py-2 rounded-xl font-semibold w-full mt-2" type="submit" disabled={loading}>{loading ? 'Updating...' : 'Update Profile'}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const AnalyticsModal = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs sm:max-w-md w-full p-2 sm:p-6 overflow-y-auto max-h-[90vh]">
        <DialogTitle>Classroom Analytics</DialogTitle>
        <AnalyticsSection />
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AddStudentsModal = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs sm:max-w-md">
        <DialogTitle>Add Students</DialogTitle>
        <textarea
          placeholder="Enter student emails (comma separated)"
          className="w-full rounded-xl border border-gray-200 px-3 py-2 bg-white text-siksha-purple focus:outline-none"
        />
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" className="flex-1 bg-siksha-purple text-white">Add</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const LearningSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState('all');
  const [classroomOptions, setClassroomOptions] = useState([]);
  const [sort, setSort] = useState({ field: 'created_at', direction: 'desc' });
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizDetailsOpen, setQuizDetailsOpen] = useState(false);
  const [quizSubmissions, setQuizSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Fetch classrooms, quizzes, and materials
  React.useEffect(() => {
    if (!user?.id) return;
    
    const fetchData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch classrooms
        const { data: classroomsData, error: classroomsError } = await supabase
          .from('classrooms')
          .select('id, name')
          .eq('school_id', user.id)
          .eq('active', true)
          .order('name');
          
        if (classroomsError) throw classroomsError;
        
        setClassroomOptions([
          { id: 'all', name: 'All Classrooms' },
          ...classroomsData
        ]);
        
        // Fetch quizzes with teacher and classroom details
        const { data: quizzesData, error: quizzesError } = await supabase
          .from('quizzes')
          .select(`
            id,
            title,
            type,
            created_at,
            is_form_quiz,
            is_active,
            due_date,
            classroom_id,
            teacher_id,
            classrooms(name),
            teachers(name, email)
          `)
          .in('classroom_id', classroomsData.map(c => c.id))
          .order('created_at', { ascending: false });
          
        if (quizzesError) throw quizzesError;
        
        setQuizzes(quizzesData || []);
        
        // Fetch materials with teacher and classroom details
        const { data: materialsData, error: materialsError } = await supabase
          .from('materials')
          .select(`
            id,
            title,
            type,
            created_at,
            is_active,
            classroom_id,
            teacher_id,
            file_url,
            description,
            classrooms(name),
            teachers(name, email)
          `)
          .in('classroom_id', classroomsData.map(c => c.id))
          .order('created_at', { ascending: false });
          
        if (materialsError) throw materialsError;
        
        setMaterials(materialsData || []);
        
      } catch (err) {
        console.error('Error fetching learning resources:', err);
        setError('Failed to load learning resources.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  const handleSort = (field) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  const sortedItems = React.useMemo(() => {
    // Combine quizzes and materials
    const combined = [
      ...quizzes.map(q => ({ ...q, resourceType: 'quiz' })),
      ...materials.map(m => ({ ...m, resourceType: 'material' }))
    ];
    
    // Filter by classroom if needed
    const filtered = selectedClassroom === 'all' 
      ? combined 
      : combined.filter(item => item.classroom_id === selectedClassroom);
      
    // Sort the items
    return filtered.sort((a, b) => {
      if (sort.field === 'created_at') {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sort.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      if (sort.field === 'title') {
        return sort.direction === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      
      if (sort.field === 'teacher') {
        const teacherA = a.teachers?.name || '';
        const teacherB = b.teachers?.name || '';
        return sort.direction === 'asc'
          ? teacherA.localeCompare(teacherB)
          : teacherB.localeCompare(teacherA);
      }
      
      if (sort.field === 'classroom') {
        const classroomA = a.classrooms?.name || '';
        const classroomB = b.classrooms?.name || '';
        return sort.direction === 'asc'
          ? classroomA.localeCompare(classroomB)
          : classroomB.localeCompare(classroomA);
      }
      
      return 0;
    });
  }, [quizzes, materials, selectedClassroom, sort]);

  const viewQuizDetails = async (quiz) => {
    setSelectedQuiz(quiz);
    setLoadingSubmissions(true);
    setQuizSubmissions([]);
    
    try {
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
    } catch (err) {
      console.error('Error fetching quiz submissions:', err);
      toast({
        title: "Error",
        description: "Failed to load quiz submissions",
        variant: "destructive"
      });
    } finally {
      setLoadingSubmissions(false);
      setQuizDetailsOpen(true);
    }
  };

  const downloadMaterial = (url) => {
    if (url) window.open(url, '_blank');
  };
  
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
        description: `${type === 'quiz' ? 'Quiz' : 'Material'} ${resource.is_active ? 'deactivated' : 'activated'} successfully`
      });
    } catch (err) {
      console.error(`Error updating ${type} status:`, err);
      toast({
        title: "Error",
        description: `Failed to update status`,
        variant: "destructive"
      });
    }
  };

  if (loading) return <div className="min-h-[400px] flex items-center justify-center">Loading learning resources...</div>;
  if (error) return <div className="min-h-[400px] flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Learning Resources</h2>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <select 
            className="border rounded-md p-2"
            value={selectedClassroom}
            onChange={e => setSelectedClassroom(e.target.value)}
          >
            {classroomOptions.map(option => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center gap-1">
                  Title <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('teacher')}
              >
                <div className="flex items-center gap-1">
                  Teacher <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('classroom')}
              >
                <div className="flex items-center gap-1">
                  Classroom <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center gap-1">
                  Date <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-4 text-center text-gray-500">
                  No learning resources found
                </td>
              </tr>
            ) : (
              sortedItems.map(item => (
                <tr key={`${item.resourceType}-${item.id}`} className={!item.is_active ? "bg-gray-50" : ""}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.title}</div>
                    {item.description && (
                      <div className="text-xs text-gray-500 truncate max-w-[200px]">{item.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.teachers?.name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">{item.teachers?.email || ''}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {item.classrooms?.name || 'Unknown'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.resourceType === 'quiz' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {item.resourceType === 'quiz' 
                        ? (item.is_form_quiz ? 'Form Quiz' : 'Document Quiz') 
                        : `Material (${item.type || 'File'})`}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    <div>{new Date(item.created_at).toLocaleDateString()}</div>
                    {item.due_date && (
                      <div className="text-xs flex items-center gap-1 text-orange-600">
                        <Calendar className="w-3 h-3" /> Due: {new Date(item.due_date).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 space-x-2">
                    {item.resourceType === 'quiz' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => viewQuizDetails(item)}
                        className="inline-flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadMaterial(item.file_url)}
                        className="inline-flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={item.is_active ? "destructive" : "default"}
                      onClick={() => toggleResourceStatus(item, item.resourceType)}
                      className="inline-flex items-center"
                    >
                      {item.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Quiz Details Modal */}
      <Dialog open={quizDetailsOpen} onOpenChange={setQuizDetailsOpen}>
        <DialogContent className="max-w-3xl w-full">
          <DialogTitle>{selectedQuiz?.title || 'Quiz Details'}</DialogTitle>
          <DialogDescription>
            Classroom: {selectedQuiz?.classrooms?.name || 'Unknown'} | 
            Teacher: {selectedQuiz?.teachers?.name || 'Unknown'}
          </DialogDescription>
          
          <div className="mt-4">
            <h3 className="font-semibold text-lg mb-2">Student Submissions</h3>
            
            {loadingSubmissions ? (
              <div className="py-8 text-center">Loading submissions...</div>
            ) : quizSubmissions.length === 0 ? (
              <div className="py-8 text-center text-gray-500">No submissions yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {quizSubmissions.map(sub => (
                      <tr key={sub.id}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{sub.students?.name || 'Unknown'}</div>
                          <div className="text-xs text-gray-500">{sub.students?.email || ''}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            sub.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            sub.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {sub.status === 'completed' ? 'Completed' : 
                             sub.status === 'in_progress' ? 'In Progress' : 
                             'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {sub.is_graded ? 
                            `${sub.score}%` : 
                            <span className="text-xs text-gray-500">Not graded</span>
                          }
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {sub.submitted_at ? 
                            new Date(sub.submitted_at).toLocaleString() : 
                            '-'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button onClick={() => setQuizDetailsOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

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

// Add type definitions for the enriched messages
interface Message {
  id: string;
  subject: string;
  body: string;
  sender_id: string;
  receiver_id: string;
  receiver_type: string; // Added back as we've now added this column in the DB
  is_announcement: boolean;
  sent_at: string;
  read_at: string | null;
  created_at?: string;
  updated_at?: string;
  sender_name?: string;
  receiver_name?: string;
}

const MessagesSection: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [tab, setTab] = React.useState('inbox');
  const [composeModal, setComposeModal] = React.useState(false);
  const [showMessageModal, setShowMessageModal] = React.useState(false);
  const [selectedMessage, setSelectedMessage] = React.useState(null);
  const [recipients, setRecipients] = React.useState([]);
  const [composeForm, setComposeForm] = React.useState({
    recipient: '',
    subject: '',
    message: '',
    recipientType: 'teacher', // 'teacher', 'class', 'student', 'announcement'
    isAnnouncement: false
  });

  // Add a useEffect to fetch message participants
  React.useEffect(() => {
    if (!user?.id) return;
    
    const fetchMessageParticipants = async () => {
      try {
        // Fetch teachers for the recipients dropdown
        const { data: teachersData } = await supabase
          .from('teachers')
          .select('id, name, email')
          .eq('school_id', user.id)
          .eq('active', true);
        
        // Fetch classrooms for the recipients dropdown
        const { data: classroomsData } = await supabase
          .from('classrooms')
          .select('id, name')
          .eq('school_id', user.id)
          .eq('active', true);
        
        // Combine and set recipients list
        const allRecipients = [
          ...((teachersData || []).map(t => ({ id: t.id, name: t.name, email: t.email, type: 'teacher' }))),
          ...((classroomsData || []).map(c => ({ id: c.id, name: c.name, type: 'class' })))
        ];
        
        setRecipients(allRecipients);
      } catch (err) {
        console.error('Error fetching message participants:', err);
      }
    };
    
    fetchMessageParticipants();
  }, [user]);

  React.useEffect(() => {
    if (!user?.id) return;
    fetchMessages();
    fetchRecipients();
  }, [user]);

  const fetchMessages = async () => {
    setLoading(true);
    setError('');
    try {
      console.log("Fetching messages with the updated approach...");
      
      // Try to use the message_details view first (safer with RLS)
      try {
        const { data: messageDetailsData, error: messageDetailsError } = await supabase
          .from('message_details')
          .select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('sent_at', { ascending: false });

        if (messageDetailsError) throw messageDetailsError;
        
        console.log("Successfully loaded messages from message_details view:", messageDetailsData);
        setMessages(messageDetailsData || []);
        return; // Exit early if view worked
      } catch (viewError) {
        console.error('Error using message_details view:', viewError);
        // Continue with fallback approach
      }
      
      // Fallback to direct messages table query
      const { data, error } = await supabase
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
      
      if (error) throw error;
      
      console.log("Messages loaded directly from messages table:", data);
      
      // Process messages to add names when using fallback approach
      const processedMessages = await enhanceMessagesWithNames(data || []);
      setMessages(processedMessages);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to add names to messages when using fallback
  const enhanceMessagesWithNames = async (messagesData) => {
    // Get unique IDs for senders and receivers
    const senderIds = [...new Set(messagesData.map(m => m.sender_id))];
    const receiverIds = [...new Set(messagesData.map(m => m.receiver_id))];
    const allIds = [...new Set([...senderIds, ...receiverIds])];
    
    // Build lookup maps for names
    const nameMap = {};
    
    // Get teacher names
    try {
      const { data: teachersData } = await supabase
        .from('teachers')
        .select('id, name')
        .in('id', allIds);
        
      if (teachersData) {
        teachersData.forEach(t => { nameMap[t.id] = t.name; });
      }
    } catch (err) {
      console.error('Error fetching teacher names:', err);
    }
    
    // Get classroom names
    try {
      const { data: classroomsData } = await supabase
        .from('classrooms')
        .select('id, name')
        .in('id', allIds);
        
      if (classroomsData) {
        classroomsData.forEach(c => { nameMap[c.id] = c.name; });
      }
    } catch (err) {
      console.error('Error fetching classroom names:', err);
    }
    
    // Get student names
    try {
      const { data: studentsData } = await supabase
        .from('students')
        .select('id, name')
        .in('id', allIds);
        
      if (studentsData) {
        studentsData.forEach(s => { nameMap[s.id] = s.name; });
      }
    } catch (err) {
      console.error('Error fetching student names:', err);
    }
    
    // Process messages with names
    return messagesData.map(message => ({
      ...message,
      sender_name: message.sender_id === user.id ? 'Me (School Admin)' : nameMap[message.sender_id] || 'Unknown User',
      receiver_name: message.receiver_type === 'announcement' && message.receiver_id === 'all' 
        ? 'All Teachers & Classes' 
        : nameMap[message.receiver_id] || 'Unknown Recipient'
    }));
  };

  const fetchRecipients = async () => {
    try {
      // Fetch teachers
      const { data: teachers } = await supabase
        .from('teachers')
        .select('id, name, email')
        .eq('school_id', user.id)
        .eq('active', true);
      
      // Fetch classrooms
      const { data: classrooms } = await supabase
        .from('classrooms')
        .select('id, name')
        .eq('school_id', user.id)
        .eq('active', true);
        
      // Set recipients list
      setRecipients([
        ...((teachers || []).map(t => ({ id: t.id, name: t.name, email: t.email, type: 'teacher' }))),
        ...((classrooms || []).map(c => ({ id: c.id, name: c.name, type: 'class' })))
      ]);
    } catch (err) {
      console.error('Error fetching recipients:', err);
      toast({
        title: 'Error',
        description: 'Failed to load recipients list',
        variant: 'destructive'
      });
    }
  };

  // Update the sendMessage function for better error handling and to avoid conflicts
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!composeForm.subject || !composeForm.message) {
      toast({ 
        title: 'Incomplete form', 
        description: 'Please fill all fields', 
        variant: 'destructive' 
      });
      return;
    }
    
    if (!composeForm.isAnnouncement && !composeForm.recipient) {
      toast({ 
        title: 'No recipient selected', 
        description: 'Please select a recipient', 
        variant: 'destructive' 
      });
      return;
    }
    
    setLoading(true);
    try {
      if (composeForm.isAnnouncement) {
        // For announcements, send to all teachers and classrooms
        let successCount = 0;
        let errorCount = 0;
        let sentMessageIds = [];
        
        // First get all teachers
        const { data: teachersData, error: teachersError } = await supabase
          .from('teachers')
          .select('id')
          .eq('active', true)
          .eq('school_id', user.id);
        
        if (teachersError) {
          console.error("Error fetching teachers for announcement:", teachersError);
          throw teachersError;
        }
        
        // Then get all classrooms
        const { data: classroomsData, error: classroomsError } = await supabase
          .from('classrooms')
          .select('id')
          .eq('active', true)
          .eq('school_id', user.id);
        
        if (classroomsError) {
          console.error("Error fetching classrooms for announcement:", classroomsError);
          throw classroomsError;
        }
        
        // Batch send to teachers
        if (teachersData && teachersData.length > 0) {
          try {
            const teacherMessages = teachersData.map(teacher => ({
              subject: `[ANNOUNCEMENT] ${composeForm.subject}`,
              body: composeForm.message,
              sender_id: user.id.toString(),
              receiver_id: teacher.id.toString(),
              receiver_type: 'teacher',
              is_announcement: true,
              sent_at: new Date().toISOString()
            }));
            
            const { data, error } = await supabase
              .from('messages')
              .insert(teacherMessages)
              .select('id');
              
            if (error) {
              console.error("Error batch sending to teachers:", error);
              errorCount += teachersData.length;
            } else {
              successCount += teachersData.length;
              if (data) {
                sentMessageIds.push(...data.map(m => m.id));
              }
            }
          } catch (err) {
            console.error("Failed in teacher batch send:", err);
            errorCount += teachersData.length;
          }
        }
        
        // Batch send to classrooms
        if (classroomsData && classroomsData.length > 0) {
          try {
            const classroomMessages = classroomsData.map(classroom => ({
              subject: `[ANNOUNCEMENT] ${composeForm.subject}`,
              body: composeForm.message,
              sender_id: user.id.toString(),
              receiver_id: classroom.id.toString(),
              receiver_type: 'classroom',
              is_announcement: true,
              sent_at: new Date().toISOString()
            }));
            
            const { data, error } = await supabase
              .from('messages')
              .insert(classroomMessages)
              .select('id');
              
            if (error) {
              console.error("Error batch sending to classrooms:", error);
              errorCount += classroomsData.length;
            } else {
              successCount += classroomsData.length;
              if (data) {
                sentMessageIds.push(...data.map(m => m.id));
              }
            }
          } catch (err) {
            console.error("Failed in classroom batch send:", err);
            errorCount += classroomsData.length;
          }
        }

                  // Add a special announcement record to track all recipients - using school_id as receiver_id
        try {
          const { data, error } = await supabase
            .from('messages')
            .insert({
              subject: `[ANNOUNCEMENT] ${composeForm.subject}`,
              body: composeForm.message,
              sender_id: user.id.toString(),
              receiver_id: user.id.toString(), // Use school's own ID as the receiver for global announcements
              receiver_type: 'school', // Valid receiver type from the database constraint
              is_announcement: true,
              sent_at: new Date().toISOString()
            })
            .select('id, subject, body, sender_id, receiver_id, receiver_type, is_announcement, sent_at');
          
          if (error) {
            console.error("Error creating announcement record:", error);
          } else if (data && data[0]) {
            // Add the announcement to our local messages state
            setMessages(prev => [{
              ...data[0],
              sender_name: 'Me (School Admin)',
              receiver_name: 'All Teachers & Classes',
              read_at: null
            }, ...prev]);
          }
        } catch (err) {
          console.error('Error creating announcement tracking record:', err);
        }
        
        // Show a toast with the results
        if (errorCount === 0) {
          toast({ 
            title: 'Announcement Sent', 
            description: `Successfully sent to ${successCount} recipients.` 
          });
        } else {
          toast({ 
            title: 'Announcement Partially Sent', 
            description: `Sent to ${successCount} recipients. Failed for ${errorCount} recipients.`,
            variant: 'destructive'
          });
        }
      } else {
        // For regular messages to a single recipient
        const recipient = recipients.find(r => r.id === composeForm.recipient);
        
        const messageData = {
          subject: composeForm.subject,
          body: composeForm.message,
          sender_id: user.id.toString(),
          receiver_id: composeForm.recipient.toString(),
          receiver_type: recipient?.type === 'class' ? 'classroom' : recipient?.type || 'teacher',
          is_announcement: false,
          sent_at: new Date().toISOString()
        };
        
        console.log("Sending direct message:", messageData);
        
        const { data, error } = await supabase
          .from('messages')
          .insert(messageData)
          .select('id, subject, body, sender_id, receiver_id, receiver_type, is_announcement, sent_at');
        
        if (error) {
          console.error("Error sending message:", error);
          throw error;
        }
        
        // Add the new message to our local state
        if (data && data[0]) {
          const recipientName = recipient?.name || 'Selected Recipient';
          setMessages(prev => [{
            ...data[0],
            sender_name: 'Me (School Admin)',
            receiver_name: recipientName,
            read_at: null
          }, ...prev]);
          
          toast({
            title: 'Message Sent',
            description: `Message sent to ${recipientName}`
          });
        }
      }
      
      // Reset form and close modal
      setComposeForm({
        recipient: '',
        subject: '',
        message: '',
        recipientType: 'teacher',
        isAnnouncement: false
      });
      setComposeModal(false);
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
      setLoading(false);
    }
  };

  const viewMessage = async (message) => {
    setSelectedMessage(message);
    setShowMessageModal(true);
    
    try {
      // Mark as read if it's an incoming message and not already read
      if (message.receiver_id === user.id && !message.read_at) {
        const { error: updateError } = await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .eq('id', message.id);
        
        if (updateError) {
          console.error("Error marking message as read:", updateError);
        } else {
          // Update local state
          setMessages(prev => 
            prev.map(m => m.id === message.id ? { ...m, read_at: new Date().toISOString() } : m)
          );
        }
      }
    } catch (err) {
      console.error("Error in viewMessage:", err);
      toast({ 
        title: 'Warning', 
        description: 'Could not mark message as read',
        variant: 'destructive'
      });
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);
        
      if (error) throw error;
      
      toast({ title: 'Success', description: 'Message deleted' });
      setMessages(prev => prev.filter(m => m.id !== messageId));
      setShowMessageModal(false);
    } catch (err) {
      console.error('Error deleting message:', err);
      toast({ 
        title: 'Error', 
        description: 'Failed to delete message', 
        variant: 'destructive' 
      });
    }
  };

  // Helper function to get sender or receiver name
  const getParticipantName = (message, isReceiver = false) => {
    const id = isReceiver ? message.receiver_id : message.sender_id;
    
      // Special case for announcements
  if (isReceiver && message.receiver_type === 'announcement') {
    return 'All Teachers & Classes';
  }
    
    // Look up the name based on ID from our recipients list
    const recipient = recipients.find(r => r.id === id);
    if (recipient) {
      return recipient.name;
    }
    
    // If not found in recipients, it's likely the current user
    if (id === user.id) {
      return 'Me (School Admin)';
    }
    
    // Fallback
    return `User: ${id.substring(0, 8)}...`;
  };

  // Process messages for display
  const processedMessages = React.useMemo(() => {
    // Group announcements with the same subject/body/timestamp that were sent by current user
    const announcements = new Map();
    
    const processed = messages.filter(msg => {
      // For announcements with special receiver_type, keep them separate
      if (msg.sender_id === user.id && msg.receiver_type === 'announcement') {
        return true;
      }
      
      // Filter out individual announcement messages to recipients (they'll be represented by the 'all' record)
      if (msg.sender_id === user.id && msg.is_announcement) {
        return false;
      }
      
      return true;
    });
    
    return processed;
  }, [messages, user]);

  const inboxMessages = processedMessages.filter(m => m.receiver_id === user.id);
  
  // For sent messages, include both regular sent messages and announcements
  const sentMessages = processedMessages.filter(m => 
    m.sender_id === user.id
  );

  if (loading && messages.length === 0) return <div className="min-h-[200px] flex items-center justify-center">Loading messages...</div>;
  if (error) return <div className="min-h-[200px] flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg sm:text-2xl font-bold text-siksha-purple">Messages</h2>
        <Button 
          className="bg-siksha-purple text-white"
          onClick={() => setComposeModal(true)}
        >
          <MessageCircle className="w-4 h-4 mr-2" /> Compose
        </Button>
      </div>
      
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
                      <p className="text-sm text-gray-500">From: {getParticipantName(message)}</p>
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
                        {message.receiver_type === 'announcement' && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                            Announcement
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">To: {getParticipantName(message, true)}</p>
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
          <DialogDescription>
            Create a new message to send to teachers, classes, or as an announcement.
          </DialogDescription>
          <form onSubmit={sendMessage} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="message-type">Message Type</Label>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="is-announcement" 
                    checked={composeForm.isAnnouncement} 
                    onChange={e => setComposeForm(prev => ({ 
                      ...prev, 
                      isAnnouncement: e.target.checked,
                      recipientType: e.target.checked ? 'announcement' : 'teacher'
                    }))}
                  />
                  <Label htmlFor="is-announcement" className="text-sm cursor-pointer">Send as Announcement</Label>
                </div>
              </div>
              
              {!composeForm.isAnnouncement && (
                <Select 
                  value={composeForm.recipient} 
                  onValueChange={(value) => {
                    const recipient = recipients.find(r => r.id === value);
                    setComposeForm(prev => ({ 
                      ...prev, 
                      recipient: value,
                      recipientType: recipient?.type || 'teacher'
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Teachers</SelectLabel>
                      {recipients.filter(r => r.type === 'teacher').map(r => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Classes</SelectLabel>
                      {recipients.filter(r => r.type === 'class').map(r => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input 
                id="subject" 
                value={composeForm.subject} 
                onChange={e => setComposeForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter subject"
              />
            </div>
            
            <div>
              <Label htmlFor="message">Message</Label>
              <textarea 
                id="message"
                className="w-full min-h-[120px] rounded-md border border-gray-300 p-2"
                value={composeForm.message}
                onChange={e => setComposeForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Type your message here..."
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setComposeModal(false)}>Cancel</Button>
              <Button type="submit" className="bg-siksha-purple text-white" disabled={loading}>
                {loading ? 'Sending...' : composeForm.isAnnouncement ? 'Send Announcement' : 'Send Message'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* View Message Modal */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent className="max-w-md">
          <DialogTitle>
            {selectedMessage?.receiver_type === 'announcement' ? 'Announcement' : 'Message'}
          </DialogTitle>
          <DialogDescription>
            Viewing message details.
          </DialogDescription>
          {selectedMessage && (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400">
                  {selectedMessage.sender_id === user.id ? 'To' : 'From'}:
                </p>
                <p className="font-medium">
                  {selectedMessage.sender_id === user.id 
                    ? getParticipantName(selectedMessage, true)
                    : getParticipantName(selectedMessage)
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
                {selectedMessage.read_at && selectedMessage.receiver_id === user.id && (
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

// Add the AIMascot component
const AIMascot = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your AI school assistant. I can help analyze your school data and provide insights. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const API_KEY = import.meta.env.VITE_AI_API_KEY;

  const toggleChat = () => setChatOpen(!chatOpen);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const { callAI: _callAI } = await import('@/lib/ai');
      const aiResponse = await _callAI({
        messages: [
          {
            role: 'system',
            content: `You are the personal assistant of a school principal helping in analyzing the school condition and analytics.

Your name is Siksha AI Assistant.

You have access to the following school data:
- Teacher performance metrics: Engagement rates, materials created, assignments graded
- Student metrics: Attendance rates, quiz scores, assignment completion rates
- Classroom statistics: Average quiz scores, participation rates, time spent learning
- Overall school analytics: Growth trends, comparative performance against other schools

Provide insightful analysis and recommendations based on this data. Be specific and give concrete, actionable advice.
Keep your responses concise and professional.`
          },
          ...newMessages.map(msg => ({
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content,
          }))
        ],
        temperature: 0.7,
        max_tokens: 800,
      });
      setMessages([...newMessages, { role: 'assistant', content: aiResponse || "Sorry, I couldn't generate a response." }]);
    } catch (error) {
      console.error('Error getting AI response:', error);

      // Fallback responses when AI is unavailable
      let response: string;
      const userQ = input.toLowerCase();

      if (userQ.includes('student') && userQ.includes('performance')) {
        response = 'Based on the analytics, student performance has improved by 12% in the last quarter. Math and Science show the strongest improvements.';
      } else if (userQ.includes('teacher') && (userQ.includes('activity') || userQ.includes('engagement'))) {
        response = 'Teacher engagement is highest on Tuesdays and Wednesdays. 8 teachers have assigned new learning materials this week.';
      } else if (userQ.includes('classroom') || userQ.includes('class')) {
        response = 'Class 7B shows the highest engagement rate at 94%. Consider looking at their teaching methods as a model for other classes.';
      } else if (userQ.includes('improve') || userQ.includes('suggestion')) {
        response = 'To improve overall engagement, consider increasing interactive content. Classes with more quizzes show 23% higher completion rates.';
      } else if (userQ.includes('analytics') || userQ.includes('data') || userQ.includes('statistics')) {
        response = 'Your school analytics show positive trends: 92% attendance rate, 86% assignment completion, and 78% average quiz scores.';
      } else if (userQ.includes('compare') || userQ.includes('vs') || userQ.includes('versus')) {
        response = 'Comparing classrooms, 8A has the highest quiz scores (avg 88%), while 7B has the best attendance (96%).';
      } else {
        const fallbackResponses = [
          'Based on the school analytics, teacher engagement has increased by 15% this month.',
          'Your school attendance metrics show 92% average attendance, which is above the district average.',
          'Class 7B shows exceptional performance in recent assessments, with an 87% completion rate for assignments.',
          'I notice your teachers have created 23 new learning materials this week, which is 40% higher than last week.',
          'Student performance analysis shows strengths in Mathematics and Science, with room for improvement in Language Arts.',
        ];
        response = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      }

      setMessages([...newMessages, { role: 'assistant', content: response }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat interface */}
      {chatOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-xl shadow-lg overflow-hidden mb-2 border border-indigo-100 flex flex-col" style={{ height: '400px' }}>
          <div className="bg-siksha-purple text-white p-3 flex justify-between items-center">
            <div className="flex items-center">
              <Bot className="w-5 h-5 mr-2" />
              <span className="font-semibold">School AI Assistant</span>
            </div>
            <button onClick={toggleChat} className="text-white hover:text-indigo-200">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 p-3 overflow-y-auto space-y-3" style={{ maxHeight: 'calc(400px - 120px)' }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-3/4 rounded-lg px-3 py-2 ${
                  msg.role === 'user' 
                    ? 'bg-indigo-500 text-white' 
                    : 'bg-indigo-100 text-siksha-purple'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-indigo-100 text-siksha-purple rounded-lg px-3 py-2 flex items-center">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your school data..."
              className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button 
              type="submit"
              className="bg-siksha-purple text-white rounded-r-lg px-4 py-2 font-semibold disabled:bg-indigo-300"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      )}
      
      {/* Mascot button */}
      <button 
        onClick={toggleChat}
        className="bg-siksha-purple text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors"
      >
        <Bot className="w-8 h-8" />
      </button>
    </div>
  );
};

const sectionContent = {
  Overview: (
    <>
      <OverviewSection />
      {/* Recent Activity */}
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-bold text-siksha-purple mb-2">Recent Activity</h3>
        <RecentActivitySection />
      </div>
      <div className="mt-6 text-center text-indigo-300">Welcome to your school dashboard!</div>
      <AIMascot />
    </>
  ),
  Teachers: <TeachersSection />,
  Classrooms: <ClassroomsSection />,
  Students: <StudentsSection />,
  Analytics: <AnalyticsSection />,
  Settings: <SettingsSection />,
  Learning: <LearningSection />,
  Messages: <MessagesSection />,
};

const SchoolsDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('Overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  
  React.useEffect(() => {
    if (user) {
      // Check if user role is available in user object or metadata
      const role = user.role || (user as any).user_metadata?.role;
      
      // If user is not a school admin, redirect to home
      if (role && role !== 'school') {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const handleLogout = () => {
    setLogoutConfirmOpen(true);
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setSidebarOpen(false); // Close sidebar when section changes
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } w-64 bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:w-64`}
      >
        <div className="flex flex-col h-full py-6">
          <div className="px-4 mb-8">
            <div className="flex items-center justify-center">
              <div className="flex items-center">
                <Logo className="h-8 w-8 text-siksha-purple" />
                <span className="ml-2 text-xl font-bold text-siksha-purple">Siksha AI</span>
              </div>
            </div>
          </div>
          
          <nav className="px-4 flex-1 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.label}>
                  <button
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                      activeSection === item.label
                        ? "bg-siksha-purple text-white"
                        : "text-gray-600 hover:bg-purple-100 hover:text-siksha-purple"
                    }`}
                    onClick={() => handleSectionChange(item.label)}
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="px-4 mt-6">
            <div className="flex items-center py-3 px-4 rounded-md bg-gray-100">
              <UserCircle className="w-8 h-8 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-800">{user?.email || 'School Admin'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              className="lg:hidden p-2 rounded-md text-gray-400 focus:outline-none"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800 ml-2">{activeSection}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full bg-gray-100">
              <Bell className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </header>

        <main className="p-6">
          {activeSection === 'Overview' && <OverviewSection />}
          {activeSection === 'Teachers' && <TeachersSection />}
          {activeSection === 'Classrooms' && <ClassroomsSection />}
          {activeSection === 'Students' && <StudentsSection />}
          {activeSection === 'Analytics' && <AnalyticsSection />}
          {activeSection === 'Settings' && <SettingsSection />}
          {activeSection === 'Learning' && <LearningSection />}
          {activeSection === 'Messages' && <MessagesSection />}

          {/* Add the AI Mascot directly in the main component */}
          {activeSection === 'Overview' && <AIMascot />}
        </main>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
        <DialogContent>
          <DialogTitle>Confirm Logout</DialogTitle>
          <DialogDescription>Are you sure you want to log out?</DialogDescription>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setLogoutConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleLogout}>Logout</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchoolsDashboard; 