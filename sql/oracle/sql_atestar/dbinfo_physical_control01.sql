SELECT decode(rownum,1,'[',',[') ||
       '''' ||inst_id||'''' ||
       ','||'''' ||name||''''||
       ','||'''' ||block_size||''''||
       ','||'''' ||con_id||''''||
       ']' output
from (
    SELECT a.inst_id ,
    a.name,
    a.block_size,
    a.con_id
    FROM GV$CONTROLFILE a
    ORDER BY a.con_id
) ;