SELECT id, operation, options, object_name as object, cost
FROM gv$sql_plan
WHERE sql_id = :sql_id AND inst_id = :inst_id AND child_number = (
    SELECT min(child_number) FROM gv$sql_plan WHERE sql_id = :sql_id AND inst_id = :inst_id
)
ORDER BY id
