--1 Alter attribute of SQL Plan Baseline. Attribute_name can be one of:
--  'ENABLED', 'FIXED', 'AUTOPURGE', 'PLAN_NAME', 'DESCRIPTION'
declare 
n number; 
begin 
 n:=DBMS_SPM.alter_sql_plan_baseline(
  sql_handle =>NULL,
  plan_name =>'$OBJ_NAME',
  attribute_name => 'ENABLED',
  attribute_value => 'YES'
  ); 
 dbms_output.put_line('Baselines altered: '||n);
end; 
/
--2 Drop SQL Plan Baseline.
declare 
n number; 
begin 
 n:=DBMS_SPM.drop_sql_plan_baseline(
  sql_handle =>NULL,
  plan_name =>'$OBJ_NAME'
  ); 
 dbms_output.put_line('Baseline plans dropped: '||n);
end; 
/
