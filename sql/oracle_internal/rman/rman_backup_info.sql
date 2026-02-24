SELECT
s.completion_time,
s.recid BS_KEY,
CASE
WHEN s.backup_type='L' THEN 'ARCHIVELOG'
WHEN s.controlfile_included='YES' THEN 'CONTROLFILE'
WHEN s.backup_type='D' AND s.incremental_level=0 THEN 'LEVEL0'
WHEN s.backup_type='I' AND s.incremental_level=1 THEN 'LEVEL1'
WHEN s.backup_type='D' AND s.incremental_level IS NULL THEN 'FULL'
END type,
p.recid BP_KEY,
round(p.bytes/1048576,2) BP_MB,
s.pieces,
s.set_count,
p.piece#,
p.compressed,
p.device_type,
p.handle
FROM v$backup_piece p, v$backup_set s
WHERE p.status='A'
AND s.set_stamp (+) = p.set_stamp
AND s.set_count (+) = p.set_count
and s.completion_time >= sysdate - :days
order by s.recid, p.piece#
; 