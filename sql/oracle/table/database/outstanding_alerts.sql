SELECT reason, message_level, DECODE(message_level, 5, 'WARNING', 1, 'CRITICAL') ALERT_LEVEL,
SUGGESTED_ACTION
FROM dba_outstanding_alerts ;