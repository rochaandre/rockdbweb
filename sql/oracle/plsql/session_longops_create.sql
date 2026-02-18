-- Test purpose - Fake session long operations

DECLARE
  v_rindex    BINARY_INTEGER := dbms_application_info.set_session_longops_nohint;
  v_slno      BINARY_INTEGER; -- need be NULL
  v_totalwork NUMBER := 100;  
  v_sofar     NUMBER := 0;
  v_obj_name  VARCHAR2(30) := 'MVIEW_REFRESH_SALES'; -- Name operation
BEGIN

  FOR i IN 1..v_totalwork LOOP
    
    -- Simulation
    v_sofar := i;
    dbms_session.sleep(0.1); -- this is some time to get the data in V$SESSION_LONGOPS

    -- Atualiza a V$SESSION_LONGOPS
    DBMS_APPLICATION_INFO.SET_SESSION_LONGOPS(
      rindex      => v_rindex,
      slno        => v_slno,
      op_name     => 'Refresh Materialized View',
      target      => 0,                -- ID object
      context     => 1,                 -- ID conext
      sofar       => v_sofar,
      totalwork   => v_totalwork,
      target_desc => v_obj_name,
      units       => 'batches'          -- Unit 
    );
  END LOOP;
END;
/