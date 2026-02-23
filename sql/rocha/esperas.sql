set lines 300
col SECONDS_IN_WAIT for 9999999999999
col WAIT_CLASS             for a30
prompt Waits without idle events.
break on instance
select i.instance_name instance, sw.event,sw.wait_class, count(*) , sum(sw.SECONDS_IN_WAIT) SECONDS_IN_WAIT  
from gv$session_wait sw, gv$instance i
where sw.event not in (SELECT DISTINCT EVENT_NAME FROM SYS.WRH$_EVENT_NAME WHERE WAIT_CLASS = 'Idle')
and i.inst_id=sw.inst_id
group by i.instance_name , sw.event, sw.wait_class
order by 1,4 desc
/
