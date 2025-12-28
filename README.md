# IPA Scrabble

Play Scrabble with the International Phonetic Alphabet.

## Setup

```bash
npm install
```

### Ngrok (for multiplayer)

To host games for remote players, you need a free ngrok account:

1. Sign up at https://dashboard.ngrok.com (free)
2. Copy your authtoken from the dashboard
3. When you click "Host a Game" in the app, you'll be prompted to paste your authtoken

## Running

Start both the Next.js frontend and game service:

```bash
# Terminal 1: Start the game service
npx tsx mini-services/scrabble-game-service/index.ts

# Terminal 2: Start the frontend
npm run dev
```

Then open http://localhost:3000
