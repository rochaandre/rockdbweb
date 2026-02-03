select * from
(select owner,segment_name, segment_type,trunc(bytes/1024/1024/1024,2) GB from dba_segments
where tablespace_name='SYSAUX'
order by bytes desc)
where rownum<=10 ;