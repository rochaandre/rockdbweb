SELECT --rownum "RowNum",
a.inst_id "Inst id",
a.GROUP# "Group",
a.THREAD# "Thread",
a.SEQUENCE# "Seq",
substr(a.ARCHIVED,1,3) "Archived",
substr(a.STATUS,1,9) "Status",
b.MEMBER AS "File Name",
(a.BYTES/1024/1024) AS "Size MB"
FROM gv$log a
JOIN gv$logfile b ON a.Group#=b.Group#
where a.inst_id =  b.inst_id
ORDER BY b.inst_id, a.GROUP# ;