  SELECT owner, trigger_name, trigger_type, table_owner, table_name, TRIGGERING_EVENT
  from dba_triggers
  where status ='DISABLED'
order by 1 ;