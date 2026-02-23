@save_sqlplus_settings

set lines 400

prompt
prompt Usage: @sql_id_10g <sql_id>

col sql_text format a70 word_wrap
col sid format 999999
col pai format 9999999
col serial# format 99999
col spid format a9
col schemaname format a8
col username format a8
col status format a12 truncate
col program format a23
col lockwait format a8
col Logon format a18
col username format a20
col osuser format a12 truncate
col machine format a25
col "ATI/INAT A" format a13
col modo format a8
col cost format 9999999
col modo format a8 truncate
col executions format 999G999G999G990

col "CPU(s)" format 999G999G999
col "ELA(s)" format 999G999G999
col "CPU/EXE" format 999G990D99999
col "ELA/EXE" format 999G990D99999
col SORTS format 99999
col CN format 999
col module format a25 truncate
col rowss format 999G999G990
col sql_profile format a30 


select address, sql_id, hash_value, old_hash_value, SQL_PROFILE, sql_text from v$sqlarea
where sql_id ='&1';

select FIRST_LOAD_TIME, executions from v$sqlarea
where sql_id ='&1';


select vs.sid, vs.serial#, vs.inst_id, vp.spid, vs.process pai, vs.sql_id, vs.SQL_CHILD_NUMBER CN, vs.username, vs.osuser, vs.machine, vs.module, vs.status, to_char(floor(vs.last_call_et/3600),'fm0000')||':'||
to_char(floor(mod(vs.last_call_et,3600)/60),'fm00')||':'||
to_char(mod(mod(vs.last_call_et,3600),60),'fm00')||' Hs' "ATI/INAT A", to_char(vs.logon_time,'DD-MON-YY HH24:MI:SS') Logon
from gv$session vs, gv$process vp
where vs.paddr=vp.addr
and vs.inst_id = vp.inst_id
and vs.sql_id='&1'
order by vs.last_call_et;

break on report
compute sum of exections on report
compute sum of "CPU(s)" on report
compute sum of "ELA(s)" on report
compute sum of executions on report
compute sum of sorts on report
compute sum of users_executing on report
compute sum of disk_reads on report
compute sum of buffer_gets on report
compute sum of rows_processed          on report
compute avg of "CPU/EXE" on report
compute avg of "ELA/EXE" on report


col schema format a16
col  OUTLINE_CATEGORY   format a7


select vs.child_number CN, vs.address, vs.plan_hash_value PHV, vs.object_status status, du.username schema, vs.first_load_time, vs.last_load_time, vs.optimizer_mode modo, vs.optimizer_cost cost,
       vs.executions, vs.cpu_time/1000000 "CPU(s)", vs.elapsed_time/1000000 "ELA(s)",
decode(vs.executions,0,0,vs.cpu_time/vs.executions)/1000000 "CPU/EXE", decode(vs.executions,0,0,vs.elapsed_time/vs.executions)/1000000 "ELA/EXE",
vs.sorts, vs.disk_reads, vs.buffer_gets, vs.rows_processed rowss
from v$sql vs, dba_users du
where  vs.sql_id='&1'
and vs.parsing_schema_id = du.user_id
--and (vs.sql_id, vs.address, vs.child_number) in
--      (select vsp.sql_id, vsp.address, vsp.child_number
--         from v$sql_plan vsp
--         where vsp.sql_id ='&1')
/


col "CPU(s)" format 999G999G999
col "ELA(s)" format 999G999G999
col "HARD_PARSE(s)" format 999G990D99
col "APP_WAIT(s)" format 999G990D99
col "CONC_WAIT(s)" format 999G990D99
col "USER_IO_WAIT(s)" format 999G999G990D99
col "PLSQL_WAIT(s)" format 999G990D99
col PLAN_HASH_VALUE format 99999999999


select vss.sql_id, vss.executions, to_char(vss.LAST_ACTIVE_TIME,'DD-MON-YYYY HH24:MI:SS') LAST_TIME, vss.PLAN_HASH_VALUE,
vss.PARSE_CALLS,
vss.DIRECT_WRITES,
vss.CPU_TIME/1000000 "CPU(s)",
vss.ELAPSED_TIME/1000000 "ELA(s)",
vss.AVG_HARD_PARSE_TIME/1000000 "HARD_PARSE(s)",
vss.APPLICATION_WAIT_TIME/1000000 "APP_WAIT(s)",
vss.CONCURRENCY_WAIT_TIME/1000000 "CONC_WAIT(s)",
vss.USER_IO_WAIT_TIME/1000000 "USER_IO_WAIT(s)",
vss.PLSQL_EXEC_TIME/1000000 "PLSQL_WAIT(s)"
from v$sqlstats vss
where  vss.sql_id='&1'
/


@restore_sqlplus_settings

