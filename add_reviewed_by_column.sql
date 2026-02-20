-- Add missing reviewed_by column to withdrawal_requests table
-- Execute this in Supabase SQL Editor

-- Add reviewed_by column to withdrawal_requests table
ALTER TABLE withdrawal_requests 
ADD COLUMN IF NOT EXISTS reviewed_by UUID;

-- Output confirmation
SELECT 'Missing reviewed_by column added to withdrawal_requests table successfully!' as status;
