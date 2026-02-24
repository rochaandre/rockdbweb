-- RMAN Backup Summary with Detailed Metrics and RAC Support
-- Expected columns: session_recid, session_stamp, start_time, end_time, output_mbytes, status, input_type, dow, elapsed_seconds, time_taken_display, cf, df, i0, i1, l, output_instance

select
    j.session_recid, j.session_stamp,
    to_char(j.start_time, 'yyyy-mm-dd hh24:mi:ss') start_time,
    to_char(j.end_time, 'yyyy-mm-dd hh24:mi:ss') end_time,
    round(j.output_bytes/1024/1024, 2) output_mbytes, j.status, j.input_type,
    decode(to_char(j.start_time, 'd'), 1, 'Sunday', 2, 'Monday',
    3, 'Tuesday', 4, 'Wednesday',
    5, 'Thursday', 6, 'Friday',
    7, 'Saturday') dow,
    j.elapsed_seconds, 
    to_char(floor(j.elapsed_seconds/3600), 'fm9900') || ':' || to_char(floor(mod(j.elapsed_seconds, 3600)/60), 'fm00') || ':' || to_char(mod(j.elapsed_seconds, 60), 'fm00') as time_taken_display,
    coalesce(x.cf, 0) as cf, coalesce(x.df, 0) as df, coalesce(x.i0, 0) as i0, coalesce(x.i1, 0) as i1, coalesce(x.l, 0) as l,
    coalesce(ro.inst_id, 1) as output_instance
from V$RMAN_BACKUP_JOB_DETAILS j
left outer join (
    select
        d.session_recid, d.session_stamp,
        sum(case when d.controlfile_included = 'YES' then d.pieces else 0 end) CF,
        sum(case when d.controlfile_included = 'NO'
        and (d.backup_type||to_char(d.incremental_level) = 'D' 
             or (d.incremental_level is null and d.backup_type = 'D')) then d.pieces else 0 end) DF,
        sum(case when d.backup_type||to_char(d.incremental_level) = 'D0' then d.pieces else 0 end) I0,
        sum(case when d.backup_type||to_char(d.incremental_level) = 'I1' then d.pieces else 0 end) I1,
        sum(case when d.backup_type = 'L' then d.pieces else 0 end) L
    from
        V$BACKUP_SET_DETAILS d
    group by d.session_recid, d.session_stamp
) x on x.session_recid = j.session_recid and x.session_stamp = j.session_stamp
left outer join (
    select o.session_recid, o.session_stamp, min(inst_id) inst_id
    from GV$RMAN_OUTPUT o
    group by o.session_recid, o.session_stamp
) ro on ro.session_recid = j.session_recid and ro.session_stamp = j.session_stamp
where j.start_time >= sysdate - :days
order by j.start_time DESC ;