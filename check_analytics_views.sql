-- Check if the classroom_analytics view is returning data
SELECT * FROM public.classroom_analytics LIMIT 5;

-- Check if the secure_classroom_analytics view is returning data
SELECT * FROM public.secure_classroom_analytics LIMIT 5;

-- Check if the classroom_study_sessions table has data
SELECT COUNT(*) FROM public.classroom_study_sessions;

-- Check if the security functions are working correctly
SELECT has_classroom_access('00000000-0000-0000-0000-000000000000') as result;

-- Check the structure of the views
SELECT pg_get_viewdef('public.classroom_analytics', true);
SELECT pg_get_viewdef('public.secure_classroom_analytics', true);

-- Check if there are any quizzes in the system
SELECT COUNT(*) FROM public.quizzes;

-- Check if there are any quiz submissions
SELECT COUNT(*) FROM public.quiz_submissions; 