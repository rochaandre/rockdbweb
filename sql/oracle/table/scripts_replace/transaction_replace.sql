--All tranasactions
select * from v$transaction;

--All tranasactions + sid and username
select s.sid,s.username, t.start_time, t.used_ublk, t.used_urec
from v$transaction t, v$session s
where t.ses_addr=s.saddr;

--All tranasactions + sid and username + first 64 bytes of SQL
select s.sid,s.username, t.start_time, t.used_ublk, t.used_urec,sql.sql_text
from v$transaction t, v$session s, v$sql sql
where t.ses_addr=s.saddr
 and s.sql_address=sql.address and s.sql_hash_value=sql.hash_value;

