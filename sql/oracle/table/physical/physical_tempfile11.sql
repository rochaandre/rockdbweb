select
tablespace_name name,file_id,file_name, trunc(bytes/1024/1024/1024,2) used,trunc(maxbytes/1024/1024/1024,2) maxsize,AUTOEXTENSIBLE
from dba_temp_files
ORDER BY  file_id ;