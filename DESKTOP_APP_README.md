# IPA Scrabble Desktop App

Play Scrabble with the International Phonetic Alphabet! 🗣️

## Features

- ✅ **Two-player multiplayer** - Play against a friend on different computers
- 🌐 **Remote play with ngrok** - No cloud resources needed, just your computers
- 🔤 **40+ IPA tiles** - Including consonants, vowels, affricates, and modifiers
- 📊 **Phoneme-based scoring** - Points based on phoneme frequency
- 🎯 **Word validation** - Uses CMUdict with 135,000+ pronunciations
- 🎨 **Beautiful UI** - Built with Next.js, Tailwind CSS, and shadcn/ui
- 🎮 **Easter eggs** - Linguistics jokes and fun animations
- 💻 **Native desktop app** - Packaged with Electron for Mac

## Development

### Prerequisites

- **Bun** (recommended) or Node.js 18+
- **Ngrok** (for remote play) - Install from https://ngrok.com/download

### Setup

```bash
# Install dependencies
bun install

# Download and process CMUdict for word validation
bun run scripts/download-cmudict.ts

# Optional: Download ngrok to project bin directory
bun run scripts/setup-ngrok.js

# Start development server
bun run dev
```

The app will be available at http://localhost:3000

### Starting Services

For multiplayer, you need to start the WebSocket service:

```bash
# Start Scrabble WebSocket service (runs on port 3004)
cd mini-services/scrabble-game-service
bun run dev
```

### Starting ngrok (Optional)

For remote play across different WiFi networks:

```bash
# If you have ngrok installed globally
ngrok http 3004

# Or if you downloaded to project bin directory
./bin/ngrok http 3004
```

The app has a built-in ngrok integration - click "Host a Game" to start automatically!

## Building for Production

### Build Next.js App

```bash
bun run build
```

### Build Electron Desktop App

```bash
# Install Electron dependencies (first time only)
bun install --dev

# Build Electron app
bun run build:electron
```

The built app will be in `dist/electron/`:

- `IPA Scrabble-1.0.0-arm64.dmg` - For Apple Silicon Macs
- `IPA Scrabble-1.0.0-x64.dmg` - For Intel Macs
- `IPA Scrabble-1.0.0-arm64.zip` - For distribution
- `IPA Scrabble-1.0.0-x64.zip` - For distribution

### Installing the App

1. Open the `.dmg` file
2. Drag "IPA Scrabble" to your Applications folder
3. Launch from Applications

**Note:** macOS may show a security warning on first launch. Right-click the app and select "Open" to bypass.

## How to Play

### Hosting a Game

1. Launch IPA Scrabble
2. Enter your name
3. Click "Host a Game"
4. ngrok will automatically start (or use your own)
5. Share the invite link or code with your friend

### Joining a Game

1. Launch IPA Scrabble
2. Enter your name
3. Enter the invite code your friend shared
4. Click "Join Game"

### Gameplay

- Click tiles in your rack to select them
- Click board cells to place tiles
- Click "Play Move" to submit your turn
- Tiles must form valid words (validated against CMUdict)
- Use bonus squares (DL, TL, DW, TW) for extra points!

## Easter Eggs 🎉

Play special words to trigger fun effects:

- **Wug** 🐛 - Classic linguistics reference! Watch them fall from the sky!
- **Chomsky** 🧠 - "Colorless green ideas sleep furiously"
- **Piaget** 🎭 - Cognitive development fireworks!
- **Hjelmslev** ✨ - Structural brilliance sparkles!
- **Saussure** 💎 - Signifier and signified glow!

## Game Statistics

At the end of each game, see linguistics-themed stats:

- Most fricatives used
- Most plosives played
- Nasal count
- Vowel variety
- Affricate mastery
- Phoneme diversity
- And more!

## Architecture

### Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui
- **Real-time**: Socket.io, WebSocket
- **Desktop**: Electron 30
- **Word Validation**: CMUdict (processed offline)
- **State Management**: React hooks, context

### Project Structure

```
├── electron/              # Electron main process
│   ├── main.ts          # Electron entry point
│   ├── preload.js        # Context bridge
│   └── tsconfig.json    # TypeScript config
├── mini-services/        # Background services
│   └── scrabble-game-service/  # WebSocket game server
├── public/              # Static assets
│   └── data/           # CMUdict data
├── scripts/             # Build/setup scripts
├── src/                 # Next.js app source
│   ├── app/            # App Router pages
│   ├── components/      # React components
│   └── lib/            # Utilities & game logic
└── package.json         # Dependencies & scripts
```

## Troubleshooting

### ngrok Issues

- **"ngrok not found"**: Download ngrok from https://ngrok.com/download and place in `bin/` directory
- **Tunnel fails**: Check port 3004 is not in use
- **Free tier limits**: ngrok free tier has URL changes and connection limits

### Game Connection Issues

- **Can't connect**: Ensure both players have the game open
- **Disconnected**: Check internet connection; ngrok requires internet
- **Port conflicts**: Ensure port 3004 is available

### Build Issues

- **TypeScript errors**: Run `bun run lint` to check
- **Electron build fails**: Ensure all dependencies installed
- **App won't launch**: Check macOS security settings

## License

This project is for educational purposes.

## Credits

- **CMUdict** - Carnegie Mellon University Pronouncing Dictionary
- **shadcn/ui** - Beautiful UI components
- **IPA** - International Phonetic Alphabet
