SELECT
    conf# as "CONF#",
    name,
    value
FROM v$rman_configuration
ORDER BY conf# ;