@save_sqlplus_settings

col "% Complete" format 990D99
col "Done%" format 990D99
col sid format 99999
col qcsid format 99999
col Inicio format a19
col elapsed format 9999999
col remaining format 999999999
col previsao format a19
col message format a84 truncate

set lines 200

select qcsid, sid, sql_hash_value hash_value, message, to_char(start_time,'DD/MM/YYYY HH24:MI:SS') Inicio,
ELAPSED_SECONDS elapsed, TIME_REMAINING remaining, to_char(sysdate + (TIME_REMAINING/3600/24),'DD/MM/YYYY HH24:MI:SS')  Previsao
,round(sofar/totalwork*100,2) "Done%"
from v$session_longops l
where (sid like '&1' or qcsid like '&1')
and LAST_UPDATE_TIME >= sysdate -1
--and totalwork <> 0
and sql_hash_value in (select hash_value from v$open_cursor where sid like '&1')
order by start_time
/

@restore_sqlplus_settings

