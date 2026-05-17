-- Drop the overly broad policies
DROP POLICY IF EXISTS "Authenticated users can upload evidence" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view evidence" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete evidence" ON storage.objects;

-- Create secure policies: Evidence path is findings/{report_id}/{vulnerability_id}/{filename}
-- We need to check if the user is the owner of the report corresponding to {report_id}

CREATE POLICY "Users can upload their own evidence" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'evidence' 
  AND EXISTS (
    SELECT 1 FROM public.reports r
    WHERE r.id = (storage.foldername(name))[2]::uuid
    AND r.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their own evidence" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'evidence' 
  AND EXISTS (
    SELECT 1 FROM public.reports r
    WHERE r.id = (storage.foldername(name))[2]::uuid
    AND r.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own evidence" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'evidence' 
  AND EXISTS (
    SELECT 1 FROM public.reports r
    WHERE r.id = (storage.foldername(name))[2]::uuid
    AND r.user_id = auth.uid()
  )
);
