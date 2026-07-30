-- Recreate the student_classroom_analytics view with proper type casting
DROP VIEW IF EXISTS public.student_classroom_analytics CASCADE;
CREATE VIEW public.student_classroom_analytics AS
WITH student_quiz_stats AS (
    SELECT
        qs.student_id,
        q.classroom_id,
        COUNT(DISTINCT qs.quiz_id) AS quizzes_attempted,
        AVG(qs.score)::numeric(10,2) AS avg_quiz_score,
        COUNT(DISTINCT CASE WHEN qs.status = 'completed' THEN qs.quiz_id END) AS quizzes_completed
    FROM
        public.quiz_submissions qs
        JOIN public.quizzes q ON qs.quiz_id = q.id
    GROUP BY
        qs.student_id, q.classroom_id
),
student_study_stats AS (
    SELECT
        student_id,
        classroom_id,
        COUNT(*) AS study_sessions,
        SUM(EXTRACT(EPOCH FROM (COALESCE(end_time, now()) - start_time)))::numeric(10,2) AS total_study_seconds,
        AVG(EXTRACT(EPOCH FROM (COALESCE(end_time, now()) - start_time)))::numeric(10,2) AS avg_session_seconds
    FROM
        public.classroom_study_sessions
    GROUP BY
        student_id, classroom_id
)
SELECT
    s.id AS student_id,
    s.name AS student_name,
    c.id AS classroom_id,
    c.name AS classroom_name,
    COALESCE(qs.quizzes_attempted, 0) AS quizzes_attempted,
    COALESCE(qs.avg_quiz_score, 0)::numeric(10,2) AS avg_quiz_score,
    COALESCE(qs.quizzes_completed, 0) AS quizzes_completed,
    COALESCE(ss.study_sessions, 0) AS study_sessions,
    COALESCE(ss.total_study_seconds, 0)::numeric(10,2) AS total_study_seconds,
    COALESCE(ss.avg_session_seconds, 0)::numeric(10,2) AS avg_session_seconds
FROM
    public.students s
    JOIN public.classrooms c ON s.classroom_id = c.id
    LEFT JOIN student_quiz_stats qs ON s.id = qs.student_id AND c.id = qs.classroom_id
    LEFT JOIN student_study_stats ss ON s.id = ss.student_id AND c.id = ss.classroom_id;

-- Recreate the secure student view
DROP VIEW IF EXISTS public.secure_student_classroom_analytics;
CREATE VIEW public.secure_student_classroom_analytics AS
SELECT * FROM public.student_classroom_analytics
WHERE has_student_analytics_access(student_id, classroom_id);

-- Grant permissions
GRANT SELECT ON public.student_classroom_analytics TO authenticated;
GRANT SELECT ON public.secure_student_classroom_analytics TO authenticated;

-- Now check the student analytics data
SELECT * FROM public.student_classroom_analytics
WHERE classroom_id = '4b7d2088-14d2-42a4-90d8-c20079226daf'; 