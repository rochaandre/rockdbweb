select  'PGA_USED_MEM' pga_used_mem,round(sum(pga_used_mem)/1024/1024,3) "PGA_USED_MEM_MB"
from v$process
union all
select  'PGA_FREEABLE_MEM' pga_freeable_mem,round(sum(pga_freeable_mem)/1024/1024,3) "PGA_USED_MEM_MB"
from v$process
union all
select  'PGA_UNFREEABLE_MEM' pga_unfreeable_mem, round(sum(pga_alloc_mem-pga_used_mem-pga_freeable_mem)/1024/1024,3) "PGA_UNFREEABLE_MEM"
from v$process ;