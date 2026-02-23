WITH
    blockers_and_blockees
    AS
        (SELECT ROWNUM rn, a.*
           FROM gv$session a
          WHERE blocking_session_status = 'VALID'
             OR (inst_id, sid) IN (SELECT blocking_instance, blocking_session
                                     FROM gv$session
                                    WHERE blocking_session_status = 'VALID'))
    SELECT LPAD(' ', 3 * (LEVEL - 1)) || sid || DECODE(LEVEL, 1, ' root blocker')
               blocked_session,
           inst_id,
           event,
              TO_CHAR(FLOOR(seconds_in_wait / 3600), 'fm9900')
           || ':'
           || TO_CHAR(FLOOR(MOD(seconds_in_wait, 3600) / 60), 'fm00')
           || ':'
           || TO_CHAR(MOD(seconds_in_wait, 60), 'fm00')
               time_in_wait,
           username,
           osuser,
           machine,
           (SELECT owner || '.' || object_name
              FROM dba_objects
             WHERE object_id = b.row_wait_obj#)
               waiting_on_object,
           CASE
               WHEN row_wait_obj# > 0
               THEN
                   DBMS_ROWID.rowid_create(1,
                                           row_wait_obj#,
                                           row_wait_file#,
                                           row_wait_block#,
                                           row_wait_row#)
           END
               waiting_on_rowid,
           (SELECT sql_text
              FROM gv$sql s
             WHERE s.sql_id = b.sql_id AND s.inst_id = b.inst_id AND s.child_number = b.sql_child_number)
               current_sql,
           status,
           serial#,
           (SELECT spid
              FROM gv$process p
             WHERE p.addr = b.paddr AND p.inst_id = b.inst_id)
               os_process_id
      FROM blockers_and_blockees b
CONNECT BY PRIOR sid = blocking_session AND PRIOR inst_id = blocking_instance
START WITH blocking_session IS NULL;