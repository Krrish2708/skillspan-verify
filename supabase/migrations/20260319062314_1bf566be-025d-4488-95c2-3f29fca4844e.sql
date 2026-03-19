-- Drop existing storage policies that depend on auth.uid()
DROP POLICY IF EXISTS "Users can upload resume files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own resume files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own resume files" ON storage.objects;

-- Create open storage policies (auth handled by Clerk at app level)
CREATE POLICY "Allow all uploads to resume-files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'resume-files');

CREATE POLICY "Allow all reads from resume-files"
ON storage.objects FOR SELECT
USING (bucket_id = 'resume-files');

CREATE POLICY "Allow all deletes from resume-files"
ON storage.objects FOR DELETE
USING (bucket_id = 'resume-files');