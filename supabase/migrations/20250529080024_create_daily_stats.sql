-- Create daily_stats table
CREATE TABLE IF NOT EXISTS public.daily_stats (
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

-- Create RPC functions for incrementing counters
CREATE OR REPLACE FUNCTION increment_notes_generated(arg_user_id UUID, arg_date DATE)
RETURNS void AS $$
BEGIN
    INSERT INTO public.daily_stats (user_id, date, notes_generated)
    VALUES (arg_user_id, arg_date, 1)
    ON CONFLICT (user_id, date)
    DO UPDATE SET notes_generated = daily_stats.notes_generated + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_flashcards_generated(arg_user_id UUID, arg_date DATE)
RETURNS void AS $$
BEGIN
    INSERT INTO public.daily_stats (user_id, date, flashcards_generated)
    VALUES (arg_user_id, arg_date, 1)
    ON CONFLICT (user_id, date)
    DO UPDATE SET flashcards_generated = daily_stats.flashcards_generated + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_quizzes_given(arg_user_id UUID, arg_date DATE)
RETURNS void AS $$
BEGIN
    INSERT INTO public.daily_stats (user_id, date, quizzes_given)
    VALUES (arg_user_id, arg_date, 1)
    ON CONFLICT (user_id, date)
    DO UPDATE SET quizzes_given = daily_stats.quizzes_given + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_daily_stats_updated_at
    BEFORE UPDATE ON public.daily_stats
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
