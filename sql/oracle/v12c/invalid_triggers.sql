-- Invalid Triggers Detail
SELECT t.owner, t.trigger_name, t.table_name, o.status, t.status as trigger_status
FROM dba_triggers t
JOIN dba_objects o ON t.owner = o.owner AND t.trigger_name = o.object_name
WHERE o.object_type = 'TRIGGER'
AND (o.status = 'INVALID' OR t.status = 'DISABLED')
AND t.owner LIKE :owner_filter
ORDER BY t.owner, t.trigger_name
