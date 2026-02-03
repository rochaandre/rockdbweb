select
  pool,
  name,
  round(bytes/1024/1024,3) "SIZE_MB"
from v$sgastat
where
  bytes>=1024*1024
  and
  pool=:NAME
  and
  name<>'KGH: NO ACCESS' ;