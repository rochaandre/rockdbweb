# RockDB Electron Setup & Update Guide

This guide explains how to develop, build, and update the RockDB desktop application using Electron.

## Development Mode

To run the application in development mode with hot-reload for the frontend:

```bash
npm run electron:dev
```

This will:
1. Start the Vite development server.
2. Launch Electron, pointing to the local Vite URL.
3. Start the Python backend in development mode (running from source).

## Production Simulation

To test how the application behaves when packaged (but without actually creating a distributable):

```bash
npm run electron:prod
```

This will:
1. Build the React frontend (`dist/` folder).
2. Launch Electron in production mode.
3. Start the Python backend from the pre-compiled binary in `release_bin/`.

## Updating the Application

### 1. Updating the Frontend (React/TypeScript)
Any changes made in the `src/` folder are automatically picked up during development. For production, you must rebuild the app.

### 2. Updating the Backend (Python)
If you modify the Python code in `backend/`:
- **In Development**: Changes are picked up automatically if `uvicorn` reload is active.
- **In Production**: You MUST re-compile the backend binary if you want to update the packaged app.

### 3. Updating SQL Scripts
SQL scripts in the `sql/` folder are bundled into the application. 
- **In Development**: They are read directly from the `./sql` directory.
- **In Production**: They are read from the `Resources/sql` directory inside the app package.

## Packaging the Application

To create a distributable package for your current platform (macOS):

```bash
npm run electron:package
```

To create installers (DMG, Zip, etc.):

```bash
npm run electron:make
```

The output will be located in the `out/` directory.

## Re-compiling the Backend Binary

The Electron production mode uses a compiled version of the Python backend located in `release_bin/`. If you make significant changes to the backend and want them to persist in the standalone desktop app, you need to use **PyInstaller**:

```bash
# Example command (ensure you have pyinstaller installed)
pyinstaller rockdb-backend.spec --clean
```

Copy the resulting binary back to `release_bin/rockdb-backend`.
