-- Active Schemas for Filter
SELECT username as owner
FROM dba_users
WHERE username NOT IN ('SYS', 'SYSTEM', 'DBSNMP', 'OUTLN', 'APPQOSSYS', 'CTXSYS', 'DVSYS', 'LBACSYS', 'MDSYS', 'OLAPSYS', 'ORDDATA', 'ORDSYS', 'XDB', 'WMSYS')
ORDER BY 1
