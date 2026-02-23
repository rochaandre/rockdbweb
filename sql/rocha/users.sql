@save_sqlplus_settings

col username format a30
col account_status format a30
col default_tablespace format a25
col temporary_tablespace format a10
col profile format a15
set lines 200

select username, user_id, account_status, profile, 
created, default_tablespace, temporary_tablespace ,
LOCK_DATE, EXPIRY_DATE    
from dba_users
where username like upper('&1')
order by 1;

@restore_sqlplus_settings

