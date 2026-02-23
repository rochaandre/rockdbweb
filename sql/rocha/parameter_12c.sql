@save_sqlplus_settings

col name format a40
col value format a60 word wrap
col valid_values like value
col display_value format a40 word wrap
col update_comment format a40 word wrap
set lines 190


select name, value, isdefault, ISSES_MODIFIABLE, ISSYS_MODIFIABLE , ismodified, isdeprecated , update_comment
from v$parameter
where name like '&1'
order by 1;


@restore_sqlplus_settings

