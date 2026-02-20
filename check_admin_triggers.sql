-- Check for Missing Admin Triggers and Bypasses
-- Execute this in Supabase SQL Editor
-- This script identifies missing database components that could cause system issues

-- 1. Check for admin balance update triggers
SELECT 
    'Admin Balance Triggers Check' as check_type,
    triggers.trigger_name,
    triggers.trigger_table,
    triggers.event_manipulation,
    triggers.action_timing,
    triggers.action_condition,
    triggers.action_orientation,
    triggers.created_at,
    triggers.sql_mode
FROM information_schema.triggers 
WHERE triggers.trigger_schema = 'public'
AND (triggers.trigger_table LIKE '%balance%' OR triggers.trigger_table LIKE '%user%' OR triggers.trigger_table LIKE '%profile%')
ORDER BY triggers.created_at DESC
LIMIT 20;

-- 2. Check for admin transaction approval triggers
SELECT 
    'Transaction Approval Triggers Check' as check_type,
    triggers.trigger_name,
    triggers.trigger_table,
    triggers.event_manipulation,
    triggers.action_timing,
    triggers.action_condition,
    triggers.action_orientation,
    triggers.created_at,
    triggers.sql_mode
FROM information_schema.triggers 
WHERE triggers.trigger_schema = 'public'
AND (triggers.trigger_table LIKE '%deposit%' OR triggers.trigger_table LIKE '%withdrawal%')
ORDER BY triggers.created_at DESC
LIMIT 20;

-- 3. Check for admin notification triggers
SELECT 
    'Notification Triggers Check' as check_type,
    triggers.trigger_name,
    triggers.trigger_table,
    triggers.event_manipulation,
    triggers.action_timing,
    triggers.action_condition,
    triggers.action_orientation,
    triggers.created_at,
    triggers.sql_mode
FROM information_schema.triggers 
WHERE triggers.trigger_schema = 'public'
AND (triggers.trigger_table LIKE '%notification%' OR triggers.trigger_table LIKE '%alert%')
ORDER BY triggers.created_at DESC
LIMIT 20;

-- 4. Check for admin user management triggers
SELECT 
    'User Management Triggers Check' as check_type,
    triggers.trigger_name,
    triggers.trigger_table,
    triggers.event_manipulation,
    triggers.action_timing,
    triggers.action_condition,
    triggers.action_orientation,
    triggers.created_at,
    triggers.sql_mode
FROM information_schema.triggers 
WHERE triggers.trigger_schema = 'public'
AND (triggers.trigger_table LIKE '%user%' OR triggers.trigger_table LIKE '%profile%' OR triggers.trigger_table LIKE '%admin%')
ORDER BY triggers.created_at DESC
LIMIT 20;

-- 5. Check for admin audit/log triggers
SELECT 
    'Audit Triggers Check' as check_type,
    triggers.trigger_name,
    triggers.trigger_table,
    triggers.event_manipulation,
    triggers.action_timing,
    triggers.action_condition,
    triggers.action_orientation,
    triggers.created_at,
    triggers.sql_mode
FROM information_schema.triggers 
WHERE triggers.trigger_schema = 'public'
AND (triggers.trigger_table LIKE '%audit%' OR triggers.trigger_table LIKE '%log%')
ORDER BY triggers.created_at DESC
LIMIT 20;

-- 6. Check for admin security bypasses or policies
SELECT 
    'Security Policies Check' as check_type,
    policies.policyname,
    policies.tablename,
    policies.permissive,
    policies.roles,
    policies.cmd,
    policies.with_check,
    policies.created_at
FROM information_schema.policies 
WHERE policies.policyname NOT LIKE '%rls%'
AND (policies.tablename LIKE '%user%' OR policies.tablename LIKE '%balance%' OR policies.tablename LIKE '%transaction%')
ORDER BY policies.created_at DESC
LIMIT 20;

-- 7. Check for admin role bypasses
SELECT 
    'Role Bypass Check' as check_type,
    roles.rolname,
    roles.rolpassword,
    roles.rolcreaterole,
    roles.rolcreatedbypass,
    roles.rolvaliduntil,
    roles.created_at
FROM information_schema.pg_roles 
WHERE roles.rolname LIKE '%admin%'
ORDER BY roles.created_at DESC
LIMIT 10;

-- 8. Check for missing admin functions or procedures
SELECT 
    'Admin Functions Check' as check_type,
    routines.routine_name,
    routines.routine_type,
    routines.routine_definition,
    routines.created_at,
    routines.modified_at
FROM information_schema.routines 
WHERE routines.routine_schema = 'public'
AND (routines.routine_type = 'FUNCTION')
AND (routines.routine_name LIKE '%admin%' OR routines.routine_name LIKE '%balance%' OR routines.routine_name LIKE '%user%' OR routines.routine_name LIKE '%transaction%')
ORDER BY routines.created_at DESC
LIMIT 20;

-- 9. Check for admin views that might bypass normal operations
SELECT 
    'Admin Views Check' as check_type,
    views.viewname,
    views.viewowner,
    views.definition,
    views.created_at
FROM information_schema.views 
WHERE views.viewowner LIKE '%admin%'
ORDER BY views.created_at DESC
LIMIT 20;

-- 10. Check for foreign key constraints that might block admin operations
SELECT 
    'Foreign Key Constraints Check' as check_type,
    constraints.constraint_name,
    constraints.constraint_type,
    constraints.table_name,
    constraints.column_name,
    constraints.foreign_table_name,
    constraints.foreign_column_name,
    constraints.update_rule,
    constraints.delete_rule
FROM information_schema.table_constraints 
WHERE constraints.constraint_type = 'FOREIGN KEY'
AND (constraints.table_name LIKE '%user%' OR constraints.table_name LIKE '%balance%' OR constraints.table_name LIKE '%transaction%')
ORDER BY constraints.constraint_name
LIMIT 20;

-- 11. Check for admin-specific table permissions
SELECT 
    'Admin Table Permissions Check' as check_type,
    table_privileges.table_name,
    table_privileges.privilege_type,
    table_privileges.grantee,
    table_privileges.grantor,
    table_privileges.is_grantable,
    table_privileges.with_hierarchy
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
