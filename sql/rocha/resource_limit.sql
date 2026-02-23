@save_sqlplus_settings

col resource_name format a60

select * from v$resource_limit
where resource_name like '%&1%';

@restore_sqlplus_settings

