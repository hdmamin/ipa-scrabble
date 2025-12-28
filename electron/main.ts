console.log('=== Electron main.ts loading ===');

import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { spawn, ChildProcess, fork } from 'child_process';

console.log('=== Imports complete ===');

let mainWindow: BrowserWindow | null = null;
let nextProcess: ChildProcess | null = null;
let scrabbleProcess: ChildProcess | null = null;

// app.isPackaged is true when running from a built .app bundle
const isDev = !app.isPackaged;
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

    nextProcess = spawn(process.execPath, [serverPath], {
      cwd: getResourcePath('.next', 'standalone'),
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: '1',
        NODE_ENV: 'production',
        PORT: String(PORT),
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    nextProcess.stdout?.on('data', (data) => {
      console.log('[NextJS]', data.toString());
    });

    nextProcess.stderr?.on('data', (data) => {
      console.error('[NextJS Error]', data.toString());
    });

    nextProcess.on('error', (err) => {
      console.error('Failed to start Next.js server:', err);
    });

    // Start game service - bundled in resources
    console.log('Starting Scrabble WebSocket service...');
    const gameServicePath = getResourcePath('mini-services', 'scrabble-game-service', 'index.js');
    console.log('Game service path:', gameServicePath);

    // Use spawn with node instead of fork for better compatibility
    scrabbleProcess = spawn(process.execPath, [gameServicePath], {
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: '1',
        PORT: String(GAME_SERVICE_PORT),
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    scrabbleProcess.stdout?.on('data', (data) => {
      console.log('[GameService]', data.toString());
    });

    scrabbleProcess.stderr?.on('data', (data) => {
      console.error('[GameService Error]', data.toString());
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

// Wait for server to be ready
function waitForServer(url: string, maxAttempts = 30): Promise<void> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      attempts++;
      console.log(`Checking server (attempt ${attempts})...`);
      fetch(url)
        .then(() => {
          console.log('Server is ready!');
          resolve();
        })
        .catch(() => {
          if (attempts >= maxAttempts) {
            reject(new Error('Server failed to start'));
          } else {
            setTimeout(check, 1000);
          }
        });
    };
    check();
  });
}

// App lifecycle
app.whenReady().then(async () => {
  startServices();

  // Wait for Next.js server to be ready
  try {
    await waitForServer(`http://localhost:${PORT}`);
  } catch (err) {
    console.error('Failed to start server:', err);
  }

  createWindow();

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
