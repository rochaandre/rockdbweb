-- Disabled or Invalid Triggers

-- 1. Disabled Triggers (System internal)
SELECT o.owner#, o.name as trigger_name, tr.* 
FROM sys.trigger$ tr, sys.obj$ o 
WHERE tr.obj#=o.obj# 
AND o.owner#>44 
AND enabled <> 1;

-- 2. All Disabled Triggers (DBA View)
SELECT owner, trigger_name, trigger_type, table_name, status
FROM dba_triggers 
WHERE status != 'ENABLED';

-- 3. Invalid Triggers (DBA Objects)
SELECT owner, object_name, object_type, status
FROM dba_objects 
WHERE object_type = 'TRIGGER' 
AND status != 'VALID';
