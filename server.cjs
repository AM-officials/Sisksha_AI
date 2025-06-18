const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper: assign teacher to classrooms
async function assignTeacherToClassrooms(supabase, teacherId, classroomIds) {
  // Remove teacher from all classrooms first
  await supabase.from('classrooms').update({
    class_teacher_id: null,
    teachers: []
  }).contains('teachers', [teacherId]);
  // Assign as class teacher and/or add to teachers array
  for (const classroomId of classroomIds) {
    await supabase.from('classrooms').update({
      class_teacher_id: teacherId
    }).eq('id', classroomId);
    // Add to teachers array (if not already present)
    // This requires a custom RPC or you can fetch, check, and update
    const { data: classroom, error } = await supabase.from('classrooms').select('teachers').eq('id', classroomId).single();
    if (!error && classroom) {
      const teachersArr = Array.isArray(classroom.teachers) ? classroom.teachers : [];
      if (!teachersArr.includes(teacherId)) {
        teachersArr.push(teacherId);
        await supabase.from('classrooms').update({ teachers: teachersArr }).eq('id', classroomId);
      }
    }
  }
}

// API: Assign teacher to classrooms
app.post('/api/assign-teacher-classrooms', async (req, res) => {
  const { teacherId, classroomIds } = req.body;
  if (!teacherId || !Array.isArray(classroomIds)) {
    return res.status(400).json({ error: 'teacherId and classroomIds are required' });
  }
  try {
    await assignTeacherToClassrooms(supabase, teacherId, classroomIds);
    res.status(200).json({ message: 'Classroom assignment updated' });
  } catch (error) {
    console.error('Error in /api/assign-teacher-classrooms:', error);
    res.status(500).json({ error: error.message || 'Unknown error in assign-teacher-classrooms' });
  }
});

app.post('/api/create-teacher', async (req, res) => {
  const { email, password, name, school_id, subjects, classrooms } = req.body;

  try {
    // 1. Create user in auth system
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'teacher', name, school_id, subjects, classrooms },
    });

    if (authError) throw authError;

    const teacherId = authData.user.id;

    // 2. Insert teacher into teachers table
    const { error: teacherError } = await supabase.from('teachers').insert({
      id: teacherId,
      name,
      email,
      school_id,
      subjects: Array.isArray(subjects) ? subjects : subjects.split(',').map(s => s.trim()).filter(Boolean),
      classrooms: Array.isArray(classrooms) ? classrooms : classrooms.split(',').map(s => s.trim()).filter(Boolean),
      active: true
    });

    if (teacherError) {
      // If teacher table insert fails, try to clean up the auth user
      await supabase.auth.admin.deleteUser(teacherId).catch(e => console.error("Cleanup failed:", e));
      throw teacherError;
    }

    // 3. Assign teacher to classrooms if specified
    const classroomIds = Array.isArray(classrooms) ? classrooms : classrooms.split(',').map(s => s.trim()).filter(Boolean);
    if (classroomIds.length > 0) {
      await assignTeacherToClassrooms(supabase, teacherId, classroomIds).catch(e => {
        console.error("Classroom assignment failed:", e);
        // Non-critical error, don't throw
      });
    }

    res.status(200).json({ message: 'Teacher created', user: authData.user });
  } catch (err) {
    console.error('Error in /api/create-teacher:', err);
    res.status(400).json({ error: err.message || 'Failed to create teacher' });
  }
});

app.post('/api/delete-auth-user', async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'Missing user_id' });

  try {
    // 1. Check if user exists in auth
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user_id);
    if (userError) throw userError;

    // 2. Remove from classrooms first (foreign key relationships)
    await supabase.from('classrooms').update({
      class_teacher_id: null
    }).eq('class_teacher_id', user_id);

    await supabase.from('classrooms').update({
      teachers: supabase.raw(`array_remove(teachers, '${user_id}')`)
    }).contains('teachers', [user_id]);

    // 3. Delete from teachers table
    const { error: dbError } = await supabase
      .from('teachers')
      .delete()
      .eq('id', user_id);
    
    if (dbError) {
      console.error('Error deleting from teachers table:', dbError);
      // Continue with auth deletion even if DB deletion fails
    }

    // 4. Delete from auth
    const { error: authError } = await supabase.auth.admin.deleteUser(user_id);
    if (authError) throw authError;

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Exception in /api/delete-auth-user:', err);
    res.status(500).json({ error: err.message || 'Unknown error in delete-auth-user' });
  }
});

app.post('/api/update-teacher-metadata', async (req, res) => {
  const { user_id, metadata } = req.body;
  
  if (!user_id || !metadata) {
    return res.status(400).json({ error: 'Missing user_id or metadata' });
  }
  
  try {
    // Update the user's metadata
    const { data, error } = await supabase.auth.admin.updateUserById(
      user_id,
      { user_metadata: metadata }
    );
    
    if (error) throw error;
    
    res.status(200).json({ message: 'Teacher metadata updated', user: data.user });
  } catch (err) {
    console.error('Exception in /api/update-teacher-metadata:', err);
    res.status(500).json({ error: err.message || 'Unknown error in update-teacher-metadata' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
