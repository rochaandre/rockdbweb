col MB for 999G990
col blocks for 9999999999
col segment_name for a30
col partition_name for a30
col segment_type for a20
col tablespace_name for a20
select * from (
               select bytes/1024/1024 MB, blocks, s.SEGMENT_NAME, s.partition_name, s.segment_type, s.tablespace_name
                 from dba_segments s
                where owner='SYS'
             order by bytes desc
)
where rownum <=10 ;