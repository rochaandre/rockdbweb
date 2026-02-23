@save_sqlplus_settings

col status format a10
col group# format 99
col thread# format 99
col sequence# format 999999
col FIRST_CHANGE# format 999999999999999999
col  NEXT_CHANGE# format 999999999999999999
col "TEMPO ATIVO" format a18 justify right

set lines 400

select vl.*
from v$log vl
order by sequence#
/

select * from V$ARCHIVE_PROCESSES 
where state != 'IDLE'
/

@restore_sqlplus_settings

