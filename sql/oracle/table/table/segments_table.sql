--1 Move table from one tablespace to another
--  (check for unusable indexes after that).
alter table $OBJ_OWNER.$OBJ_NAME move tablespace $NEW_TS_NAME
;

--2 Move table partition from one tablespace to another
-- (check for unusable indexes and partitoned indexes after that).
alter table $OBJ_OWNER.$OBJ_NAME
move partition $S0 tablespace $NEW_TS_NAME
;

--3 Move table subpartition from one tablespace to another
-- (check for unusable indexes, partitioned indexes, and subpartitioned indexes).
alter table $OBJ_OWNER.$OBJ_NAME
move subpartition $S1 tablespace $NEW_TS_NAME
;

