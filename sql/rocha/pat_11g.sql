@save_sqlplus_settings

col sid format 999999
col serial# format 99999
col spid format 99999999
col pai  format 99999999
col process format 99999999
col username format a10
col osuser format a8
col status format a8
col sql_text format a100 word_wrap
col lockwait format a3
col Logon format a20
col machine format a20 truncate
col program format a50 truncate
col module  format a40 truncate
col state   format a10 truncate
COL SQL_EXEC_START FORMAT A20


select s.sid, s.serial#, p.pid process, p.spid, s.process PAI, s.port, s.machine, s.username, s.osuser, 
s.status, to_char(s.logon_time,'DD-MON-YY HH24:MI:SS') Logon
from v$session s,  v$process p
where s.sid=&1
and  p.addr=s.paddr
order by sid, serial#;

select s.program, p.program, s.module, s.action
from v$session s, v$process p
where s.sid=&1
and  p.addr=s.paddr
;

--select st.sql_text 
--from v$session s, V$SQLtext st
--where s.sql_address = st.address (+)
--and s.sql_hash_value = st.hash_value (+)
--and s.sid=&1
--order by sid, serial#, piece;

select s.sql_id, s.sql_child_number CN, st.plan_hash_value phv, TO_CHAR(s.SQL_EXEC_START,'DD-MON-YYYY HH24:MI:SS') SQL_EXEC_START, s.SQL_EXEC_ID, s.seconds_in_wait SIW, s.state, st.sql_text 
from v$session s, V$SQLAREA st
where s.sql_address = st.address (+)
and s.sql_hash_value = st.hash_value (+)
and s.sid=&1
order by sid, serial#;

@restore_sqlplus_settings




