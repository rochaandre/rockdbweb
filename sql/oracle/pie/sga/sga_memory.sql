select
  pool "NAME",
  sum(bytes)/1024/1024 "SIZE_MB"
from v$sgastat
where
  pool is not null
  and
  name<>'KGH: NO ACCESS'
group by 'SGA',pool
union all
select
  name,
  sum(bytes)/1024/1024 "SIZE_MB"
from v$sgastat
where pool is null
group by 'SGA',name ;