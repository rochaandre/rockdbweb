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
from .sessions_mod import get_sessions, kill_session, get_session_sql
from .storage_mod import get_tablespaces_detailed, get_data_files, get_segments
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
def read_sessions():
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_sessions(active)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/sessions/kill/{sid}/{serial}")
def kill_db_session(sid: str, serial: str):
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return kill_session(active, sid, serial)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sessions/sql/{sql_id}")
def read_session_sql(sql_id: str):
    active = get_active_connection()
    if not active:
        raise HTTPException(status_code=404, detail="No active connection")
    try:
        return get_session_sql(active, sql_id)
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
