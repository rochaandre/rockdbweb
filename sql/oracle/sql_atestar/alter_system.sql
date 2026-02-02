
select 'alter system set '||name ||'='||  trim(value)/1024/1024 ||'M'|| ' sid=' ||''''||'*'||''''||' scope=spfile ;' label
from v$parameter
where name in ( 'sga_max_size','sga_target','memory_max_target','memory_target',
'pga_aggregate_target','pga_aggregate_target_limit','shared_pool_size')
and  value <>'0'
union
select 'alter system set '||name ||'='||  to_char(value)  ||  ' sid=' ||''''||'*'||''''||' scope=spfile ;'
from v$parameter
where name in (
  'sessions','session_cached_cursors','open_cursors','open_links','undo_retention'
  ,'smtp_out_server'
  ,'resource_limit'
  ,'db_writer_processes' )
  and value is not NULL
UNION
select 'alter system set '||name ||'='||  to_char(value)   || ' sid=' ||''''||'*'||''''||' scope=spfile ;'
from v$parameter where name LIKE
  '%ptimizer_index_%'
  UNION
select 'alter system set '||name ||'='||  to_char(value)  ||  ' sid=' ||''''||'*'||''''||' scope=spfile ;'
from v$parameter where name= 'optimizer_features_enable'
union
select 'alter system set '||name ||'='||  to_char(value)  ||  ' sid=' ||''''||'*'||''''||' scope=spfile ;'
from v$parameter where name like '%service_names%'
union
select 'alter system set '||name ||'='||  to_char(value)  ||  ' sid=' ||''''||'*'||''''||' scope=spfile ;'
from v$parameter where name like '%global%'
union
select 'alter system set '||name ||'='||  to_char(value)  ||  ' sid=' ||''''||'*'||''''||' scope=spfile ;'
from v$parameter where name like '%domain%'
union
select 'alter system set '||name ||'='||  to_char(value)  ||  ' sid=' ||''''||'*'||''''||' scope=spfile ;'
from v$parameter where name like '%retentio%'
union
select 'alter system set '||name ||'='||  to_char(value)  ||  ' sid=' ||''''||'*'||''''||' scope=spfile ;'
from v$parameter where name like '%recycle%'
union
select 'alter system set '||name ||'='|| ''''|| value  || ''''||''||  ' sid=' ||''''||'*'||''''||' scope=spfile ;'
from v$parameter where name in ( 'nls_territory','nls_language','nls_sort','nls_language','nls_date_format','nls_currency')
  and value is not NULL
  union
  select 'alter system set '||name ||'='||   value   ||''||  ' sid=' ||''''||'*'||''''||' scope=spfile ;'
  from v$parameter
  where name in
  ('parallel_min_percent'
  ,'parallel_min_servers'
  ,'parallel_max_servers')
  union
  select 'alter system set '||name ||'='|| ''''|| value  || ''''||''||  ' sid=' ||''''||'*'||''''||' scope=spfile ;'
  from v$parameter
  where name in
  ('parallel_degree_policy'
  ,'parallel_degree_limit')
  UNION
select parameter|| ' ' || value from v$option where PARAMETER = 'Unified Auditing'
;;
