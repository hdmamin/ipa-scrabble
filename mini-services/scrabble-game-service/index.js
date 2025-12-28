import { createServer } from 'http';
import { Server } from 'socket.io';
const httpServer = createServer();
const io = new Server(httpServer, {
    // DO NOT change the path, it is used by Caddy to forward the request to the correct port
    path: '/',
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    pingTimeout: 60000,
    pingInterval: 25000,
});
const gameRooms = new Map();
// IPA Tiles definition (same as client)
const IPA_TILES = [
    // Very common consonants (1 point)
    { char: 'n', type: 'consonant', description: 'alveolar nasal', points: 1 },
    { char: 't', type: 'consonant', description: 'voiceless alveolar plosive', points: 1 },
    { char: 's', type: 'consonant', description: 'voiceless alveolar fricative', points: 1 },
    // Common consonants (2 points)
    { char: 'm', type: 'consonant', description: 'bilabial nasal', points: 2 },
    { char: 'l', type: 'consonant', description: 'lateral approximant', points: 2 },
    { char: 'k', type: 'consonant', description: 'voiceless velar plosive', points: 2 },
    { char: 'r', type: 'consonant', description: 'alveolar trill', points: 2 },
    // Mid-frequency consonants (3 points)
    { char: 'p', type: 'consonant', description: 'voiceless bilabial plosive', points: 3 },
    { char: 'b', type: 'consonant', description: 'voiced bilabial plosive', points: 3 },
    { char: 'd', type: 'consonant', description: 'voiced alveolar plosive', points: 3 },
    { char: 'g', type: 'consonant', description: 'voiced velar plosive', points: 3 },
    { char: 'f', type: 'consonant', description: 'voiceless labiodental fricative', points: 3 },
    { char: 'h', type: 'consonant', description: 'glottal fricative', points: 3 },
    // Less common consonants (4-5 points)
    { char: 'v', type: 'consonant', description: 'voiced labiodental fricative', points: 4 },
    { char: 'z', type: 'consonant', description: 'voiced alveolar fricative', points: 4 },
    { char: 'j', type: 'consonant', description: 'palatal approximant', points: 4 },
    { char: 'ʃ', type: 'consonant', description: 'voiceless postalveolar fricative', points: 4 },
    // Rare consonants and special sounds (5-6 points)
    { char: 'θ', type: 'consonant', description: 'voiceless dental fricative', points: 5 },
    { char: 'ð', type: 'consonant', description: 'voiced dental fricative', points: 5 },
    { char: 'ʒ', type: 'consonant', description: 'voiced postalveolar fricative', points: 5 },
    { char: 'ŋ', type: 'consonant', description: 'velar nasal', points: 5 },
    { char: 'ʔ', type: 'consonant', description: 'glottal stop', points: 6 },
    { char: 'ɾ', type: 'consonant', description: 'alveolar tap', points: 5 },
    // Affricates (7-8 points - very rare)
    { char: 't͡s', type: 'affricate', description: 'alveolar affricate', points: 7 },
    { char: 'd͡z', type: 'affricate', description: 'alveolar affricate', points: 7 },
    { char: 't͡ʃ', type: 'affricate', description: 'postalveolar affricate', points: 8 },
    { char: 'd͡ʒ', type: 'affricate', description: 'postalveolar affricate', points: 8 },
    // Common vowels (1-2 points)
    { char: 'ə', type: 'vowel', description: 'mid central (schwa)', points: 1 },
    { char: 'i', type: 'vowel', description: 'close front', points: 1 },
    { char: 'ɪ', type: 'vowel', description: 'near-close front', points: 1 },
    { char: 'a', type: 'vowel', description: 'open front', points: 2 },
    // Mid-frequency vowels (2-3 points)
    { char: 'e', type: 'vowel', description: 'close-mid front', points: 2 },
    { char: 'ɛ', type: 'vowel', description: 'open-mid front', points: 2 },
    { char: 'æ', type: 'vowel', description: 'near-open front', points: 3 },
    { char: 'u', type: 'vowel', description: 'close back', points: 2 },
    { char: 'o', type: 'vowel', description: 'close-mid back', points: 2 },
    // Less common vowels (3-4 points)
    { char: 'ɑ', type: 'vowel', description: 'open back', points: 3 },
    { char: 'ɔ', type: 'vowel', description: 'open-mid back', points: 3 },
    { char: 'ɜ', type: 'vowel', description: 'open-mid central', points: 4 },
    // Modifiers - special tiles (0-2 points)
    { char: 'ˈ', type: 'modifier', description: 'primary stress', points: 0 },
    { char: 'ˌ', type: 'modifier', description: 'secondary stress', points: 0 },
    { char: 'ː', type: 'modifier', description: 'long', points: 0 },
    { char: '̃', type: 'modifier', description: 'nasalization', points: 0 },
];
function createTileBag() {
    const bag = [];
    const tileCounts = {
        'n': 6, 't': 6, 's': 4, 'm': 4, 'l': 4, 'k': 3, 'r': 3,
        'p': 2, 'b': 2, 'd': 2, 'g': 2, 'f': 2, 'h': 2, 'v': 2, 'z': 2, 'j': 2, 'ʃ': 2,
        'θ': 1, 'ð': 1, 'ʒ': 1, 'ŋ': 1, 'ʔ': 1, 'ɾ': 1,
        't͡s': 1, 'd͡z': 1, 't͡ʃ': 1, 'd͡ʒ': 1,
        'ə': 5, 'i': 4, 'ɪ': 4, 'a': 4, 'e': 3, 'ɛ': 3, 'æ': 2, 'u': 3, 'o': 3, 'ɑ': 2, 'ɔ': 2, 'ɜ': 1,
        'ˈ': 2, 'ˌ': 2, 'ː': 2, '̃': 2,
    };
    for (const tile of IPA_TILES) {
        const count = tileCounts[tile.char] || 1;
        for (let i = 0; i < count; i++) {
            bag.push({
                ...tile,
                id: Math.random().toString(36).substr(2, 9)
            });
        }
    }
    // Fisher-Yates shuffle
    for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    return bag;
}
// Bonus squares layout
const BONUS_SQUARES = {
    '0,0': 'TW', '0,7': 'TW', '0,14': 'TW',
    '7,0': 'TW', '7,14': 'TW',
    '14,0': 'TW', '14,7': 'TW', '14,14': 'TW',
    '1,1': 'DW', '2,2': 'DW', '3,3': 'DW', '4,4': 'DW',
    '1,13': 'DW', '2,12': 'DW', '3,11': 'DW', '4,10': 'DW',
    '10,4': 'DW', '11,3': 'DW', '12,2': 'DW', '13,1': 'DW',
    '10,10': 'DW', '11,11': 'DW', '12,12': 'DW', '13,13': 'DW',
    '1,5': 'TL', '1,9': 'TL',
    '5,1': 'TL', '5,5': 'TL', '5,9': 'TL', '5,13': 'TL',
    '9,1': 'TL', '9,5': 'TL', '9,9': 'TL', '9,13': 'TL',
    '13,5': 'TL', '13,9': 'TL',
    '0,3': 'DL', '0,11': 'DL',
    '2,6': 'DL', '2,8': 'DL',
    '3,0': 'DL', '3,7': 'DL', '3,14': 'DL',
    '6,2': 'DL', '6,6': 'DL', '6,8': 'DL', '6,12': 'DL',
    '7,3': 'DL', '7,11': 'DL',
    '8,2': 'DL', '8,6': 'DL', '8,8': 'DL', '8,12': 'DL',
    '11,0': 'DL', '11,7': 'DL', '11,14': 'DL',
    '12,6': 'DL', '12,8': 'DL',
    '14,3': 'DL', '14,11': 'DL',
    '7,7': 'center',
};
function createEmptyBoard() {
    const board = [];
    for (let row = 0; row < 15; row++) {
        board[row] = [];
        for (let col = 0; col < 15; col++) {
            const key = `${row},${col}`;
            const bonusType = BONUS_SQUARES[key] || 'normal';
            board[row][col] = {
                row,
                col,
                tile: null,
                type: bonusType
            };
        }
    }
    return board;
}
function getGameState(room) {
    const players = Array.from(room.players.values());
    return {
        board: room.board,
        players: players.map(p => ({
            ...p,
            tiles: p.tiles.map(t => ({ ...t }))
        })),
        currentPlayerIndex: room.currentPlayerIndex,
        tileBag: room.tileBag,
        gameStarted: room.gameStarted,
        gameOver: false,
        winner: null,
        lastMove: null,
        moveHistory: room.moveHistory
    };
}
function drawTiles(tileBag, count) {
    const drawn = tileBag.splice(0, count);
    return { tiles: drawn, remaining: tileBag };
}
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    socket.on('create-room', (data) => {
        const { inviteCode, playerName } = data;
        if (gameRooms.has(inviteCode)) {
            socket.emit('error', { message: 'Room with this invite code already exists' });
            return;
        }
        const room = {
            id: Math.random().toString(36).substr(2, 9),
            inviteCode,
            players: new Map(),
            board: createEmptyBoard(),
            tileBag: createTileBag(),
            currentPlayerIndex: 0,
            gameStarted: false,
            moveHistory: []
        };
        const player = {
            id: socket.id,
            name: playerName,
            score: 0,
            tiles: [],
            isHost: true
        };
        room.players.set(socket.id, player);
        socket.join(inviteCode);
        gameRooms.set(inviteCode, room);
        socket.emit('room-created', {
            inviteCode,
            playerId: socket.id,
            gameState: getGameState(room)
        });
        console.log(`Room created: ${inviteCode} by ${playerName}`);
    });
    socket.on('join-room', (data) => {
        const { inviteCode, playerName } = data;
        const room = gameRooms.get(inviteCode);
        if (!room) {
            socket.emit('error', { message: 'Room not found' });
            return;
        }
        if (room.players.size >= 2) {
            socket.emit('error', { message: 'Room is full' });
            return;
        }
        const player = {
            id: socket.id,
            name: playerName,
            score: 0,
            tiles: [],
            isHost: false
        };
        room.players.set(socket.id, player);
        socket.join(inviteCode);
        // Start game when second player joins
        if (room.players.size === 2) {
            // Deal tiles to each player
            for (const [playerId, p] of room.players) {
                const { tiles, remaining } = drawTiles(room.tileBag, 7);
                p.tiles = tiles;
                room.tileBag = remaining;
            }
            room.gameStarted = true;
            io.to(inviteCode).emit('game-started', {
                gameState: getGameState(room)
            });
            console.log(`Game started in room: ${inviteCode}`);
        }
        else {
            socket.emit('room-joined', {
                inviteCode,
                playerId: socket.id,
                gameState: getGameState(room)
            });
        }
    });
    socket.on('make-move', (data) => {
        const { inviteCode, tiles } = data;
        const room = gameRooms.get(inviteCode);
        if (!room) {
            socket.emit('error', { message: 'Room not found' });
            return;
        }
        const player = room.players.get(socket.id);
        if (!player) {
            socket.emit('error', { message: 'Player not found' });
            return;
        }
        if (room.currentPlayerIndex !== Array.from(room.players.keys()).indexOf(socket.id)) {
            socket.emit('error', { message: 'Not your turn' });
            return;
        }
        // Place tiles on board
        for (const placedTile of tiles) {
            const tileFromRack = player.tiles.find(t => t.id === placedTile.tileId);
            if (!tileFromRack)
                continue;
            room.board[placedTile.row][placedTile.col].tile = tileFromRack;
            player.tiles = player.tiles.filter(t => t.id !== placedTile.tileId);
        }
        // Draw new tiles
        const tilesToDraw = Math.min(7 - player.tiles.length, room.tileBag.length);
        if (tilesToDraw > 0) {
            const { tiles: newTiles, remaining } = drawTiles(room.tileBag, tilesToDraw);
            player.tiles = [...player.tiles, ...newTiles];
            room.tileBag = remaining;
        }
        // Calculate score (simplified - just tile points for now)
        let score = 0;
        const placedWords = [];
        for (const placedTile of tiles) {
            const cell = room.board[placedTile.row][placedTile.col];
            if (cell.tile) {
                score += cell.tile.points;
                placedWords.push(cell.tile.char);
            }
        }
        player.score += score;
        // Record move
        room.moveHistory.push({
            playerIndex: room.currentPlayerIndex,
            tiles: tiles.map(t => ({ ...t })),
            score,
            words: placedWords
        });
        // Switch to next player
        room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.size;
        // Broadcast game update
        io.to(inviteCode).emit('game-updated', {
            gameState: getGameState(room)
        });
        console.log(`Move made by ${player.name} in room ${inviteCode}, score: ${score}`);
    });
    socket.on('pass-turn', (data) => {
        const { inviteCode } = data;
        const room = gameRooms.get(inviteCode);
        if (!room)
            return;
        room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.size;
        io.to(inviteCode).emit('game-updated', {
            gameState: getGameState(room)
        });
        console.log(`${socket.id} passed turn in room ${inviteCode}`);
    });
    socket.on('disconnect', () => {
        // Find and clean up rooms
        for (const [inviteCode, room] of gameRooms.entries()) {
            if (room.players.has(socket.id)) {
                room.players.delete(socket.id);
                if (room.players.size === 0) {
                    gameRooms.delete(inviteCode);
                    console.log(`Room deleted: ${inviteCode}`);
                }
                else {
                    // Notify remaining players
                    io.to(inviteCode).emit('player-disconnected', { playerId: socket.id });
                }
                break;
            }
        }
        console.log(`User disconnected: ${socket.id}`);
    });
});
const PORT = 3004;
httpServer.listen(PORT, () => {
    console.log(`Scrabble game service running on port ${PORT}`);
});
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Received SIGTERM signal, shutting down server...');
    httpServer.close(() => {
        console.log('Scrabble game service closed');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    console.log('Received SIGINT signal, shutting down server...');
    httpServer.close(() => {
        console.log('Scrabble game service closed');
        process.exit(0);
    });
});
