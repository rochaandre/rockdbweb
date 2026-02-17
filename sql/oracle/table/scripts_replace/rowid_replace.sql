--1 Select Row by Obj_ID, File#, Block#, Row#
select * from $OBJ_OWNER.$OBJ_NAME 
where rowid = dbms_rowid.rowid_create(1, $DATA_OBJ_ID, $FILEN, $BLOCKN, $ROWN);

