-- Create classroom_study_sessions table to track student study time in classroom mode
CREATE TABLE IF NOT EXISTS public.classroom_study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_time TIMESTAMPTZ,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.classroom_study_sessions ENABLE ROW LEVEL SECURITY;

-- Teachers can view all classroom study sessions for their classrooms
CREATE POLICY classroom_study_sessions_teacher_select
  ON public.classroom_study_sessions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.classrooms c
      WHERE c.id = classroom_study_sessions.classroom_id
      AND (c.class_teacher_id = auth.uid() OR auth.uid() = ANY(c.teachers))
    )
  );

-- Students can only view their own study sessions
CREATE POLICY classroom_study_sessions_student_select
  ON public.classroom_study_sessions
  FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid()
  );

-- Students can insert their own study sessions
CREATE POLICY classroom_study_sessions_student_insert
  ON public.classroom_study_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = auth.uid()
  );

-- Students can update only their own study sessions
CREATE POLICY classroom_study_sessions_student_update
  ON public.classroom_study_sessions
  FOR UPDATE
  TO authenticated
  USING (
    student_id = auth.uid()
  )
  WITH CHECK (
    student_id = auth.uid()
  );

-- Create function to calculate duration when end_time is set
CREATE OR REPLACE FUNCTION public.calculate_study_session_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time IS NOT NULL THEN
    NEW.duration_seconds := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time));
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to calculate duration
CREATE TRIGGER calculate_study_session_duration_trigger
BEFORE INSERT OR UPDATE ON public.classroom_study_sessions
FOR EACH ROW
EXECUTE FUNCTION public.calculate_study_session_duration();

-- Create analytics view for teachers
CREATE OR REPLACE VIEW public.classroom_analytics AS
WITH quiz_stats AS (
  SELECT
    q.classroom_id,
    COUNT(DISTINCT q.id) AS total_quizzes,
    COUNT(DISTINCT qs.student_id) AS students_attempted,
    AVG(qs.score) AS avg_score,
    COUNT(DISTINCT CASE WHEN qs.status = 'completed' THEN qs.id END) AS completed_submissions,
    COUNT(DISTINCT CASE WHEN qs.status = 'in_progress' THEN qs.id END) AS in_progress_submissions
  FROM
    public.quizzes q
    LEFT JOIN public.quiz_submissions qs ON q.id = qs.quiz_id
  GROUP BY
    q.classroom_id
),
material_stats AS (
  SELECT
    classroom_id,
    COUNT(*) AS total_materials
  FROM
    public.materials
  GROUP BY
    classroom_id
),
study_time_stats AS (
  SELECT
    classroom_id,
    COUNT(DISTINCT student_id) AS active_students,
    SUM(duration_seconds) AS total_study_seconds,
    AVG(duration_seconds) AS avg_study_seconds_per_session
  FROM
    public.classroom_study_sessions
  WHERE
    duration_seconds IS NOT NULL
  GROUP BY
    classroom_id
)
SELECT
  c.id AS classroom_id,
  c.name AS classroom_name,
  c.class_teacher_id,
  c.school_id,
  COALESCE(qs.total_quizzes, 0) AS total_quizzes,
  COALESCE(qs.students_attempted, 0) AS students_attempted_quizzes,
  COALESCE(qs.avg_score, 0) AS avg_quiz_score,
  COALESCE(qs.completed_submissions, 0) AS completed_quiz_submissions,
  COALESCE(qs.in_progress_submissions, 0) AS in_progress_quiz_submissions,
  COALESCE(ms.total_materials, 0) AS total_materials,
  COALESCE(sts.active_students, 0) AS active_students,
  COALESCE(sts.total_study_seconds, 0) AS total_study_seconds,
  COALESCE(sts.avg_study_seconds_per_session, 0) AS avg_study_seconds_per_session
FROM
  public.classrooms c
  LEFT JOIN quiz_stats qs ON c.id = qs.classroom_id
  LEFT JOIN material_stats ms ON c.id = ms.classroom_id
  LEFT JOIN study_time_stats sts ON c.id = sts.classroom_id;

-- Create analytics view for individual student performance
CREATE OR REPLACE VIEW public.student_classroom_analytics AS
WITH student_quiz_stats AS (
  SELECT
    qs.student_id,
    q.classroom_id,
    COUNT(DISTINCT qs.quiz_id) AS quizzes_attempted,
    AVG(qs.score) AS avg_score,
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
    COUNT(*) AS total_sessions,
    SUM(duration_seconds) AS total_study_seconds,
    AVG(duration_seconds) AS avg_session_seconds
  FROM
    public.classroom_study_sessions
  WHERE
    duration_seconds IS NOT NULL
  GROUP BY
    student_id, classroom_id
)
SELECT
  s.id AS student_id,
  s.name AS student_name,
  s.classroom_id,
  c.name AS classroom_name,
  COALESCE(sqs.quizzes_attempted, 0) AS quizzes_attempted,
  COALESCE(sqs.avg_score, 0) AS avg_quiz_score,
  COALESCE(sqs.quizzes_completed, 0) AS quizzes_completed,
  COALESCE(sss.total_sessions, 0) AS study_sessions,
  COALESCE(sss.total_study_seconds, 0) AS total_study_seconds,
  COALESCE(sss.avg_session_seconds, 0) AS avg_session_seconds
FROM
  public.students s
  JOIN public.classrooms c ON s.classroom_id = c.id
  LEFT JOIN student_quiz_stats sqs ON s.id = sqs.student_id AND s.classroom_id = sqs.classroom_id
  LEFT JOIN student_study_stats sss ON s.id = sss.student_id AND s.classroom_id = sss.classroom_id;

-- Add RLS policies for analytics views
CREATE POLICY classroom_analytics_teacher_select
  ON public.classroom_analytics
  FOR SELECT
  TO authenticated
  USING (
    class_teacher_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.classrooms c
      WHERE c.id = classroom_analytics.classroom_id
      AND auth.uid() = ANY(c.teachers)
    )
  );

CREATE POLICY student_classroom_analytics_teacher_select
  ON public.student_classroom_analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.classrooms c
      WHERE c.id = student_classroom_analytics.classroom_id
      AND (c.class_teacher_id = auth.uid() OR auth.uid() = ANY(c.teachers))
    )
  );

CREATE POLICY student_classroom_analytics_student_select
  ON public.student_classroom_analytics
  FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid()
  ); 