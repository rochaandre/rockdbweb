@save_sqlplus_settings

col tempo_de_switch_horas format 90D99
col tempo_de_switch  justify right format a15

break on report
compute avg of TEMPO_DE_SWITCH_HORAS on report

select lh1.recid, lh1.first_time begin, lh2.first_time end,
(lh2.first_time-lh1.first_time)*24 tempo_de_switch_horas,
     to_char(floor((lh2.first_time-lh1.first_time)*24),'fm0000')||':'||
     to_char(floor(mod((lh2.first_time-lh1.first_time)*86400,3600)/60),'fm00')||':'||
     to_char(mod(mod((lh2.first_time-lh1.first_time)*86400,3600),60),'fm00')||'s' tempo_de_switch
from
(
select * from v$log_history
where recid >= (select max(recid)-30 from v$log_history)
and   recid <= (select max(recid)    from v$log_history)
) lh1,
(
select * from v$log_history
where recid >= (select max(recid)-31 from v$log_history)
and   recid <= (select max(recid)-1  from v$log_history)
) lh2
where lh1.recid=lh2.recid-1
and lh1.first_time >= sysdate-1
/

@restore_sqlplus_settings

