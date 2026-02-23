@save_sqlplus_settings

break on instance

set lines 200
col sid format 999
col serial# format 99999
col spid format a6
col schemaname format a8
col osuser format a8
col username format a10 word wrap
col status format a8
col program format a23
col lockwait format a8
col Logon format a18
col osuser format a10 word wrap
col module format a45
col wait_class format a10 truncate
col event format a50 word wrap
col SiW format 9999999
col state format a24

col avg_wait_time format 999G990D99



select /*+ RULE*/ i.instance_name instance, sw.event, sw.state, sw.wait_class, count(*) ,  sum(sw.SECONDS_IN_WAIT) SECONDS_IN_WAIT  , sum(seconds_in_wait)/count(*) avg_wait_time
from  gv$session_wait sw, gv$instance i
where sw.wait_class <> 'Idle'
and   state='WAITING'
and   i.inst_id=sw.inst_id
group by i.instance_name , sw.event, sw.state, sw.wait_class
order by 1,4 desc;


@restore_sqlplus_settings

