-- Top Queries by CPU Time
SELECT * FROM (
  SELECT 
    sql_id, 
    parsing_schema_name as owner, 
    executions, 
    round(cpu_time/1000000, 2) as cpu_s, 
    round(elapsed_time/1000000, 2) as elapsed_s, 
    buffer_gets, 
    disk_reads, 
    substr(sql_text, 1, 100) as sql_snippet
  FROM v$sql
  WHERE parsing_schema_name LIKE :owner_filter
  ORDER BY cpu_time DESC
) WHERE rownum <= 10
