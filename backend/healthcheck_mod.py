from .utils import get_oracle_connection

def run_healthcheck(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        
        findings = []
        
        # 1. PARAMETERS CHECK
        params_to_check = {
            'undo_retention': {'suggested': 3600, 'type': 'BOTH', 'desc': 'Retention too low for consistent reads.'},
            'open_cursors': {'suggested': 2600, 'type': 'BOTH', 'desc': 'Session might reach cursor limit.'},
            'audit_sys_operations': {'suggested': 'FALSE', 'type': 'SPFILE', 'desc': 'SYS Audit can be verbose.'},
            'parallel_max_servers': {'suggested': 16, 'type': 'BOTH', 'desc': 'Suggested for multi-core performance.'},
            'cursor_sharing': {'suggested': 'EXACT', 'type': 'BOTH', 'desc': 'Standard cursor sharing.'}
        }
        
        cursor.execute("SELECT name, value, isdefault FROM v$parameter WHERE name IN ({})".format(
            ','.join(["'{}'".format(k) for k in params_to_check.keys()])
        ))
        
        current_params = {row[0]: {'value': row[1], 'isdefault': row[2]} for row in cursor.fetchall()}
        
        for name, spec in params_to_check.items():
            curr = current_params.get(name)
            if not curr: continue
            
            val = curr['value']
            suggested = str(spec['suggested'])
            
            # Simplified logic: if current < suggested (numeric) or current != suggested (string)
            is_different = False
            try:
                if int(val) < int(suggested): is_different = True
            except:
                if val.upper() != suggested.upper(): is_different = True
                
            if is_different:
                findings.append({
                    'category': 'Parameters',
                    'item': name,
                    'status': 'Warning' if curr['isdefault'] == 'TRUE' else 'Recommended',
                    'current': val,
                    'suggested': suggested,
                    'description': spec['desc'],
                    'fix_sql': f"ALTER SYSTEM SET {name}={suggested} SCOPE={spec['type'].lower()};",
                    'restart_required': spec['type'] == 'SPFILE'
                })

        # 2. SECURITY / PROFILES CHECK
        cursor.execute("SELECT profile, resource_name, limit FROM dba_profiles WHERE resource_name IN ('FAILED_LOGIN_ATTEMPTS', 'PASSWORD_LIFE_TIME')")
        profile_limits = {}
        for row in cursor.fetchall():
            p, r, l = row
            if p not in profile_limits: profile_limits[p] = {}
            profile_limits[p][r] = l
            
        for prof, limits in profile_limits.items():
            fla = limits.get('FAILED_LOGIN_ATTEMPTS', '10')
            plt = limits.get('PASSWORD_LIFE_TIME', '180')
            
            if fla != 'UNLIMITED' or plt != 'UNLIMITED':
                findings.append({
                    'category': 'Security',
                    'item': f"Profile {prof}",
                    'status': 'Recommended',
                    'current': f"Login Attempts: {fla}, Life: {plt}d",
                    'suggested': "UNLIMITED",
                    'description': "Restrictive security policies can cause unexpected lockouts.",
                    'fix_sql': f"ALTER PROFILE {prof} LIMIT FAILED_LOGIN_ATTEMPTS UNLIMITED PASSWORD_LIFE_TIME UNLIMITED;",
                    'restart_required': False
                })

        # 3. AUDIT CHECK
        cursor.execute("SELECT value FROM v$parameter WHERE name = 'audit_trail'")
        audit_trail = cursor.fetchone()[0]
        if audit_trail.upper() != 'NONE':
             findings.append({
                'category': 'Audit',
                'item': 'Audit Trail',
                'status': 'Notice',
                'current': audit_trail,
                'suggested': 'NONE',
                'description': 'Auditing is active. Ensure you purge AUD$ regularly or disable if not required.',
                'fix_sql': "ALTER SYSTEM SET audit_trail=NONE SCOPE=SPFILE;",
                'restart_required': True
            })

        return findings
        
    except Exception as e:
        print(f"Error in healthcheck: {e}")
        raise e
    finally:
        if connection:
            connection.close()

def get_advisor_data(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        
        # 1. Flashback Info
        cursor.execute("SELECT dbid, name, log_mode, flashback_on FROM v$database")
        db_cols = [c[0].lower() for c in cursor.description]
        db_info = dict(zip(db_cols, cursor.fetchone()))
        
        # 2. Flashback Log
        cursor.execute("""
            SELECT 
                oldest_flashback_scn, 
                TO_CHAR(oldest_flashback_time, 'YYYY-MM-DD HH24:MI:SS') as oldest_flashback_time, 
                retention_target, 
                flashback_size, 
                estimated_flashback_size 
            FROM v$flashback_database_log
        """)
        fb_cols = [c[0].lower() for c in cursor.description]
        fb_row = cursor.fetchone()
        fb_log = dict(zip(fb_cols, fb_row)) if fb_row else {}
        
        # 3. Recovery Summary
        cursor.execute("""
            SELECT 
                name, 
                space_limit/1024/1024 as space_limit, 
                space_used/1024/1024 as space_used, 
                ROUND((space_used / space_limit)*100, 2) as space_used_pct, 
                space_reclaimable/1024/1024 as space_reclaimable, 
                ROUND((space_reclaimable / space_limit)*100, 2) as pct_reclaimable, 
                number_of_files 
            FROM v$recovery_file_dest 
            ORDER BY name
        """)
        rec_cols = [c[0].lower() for c in cursor.description]
        rec_summary = [dict(zip(rec_cols, r)) for r in cursor.fetchall()]
        
        # 4. Recovery Files Union
        cursor.execute("""
            SELECT name, (blocks*block_size) as bytes, 'DATAFILE COPY' as type FROM v$datafile_copy WHERE is_recovery_dest_file = 'YES'
            UNION ALL
            SELECT name, null, 'CONTROLFILE' as type FROM v$controlfile WHERE is_recovery_dest_file = 'YES'
            UNION ALL
            SELECT member, null, 'LOGFILE' as type FROM v$logfile WHERE is_recovery_dest_file = 'YES'
            UNION ALL
            SELECT handle, bytes, 'BACKUP PIECE' as type FROM v$backup_piece WHERE is_recovery_dest_file = 'YES'
            UNION ALL
            SELECT name, (blocks*block_size), 'ARCHIVED LOG' as type FROM v$archived_log WHERE is_recovery_dest_file = 'YES'
        """)
        file_cols = [c[0].lower() for c in cursor.description]
        rec_files = [dict(zip(file_cols, r)) for r in cursor.fetchall()]
        
        return {
            "db_info": db_info,
            "flashback_log": fb_log,
            "recovery_summary": rec_summary,
            "recovery_files": rec_files
        }
    except Exception as e:
        print(f"Error in advisor data: {e}")
        raise e
    finally:
        if connection:
            connection.close()
