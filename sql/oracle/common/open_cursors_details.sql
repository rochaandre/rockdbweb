-- Open Cursors Details
SELECT 
    s.sid,
    s.serial#,
    s.username,
    s.osuser,
    s.machine,
    s.program,
    c.sql_id,
    c.sql_text,
    c.count_as_open
FROM v$session s
JOIN (
    SELECT sid, sql_id, sql_text, count(*) as count_as_open
    FROM v$open_cursor
    GROUP BY sid, sql_id, sql_text
) c ON s.sid = c.sid
ORDER BY c.count_as_open DESC;
