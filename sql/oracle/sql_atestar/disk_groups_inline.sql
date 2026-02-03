with
redo_diskgroup as (
select rownum disk_row, NAME 
from (
select '+'|| NAME  NAME
from v$asm_diskgroup
where TOTAL_MB/(1024) > 30
and 1=(select count(distinct db_name) from V$ASM_CLIENT)
union
select value  NAME
from v$parameter
where name like 'db_create_online_log_dest_%'
and value is not null
union
select value 
from v$parameter
where name like 'db_create_file_dest'
and value is not null
)  
)
select  LISTAGG(  ''''||NAME||'''',  ', '  ) WITHIN GROUP (ORDER BY  NAME) AS NAME
from redo_diskgroup ;
