import { app, BrowserWindow } from 'electron';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let pythonProcess;

function startPythonBackend() {
    const isDev = !app.isPackaged;
    console.log(`Starting Python backend (isDev: ${isDev})...`);

    if (isDev) {
        // In development, run uvicorn command
        pythonProcess = spawn('python3', [
            '-m', 'uvicorn',
            'backend.main:app',
            '--host', '127.0.0.1',
            '--port', '8000'
        ], {
            cwd: path.join(__dirname, '..'),
            shell: true
        });
    } else {
        // In production, run the bundled executable
        // This assumes the binary is placed in the 'resources' folder of the app
        const binPath = path.join(process.resourcesPath, 'rockdb-backend');
        pythonProcess = spawn(binPath, [], {
            shell: false
        });
    }

    pythonProcess.stdout.on('data', (data) => {
        console.log(`Backend: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Backend Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Backend process exited with code ${code}`);
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        // Icon can be added later
        show: false // Hide initially until maximized
    });

    // Reflect the browser workspace by maximizing
    mainWindow.maximize();
    mainWindow.show();

    // In development, load the Vite dev server
    // In production, load the built index.html
    const isDev = !app.isPackaged;
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        // Open DevTools in dev mode
        mainWindow.webContents.openDevTools();
    } else {
        // Load built files
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    startPythonBackend();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (pythonProcess) {
        pythonProcess.kill();
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// For MacOS
app.on('before-quit', () => {
    if (pythonProcess) {
        pythonProcess.kill();
    }
});
