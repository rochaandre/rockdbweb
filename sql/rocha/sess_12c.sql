@pat_11g &1
@trans &1
@session_wait &1

col Event format a40

select event, count(*) from v$active_session_history
where session_id = '&1'
group by event
/

@longops &1




