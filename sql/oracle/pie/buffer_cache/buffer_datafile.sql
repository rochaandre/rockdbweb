select  b.name,a.blocks from (
  select
    file#,count(status) blocks
  from v$bh
  where status<>'free'
  group by file#
) a
left join v$datafile b using(file#) ;