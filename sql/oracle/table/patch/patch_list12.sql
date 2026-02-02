   SELECT TO_CHAR(action_time, 'DD-MON-YYYY HH24:MI:SS') AS action_time,
          action,
          namespace namespace_STATUS,
          version description_version,
          comments comments_version,
          ID patch_id,
          bundle_series
   FROM   sys.registry$history
   ORDER by action_time ;