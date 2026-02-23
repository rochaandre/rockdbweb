@save_sqlplus_settings

alter session set nls_date_format='YYYY/MM/DD HH24:MI:SS';
alter session set nls_timestamp_format='YYYY/MM/DD HH24:MI:SS';

col sql_id                 format a14
col starting_time          format a20
col end_time               like starting_time
col run_time_sec           format 999G990D999 heading "Tempo de Execucao(s)"
col READ_IO_KBYTES         format 999G999G999 heading "READ IO(Kb)"
col PGA_ALLOCATED_kBYTES   format 999G999G999 heading "PGA  IO(Kb)"
col TEMP_ALLOCATED_kBYTES  format 9GGG999G999 heading "TEMP IO(Kb)"

select sql_id, sql_exec_id, sql_plan_hash_value, 
      starting_time,
      end_time,
      (  EXTRACT(DAY FROM run_time) * 3600 * 24
       + EXTRACT(HOUR FROM run_time) * 3600
       + EXTRACT(MINUTE FROM run_time) * 60
       + EXTRACT(SECOND FROM run_time)) run_time_sec,
      READ_IO_BYTES/1024 read_io_kbytes,
      PGA_ALLOCATED/1024 PGA_ALLOCATED_kBYTES,
      TEMP_ALLOCATED/1024  TEMP_ALLOCATED_kBYTES
from  (
select
       sql_id, sql_exec_id, sql_plan_hash_value, 
       max(sample_time - sql_exec_start) run_time,
       max(sample_time) end_time,
       sql_exec_start starting_time,
       sum(DELTA_READ_IO_BYTES) READ_IO_BYTES,
       sum(DELTA_PGA) PGA_ALLOCATED,
       sum(DELTA_TEMP) TEMP_ALLOCATED
       from
       (
       select sql_id, 
       sample_time,
       sql_exec_start,
       DELTA_READ_IO_BYTES,
       sql_exec_id, sql_plan_hash_value, 
       greatest(PGA_ALLOCATED - first_value(PGA_ALLOCATED) over (partition by sql_id,sql_exec_id order by sample_time rows 1 preceding),0) DELTA_PGA,
       greatest(TEMP_SPACE_ALLOCATED - first_value(TEMP_SPACE_ALLOCATED) over (partition by sql_id,sql_exec_id order by sample_time rows 1 preceding),0) DELTA_TEMP
       from
       gv$active_session_history
       where
       sample_time >= &2 
       and sample_time < &3
       and sql_exec_start is not null
       and IS_SQLID_CURRENT='Y'
       )
group by sql_id,SQL_EXEC_ID,sql_plan_hash_value,sql_exec_start
order by sql_id
)
where sql_id = '&1'
order by sql_id, starting_time desc;

@restore_sqlplus_settings
