select * from dba_mviews;
select * from dba_mview_analysis;
select * from all_refresh_dependencies;

--MatView $OBJ_OWNER.$OBJ_NAME full refresh
begin
 dbms_mview.refresh('$OBJ_OWNER.$OBJ_NAME','C');
end;
/

--Invalid MatViews
select 'alter materialized view '||owner||'.'||mview_name||' compile;'
from dba_mviews where compile_state!='VALID' and owner='$OBJ_OWNER';

