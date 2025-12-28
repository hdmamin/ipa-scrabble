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
    const url = await ngrok.connect({
      addr: 3004,
      authtoken
      // Remove binPath to let ngrok find its own binary
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
