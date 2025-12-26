import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { accessSync } from 'fs';
import { join } from 'path';

// Cache ngrok URL to avoid spawning multiple processes
let cachedNgrokUrl: string | null = null;
let ngrokProcess: any = null;

export async function GET() {
  try {
    // Return cached URL if available
    if (cachedNgrokUrl) {
      return NextResponse.json({
        url: cachedNgrokUrl,
        cached: true
      });
    }

    // Start ngrok tunnel
    const ngrokUrl = await startNgrokTunnel();
    cachedNgrokUrl = ngrokUrl;

    return NextResponse.json({
      url: ngrokUrl,
      cached: false
    });
  } catch (error: any) {
    console.error('Error starting ngrok:', error);
    return NextResponse.json(
      { error: 'Failed to start ngrok tunnel', details: error.message },
      { status: 500 }
    );
  }
}

async function startNgrokTunnel(): Promise<string> {
  return new Promise((resolve, reject) => {
    // Try to find ngrok executable
    const possiblePaths = [
      join(process.cwd(), 'bin', 'ngrok'),
      join(process.cwd(), 'ngrok'),
      '/usr/local/bin/ngrok',
      '/opt/homebrew/bin/ngrok',
    ];

    const ngrokPath = possiblePaths.find(path => {
      try {
        accessSync(path);
        return true;
      } catch {
        return;
      }
    });

    if (!ngrokPath) {
      reject(new Error('ngrok executable not found. Please install ngrok and ensure it\'s in the project bin directory or system PATH.'));
      return;
    }

    console.log('Starting ngrok tunnel for port 3004...');
    
    // Start ngrok tunnel for WebSocket service (port 3004)
    const process = spawn(ngrokPath, ['http', '3004', '--log=stdout']);

    ngrokProcess = process;

    let urlFound = false;
    let output = '';

    // Capture stdout to find the tunnel URL
    process.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log('[ngrok]', text);

      // Look for URL in ngrok output
      const urlMatch = text.match(/https?:\/\/[a-zA-Z0-9\-.]+\.ngrok(-free)?\.app/);
      if (urlMatch && !urlFound) {
        urlFound = true;
        const url = urlMatch[0];
        console.log('Ngrok tunnel URL:', url);
        resolve(url);
      }
    });

    process.stderr.on('data', (data) => {
      const text = data.toString();
      console.error('[ngrok stderr]', text);

      // Also try to find URL in stderr (some versions output there)
      const urlMatch = text.match(/https?:\/\/[a-zA-Z0-9\-.]+\.ngrok(-free)?\.app/);
      if (urlMatch && !urlFound) {
        urlFound = true;
        const url = urlMatch[0];
        console.log('Ngrok tunnel URL (from stderr):', url);
        resolve(url);
      }
    });

    process.on('error', (error) => {
      console.error('ngrok process error:', error);
      if (!urlFound) {
        reject(error);
      }
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      if (!urlFound) {
        process.kill();
        reject(new Error('Timeout waiting for ngrok URL'));
      }
    }, 30000);
  });
}

// Cleanup function
export async function cleanup() {
  if (ngrokProcess) {
    ngrokProcess.kill();
    ngrokProcess = null;
    cachedNgrokUrl = null;
  }
}
