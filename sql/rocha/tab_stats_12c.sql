@save_sqlplus_settings

set lines 250

col table_name format a30
col tablespace_name format a20 truncate
col partition_name format a18
col subpartition_name format a18

col "Rows" format 999G999G999G999
col "Blks" format 999G999G999
col "Emp Blks" format 999G999
col "Avg Row Len" format 999G999
col "Sample" format 999G999G999G999
col Degree format 99
set pages 50
set verify off

--Stats da tabela
select owner, table_name, tablespace_name, NUM_ROWS "Rows", BLOCKS "Blks", EMPTY_BLOCKS "Emp Blks" ,  
       AVG_ROW_LEN "Avg Row Len",  CHAIN_CNT "Chain Rows"     , GLOBAL_STATS, USER_STATS,
       last_analyzed, sample_size "Sample", degree  from dba_tables
where table_name like upper('&2')
and owner like upper('&1')
/

col STALE_PERCENT format a5

--Stats da tabela
select owner, table_name, AVG_SPACE, AVG_SPACE_FREELIST_BLOCKS,  NUM_FREELIST_BLOCKS    , AVG_CACHED_BLOCKS, AVG_CACHE_HIT_RATIO, 
       STATTYPE_LOCKED LOCKED, STALE_STATS, DBMS_STATS.get_prefs(ownname=>dts.owner, tabname=>dts.table_name, pname=>'STALE_PERCENT') STALE_PERCENT
       from dba_tab_statistics dts
where table_name like upper('&2')
and owner like upper('&1')
and partition_name is null
/

UNDEFINE 1

@restore_sqlplus_settings

