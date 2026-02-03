select
  decode(status,
    'free','FREE',
    'xcur','EXCLUSIVE',
    'scur','SHARED',
    'cr','CONSISTENT READ',
    'read','READ FROM DISK',
    'mrec','MEDIA RECOVERY',
    'irec','INSTANCE RECOVERY',
    NULL
  ) "STATUS",
  count(1) "BLOCKS"
from v$bh
group by status ;