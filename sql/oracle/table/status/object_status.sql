--Invalid or disabled DB objects
--1 Disabled Triggers:
select o.owner#, o.name, tr.* from sys.trigger$ tr, sys.obj$ o 
where tr.obj#=o.obj# and o.owner#>44 and enabled <> 1;

--2 All Disabled Triggers:
select * from dba_triggers where status!='ENABLED';

--3 Invalid DB objects:
select * from dba_objects where status!='VALID'
order by owner,object_type;


