-- Active Schemas from Current Sessions
SELECT DISTINCT schemaname as owner
FROM v$session
WHERE username IS NOT NULL
AND type != 'BACKGROUND'
ORDER BY 1
