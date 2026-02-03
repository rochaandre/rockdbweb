    select * from (
  select  inst_id, name, DISPLAY_value  value
  from gv$system_parameter2
  where isdefault = 'FALSE'
  -- WHERE ismodified = 'MODIFIED'
  and DISPLAY_value is not null
  order by name,  inst_id, ordinal
  ) ;