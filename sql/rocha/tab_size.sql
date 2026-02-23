@save_sqlplus_settings

set lines 300

--sprompt
--sprompt Sintaxe: tab_size OWNER TABLE
--sprompt


break on report
compute sum of Kbytes on report
compute sum of Mbytes on report
compute sum of Gbytes on report
compute count of table on report


col table format a30 truncate
col tablespace format a28
col owner format a25

col Kbytes ON format 999G999G999G999
col Mbytes ON format 999G999G999
col Gbytes ON format 999G999
col extents on format 999G999G999
col max_init on format 999G999G999
col max_next on format 999G999G999
col pct format 90D99
col Parts format 99999999
col Segs format 99999
COLUMN   Blks ON FORMAT   999G999G999


select ds.owner, ds.segment_name "TABLE", ds.tablespace_name tablespace, ds.buffer_pool pool, dpt.partition_count parts, count(*) Segs, 
--                Max(ds.initial_extent) max_init, max(ds.next_extent) Max_next, max(ds.pct_increase) pct,
               SUM(ds.extents) extents, sum(ds.BLOCKS) Blks,
sum(bytes)/1024 Kbytes, 
sum(bytes)/1024/1024 Mbytes, 
sum(bytes)/1024/1024/1024 Gbytes
from dba_segments ds, dba_part_tables dpt
where ds.segment_name like upper('&2')
and ds.owner like upper('&1')
and ds.segment_type like 'TABLE%'
and ds.owner = dpt.owner (+)
and ds.segment_name = dpt.table_name (+)
group by ds.owner, ds.segment_name, ds.tablespace_name, ds.buffer_pool, dpt.partition_count
order by 5 asc
/



@restore_sqlplus_settings


