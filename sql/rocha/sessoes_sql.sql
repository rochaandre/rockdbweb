@save_sqlplus_settings

set lines 160 pages 200
set verify on 
set concat "."


--accept SQL prompt 'Entre com pedaço SQL para ver sessoes executando: '

select sid, username, osuser, machine from v$session
where sql_hash_value in
  (select hash_value from v$sqltext
   where sql_text like '%select count(*) from tabs%' )
/

@restore_sqlplus_settings
