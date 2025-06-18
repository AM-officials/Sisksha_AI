-- Check if there are any quiz submissions for this classroom
SELECT * FROM public.quiz_submissions qs
JOIN public.quizzes q ON qs.quiz_id = q.id
WHERE q.classroom_id = '4b7d2088-14d2-42a4-90d8-c20079226daf';

-- Check if there are any quizzes for this classroom
SELECT * FROM public.quizzes
WHERE classroom_id = '4b7d2088-14d2-42a4-90d8-c20079226daf';

-- Check the raw data that would go into the analytics view
WITH quiz_stats AS (
    SELECT
        q.classroom_id,
        COUNT(DISTINCT q.id) AS total_quizzes,
        COUNT(DISTINCT qs.student_id) AS students_attempted_quizzes,
        AVG(qs.score) AS avg_quiz_score,
        COUNT(DISTINCT CASE WHEN qs.status = 'completed' THEN qs.id END) AS completed_quiz_submissions,
        COUNT(DISTINCT CASE WHEN qs.status = 'in_progress' THEN qs.id END) AS in_progress_quiz_submissions
    FROM
        public.quizzes q
        LEFT JOIN public.quiz_submissions qs ON q.id = qs.quiz_id
    WHERE q.classroom_id = '4b7d2088-14d2-42a4-90d8-c20079226daf'
    GROUP BY
        q.classroom_id
),
material_stats AS (
    SELECT
        classroom_id,
        COUNT(DISTINCT id) AS total_materials
    FROM
        public.materials
    WHERE classroom_id = '4b7d2088-14d2-42a4-90d8-c20079226daf'
    GROUP BY
        classroom_id
),
student_stats AS (
    SELECT
        classroom_id,
        COUNT(DISTINCT id) AS active_students
    FROM
        public.students
    WHERE classroom_id = '4b7d2088-14d2-42a4-90d8-c20079226daf'
    GROUP BY
        classroom_id
),
study_stats AS (
    SELECT
        classroom_id,
        SUM(EXTRACT(EPOCH FROM (COALESCE(end_time, now()) - start_time))) AS total_study_seconds,
        AVG(EXTRACT(EPOCH FROM (COALESCE(end_time, now()) - start_time))) AS avg_study_seconds_per_session
    FROM
        public.classroom_study_sessions
    WHERE classroom_id = '4b7d2088-14d2-42a4-90d8-c20079226daf'
    GROUP BY
        classroom_id
)
SELECT
    c.id AS classroom_id,
    c.name AS classroom_name,
    COALESCE(qs.total_quizzes, 0) AS total_quizzes,
    COALESCE(qs.students_attempted_quizzes, 0) AS students_attempted_quizzes,
    COALESCE(qs.avg_quiz_score, 0) AS avg_quiz_score,
    COALESCE(qs.completed_quiz_submissions, 0) AS completed_quiz_submissions,
    COALESCE(qs.in_progress_quiz_submissions, 0) AS in_progress_quiz_submissions,
    COALESCE(ms.total_materials, 0) AS total_materials,
    COALESCE(ss.active_students, 0) AS active_students,
    COALESCE(st.total_study_seconds, 0) AS total_study_seconds,
    COALESCE(st.avg_study_seconds_per_session, 0) AS avg_study_seconds_per_session
FROM
    public.classrooms c
    LEFT JOIN quiz_stats qs ON c.id = qs.classroom_id
    LEFT JOIN material_stats ms ON c.id = ms.classroom_id
    LEFT JOIN student_stats ss ON c.id = ss.classroom_id
    LEFT JOIN study_stats st ON c.id = st.classroom_id
WHERE c.id = '4b7d2088-14d2-42a4-90d8-c20079226daf'; 