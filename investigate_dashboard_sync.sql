-- Investigate Dashboard Synchronization Issues
-- Execute this in Supabase SQL Editor
-- This script checks data relationships and synchronization

-- 1. Check if admin balance changes are properly linked to users
SELECT 
    'Balance Changes Investigation' as investigation_type,
    COUNT(*) as total_balance_changes,
    COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as orphaned_changes
FROM audit_log 
WHERE action LIKE '%balance%' 
AND created_at >= NOW() - INTERVAL '24 hours'
UNION ALL
-- Check if deposit/withdrawal approvals are updating user balances
SELECT 
    'Deposit/Withdrawal Sync Check' as investigation_type,
    COUNT(*) as total_transactions,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_transactions,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as orphaned_transactions
FROM deposit_requests 
WHERE created_at >= NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 
    'Withdrawal Sync Check' as investigation_type,
    COUNT(*) as total_transactions,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_transactions,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as orphaned_transactions
FROM withdrawal_requests 
WHERE created_at >= NOW() - INTERVAL '24 hours'
UNION ALL
-- Check user profile completeness
SELECT 
    'User Profile Check' as investigation_type,
    COUNT(*) as total_users,
    COUNT(CASE WHEN country IS NULL THEN 1 END) as users_missing_country,
    COUNT(CASE WHEN kyc_status IS NULL THEN 1 END) as users_missing_kyc,
    COUNT(CASE WHEN email_verified = false THEN 1 END) as users_unverified_email,
    COUNT(CASE WHEN is_frozen = true THEN 1 END) as frozen_users
FROM profiles
UNION ALL
-- Check for data consistency between tables
SELECT 
    'Data Consistency Check' as investigation_type,
    'deposit_requests' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as records_missing_user,
    COUNT(CASE WHEN amount IS NULL THEN 1 END) as records_missing_amount
FROM deposit_requests
UNION ALL
SELECT 
    'Data Consistency Check' as investigation_type,
    'withdrawal_requests' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as records_missing_user,
    COUNT(CASE WHEN amount IS NULL THEN 1 END) as records_missing_amount
FROM withdrawal_requests
UNION ALL
-- Check for recent admin activity
SELECT 
    'Admin Activity Check' as investigation_type,
    COUNT(*) as total_admin_actions,
    COUNT(CASE WHEN actor_user_id IS NULL THEN 1 END) as actions_missing_admin,
    COUNT(DISTINCT actor_user_id) as unique_admins_active
FROM audit_log 
WHERE created_at >= NOW() - INTERVAL '24 hours'
AND actor_role = 'admin'
UNION ALL
-- Check for balance-related triggers or functions
SELECT 
    'Trigger/Function Check' as investigation_type,
    routine_name,
    routine_type,
    created_at
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND (routine_name LIKE '%balance%' OR routine_name LIKE '%user%')
ORDER BY created_at DESC
LIMIT 10;

-- Output investigation summary
SELECT 
    'Dashboard Synchronization Investigation Completed' as status,
    NOW() as investigation_time;
