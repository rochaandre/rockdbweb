SELECT
    name,
    isdefault,
    value
FROM gv$sql_optimizer_env
WHERE sql_id = :sql_id
  AND inst_id = :inst_id
ORDER BY name
