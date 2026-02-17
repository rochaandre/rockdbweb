import oracledb
from .utils import get_oracle_connection

def get_dashboard_metrics(conn_info):
    from .sql_central_mod import get_sql_content
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()

        # Load version-aware SQL
        version = conn_info.get('version')
        sql_text = get_sql_content("oracle/dashboard_metrics.sql", version)
        
        # Split by semicolon and execute
        statements = [s.strip() for s in sql_text.split(';') if s.strip()]
        
        results = []
        for stmt in statements:
            cursor.execute(stmt)
            if cursor.description:
                results.append(cursor.fetchall())
            else:
                results.append(None)

        # 0: Total Sessions, 1: Active Sessions, 2: SGA, 3: Objects, 4: Invalid Objects Count, 5: Cursors, 6: Triggers
        total_sessions = results[0][0][0] if results[0] else 0
        active_sessions = results[1][0][0] if results[1] else 0
        
        # Normalize SGA Info keys (v$sgainfo)
        sga_info = {}
        if results[2]:
            for row in results[2]:
                sga_info[row[0]] = row[1]
                # Fallback for different capitalizations
                if row[0].lower() == 'total sga size':
                    sga_info['Total SGA Size'] = row[1]
        
        objects = {row[0]: row[1] for row in results[3]} if results[3] else {}
        invalid_objects_count = results[4][0][0] if len(results) > 4 and results[4] else 0
        
        open_cursors_val = 0
        if len(results) > 5 and results[5]:
            open_cursors_val = results[5][0][0]

        triggers = {row[0]: row[1] for row in results[6]} if len(results) > 6 and results[6] else {}
        long_ops_count = results[7][0][0] if len(results) > 7 and results[7] else 0
        sysaux_count = results[8][0][0] if len(results) > 8 and results[8] else 0
        is_rac = results[9][0][0] == 'TRUE' if len(results) > 9 and results[9] else False
        instance_count = results[10][0][0] if len(results) > 10 and results[10] else 1
        
        db_name = results[11][0][0] if len(results) > 11 and results[11] else "Unknown"
        is_cdb = results[11][0][1] == 1 if len(results) > 11 and results[11] else False
        con_name = results[12][0][0] if len(results) > 12 and results[12] else None
        
        arch_type = "STANDALONE"
        if is_rac:
            arch_type = "RAC" if instance_count > 1 else "RAC ONE NODE"
            
        if is_cdb:
            if con_name and con_name != 'CDB$ROOT':
                db_arch = f"PDB: {con_name} ({arch_type})"
            else:
                db_arch = f"CDB Root: {db_name} ({arch_type})"
        else:
            db_arch = f"NON-CDB: {db_name} ({arch_type})"

        top_segments = []
        if len(results) > 13 and results[13]:
            for row in results[13]:
                top_segments.append({
                    'owner': row[0],
                    'object_name': row[1],
                    'object_type': row[2],
                    'blocks': row[3]
                })

        return {
            "sessions": {
                "total": total_sessions,
                "active": active_sessions
            },
            "sga": sga_info,
            "health": {
                "objects": objects,
                "invalid_objects_count": invalid_objects_count,
                "cursors": open_cursors_val,
                "triggers": triggers,
                "long_ops": long_ops_count,
                "sysaux_count": sysaux_count,
                "db_arch": db_arch
            },
            "top_queries": get_top_queries(conn_info),
            "wait_events": get_top_wait_events(conn_info),
            "active_schemas": get_active_schemas(conn_info)
        }
    except Exception as e:
        print(f"Error fetching dashboard metrics: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_top_queries(conn_info, owner_filter="%"):
    from .sql_central_mod import get_sql_content
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        version = conn_info.get('version')
        sql_text = get_sql_content("oracle/top_queries.sql", version)
        
        # Simple LIKE filter
        cursor.execute(sql_text, owner_filter=owner_filter)
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching top queries: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_top_wait_events(conn_info, owner_filter="%", event_filter="%"):
    from .sql_central_mod import get_sql_content
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        version = conn_info.get('version')
        sql_text = get_sql_content("oracle/wait_events.sql", version)
        
        cursor.execute(sql_text, owner_filter=owner_filter, event_filter=event_filter)
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching wait events: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_long_operations(conn_info):
    from .sessions_mod import get_long_ops
    return get_long_ops(conn_info)

def get_invalid_triggers(conn_info, owner_filter="%"):
    from .sql_central_mod import get_sql_content
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        version = conn_info.get('version')
        sql_text = get_sql_content("oracle/invalid_triggers.sql", version)
        
        cursor.execute(sql_text, owner_filter=owner_filter)
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching invalid triggers: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_valid_objects(conn_info, owner_filter="%"):
    from .sql_central_mod import get_sql_content
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        version = conn_info.get('version')
        sql_text = get_sql_content("oracle/valid_objects.sql", version)
        
        cursor.execute(sql_text, owner_filter=owner_filter)
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching valid objects: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_open_cursors(conn_info, owner_filter="%"):
    from .sql_central_mod import get_sql_content
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        version = conn_info.get('version')
        sql_text = get_sql_content("oracle/open_cursors.sql", version)
        
        cursor.execute(sql_text, owner_filter=owner_filter)
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching open cursors: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_dashboard_sysaux_occupants(conn_info):
    from .sql_central_mod import get_sql_content
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        version = conn_info.get('version')
        sql_text = get_sql_content("oracle/sysaux_occupants.sql", version)
        
        cursor.execute(sql_text)
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching sysaux occupants: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_active_schemas(conn_info):
    from .sql_central_mod import get_sql_content
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        version = conn_info.get('version')
        sql_text = get_sql_content("oracle/active_schemas.sql", version)
        
        cursor.execute(sql_text)
        return [row[0] for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching active schemas: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_tablespace_summary(conn_info):
    from .sql_central_mod import get_sql_content
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        
        # Load version-aware SQL
        version = conn_info.get('version')
        sql_text = get_sql_content("oracle/tablespace_summary.sql", version)
        
        cursor.execute(sql_text)
        columns = [col[0].lower() for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching tablespace summary: {e}")
        raise e
    finally:
        if connection:
            connection.close()
