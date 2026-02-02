# RockDB: Ultimate Oracle DBA Management Suite

**RockDB** is a state-of-the-art, high-density dashboard designed for professional Oracle Database Administrators. It provides a centralized console for real-time monitoring, proactive maintenance, and rapid troubleshooting of complex Oracle environments.

Built for **containerized deployment**, the suite eliminates manual configuration, providing a "single pane of glass" through a fast, modern React frontend and a robust FastAPI backend.

---

## 🧭 Application Modules

### � Dashboard
*   **Instance Overview**: Unified view of database status, version, uptime, and open mode.
*   **Key Metrics**: Quick-glance charts for database size, total sessions, and tablespace usage.
*   **RAC Awareness**: Transparently handles single-instance and RAC environments, showing instance-specific roles.

### �️ Session Explorer
*   **Live Grid**: Monitor hundreds of sessions with minimal lag. Filters by SID, User, Machine, and Program.
*   **Visual Blocking Chain**: Identify "root cause" blockers through a hierarchical tree view. 
*   **Drill-down Analytics**: Inspect SQL text, execution plans (via SQL ID), and session events.
*   **Admin Controls**: Kill sessions or enable SQL Trace directly from the interface.
*   **Long Ops**: Dedicated tracking for long-running database operations.

### � Storage & Physical Layout
*   **Tablespace Management**: Visual capacity planning with % used/free and growth indicators.
*   **Segment Analysis**: Identify top "space eaters" within any tablespace (Tables, Indexes, LOBs).
*   **Datafile Control**: Direct actions to resize datafiles or add new ones to specific tablespaces.
*   **Deep Monitoring**: Specialized views for **SYSAUX** occupants, **UNDO** retention/usage, and **TEMP** space pressure.
*   **Physical Integrity**: Monitor Control Files, Checkpoint progress, and Force Checkpoint actions.

### 🔄 Redo Log Lifecycle
*   **Management Suite**: Graphical interface to add/drop groups, manage members, and perform manual log switches.
*   **Switch Rate Graphics**: Analyzes redo switch history to identify peak I/O periods.
*   **Switch Matrix**: Hourly heatmap of log switches across all threads/instances.
*   **Archive Tracking**: Full visibility into archived log history and sequence progression.
*   **Standby Support**: Monitor and manage Standby Redo Log (SRL) groups.
*   **Performance Tunning**: Real-time analysis of Log Buffer retries and space requests.

### � SQL Central 2.0
*   **Script Registry**: Organized folder-based storage for DBA scripts (Health Checks, Maintenance, Security).
*   **Smart Content Search**: Debounced, recursive search that scans the *code* inside scripts, not just labels.
*   **Integrated Terminals**: Execute scripts via specialized engines:
    *   **SQLcl**: standard SQL/PLSQL execution.
    *   **RMAN**: Direct backup/recovery script submission.
    *   **DGmgrl**: Data Guard management interface.
    *   **SQLLDR**: Data loading templates.
*   **Data Visualization**: Bind query results to dynamic Pie, Bar, line charts, or Gauges.

### � Job Management (Legacy)
*   **DBMS_JOB Control**: Comprehensive management of legacy Oracle jobs.
*   **Job Lifecycle**: Create new jobs (PL/SQL block + Interval), Run manually, Toggle Broken status, or Remove.
*   **Execution Sync**: Real-time correlation between `dba_jobs` and `v$session` to see exactly what a job is doing right now.

### 🛡️ Backup & Recovery
*   **RMAN Job Tracking**: Complete history of RMAN sessions, statuses (Success/Failure), and duration.
*   **NLS Protection**: Cards displaying Database Character Set, Language, and Territory to validate recovery environments.
*   **Drill-down Detail**: Navigate from Backup Jobs to specific Backup Sets and individual Datafiles.
*   **Script Generators**: Interactive templates for high-performance RMAN and EXPDP/IMPDP commands.

### ⚙️ Configuration & Logs
*   **Parameter Explorer**: Search and filter dynamic/static initialization parameters (`v$parameter`).
*   **Alert Log Analysis**: Real-time viewing of the Oracle Alert Log with limit-based filtering.
*   **Connection Vault**: Secure management of multiple target databases with persistent session memory.

---
*Empowering DBAs with speed, clarity, and total control.*
