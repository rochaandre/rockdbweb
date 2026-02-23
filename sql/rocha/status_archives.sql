@save_sqlplus_settings

--@status_redos

col Inicio format a20
col Mb format a15
col Fim format a20
col Duracao format a12
col "Kb/s" format 999G999D99
col "Avg Kb/s"  format 999G999D99
col DATA format a30
col "Mb archivados" format 999G999G999
set feed off
col DATANP noprint


SELECT to_char(COMPLETION_TIME,'YYYY/MM/DD DAY') DATANP, to_char(COMPLETION_TIME,'DD/MM/YYYY DAY') DATA,
sum((completion_time-next_time)*24*3600)  "tempo total(s)",
lpad(trunc(mod(24 * (sum(COMPLETION_TIME-NEXT_TIME)), 24)),'2','0')||':'||
lpad(round(mod(60 * 24 * (sum(COMPLETION_TIME-NEXT_TIME)), 60)),'2','0')||':'||
lpad(round(mod(60 * 60 * 24 * (sum(COMPLETION_TIME-NEXT_TIME)), 3600)),'2','0')||'s' Duracao,
count(*) Quantidade, 
sum(((BLOCKS*BLOCK_SIZE)/1024/1024)) "Mb archivados",
avg(((BLOCKS*BLOCK_SIZE)/1024)/((COMPLETION_TIME-NEXT_TIME)*3600*24)) "Avg Kb/s"
FROM V$ARCHIVED_LOG
where (COMPLETION_TIME-NEXT_TIME) != 0
GROUP BY to_char(COMPLETION_TIME,'YYYY/MM/DD DAY') , to_char(COMPLETION_TIME,'DD/MM/YYYY DAY')
ORDER BY to_char(COMPLETION_TIME,'YYYY/MM/DD DAY')
/

select SEQUENCE#, to_char(NEXT_TIME,'DD-MM-YYYY HH24:MI:SS') Inicio,
                  ltrim(to_char(BLOCKS*BLOCK_SIZE/1024/1024,'999G999D999')) Mb, ARCHIVED,
                  to_char(COMPLETION_TIME,'DD-MM-YYYY HH24:MI:SS') Fim,
lpad(trunc(mod(24 * (COMPLETION_TIME-NEXT_TIME), 24)),'2','0')||':'||
lpad(round(mod(60 * 24 * (COMPLETION_TIME-NEXT_TIME), 60)),'2','0')||':'||
lpad(round(mod(60 * 60 * 24 * (COMPLETION_TIME-NEXT_TIME), 3600)),'2','0')||'s' Duracao,
((BLOCKS*BLOCK_SIZE)/1024)/((COMPLETION_TIME-NEXT_TIME)*3600*24) "Kb/s"
from V$ARCHIVED_LOG
where NEXT_TIME >= sysdate - 1
and (COMPLETION_TIME-NEXT_TIME) != 0
order by COMPLETION_TIME
/


@restore_sqlplus_settings

