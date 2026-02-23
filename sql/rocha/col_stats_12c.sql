@save_sqlplus_settings

-- 
--  display_raw.sql
--
--  DESCRIPTION
--    helper function to print raw representation of column stats minimum or maximum
--  
--  Created by Greg Rahn on 2011-08-19.
-- 

set termout off
create function display_raw (rawval raw, type varchar2)
return varchar2
is
    cn     number;
    cv     varchar2(32);
    cd     date;
    cnv    nvarchar2(32);
    cr     rowid;
    cc     char(32);
    cbf    binary_float;
    cbd    binary_double;
begin
    if (type = 'VARCHAR2') then
        dbms_stats.convert_raw_value(rawval, cv);
        return to_char(cv);
    elsif (type = 'DATE') then
        dbms_stats.convert_raw_value(rawval, cd);
        return to_char(cd);
    elsif (type = 'NUMBER') then
        dbms_stats.convert_raw_value(rawval, cn);
        return to_char(cn);
    elsif (type = 'BINARY_FLOAT') then
        dbms_stats.convert_raw_value(rawval, cbf);
        return to_char(cbf);
    elsif (type = 'BINARY_DOUBLE') then
        dbms_stats.convert_raw_value(rawval, cbd);
        return to_char(cbd);
    elsif (type = 'NVARCHAR2') then
        dbms_stats.convert_raw_value(rawval, cnv);
        return to_char(cnv);
    elsif (type = 'ROWID') then
        dbms_stats.convert_raw_value(rawval, cr);
        return to_char(cr);
    elsif (type = 'CHAR') then
        dbms_stats.convert_raw_value(rawval, cc);
        return to_char(cc);
    else
        return 'UNKNOWN DATATYPE';
    end if;
end;
/
set termout on

col table_name format a30
col owner format a20
col column_name format a25
col data_type format a20
col partition_name format a18
col subpartition_name format a18
set lines 300


col low_value format A5
col high_value format A5
col density format 90D9999999
col "Rows" format 9999999999
col "Blks" format 9999999
col "Emp Blks" format 9999999
col "Avg Space" format 9999999
col "Avg Row Len" format 9999999
col "Sample" format 99999999999
col nulls format 999999999
col buckets format 99999
set pages 50
set verify off

col low_value format a22 truncate
col high_value format a22 truncate

--Stats da coluna
select owner, column_name, data_type, data_length, Nullable, 
NUM_DISTINCT           ,
DENSITY                ,
NUM_NULLS  nulls             ,
NUM_BUCKETS  buckets          ,
HISTOGRAM              ,
--low_value, high_value, 
display_raw(low_value, data_type) as low_value,
display_raw(high_value,data_type) as high_value,
LAST_ANALYZED          ,
sample_size "Sample" 
from dba_tab_columns
where owner like upper('&1')
and table_name like upper('&2')
and column_name like upper('&3')
/

UNDEFINE 1

@restore_sqlplus_settings

