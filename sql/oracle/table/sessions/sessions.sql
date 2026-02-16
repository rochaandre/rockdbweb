--Active sessions
select * from v$session
where status='ACTIVE' --and sid in ($SID)
order by sid;

--Find session's sid or process id by it's sid or process id
select sid, a.serial#, spid, a.username, status, taddr, a.program 
from v$session a, v$process b 
where a.paddr=b.addr and a.username is not null and (sid=$SID or spid=$SPID)
order by status, sid;

--Kill session:
--alter system kill session '$SID,$SERIAL';

--Long operations
select sid,username usern,serial#,opname,target,sofar,totalwork tot_work,units,
time_remaining remaning,elapsed_seconds elapsed,last_update_time last_time
from gv$session_longops where sid=$SID and inst_id=$INST_ID
order by last_update_time desc;

-- Miscellaneous Session info:
select * from gv$open_cursor where sid=$SID and inst_id=$INST_ID;
select * from dba_hist_sessmetric_history 
  where sessid=$SID and serial#=$SERIAL and instance_number=$INST_ID;
select * from gv$active_session_history 
  where session_id=$SID and session_serial#=$SERIAL and inst_id=$INST_ID
  order by sample_time desc;
select * from gv$lock where sid=$SID and inst_id=$INST_ID;
select * from gv$rsrc_session_info where sid=$SID and inst_id=$INST_ID;
select * from gv$ses_optimizer_env where sid=$SID and inst_id=$INST_ID order by isdefault, name;
select * from gv$sess_io where sid=$SID and inst_id=$INST_ID;
select * from gv$sess_time_model where sid=$SID and inst_id=$INST_ID;
select * from gv$session_connect_info where sid=$SID and inst_id=$INST_ID;
select * from gv$session_event where sid=$SID and inst_id=$INST_ID;
select * from gv$session_wait_class where sid=$SID and inst_id=$INST_ID;
select * from gv$session_wait_history where sid=$SID and inst_id=$INST_ID;
select * from gv$sessmetric 
  where session_id=$sid and serial_num=$serial and inst_id=$INST_ID
  order by begin_time desc;
select /*+ordered*/ name, value 
   from gv$sesstat a,v$statname b,gv$session c
   where a.statistic#=b.statistic# and value>0 and a.sid=c.sid and a.inst_id=c.inst_id
   and a.inst_id=$INST_ID and a.sid=$sid and c.serial#=$SERIAL;
select * from gv$sql_workarea_active where sid=$SID and inst_id=$INST_ID;
