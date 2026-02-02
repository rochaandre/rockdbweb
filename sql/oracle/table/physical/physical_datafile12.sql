select con_id,
tablespace_name name,file_id,file_name, trunc(bytes/1024/1024/1024,2) used,trunc(maxbytes/1024/1024/1024,2) maxsize,AUTOEXTENSIBLE
from cdb_data_files
ORDER BY con_id,file_id ;