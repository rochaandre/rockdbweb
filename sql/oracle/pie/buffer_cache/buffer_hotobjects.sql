select * from (
  select
    b.owner||'.'||b.object_name||nvl2(b.subobject_name,'.'||b.subobject_name,'') object1,
    b.owner||'.'||b.object_name||nvl2(b.subobject_name,'.'||b.subobject_name,'') object2,
    a.tch touch_count
  from x$bh a, dba_objects b
  where a.obj=b.object_id and a.tch > 1
  order by 3 desc
) where rownum<=100 ;