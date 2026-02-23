@save_sqlplus_settings

spool sql_id_tuning_&1&_CONNECT_IDENTIFIER.lst


DECLARE
  l_sql_tune_task_id  VARCHAR2(100);
BEGIN
  l_sql_tune_task_id := DBMS_SQLTUNE.create_tuning_task (
                          sql_id      => '&1',
                          scope       => DBMS_SQLTUNE.scope_comprehensive,
                          time_limit  => 500,
                          task_name   => '&1',
                          description => 'Tuning task for statement &1.');
END;
/
 
exec dbms_sqltune.execute_tuning_task(task_name => '&1');
 
 
set long 1000000;
set longchunksize 100000
set pagesize 10000
set linesize 1000

select dbms_sqltune.report_tuning_task('&1', type => 'TEXT', section => 'ALL') as recomendacoes from dual;

select dbms_sqltune.script_tuning_task('&1', rec_type => 'ALL')                as scripts       from dual;

--exec dbms_sqltune.drop_tuning_task(task_name => '&1');

spool off

@restore_sqlplus_settings