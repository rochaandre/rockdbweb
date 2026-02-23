@save_sqlplus_settings

set feed off verify off

COL AVG_REDO_WRITE_TIME_MILISECS FOR 999G999G990D999 

COL transactions_PER_SEC for 999G999G990D99

set term off

drop table  t$sysstat;

set term on

create table t$sysstat as select 1 as snap_id, sysdate as dtcol, name, value from v$sysstat;

PROMPT USO: SQL> @redo_write_time_delta <<segundos>>
--prompt ex : SQL> @redo_write_time_delta 20
--PROMPT Espere &1 segs.

exec dbms_lock.sleep (&1);

insert into t$sysstat
select 2 as snap_id, sysdate as dtcol, name, value from v$sysstat;

set feed on

select  t.value/&1 transactions_PER_SEC,
(wt.value/w.value)*10 AVG_REDO_WRITE_TIME_MILISECS
from
 (select snap_id, value - LAG(value, 1, 0) OVER (ORDER BY snap_id) AS value from t$sysstat where name = 'redo write time') wt,
 (select snap_id, value - LAG(value, 1, 0) OVER (ORDER BY snap_id) AS value from t$sysstat where name = 'redo writes') w,
 (select snap_id, value - LAG(value, 1, 0) OVER (ORDER BY snap_id) AS value from t$sysstat where name = 'user commits') t
 where wt.snap_id = w.snap_id
  and t.snap_id = w.snap_id
and t.snap_id = 2 
order by 1;

set verify on

@restore_sqlplus_settings


