-- Add constraints to clients table for production data integrity
ALTER TABLE public.clients
ALTER COLUMN name TYPE text,
ALTER COLUMN website TYPE text;

ALTER TABLE public.clients 
ADD CONSTRAINT clients_name_length_check CHECK (char_length(name) <= 255),
ADD CONSTRAINT clients_website_length_check CHECK (char_length(website) <= 1000);
