SELECT '*.'||name ||'=' ||''''||display_value||'''' 
FROM v$system_parameter
WHERE name = 'db_name'
UNION 
SELECT '*.'||name ||'=' || display_value 
FROM v$system_parameter
WHERE value IS NOT NULL and Isdefault='FALSE'  
AND name NOT IN ('compatible','_ash_size','_messages','spfile','control_files',
'log_archive_dest_1','log_archive_dest_2','log_archive_dest_state_2','log_archive_dest_state_3',
'log_archive_dest_state_4','fal_server','log_archive_config','log_archive_format','db_create_file_dest',
'db_create_online_log_dest_1','db_recovery_file_dest','standby_file_management','dg_broker_startdg_broker_start',
'db_file_name_convert','log_file_name_convert','fast_start_parallel_rollback',
'db_unique_name','db_block_size','log_archive_min_succeed_dest','log_archive_max_processes','undo_tablespace','background_dump_dest'
) 
AND TYPE IN (1,3,6)
and  value <>'0'
UNION 
SELECT '*.'||name ||'=' ||''''||display_value||''''
FROM v$system_parameter
WHERE value IS NOT NULL and Isdefault='FALSE'  
AND TYPE IN (2)
AND name NOT IN ('local_listener','user_dump_dest',
'compatible','_ash_size','_messages','spfile','control_files',
'log_archive_dest_1','log_archive_dest_2','log_archive_dest_state_2','log_archive_dest_state_3',
'log_archive_dest_state_4','fal_server','log_archive_config','log_archive_format','db_create_file_dest',
'db_create_online_log_dest_1','db_recovery_file_dest','standby_file_management','dg_broker_startdg_broker_start',
'db_file_name_convert','log_file_name_convert','fast_start_parallel_rollback',
'db_unique_name','db_block_size','log_archive_min_succeed_dest','log_archive_max_processes','undo_tablespace','background_dump_dest'
) 
UNION 
SELECT '*.'||name ||'=' || display_value
FROM (
select 'sessions' name, round(((current_utilization +200) *1.1)) display_value
from v$resource_limit
where resource_name in ( 'processes' ) 
UNION 
select 'transactions' name, round(((current_utilization+200) *1.1+50)*1.1) value
from v$resource_limit
where resource_name in ( 'processes' ) 
UNION 
select  'processes' name,  (current_utilization +200) value
from v$resource_limit
where resource_name in ( 'processes' ) )
ORDER BY 1;;