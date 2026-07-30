-- Check the structure of the classroom_analytics view
SELECT pg_get_viewdef('public.classroom_analytics', true);

-- Check the structure of the student_classroom_analytics view
SELECT pg_get_viewdef('public.student_classroom_analytics', true);

-- Check the structure of the secure_classroom_analytics view
SELECT pg_get_viewdef('public.secure_classroom_analytics', true);

-- Check the structure of the classroom_study_sessions table
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'classroom_study_sessions';

-- Check if there's data in the classroom with ID 4b7d2088-14d2-42a4-90d8-c20079226daf
SELECT * FROM public.classroom_analytics 
WHERE classroom_id = '4b7d2088-14d2-42a4-90d8-c20079226daf';

-- Check if there are any quizzes for this classroom
SELECT * FROM public.quizzes
WHERE classroom_id = '4b7d2088-14d2-42a4-90d8-c20079226daf';

-- Check if there are any materials for this classroom
SELECT * FROM public.materials
WHERE classroom_id = '4b7d2088-14d2-42a4-90d8-c20079226daf'; 