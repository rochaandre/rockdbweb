SELECT  distinct 
    s.inst_id,
    s.sid, 
    s.serial# as "serial#", 
    s.username, 
    s.status, 
    s.program, 
    s.machine, 
    s.type,
    s.sql_id, 
    s.sql_child_number as child,
    q.full_plan_hash_value  as plan_hash,
    s.prev_sql_id, 
    s.last_call_et, 
    s.event, 
    s.wait_class, 
    s.seconds_in_wait,
    pr.spid as spid,
    round(pr.pga_used_mem / 1024 / 1024, 2) as pga_used_mb,
    round(pr.pga_max_mem / 1024 / 1024, 2) as pga_max_mb,
    s.paddr as bg_name, -- Actually paddr, but often used to find bg name in v$bgprocess
    s.service_name as service,
    s.osuser,
    s.terminal,
    s.module,
    (SELECT ROUND(sum(physical_reads + block_gets + consistent_gets)/1024, 2) FROM gv$sess_io WHERE sid = s.sid AND inst_id = s.inst_id) as file_io,
    (SELECT value FROM gv$sesstat st, v$statname sn WHERE st.sid = s.sid AND st.inst_id = s.inst_id AND st.statistic# = sn.statistic# AND sn.name = 'CPU used by this session') as cpu,
    (SELECT command_name FROM v$sqlcommand WHERE command_type = s.command) as command,
    s.row_wait_obj# as lck_obj,
    (SELECT count(*) FROM gv$px_session WHERE qcsid = s.sid AND inst_id = s.inst_id) as pqs,
    s.schemaname as owner,
    s.last_call_et as elapsed,
    (SELECT ROUND(SUM(u.blocks * (SELECT block_size FROM dba_tablespaces WHERE tablespace_name = u.tablespace))/1024/1024, 2) 
     FROM gv$sort_usage u WHERE u.session_num = s.serial# AND u.inst_id = s.inst_id) as temp,
    (SELECT round((sofar/totalwork)*100, 2) FROM gv$session_longops WHERE sid = s.sid AND inst_id = s.inst_id AND sofar < totalwork AND rownum = 1) as compl_pct,
    (SELECT elapsed_seconds FROM gv$session_longops WHERE sid = s.sid AND inst_id = s.inst_id AND sofar < totalwork AND rownum = 1) as elaps_s,
    (SELECT time_remaining FROM gv$session_longops WHERE sid = s.sid AND inst_id = s.inst_id AND sofar < totalwork AND rownum = 1) as rem_s
FROM gv$session s
  LEFT JOIN gv$sql q ON s.sql_id = q.sql_id AND s.inst_id = q.inst_id AND s.sql_child_number = q.child_number
  LEFT JOIN gv$process pr ON s.paddr = pr.addr AND s.inst_id = pr.inst_id
{where_clause}
ORDER BY s.last_call_et DESC
