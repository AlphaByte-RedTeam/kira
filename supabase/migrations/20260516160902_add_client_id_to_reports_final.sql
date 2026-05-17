-- Add client_id column to reports table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='reports' AND column_name='client_id'
    ) THEN
        ALTER TABLE public.reports ADD COLUMN client_id uuid REFERENCES public.clients(id);
    END IF;
END
$$;
