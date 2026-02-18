-- View the actual source code of the process function
SELECT prosrc 
FROM pg_proc 
WHERE proname = 'process_admin_balance_updates';
