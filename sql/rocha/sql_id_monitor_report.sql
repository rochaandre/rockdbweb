@save_sqlplus_settings

--
-- Generates and prints sql_monitor report for a given sql_id
-- Luca Jan 2014
-- Usage: @monitor_report sql_id sql_exec_id

set long 10000000
set longchunksize 10000000
set pages 0
set lines 1500
set verify off
set heading off

SELECT  DBMS_SQLTUNE.REPORT_SQL_MONITOR(SQL_ID=>'&1', SQL_EXEC_ID=>'&2', report_level=>'ALL') as report FROM dual;


@restore_sqlplus_settings


