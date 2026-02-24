SELECT 
    occupant_name, 
    schema_name, 
    space_usage_kbytes / 1024 as space_usage_mb,
    occupant_desc
FROM v$sysaux_occupants
ORDER BY space_usage_kbytes DESC;
