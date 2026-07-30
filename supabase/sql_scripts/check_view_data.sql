-- Check the data in the classroom_analytics view
SELECT * FROM public.classroom_analytics
WHERE classroom_id = '4b7d2088-14d2-42a4-90d8-c20079226daf';

-- Check the data in the secure_classroom_analytics view
SELECT * FROM public.secure_classroom_analytics
WHERE classroom_id = '4b7d2088-14d2-42a4-90d8-c20079226daf';

-- Check if there's a type casting issue in the view definition
SELECT pg_get_viewdef('public.classroom_analytics', true);

-- Let's try to recreate the view with explicit type casting
DROP VIEW IF EXISTS public.classroom_analytics CASCADE;
CREATE VIEW public.classroom_analytics AS
WITH quiz_stats AS (
    SELECT
        q.classroom_id,
        COUNT(DISTINCT q.id) AS total_quizzes,
        COUNT(DISTINCT qs.student_id) AS students_attempted_quizzes,
        AVG(qs.score)::numeric(10,2) AS avg_quiz_score,
        COUNT(DISTINCT CASE WHEN qs.status = 'completed' THEN qs.id END) AS completed_quiz_submissions,
        COUNT(DISTINCT CASE WHEN qs.status = 'in_progress' THEN qs.id END) AS in_progress_quiz_submissions
    FROM
        public.quizzes q
        LEFT JOIN public.quiz_submissions qs ON q.id = qs.quiz_id
    GROUP BY
        q.classroom_id
),
material_stats AS (
    SELECT
        classroom_id,
        COUNT(DISTINCT id) AS total_materials
    FROM
        public.materials
    GROUP BY
        classroom_id
),
student_stats AS (
    SELECT
        classroom_id,
        COUNT(DISTINCT id) AS active_students
    FROM
        public.students
    GROUP BY
        classroom_id
),
study_stats AS (
    SELECT
        classroom_id,
        SUM(EXTRACT(EPOCH FROM (COALESCE(end_time, now()) - start_time)))::numeric(10,2) AS total_study_seconds,
        AVG(EXTRACT(EPOCH FROM (COALESCE(end_time, now()) - start_time)))::numeric(10,2) AS avg_study_seconds_per_session
    FROM
        public.classroom_study_sessions
    GROUP BY
        classroom_id
)
SELECT
    c.id AS classroom_id,
    c.name AS classroom_name,
    COALESCE(qs.total_quizzes, 0) AS total_quizzes,
    COALESCE(qs.students_attempted_quizzes, 0) AS students_attempted_quizzes,
    COALESCE(qs.avg_quiz_score, 0)::numeric(10,2) AS avg_quiz_score,
    COALESCE(qs.completed_quiz_submissions, 0) AS completed_quiz_submissions,
    COALESCE(qs.in_progress_quiz_submissions, 0) AS in_progress_quiz_submissions,
    COALESCE(ms.total_materials, 0) AS total_materials,
    COALESCE(ss.active_students, 0) AS active_students,
    COALESCE(st.total_study_seconds, 0)::numeric(10,2) AS total_study_seconds,
    COALESCE(st.avg_study_seconds_per_session, 0)::numeric(10,2) AS avg_study_seconds_per_session
FROM
    public.classrooms c
    LEFT JOIN quiz_stats qs ON c.id = qs.classroom_id
    LEFT JOIN material_stats ms ON c.id = ms.classroom_id
    LEFT JOIN student_stats ss ON c.id = ss.classroom_id
    LEFT JOIN study_stats st ON c.id = st.classroom_id;

-- Recreate the secure view
DROP VIEW IF EXISTS public.secure_classroom_analytics;
CREATE VIEW public.secure_classroom_analytics AS
SELECT * FROM public.classroom_analytics
WHERE has_classroom_access(classroom_id);

-- Grant permissions
GRANT SELECT ON public.classroom_analytics TO authenticated;
GRANT SELECT ON public.secure_classroom_analytics TO authenticated;

-- Now check the data again
SELECT * FROM public.classroom_analytics
WHERE classroom_id = '4b7d2088-14d2-42a4-90d8-c20079226daf'; 