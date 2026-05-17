-- Ensure bucket is public
UPDATE storage.buckets SET public = true WHERE id = 'evidence';

-- Drop existing policies if any
DROP POLICY IF EXISTS "Authenticated users can upload evidence" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view evidence" ON storage.objects;

-- Create policy for authenticated users to insert evidence
CREATE POLICY "Authenticated users can upload evidence" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'evidence');

-- Create policy for authenticated users to view evidence
CREATE POLICY "Authenticated users can view evidence" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'evidence');

-- Create policy for authenticated users to delete evidence
CREATE POLICY "Authenticated users can delete evidence" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'evidence');
