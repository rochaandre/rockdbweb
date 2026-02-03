select a. INST_ID, a.NAME pdb_name,  b.version, c.status inst_status, b.host_name, c.logins, c.edition, c.database_type, c.host_name,b.instance_name, 
a.OPEN_MODE PDB_OPEN_MODE , decode (c.host_name, b.host_name, 'CURRENT' ) instancehost,  d.open_mode db_open_mode, d.DATABASE_ROLE
from gv$pdbs a, gv$instance b, v$instance c, gv$database d 
where a.inst_id = b.inst_id 
and d. INST_ID = b.inst_id 
and b.host_name = c.HOST_NAME(+) ;



