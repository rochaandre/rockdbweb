-- SQL Details by SQL_ID
SELECT 
    sql_id,
    parsing_schema_name as owner,
    executions,
    round(elapsed_time/1000000, 2) as elapsed_s,
    round(cpu_time/1000000, 2) as cpu_s,
    buffer_gets,
    disk_reads,
    sql_fulltext
FROM v$sql
WHERE sql_id = :sql_id
AND rownum = 1
