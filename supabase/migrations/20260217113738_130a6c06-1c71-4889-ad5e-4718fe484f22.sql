
-- Add new scoring columns to resumes table
ALTER TABLE public.resumes
  ADD COLUMN IF NOT EXISTS ats_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS relevancy_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS credibility_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS job_description text,
  ADD COLUMN IF NOT EXISTS role_title text,
  ADD COLUMN IF NOT EXISTS experience_range text;
