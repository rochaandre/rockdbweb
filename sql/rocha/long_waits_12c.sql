@save_sqlplus_settings

col sid format 999999
col spid format 99999999
col event format a40
col serial# format 99999
col username format a20
col osuser format a8
col status format a8
col sql_text format a100 word_wrap
col lockwait format a3
col Data format a20
set pages 80
set lines 200

break on sid skip 0 on serial# on username on serial# on username on osuser on status on lockwait on Data

select /*+ RULE */ vs.username, vs.sid, vs.serial#, vp.spid, vsw.event, vsw.seq#, vsw.P1, vsw.P2, vsw.P3, vsw.wait_time, vsw.seconds_in_wait, vsw.state
--,vsw.P1text, vsw.P2text, vsw.P3text
from  v$session_wait vsw, v$session vs, v$process vp
where vp.addr=vs.paddr
and   vsw.sid=vs.sid
and   vsw.seconds_in_wait>=5
and   vsw.state = 'WAITING'
and   vs.type='USER'
and   vs.username is not null
and   vs.wait_class <> 'Idle'
order by vsw.seconds_in_wait desc;

@restore_sqlplus_settings
