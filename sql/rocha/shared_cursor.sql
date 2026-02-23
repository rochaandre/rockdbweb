--@save_sqlplus_settings

set lines 500

--
-- High version count reason for 11.2.0.2+
-- Usage:
-- SQL> @shared_cursor &sql_id
--


col reason  format a60 word_wrap
col reason2 format a60 word_wrap


select
       s.child_number as CN,
       s.PLAN_HASH_VALUE PHV,
       s.IS_BIND_SENSITIVE as "BIND_SENSE",
       s.IS_BIND_AWARE as "BIND_AWARE",
       s.IS_SHAREABLE as "SHAREABLE",
       use_feedback_stats as USE_FEEDBACK_STATS,
       load_optimizer_stats as OPTIMIZER_STATS,
       bind_equiv_failure as BIND_EQ_FAILURE,
--       reason as Reason,
--	   instr(Reason, '<reason>'),
--	   instr(Reason, '</reason>'),
	   substr(Reason, 
	                   instr(Reason, '<reason>')+length('<reason>'),
					   instr(Reason, '</reason>') - instr(Reason, '<reason>') - +length('<reason>')
				)  reason
  from v$sql_shared_cursor sc, v$sql s
 where sc.sql_id like '&1'
   and sc.child_number = s.child_number
   and sc.sql_id = s.sql_id
order by s.child_number
/


set feedback on VERIFY ON


--@restore_sqlplus_settings
