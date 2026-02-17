from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
import os
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

from .utils import init_db, get_db_connection
from .db_connections import (
    get_all_connections, get_active_connection, save_connection, 
    update_connection, delete_connection, activate_connection
)
from .servers_mod import (
    get_all_servers, save_server, update_server, delete_server
)
from .oracle_connectivity import discover_database_info
from .dashboard_mod import (
    get_dashboard_metrics, get_tablespace_summary, get_top_queries, 
    get_top_wait_events, get_long_operations, get_invalid_triggers,
    get_valid_objects, get_open_cursors, get_active_schemas,
    get_dashboard_sysaux_occupants
)
from .sessions_mod import (
    get_sessions, kill_session, get_session_sql, get_blocking_sessions, 
    get_long_ops, get_blocker_details, get_object_ddl
)
from .storage_mod import (
    get_tablespaces_detailed, get_data_files, get_segments, 
    get_control_files, get_sysaux_occupants, get_undo_stats, get_temp_usage,
    resize_datafile, add_datafile, get_checkpoint_progress, force_checkpoint,
    get_stats_history_retention, set_stats_history_retention
)
from .storage_charts_mod import get_storage_charts_data
from .redo_logs_mod import (
    get_redo_groups, get_redo_switch_history, get_redo_threads,
    add_redo_group, drop_redo_group, add_redo_member, drop_redo_member,
    switch_logfile, get_standby_redo_groups, get_archived_logs, get_log_buffer_stats,
    get_redo_management_info, get_redo_members
)
from .logs_mod import get_alert_logs, get_db_parameters, get_outstanding_alerts
from .healthcheck_mod import run_healthcheck
from .timemachine_mod import store_snapshot, get_history_range, get_snapshot_at_time
import asyncio
from .backups_mod import get_backup_jobs, get_backup_summary, get_backup_sets, get_backup_datafiles, get_nls_parameters
from .sql_central_mod import (
    get_sql_registry, get_sql_content, execute_generic_sql, 
    seed_sql_scripts, delete_sql_script, execute_external_tool,
    search_sql_content
)
from .jobs_mod import (
    get_legacy_jobs, get_running_jobs, run_legacy_job, 
    set_legacy_job_broken, remove_legacy_job, submit_legacy_job
)
from .tools_mod import start_tool_execution, get_tool_execution_status, list_executions

init_db()
seed_sql_scripts()

# --- Time Machine Background Task ---
async def timemachine_worker():
    """Background loop to collect performance snapshots every 10 seconds."""
    print("Time Machine worker starting...")
    while True:
        try:
            active_conn = get_active_connection()
            if active_conn:
                # 1. Fetch data from Oracle
                # Using existing modules but wrapping in try/except for resilience
                try:
                    sessions = get_sessions(active_conn)
                    long_ops = get_long_ops(active_conn)
                    blocking = get_blocking_sessions(active_conn)
                    
                    # 2. Store in InfluxDB
                    store_snapshot(sessions, long_ops, blocking)
                    # print(f"Time Machine: Captured snapshot for {active_conn['name']}")
                except Exception as db_err:
                    print(f"Time Machine Worker DB Error: {db_err}")
            
            # Wait 10 seconds
            await asyncio.sleep(10)
        except asyncio.CancelledError:
            print("Time Machine worker stopping...")
            break
        except Exception as e:
            print(f"Time Machine Worker Error: {e}")
            await asyncio.sleep(10)

app = FastAPI(title="RockDB Python Backend")

@app.on_event("startup")
async def startup_event():
    # Start the worker task
    asyncio.create_task(timemachine_worker())

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ConnectionBase(BaseModel):
    id: Optional[int] = None
    name: str
    host: str
    port: str
    service: str
    username: str
    password: str
    type: str
    connection_mode: Optional[str] = 'BASIC'
    connection_role: Optional[str] = 'NORMAL'
    connect_string: Optional[str] = None
    wallet_path: Optional[str] = None
    tns_admin: Optional[str] = None

class ConnectionResponse(ConnectionBase):
    id: int
    is_active: bool
    last_connected: Optional[str] = None
    version: Optional[str] = None
    patch: Optional[str] = None
    os: Optional[str] = None
    db_type: Optional[str] = None
    role: Optional[str] = None
    apply_status: Optional[str] = None
    log_mode: Optional[str] = None
    is_rac: Optional[bool] = None
    inst_name: Optional[str] = None

class ServerBase(BaseModel):
    name: str
    ip: str
    exporter_port: int = 9100
    ssh_key: Optional[str] = None
    type: str

class ServerResponse(ServerBase):
    id: int
    created_at: str

class PreferenceSave(BaseModel):
    screen_id: str
    data: dict

class DatafileResize(BaseModel):
    file_id: int
    new_size_mb: int

class DatafileAdd(BaseModel):
    tablespace_name: str
    file_name: str
    size_mb: int

class RedoGroupAdd(BaseModel):
    thread: int = 1
    size_mb: int
    member_path: Optional[str] = None

class RedoGroupDrop(BaseModel):
    group_id: int

class RedoMemberAdd(BaseModel):
    group_id: int
    member_path: str

class RedoMemberDrop(BaseModel):
    member_path: str

class StatsRetentionUpdate(BaseModel):
    days: int

# Routes
@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Backend is ready"}

@app.get("/api/connections", response_model=List[ConnectionResponse])
def read_connections():
    return get_all_connections()

@app.get("/api/connections/active")
def read_active_connection():
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    return active

@app.post("/api/connections", response_model=ConnectionResponse)
def create_connection(conn: ConnectionBase):
    try:
        print(f"Creating connection: {conn.name}")
        conn_id = save_connection(conn.dict())
        return {**conn.dict(), "id": conn_id, "is_active": False}
    except Exception as e:
        print(f"Error creating connection: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/config/oracle-roles")
def get_oracle_roles():
    roles = ['NORMAL']
    mapping = {
        'SYSDBA': 'AUTH_MODE_SYSDBA',
        'SYSOPER': 'AUTH_MODE_SYSOPER',
        'SYSBACKUP': 'AUTH_MODE_SYSBACKUP',
        'SYSDG': 'AUTH_MODE_SYSDG',
        'SYSKM': 'AUTH_MODE_SYSKM'
    }
    for label, attr in mapping.items():
        if hasattr(oracledb, attr):
            roles.append(label)
    return roles

@app.post("/api/connections/test")
def test_connection_endpoint(conn: ConnectionBase):
    try:
        print(f"Testing connection: {conn.name}")
        conn_dict = conn.dict()
        
        # If the password is the masked placeholder, try to fetch it from the DB
        if conn_dict.get('password') == '••••••••' and conn_dict.get('id'):
            print(f"Fetching actual password for connection ID {conn_dict['id']}")
            db = get_db_connection()
            cursor = db.cursor()
            cursor.execute("SELECT password FROM connections WHERE id = ?", (conn_dict['id'],))
            row = cursor.fetchone()
            db.close()
            if row:
                # Use the stored (encrypted) password - get_oracle_connection will decrypt it
                conn_dict['password'] = row['password']
        
        discovery_data = discover_database_info(conn_dict)
        return {"message": "Success", "discovery": discovery_data}
    except Exception as e:
        print(f"Test connection failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/api/connections/{conn_id}")
def update_db_connection(conn_id: int, conn: ConnectionBase):
    try:
        print(f"Updating connection {conn_id}: {conn.name}")
        update_connection(conn_id, conn.dict())
        return {"message": "Connection updated"}
    except Exception as e:
        print(f"Error updating connection: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/connections/{conn_id}")
def delete_existing_connection(conn_id: int):
    try:
        delete_connection(conn_id)
        return {"message": "Connection deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/servers", response_model=List[ServerResponse])
def read_servers():
    return get_all_servers()

@app.post("/api/servers", response_model=ServerResponse)
def create_server(server: ServerBase):
    try:
        server_id = save_server(server.dict())
        return {**server.dict(), "id": server_id, "created_at": "just now"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/servers/{server_id}")
def update_existing_server(server_id: int, server: ServerBase):
    try:
        update_server(server_id, server.dict())
        return {"message": "Server updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/servers/{server_id}")
def remove_existing_server(server_id: int):
    try:
        delete_server(server_id)
        return {"message": "Server deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/connections/{conn_id}/activate")
def activate_existing_connection(conn_id: int):
    try:
        # 1. Fetch connection details from DB (including encrypted password)
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM connections WHERE id = ?", (conn_id,))
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            raise HTTPException(status_code=404, detail="Connection not found")
        
        conn_info = dict(row)
        
        # 2. Test/Discover Oracle Info
        # Note: In a real environment, this might be slow, so we discovery info here
        try:
            discovery_data = discover_database_info(conn_info)
            # 3. Save discovered info and set as active
            activate_connection(conn_id, discovery_data)
            return {"message": "Connection activated", "discovery": discovery_data}
        except Exception as discovery_error:
            # Still activate even if discovery fails? Or report error?
            # For now, let's report connectivity error
            raise HTTPException(status_code=400, detail=f"Connectivity/Discovery failed: {str(discovery_error)}")
            
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Feature Routes

@app.get("/api/dashboard/metrics")
def read_dashboard_metrics():
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_dashboard_metrics(active)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/tablespaces")
def read_tablespace_summary():
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_tablespace_summary(active)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/top-queries")
def read_top_queries(owner: str = "%"):
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_top_queries(active, owner_filter=owner)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/wait-events")
def read_wait_events(event: str = "%", owner: str = "%"):
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_top_wait_events(active, owner_filter=owner, event_filter=event)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/long-operations")
def read_long_operations():
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_long_operations(active)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/invalid-triggers")
def read_invalid_triggers(owner: str = "%"):
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_invalid_triggers(active, owner_filter=owner)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/valid-objects")
def read_valid_objects(owner: str = "%"):
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_valid_objects(active, owner_filter=owner)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/open-cursors")
def read_open_cursors(owner: str = "%"):
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_open_cursors(active, owner_filter=owner)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/sysaux-occupants")
def read_sysaux_occupants():
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_dashboard_sysaux_occupants(active)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/schemas")
def read_dashboard_schemas():
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_active_schemas(active)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sessions")
def read_sessions(inst_id: Optional[int] = None):
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_sessions(active, inst_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/sessions/kill/{sid}/{serial}")
def kill_db_session(sid: str, serial: str, inst_id: int = 1):
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return kill_session(active, sid, serial, inst_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sessions/sql/{sql_id}")
def read_session_sql(sql_id: str, inst_id: Optional[int] = None):
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_session_sql(active, sql_id, inst_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sessions/blocking")
def read_blocking_sessions(inst_id: Optional[int] = None):
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_blocking_sessions(active, inst_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sessions/longops")
def read_long_ops(inst_id: Optional[int] = None):
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_long_ops(active, inst_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sessions/blocker/{sid}")
def read_blocker_details(sid: int, inst_id: Optional[int] = 1):
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        details = get_blocker_details(active, sid, inst_id)
        if not details:
            raise HTTPException(status_code=404, detail="Session not found")
        return details
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sessions/ddl/{obj_type}/{owner}/{name}")
def read_object_ddl(obj_type: str, owner: str, name: str):
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return {"ddl": get_object_ddl(active, owner, name, obj_type)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/storage/tablespaces")
def read_storage_tablespaces():
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_tablespaces_detailed(active)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/storage/files")
def read_storage_files():
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_data_files(active)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/storage/charts")
def read_storage_charts():
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_storage_charts_data(active)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/storage/redo/members")
def read_redo_members():
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_redo_members(active)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/logs/alert")
def read_alert_logs(limit: int = 100):
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_alert_logs(active, limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/logs/outstanding")
def read_outstanding_alerts():
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_outstanding_alerts(active)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/configuration/parameters")
def read_db_parameters():
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_db_parameters(active)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/backups/jobs")
def read_backup_jobs():
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_backup_jobs(active)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/backups/summary")
def read_backup_summary():
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_backup_summary(active)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/backups/sets/{session_key}")
def read_backup_sets(session_key: int):
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_backup_sets(active, session_key)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/backups/files/{bs_key}")
def read_backup_datafiles(bs_key: int):
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_backup_datafiles(active, bs_key)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/backups/nls")
def read_backups_nls():
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_nls_parameters(active)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/storage/segments/{tablespace_name}")
def read_storage_segments(tablespace_name: str):
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_segments(active, tablespace_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/storage/redo")
def read_redo_groups():
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_redo_groups(active)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/storage/redo/history")
def read_redo_history(days: int = 7, inst_id: Optional[int] = None):
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_redo_switch_history(active, days=days, inst_id=inst_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/storage/redo/threads")
def read_redo_threads():
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_redo_threads(active)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/storage/control")
def read_control_files():
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_control_files(active)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/storage/sysaux")
def read_sysaux_occupants():
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_sysaux_occupants(active)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/storage/undo")
def read_undo_stats():
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_undo_stats(active)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/storage/temp")
def read_temp_usage():
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_temp_usage(active)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/storage/checkpoint")
def read_checkpoint_progress():
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_checkpoint_progress(active)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/storage/checkpoint/force")
def force_ckpt():
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    
    print(f"Forcing checkpoint for connection: {active['name']} ({active['host']})")
    try:
        force_checkpoint(active)
        return {"status": "success"}
    except Exception as e:
        print(f"Error in force_ckpt: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/storage/redo/standby")
def read_standby_redo():
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_standby_redo_groups(active)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/storage/redo/archives")
def read_redo_archives():
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_archived_logs(active)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/storage/redo/logbuffer")
def read_redo_logbuffer():
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_log_buffer_stats(active)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/storage/files/resize")
def resize_file(req: DatafileResize):
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        resize_datafile(active, req.file_id, req.new_size_mb)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/storage/files/add")
def add_file(req: DatafileAdd):
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        add_datafile(active, req.tablespace_name, req.file_name, req.size_mb)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/storage/redo/group/add")
def add_redo(req: RedoGroupAdd):
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        add_redo_group(active, req.thread, req.size_mb, req.member_path)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/storage/redo/group/drop")
def drop_redo(req: RedoGroupDrop):
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        drop_redo_group(active, req.group_id)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/storage/redo/member/add")
def add_redo_mem(req: RedoMemberAdd):
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        add_redo_member(active, req.group_id, req.member_path)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/storage/redo/member/drop")
def drop_redo_mem(req: RedoMemberDrop):
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        drop_redo_member(active, req.member_path)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    print(f"Switching logfile for connection: {active['name']} ({active['host']})")
    try:
        switch_logfile(active)
        return {"status": "success"}
    except Exception as e:
        print(f"Error in switch_redo: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/storage/redo/mgmt-info")
def read_redo_mgmt_info():
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_redo_management_info(active)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/storage/stats/retention")
def read_stats_retention():
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_stats_history_retention(active)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/storage/stats/retention")
def update_stats_retention(req: StatsRetentionUpdate):
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return set_stats_history_retention(active, req.days)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# User Preferences Endpoints
@app.get("/api/preferences/{screen_id}")
def get_preferences(screen_id: str):
    active = get_active_connection()
    if not active:
        return {} # No preferences if no connection
    
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT data FROM user_preferences WHERE connection_id = ? AND screen_id = ?",
            (active['id'], screen_id)
        )
        row = cursor.fetchone()
        if row:
            import json
            return json.loads(row[0])
        return {}
    except Exception as e:
        print(f"Error getting preferences: {e}")
        return {}
    finally:
        conn.close()

@app.post("/api/preferences")
def save_preferences(pref: PreferenceSave):
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    
    conn = get_db_connection()
    try:
        import json
        data_str = json.dumps(pref.data)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO user_preferences (connection_id, screen_id, data, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(connection_id, screen_id) DO UPDATE SET
                data = excluded.data,
                updated_at = CURRENT_TIMESTAMP
        """, (active['id'], pref.screen_id, data_str))
        conn.commit()
        return {"status": "success"}
    except Exception as e:
        print(f"Error saving preferences: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# SQL Central Endpoints
@app.get("/api/sql/registry")
def read_sql_registry():
    try:
        return get_sql_registry()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sql/content")
def read_sql_content(path: str):
    try:
        active = get_active_connection()
        version = active.get('version') if active else None
        return {"content": get_sql_content(path, version)}
    except FileNotFoundError as fe:
        raise HTTPException(status_code=404, detail=str(fe))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sql/search")
def run_sql_search(query: str):
    try:
        return search_sql_content(query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class SqlExecuteRequest(BaseModel):
    sql_text: str
    auto_commit: bool = False
    bind_vars: Optional[dict] = None

@app.post("/api/sql/execute")
def run_sql(req: SqlExecuteRequest):
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return execute_generic_sql(
            active, 
            req.sql_text, 
            auto_commit=req.auto_commit, 
            bind_vars=req.bind_vars
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class SqlSaveRequest(BaseModel):
    rel_path: str
    content: str

@app.post("/api/sql/save")
def write_sql(req: SqlSaveRequest):
    try:
        from .sql_central_mod import save_sql_content
        save_sql_content(req.rel_path, req.content)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/sql/delete")
def remove_sql(path: str):
    try:
        delete_sql_script(path)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ToolExecuteRequest(BaseModel):
    tool: str
    rel_path: str

@app.post("/api/sql/execute_tool")
def run_tool(req: ToolExecuteRequest):
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return execute_external_tool(active, req.tool, req.rel_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class SqlCreateRequest(BaseModel):
    folder: str
    name: str
    label: str
    codmenutype: int

@app.post("/api/sql/create")
def read_sql_create(req: SqlCreateRequest):
    try:
        from .sql_central_mod import create_sql_script
        new_path = create_sql_script(req.folder, req.name, req.label, req.codmenutype)
        return {"status": "success", "rel_path": new_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/jobs/legacy")
def read_legacy_jobs():
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_legacy_jobs(active)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/jobs/running")
def read_running_jobs():
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_running_jobs(active)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/jobs/run")
def start_job(job_id: int):
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        run_legacy_job(active, job_id)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/jobs/broken")
def toggle_job_broken(job_id: int, broken: bool):
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        set_legacy_job_broken(active, job_id, broken)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/jobs/remove")
def delete_job(job_id: int):
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        remove_legacy_job(active, job_id)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class JobSubmitRequest(BaseModel):
    what: str
    next_date: str = None
    interval: str = None

@app.post("/api/jobs/submit")
def create_legacy_job(req: JobSubmitRequest):
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        submit_legacy_job(active, req.what, req.next_date, req.interval)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/tools/execute")
def run_tool_async(req: ToolExecuteRequest):
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        # Note: We reuse ToolExecuteRequest but it might need different fields later
        # For now, we expect 'tool' and 'sql_text' (sent as 'rel_path' in the request for compatibility or new field)
        # But let's create a specific request for tools
        pass
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ToolAsyncRequest(BaseModel):
    tool: str
    script: str
    connection_id: int
    use_ssh: bool = False

@app.post("/api/tools/start")
def start_tool(req: ToolAsyncRequest):
    try:
        execution_id = start_tool_execution(req.connection_id, req.tool, req.script, req.use_ssh)
        return {"execution_id": execution_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tools/status/{execution_id}")
def get_tool_status(execution_id: str):
    try:
        status = get_tool_execution_status(execution_id)
        if status["status"] == "not_found":
            raise HTTPException(status_code=404, detail="Execution not found")
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tools/list")
def list_tool_executions():
    return list_executions()

@app.get("/api/healthcheck")
def read_healthcheck():
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return run_healthcheck(active)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Time Machine Routes ---

@app.get("/api/timemachine/history")
def read_timemachine_history(start: str, end: str):
    """Fetch historical high-level metrics."""
    try:
        return get_history_range(start, end)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/timemachine/snapshot")
def read_timemachine_snapshot(target: str):
    """Fetch a complete point-in-time snapshot."""
    try:
        snapshot = get_snapshot_at_time(target)
        if not snapshot:
            raise HTTPException(status_code=404, detail="No snapshot found for this time")
        return snapshot
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Serving Static Files (Frontend) ---

# Path to the 'dist' directory (where React build lives)
# In Docker, we will place it in /app/dist
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dist")

# If the directory exists, mount it
if os.path.exists(FRONTEND_DIR):
    print(f"Frontend directory found at: {FRONTEND_DIR}. Serving static files.")
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIR, "assets")), name="static")

    # Catch-all route to serve index.html for any non-API route (SPA Support)
    @app.get("/{full_path:path}")
    async def serve_frontend(request: Request, full_path: str):
        # If it's an API call, let FastAPI handle it normally (should have matched above)
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API route not found")
        
        # Check if the file exists in dist (for icons, etc. not in /assets)
        file_path = os.path.join(FRONTEND_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
            
        # Otherwise, return index.html (SPA routing)
        return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))
else:
    print(f"Warning: Frontend directory NOT found at {FRONTEND_DIR}. Run in API-only mode.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
