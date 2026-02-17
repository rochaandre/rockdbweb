select * from v$log;                     --status of logfile groups
select * from v$logfile order by group#; --status of logfiles
select * from v$instance;                --status of the archiver
alter system archive log start;          --restart the archiver
alter system switch logfile;             --switch online log
alter system set log_archive_max_processes=4;

--Add logfile group
alter database add logfile group 4
 ('$logfilename1',
  '$logfilename2') size 64M;

--Drop logfile group and all members in it
alter database drop logfile group $N;

--Add logfile member
alter database add  logfile member '$logfilename' reuse to group 4;

--Drop logfile member
alter database drop logfile member '$logfilename';
