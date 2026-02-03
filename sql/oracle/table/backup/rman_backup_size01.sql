SELECT datafile,BACKUP_DATE, tam ,
  decode((LEAD( tam , 1, 0) OVER (ORDER BY BACKUP_DATE desc) -  tam ) * -1 ,
  tam,0,(LEAD( tam , 1, 0) OVER (ORDER BY BACKUP_DATE desc) -  tam ) * -1)
  Increase
  FROM (
  select 'Datafile' datafile, trunc(completion_time) "BACKUP_DATE", trunc(sum(blocks*block_size)/1024/1024) tam
  from v$backup_datafile
  WHERE completion_time > sysdate - 8
  group by trunc(completion_time)
  )
  UNION all
  SELECT datafile,BACKUP_DATE, tam ,
  decode((LEAD( tam , 1, 0) OVER (ORDER BY BACKUP_DATE desc) -  tam ) * -1 ,
  tam,0,(LEAD( tam , 1, 0) OVER (ORDER BY BACKUP_DATE desc) -  tam ) * -1)
  Increase
  FROM (
  SELECT 'Archive' datafile,trunc(first_time) "BACKUP_DATE",  trunc(sum(blocks*block_size)/1024/1024 )  tam
  from v$backup_redolog
  WHERE first_time > sysdate-8
  group by 'Archive'  ,trunc(first_time)) ;