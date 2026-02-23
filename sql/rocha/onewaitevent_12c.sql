@save_sqlplus_settings

set linesize 32000
set pagesize 1000
set long 2000000000
set longchunksize 1000
set head off;
set verify off;
set termout off;
 
set head on
set termout on
set trimspool on

UNDEFINE WAITNAME
UNDEFINE MINIMUMWAITS

define WAITNAME="&1"

column END_INTERVAL_TIME format a26
column Time format a14

select to_char(sn.END_INTERVAL_TIME, 'HH24:MI:SS') Time , sn.instance_number inst_id, before.event_name name, before.event_id,
(after.time_waited_micro_FG-before.time_waited_micro_FG)/(after.total_waits_FG-before.total_waits_FG)/1000 "Avg_FG_wait_ms",
(after.time_waited_micro-before.time_waited_micro)/(after.total_waits-before.total_waits)/1000             "Avg_wait_ms",
(after.total_waits_fg-before.total_waits_fg) "W_count_FG",
(after.total_waits-before.total_waits) "W_count_tot"
--(after.num_sess_waiting-before.num_sess_waiting) "N_sess_waiting"
from DBA_HIST_SYSTEM_EVENT before, DBA_HIST_SYSTEM_EVENT after,DBA_HIST_SNAPSHOT sn
where before.event_name='&&WAITNAME' and
after.event_name=before.event_name and
after.snap_id=before.snap_id+1 and
after.instance_number=1 and
before.instance_number=after.instance_number and
after.snap_id=sn.snap_id and
after.instance_number=sn.instance_number 
and sn.end_interval_time >= sysdate-6/24
-- and (after.total_waits-before.total_waits) > MINIMUMWAITS
order by after.snap_id desc;


@restore_sqlplus_settings
