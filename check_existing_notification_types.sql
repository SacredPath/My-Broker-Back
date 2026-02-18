-- Check existing notification types in the database
SELECT DISTINCT type, COUNT(*) as count
FROM notifications 
GROUP BY type 
ORDER BY type;
