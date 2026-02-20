-- Add missing reviewed_at column to withdrawal_requests table
-- Execute this in Supabase SQL Editor

-- Add reviewed_at column to withdrawal_requests table
ALTER TABLE withdrawal_requests 
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- Output confirmation
SELECT 'Missing reviewed_at column added to withdrawal_requests table successfully!' as status;
