@save_sqlplus_settings

set verify off
clear breaks
col "SID" format 99999
col "Serial#" format 99999
col "OS Process" format a10
col "Oracle User" format a15
col Rollback format a25
col "OS User" format a8
col Status format a8
col program format a30
col logon_time format a20
col start_time format a20
col Blocks format 999999999

select s.sid "SID", s.serial# "Serial#", p.spid "OS Process", s.username "Oracle User",
   r.name "Rollback", s.osuser "OS User", s.status Status,
   t.used_ublk Blocks, 
   CASE WHEN (sysdate - TO_DATE(t.start_time, 'MM/DD/YY HH24:MI:SS')) = 0
           THEN t.used_urec
           ELSE t.used_urec / NVL(((sysdate - TO_DATE(t.start_time, 'MM/DD/YY HH24:MI:SS')) * 86400), 1)
        END  rows_per_sec,
   t.used_urec trows,
   to_char(s.logon_time,'DD/MM/YYYY HH24:MI:SS') logon_time,
   start_time
from v$process p, v$rollname r, v$session s, v$transaction t
where  s.taddr = t.addr
and t.xidusn   = r.usn
and   p.addr (+) =s.paddr
and (s.sid like '&1' or s.username like '&1')
/

@restore_sqlplus_settings
