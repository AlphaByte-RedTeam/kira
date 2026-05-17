-- Change screenshot_url column to jsonb to store multiple evidence URLs
ALTER TABLE public.vulnerabilities 
ALTER COLUMN screenshot_url TYPE jsonb USING 
  CASE 
    WHEN screenshot_url IS NULL THEN '[]'::jsonb
    ELSE jsonb_build_array(screenshot_url) 
  END;

-- Set default to empty array
ALTER TABLE public.vulnerabilities ALTER COLUMN screenshot_url SET DEFAULT '[]'::jsonb;
