-- Bind Variables Capture from V$SQL_BIND_CAPTURE
SELECT 
    inst_id,
    sql_id,
    child_number,
    name,
    position,
    datatype_string,
    value_string,
    last_captured
FROM gv$sql_bind_capture
WHERE sql_id = :sql_id
AND inst_id = :inst_id
AND rownum <= 100
ORDER BY child_number, position
