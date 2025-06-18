CREATE OR REPLACE FUNCTION create_daily_stats_if_not_exists()
RETURNS void AS $$
BEGIN
    -- Check if table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'daily_stats') THEN
        -- Create daily_stats table
        CREATE TABLE public.daily_stats (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            date DATE NOT NULL,
            notes_generated INTEGER DEFAULT 0,
            flashcards_generated INTEGER DEFAULT 0,
            quizzes_given INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            UNIQUE(user_id, date)
        );

        -- Add RLS policies
        ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can view their own stats"
            ON public.daily_stats FOR SELECT
            USING (auth.uid() = user_id);

        CREATE POLICY "Users can update their own stats"
            ON public.daily_stats FOR UPDATE
            USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert their own stats"
            ON public.daily_stats FOR INSERT
            WITH CHECK (auth.uid() = user_id);

        -- Create trigger for updated_at
        CREATE TRIGGER update_daily_stats_updated_at
            BEFORE UPDATE ON public.daily_stats
            FOR EACH ROW
            EXECUTE PROCEDURE update_updated_at_column();
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 