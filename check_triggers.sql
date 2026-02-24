-- Check all triggers in the database
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    p.proname as function_name,
    t.tgenabled as is_enabled
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'notifications'
ORDER BY c.relname, t.tgname;

-- Check trigger function source code
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name LIKE '%updated_at%' 
    AND routine_type = 'FUNCTION';
