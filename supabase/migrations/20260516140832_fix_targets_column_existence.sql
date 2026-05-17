-- Ensure the 'targets' column exists before creating the index
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='reports' AND column_name='targets'
    ) THEN
        ALTER TABLE public.reports ADD COLUMN targets jsonb DEFAULT '[]'::jsonb;
    END IF;
END
$$;

-- Now safe to create the index
CREATE INDEX IF NOT EXISTS idx_reports_targets_gin ON public.reports USING GIN (targets);
