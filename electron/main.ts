import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';

let mainWindow: BrowserWindow | null = null;
let nextProcess: ChildProcess | null = null;
let scrabbleProcess: ChildProcess | null = null;

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
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'hiddenInset',
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    // Quit app when main window is closed (for production)
    if (process.env.NODE_ENV === 'production') {
      app.quit();
    }
  });
}

function startServices() {
  console.log('Starting background services...');

  // Start Next.js dev server (development only)
  if (process.env.NODE_ENV !== 'production') {
    console.log('Starting Next.js server...');
    nextProcess = spawn('bun', ['run', 'dev'], {
      cwd: process.cwd(),
      stdio: 'inherit',
    });

    nextProcess.on('error', (err) => {
      console.error('Failed to start Next.js:', err);
    });
  }

  // Start Scrabble WebSocket service
  console.log('Starting Scrabble WebSocket service...');
  const servicePath = path.join(process.cwd(), 'mini-services', 'scrabble-game-service');
  
  scrabbleProcess = spawn('bun', ['run', 'dev'], {
    cwd: servicePath,
    stdio: 'inherit',
    shell: true
  });

  scrabbleProcess.on('error', (err) => {
    console.error('Failed to start Scrabble service:', err);
  });

  scrabbleProcess.on('exit', (code) => {
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
