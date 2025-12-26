export interface Player {
  id: string;
  name: string;
  score: number;
  tiles: IPATile[];
  isHost: boolean;
}

export interface IPATile {
  id: string;
  char: string;
  type: 'consonant' | 'vowel' | 'affricate' | 'modifier';
  description: string;
  points: number;
}

export interface PlacedTile {
  tile: IPATile;
  row: number;
  col: number;
}

export interface BoardCell {
  row: number;
  col: number;
  tile: IPATile | null;
  type: 'normal' | 'double-letter' | 'triple-letter' | 'double-word' | 'triple-word' | 'center';
}

export interface GameState {
  board: BoardCell[][];
  players: Player[];
  currentPlayerIndex: number;
  tileBag: IPATile[];
  gameStarted: boolean;
  gameOver: boolean;
  winner: Player | null;
  lastMove: PlacedTile[] | null;
  moveHistory: {
    playerIndex: number;
    tiles: PlacedTile[];
    score: number;
    words: string[];
  }[];
}

export type GameEvent =
  | { type: 'GAME_START'; gameState: GameState }
  | { type: 'PLAYER_JOIN'; player: Player }
  | { type: 'PLAYER_READY'; playerId: string }
  | { type: 'MAKE_MOVE'; playerId: string; tiles: PlacedTile[] }
  | { type: 'MOVE_VALIDATED'; isValid: boolean; score: number; words: string[]; error?: string }
  | { type: 'GAME_UPDATE'; gameState: GameState }
  | { type: 'GAME_OVER'; winner: Player }
  | { type: 'PASS_TURN'; playerId: string }
  | { type: 'EXCHANGE_TILES'; playerId: string; count: number }
  | { type: 'CHALLENGE'; challengerId: string; targetPlayerId: string }
  | { type: 'EASTER_EGG'; effect: string; data: any };

// Bonus squares layout (15x15)
// TW = Triple Word, DW = Double Word, TL = Triple Letter, DL = Double Letter
export const BONUS_SQUARES: Record<string, 'TW' | 'DW' | 'TL' | 'DL' | 'center'> = {
  // Triple Word squares
  '0,0': 'TW', '0,7': 'TW', '0,14': 'TW',
  '7,0': 'TW', '7,14': 'TW',
  '14,0': 'TW', '14,7': 'TW', '14,14': 'TW',

  // Double Word squares
  '1,1': 'DW', '2,2': 'DW', '3,3': 'DW', '4,4': 'DW',
  '1,13': 'DW', '2,12': 'DW', '3,11': 'DW', '4,10': 'DW',
  '10,4': 'DW', '11,3': 'DW', '12,2': 'DW', '13,1': 'DW',
  '10,10': 'DW', '11,11': 'DW', '12,12': 'DW', '13,13': 'DW',

  // Triple Letter squares
  '1,5': 'TL', '1,9': 'TL',
  '5,1': 'TL', '5,5': 'TL', '5,9': 'TL', '5,13': 'TL',
  '9,1': 'TL', '9,5': 'TL', '9,9': 'TL', '9,13': 'TL',
  '13,5': 'TL', '13,9': 'TL',

  // Double Letter squares
  '0,3': 'DL', '0,11': 'DL',
  '2,6': 'DL', '2,8': 'DL',
  '3,0': 'DL', '3,7': 'DL', '3,14': 'DL',
  '6,2': 'DL', '6,6': 'DL', '6,8': 'DL', '6,12': 'DL',
  '7,3': 'DL', '7,11': 'DL',
  '8,2': 'DL', '8,6': 'DL', '8,8': 'DL', '8,12': 'DL',
  '11,0': 'DL', '11,7': 'DL', '11,14': 'DL',
  '12,6': 'DL', '12,8': 'DL',
  '14,3': 'DL', '14,11': 'DL',

  // Center star (first move gets double word)
  '7,7': 'center',
};

export function createEmptyBoard(): BoardCell[][] {
  const board: BoardCell[][] = [];
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

export function generateTileId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function createEmptyGame(): GameState {
  return {
    board: createEmptyBoard(),
    players: [],
    currentPlayerIndex: 0,
    tileBag: [],
    gameStarted: false,
    gameOver: false,
    winner: null,
    lastMove: null,
    moveHistory: []
  };
}
