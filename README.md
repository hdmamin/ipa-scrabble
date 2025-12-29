# IPA Scrabble

Play Scrabble with the International Phonetic Alphabet.

## System Requirements

- **macOS 11.0 (Big Sur) or later**
- Intel or Apple Silicon Mac (M1/M2/M3)
- Internet connection for multiplayer games
- Ngrok account (free) for hosting multiplayer games

**Note**: macOS 10.13 and earlier are not supported due to Electron and ngrok binary requirements.

## Setup

```bash
npm install
```

### Ngrok (for multiplayer)

To host games for remote players, you need a free ngrok account:

1. Sign up at https://dashboard.ngrok.com (free)
2. Copy your authtoken from the dashboard
3. When you click "Host a Game" in the app, you'll be prompted to paste your authtoken

#### Troubleshooting Multiplayer

If ngrok fails to start:
- **VPN issues**: Disconnect your VPN temporarily - VPNs often block ngrok tunnels
- **Firewall**: Check your firewall settings allow ngrok connections
- **Network**: Ensure you have a stable internet connection

## Running

Start both the Next.js frontend and game service:

```bash
# Terminal 1: Start the game service
npx tsx mini-services/scrabble-game-service/index.ts

# Terminal 2: Start the frontend
npm run dev
```

Then open http://localhost:3000

## Building the Desktop App

```bash
npm run build:all
```

This creates distributable files in `dist/electron/`:
- `IPA Scrabble-x.x.x-mac.zip` - Intel Macs
- `IPA Scrabble-x.x.x-arm64-mac.zip` - Apple Silicon Macs (M1/M2/M3)

## Publishing a Release

```bash
gh release create v0.0.1 "dist/electron/IPA Scrabble-1.0.0-mac.zip" "dist/electron/IPA Scrabble-1.0.0-arm64-mac.zip" --title "IPA Scrabble v0.0.1" --notes "Release notes here"
```
