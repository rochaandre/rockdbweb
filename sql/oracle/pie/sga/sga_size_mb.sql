select   'SGA Max size '||round(bytes/1024/1024) description,  round(bytes/1024/1024) sizemb from v$sgainfo
where name='Maximum SGA Size'
union all
select   name||' '||round(bytes/1024/1024)||' MB' ,  round(bytes/1024/1024)  sizemb
from v$sgainfo
where name not in ( 'Maximum SGA Size','Free SGA Memory Available','Startup overhead in Shared Pool',
'Granule Size','Shared IO Pool Size','Data Transfer Cache Size') ;