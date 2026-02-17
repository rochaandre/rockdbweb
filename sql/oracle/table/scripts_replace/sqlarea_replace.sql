select * from gv$sql where sql_id='4w5jr3kj0dv4y';
select * from gv$sql where address='' and hash_value=;
select * from gv$sqlarea where sql_id='4w5jr3kj0dv4y';
select * from gv$sqlstats where sql_id='4w5jr3kj0dv4y';
select * from dba_hist_sqlstat where sql_id='4w5jr3kj0dv4y' order by instance_number, snap_id desc;

--1 Plans for a given SQL:
select * from table(DBMS_XPLAN.DISPLAY_CURSOR('4w5jr3kj0dv4y', NULL, 'ALL'));
-- Plan statistics for last execution:
select * from table(DBMS_XPLAN.DISPLAY_CURSOR('4w5jr3kj0dv4y', NULL, 'ALLSTATS LAST'));
-- Plans recorded in AWR - can be used to check if the plan was changing:
select * from table(DBMS_XPLAN.DISPLAY_AWR('4w5jr3kj0dv4y',1428921460,NULL,'ALL'));
select * from table(DBMS_XPLAN.DISPLAY_AWR('4w5jr3kj0dv4y',NULL,NULL,'ALL'));
select * from v$sql_plan where sql_id='4w5jr3kj0dv4y';
select * from dba_hist_sql_plan where sql_id='4w5jr3kj0dv4y';

-- Miscellaneous SQL info:
select * from gv$open_cursor where sql_id='4w5jr3kj0dv4y';
select * from gv$tempseg_usage where sql_id='4w5jr3kj0dv4y';
select sql_id,child_number,name,position,value_string,
  last_captured,was_captured,dup_position,datatype,datatype_string,
  character_sid,precision,scale,max_length 
  from gv$sql_bind_capture where sql_id='4w5jr3kj0dv4y';
select * from gv$sql_optimizer_env where sql_id='4w5jr3kj0dv4y';
select * from gv$sql_plan_statistics where sql_id='4w5jr3kj0dv4y';
select * from gv$sql_plan_statistics_all where sql_id='4w5jr3kj0dv4y';
select * from gv$sql_redirection where sql_id='4w5jr3kj0dv4y';
select * from gv$sql_shared_cursor where sql_id='4w5jr3kj0dv4y';
select * from gv$sql_workarea where sql_id='4w5jr3kj0dv4y';
select * from gv$sql_workarea_active where sql_id='4w5jr3kj0dv4y';
select * from gv$active_session_history where sql_id='4w5jr3kj0dv4y' order by sample_time desc;

--2 Create Outline:
begin 
 DBMS_OUTLN.CREATE_OUTLINE (
  hash_val => , 
  child_num => 0, 
  category => 'DEFAULT' 
  ); 
end; 
/

--3 Create Baseline (11g+):
declare 
n number; 
begin 
 n:=DBMS_SPM.load_plans_from_cursor_cache(
  sql_id =>'4w5jr3kj0dv4y',
  plan_hash_value =>1428921460,
  fixed => 'NO',
  enabled => 'YES'
  ); 
 dbms_output.put_line('Baselines created: '||n);
end; 
/
