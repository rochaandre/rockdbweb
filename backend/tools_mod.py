"""
# ==============================================================================
# ROCKDB - Oracle Database Administration & Monitoring Tool
# ==============================================================================
# File: tools_mod.py
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
import os
import uuid
import subprocess
import threading
import time
from typing import Dict, Any, Optional

# Global dictionary to track active executions
# In a production environment, this should be in a persistent store or a dedicated task queue
executions: Dict[str, Dict[str, Any]] = {}

def start_tool_execution(connection_id: int, tool: str, script_content: str, use_ssh: bool = True) -> str:
    """
    Starts an external tool execution REMOTELY via SSH.
    All executions in the Tools section are now mandatory remote.
    Returns an execution_id.
    """
    from .utils import get_db_connection, decrypt_password
    
    # Fetch connection info from DB
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM connections WHERE id = ?", (connection_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise ValueError(f"Connection not found: {connection_id}")
    
    conn_info = dict(row)
    # Target host from connection info
    host = conn_info['host']

    execution_id = str(uuid.uuid4())
    
    # Setup temporary directory for local execution logs
    temp_dir = os.path.join(os.getcwd(), "temp_tools")
    os.makedirs(temp_dir, exist_ok=True)
    
    log_path = os.path.join(temp_dir, f"{execution_id}.log")
    
    # SSH Configuration
    # Defaulting to 'oracle' user for DB tools as per common practice
    ssh_user = "oracle"
    
    remote_tool_cmd = ""
    tool_lower = tool.lower()
    
    if tool_lower in ['sqlcl', 'sql']:
        remote_tool_cmd = "sql -s / as sysdba"
    elif tool_lower == 'rman':
        remote_tool_cmd = "rman target /"
    elif tool_lower == 'sqlplus':
        remote_tool_cmd = "sqlplus -s / as sysdba"
    elif tool_lower == 'oratop':
        # oratop usually run in batch mode -b for non-interactive output redirection
        remote_tool_cmd = "oratop -i 1 -b"
    elif tool_lower == 'dgmgrl':
        remote_tool_cmd = "dgmgrl /"
    elif tool_lower == 'sqlldr':
        remote_tool_cmd = "sqlldr /"
    else:
        # Fallback to just the tool name if not explicitly mapped
        remote_tool_cmd = tool

    # Use heredoc to pipe the script content to the remote tool via SSH
    # We use << '__ROCKDB_EOF__' to prevent local shell expansion of the script content
    full_remote_cmd = f"{remote_tool_cmd} << '__ROCKDB_EOF__'\n{script_content}\n__ROCKDB_EOF__"
    
    # Standard SSH command with connection timeout and no strict key checking
    cmd = [
        'ssh', 
        '-o', 'BatchMode=yes',
        '-o', 'StrictHostKeyChecking=no',
        '-o', 'ConnectTimeout=5',
        f'{ssh_user}@{host}', 
        full_remote_cmd
    ]

    # Start process
    log_file = open(log_path, "w")
    process = subprocess.Popen(
        cmd,
        stdout=log_file,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1, # Line buffered
        universal_newlines=True
    )
    
    executions[execution_id] = {
        "process": process,
        "log_path": log_path,
        "log_file_handle": log_file,
        "start_time": time.time(),
        "tool": tool,
        "status": "running"
    }
    
    # Start a cleanup thread (optional, but good for self-contained management)
    def wait_and_cleanup():
        process.wait()
        log_file.close()
        executions[execution_id]["status"] = "finished" if process.returncode == 0 else "error"
        executions[execution_id]["exit_code"] = process.returncode

    threading.Thread(target=wait_and_cleanup, daemon=True).start()
    
    return execution_id

def get_tool_execution_status(execution_id: str) -> dict:
    """
    Returns the current status and output of an execution.
    """
    if execution_id not in executions:
        return {"status": "not_found"}
    
    exec_info = executions[execution_id]
    
    # Read current log content
    try:
        with open(exec_info["log_path"], "r", encoding="utf-8", errors="ignore") as f:
            output = f.read()
    except Exception as e:
        output = f"Error reading log: {str(e)}"
    
    return {
        "status": exec_info["status"],
        "output": output,
        "tool": exec_info["tool"],
        "start_time": exec_info["start_time"],
        "exit_code": exec_info.get("exit_code")
    }

def list_executions() -> list:
    """Lists recent executions."""
    return [
        {
            "id": eid,
            "tool": info["tool"],
            "status": info["status"],
            "start_time": info["start_time"]
        }
        for eid, info in executions.items()
    ]
