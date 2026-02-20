-- Check for Missing Admin Triggers and Bypasses
-- Execute this in Supabase SQL Editor
-- This script identifies missing database components that could cause system issues

-- 1. Check for admin balance update triggers
SELECT 
    'Admin Balance Triggers Check' as check_type,
    trigger_name,
    trigger_table,
    event_manipulation,
    action_timing,
    action_condition,
    action_orientation,
    created_at,
    sql_mode
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND (trigger_table LIKE '%balance%' OR trigger_table LIKE '%user%' OR trigger_table LIKE '%profile%')
ORDER BY created_at DESC
LIMIT 20;

-- 2. Check for admin transaction approval triggers
SELECT 
    'Transaction Approval Triggers Check' as check_type,
    trigger_name,
    trigger_table,
    event_manipulation,
    action_timing,
    action_condition,
    action_orientation,
    created_at,
    sql_mode
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND (trigger_table LIKE '%deposit%' OR trigger_table LIKE '%withdrawal%')
ORDER BY created_at DESC
LIMIT 20;

-- 3. Check for admin notification triggers
SELECT 
    'Notification Triggers Check' as check_type,
    trigger_name,
    trigger_table,
    event_manipulation,
    action_timing,
    action_condition,
    action_orientation,
    created_at,
    sql_mode
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND (trigger_table LIKE '%notification%' OR trigger_table LIKE '%alert%')
ORDER BY created_at DESC
LIMIT 20;

-- 4. Check for admin user management triggers
SELECT 
    'User Management Triggers Check' as check_type,
    trigger_name,
    trigger_table,
    event_manipulation,
    action_timing,
    action_condition,
    action_orientation,
    created_at,
    sql_mode
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND (trigger_table LIKE '%user%' OR trigger_table LIKE '%profile%' OR trigger_table LIKE '%admin%')
ORDER BY created_at DESC
LIMIT 20;

-- 5. Check for admin audit/log triggers
SELECT 
    'Audit Triggers Check' as check_type,
    trigger_name,
    trigger_table,
    event_manipulation,
    action_timing,
    action_condition,
    action_orientation,
    created_at,
    sql_mode
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND (trigger_table LIKE '%audit%' OR trigger_table LIKE '%log%')
ORDER BY created_at DESC
LIMIT 20;

-- 6. Check for admin security bypasses or policies
SELECT 
    'Security Policies Check' as check_type,
    policyname,
    tablename,
    permissive,
    roles,
    cmd,
    with_check,
    created_at
FROM information_schema.policies 
WHERE policyname NOT LIKE '%rls%'
AND (tablename LIKE '%user%' OR tablename LIKE '%balance%' OR tablename LIKE '%transaction%')
ORDER BY created_at DESC
LIMIT 20;

-- 7. Check for admin role bypasses
SELECT 
    'Role Bypass Check' as check_type,
    rolname,
    rolpassword,
    rolcreaterole,
    rolcreatedbypass,
    rolvaliduntil,
    created_at
FROM information_schema.pg_roles 
WHERE rolname LIKE '%admin%'
ORDER BY created_at DESC
LIMIT 10;

-- 8. Check for missing admin functions or procedures
SELECT 
    'Admin Functions Check' as check_type,
    routine_name,
    routine_type,
    routine_definition,
    created_at,
    modified_at
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND (routine_type = 'FUNCTION')
AND (routine_name LIKE '%admin%' OR routine_name LIKE '%balance%' OR routine_name LIKE '%user%' OR routine_name LIKE '%transaction%')
ORDER BY created_at DESC
LIMIT 20;

-- 9. Check for admin views that might bypass normal operations
SELECT 
    'Admin Views Check' as check_type,
    viewname,
    viewowner,
    definition,
    created_at
FROM information_schema.views 
WHERE viewowner LIKE '%admin%'
ORDER BY created_at DESC
LIMIT 20;

-- 10. Check for foreign key constraints that might block admin operations
SELECT 
    'Foreign Key Constraints Check' as check_type,
    constraint_name,
    constraint_type,
    table_name,
    column_name,
    foreign_table_name,
    foreign_column_name,
    update_rule,
    delete_rule
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY'
AND (table_name LIKE '%user%' OR table_name LIKE '%balance%' OR table_name LIKE '%transaction%')
ORDER BY constraint_name
LIMIT 20;

-- 11. Check for admin-specific table permissions
SELECT 
    'Admin Table Permissions Check' as check_type,
    table_name,
    privilege_type,
    grantee,
    grantor,
    is_grantable,
    with_hierarchy
FROM information_schema.table_privileges 
WHERE table_name LIKE '%user%'
OR table_name LIKE '%balance%'
OR table_name LIKE '%transaction%'
OR table_name LIKE '%admin%'
ORDER BY table_name, privilege_type
LIMIT 30;

-- 12. Check for admin-specific column privileges
SELECT 
    'Admin Column Privileges Check' as check_type,
    table_name,
    column_name,
    privilege_type,
    grantee,
    grantor,
    is_grantable
FROM information_schema.column_privileges 
WHERE table_name LIKE '%user%'
OR table_name LIKE '%balance%'
OR table_name LIKE '%transaction%'
OR table_name LIKE '%admin%'
ORDER BY table_name, column_name, privilege_type
LIMIT 30;

-- Output comprehensive check summary
SELECT 
    'Admin System Check Completed' as status,
    NOW() as check_time,
    'Review results to identify missing triggers, bypasses, or security issues' as next_step;
