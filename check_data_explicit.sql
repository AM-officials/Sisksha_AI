-- Check if there are any quizzes in the system
SELECT 'quizzes' as table_name, COUNT(*) FROM public.quizzes;

-- Check if there are any quiz submissions
SELECT 'quiz_submissions' as table_name, COUNT(*) FROM public.quiz_submissions;

-- Check if there are any materials
SELECT 'materials' as table_name, COUNT(*) FROM public.materials;

-- Check if there are any students
SELECT 'students' as table_name, COUNT(*) FROM public.students;

-- Check if there are any classrooms
SELECT 'classrooms' as table_name, COUNT(*) FROM public.classrooms;

-- Check if the classroom_study_sessions table has data
SELECT 'classroom_study_sessions' as table_name, COUNT(*) FROM public.classroom_study_sessions;

-- Check the structure of the classroom_analytics view
SELECT pg_get_viewdef('public.classroom_analytics', true);

-- Let's check the actual data in the classrooms table
SELECT id, name FROM public.classrooms LIMIT 5;

-- Let's check the actual data in the students table
SELECT id, name, classroom_id FROM public.students LIMIT 5; 