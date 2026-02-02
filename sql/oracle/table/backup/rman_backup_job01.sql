      select SESSION_KEY, INPUT_TYPE, STATUS,
    to_char(START_TIME,'mm/dd/yy hh24:mi') start_time,
    to_char(END_TIME,'mm/dd/yy hh24:mi')   end_time,
    trunc(elapsed_seconds/3600,3) hours
    from V$RMAN_BACKUP_JOB_DETAILS
    WHERE START_time>=sysdate-8
    order by session_key ;