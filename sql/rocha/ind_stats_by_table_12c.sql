@save_sqlplus_settings

break on report
compute sum of "Size(M)" on report

col index_name format a30
col index_type format a18 truncate
col partition_name format a18
col subpartition_name format a18
set lines 200
col "Rows" format 999G999G999G999
col "Dinst Keys" format 999G999G999G999
col "Blks" format 9999999
col "Emp Blks" format 9999999
col "Avg Space" format 9999999
col "Avg Row Len" format 9999999
col "Sample" format 99999999999
col global_stats format a12
col degree format a6

set pages 50
set verify off

--Stats da tabela
select index_name, index_type, uniqueness, visibility,  tablespace_name, NUM_ROWS "Rows",   
       DISTINCT_KEYS "Dinst Keys", CLUSTERING_FACTOR CLUFAC, blevel,  GLOBAL_STATS GST, USER_STATS UST,
       last_analyzed, sample_size "Sample", degree from dba_indexes
where (owner, index_name) in (select owner, index_name from dba_indexes where owner = upper('&1') and table_name = upper('&2'))
/

UNDEFINE 1

@restore_sqlplus_settings

