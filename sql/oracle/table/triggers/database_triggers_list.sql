 SELECT  DISTINCT owner, name trigger_name
  FROM dba_source t
  WHERE type = 'TRIGGER'
  and  (owner, NAME ) IN
  (
  SELECT  owner, TRIGGER_NAME
  FROM DBA_TRIGGERS
  WHERE table_name IS NULL
  AND owner NOT IN ('EXFSYS','WMSYS','SYSMAN')
  )
  ORDER BY owner, name ;