import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { spawn, ChildProcess, fork } from 'child_process';

let mainWindow: BrowserWindow | null = null;
let nextProcess: ChildProcess | null = null;
let scrabbleProcess: ChildProcess | null = null;

const isDev = process.env.NODE_ENV === 'development';
const PORT = 3000;
const GAME_SERVICE_PORT = 3004;

function getResourcePath(...paths: string[]) {
  // In production, resources are in the app.asar or Resources folder
  if (isDev) {
    return path.join(process.cwd(), ...paths);
  }
  return path.join(process.resourcesPath, ...paths);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    backgroundColor: '#ffffff',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'hiddenInset',
  });

  // Always load from localhost - we run the server in both dev and prod
  mainWindow.loadURL(`http://localhost:${PORT}`);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    app.quit();
  });
}

function startServices() {
  console.log('Starting background services...');
  console.log('isDev:', isDev);
  console.log('resourcesPath:', process.resourcesPath);

  if (isDev) {
    // Development: use bun run dev
    console.log('Starting Next.js dev server...');
    nextProcess = spawn('bun', ['run', 'dev'], {
      cwd: process.cwd(),
      stdio: 'inherit',
    });

    nextProcess.on('error', (err) => {
      console.error('Failed to start Next.js:', err);
    });

    // Start game service with bun
    console.log('Starting Scrabble WebSocket service...');
    scrabbleProcess = spawn('bun', ['mini-services/scrabble-game-service/index.ts'], {
      cwd: process.cwd(),
      stdio: 'inherit',
    });
  } else {
    // Production: run the standalone server
    console.log('Starting Next.js standalone server...');
    const serverPath = getResourcePath('.next', 'standalone', 'server.js');
    console.log('Server path:', serverPath);

    nextProcess = fork(serverPath, [], {
      cwd: getResourcePath('.next', 'standalone'),
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: String(PORT),
      },
      stdio: 'inherit',
    });

    nextProcess.on('error', (err) => {
      console.error('Failed to start Next.js server:', err);
    });

    // Start game service - bundled in resources
    console.log('Starting Scrabble WebSocket service...');
    const gameServicePath = getResourcePath('mini-services', 'scrabble-game-service', 'index.js');
    console.log('Game service path:', gameServicePath);

    scrabbleProcess = fork(gameServicePath, [], {
      env: {
        ...process.env,
        PORT: String(GAME_SERVICE_PORT),
      },
      stdio: 'inherit',
    });
  }

  scrabbleProcess?.on('error', (err) => {
    console.error('Failed to start Scrabble service:', err);
  });

  scrabbleProcess?.on('exit', (code) => {
    console.log('Scrabble service exited with code:', code);
  });
}

function stopServices() {
  console.log('Stopping background services...');

  if (nextProcess) {
    nextProcess.kill();
    nextProcess = null;
  }

  if (scrabbleProcess) {
    scrabbleProcess.kill();
    scrabbleProcess = null;
  }
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  startServices();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== 'darwin') {
    stopServices();
  }
});

app.on('before-quit', () => {
  stopServices();
});

// Handle IPC messages
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('quit-app', () => {
  app.quit();
});
