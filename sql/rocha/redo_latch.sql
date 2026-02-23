@save_sqlplus_settings

-- *************************************************
-- Copyright © 2005 by SUPORA
--
-- Change history
-- 
-- jchaves - 20/1/2005 - criacao com Ledu
-- 
-- *************************************************


/* redo_latch.sql */

col "Latch" for a18
col immediate_gets for 99999999990 heading "Immediate|Gets" 
col immediate_misses for 99999999990 heading "Immediate|Misses" 
col "% 1" for 90D99
col "% 2" for 90D99



SELECT  substr(ln.name, 1, 20) "Latch", gets, misses,
        round((misses*100/gets),2)"% 1",
        immediate_gets, immediate_misses ,
        round(((immediate_misses*100)/decode((immediate_misses + immediate_gets),0,1,(immediate_misses + immediate_gets))),2)"% 2",
        l.sleeps
FROM v$latch l, v$latchname ln 
WHERE   ln.name in ('redo allocation', 'redo copy') 
                and ln.latch# = l.latch#; 

prompt -- .
prompt -- NOTAS:
prompt -- .
prompt --   Se "% 1" ou "% 2" for maior que 1% existe contenção
prompt -- comece otimizando redo allocation.
prompt --   % 1 = misses*100/gets
prompt --   % 2 = (immediate_misses*100)/(immediate_misses + immediate_gets)
prompt -- .
prompt --   Para Oracle 8i e 9.0
prompt -- Note:147474.1
prompt -- Note:31283.1 , sobre _LOG_IO_SIZE
prompt -- Aumente LOG_BEFFER , _LOG_SIMULTANEOUS_COPIES
prompt -- .
prompt --   Para Oracle 9.2
prompt -- Aumente LOG_PARELLELISM 
prompt -- Se houver redo copy latch, estude aumentar _LOG_SIMULTANEOUS_COPIES
prompt --    sendo que o DEFAULT e 2x num CPUs 
prompt -- . 
prompt -- . 




@restore_sqlplus_settings

