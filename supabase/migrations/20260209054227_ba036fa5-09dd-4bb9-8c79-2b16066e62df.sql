
-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Resumes table
CREATE TABLE public.resumes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'parsing', 'completed', 'failed')),
  candidate_name TEXT,
  candidate_role TEXT,
  overall_score INTEGER DEFAULT 0,
  parsed_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Resume skills table
CREATE TABLE public.resume_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  confidence TEXT NOT NULL DEFAULT 'unverified' CHECK (confidence IN ('verified', 'partially_verified', 'unverified')),
  evidence TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.resume_skills ENABLE ROW LEVEL SECURITY;

-- Helper functions (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_own_profile(profile_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = profile_id AND auth_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.is_own_resume(resume_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.resumes r
    JOIN public.profiles p ON p.id = r.profile_id
    WHERE r.id = resume_id AND p.auth_id = auth.uid()
  )
$$;

-- Profiles RLS policies
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth_id = auth.uid());

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth_id = auth.uid());

-- Resumes RLS policies
CREATE POLICY "Users can insert own resumes"
  ON public.resumes FOR INSERT
  TO authenticated
  WITH CHECK (public.is_own_profile(profile_id));

CREATE POLICY "Users can view own resumes"
  ON public.resumes FOR SELECT
  TO authenticated
  USING (public.is_own_resume(id));

CREATE POLICY "Users can update own resumes"
  ON public.resumes FOR UPDATE
  TO authenticated
  USING (public.is_own_resume(id));

CREATE POLICY "Users can delete own resumes"
  ON public.resumes FOR DELETE
  TO authenticated
  USING (public.is_own_resume(id));

-- Resume skills RLS policies
CREATE POLICY "Users can view own resume skills"
  ON public.resume_skills FOR SELECT
  TO authenticated
  USING (public.is_own_resume(resume_id));

CREATE POLICY "Users can insert own resume skills"
  ON public.resume_skills FOR INSERT
  TO authenticated
  WITH CHECK (public.is_own_resume(resume_id));

CREATE POLICY "Users can delete own resume skills"
  ON public.resume_skills FOR DELETE
  TO authenticated
  USING (public.is_own_resume(resume_id));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (auth_id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON public.resumes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for resume files
INSERT INTO storage.buckets (id, name, public) VALUES ('resume-files', 'resume-files', false);

CREATE POLICY "Users can upload resume files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'resume-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own resume files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'resume-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own resume files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'resume-files' AND auth.uid()::text = (storage.foldername(name))[1]);
