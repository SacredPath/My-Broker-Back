-- Check RLS policies for wallet_balances table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check,
    as_bypass
FROM pg_policies 
WHERE tablename = 'wallet_balances' 
    AND schemaname = 'public'
ORDER BY policyname;

-- Also check if admin role has bypass
SELECT 
    rolname,
    rolbypassrls,
    rolcreaterole,
    rolcreatedb,
    rolcatupdate
FROM pg_roles 
WHERE rolname = 'authenticated' OR rolname = 'anon' OR rolname LIKE '%admin%';
