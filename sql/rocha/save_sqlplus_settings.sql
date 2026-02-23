-------------------------------------------------------------------------------
--
-- Script:	save_sqlplus_settings.sql
-- Purpose:	to reset sqlplus settings
--
-- Copyright:	(c) Ixora Pty Ltd
-- Author:	Steve Adams
--
-------------------------------------------------------------------------------

set termout off
store set sql_&_CONNECT_IDENTIFIER.sql replace
clear breaks
--clear columns
clear computes
set feedback off
set verify off
set termout on
set define "&"


