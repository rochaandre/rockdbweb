@save_sqlplus_settings

col "DIRTY SIZE Mb" format 999G999D99
col "CACHE SIZE Mb" format 999G999D99
col dirty_blocks format 999G999G999
col cache_blocks format 999G999G999G999
col "PCT_DIRTY%" format 990D99999

select RECOVERY_ESTIMATED_IOS dirty_blocks, cache_size.value/block_size.value cache_blocks,
(RECOVERY_ESTIMATED_IOS*block_size.value)/1024/1024 "DIRTY SIZE Mb",
cache_size.value/1024/1024 "CACHE SIZE Mb",
(RECOVERY_ESTIMATED_IOS/(cache_size.value/block_size.value))*100 "PCT_DIRTY%"
from v$instance_recovery,
(select value value from v$sga
where name like 'Database Buffers') cache_size,
(select value from v$parameter
where name = 'db_block_size') block_size
/

--@buffer_pool_state.sql

SELECT RECOVERY_ESTIMATED_IOS
, TARGET_MTTR, ESTIMATED_MTTR, CKPT_BLOCK_WRITES
FROM V$INSTANCE_RECOVERY
/


break on report
col status format a3 truncate
compute sum of blocos on report

col DIRTY format a3
col TEMP  format a3
col PING  format a3
col STALE format a3
col DIRECT format a3

select LRBA_SEQ, flag, 
decode(                                  -- DIRTY VARCHAR2(1)
    bitand(flag,1), 0, 'N', 'Y') DIRTY,
  decode(                                  -- TEMP VARCHAR2(1)
    bitand(flag,16), 0, 'N', 'Y') TEMP,
  decode(                                  -- PING VARCHAR2(1)
    bitand(flag,1536), 0, 'N', 'Y') PING,
  decode(                                  -- STALE VARCHAR2(1)
    bitand(flag,16384), 0, 'N', 'Y') STALE,
  decode(                                  -- DIRECT VARCHAR2(1)
    bitand(flag,65536), 0, 'N', 'Y') DIRECT,
status, count(*) blocos
from x$bh, v$log vl
where  x$bh.LRBA_SEQ = vl.sequence#
and    LRBA_SEQ in (select sequence# from v$log where status in ('ACTIVE','CURRENT'))
and bitand(x$bh.flag,1)=1
group by  LRBA_SEQ, flag, status
order by LRBA_SEQ


col buffer_dirty format a2
col buffer_reused format a2
col mod_started format a2
col block_has_been_logged format a2
col temp_data format a2
col being_written format a2
col waiting_for_write format a2
col multiple_waiters format a2
col recovery_reading format a2
col unlink_from_lock format a2
col down_grade_lock format a2
col clone_being_written format a2
col reading_as_CR format a2
col gotten_in_current_mode format a2
col stale format a2
col deferred_ping format a2
col direct_access format a2
col being_evicted format a2
col ignore_redo format a2
col only_sequential_access format a2
col prefetched_block format a2
col block_written_once format a2
col logically_flushed format a2
col resilvered_already format a2
col transfer_in_progress format a2
col redo_since_read format a2
col waiting_for_bwr format a2
col fusion_write_queue format a2
col ping_write_queue format a2
col plugged_from_foreign_db format a2
col flush_after_writing format a2
col waiting_for_evict format a2

select LRBA_SEQ, flag, 
decode(bitand(flag,power(2,0)),0, 'N', 'Y') buffer_dirty,
decode(bitand(flag,power(2,1)),0, 'N', 'Y') buffer_reused,
decode(bitand(flag,power(2,2)),0, 'N', 'Y') mod_started,
decode(bitand(flag,power(2,3)),0, 'N', 'Y') block_has_been_logged,
decode(bitand(flag,power(2,4)),0, 'N', 'Y') temp_data,
decode(bitand(flag,power(2,5)),0, 'N', 'Y') being_written,
decode(bitand(flag,power(2,6)),0, 'N', 'Y') waiting_for_write,
decode(bitand(flag,power(2,7)),0, 'N', 'Y') multiple_waiters,
decode(bitand(flag,power(2,8)),0, 'N', 'Y') recovery_reading,
decode(bitand(flag,power(2,9)),0, 'N', 'Y') unlink_from_lock,
decode(bitand(flag,power(2,10)),0, 'N', 'Y') down_grade_lock,
decode(bitand(flag,power(2,11)),0, 'N', 'Y') clone_being_written,
decode(bitand(flag,power(2,12)),0, 'N', 'Y') reading_as_CR,
decode(bitand(flag,power(2,13)),0, 'N', 'Y') gotten_in_current_mode,
decode(bitand(flag,power(2,14)),0, 'N', 'Y') stale,
decode(bitand(flag,power(2,15)),0, 'N', 'Y') deferred_ping,
decode(bitand(flag,power(2,16)),0, 'N', 'Y') direct_access,
decode(bitand(flag,power(2,17)),0, 'N', 'Y') being_evicted,
decode(bitand(flag,power(2,18)),0, 'N', 'Y') ignore_redo,
decode(bitand(flag,power(2,19)),0, 'N', 'Y') only_sequential_access,
decode(bitand(flag,power(2,20)),0, 'N', 'Y') prefetched_block,
decode(bitand(flag,power(2,21)),0, 'N', 'Y') block_written_once,
decode(bitand(flag,power(2,22)),0, 'N', 'Y') logically_flushed,
decode(bitand(flag,power(2,23)),0, 'N', 'Y') resilvered_already,
decode(bitand(flag,power(2,24)),0, 'N', 'Y') transfer_in_progress,
decode(bitand(flag,power(2,25)),0, 'N', 'Y') redo_since_read,
decode(bitand(flag,power(2,26)),0, 'N', 'Y') waiting_for_bwr,
decode(bitand(flag,power(2,27)),0, 'N', 'Y') fusion_write_queue,
decode(bitand(flag,power(2,28)),0, 'N', 'Y') ping_write_queue,
decode(bitand(flag,power(2,29)),0, 'N', 'Y') plugged_from_foreign_db,
decode(bitand(flag,power(2,30)),0, 'N', 'Y') flush_after_writing,
decode(bitand(flag,power(2,31)),0, 'N', 'Y') waiting_for_evict,
status, count(*) blocos
from x$bh, v$log vl
where  x$bh.LRBA_SEQ = vl.sequence#
and    LRBA_SEQ in (select sequence# from v$log where status in ('ACTIVE','CURRENT'))
and bitand(x$bh.flag,1)=1
group by  LRBA_SEQ, flag, status
order by LRBA_SEQ



@restore_sqlplus_settings
