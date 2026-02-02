select
TO_CHAR(TRUNC(COMPLETION_TIME), 'YYMMDD') yyyymmdd,
--round(sum(BLOCKS*BLOCK_SIZE)/1024/1024/1024) GB,
count(*) Archives_Generated
from v$archived_log
WHERE thread#=1
group by TO_CHAR(TRUNC(COMPLETION_TIME), 'YYMMDD'),thread#
order by 1 ;