@save_sqlplus_settings

set linesize 400

col tablespace_name format a25
col space_management format a15

col pCT format 999
col status format a10
col "init(Mb)"  format 990D999
col MIN_EXTLEN(Mb) like "init(Mb)"


col ALLOCATION_TYPE format a15

select tablespace_name, BLOCK_SIZE     , PCT_INCREASE PCT,
initial_extent/1024/1024 "init(Mb)", next_extent/1024/1024 "next(Mb)",MIN_EXTLEn/1024/1024 "MIN_EXTLEN(Mb)",
 status, 
CONTENTS                               ,
LOGGING                                ,
FORCE_LOGGING                          ,
EXTENT_MANAGEMENT                      ,
ALLOCATION_TYPE                        ,
PLUGGED_IN                             ,
BIGFILE                                ,
SEGMENT_SPACE_MANAGEMENT SPACE_MANAGEMENT             ,
DEF_TAB_COMPRESSION    compression      from dba_tablespaces
where tablespace_name like upper('%&1%');


@restore_sqlplus_settings

