select
  a.owner||'.'||a.object_name objct,
  object_type,
  b.blocks_cached,
  blocks_total
from all_objects a
inner join (
  select
    objd data_object_id,
    count(1) blocks_cached
  from v$bh
  /*where status='xcur'*/
  group by objd
) b using(data_object_id)
left join (
  select
    owner,
    segment_name,
    sum(blocks) blocks_total
  from dba_segments
  group by owner,segment_name
) c on (a.owner=c.owner and a.object_name=c.segment_name)
order by blocks_cached desc ;