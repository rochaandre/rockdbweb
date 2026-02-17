import oracledb
from .utils import get_oracle_connection, safe_value



def get_instances(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        cursor.execute("SELECT inst_id, instance_name, host_name, status FROM gv$instance ORDER BY inst_id")
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching instances: {e}")
        raise e
    finally:
        if connection:
            connection.close()

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

        # Load version-aware SQL
        from .sql_central_mod import get_sql_content
        version = conn_info.get('version')
        sql_template = get_sql_content("oracle/sessions.sql", version)
        
        # Inject where_clause
        sql_text = sql_template.format(where_clause=where_clause)
        
        cursor.execute(sql_text, params)
        columns = [col[0].lower() for col in cursor.description]
        return [{k: safe_value(v) for k, v in zip(columns, row)} for row in cursor.fetchall()]
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
            return {"sql_id": sql_id, "sql_text": safe_value(row[0])}
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
        
        from .sql_central_mod import get_sql_content
        version = conn_info.get('version')
        sql_text = get_sql_content("oracle/blocking_sessions.sql", version)
        
        cursor.execute(sql_text)
        columns = [col[0].lower() for col in cursor.description]
        # Use safe_value for blocking sessions too
        sessions = [{k: safe_value(v) for k, v in zip(columns, row)} for row in cursor.fetchall()]
        
        # Build hierarchy
        session_map = {f"{s['inst_id']}-{s['sid']}": s for s in sessions}
        results = []
        
        def add_with_children(sess_key, level, processed_keys):
            if sess_key in processed_keys: return 
            processed_keys.add(sess_key)
            
            s = session_map[sess_key]
            entry = s.copy()
            entry['type'] = 'blocker' if not s['blocking_session'] else 'blocked'
            entry['level'] = level
            results.append(entry)
            
            for k, other in session_map.items():
                if other['blocking_instance'] == s['inst_id'] and other['blocking_session'] == s['sid']:
                    add_with_children(k, level + 1, processed_keys)

        processed = set()
        roots = [f"{s['inst_id']}-{s['sid']}" for s in sessions if not s['blocking_session']]
        for r in roots:
            add_with_children(r, 0, processed)
            
        for k in session_map:
            if k not in processed:
                add_with_children(k, 0, processed)

        if inst_id:
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
            
        from .sql_central_mod import get_sql_content
        version = conn_info.get('version')
        sql_template = get_sql_content("oracle/long_ops.sql", version)
        
        sql_text = sql_template.format(where_clause=where_clause)
        
        cursor.execute(sql_text, params)
        columns = [col[0].lower() for col in cursor.description]
        return [{k: safe_value(v) for k, v in zip(columns, row)} for row in cursor.fetchall()]
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
        
        from .sql_central_mod import get_sql_content
        version = conn_info.get('version')
        sql_basic = get_sql_content("oracle/blocker_details_basic.sql", version)
        
        cursor.execute(sql_basic, {"sid": sid, "inst_id": inst_id})
        row = cursor.fetchone()
        if not row:
            return None
        
        columns = [col[0].lower() for col in cursor.description]
        details = {k: safe_value(v) for k, v in zip(columns, row)}
        
        sql_id = details.get('sql_id') or details.get('prev_sql_id')
        if sql_id:
            cursor.execute("SELECT sql_fulltext FROM gv$sql WHERE sql_id = :sql_id AND inst_id = :inst_id AND ROWNUM = 1", 
                           {"sql_id": sql_id, "inst_id": inst_id})
            sql_row = cursor.fetchone()
            details['sql_text'] = safe_value(sql_row[0]) if sql_row else "SQL text not found"
        else:
            details['sql_text'] = "No active SQL"

        cursor.execute("SELECT count(*) FROM gv$session WHERE blocking_session = :sid AND blocking_instance = :inst_id", 
                       {"sid": sid, "inst_id": inst_id})
        details['users_in_lock'] = cursor.fetchone()[0]
        
        cursor.execute("SELECT count(*) FROM gv$open_cursor WHERE sid = :sid AND inst_id = :inst_id", 
                       {"sid": sid, "inst_id": inst_id})
        details['opened_cursors'] = cursor.fetchone()[0]
        
        if sql_id:
            sql_plan = get_sql_content("oracle/blocker_details_plan.sql", version)
            cursor.execute(sql_plan, {"sql_id": sql_id, "inst_id": inst_id})
            cols_plan = [col[0].lower() for col in cursor.description]
            details['plan'] = [{k: safe_value(v) for k, v in zip(cols_plan, r)} for r in cursor.fetchall()]
        else:
            details['plan'] = []

        cursor.execute("""
            SELECT DISTINCT o.object_type as type, o.owner, o.object_name as name
            FROM gv$locked_object l, dba_objects o
            WHERE l.object_id = o.object_id
            AND l.session_id = :sid AND l.inst_id = :inst_id
        """, {"sid": sid, "inst_id": inst_id})
        cols_obj = [col[0].lower() for col in cursor.description]
        details['objects'] = [{k: safe_value(v) for k, v in zip(cols_obj, r)} for r in cursor.fetchall()]

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
        
        cursor.execute("SELECT dbms_metadata.get_ddl(:obj_type, :name, :owner) FROM dual", 
                       {"obj_type": obj_type, "name": name, "owner": owner})
        row = cursor.fetchone()
        return safe_value(row[0]) if row else "DDL not found"
    except Exception as e:
        print(f"Error fetching DDL: {e}")
        return f"-- Error fetching DDL: {str(e)}"
    finally:
        if connection:
            connection.close()
def get_session_cursors(conn_info, sid, inst_id=1):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        
        # Query for open cursors ordered by last use (approximate)
        query = """
            SELECT inst_id, sid, sql_id, cursor_type, address, hash_value, sql_text
            FROM gv$open_cursor
            WHERE sid = :sid AND inst_id = :inst_id
            ORDER BY last_sql_active_time DESC NULLS LAST
        """
        cursor.execute(query, {"sid": sid, "inst_id": inst_id})
        columns = [col[0].lower() for col in cursor.description]
        return [{k: safe_value(v) for k, v in zip(columns, row)} for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching session cursors: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_cursor_plan(conn_info, sql_id, inst_id=1):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        
        from .sql_central_mod import get_sql_content
        version = conn_info.get('version')
        sql_plan = get_sql_content("oracle/blocker_details_plan.sql", version)
        
        cursor.execute(sql_plan, {"sql_id": sql_id, "inst_id": inst_id})
        cols_plan = [col[0].lower() for col in cursor.description]
        return [{k: safe_value(v) for k, v in zip(cols_plan, r)} for r in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching cursor plan: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_zombie_count(conn_info, inst_id=None):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        
        query = """
            SELECT count(*) 
            FROM gv$process p
            WHERE NOT EXISTS (
                SELECT 1 
                FROM gv$session s 
                WHERE s.paddr = p.addr
                AND s.inst_id = p.inst_id
            )
            AND p.pname IS NULL
            AND p.program IS NOT NULL
            AND p.spid IS NOT NULL
        """
        params = {}
        if inst_id:
            query += " AND p.inst_id = :inst_id"
            params["inst_id"] = inst_id
            
        cursor.execute(query, params)
        row = cursor.fetchone()
        return row[0] if row else 0
    except Exception as e:
        print(f"Error fetching zombie count: {e}")
        return 0
    finally:
        if connection:
            connection.close()
