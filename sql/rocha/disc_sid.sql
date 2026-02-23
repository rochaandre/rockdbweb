declare
   Wsid number;
   Wserial# number;
begin
   select s.sid, s.serial# 
   into Wsid, Wserial# 
   from  v$session s, v$process p
   where p.addr =s.paddr
   and s.sid=&1;
   execute immediate 'alter system disconnect session '''||WSID||','||WSERIAL#||''' immediate';
exception
   when others then
      null;
end;
/


                      
