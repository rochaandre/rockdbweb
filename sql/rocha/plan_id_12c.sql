@save_sqlplus_settings

prompt
prompt Usage: @plan_id_11g <sql_id> <child_number>

set lines 400
set pages 5000

set markup html preformat on
select plan_table_output from table(dbms_xplan.display_cursor(sql_id=>'&1', cursor_child_no=>&2, FORMAT=>'ALL ADVANCED ALLSTATS'));


@restore_sqlplus_settings
