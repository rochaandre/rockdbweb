
SELECT
    incarnation#,
    resetlogs_change#,
    to_char(resetlogs_time, 'YYYY-MM-DD HH24:MI:SS') AS resetlogs_time,
    status
FROM
    V$DATABASE_INCARNATION
ORDER BY
    incarnation# ;