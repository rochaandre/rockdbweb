@save_sqlplus_settings


--------------------------------------------------------------------------------
--
-- File name:   ashtop.sql v1.1
-- Purpose:     Display top ASH time (count of ASH samples) grouped by your
--              specified dimensions
--              
-- Author:      Tanel Poder
-- Copyright:   (c) http://blog.tanelpoder.com
--              
-- Usage:       
--     @ashtop <grouping_cols> <filters> <fromtime> <totime>
--
-- Example:
--     @ashtop username,sql_id session_type='FOREGROUND' sysdate-1/24 sysdate
--
-- Other:
--     This script uses only the in-memory V$ACTIVE_SESSION_HISTORY, use
--     @dashtop.sql for accessiong the DBA_HIST_ACTIVE_SESS_HISTORY archive
--              
--------------------------------------------------------------------------------
/**
 * Added from Tanel's init script //Sayan Malakshinov
 */
col snapper_ora09lower      noprint new_value _IF_LOWER_THAN_ORA09
col snapper_ora10lower      noprint new_value _IF_LOWER_THAN_ORA10
col snapper_ora11lower      noprint new_value _IF_LOWER_THAN_ORA11
col snapper_ora12lower      noprint new_value _IF_LOWER_THAN_ORA12

col snapper_ora09higher     noprint new_value _IF_ORA09_OR_HIGHER
col snapper_ora10higher     noprint new_value _IF_ORA10_OR_HIGHER
col snapper_ora11higher     noprint new_value _IF_ORA11_OR_HIGHER
col snapper_ora12higher     noprint new_value _IF_ORA12_OR_HIGHER

set term off

with 
version as (
    select 
      ver
     ,substr(ver,1,2) v1
     ,substr(ver,1,4) v2
    from (
      select lpad('&_O_RELEASE',10,' ') ver from dual
    )
)
select
    case when v1  <  '09'        then ''   else '--'  end   snapper_ora09lower,
    case when v1  <  '10'        then ''   else '--'  end   snapper_ora10lower,
    case when v1  <  '11'        then ''   else '--'  end   snapper_ora11lower,
    case when v1  <  '12'        then ''   else '--'  end   snapper_ora12lower,
    case when v1  >= '09'        then ''   else '--'  end   snapper_ora09higher,
    case when v1  >= '10'        then ''   else '--'  end   snapper_ora10higher,
    case when v1  >= '11'        then ''   else '--'  end   snapper_ora11higher,
    case when v1  >= '12'        then ''   else '--'  end   snapper_ora12higher
from
    version
/

set term on

/**
 * End of Added by Sayan
 */
COL "%This" FOR A7
--COL p1     FOR 99999999999999
--COL p2     FOR 99999999999999
--COL p3     FOR 99999999999999
COL p1text      FOR A30 word_wrap
COL p2text      FOR A30 word_wrap
COL p3text      FOR A30 word_wrap
COL p1hex       FOR A17
COL p2hex       FOR A17
COL p3hex       FOR A17
COL AAS         FOR 9999.9
COL totalseconds HEAD "Total|Seconds" FOR 99999999
COL event       FOR A40 WORD_WRAP
COL event2      FOR A40 WORD_WRAP
COL username    FOR A20 wrap
COL obj         FOR A30
COL objt        FOR A50
COL sql_opname  FOR A20
COL top_level_call_name FOR A30
COL wait_class  FOR A15
col FIRST_SEEN format a20
col LAST_SEEN like FIRST_SEEN 
col DIST_SQLEXEC_SEEN format 999999999

SELECT * FROM (
    WITH bclass AS (SELECT class, ROWNUM r from v$waitstat)
    SELECT /*+ LEADING(a) USE_HASH(u) */
                        COUNT(*)                                                     totalseconds
                      , ROUND(COUNT(*) / ((CAST(&4 AS DATE) - CAST(&3 AS DATE)) * 86400), 1) AAS
                      , LPAD(ROUND(RATIO_TO_REPORT(COUNT(*)) OVER () * 100)||'%',5,' ')||' |' "%This"
                      , &1
                      , TO_CHAR(MIN(sample_time), 'YYYY-MM-DD HH24:MI:SS') first_seen
                      , TO_CHAR(MAX(sample_time), 'YYYY-MM-DD HH24:MI:SS') last_seen
                --    , MAX(sql_exec_id) - MIN(sql_exec_id)
&_IF_ORA11_OR_HIGHER  , COUNT(DISTINCT sql_exec_start||':'||sql_exec_id) dist_sqlexec_seen
    FROM
        (SELECT
             a.*
           , session_id sid
           , session_serial# serial
           , TO_CHAR(CASE WHEN session_state = 'WAITING' THEN p1 ELSE null END, '0XXXXXXXXXXXXXXX') p1hex
           , TO_CHAR(CASE WHEN session_state = 'WAITING' THEN p2 ELSE null END, '0XXXXXXXXXXXXXXX') p2hex
           , TO_CHAR(CASE WHEN session_state = 'WAITING' THEN p3 ELSE null END, '0XXXXXXXXXXXXXXX') p3hex
           , NVL(event, session_state)||
                CASE WHEN a.event IN ('buffer busy waits', 'gc buffer busy', 'gc buffer busy acquire', 'gc buffer busy release')
                --THEN ' ['||CASE WHEN (SELECT class FROM bclass WHERE r = a.p3) IS NULL THEN ||']' ELSE null END event2 -- event is NULL in ASH if the session is not waiting (session_state = ON CPU)
                THEN ' ['||CASE WHEN a.p3 <= (SELECT MAX(r) FROM bclass) 
                           THEN (SELECT class FROM bclass WHERE r = a.p3)
                           ELSE (SELECT DECODE(MOD(BITAND(a.p3,TO_NUMBER('FFFF','XXXX')) - 17,2),0,'undo header',1,'undo data', 'error') FROM dual)
                           END  ||']' 
                ELSE null END event2 -- event is NULL in ASH if the session is not waiting (session_state = ON CPU)
        FROM gv$active_session_history a) a
      , dba_users u
      , (SELECT
             object_id,data_object_id,owner,object_name,subobject_name,object_type
           , owner||'.'||object_name obj
           , owner||'.'||object_name||' ['||object_type||']' objt
         FROM dba_objects) o
    WHERE
        a.user_id = u.user_id (+)
    AND a.current_obj# = o.object_id(+)
    AND &2
    AND sample_time BETWEEN &3 AND &4
    GROUP BY
        &1
    ORDER BY
        TotalSeconds DESC
       , &1
)
WHERE
    ROWNUM <= 20
/
@restore_sqlplus_settings
