-- Check if the classroom_analytics view is returning data
SELECT * FROM public.classroom_analytics LIMIT 5;

-- Check if the secure_classroom_analytics view is returning data
SELECT * FROM public.secure_classroom_analytics LIMIT 5;

-- Check if there are any quizzes in the system
SELECT COUNT(*) FROM public.quizzes;

-- Check if there are any quiz submissions
SELECT COUNT(*) FROM public.quiz_submissions;

-- Check if there are any materials
SELECT COUNT(*) FROM public.materials;

-- Check if there are any students
SELECT COUNT(*) FROM public.students;

-- Check if there are any classrooms
SELECT COUNT(*) FROM public.classrooms;

-- Check if the classroom_study_sessions table has data
SELECT COUNT(*) FROM public.classroom_study_sessions; 