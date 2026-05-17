-- Create secure user-scoped policies for avatars and branding
-- Bucket 'evidence' is assumed to be shared or separate; using 'evidence' as specified

CREATE POLICY "Users can upload their own profile assets" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'evidence' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own profile assets" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'evidence' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own profile assets" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'evidence' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
