-- Fix the type casting issue in the classroom_study_sessions policies
DROP POLICY IF EXISTS classroom_study_sessions_select_teacher_policy ON public.classroom_study_sessions;
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

-- Create secure functions to filter data
CREATE OR REPLACE FUNCTION public.has_classroom_access(classroom_id uuid)
RETURNS boolean AS $$
BEGIN
    -- Teachers can view analytics for their classrooms
    IF EXISTS (
        SELECT 1 FROM public.classrooms c
        WHERE c.id = classroom_id
        AND (c.class_teacher_id = auth.uid()::uuid OR auth.uid()::uuid::text = ANY(c.teachers))
    ) THEN
        RETURN TRUE;
    END IF;
    
    -- Students can view analytics for their assigned classroom
    IF EXISTS (
        SELECT 1 FROM public.students s
        WHERE s.id = auth.uid()::uuid
        AND s.classroom_id = classroom_id
    ) THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- This function checks if a user has access to student analytics
CREATE OR REPLACE FUNCTION public.has_student_analytics_access(student_id uuid, classroom_id uuid)
RETURNS boolean AS $$
BEGIN
    -- Teachers can view analytics for students in their classrooms
    IF EXISTS (
        SELECT 1 FROM public.classrooms c
        WHERE c.id = classroom_id
        AND (c.class_teacher_id = auth.uid()::uuid OR auth.uid()::uuid::text = ANY(c.teachers))
    ) THEN
        RETURN TRUE;
    END IF;
    
    -- Students can view only their own analytics
    IF student_id = auth.uid()::uuid THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create secure views with row-level security built-in
DROP VIEW IF EXISTS public.secure_classroom_analytics;
CREATE VIEW public.secure_classroom_analytics AS
SELECT * FROM public.classroom_analytics
WHERE has_classroom_access(classroom_id);

DROP VIEW IF EXISTS public.secure_student_classroom_analytics;
CREATE VIEW public.secure_student_classroom_analytics AS
SELECT * FROM public.student_classroom_analytics
WHERE has_student_analytics_access(student_id, classroom_id);

-- Grant access to the secure views
GRANT SELECT ON public.secure_classroom_analytics TO authenticated;
GRANT SELECT ON public.secure_student_classroom_analytics TO authenticated; 