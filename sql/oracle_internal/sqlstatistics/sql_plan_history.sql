SELECT
    inst_id,
    child_number,
    plan_hash_value,
    full_plan_hash_value,
    optimizer_mode,
    optimizer_cost,
    executions,
    elapsed_time/decode(executions,0,1,executions)/1000000 avg_etime,
    last_active_time
FROM gv$sql
WHERE sql_id = :sql_id
ORDER BY inst_id, child_number
