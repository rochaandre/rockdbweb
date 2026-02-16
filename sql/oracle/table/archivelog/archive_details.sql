--Checking archivelog mode
select dbid, name, resetlogs_time, log_mode from v$database;

alter system archive log start;  -- restarts the archiver
select * from v$archive_dest;    -- archiver destinations

--Altering destination
alter system set log_archive_dest_1='location=$path';
alter system set log_archive_dest_state_1='enable';

--Archived log info from the control file
select * from v$archived_log;

--The sequence# of last backed up log
select thread#, max(sequence#) from v$archived_log
where BACKUP_COUNT>0 group by thread#;

--Redo size (MB) per day, last 30 days
select trunc(first_time) arc_date, sum(blocks * block_size)/1048576 arc_size
from v$archived_log
where first_time >= (trunc(sysdate)-30)
group by trunc(first_time);
