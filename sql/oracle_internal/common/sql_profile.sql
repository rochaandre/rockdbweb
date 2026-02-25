-- ######################
-- # create a tunning task
-- ######################
-- define my_sql_id = 'xxxx'
 
define my_sql_id = ':sql_id'



SET serveroutput ON
DECLARE
  l_sql_tune_task_id  VARCHAR2(100);
BEGIN
  l_sql_tune_task_id := DBMS_SQLTUNE.create_tuning_task (
                          sql_id      => '&&my_sql_id',
                          scope       => DBMS_SQLTUNE.scope_comprehensive,
                          time_limit  => 60,
                          task_name   => 'sql_tuning_task_&&my_sql_id',
                          description => 'Tuning task for statement &&my_sql_id.');
  DBMS_OUTPUT.put_line('l_sql_tune_task_id: ' || l_sql_tune_task_id);
END;
/

-- ######################
-- # status
-- ######################
 
SELECT task_name, STATUS 
FROM dba_advisor_log WHERE task_name LIKE 'sql_tuning_task_&&my_sql_id';

-- ######################
-- # execute
-- ######################
EXEC DBMS_SQLTUNE.execute_tuning_task(task_name => 'sql_tuning_task_&&my_sql_id');
SELECT task_name, STATUS FROM dba_advisor_log WHERE task_name LIKE 'sql_tuning_task_&&my_sql_id';

-- ######################
-- # recommendations
-- ######################
SET LINES 150
SET pages 50000
SET long 5000000
SET longc 5000000
 
SELECT DBMS_SQLTUNE.report_tuning_task('sql_tuning_task_&&my_sql_id') AS recommendations FROM dual;

-- ######################
-- # accept
-- ######################
--execute dbms_sqltune.accept_sql_profile(task_name => 'sql_tuning_task_8nb5uzq87yfdp', task_owner => 'SYS', replace =>  TRUE, profile_type => DBMS_SQLTUNE.PX_PROFILE);
--execute dbms_sqltune.accept_sql_profile(task_name => 'sql_tuning_task_&&my_sql_id', task_owner => 'SYS', replace =>  TRUE, profile_type => DBMS_SQLTUNE.PX_PROFILE);

execute dbms_sqltune.accept_sql_profile(task_name => 'sql_tuning_task_&&my_sql_id', task_owner => 'SYS', replace => TRUE);
 

-- ######################
-- # Drop tunning task
-- ######################
BEGIN
  DBMS_SQLTUNE.drop_tuning_task (task_name => 'sql_tuning_task_&&my_sql_id');
END;
/
SELECT task_name, STATUS 
FROM dba_advisor_log 
WHERE task_name LIKE 'sql_tuning_task_&&my_sql_id';



-- ######################
-- # FIND SQL ID
-- ######################

select a.instance_number inst_id, a.snap_id,a.plan_hash_value, to_char(begin_interval_time,'dd-mon-yy hh24:mi') btime, abs(extract(minute from (end_interval_time-begin_interval_time)) + extract(hour from (end_interval_time-begin_interval_time))*60 + extract(day from (end_interval_time-begin_interval_time))*24*60) minutes,
executions_delta executions, round(ELAPSED_TIME_delta/1000000/greatest(executions_delta,1),4) "avg duration (sec)" from dba_hist_SQLSTAT a, dba_hist_snapshot b
where sql_id='&sql_id' and a.snap_id=b.snap_id
and a.instance_number=b.instance_number
order by snap_id desc, a.instance_number;


-- ######################
-- # A DBA_HIST_SQLSTAT query that I am very found of
-- ######################


prompt enter start and end times in format DD-MON-YYYY [HH24:MI]
  
column sample_end format a21
select to_char(min(s.end_interval_time),'DD-MON-YYYY DY HH24:MI') sample_end
, q.sql_id
, q.plan_hash_value
, sum(q.EXECUTIONS_DELTA) executions
, round(sum(DISK_READS_delta)/greatest(sum(executions_delta),1),1) pio_per_exec
, round(sum(BUFFER_GETS_delta)/greatest(sum(executions_delta),1),1) lio_per_exec
, round((sum(ELAPSED_TIME_delta)/greatest(sum(executions_delta),1)/1000),1) msec_exec
from dba_hist_sqlstat q, dba_hist_snapshot s
where q.SQL_ID=trim(':sqlid')
and s.snap_id = q.snap_id
and s.dbid = q.dbid
and s.instance_number = q.instance_number
and s.end_interval_time >= to_date(trim('&start_time.'),'dd-mon-yyyy hh24:mi')
and s.begin_interval_time <= to_date(trim('&end_time.'),'dd-mon-yyyy hh24:mi')
-- and substr(to_char(s.end_interval_time,'DD-MON-YYYY DY HH24:MI'),13,2) like '%&hr24_filter.%'
group by s.snap_id
, q.sql_id
, q.plan_hash_value
order by s.snap_id, q.sql_id, q.plan_hash_value;
 