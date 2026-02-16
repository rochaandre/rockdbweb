--1 Move group of TABLE segments (check for unusable indexes after that)
select 'alter table '||owner||'.'||segment_name||' move '||
decode(segment_type,
 'TABLE PARTITION','partition '||partition_name,
 'TABLE SUBPARTITION','subpartition '||partition_name,null)||' tablespace $NEW_TS_NAME;' sql
from dba_segments
where segment_type like 'TABLE%'
 and tablespace_name='$TS_NAME'
 and owner='$OBJ_OWNER'
 and segment_name='$OBJ_NAME'
;

--2 Move group of INDEX segments
select 'alter index '||owner||'.'||segment_name||' rebuild '||
decode(segment_type,
 'INDEX PARTITION','partition '||partition_name,
 'INDEX SUBPARTITION','subpartition '||partition_name,null)||' tablespace $NEW_TS_NAME;' sql
from dba_segments
where segment_type like 'INDEX%'
 and tablespace_name='$TS_NAME'
 and owner='$OBJ_OWNER'
 and segment_name='$OBJ_NAME'
;

--3 List segments that will fail to expand
select /*+ all_rows */ segs.* 
from 
  dba_segments segs, 
  sys.seg$ s, 
  (select ts#,max(length) m from sys.fet$ group by ts#) f 
where s.ts#=f.ts# and extsize>m 
 and segs.header_file=s.file# and segs.header_block=s.block# 
;

--4 List of fragmented segments
select segs.* 
from 
 dba_segments segs, 
 (select file#, segblock# from sys.uet$ 
  group by file#, segblock# 
  having count(*) > 1024 
 ) f 
where segs.header_file=f.file# and segs.header_block=f.segblock# 
;
