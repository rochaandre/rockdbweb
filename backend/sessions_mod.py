import oracledb
from .utils import get_oracle_connection

def get_sessions(conn_info, inst_id=None):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        
        where_clause = "WHERE s.type != 'BACKGROUND'"
        params = []
        if inst_id:
            where_clause += " AND s.inst_id = :inst_id"
            params.append(inst_id)

        # Rich session query matching the UI needs (gv$ version)
        cursor.execute(f"""
            SELECT 
                s.inst_id,
                s.sid, 
                s.serial# as "serial#", 
                s.username, 
                s.status, 
                s.program, 
                s.machine, 
                s.type,
                s.sql_id, 
                s.prev_sql_id, 
                s.last_call_et, 
                s.event, 
                s.wait_class, 
                s.seconds_in_wait,
                (SELECT ROUND(sum(physical_reads + block_gets + consistent_gets)/1024, 2) FROM gv$sess_io WHERE sid = s.sid AND inst_id = s.inst_id) as file_io,
                (SELECT value FROM gv$sesstat st, v$statname sn WHERE st.sid = s.sid AND st.inst_id = s.inst_id AND st.statistic# = sn.statistic# AND sn.name = 'CPU used by this session') as cpu,
                (SELECT command_name FROM v$sqlcommand WHERE command_type = s.command) as command,
                s.row_wait_obj# as lck_obj,
                (SELECT count(*) FROM gv$px_session WHERE qcsid = s.sid AND inst_id = s.inst_id) as pqs,
                s.schemaname as owner,
                s.last_call_et as elapsed
            FROM gv$session s
            {where_clause}
            ORDER BY s.last_call_et DESC
        """, params)
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching sessions: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def kill_session(conn_info, sid, serial, inst_id=1):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        # In RAC, we specify the instance
        cursor.execute(f"ALTER SYSTEM KILL SESSION '{sid},{serial},@{inst_id}' IMMEDIATE")
        return {"success": True, "message": f"Session {sid},{serial} on instance {inst_id} killed"}
    except Exception as e:
        print(f"Error killing session: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_session_sql(conn_info, sql_id, inst_id=None):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        query = "SELECT sql_fulltext FROM gv$sql WHERE sql_id = :sql_id"
        params = {"sql_id": sql_id}
        if inst_id:
            query += " AND inst_id = :inst_id"
            params["inst_id"] = inst_id
            
        cursor.execute(query, params)
        row = cursor.fetchone()
        if row:
            return {"sql_id": sql_id, "sql_text": str(row[0])}
        return {"sql_id": sql_id, "sql_text": "SQL not found in cursor cache"}
    except Exception as e:
        print(f"Error fetching session SQL: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_blocking_sessions(conn_info, inst_id=None):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        # For RAC, hierarchical queries are tricky. 
        # We fetch all candidates and build the hierarchy in Python.
        cursor.execute("""
            SELECT 
                inst_id,
                sid, 
                serial# as serial, 
                username, 
                status, 
                event,
                blocking_instance,
                blocking_session
            FROM gv$session
            WHERE (blocking_session IS NOT NULL)
               OR (sid IN (SELECT blocking_session FROM gv$session WHERE blocking_session IS NOT NULL))
        """)
        columns = [col[0].lower() for col in cursor.description]
        sessions = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        # Build hierarchy
        session_map = {f"{s['inst_id']}-{s['sid']}": s for s in sessions}
        results = []
        
        def add_with_children(sess_key, level, processed_keys):
            if sess_key in processed_keys: return # Avoid cycles
            processed_keys.add(sess_key)
            
            s = session_map[sess_key]
            # Copy and add type/level
            entry = s.copy()
            entry['type'] = 'blocker' if not s['blocking_session'] else 'blocked'
            entry['level'] = level
            results.append(entry)
            
            # Find dependents
            for k, other in session_map.items():
                if other['blocking_instance'] == s['inst_id'] and other['blocking_session'] == s['sid']:
                    add_with_children(k, level + 1, processed_keys)

        processed = set()
        # Start with root blockers
        roots = [f"{s['inst_id']}-{s['sid']}" for s in sessions if not s['blocking_session']]
        for r in roots:
            add_with_children(r, 0, processed)
            
        # Add any orphans (cycles or missing metadata)
        for k in session_map:
            if k not in processed:
                add_with_children(k, 0, processed)

        if inst_id:
            # Filter results if requested, but maintain hierarchy context if needed?
            # Usually, if we filter by instance, we might lose the parent/child link if it's cross-instance.
            # For now, let's return all related to that instance.
            return [r for r in results if r['inst_id'] == inst_id or r.get('blocking_instance') == inst_id]
            
        return results
    except Exception as e:
        print(f"Error fetching blocking sessions: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_long_ops(conn_info, inst_id=None):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        
        where_clause = "WHERE sofar < totalwork"
        params = []
        if inst_id:
            where_clause += " AND inst_id = :inst_id"
            params.append(inst_id)
            
        cursor.execute(f"""
            SELECT 
                inst_id,
                sid, 
                serial# as serial, 
                username, 
                opname, 
                target, 
                sofar, 
                totalwork, 
                time_remaining, 
                message
            FROM gv$session_longops
            {where_clause}
            ORDER BY start_time DESC
        """, params)
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching long operations: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_blocker_details(conn_info, sid, inst_id=1):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        
        # 1. Basic Session Info
        cursor.execute("""
            SELECT sid, serial# as serial, username, status, inst_id, sql_id, prev_sql_id, schemaname
            FROM gv$session WHERE sid = :sid AND inst_id = :inst_id
        """, {"sid": sid, "inst_id": inst_id})
        row = cursor.fetchone()
        if not row:
            return None
        
        columns = [col[0].lower() for col in cursor.description]
        details = dict(zip(columns, row))
        
        # 2. SQL Text
        sql_id = details['sql_id'] or details['prev_sql_id']
        if sql_id:
            cursor.execute("SELECT sql_fulltext FROM gv$sql WHERE sql_id = :sql_id AND inst_id = :inst_id AND ROWNUM = 1", 
                           {"sql_id": sql_id, "inst_id": inst_id})
            sql_row = cursor.fetchone()
            details['sql_text'] = str(sql_row[0]) if sql_row else "SQL text not found"
        else:
            details['sql_text'] = "No active SQL"

        # 3. Lock Stats
        cursor.execute("SELECT count(*) FROM gv$session WHERE blocking_session = :sid AND blocking_instance = :inst_id", 
                       {"sid": sid, "inst_id": inst_id})
        details['users_in_lock'] = cursor.fetchone()[0]
        
        cursor.execute("SELECT count(*) FROM gv$open_cursor WHERE sid = :sid AND inst_id = :inst_id", 
                       {"sid": sid, "inst_id": inst_id})
        details['opened_cursors'] = cursor.fetchone()[0]
        
        # 4. Execution Plan
        if sql_id:
            cursor.execute("""
                SELECT id, operation, options, object_name as object, cost
                FROM gv$sql_plan
                WHERE sql_id = :sql_id AND inst_id = :inst_id AND child_number = (
                    SELECT min(child_number) FROM gv$sql_plan WHERE sql_id = :sql_id AND inst_id = :inst_id
                )
                ORDER BY id
            """, {"sql_id": sql_id, "inst_id": inst_id})
            cols_plan = [col[0].lower() for col in cursor.description]
            details['plan'] = [dict(zip(cols_plan, r)) for r in cursor.fetchall()]
        else:
            details['plan'] = []

        # 5. Related Objects
        cursor.execute("""
            SELECT DISTINCT o.object_type as type, o.owner, o.object_name as name
            FROM gv$locked_object l, dba_objects o
            WHERE l.object_id = o.object_id
            AND l.session_id = :sid AND l.inst_id = :inst_id
        """, {"sid": sid, "inst_id": inst_id})
        cols_obj = [col[0].lower() for col in cursor.description]
        details['objects'] = [dict(zip(cols_obj, r)) for r in cursor.fetchall()]

        return details
    except Exception as e:
        print(f"Error fetching blocker details: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_object_ddl(conn_info, owner, name, obj_type):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        
        # Adjust object type for DBMS_METADATA (e.g., 'TABLE' is fine, but some need mapping)
        cursor.execute("SELECT dbms_metadata.get_ddl(:obj_type, :name, :owner) FROM dual", 
                       {"obj_type": obj_type, "name": name, "owner": owner})
        row = cursor.fetchone()
        return str(row[0]) if row else "DDL not found"
    except Exception as e:
        print(f"Error fetching DDL: {e}")
        return f"-- Error fetching DDL: {str(e)}"
    finally:
        if connection:
            connection.close()
