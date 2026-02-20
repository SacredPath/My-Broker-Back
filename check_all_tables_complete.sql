-- Check ALL tables including system tables
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema IN ('public', 'auth') 
    AND table_type = 'BASE TABLE'
ORDER BY table_schema, table_name;

-- Check for functions/triggers
SELECT 
    routine_name,
    routine_type,
    routine_schema
FROM information_schema.routines 
WHERE routine_schema IN ('public', 'auth')
ORDER BY routine_schema, routine_name;

-- Check for triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_condition,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY trigger_name;
