-- Drop the existing functions
DROP FUNCTION IF EXISTS public.has_classroom_access(uuid);
DROP FUNCTION IF EXISTS public.has_student_analytics_access(uuid, uuid);

-- Recreate the has_classroom_access function with fixed parameter name
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

-- Recreate the has_student_analytics_access function with fixed parameter names
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