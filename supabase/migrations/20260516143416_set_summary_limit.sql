-- Add check constraint for 10k character limit on executive_summary
ALTER TABLE public.reports 
ADD CONSTRAINT executive_summary_length_check 
CHECK (char_length(executive_summary) <= 10000);
