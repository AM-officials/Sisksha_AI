-- Complete setup script for the classroom analytics system

-- Drop existing views and functions to avoid conflicts
DROP VIEW IF EXISTS public.secure_student_classroom_analytics CASCADE;
DROP VIEW IF EXISTS public.secure_classroom_analytics CASCADE;
DROP VIEW IF EXISTS public.student_classroom_analytics CASCADE;
DROP VIEW IF EXISTS public.classroom_analytics CASCADE;
DROP FUNCTION IF EXISTS public.has_student_analytics_access(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.has_classroom_access(uuid) CASCADE;

-- Create classroom_study_sessions table to track student study time
CREATE TABLE IF NOT EXISTS public.classroom_study_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id),
    classroom_id UUID NOT NULL REFERENCES public.classrooms(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    end_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT end_time_after_start CHECK (end_time IS NULL OR end_time >= start_time)
);

-- Add RLS policies for classroom_study_sessions
ALTER TABLE public.classroom_study_sessions ENABLE ROW LEVEL SECURITY;

-- Allow students to insert and update their own study sessions
CREATE POLICY classroom_study_sessions_insert_policy ON public.classroom_study_sessions
    FOR INSERT
    TO authenticated
    WITH CHECK (student_id = auth.uid()::uuid);

CREATE POLICY classroom_study_sessions_update_policy ON public.classroom_study_sessions
    FOR UPDATE
    TO authenticated
    USING (student_id = auth.uid()::uuid);

-- Allow students to view their own study sessions
CREATE POLICY classroom_study_sessions_select_student_policy ON public.classroom_study_sessions
    FOR SELECT
    TO authenticated
    USING (student_id = auth.uid()::uuid);

-- Allow teachers to view study sessions for their classrooms
CREATE POLICY classroom_study_sessions_select_teacher_policy ON public.classroom_study_sessions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.classrooms c
            WHERE c.id = classroom_id
            AND (c.class_teacher_id = auth.uid()::uuid OR auth.uid()::uuid::text = ANY(c.teachers))
        )
    );

-- Create security functions for view access control
CREATE FUNCTION public.has_classroom_access(classroom_id_param uuid)
RETURNS boolean AS $$
BEGIN
    -- Teachers can view analytics for their classrooms
    IF EXISTS (
        SELECT 1 FROM public.classrooms c
        WHERE c.id = classroom_id_param
        AND (c.class_teacher_id = auth.uid()::uuid OR auth.uid()::uuid::text = ANY(c.teachers))
    ) THEN
        RETURN TRUE;
    END IF;
    
    -- Students can view analytics for their assigned classroom
    IF EXISTS (
        SELECT 1 FROM public.students s
        WHERE s.id = auth.uid()::uuid
        AND s.classroom_id = classroom_id_param
    ) THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE FUNCTION public.has_student_analytics_access(student_id_param uuid, classroom_id_param uuid)
RETURNS boolean AS $$
BEGIN
    -- Teachers can view analytics for students in their classrooms
    IF EXISTS (
        SELECT 1 FROM public.classrooms c
        WHERE c.id = classroom_id_param
        AND (c.class_teacher_id = auth.uid()::uuid OR auth.uid()::uuid::text = ANY(c.teachers))
    ) THEN
        RETURN TRUE;
    END IF;
    
    -- Students can view only their own analytics
    IF student_id_param = auth.uid()::uuid THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create classroom analytics view with proper type casting
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

-- Create student classroom analytics view with proper type casting
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

-- Create secure views with row-level security built-in
CREATE VIEW public.secure_classroom_analytics AS
SELECT * FROM public.classroom_analytics
WHERE has_classroom_access(classroom_id);

CREATE VIEW public.secure_student_classroom_analytics AS
SELECT * FROM public.student_classroom_analytics
WHERE has_student_analytics_access(student_id, classroom_id);

-- Grant permissions to the views
GRANT SELECT ON public.classroom_analytics TO authenticated;
GRANT SELECT ON public.student_classroom_analytics TO authenticated;
GRANT SELECT ON public.secure_classroom_analytics TO authenticated;
GRANT SELECT ON public.secure_student_classroom_analytics TO authenticated; 