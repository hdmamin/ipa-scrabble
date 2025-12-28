"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var socket_io_1 = require("socket.io");
var httpServer = (0, http_1.createServer)();
var io = new socket_io_1.Server(httpServer, {
    // DO NOT change the path, it is used by Caddy to forward the request to the correct port
    path: '/',
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    pingTimeout: 60000,
    pingInterval: 25000,
});
var gameRooms = new Map();
// IPA Tiles definition (same as client)
var IPA_TILES = [
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
    var _a;
    var bag = [];
    var tileCounts = {
        'n': 6, 't': 6, 's': 4, 'm': 4, 'l': 4, 'k': 3, 'r': 3,
        'p': 2, 'b': 2, 'd': 2, 'g': 2, 'f': 2, 'h': 2, 'v': 2, 'z': 2, 'j': 2, 'ʃ': 2,
        'θ': 1, 'ð': 1, 'ʒ': 1, 'ŋ': 1, 'ʔ': 1, 'ɾ': 1,
        't͡s': 1, 'd͡z': 1, 't͡ʃ': 1, 'd͡ʒ': 1,
        'ə': 5, 'i': 4, 'ɪ': 4, 'a': 4, 'e': 3, 'ɛ': 3, 'æ': 2, 'u': 3, 'o': 3, 'ɑ': 2, 'ɔ': 2, 'ɜ': 1,
        'ˈ': 2, 'ˌ': 2, 'ː': 2, '̃': 2,
    };
    for (var _i = 0, IPA_TILES_1 = IPA_TILES; _i < IPA_TILES_1.length; _i++) {
        var tile = IPA_TILES_1[_i];
        var count = tileCounts[tile.char] || 1;
        for (var i = 0; i < count; i++) {
            bag.push(__assign(__assign({}, tile), { id: Math.random().toString(36).substr(2, 9) }));
        }
    }
    // Fisher-Yates shuffle
    for (var i = bag.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        _a = [bag[j], bag[i]], bag[i] = _a[0], bag[j] = _a[1];
    }
    return bag;
}
// Bonus squares layout
var BONUS_SQUARES = {
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
    var board = [];
    for (var row = 0; row < 15; row++) {
        board[row] = [];
        for (var col = 0; col < 15; col++) {
            var key = "".concat(row, ",").concat(col);
            var bonusType = BONUS_SQUARES[key] || 'normal';
            board[row][col] = {
                row: row,
                col: col,
                tile: null,
                type: bonusType
            };
        }
    }
    return board;
}
function getGameState(room) {
    var players = Array.from(room.players.values());
    return {
        board: room.board,
        players: players.map(function (p) { return (__assign(__assign({}, p), { tiles: p.tiles.map(function (t) { return (__assign({}, t)); }) })); }),
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
    var drawn = tileBag.splice(0, count);
    return { tiles: drawn, remaining: tileBag };
}
io.on('connection', function (socket) {
    console.log("User connected: ".concat(socket.id));
    socket.on('create-room', function (data) {
        var inviteCode = data.inviteCode, playerName = data.playerName;
        if (gameRooms.has(inviteCode)) {
            socket.emit('error', { message: 'Room with this invite code already exists' });
            return;
        }
        var room = {
            id: Math.random().toString(36).substr(2, 9),
            inviteCode: inviteCode,
            players: new Map(),
            board: createEmptyBoard(),
            tileBag: createTileBag(),
            currentPlayerIndex: 0,
            gameStarted: false,
            moveHistory: []
        };
        var player = {
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
            inviteCode: inviteCode,
            playerId: socket.id,
            gameState: getGameState(room)
        });
        console.log("Room created: ".concat(inviteCode, " by ").concat(playerName));
    });
    socket.on('join-room', function (data) {
        var inviteCode = data.inviteCode, playerName = data.playerName;
        var room = gameRooms.get(inviteCode);
        if (!room) {
            socket.emit('error', { message: 'Room not found' });
            return;
        }
        if (room.players.size >= 2) {
            socket.emit('error', { message: 'Room is full' });
            return;
        }
        var player = {
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
            for (var _i = 0, _a = room.players; _i < _a.length; _i++) {
                var _b = _a[_i], playerId = _b[0], p = _b[1];
                var _c = drawTiles(room.tileBag, 7), tiles = _c.tiles, remaining = _c.remaining;
                p.tiles = tiles;
                room.tileBag = remaining;
            }
            room.gameStarted = true;
            io.to(inviteCode).emit('game-started', {
                gameState: getGameState(room)
            });
            console.log("Game started in room: ".concat(inviteCode));
        }
        else {
            socket.emit('room-joined', {
                inviteCode: inviteCode,
                playerId: socket.id,
                gameState: getGameState(room)
            });
        }
    });
    socket.on('make-move', function (data) {
        var inviteCode = data.inviteCode, tiles = data.tiles;
        var room = gameRooms.get(inviteCode);
        if (!room) {
            socket.emit('error', { message: 'Room not found' });
            return;
        }
        var player = room.players.get(socket.id);
        if (!player) {
            socket.emit('error', { message: 'Player not found' });
            return;
        }
        if (room.currentPlayerIndex !== Array.from(room.players.keys()).indexOf(socket.id)) {
            socket.emit('error', { message: 'Not your turn' });
            return;
        }
        var _loop_1 = function (placedTile) {
            var tileFromRack = player.tiles.find(function (t) { return t.id === placedTile.tileId; });
            if (!tileFromRack)
                return "continue";
            room.board[placedTile.row][placedTile.col].tile = tileFromRack;
            player.tiles = player.tiles.filter(function (t) { return t.id !== placedTile.tileId; });
        };
        // Place tiles on board
        for (var _i = 0, tiles_1 = tiles; _i < tiles_1.length; _i++) {
            var placedTile = tiles_1[_i];
            _loop_1(placedTile);
        }
        // Draw new tiles
        var tilesToDraw = Math.min(7 - player.tiles.length, room.tileBag.length);
        if (tilesToDraw > 0) {
            var _a = drawTiles(room.tileBag, tilesToDraw), newTiles = _a.tiles, remaining = _a.remaining;
            player.tiles = __spreadArray(__spreadArray([], player.tiles, true), newTiles, true);
            room.tileBag = remaining;
        }
        // Calculate score (simplified - just tile points for now)
        var score = 0;
        var placedWords = [];
        for (var _b = 0, tiles_2 = tiles; _b < tiles_2.length; _b++) {
            var placedTile = tiles_2[_b];
            var cell = room.board[placedTile.row][placedTile.col];
            if (cell.tile) {
                score += cell.tile.points;
                placedWords.push(cell.tile.char);
            }
        }
        player.score += score;
        // Record move
        room.moveHistory.push({
            playerIndex: room.currentPlayerIndex,
            tiles: tiles.map(function (t) { return (__assign({}, t)); }),
            score: score,
            words: placedWords
        });
        // Switch to next player
        room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.size;
        // Broadcast game update
        io.to(inviteCode).emit('game-updated', {
            gameState: getGameState(room)
        });
        console.log("Move made by ".concat(player.name, " in room ").concat(inviteCode, ", score: ").concat(score));
    });
    socket.on('pass-turn', function (data) {
        var inviteCode = data.inviteCode;
        var room = gameRooms.get(inviteCode);
        if (!room)
            return;
        room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.size;
        io.to(inviteCode).emit('game-updated', {
            gameState: getGameState(room)
        });
        console.log("".concat(socket.id, " passed turn in room ").concat(inviteCode));
    });
    socket.on('disconnect', function () {
        // Find and clean up rooms
        for (var _i = 0, _a = gameRooms.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], inviteCode = _b[0], room = _b[1];
            if (room.players.has(socket.id)) {
                room.players.delete(socket.id);
                if (room.players.size === 0) {
                    gameRooms.delete(inviteCode);
                    console.log("Room deleted: ".concat(inviteCode));
                }
                else {
                    // Notify remaining players
                    io.to(inviteCode).emit('player-disconnected', { playerId: socket.id });
                }
                break;
            }
        }
        console.log("User disconnected: ".concat(socket.id));
    });
});
var PORT = 3004;
httpServer.listen(PORT, function () {
    console.log("Scrabble game service running on port ".concat(PORT));
});
// Graceful shutdown
process.on('SIGTERM', function () {
    console.log('Received SIGTERM signal, shutting down server...');
    httpServer.close(function () {
        console.log('Scrabble game service closed');
        process.exit(0);
    });
});
process.on('SIGINT', function () {
    console.log('Received SIGINT signal, shutting down server...');
    httpServer.close(function () {
        console.log('Scrabble game service closed');
        process.exit(0);
    });
});
