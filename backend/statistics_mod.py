import oracledb
from .utils import get_oracle_connection, safe_value, ORACLE_SYSTEM_SCHEMAS, get_excluded_schemas

def has_column(cursor, table_name, column_name):
    try:
        cursor.execute("SELECT 1 FROM dba_tab_columns WHERE table_name = :t AND column_name = :c", t=table_name, c=column_name)
        return cursor.fetchone() is not None
    except:
        return False

def get_stale_stats(conn_info, owner=None, table_name=None, exclude_system=False):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        
        # Flush monitoring info to ensure staleness flags are up-to-date
        cursor.execute("BEGIN DBMS_STATS.FLUSH_DATABASE_MONITORING_INFO; END;")
        
        type_col = "TYPE" if has_column(cursor, 'DBA_TAB_STATISTICS', 'TYPE') else "'TABLE'"
        
        sql = f"""
            SELECT 
                OWNER,
                TABLE_NAME,
                PARTITION_NAME,
                SUBPARTITION_NAME,
                NUM_ROWS,
                LAST_ANALYZED,
                STALE_STATS,
                {type_col} as TYPE
            FROM DBA_TAB_STATISTICS 
            WHERE STALE_STATS = 'YES'
        """
        params = {}
        # If an explicit owner is provided, we ignore the exclude_system flag
        if exclude_system and not owner:
            excluded = get_excluded_schemas(connection)
            sql += f" AND OWNER NOT IN ({','.join([':sys' + str(i) for i in range(len(excluded))])})"
            for i, s in enumerate(excluded):
                params['sys' + str(i)] = s
        
        if owner:
            sql += " AND OWNER = :owner"
            params['owner'] = owner.upper()
        if table_name:
            sql += " AND TABLE_NAME LIKE :tab"
            params['tab'] = f"%{table_name.upper()}%"
            
        sql += " ORDER BY LAST_ANALYZED ASC NULLS FIRST"
        
        cursor.execute(sql, **params)
        columns = [col[0].lower() for col in cursor.description]
        return [{k: safe_value(v) for k, v in zip(columns, row)} for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching stale statistics: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_dml_changes(conn_info, owner=None, table_name=None, exclude_system=False):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        
        # Flush DML monitoring info to disk for accurate results
        cursor.execute("BEGIN DBMS_STATS.FLUSH_DATABASE_MONITORING_INFO; END;")
        
        total_mods_col = "TOTAL_MODIFICATIONS" if has_column(cursor, 'DBA_TAB_MODIFICATIONS', 'TOTAL_MODIFICATIONS') else "(INSERTS + UPDATES + DELETES)"
        
        sql = f"""
            SELECT 
                TABLE_OWNER as owner,
                TABLE_NAME as table_name,
                PARTITION_NAME as partition_name,
                INSERTS,
                UPDATES,
                DELETES,
                TIMESTAMP as last_flush,
                {total_mods_col} as total_modifications,
                TRUNCATED,
                DROP_SEGMENTS
            FROM DBA_TAB_MODIFICATIONS
            WHERE 1=1
        """
        params = {}
        # If an explicit owner is provided, we ignore the exclude_system flag
        if exclude_system and not owner:
            excluded = get_excluded_schemas(connection)
            sql += f" AND TABLE_OWNER NOT IN ({','.join([':ex' + str(i) for i in range(len(excluded))])})"
            for i, s in enumerate(excluded):
                params['ex' + str(i)] = s
        
        if owner:
            sql += " AND TABLE_OWNER = :owner"
            params['owner'] = owner.upper()
        if table_name:
            sql += " AND TABLE_NAME LIKE :tab"
            params['tab'] = f"%{table_name.upper()}%"
            
        sql += " ORDER BY INSERTS + UPDATES + DELETES DESC"
        
        cursor.execute(sql, **params)
        columns = [col[0].lower() for col in cursor.description]
        return [{k: safe_value(v) for k, v in zip(columns, row)} for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching DML changes: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def gather_stats(conn_info, level='TABLE', owner=None, table_name=None, 
                 estimate_percent=None, method_opt=None, degree=None, 
                 granularity=None, cascade=None, no_invalidate=None):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        
        # Determine the procedure based on level
        level = level.upper()
        if level == 'DATABASE':
            proc = "GATHER_DATABASE_STATS"
            args = []
        elif level == 'SCHEMA':
            proc = "GATHER_SCHEMA_STATS"
            args = ["ownname => :owner"]
        elif level == 'DICTIONARY':
            proc = "GATHER_DICTIONARY_STATS"
            args = []
        else: # TABLE
            proc = "GATHER_TABLE_STATS"
            args = ["ownname => :owner", "tabname => :table_name"]

        # Add common parameters
        if estimate_percent is not None:
            # Handle AUTO_SAMPLE_SIZE string from frontend
            if estimate_percent == 'AUTO_SAMPLE_SIZE':
                args.append("estimate_percent => DBMS_STATS.AUTO_SAMPLE_SIZE")
            else:
                args.append("estimate_percent => :est_pct")
        
        if method_opt:
            args.append("method_opt => :method_opt")
            
        if degree is not None:
            if degree == 'AUTO_DEGREE':
                args.append("degree => DBMS_STATS.AUTO_DEGREE")
            else:
                args.append("degree => :degree")
                
        if granularity:
            args.append("granularity => :granularity")
            
        if cascade is not None:
            if isinstance(cascade, bool):
                args.append(f"cascade => {'TRUE' if cascade else 'FALSE'}")
            elif cascade == 'AUTO_CASCADE':
                 args.append("cascade => DBMS_STATS.AUTO_CASCADE")
                 
        if no_invalidate is not None:
            if isinstance(no_invalidate, bool):
                args.append(f"no_invalidate => {'TRUE' if no_invalidate else 'FALSE'}")
            elif no_invalidate == 'AUTO_INVALIDATE':
                args.append("no_invalidate => DBMS_STATS.AUTO_INVALIDATE")

        sql = f"BEGIN DBMS_STATS.{proc}({', '.join(args)}); END;"
        
        # Build bind variables
        params = {}
        if owner and level != 'DICTIONARY': params['owner'] = owner.upper()
        if table_name and level != 'DICTIONARY': params['table_name'] = table_name.upper()
        if estimate_percent and estimate_percent != 'AUTO_SAMPLE_SIZE':
             params['est_pct'] = float(estimate_percent)
        if method_opt: params['method_opt'] = method_opt
        if degree and degree != 'AUTO_DEGREE':
            params['degree'] = int(degree)
        if granularity: params['granularity'] = granularity

        cursor.execute(sql, **params)
        connection.commit()
        
        target = f"{owner}.{table_name}" if table_name else (owner if owner else "DATABASE")
        return {"status": "success", "message": f"Statistics gathered for {target} ({level})"}
    except Exception as e:
        print(f"Error gathering stats: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def lock_stats(conn_info, owner, table_name, action='LOCK'):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        procedure = "LOCK_TABLE_STATS" if action.upper() == 'LOCK' else "UNLOCK_TABLE_STATS"
        cursor.execute(f"BEGIN DBMS_STATS.{procedure}(:owner, :table_name); END;", 
                       owner=owner.upper(), table_name=table_name.upper())
        connection.commit()
        return {"status": "success", "message": f"Statistics {action.lower()}ed for {owner}.{table_name}"}
    except Exception as e:
        print(f"Error {action.lower()}ing stats for {owner}.{table_name}: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_user_schemas(conn_info, exclude_system=True):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        
        sql = "SELECT USERNAME FROM DBA_USERS"
        params = {}
        
        if exclude_system:
            excluded = get_excluded_schemas(connection)
            sql += f" WHERE USERNAME NOT IN ({','.join([':s' + str(i) for i in range(len(excluded))])})"
            params = {f's{i}': s for i, s in enumerate(excluded)}
            
        sql += " ORDER BY USERNAME"
        
        cursor.execute(sql, **params)
        return [row[0] for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching user schemas: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_schema_tables(conn_info, owner):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        sql = """
            SELECT TABLE_NAME 
            FROM DBA_TABLES 
            WHERE OWNER = :owner
            ORDER BY TABLE_NAME
        """
        cursor.execute(sql, owner=owner.upper())
        return [row[0] for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching tables for {owner}: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def flush_monitoring(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        cursor.execute("BEGIN DBMS_STATS.FLUSH_DATABASE_MONITORING_INFO; END;")
        connection.commit()
        return {"status": "success", "message": "Database monitoring information flushed successfully"}
    except Exception as e:
        print(f"Error flushing monitoring info: {e}")
        raise e
    finally:
        if connection:
            connection.close()
