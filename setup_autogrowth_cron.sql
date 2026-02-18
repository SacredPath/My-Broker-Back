-- Setup cron job for daily autogrowth (if supported by your Supabase plan)
-- Note: This requires pg_cron extension which may not be available in all Supabase plans

-- Enable pg_cron extension (requires superuser privileges)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily autogrowth at 12:00 AM UTC
-- SELECT cron.schedule(
--     'daily-autogrowth',
--     '0 0 * * *',  -- Every day at midnight UTC
--     'SELECT trigger_daily_autogrowth();'
-- );

-- Alternative: Schedule at a specific time (e.g., 8:00 AM UTC)
-- SELECT cron.schedule(
--     'daily-autogrowth-8am',
--     '0 8 * * *',  -- Every day at 8:00 AM UTC
--     'SELECT trigger_daily_autogrowth();'
-- );

-- View scheduled jobs
-- SELECT * FROM cron.job;

-- For manual testing without cron, you can use the API endpoint
-- or call the function directly:
-- SELECT trigger_daily_autogrowth();
