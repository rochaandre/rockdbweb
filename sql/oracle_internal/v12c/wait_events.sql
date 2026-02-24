-- Top Wait Events by Schema
SELECT 
    se.event, 
    sum(se.total_waits) as total_waits, 
    round(sum(se.time_waited_micro)/1000000, 2) as time_waited_s,
    round(avg(se.average_wait)/100, 2) as avg_wait_ms,
    se.wait_class,
    s.schemaname as owner
FROM v$session_event se
JOIN v$session s ON se.sid = s.sid
WHERE se.wait_class != 'Idle'
AND s.schemaname LIKE :owner_filter
AND se.event LIKE :event_filter
GROUP BY se.event, se.wait_class, s.schemaname
ORDER BY time_waited_s DESC
FETCH FIRST 10 ROWS ONLY
