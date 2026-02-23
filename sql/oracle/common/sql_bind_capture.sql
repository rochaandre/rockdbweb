-- Bind Variables Capture from V$SQL_BIND_CAPTURE
SELECT 
    inst_id,
    sql_id,
    child_number,
    name,
    position,
    datatype_string,
    precision,
    scale,
    last_captured,
    value_string
FROM gv$sql_bind_capture
WHERE sql_id = :sql_id
AND inst_id = :inst_id
AND child_number = :child_number
ORDER BY position
