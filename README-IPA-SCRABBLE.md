# IPA Scrabble

A multiplayer desktop application for playing Scrabble with the International Phonetic Alphabet (IPA). Play against friends across different networks without any cloud resources - everything runs locally on your computers!

## Features

### 🎮 Core Gameplay
- **Real-time multiplayer** - Play against a friend anywhere using WebSocket communication
- **Full IPA tile set** - 40 unique phonetic tiles including consonants, vowels, affricates, and modifiers
- **Standard Scrabble board** - 15x15 grid with all bonus squares (Double/Triple Letter & Word)
- **Smart scoring** - Point values based on phoneme frequency in English
- **Word validation** - Uses CMUdict to validate IPA pronunciations against real English words
- **Turn-based play** - Classic Scrabble gameplay with pass, exchange, and challenge options

### 🎨 Linguistics Theme
- **Linguist-named invite codes** - Generate codes like "chomsky-saussure-a3b7"
- **Fun linguistics facts** - Random tidbits about phonetics and language
- **Phoneme type indicators** - Color-coded tiles showing consonants, vowels, affricates, and modifiers

### 🥚 Easter Eggs
- **Wug Test** - Play the word "wug" and watch the wugs rain! 🐛
- **Chomsky Approval** - Trigger "Colorless green ideas sleep furiously" reference
- **Cognitive Fireworks** - Jean Piaget celebration
- **Structural Sparkles** - Louis Hjelmslev glossematics tribute
- **Signifier Glow** - Ferdinand de Saussure sign/signifier homage

### 📊 Game Statistics
At game end, see fun linguistics stats:
- Fricative Fanatic (most fricatives used)
- Plosive Powerhouse (most plosives used)
- Nasal Navigator (most nasals used)
- Vowel Virtuoso (most vowels used)
- Affricate Ace (most affricates used)
- Phoneme Diversity (most unique phonemes)

## Getting Started

### Prerequisites
- Node.js 18+ or Bun runtime
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Running the Game

#### 1. Start the WebSocket Service

```bash
cd mini-services/scrabble-game-service
bun install
bun run dev
```

The WebSocket service will start on port 3004.

#### 2. Start the Next.js App

In a new terminal:

```bash
cd /home/z/my-project
bun run dev
```

The app will be available at http://localhost:3000

### Playing the Game

#### Hosting a Game
1. Open the app in your browser
2. Enter your name
3. Click "Host a Game"
4. Copy the invite code (e.g., "chomsky-saussure-a3b7")
5. Share the invite code with your friend

#### Joining a Game
1. Open the app in your browser
2. Enter your name
3. Paste the invite code
4. Click "Join Game"

#### Playing
- Click a tile from your rack to select it
- Click a cell on the board to place the tile
- Click "Play Move" when your word is complete
- The game validates words using the CMUdict pronunciation dictionary
- Pass your turn or exchange tiles if needed

## Technical Details

### Architecture
- **Frontend**: Next.js 15 with App Router, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui component library
- **Backend**: WebSocket service (Socket.io) running on port 3004
- **Data**: CMUdict pronunciation dictionary (7.44 MB, 135K words)

### Project Structure
```
/home/z/my-project/
├── src/
│   ├── app/
│   │   └── page.tsx              # Main game component
│   ├── components/
│   │   ├── scrabble-board.tsx     # 15x15 game board
│   │   ├── tile-rack.tsx         # Player tile display
│   │   ├── game-info.tsx         # Scores and game status
│   │   ├── game-stats-panel.tsx  # End-game statistics
│   │   └── easter-egg-display.tsx # Easter egg effects
│   └── lib/
│       ├── ipa-tiles.ts          # IPA tile definitions
│       ├── game-types.ts         # Game state interfaces
│       ├── word-validation.ts    # CMUdict validation
│       └── scoring.ts            # Scoring logic
├── mini-services/
│   └── scrabble-game-service/
│       └── index.ts              # WebSocket server
├── public/
│   └── data/
│       └── cmudict-ipa.json      # Pronunciation dictionary
└── scripts/
    └── download-cmudict.ts      # Dictionary processor
```

### IPA Tiles

#### Point Values
- **1-2 points**: Common vowels (ə, i, ɪ, a)
- **2-4 points**: Mid-frequency consonants (n, t, s, m, l, k, r, etc.)
- **5-6 points**: Rare consonants (θ, ð, ʒ, ŋ, ʔ, ɾ)
- **7-8 points**: Affricates (t͡s, d͡z, t͡ʃ, d͡ʒ)
- **0 points**: Modifiers (ˈ, ˌ, ː, ̃) - used as powerups

#### Tile Distribution
- Total tiles: ~120
- Each player starts with 7 tiles
- Tiles are drawn from shuffled bag throughout game

## Development

### Running Linting
```bash
bun run lint
```

### Regenerating CMUdict
If you need to re-download and process the pronunciation dictionary:
```bash
bun run scripts/download-cmudict.ts
```

## Future Enhancements

### Planned Features
- [ ] ngrok integration for cross-network play
- [ ] Electron packaging for Mac desktop app
- [ ] AI opponent (single-player mode)
- [ ] Additional dictionaries (British English, other languages)
- [ ] Replay functionality
- [ ] Save/load games
- [ ] Custom word lists
- [ ] Tutorial mode for IPA beginners

### Known Limitations
- Currently only supports American English pronunciations (CMUdict)
- No cloud resources required (players must be able to connect via WebSocket)
- Game rooms are limited to 2 players
- No spectator mode

## License

This project uses the CMUdict pronunciation dictionary, which is licensed under the CMU Public License.

## Credits

- **CMUdict**: Carnegie Mellon University Speech Group
- **Socket.io**: Real-time bidirectional event-based communication
- **Next.js**: The React Framework for production
- **shadcn/ui**: Beautifully designed components
- **Framer Motion**: Production-ready motion library

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## Fun Facts

- The IPA has 107 letters and 52 diacritics
- The most common sound in human languages is /a/
- Ubykh had 84 consonants but only 2 vowels (now extinct)
- The click languages (Khoisan) use consonants found nowhere else
- The schwa /ə/ is the most common vowel sound in English
