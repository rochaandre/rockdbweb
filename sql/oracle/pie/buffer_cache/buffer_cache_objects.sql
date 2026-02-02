select
  owner,name,db_link,namespace,type,status,kept,sharable_mem,loads,executions,locks,locked_total,pins,pinned_total,invalidations,timestamp,lock_mode,pin_mode,hash_value
from v$db_object_cache
where namespace not like 'SQL AREA%'
order by 1,6,4,5,2 ;