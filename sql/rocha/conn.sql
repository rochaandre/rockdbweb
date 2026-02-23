disconnect
connect sys/passw0rd as sysdba
--@c:\oracle\ora92\sqlplus\admin\glogin
set time on
alter session set nls_date_format='dd-mm-yyyy hh24:mi:ss';
set termout off
set pages 5000
set sqlprompt 'Not Connected >' 
set hea off feed off show off echo off timing off
spool prp
--select 'set sqlprompt ''' || user || '@' || rtrim(global_name,'.WORLD') || ' > ''' from global_name;
--select 'set sqlprompt ''' || user || '@' || nvl(substr(global_name, 1, instr(global_name,'.',1,1) - 1),global_name) || ' > ''' from global_name;
--select 'set sqlprompt ''' || user || '@' || instance_name || '@' || host_name || ' > ''' from v$instance;
select   /*+ RULE */ 'set sqlprompt ''' || user || '@' || nvl(substr(global_name, 1, instr(global_name,'.',1,1) - 1),global_name) || '.' || host_name ||' > ''' from global_name, v$instance;
--select 'set sqlcontinue ''' || user || '@' || rtrim(global_name,'.WORLD') || ' > ''' from global_name;
spool off
@prp.lst
column versao new_VALUE versao
select decode(substr(version,1,instr(version,'.',1)-1),9,'9i',10,'10g',11,'11g',12,'12c') versao from v$instance;
set hea on feed on 
set termout on
