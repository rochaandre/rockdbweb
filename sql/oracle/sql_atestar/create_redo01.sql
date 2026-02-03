ALTER DATABASE ADD STANDBY LOGFILE THREAD 1 ('/u02/oradata/dbpro_01/stdbyredo01.log') SIZE 328M;
ALTER DATABASE ADD STANDBY LOGFILE THREAD 1 ('/u02/oradata/dbpro_01/stdbyredo02.log') SIZE 328M;
ALTER DATABASE ADD STANDBY LOGFILE THREAD 1 ('/u02/oradata/dbpro_01/stdbyredo03.log') SIZE 328M;
ALTER DATABASE ADD STANDBY LOGFILE THREAD 1 ('/u02/oradata/dbpro_01/stdbyredo04.log') SIZE 328M;
ALTER DATABASE ADD STANDBY LOGFILE THREAD 1 ('/u02/oradata/dbpro_01/stdbyredo05.log') SIZE 328M;
ALTER DATABASE ADD STANDBY LOGFILE THREAD 1 ('/u02/oradata/dbpro_01/stdbyredo06.log') SIZE 328M;
ALTER DATABASE ADD STANDBY LOGFILE THREAD 1 ('/u02/oradata/dbpro_01/stdbyredo07.log') SIZE 328M;

alter database drop logfile group 7;
alter database drop logfile group 8;
alter database drop logfile group 9;
alter database drop logfile group 10;
alter database drop logfile group 11;
alter database drop logfile group 12;
alter database drop logfile group 13;


ALTER DATABASE ADD STANDBY LOGFILE THREAD 1 ('/u02/oradata/db_prod/stdbyredo08.log') SIZE 328M;
ALTER DATABASE ADD STANDBY LOGFILE THREAD 1 ('/u02/oradata/db_prod/stdbyredo09.log') SIZE 328M;
ALTER DATABASE ADD STANDBY LOGFILE THREAD 1 ('/u02/oradata/db_prod/stdbyredo10.log') SIZE 328M;
ALTER DATABASE ADD STANDBY LOGFILE THREAD 1 ('/u02/oradata/db_prod/stdbyredo11.log') SIZE 328M;
ALTER DATABASE ADD STANDBY LOGFILE THREAD 1 ('/u02/oradata/db_prod/stdbyredo12.log') SIZE 328M;
ALTER DATABASE ADD STANDBY LOGFILE THREAD 1 ('/u02/oradata/db_prod/stdbyredo13.log') SIZE 328M;
ALTER DATABASE ADD STANDBY LOGFILE THREAD 1 ('/u02/oradata/db_prod/stdbyredo14.log') SIZE 328M;


SELECT
    thread# redo_thread,
    group#  redo_group,
    sequence#,
    bytes / 1024 / 1024
    || 'M'  redo_size,
    archived,
    l.status,
    blocksize,
    member
FROM
         v$log l
    JOIN v$logfile f USING ( group# )
ORDER BY
    thread#,
    group#;

select GROUP# ,member from v$logfile;

select group#, thread#, bytes/1024/1024  from v$standby_log   order by thread#,  group#;


select  thread#,count(distinct group#) from gv$log group by thread#;

select  thread#,count(distinct group#) from gv$standby_log group by thread#;

select  thread#, group# from gv$log  order by 1,2;


/u02/oradata/dbpro_01/stdbyredo07.log

select  thread#,count(distinct group#) from gv$standby_log group by thread#;

select  thread#, group# from gv$standby_log order by 1,2 ;

select  * from gv$standby_log order by 1,2 ;



WITH redo_diskgroup AS ( SELECT
                             ROWNUM disk_row,
                             name
                         FROM
                             ( SELECT
                                   '+' || name name
                               FROM
                                   v$asm_diskgroup
                               WHERE
                                       total_mb / ( 1024 ) > 30
                                   AND 1 = ( SELECT
                                                 COUNT(DISTINCT db_name)
                                             FROM
                                                 v$asm_client
                                           )
                               UNION
                               SELECT
                                   value name
                               FROM
                                   v$parameter
                               WHERE
                                   name LIKE 'db_create_online_log_dest_%'
                                   AND value IS NOT NULL
                               UNION
                               SELECT
                                   value
                               FROM
                                   v$parameter
                               WHERE
                                   name LIKE 'db_create_file_dest'
                                   AND value IS NOT NULL
                             )
), list_diskgroups AS ( SELECT
                            LISTAGG(''''
                                    || name
                                    || '''', ', ') WITHIN GROUP(
                            ORDER BY
                                name
                            ) AS name
                        FROM
                            redo_diskgroup
), list_redogroups AS ( SELECT
                            thread# redo_thread,
                            group#  redo_group,
                            sequence#,
                            bytes / 1024 / 1024
                            || 'M'  redo_size,
                            archived,
                            l.status,
                            blocksize,
                            member
                        FROM
                                 v$log l
                            JOIN v$logfile f USING ( group# )
                        ORDER BY
                            thread#,
                            group#
), list_redogroups_onemore AS ( SELECT
                                    *
                                FROM
                                    list_redogroups a
                                UNION ALL
                                SELECT
                                    *
                                FROM
                                    list_redogroups a
                                WHERE
                                    redo_group = 1
)
SELECT
    'ALTER DATABASE ADD GROUP '
    || a.redo_group
    || ' THREAD '
    || a.redo_thread
    || ' ('
    || b.name
    || ') SIZE '
    || a.redo_size
    || ';' command
FROM
    list_redogroups a,
    list_diskgroups b
UNION ALL
SELECT
    'ALTER DATABASE ADD STANDBY LOGFILE THREAD '
    || a.redo_thread
    || ' ('
    || b.name
    || ') SIZE '
    || a.redo_size
    || ';'
FROM
    list_redogroups_onemore a,
    list_diskgroups         b;