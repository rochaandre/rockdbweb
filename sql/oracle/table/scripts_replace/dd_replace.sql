--1 Get DDL of the object:
declare
 clb CLOB; pos INTEGER:=1; amt INTEGER; len INTEGER; txt VARCHAR2(4000);
begin
 clb := dbms_metadata.get_ddl ('$OBJ_TYPE','$OBJ_NAME','$OBJ_OWNER');
 len := LENGTH(clb);
 LOOP
    amt := INSTR (clb, chr(10), pos);
    IF (amt is null or amt=0) THEN amt:=len; END IF;
    amt := amt - pos;
    IF amt>0 THEN txt :=  NVL(SUBSTR (clb, pos, amt),' '); ELSE txt:=''; END IF;
    pos := pos + amt + 1;
    DBMS_OUTPUT.put_line (SUBSTR(txt,1,250));
    EXIT WHEN pos>=len;
 END LOOP;
end;
/

--2 Get DDL of all $OBJ_TYPE objects in schema:
declare
 clb CLOB; pos INTEGER; amt INTEGER; len INTEGER; txt VARCHAR2(4000);
 handle NUMBER; transhandle NUMBER; cnt NUMBER;
begin
 handle := dbms_metadata.open ('$OBJ_TYPE');
 --dbms_metadata.set_filter (handle, 'NAME_EXPR','like ''%''');
 dbms_metadata.set_filter (handle, 'SCHEMA', '$OBJ_OWNER');
 dbms_metadata.set_count (handle, 10);
 transhandle := dbms_metadata.add_transform (handle, 'DDL');
 dbms_metadata.set_transform_param (transhandle, 'SQLTERMINATOR', TRUE);
 LOOP
   clb := dbms_metadata.fetch_clob (handle);
   EXIT WHEN clb is null;
   pos := 1;
   len := LENGTH(clb);
   txt := '';
   LOOP
     amt := INSTR (clb, chr(10), pos);
     IF (amt is null or amt=0) THEN amt:=len; END IF;
     amt := amt - pos;
     IF amt>0 THEN txt :=  NVL(SUBSTR (clb, pos, amt),' '); ELSE txt:=''; END IF;
     pos := pos + amt + 1;
     DBMS_OUTPUT.put_line (SUBSTR(txt,1,250));
     EXIT WHEN pos>=len;
  END LOOP;
 END LOOP;
end;
/

