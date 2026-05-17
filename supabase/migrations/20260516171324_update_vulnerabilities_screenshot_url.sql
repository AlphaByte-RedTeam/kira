-- Ensure screenshot_url is clean jsonb array of strings
UPDATE public.vulnerabilities
SET screenshot_url = '[]'::jsonb
WHERE screenshot_url IS NULL OR screenshot_url::text = 'null';
