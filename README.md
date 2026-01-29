# RockDB Sessions Manager

**RockDB Sessions Manager** is a high-performance, modern dashboard designed to streamline Oracle Database session monitoring and troubleshooting. Built with **React 19** and **Tailwind CSS v4**, it provides a lightning-fast interface for DBAs to identify bottlenecks, analyze blocking chains, and resolve issues instantly.

![Dashboard Preview](public/vite.svg) *Note: Replace with actual screenshot*

## 🚀 Key Features

*   **Real-Time Session Monitoring**: Visualize hundreds of active sessions in a dense, information-rich grid.
*   **Blocking Session Analysis**: Instantly spot blocking chains with a hierarchical tree view. Red highlights identify root blockers, while yellow indicates waiting sessions.
*   **Rapid Problem Resolution**:
    *   **Kill Session**: Terminate runaway processes with two clicks.
    *   **Trace Session**: Enable low-level diagnostics on the fly.
    *   **Show SQL**: Inspect currently executing SQL statements.
*   **Advanced Filtering**: Powerful, toggle-based filters to focus on what matters (Active, Inactive, Background, Killed, Parallel).
*   **Context-Aware Details**: Select any session to view deeper metrics, wait events, and resource consumption in the detail sidebar.

## 🛠️ Tech Stack

*   **Frontend**: React 19, TypeScript, Vite
*   **Styling**: Tailwind CSS v4, Tailwind Variants, Lucide React icons
*   **Components**: Base UI (Headless) for accessible, robust primitives

## 📦 Getting Started

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Start Development Server**
    ```bash
    npm run dev
    ```

3.  **Build for Production**
    ```bash
    npm run build
    ```

---
*Empowering DBAs with speed and clarity.*
