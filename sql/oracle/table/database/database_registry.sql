  select comp_name name, status value from dba_registry
  union all
   select parameter, value from v$option ;