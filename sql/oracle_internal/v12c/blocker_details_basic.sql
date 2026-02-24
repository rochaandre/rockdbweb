SELECT sid, serial# as serial, username, status, inst_id, sql_id, prev_sql_id, schemaname
FROM gv$session WHERE sid = :sid AND inst_id = :inst_id
