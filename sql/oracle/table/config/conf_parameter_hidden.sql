select * from (
  select
  ksppinm name,
  ksppdesc value
  from
  x$ksppi
  where
  substr(ksppinm,1,1) = '_'
  order by 1,2
  ) ;