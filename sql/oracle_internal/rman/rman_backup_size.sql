SELECT TO_CHAR(completion_time, 'YYYY-MON-DD') completion_time, type, round(sum(bytes)/1048576) MB, round(sum(elapsed_seconds)/60) min
FROM
(
SELECT
CASE
  WHEN s.backup_type='L' THEN 'ARCHIVELOG'
  WHEN s.controlfile_included='YES' THEN 'CONTROLFILE'
  WHEN s.backup_type='D' AND s.incremental_level=0 THEN 'LEVEL0'
  WHEN s.backup_type='I' AND s.incremental_level=1 THEN 'LEVEL1'
END type,
TRUNC(s.completion_time) completion_time, p.bytes, s.elapsed_seconds
FROM v$backup_piece p, v$backup_set s
WHERE p.status='A' AND p.recid=s.recid
and s.completion_time >= sysdate - :days
UNION ALL
SELECT 'DATAFILECOPY' type, TRUNC(completion_time), output_bytes, 0 elapsed_seconds FROM v$backup_copy_details
WHERE completion_time >= sysdate - :days
)
GROUP BY TO_CHAR(completion_time, 'YYYY-MON-DD'), type
ORDER BY 1 ASC,2,3 ;

