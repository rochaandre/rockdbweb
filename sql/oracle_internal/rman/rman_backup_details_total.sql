SELECT (select name from v$database) as name,TO_CHAR(completion_time, 'DD/MM/YYYY HH24:MI') completion_time, 
decode(backup_type, 'I', 'Image Copy',  'L', 'Archive Log', 'D', 'Full', 'Incremental') backup_type,
type, round(sum(bytes)/1048576) MB, round(sum(bytes)/1048576/1024) GB,round(sum(elapsed_seconds)/60) min
FROM
(
SELECT
CASE
WHEN s.backup_type='L' THEN 'ARCHIVELOG'
WHEN s.controlfile_included='YES' THEN 'CONTROLFILE'
WHEN s.backup_type='I' AND s.incremental_level=0 THEN 'LEVEL0'
WHEN s.backup_type='I' AND s.incremental_level=1 THEN 'LEVEL1'
WHEN s.backup_type='D' THEN 'FULL'
END type,
TRUNC(s.completion_time) completion_time,
p.bytes,
s.elapsed_seconds, backup_type
FROM v$backup_piece p, v$backup_set s
WHERE p.status='A'
AND p.recid=s.recid
UNION ALL
SELECT 'DATAFILECOPY' type, TRUNC(completion_time), output_bytes, 0 elapsed_seconds ,
 'I' backup_type
FROM v$backup_copy_details
)
group by TO_CHAR(completion_time, 'DD/MM/YYYY HH24:MI'), type, backup_type
order by 1 asc,2,3
;


SELECT 
    (SELECT name FROM v$database) as NAME,
    TO_CHAR(completion_time, 'DD/MM/YYYY HH24:MI') as COMPLETION_TIME, 
    decode(backup_type, 'L', 'Archive Log', 'D', 'Full', 'I', 'Incremental', backup_type) as BACKUP_TYPE,
    TYPE, 
    trunc(SUM(MB),2) as MB, 
    trunc(SUM(GB),2) as GB,
    trunc(SUM(MIN),2) as MIN
FROM (
    SELECT
        CASE 
            WHEN s.backup_type = 'L' THEN 'ARCHIVELOG'
            WHEN s.controlfile_included = 'YES' AND s.backup_type != 'L' THEN 'CONTROLFILE'
            WHEN s.backup_type IN ('D','I') THEN 'DATAFILE'
            ELSE 'OTHER'
        END as TYPE,
        s.completion_time,
        p.bytes / 1048576 as MB,
        p.bytes / 1073741824 as GB,
        s.elapsed_seconds / 60 as MIN,
        s.backup_type
    FROM v$backup_piece p
    INNER JOIN v$backup_set s ON p.set_stamp = s.set_stamp AND p.set_count = s.set_count
    WHERE p.status = 'A'
    UNION ALL
    SELECT 
        'DATAFILE_COPY' as TYPE, 
        completion_time, 
        output_bytes / 1048576 as MB, 
        output_bytes / 1073741824 as GB, 
        0 as MIN,
        'I' as backup_type
    FROM v$backup_copy_details
)
GROUP BY TO_CHAR(completion_time, 'DD/MM/YYYY HH24:MI'), type, backup_type
ORDER BY 2 ASC, 3, 4;