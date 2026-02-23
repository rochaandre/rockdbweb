@save_sqlplus_settings

col sid format 999999
col event format a60
col serial# format 99999
col username format a8
col osuser format a8
col status format a8
col sql_text format a100 word_wrap
col lockwait format a3
col P1 format 9999999999
col P2 format 9999999999
col P3 format 9999999
col P1TEXT format a10 truncate
col P2TEXT format a10 truncate
col P3TEXT format a10 truncate
col seq# format 999999
col Data format a20
col event format a30 truncate
set lines 240

break on sid skip 0 on serial# on username on serial# on username on osuser on status on lockwait on Data

select sid, event, seq#, P1TEXT, P1, P1raw, P2TEXT, P2, P2raw, P3TEXT, P3, P3raw,
state, seconds_in_wait "SiW"
from v$session_wait vsw
where vsw.sid like '&1'
and vsw.state ='WAITING'
--and vsw.EVENT not in (select event from  perfstat.stats$idle_event );

@restore_sqlplus_settings

