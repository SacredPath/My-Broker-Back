-- Add missing rejection_reason column to deposit_requests table
-- Execute this in Supabase SQL Editor

-- Add rejection_reason column to deposit_requests table
ALTER TABLE deposit_requests 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add rejection_reason column to withdrawal_requests table  
ALTER TABLE withdrawal_requests 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Output confirmation
SELECT 'Missing rejection_reason columns added successfully!' as status;
