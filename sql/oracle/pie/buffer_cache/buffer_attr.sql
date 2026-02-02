select
case
  when dirty  = 'Y' then 'DIRTY'
  when temp   = 'Y' then 'TEMP'
  when ping   = 'Y' then 'PING'
  when stale  = 'Y' then 'STALE'
  when direct = 'Y' then 'DIRECT'
  when new    = 'Y' then 'NEW'
  else                   '---'
end "ATTR",
count(1) "COUNT"
from v$bh
--where dirty='Y' or temp='Y' or ping='Y' or stale='Y' or direct='Y'
group by 'BLOCK',
case
  when dirty  ='Y' then 'DIRTY'
  when temp   ='Y' then 'TEMP'
  when ping   ='Y' then 'PING'
  when stale  ='Y' then 'STALE'
  when direct ='Y' then 'DIRECT'
  when new    ='Y' then 'NEW'
  else                  '---'
end ;