@save_sqlplus_settings



col status format a20
col file_name format a45 truncate


-- select ddf.tablespace_name, ddf.file_name, vb.status, to_char(vb.time, 'DD-MON-YYYY HH24:MI:SS')
-- from v$backup vb, dba_data_files ddf
-- where vb.file#=ddf.file_id
-- order by time desc
-- 
-- 
-- select ddf.tablespace_name, vb.status, to_char(min(vb.time), 'DD-MON-YYYY HH24:MI:SS')
-- from   v$backup vb, dba_data_files ddf
-- where  vb.file#=ddf.file_id
-- group by ddf.tablespace_name, vb.status
-- order by 3 desc


select vts.name, vb.status, count(*) datafiles, to_char(min(vb.time), 'DD-MON-YYYY HH24:MI:SS') Min_time, to_char(max(vb.time), 'DD-MON-YYYY HH24:MI:SS') Max_time
from   v$backup vb, v$datafile vdf, v$tablespace vts
where  vb.file#=vdf.file#
and    vdf.ts#=vts.ts#
group by vts.name, vb.status
order by 3 desc
/



@restore_sqlplus_settings


