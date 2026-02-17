--1 Move index from one tablespace to another
alter index $OBJ_OWNER.$OBJ_NAME rebuild tablespace $NEW_TS_NAME
;

--2 Moving index partition from one tablespace to another
alter index $OBJ_OWNER.$OBJ_NAME
rebuild partition $S2 tablespace $NEW_TS_NAME
;

--3 Moving all index subpartitions from one tablespace to another
alter index $OBJ_OWNER.$OBJ_NAME
rebuild subpartition $S3 tablespace $NEW_TS_NAME
;

--4 Unusable indexes
select 'alter index '||owner||'.'||index_name||' rebuild;'
from dba_indexes where status='UNUSABLE';

--5 Unusable index partitions
select 'alter index '||index_owner||'.'||index_name||
' rebuild partition '||partition_name||';' sql
from dba_ind_partitions where status='UNUSABLE';

--6 Unusable index subpartitions
select 'alter index '||index_owner||'.'||index_name||
' rebuild subpartition '||subpartition_name||';' sql
from dba_ind_subpartitions where status='UNUSABLE';

--7 All things together
select 'alter index '||owner||'.'||index_name||' rebuild;' sql
from dba_indexes where status='UNUSABLE'
union all
select 'alter index '||index_owner||'.'||index_name||
' rebuild partition '||partition_name||';'
from dba_ind_partitions where status='UNUSABLE'
union all
select 'alter index '||index_owner||'.'||index_name||
' rebuild subpartition '||subpartition_name||';'
from dba_ind_subpartitions where status='UNUSABLE';

