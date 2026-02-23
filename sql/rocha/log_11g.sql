@save_sqlplus_settings

col status format a10
col group# format 99
col thread# format 99
col sequence# format 999999
col FIRST_CHANGE# format 999999999999999999
col  NEXT_CHANGE# format 999999999999999999
col "TEMPO ATIVO" format a18 justify right

set lines 400

select vl.*,
lpad(
nullif (
to_char(floor((vl.next_time-vl.first_time)*24*60*60/3600),'fm0000')||':'||
to_char(floor(mod((vl.next_time-vl.first_time)*24*60*60,3600)/60),'fm00')||':'||
to_char(mod(mod((vl.next_time-vl.first_time)*24*60*60,3600),60),'fm00')||' Hs' 
,
':: Hs') 
,18)
"TEMPO ATIVO"
from v$log vl
order by sequence#
/

select * from V$ARCHIVE_PROCESSES 
where state != 'IDLE'
/

@restore_sqlplus_settings

