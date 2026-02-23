@save_sqlplus_settings

set lines 240
col sid format 999999
col serial# format 999999
col PAI format a8
col spid format a8
col schemaname format a8
col osuser format a8
col status format a8 truncate
col machine format a28
col program format a23
col lockwait format a8
col Logon format a18
col username format a20
col module format a20 truncate
col osuser format a15 truncate
col "ATIVO A" format a13
col CN format 999

select s.sid, s.serial#, p.spid, s.username, s.osuser, s.process pai, 
       to_char(floor(s.last_call_et/3600),'fm0000')||':'||
               to_char(floor(mod(s.last_call_et,3600)/60),'fm00')||':'||
               to_char(mod(mod(s.last_call_et,3600),60),'fm00')||' Hs' "ATIVO A",
       to_char(s.logon_time,'DD-MON-YY HH24:MI:SS') Logon, s.sql_id, 
       s.machine, s.module, /* s.sql_child_number cn, */
       s.status, s.server
from v$session s, v$process p
where p.addr =s.paddr 
and s.username like upper('&&1')
and s.status='ACTIVE'
and s.username is not null
--union 
--select s.sid, s.serial#, p.spid, s.username, s.osuser, s.process pai, 
--       to_char(floor(s.last_call_et/3600),'fm0000')||':'||
--               to_char(floor(mod(s.last_call_et,3600)/60),'fm00')||':'||
--               to_char(mod(mod(s.last_call_et,3600),60),'fm00')||' Hs' "ATIVO A",
--       to_char(s.logon_time,'DD-MON-YY HH24:MI:SS') Logon,  s.sql_id, s.sql_child_number CN,
--       s.machine, s.module, /* s.sql_child_number cn, */
--       s.status, s.server
--from v$session s, v$process p
--where p.addr =s.paddr (+)
--and s.username like upper('&&1')
--and s.status='ACTIVE'
--and s.username is not null 
order by status desc , "ATIVO A" asc
/

@restore_sqlplus_settings

