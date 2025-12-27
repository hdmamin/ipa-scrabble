import { NextResponse } from 'next/server';
import ngrok from 'ngrok';
import { join } from 'path';

// Cache ngrok URL to avoid spawning multiple processes
let cachedNgrokUrl: string | null = null;

export async function GET() {
  try {
    // Return cached URL if available
    if (cachedNgrokUrl) {
      return NextResponse.json({
        url: cachedNgrokUrl,
        cached: true
      });
    }

    // Start ngrok tunnel for port 3004 (game service)
    console.log('Starting ngrok tunnel for port 3004...');
    const url = await ngrok.connect({
      addr: 3004,
      binPath: () => join(process.cwd(), 'node_modules', 'ngrok', 'bin')
    });
    console.log('Ngrok tunnel URL:', url);

    cachedNgrokUrl = url;

    return NextResponse.json({
      url,
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

// Cleanup function
export async function cleanup() {
  if (cachedNgrokUrl) {
    await ngrok.disconnect();
    cachedNgrokUrl = null;
  }
}
