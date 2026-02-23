@save_sqlplus_settings

spool sql_id_tuning_result_&1&_CONNECT_IDENTIFIER.lst


 
set long 1000000;
set longchunksize 100000
set pagesize 10000
set linesize 1000

select dbms_sqltune.report_tuning_task('&1', type => 'TEXT', section => 'ALL') as recomendacoes from dual;

select dbms_sqltune.script_tuning_task('&1', rec_type => 'ALL')                as scripts       from dual;

--exec dbms_sqltune.drop_tuning_task(task_name => '&1');

spool off

@restore_sqlplus_settings