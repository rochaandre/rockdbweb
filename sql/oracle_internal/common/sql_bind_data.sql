-- Peeked Bind Variables from V$SQL_BIND_DATA
SELECT 
    inst_id,
    sql_id,
    child_number,
    cursor_address,
    position,
    datatype,
    datatype_string,
    max_length,
    precision,
    scale,
    last_captured,
    value_string
FROM gv$sql_bind_data
WHERE sql_id = :sql_id
AND inst_id = :inst_id
AND child_number = :child_number
ORDER BY position
