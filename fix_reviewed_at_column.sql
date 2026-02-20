-- Fix missing reviewed_at column in deposit_requests table
-- Execute this in Supabase SQL Editor

-- Add reviewed_at column to deposit_requests table
ALTER TABLE deposit_requests 
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- Output confirmation
SELECT 'reviewed_at column added to deposit_requests table successfully!' as status;
