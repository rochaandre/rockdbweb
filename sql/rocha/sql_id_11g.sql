@save_sqlplus_settings

set lines 400

col sql_text format a120 word_wrap
col sid format 999999
col pai format a12 truncate
col serial# format 99999
col spid format a9
col schemaname format a8
col username format a8
col status format a8 truncate
col program format a23
col lockwait format a8
col Logon format a18
col username format a20
col osuser format a12 truncate
col machine format a25
col "ATIVO A" format a13
col modo format a8
col cost format 999999999
col modo format a8 truncate
col execs format 999G999G999G990
col PX_execs format 999G999G990
col PLAN_HASH_VALUE format 9999999999
col HASH_VALUE format 9999999999
col OLD_HASH_VALUE format 9999999999
col FIRST_LOAD_TIME format a19
col LAST_LOAD_TIME  format a19



col "CPU(s)" format 999G999G999
col "ELA(s)" format 999G999G999
col "CPU/EXE(s)" format 990D99999
col "ELA/EXE(s)" format 990D99999
col "DISK/EXE" format 999G990D99
col "GETS/EXE" format 999G990D99
col "ROWS/EXE" format 999G990D99
col CN format 999
col module format a25 truncate
col action format a15 truncate
col rowss format 999G999G990
col inst format 9999
col EXACT_MATCHING_SIGNATURE format 99999999999999999999
col FORCE_MATCHING_SIGNATURE like EXACT_MATCHING_SIGNATURE

select distinct sql_text from gv$sqlarea
where sql_id = '&1';
prompt

select inst_id, EXACT_MATCHING_SIGNATURE, FORCE_MATCHING_SIGNATURE, sql_id, child_number CN, hash_value, old_hash_value, sql_plan_baseline, SQL_PATCH, SQL_PROFILE 
from gv$sql
where sql_id ='&1';


--select FIRST_LOAD_TIME, executions from v$sqlarea
--where sql_id ='&1';


select vs.sid, vs.serial#, vs.inst_id inst, vp.spid, vs.process pai, vs.sql_id, vs.SQL_CHILD_NUMBER CN, vs.username, vs.osuser, vs.machine, vs.module, vs.action, to_char(floor(vs.last_call_et/3600),'fm0000')||':'||
to_char(floor(mod(vs.last_call_et,3600)/60),'fm00')||':'||
to_char(mod(mod(vs.last_call_et,3600),60),'fm00')||' Hs' "ATIVO A", to_char(vs.logon_time,'DD-MON-YY HH24:MI:SS') Logon
from gv$session vs, gv$process vp
where vs.paddr=vp.addr
and vs.inst_id = vp.inst_id
and vs.sql_id='&1'
order by vs.last_call_et;

break on report
compute sum of exections on report
compute sum of "CPU(s)" on report
compute sum of "ELA(s)" on report
compute sum of px_execs on report
compute sum of execs on report
compute sum of sorts on report
compute sum of users_executing on report
compute sum of disk_reads on report
compute sum of buffer_gets on report
compute sum of rows_processed          on report
compute avg of "CPU/EXE(s)" on report
compute avg of "ELA/EXE(s)" on report


col schema format a16
col  OUTLINE_CATEGORY   format a7
col PHV format 9999999999 heading 'Plan|Hash Value' headsep '|'

select vs.inst_id inst, vs.child_number CN, vs.plan_hash_value PHV, vs.object_status status, du.username schema, vs.first_load_time, vs.last_load_time, vs.optimizer_mode modo, vs.optimizer_cost cost,
       vs.PX_SERVERS_EXECUTIONS px_execs, vs.executions execs, vs.cpu_time/1000000 "CPU(s)", vs.elapsed_time/1000000 "ELA(s)",
decode(vs.executions,0,0,vs.cpu_time/vs.executions)/1000000 "CPU/EXE(s)", decode(vs.executions,0,0,vs.elapsed_time/vs.executions)/1000000 "ELA/EXE(s)",
vs.disk_reads/nullif(vs.executions,0) "DISK/EXE", vs.buffer_gets/nullif(vs.executions,0) "GETS/EXE", vs.rows_processed/nullif(vs.executions,0) "ROWS/EXE"
from gv$sql vs, dba_users du
where  vs.sql_id='&1'
and vs.parsing_schema_id = du.user_id
and (vs.inst_id, vs.sql_id, vs.address, vs.child_number) in
        (select vsp.inst_id, vsp.sql_id, vsp.address, vsp.child_number
         from gv$sql_plan vsp
         where vsp.sql_id ='&1')
order by vs.child_number
/

@shared_cursor &1

col "CPU(s)" format 999G999G999
col "ELA(s)" format 999G999G999
col "HARD_PARSE(s)" format 999G990D99
col "APP_WAIT(s)" format 999G990D99
col "CONC_WAIT(s)" format 999G990D99
col "USER_IO_WAIT(s)" format 999G999G990D99
col "PLSQL_WAIT(s)" format 999G990D99
col PLAN_HASH_VALUE format 9999999999999


select vss.sql_id, to_char(vss.LAST_ACTIVE_TIME,'DD-MON-YYYY HH24:MI:SS') LAST_TIME, vss.PLAN_HASH_VALUE,
vss.PARSE_CALLS,
vss.DIRECT_WRITES,
vss.CPU_TIME/1000000 "CPU(s)",
vss.ELAPSED_TIME/1000000 "ELA(s)",
vss.AVG_HARD_PARSE_TIME/1000000 "HARD_PARSE(s)",
vss.APPLICATION_WAIT_TIME/1000000 "APP_WAIT(s)",
vss.CONCURRENCY_WAIT_TIME/1000000 "CONC_WAIT(s)",
vss.USER_IO_WAIT_TIME/1000000 "USER_IO_WAIT(s)",
vss.PLSQL_EXEC_TIME/1000000 "PLSQL_WAIT(s)"
from gv$sqlstats vss
where  vss.sql_id='&1'
/


@restore_sqlplus_settings

