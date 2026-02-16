--1 Gather stats for a table. Auto sampling and auto number of histogram
--  buckets, might not work in previous Oracle version.
begin
 dbms_stats.gather_table_stats(
  ownname=> '$OBJ_OWNER'
 ,tabname=> '$OBJ_NAME'
 ,partname=> null
 ,estimate_percent=> DBMS_STATS.AUTO_SAMPLE_SIZE
 ,block_sample=> false             -- no random block_sampling
 ,method_opt=> 'FOR COLUMNS SIZE 1'-- no col statistics (columns are not listed), no histograms (bucket size 1)
 ,degree=> 4                       -- parallelism degree
 --,granularity=>'AUTO'            -- auto-determined based on the partitioning type
 ,cascade=> true                   -- if true - indexes are analyzed
 --,stattab=> null                 -- User statistics table identifier describing where to save the current statistics
 --,statid=> null                  -- Identifier (optional) to associate with these statistics within stattab
 --,statown=> null                 -- Schema containing stattab (if different than ownname)
 ,no_invalidate=> false            -- false - means invalidate SQL area
 --,stattype=> 'DATA'              -- default DATA
 --,force=> true                   -- gather stats even it is locked
 );
end;
/


--2 Gather stats for a schema
begin
 dbms_stats.gather_schema_stats(
  ownname=> '$OBJ_OWNER'
 ,estimate_percent=> DBMS_STATS.AUTO_SAMPLE_SIZE  -- (NULL means compute)
 ,block_sample=> false             -- no random block_sampling
 ,method_opt=> 'FOR COLUMNS SIZE 1'-- no col statistics (columns are not listed), no histograms (bucket size 1)
 ,degree=> 4                       -- parallelism degree
 --,granularity=>'AUTO'            -- auto-determined based on the partitioning type
 ,cascade=> true                   -- if true - indexes are analyzed
 --,stattab=> null                 -- User statistics table identifier describing where to save the current statistics
 --,statid=> null                  -- Identifier (optional) to associate with these statistics within stattab
 --,statown=> null                 -- Schema containing stattab (if different than ownname)
 ,options=> 'GATHER'               -- 'GATHER' - gather statistics on all objects in the schema
 ,no_invalidate=> false            -- false - means invalidate SQL area
 --,gather_temp=> false            -- if true, gather stats on global temporary tables
 --,gather_fixed=> false           -- if true, gather stats on fixed tables
 --,stattype=> 'DATA'              -- default DATA
 );
end;
/

--3 Restore Database statistics from the history (10g+)
begin
 dbms_stats.RESTORE_DATABASE_STATS(
 to_timestamp_tz('$S1','YYYY-MON-DD HH24:MI:SS TZH:TZM'), -- as_of_timestamp, TIMESTAMP WITH TIME ZONE
 false,                        -- force, Restores statistics even if their statistics are locked
 false                         -- no_invalidate, false - means invalidate SQL area
 );
end;
/

--4 Restore Table statistics from the history (10g+)
begin
 dbms_stats.RESTORE_TABLE_STATS(
 '$OBJ_OWNER',
 '$OBJ_NAME',
 to_timestamp_tz('$S1','YYYY-MON-DD HH24:MI:SS TZH:TZM'), -- as_of_timestamp, TIMESTAMP WITH TIME ZONE
 false,                        -- restore_cluster_index, If the table is part of a cluster, restore statistics of the cluster index if set to TRUE
 false,                        -- force, Restores statistics even if their statistics are locked
 false                         -- no_invalidate, false - means invalidate SQL area
 );
end;
/

--5 Restore System statistics from the history (10g+)
begin
 dbms_stats.RESTORE_SYSTEM_STATS(
 to_timestamp_tz('$S1','YYYY-MON-DD HH24:MI:SS TZH:TZM') -- as_of_timestamp, TIMESTAMP WITH TIME ZONE
 );
end;
/


-- Lock table statistics
exec dbms_stats.LOCK_TABLE_STATS('$OBJ_OWNER','$OBJ_NAME'); 

--See table statistics
select * from dba_tab_statistics where owner='$OBJ_OWNER' and table_name='$OBJ_NAME';

--See some column statistics
select column_name,num_distinct,rawtohex(low_value),rawtohex(high_value),density
from dba_tab_col_statistics
where owner='$OBJ_OWNER' and table_name='$OBJ_NAME';

--See some histogram info
select * from dba_tab_histograms
where owner='$OBJ_OWNER' and table_name='$OBJ_NAME'
order by column_name, endpoint_number;

--Old fashion analyze
analyze table $OBJ_OWNER.$OBJ_NAME compute statistics;
analyze table $OBJ_OWNER.$OBJ_NAME estimate statistics;
analyze table $OBJ_OWNER.$OBJ_NAME delete statistics;

--Turning table monitoring on:
select 'alter table "'||owner||'"."'||table_name||'" monitoring;' stmt
from all_tables
where monitoring ='NO' and tablespace_name <>'SYSTEM';
