from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

from .utils import init_db, get_db_connection
from .db_connections import (
    get_all_connections, get_active_connection, save_connection, 
    update_connection, delete_connection, activate_connection
)
from .oracle_connectivity import discover_database_info
from .dashboard_mod import get_dashboard_metrics, get_tablespace_summary
from .sessions_mod import (
    get_sessions, kill_session, get_session_sql, get_blocking_sessions, 
    get_long_ops, get_blocker_details, get_object_ddl
)
from .storage_mod import (
    get_tablespaces_detailed, get_data_files, get_segments, 
    get_control_files, get_sysaux_occupants, get_undo_stats, get_temp_usage,
    resize_datafile, add_datafile, get_checkpoint_progress, force_checkpoint
)
from .redo_logs_mod import (
    get_redo_groups, get_redo_switch_history, get_redo_threads,
    add_redo_group, drop_redo_group, add_redo_member, drop_redo_member,
    switch_logfile, get_standby_redo_groups, get_archived_logs, get_log_buffer_stats
)
from .logs_mod import get_alert_logs, get_db_parameters, get_outstanding_alerts
from .backups_mod import get_backup_jobs, get_backup_summary, get_backup_sets, get_backup_datafiles

# Initialize Database
init_db()

app = FastAPI(title="RockDB Python Backend")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class ConnectionBase(BaseModel):
    name: str
    host: str
    port: str
    service: str
    username: str
    password: str
    type: str

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

# Routes
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
    try:
        force_checkpoint(active)
        return {"status": "success"}
    except Exception as e:
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

@app.post("/api/storage/redo/switch")
def switch_redo():
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        switch_logfile(active)
        return {"status": "success"}
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
