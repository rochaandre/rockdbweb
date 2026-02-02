# RockDB: Advanced Oracle DBA Dashboard

**RockDB** is a high-performance, modern dashboard designed to streamline Oracle Database administration, monitoring, and troubleshooting. Built with **React 19**, **Tailwind CSS v4**, and a **FastAPI** backend, it provides a lightning-fast interface for DBAs to manage sessions, storage, and redo logs with ease.

## 🚀 Key Features

### 📅 Legacy Job Management (New!)
*   **Full Lifecycle**: Create, run, pause (broken), and remove legacy Oracle jobs (`dba_jobs`).
*   **Execution Insights**: Real-time reporting on currently running jobs with session synchronization (SID, event, duration).
*   **Deep Inspection**: View full PL/SQL blocks (`WHAT`) and frequency settings (`INTERVAL`) for any job.

### 🔍 SQL Central 2.0
*   **Content Search**: Instant, debounced search across all script code—find what you need by functional keyword, not just filename.
*   **External Tool Terminal**: Integrated console for executing `sqlcl`, `RMAN`, `DGmgrl`, and `sqlldr` scripts with live output capture.
*   **Contextual Creation**: Add new scripts directly into specific folders (pie, bar, gauge, internal) with instant categorization.

### 🛡️ Backup & Recovery Enhancements
*   **NLS Awareness**: Automatic detection and display of `NLS_CHARACTERSET`, `LANGUAGE`, and `TERRITORY` to ensure safe recovery environments.
*   **Drill-down Reports**: Deep-dive from backup jobs into sets and individual datafiles.

### ⚙️ Core Enhancements
*   **Sidebar Refinement**: Streamlined navigation with dedicated Job Management access.
*   **Advanced Connectivity**: Automatic discovery of RAC/Single Instance roles and storage status.
*   **Multi-Connection Support**: Manage multiple Oracle connections with persistence and easy switching.

## 🛠️ Tech Stack

*   **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React icons, Shadcn/ui.
*   **Backend**: Python, FastAPI, oracledb (Thick/Thin driver support), SQLite (for metadata).
*   **State Management**: Zustand & Custom Persistence Hooks.

## 📦 Getting Started

### Prerequisites
*   Node.js 18+
*   Python 3.10+
*   Oracle Instant Client (if using Thick mode)

### Installation

1.  **Clone and Install Frontend**
    ```bash
    npm install
    ```

2.  **Install Backend Dependencies**
    ```bash
    pip install -r backend/requirements.txt
    ```

3.  **Run Development Environment**
    ```bash
    # Terminal 1: Frontend
    npm run dev

    # Terminal 2: Backend
    python -m backend.main
    ```

---
*Empowering DBAs with speed, clarity, and control.*
