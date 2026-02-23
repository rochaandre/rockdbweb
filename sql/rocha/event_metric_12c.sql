@save_sqlplus_settings



/* 
   eventmetric.sql - sqlplus script - displays significant event metrics
   By Luca Jan 2011, 11g version Apr2012 
*/

col "Time /Delta" for a14
col name for a40
col INST_ID for 999
set linesize 400
set pagesize 1000

set wrap off 

col "Avg_FG_wait_ms" format 9990D999
col "Avg_wait_ms" like  "Avg_FG_wait_ms"


select "Time /Delta",inst_id,name, event_id,
        T_per_wait_fg*10 "Avg_FG_wait_ms", 
--		round(T_waited_fg/100,1) "Waited_FG_sec", 
        T_per_wait*10 "Avg_wait_ms", 
		W_count_fg "W_count_FG",
--		round(T_waited/100,1) "Waited_tot_sec", 
		W_count "W_count_tot", num_sess_waiting "N_sess_waiting"
from (
  select to_char(min(begin_time),'hh24:mi:ss')||' /'||round(avg(intsize_csec/100),0)||'s' "Time /Delta",
       em.inst_id,en.name, em.event_id,
       sum(em.time_waited_fg) T_waited_fg, sum(em.time_waited) T_waited,sum(wait_count) W_count, sum(wait_count_fg) W_count_fg,
       sum(decode(em.wait_count, 0,0,em.time_waited/em.wait_count)) T_per_wait,
       sum(decode(em.wait_count_fg, 0,0,em.time_waited_fg/em.wait_count_fg)) T_per_wait_fg,
       sum(em.num_sess_waiting) num_sess_waiting
  from gv$eventmetric em, v$event_name en
  where em.event#=en.event#
      and en.wait_class <>'Idle'
      and en.name like '%&1%'
  group by em.inst_id,en.name,em.event_id
  order by inst_id, T_waited_fg desc
  )
where rownum<=30
--order by "Waited_FG_sec" desc
/


set wrap on 

@restore_sqlplus_settings


