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
        sql_template = get_sql_content("sessions.sql", version, is_internal=True)
        
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
        sql_text = get_sql_content("blocking_sessions.sql", version, is_internal=True)
        
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

def get_long_ops(conn_info, inst_id=None, sid='%'):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        
        from .sql_central_mod import get_sql_content
        version = conn_info.get('version')
        
        # We use the new session_longops.sql which implements Query 1
        sql_text = get_sql_content("session_longops.sql", version, is_internal=True)
        
        # If inst_id is provided, pass it. 0 means all instances in the SQL logic.
        inst_val = 0
        try:
            if inst_id is not None:
                inst_val = int(inst_id)
        except (ValueError, TypeError):
            inst_val = 0

        cursor.execute(sql_text, {"sid": str(sid), "inst_id": inst_val})
        
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
        sql_basic = get_sql_content("blocker_details_basic.sql", version, is_internal=True)
        
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
            sql_plan = get_sql_content("blocker_details_plan.sql", version, is_internal=True)
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
        sql_plan = get_sql_content("blocker_details_plan.sql", version, is_internal=True)
        
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

def simulate_long_op(conn_info):
    """Runs a PL/SQL block to simulate a long operation in the database."""
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        
        plsql = """
        DECLARE
          v_rindex    BINARY_INTEGER := dbms_application_info.set_session_longops_nohint;
          v_slno      BINARY_INTEGER; 
          v_totalwork NUMBER := 100;  
          v_sofar     NUMBER := 0;
          v_obj_name  VARCHAR2(30) := 'MVIEW_REFRESH_SALES';
        BEGIN
          FOR i IN 1..v_totalwork LOOP
            v_sofar := i;
            dbms_session.sleep(0.1); 
            DBMS_APPLICATION_INFO.SET_SESSION_LONGOPS(
              rindex      => v_rindex,
              slno        => v_slno,
              opname      => 'Refresh Materialized View',
              target      => 0,
              context     => 1,
              sofar       => v_sofar,
              totalwork   => v_totalwork,
              target_desc => v_obj_name,
              units       => 'batches'
            );
          END LOOP;
        END;
        """
        # Note: We use a thread-safe connection if possible or just run it. 
        # In a real app, this might be a background job.
        cursor.execute(plsql)
        connection.commit()
        return {"success": True}
    finally:
        if connection:
            connection.close()

def get_long_ops_stats(conn_info):
    """Gathers statistics for long-running operations based on requested queries."""
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        
        stats = {}
        
        # 1. Total Active (Simplified Basic Query)
        cursor.execute("SELECT count(*) FROM gv$session_longops WHERE sofar != totalwork")
        stats['active_total'] = cursor.fetchone()[0]
        
        # 2. Detailed Tracking (Detailed Query)
        cursor.execute("""
            SELECT count(*)
            FROM gv$session_longops lo, gv$session s
            WHERE lo.sid = s.sid AND lo.serial# = s.serial# 
            AND lo.inst_id = s.inst_id
            AND lo.sofar != lo.totalwork
        """)
        stats['active_detailed'] = cursor.fetchone()[0]
        
        # 3. Time Remaining (Remaining Query)
        cursor.execute("SELECT count(*) FROM gv$session_longops WHERE time_remaining > 0")
        stats['with_time_remaining'] = cursor.fetchone()[0]
        
        # 4. DataPump Jobs
        try:
            cursor.execute("""
                SELECT count(*) FROM gv$session_longops sl, gv$datapump_job dp
                WHERE sl.opname = dp.job_name AND sl.sofar != sl.totalwork
                AND sl.inst_id = dp.inst_id
            """)
            stats['datapump_jobs'] = cursor.fetchone()[0]
        except:
            stats['datapump_jobs'] = 0
            
        # Ensure all expected keys exist even on partial failures
        for key in ['active_total', 'active_detailed', 'datapump_jobs', 'with_time_remaining']:
            if key not in stats:
                stats[key] = 0
                
        return stats
    finally:
        if connection:
            connection.close()
def get_sql_statistics(conn_info, sql_id, inst_id=1):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        
        from .sql_central_mod import get_sql_content
        version = conn_info.get('version')
        
        # 1. Main Statistics
        version_suffix = "v12c"
        try:
            if version:
                v_num = float('.'.join(version.split('.')[:2]))
                if v_num < 12.1:
                    version_suffix = "v11g"
        except:
            pass

        stats_data = {}
        try:
            rel_stats_path = f"oracle_internal/sqlstatistics/sql_statistics_{version_suffix}.sql"
            sql_stats_template = get_sql_content(rel_stats_path, version, is_internal=True)
            print(f"DEBUG: Processing stats from {rel_stats_path}")
            cursor.execute(sql_stats_template, {"sql_id": sql_id, "inst_id": inst_id})
            row = cursor.fetchone()
            if not row:
                print(f"Warning: No stats for sql_id={sql_id}. Trying fallback.")
                fallback_sql = sql_stats_template.replace("rownum = 1", "rownum = 1") 
                cursor.execute(fallback_sql, {"sql_id": sql_id, "inst_id": inst_id})
                row = cursor.fetchone()
            if row:
                columns = [col[0].lower() for col in cursor.description]
                stats_data = {k: safe_value(v) for k, v in zip(columns, row)}
        except Exception as e:
            print(f"Error fetching main stats: {e}")
            stats_data = {"error": str(e)}

        # 2. Bind Capture
        bind_capture = []
        try:
            rel_bind_path = "oracle_internal/sqlstatistics/sql_bind_capture.sql"
            sql_bind_template = get_sql_content(rel_bind_path, version, is_internal=True)
            print(f"DEBUG: Executing Bind Capture SQL:\n{sql_bind_template}")
            cursor.execute(sql_bind_template, {"sql_id": sql_id, "inst_id": inst_id})
            if cursor.description:
                cols = [c[0].lower() for c in cursor.description]
                bind_capture = [dict(zip(cols, r)) for r in cursor.fetchall()]
        except Exception as e:
            print(f"Error fetching bind capture: {e}")

        # 3. Bind Data
        bind_data = []
        try:
            rel_bind_data_path = "oracle_internal/sqlstatistics/sql_bind_data.sql"
            sql_bind_data_template = get_sql_content(rel_bind_data_path, version, is_internal=True)
            print(f"DEBUG: Executing Bind Data SQL:\n{sql_bind_data_template}")
            cursor.execute(sql_bind_data_template, {"sql_id": sql_id, "inst_id": inst_id})
            if cursor.description:
                cols = [c[0].lower() for c in cursor.description]
                bind_data = [dict(zip(cols, r)) for r in cursor.fetchall()]
        except Exception as e:
            print(f"Error fetching bind data: {e}")

        # 4. Filtered Plan for this SQL
        plan_rows = []
        try:
            sql_plan_template = get_sql_content("oracle_internal/sqlstatistics/sql_plan.sql", version, is_internal=True)
            cursor.execute(sql_plan_template, {"sql_id": sql_id, "inst_id": inst_id})
            if cursor.description:
                cols = [c[0].lower() for c in cursor.description]
                plan_rows = [dict(zip(cols, r)) for r in cursor.fetchall()]
        except Exception as e:
            print(f"Error fetching plan: {e}")

        # 5. SQL Text
        sql_text = "SQL text not found"
        try:
            cursor.execute("SELECT sql_fulltext FROM gv$sqlstats WHERE sql_id = :sql_id AND inst_id = :inst_id AND rownum = 1", 
                           {"sql_id": sql_id, "inst_id": inst_id})
            sql_text_row = cursor.fetchone()
            if sql_text_row:
                sql_text = safe_value(sql_text_row[0])
        except Exception as e:
            print(f"Error fetching SQL text: {e}")

        # 6. Plan History
        plan_history = []
        try:
            sql_plan_hist_template = get_sql_content("oracle_internal/sqlstatistics/sql_plan_history.sql", version, is_internal=True)
            cursor.execute(sql_plan_hist_template, {"sql_id": sql_id})
            if cursor.description:
                cols = [c[0].lower() for c in cursor.description]
                plan_history = [dict(zip(cols, r)) for r in cursor.fetchall()]
        except Exception as e:
            print(f"Error fetching plan history: {e}")

        # 7. XPlan
        xplan = []
        try:
            sql_xplan_template = get_sql_content("oracle_internal/sqlstatistics/sql_xplan.sql", version, is_internal=True)
            cursor.execute(sql_xplan_template, {"sql_id": sql_id})
            if cursor.description:
                xplan = [r[0] for r in cursor.fetchall() if r[0]]
        except Exception as e:
            print(f"Error fetching xplan: {e}")

        # 8. Optimizer Env
        optimizer_env = []
        try:
            sql_optim_env_template = get_sql_content("oracle_internal/sqlstatistics/sql_optimizer_env.sql", version, is_internal=True)
            cursor.execute(sql_optim_env_template, {"sql_id": sql_id, "inst_id": inst_id})
            if cursor.description:
                cols = [c[0].lower() for c in cursor.description]
                optimizer_env = [dict(zip(cols, r)) for r in cursor.fetchall()]
        except Exception as e:
            print(f"Error fetching optimizer env: {e}")

        return {
            "statistics": stats_data,
            "bind_capture": bind_capture,
            "bind_data": bind_data,
            "sql_text": sql_text,
            "plan": plan_rows,
            "plan_history": plan_history,
            "xplan": xplan,
            "optimizer_env": optimizer_env
        }
    except Exception as e:
        print(f"Error fetching SQL statistics: {e}")
        raise e
    finally:
        if connection:
            connection.close()
def get_detailed_locks(conn_info, sid=None, inst_id=None):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        
        from .sql_central_mod import get_sql_content
        version = conn_info.get('version')
        variables = {"sid": sid} if sid else None
        
        results = {}
        
        def clean_sql(sql):
            lines = []
            for line in sql.splitlines():
                l = line.strip().upper()
                if l.startswith("SET ") or l.startswith("COLUMN ") or l.startswith("SET\t") or l.startswith("COLUMN\t"):
                    continue
                lines.append(line)
            content = "\n".join(lines).strip()
            # Remove trailing / or . or ; that SQL*Plus uses
            while content and content[-1] in (';', '/', '.'):
                content = content[:-1].strip()
            return content

        # 1. Blocking Locks (Blocking User vs Holding User)
        try:
            sql_blocking = get_sql_content("locks_blocking_j.sql", version, variables, is_internal=True)
            sql_blocking = clean_sql(sql_blocking)
            cursor.execute(sql_blocking)
            cols = [col[0].lower() for col in cursor.description]
            results['blocking_j'] = [{k: safe_value(v) for k, v in zip(cols, row)} for row in cursor.fetchall()]
        except Exception as e:
            print(f"Error in locks_blocking_j: {e}")
            results['blocking_j'] = []
            
        # 2. DML/DDL Locks
        try:
            sql_dml_ddl = get_sql_content("locks_dml_ddl_10g.sql", version, variables, is_internal=True)
            sql_dml_ddl = clean_sql(sql_dml_ddl)
            cursor.execute(sql_dml_ddl)
            cols = [col[0].lower() for col in cursor.description]
            results['dml_ddl'] = [{k: safe_value(v) for k, v in zip(cols, row)} for row in cursor.fetchall()]
        except Exception as e:
            print(f"Error in locks_dml_ddl: {e}")
            results['dml_ddl'] = []
            
        # 3. Lock Time (DML Lock Time)
        try:
            sql_lock_time = get_sql_content("locks_dml_lock_time.sql", version, variables, is_internal=True)
            sql_lock_time = clean_sql(sql_lock_time)
            cursor.execute(sql_lock_time)
            cols = [col[0].lower() for col in cursor.description]
            results['lock_time'] = [{k: safe_value(v) for k, v in zip(cols, row)} for row in cursor.fetchall()]
        except Exception as e:
            print(f"Error in locks_dml_lock_time: {e}")
            results['lock_time'] = []
            
        return results
    except Exception as e:
        print(f"Error fetching detailed locks: {e}")
        raise e
    finally:
        if connection:
            connection.close()
