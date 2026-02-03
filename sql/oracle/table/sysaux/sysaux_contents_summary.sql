break on report
compute sum OF MB on report
 
select occupant_desc, space_usage_kbytes/1024 MB
from v$sysaux_occupants
where space_usage_kbytes > 0
order by space_usage_kbytes;