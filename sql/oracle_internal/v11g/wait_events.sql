-- Top Wait Events
SELECT * FROM (
    SELECT 
        event, 
        total_waits, 
        round(time_waited_micro/1000000, 2) as time_waited_s,
        round(average_wait/100, 2) as avg_wait_ms,
        wait_class
    FROM v$system_event
    WHERE wait_class != 'Idle'
    AND event LIKE :event_filter
    ORDER BY time_waited_micro DESC
) WHERE rownum <= 10
