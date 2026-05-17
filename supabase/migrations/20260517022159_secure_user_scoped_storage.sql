-- 1. Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Users can upload their own evidence" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own evidence" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own evidence" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload report assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own report assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own report assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own report assets" ON storage.objects;

-- 2. Create User-Scoped Policies
-- We enforce that the first folder in the path MUST be the user's UID.
-- Path structure: {user_id}/{bucket_type}/{report_id}/{vulnerability_id}/{filename}

CREATE POLICY "Users can upload their own evidence" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'evidence' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own evidence" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'evidence' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own evidence" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'evidence' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
