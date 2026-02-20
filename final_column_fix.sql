-- Final Column Fix - Add all missing columns to deposit_requests table
-- Execute this in Supabase SQL Editor

-- Add missing reviewed_by column to deposit_requests table
ALTER TABLE deposit_requests 
ADD COLUMN IF NOT EXISTS reviewed_by UUID;

-- Output confirmation
SELECT 'All missing columns added to deposit_requests table successfully!' as status;
