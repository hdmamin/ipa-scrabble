import { NextResponse } from 'next/server';
import ngrok from 'ngrok';
import { join } from 'path';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { homedir } from 'os';

// Cache ngrok URL to avoid spawning multiple processes
let cachedNgrokUrl: string | null = null;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const authtoken = body.authtoken || process.env.NGROK_AUTHTOKEN;

    if (!authtoken) {
      return NextResponse.json(
        { error: 'No authtoken provided', details: 'Please set up your ngrok authtoken' },
        { status: 400 }
      );
    }

    // Return cached URL if available
    if (cachedNgrokUrl) {
      return NextResponse.json({
        url: cachedNgrokUrl,
        cached: true
      });
    }

    // Kill any existing tunnels first
    try {
      await ngrok.disconnect();
      await ngrok.kill();
    } catch (e) {
      // Ignore errors if no tunnel exists
    }

    // Ensure ngrok config directory exists (macOS: ~/Library/Application Support/ngrok)
    const isMac = process.platform === 'darwin';
    const ngrokConfigDir = isMac
      ? join(homedir(), 'Library', 'Application Support', 'ngrok')
      : join(homedir(), '.ngrok2');
    const ngrokConfigPath = join(ngrokConfigDir, 'ngrok.yml');

    if (!existsSync(ngrokConfigPath)) {
      try {
        mkdirSync(ngrokConfigDir, { recursive: true });
        writeFileSync(ngrokConfigPath, 'version: "2"\n');
        console.log('Created ngrok config at:', ngrokConfigPath);
      } catch (e) {
        console.warn('Could not create ngrok config:', e);
      }
    }

    // Start ngrok tunnel for port 3004 (game service)
    console.log('Starting ngrok tunnel for port 3004...');

    // In packaged app, use the bundled binary from Resources
    const isPackaged = process.env.NODE_ENV === 'production';
    let ngrokBinaryPath: string;

    if (isPackaged) {
      // In packaged app, go up from .../Resources/.next/standalone to .../Resources
      const currentPath = process.cwd(); // something like .../Resources/.next/standalone
      const resourcesPath = join(currentPath, '..', '..'); // go up 2 levels: .next -> Resources
      ngrokBinaryPath = join(resourcesPath, 'ngrok-binary');
    } else {
      // In development, use node_modules
      ngrokBinaryPath = join(process.cwd(), 'node_modules', 'ngrok', 'bin', 'ngrok');
    }

    console.log('Working directory:', process.cwd());
    console.log('Ngrok binary path:', ngrokBinaryPath);
    console.log('Binary exists:', existsSync(ngrokBinaryPath));

    // Instead of using ngrok package's spawn, do it manually
    const { spawn } = require('child_process');

    const ngrokArgs = ['http', '3004', '--authtoken', authtoken, '--log', 'stdout'];
    console.log('Spawning ngrok:', ngrokBinaryPath, ngrokArgs);

    const ngrokProcess = spawn(ngrokBinaryPath, ngrokArgs, {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    const url = await new Promise((resolve, reject) => {
      let output = '';

      ngrokProcess.stdout.on('data', (data) => {
        output += data.toString();
        console.log('[Ngrok stdout]', data.toString().trim());

        // Look for the tunnel URL in the output
        const urlMatch = output.match(/url=([^\s]+)/);
        if (urlMatch) {
          resolve(urlMatch[1]);
        }
      });

      ngrokProcess.stderr.on('data', (data) => {
        console.log('[Ngrok stderr]', data.toString().trim());
      });

      ngrokProcess.on('error', (error) => {
        console.error('[Ngrok process error]', error);
        reject(error);
      });

      // Timeout after 10 seconds
      setTimeout(() => reject(new Error('Ngrok startup timeout')), 10000);
    });
    console.log('Ngrok tunnel URL:', url);

    cachedNgrokUrl = url;

    return NextResponse.json({
      url,
      cached: false
    });
  } catch (error: any) {
    console.error('Error starting ngrok:', error);
    console.error('Error body:', error.body);
    console.error('Error response:', error.response?.statusCode, error.response?.statusMessage);
    return NextResponse.json(
      { error: 'Failed to start ngrok tunnel', details: error.message, body: error.body },
      { status: 500 }
    );
  }
}

// Cleanup function
export async function cleanup() {
  if (cachedNgrokUrl) {
    await ngrok.disconnect();
    cachedNgrokUrl = null;
  }
}
