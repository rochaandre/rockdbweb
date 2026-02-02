# RockDB: Advanced Oracle DBA Dashboard

**RockDB** is a high-performance, modern dashboard designed to streamline Oracle Database administration, monitoring, and troubleshooting. Built with **React 19**, **Tailwind CSS v4**, and a **FastAPI** backend, it provides a lightning-fast interface for DBAs to manage sessions, storage, and redo logs with ease.

## 🚀 Key Features

### 🔄 Redo Log Explorer (New!)
*   **Dynamic Management**: Switch logfiles, add/drop groups, and manage members directly from the UI.
*   **Switch Matrix**: Detailed hourly switch reports with instance/thread filtering.
*   **Live Metrics**: Real-time analysis of Log Buffer (entries, retries, space requests) and Archive history.
*   **Visual Rate**: Hourly switch rate graphics for performance trend analysis.
*   **Standby Support**: Full visibility into Standby Redo Log groups.

### 💾 Storage Management
*   **Tablespace Dashboard**: Visual breakdown of used vs. free space across all tablespaces.
*   **Detailed Analysis**: Drill down into datafiles and segments (top consumers) for any tablespace.
*   **Control Files & Checkpoints**: Monitor control file status and track checkpoint progress in real-time.
*   **Specialized Panels**: Dedicated views for SYSAUX occupants, UNDO statistics, and TEMP usage.

### 🕵️ Session Explorer
*   **Real-Time Monitoring**: Visualize hundreds of active sessions in a dense, information-rich grid.
*   **Blocking Chain Analysis**: Identify root blockers instantly with hierarchical tree views and visual alerts.
*   **DBA Actions**: Kill sessions, enable tracing, and inspect SQL text with a single click.

### ⚙️ Core Enhancements
*   **Multi-Connection Support**: Manage multiple Oracle connections with persistence and easy switching.
*   **Persistent Preferences**: Your active database and UI state (tabs, filters) are remembered between sessions.
*   **High Performance**: Minimal overhead, utilizing lightweight API calls and efficient state management.

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
