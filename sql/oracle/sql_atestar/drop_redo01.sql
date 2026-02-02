with 
redo_detail as (
            SELECT max(a.inst_id)  inst_id, 
            max(a.BYTES)/1024/1024 redo_size, 
            max(a.GROUP#) redo_group
            FROM gv$log a
            ),
redo_detail_lines as (
                  SELECT rownum "RowNum", a.inst_id inst_id,
            a.GROUP# redo_group,
            a.THREAD# redo_Thread,
            a.SEQUENCE# redo_Seq,
            a.ARCHIVED redo_Archived ,
            a.STATUS redo_Status ,
            b.MEMBER AS redo_File_Name ,
            (a.BYTES/1024/1024) AS redo_SizeMB
            FROM gv$log a
            JOIN gv$logfile b ON a.Group#=b.Group#
            where a.inst_id =  b.inst_id
            ORDER BY b.inst_id, a.GROUP#
            ),
redo_recreate as (
select distinct 'alter database drop logfile group '|| redo_detail_lines.redo_group || ';'
from  redo_detail_lines
            )
select * from redo_recreate;;