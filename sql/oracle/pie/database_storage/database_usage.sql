with database_size as (
select
reserved_space_gb, Reserved_Space_GB - Free_Space_GB  Used_Space_GB,
free_space_gb, Reserved_Space_GB allocated_gb, physical_used_gb
from(
select 
(select trunc(sum(bytes/(1024*1024*1024)),2) from dba_data_files) Reserved_Space_GB,
(select trunc(sum(bytes/(1024*1024*1024)),2) from dba_free_space) Free_Space_GB,
(select trunc(sum(bytes/(1024*1024*1024)),2) 
from (
(select bytes from v$datafile
union all
select bytes from v$tempfile
union all
select bytes from v$log))) physical_used_GB
from dual
)) 
select 'Reserved_Space_GB' DESCRIPTION, Reserved_Space_GB VALUE
from database_size
UNION ALL
select 'Used_Space' DESCRIPTION, Used_Space_GB VALUE
from database_size
UNION ALL
select 'Allocated' DESCRIPTION, allocated_gb VALUE
from database_size
UNION ALL
select 'physical used' DESCRIPTION, physical_used_GB VALUE
from database_size;