select d.db_unique_name, d.database_role, d.open_mode, v.version db_version,
p.value db_compatible, v.status db_status, d.PLATFORM_NAME ,v.HOST_NAME , v.LOGINS , v.VERSION_FULL
from gv$database d, gv$instance v, gv$parameter p
where p.name = 'compatible'
and d.inst_id=v.inst_id and v.inst_id = p.inst_id ;