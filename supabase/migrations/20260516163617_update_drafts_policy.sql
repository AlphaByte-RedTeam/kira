-- Drop the old policy
DROP POLICY IF EXISTS "Users can manage their own drafts" ON public.drafts;

-- Create new policy that checks if the draft belongs to the current user
-- This requires a user_id column in drafts to simplify access control
ALTER TABLE public.drafts ADD COLUMN IF NOT EXISTS user_id uuid references auth.users(id);

CREATE POLICY "Users can manage their own drafts"
    ON public.drafts 
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
