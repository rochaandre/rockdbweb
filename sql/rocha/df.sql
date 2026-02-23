set lines 200
COL DF FOR A90
col mb for a15
col mb for 999,999,999,999,999,999,999,999

compute sum of mb on report
break on report

select /*+RULE*/ tablespace_name as ts, file_id, file_name "DF", bytes/1024/1024 "MB", AUTOEXTENSIBLE, increment_by from dba_data_files
where tablespace_name like UPPER('&1')
order by 1,2
/
