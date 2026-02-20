-- Corrected System Diagnosis - Fixed UNION Column Issues
-- Execute this in Supabase SQL Editor
-- This script diagnoses why critical system functions are not working

-- 1. Check if users have balance columns and current values
SELECT 
    'User Balance Check' as diagnosis_type,
    COUNT(*) as total_users,
    COUNT(CASE WHEN balance IS NULL THEN 1 END) as users_missing_balance_column,
    COUNT(CASE WHEN balance = 0 THEN 1 END) as users_with_zero_balance,
    COUNT(CASE WHEN balance > 0 THEN 1 END) as users_with_positive_balance,
    AVG(balance) as average_balance
FROM profiles

UNION ALL

-- 2. Check recent transaction approvals and their impact
SELECT 
    'Transaction Approval Impact' as diagnosis_type,
    COUNT(*) as total_transactions,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_transactions,
    COUNT(CASE WHEN status = 'approved' AND processed_at IS NULL THEN 1 END) as approved_but_unprocessed,
    COUNT(CASE WHEN status = 'approved' AND processed_at IS NOT NULL THEN 1 END) as approved_and_processed
FROM (
    SELECT status, processed_at FROM deposit_requests 
    WHERE created_at >= NOW() - INTERVAL '24 hours'
    
    UNION ALL
    
    SELECT status, processed_at FROM withdrawal_requests 
    WHERE created_at >= NOW() - INTERVAL '24 hours'
) recent_transactions

UNION ALL

-- 3. Check notification system
SELECT 
    'Notification System Check' as diagnosis_type,
    COUNT(*) as total_notifications,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as recent_notifications,
    COUNT(CASE WHEN is_read = false THEN 1 END) as unread_notifications,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as notifications_missing_user,
    COUNT(CASE WHEN message IS NULL OR message = '' THEN 1 END) as notifications_missing_message
FROM notifications

UNION ALL

-- 4. Check audit log for recent admin actions
SELECT 
    'Admin Action Audit' as diagnosis_type,
    COUNT(*) as total_admin_actions,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as recent_admin_actions,
    COUNT(CASE WHEN action LIKE '%balance%' THEN 1 END) as balance_related_actions,
    COUNT(CASE WHEN action LIKE '%deposit%' OR action LIKE '%withdrawal%' THEN 1 END) as transaction_related_actions,
    COUNT(CASE WHEN action LIKE '%notification%' THEN 1 END) as notification_related_actions
FROM audit_log 
WHERE actor_role = 'admin'

UNION ALL

-- 5. Check for balance-related triggers or functions
SELECT 
    'Trigger/Function Check' as diagnosis_type,
    routine_name,
    routine_type,
    created_at
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND (routine_name LIKE '%balance%' OR routine_name LIKE '%user%')
ORDER BY created_at DESC
LIMIT 10;

-- Output diagnosis summary
SELECT 
    'System Diagnosis Completed' as status,
    NOW() as diagnosis_time,
    'Execute this script to identify root causes of system issues' as next_step;
