@save_sqlplus_settings


prompt ve_obj v2.04 - Lista objetos
prompt
set verify off
accept objeto        prompt 'Nome do objeto :'
accept tipo          prompt 'Tipo do objeto :'
accept dono          prompt 'Dono :'
accept status        prompt 'Status :'
accept criacao       prompt 'Data de criacao [DD-MMM-YYYY] :'
accept atualizacao   prompt 'Data da ultima atualizacao [DD-MMM-YYYY] :'
--
select rpad(object_name,30)"OBJETO",
       rpad(object_type,14) "TIPO",
       rpad(owner,15) "PROPRIETARIO",
       rpad(status,3) "STATUS",
       rpad(to_char(created,'DD/MM/YY hh24:mi'),14) "CRIACAO",
       rpad(to_char(last_ddl_time,'DD/MM/YY hh24:mi'),14) "ULTIMA_ATUALIZ"
from dba_objects
where object_type    = upper(nvl('&tipo',object_type)) and
      object_name like upper(nvl('&objeto',object_name)) and
      owner           = upper(nvl('&dono',owner))        and
      status          = upper(nvl('&status',status))             and
      trunc(created) > = trunc(nvl(to_date('&criacao'),created)) and
      trunc(last_ddl_time) > = trunc(nvl(to_date('&atualizacao'),last_ddl_time))
order by owner,object_type,object_name;
set verify on

undefine objeto 
undefine tipo    
undefine dono     
undefine status    
undefine criacao    
undefine atualizacao 

@restore_sqlplus_settings