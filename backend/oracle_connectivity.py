"""
# ==============================================================================
# ROCKDB - Oracle Database Administration & Monitoring Tool
# ==============================================================================
# File: oracle_connectivity.py
# Author: Andre Rocha (TechMax Consultoria)
# 
# LICENSE: Creative Commons Attribution-NoDerivatives 4.0 International (CC BY-ND 4.0)
#
# TERMS:
# 1. You are free to USE and REDISTRIBUTE this software in any medium or format.
# 2. YOU MAY NOT MODIFY, transform, or build upon this code.
# 3. You must maintain this header and original naming/ownership information.
#
# This software is provided "AS IS", without warranty of any kind.
# Copyright (c) 2026 Andre Rocha. All rights reserved.
# ==============================================================================
"""
from .utils import get_oracle_connection
import traceback
import sys

def discover_database_info(conn_info):
    connection = None
    try:
        connection = get_oracle_connection(conn_info)
        cursor = connection.cursor()
        
        # 1. Basic Info & CDB status (CDB column only exists in 12c+)
        try:
            cursor.execute("SELECT NAME, CDB, DATABASE_ROLE, LOG_MODE FROM v$database")
            db_row = cursor.fetchone()
            is_cdb = db_row[1]
        except:
            cursor.execute("SELECT NAME, 'NO' as CDB, DATABASE_ROLE, LOG_MODE FROM v$database")
            db_row = cursor.fetchone()
            is_cdb = 'NO'
        
        # 2. Instance Info & RAC status
        cursor.execute("SELECT VERSION, INSTANCE_NAME, HOST_NAME, PARALLEL FROM v$instance")
        inst_row = cursor.fetchone()
        
        # 3. Patch Info (Simplified for now, usually requires more complex queries)
        # We can try to get the latest patch from dba_registry_history if available
        patch_info = "N/A"
        try:
            cursor.execute("SELECT action_time, version, comments FROM dba_registry_history ORDER BY action_time DESC")
            patch_row = cursor.fetchone()
            if patch_row:
                patch_info = f"{patch_row[1]} ({patch_row[2]})"
        except:
            pass

        # 4. Standby Apply Status
        apply_status = "N/A"
        if db_row[2] == 'PHYSICAL STANDBY':
            try:
                cursor.execute("SELECT recovery_mode FROM v$archive_dest_status WHERE recovery_mode != 'IDLE'")
                apply_row = cursor.fetchone()
                if apply_row:
                    apply_status = apply_row[0]
            except:
                pass

        info = {
            "name": db_row[0],
            "db_type": "CDB" if db_row[1] == 'YES' else "NON-CDB",
            "role": db_row[2],
            "log_mode": db_row[3],
            "version": inst_row[0],
            "inst_name": inst_row[1],
            "os": inst_row[2],
            "is_rac": inst_row[3] == 'YES',
            "patch": patch_info,
            "apply_status": apply_status
        }
        
        # If it's a CDB, check for PDB name (Container concepts are 12c+)
        if info["db_type"] == "CDB":
            try:
                cursor.execute("SELECT SYS_CONTEXT('USERENV', 'CON_NAME') FROM dual")
                con_name = cursor.fetchone()
                if con_name and con_name[0] != 'CDB$ROOT':
                    info["db_type"] = "PDB"
                    info["pdb_name"] = con_name[0]
            except:
                pass

        return info
        
    except Exception as e:
        print(f"!!! Discovery failed even though connection was established: {str(e)}", flush=True)
        print("Full Discovery Traceback:", flush=True)
        traceback.print_exc(file=sys.stdout)
        raise e
    finally:
        if connection:
            connection.close()
