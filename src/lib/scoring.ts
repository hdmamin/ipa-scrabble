import { IPATile, BoardCell } from './game-types';
import { validateIPAWord } from './word-validation';

export interface ValidatedWord {
  word: string;
  score: number;
  cells: { row: number; col: number }[];
  englishWords: string[];
  isBonus: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  words: ValidatedWord[];
  totalScore: number;
  error?: string;
  easterEgg?: EasterEggTrigger;
}

export interface EasterEggTrigger {
  type: 'wug-rain' | 'chomsky-reaction' | 'cognitive-fireworks' | 'structural-sparkles' | 'signifier-glow';
  words: string[];
  englishWords: string[];
}

export interface WordPosition {
  row: number;
  col: number;
  direction: 'horizontal' | 'vertical';
}

/**
 * Calculate the score for a set of placed tiles with bonus squares
 */
export function calculateScore(
  board: BoardCell[][],
  placedTiles: { row: number; col: number; tile: IPATile }[]
): ValidationResult {
  if (placedTiles.length === 0) {
    return {
      isValid: false,
      words: [],
      totalScore: 0,
      error: 'No tiles placed'
    };
  }

  // Check if tiles are placed in a straight line
  const positions = placedTiles.map(t => ({ row: t.row, col: t.col }));
  const wordPositions = findWordPositions(positions);

  if (wordPositions.length === 0) {
    return {
      isValid: false,
      words: [],
      totalScore: 0,
      error: 'Tiles must form valid words (horizontal or vertical)'
    };
  }

  const allValidatedWords: ValidatedWord[] = [];
  let totalScore = 0;
  const allFormedWords: string[] = [];
  const allEnglishWords: string[] = [];

  // Find all words formed (main word + crosswords)
  for (const wordPos of wordPositions) {
    const formedWord = getFormedWord(board, wordPos);
    if (formedWord.length === 0) continue;

    // Check if all cells in the word have tiles
    const wordCells = getWordCells(board, wordPos);
    const hasEmptyCells = wordCells.some(cell => !cell.tile);
    if (hasEmptyCells) continue;

    // Get the IPA string
    const ipaString = wordCells.map(c => c.tile!.char).join('');

    // Validate the word
    const englishWords = validateIPAWord(ipaString);

    if (englishWords.length === 0) {
      return {
        isValid: false,
        words: [],
        totalScore: 0,
        error: `"${ipaString}" is not a valid word`
      };
    }

    // Calculate score for this word
    const wordScore = calculateWordScore(board, wordPos);

    allValidatedWords.push({
      word: ipaString,
      score: wordScore,
      cells: wordCells.map(c => ({ row: c.row, col: c.col })),
      englishWords,
      isBonus: false
    });

    totalScore += wordScore;
    allFormedWords.push(ipaString);
    allEnglishWords.push(...englishWords);
  }

  // Check for easter eggs
  const easterEgg = checkForEasterEggs(allFormedWords, allEnglishWords);

  return {
    isValid: true,
    words: allValidatedWords,
    totalScore,
    easterEgg
  };
}

/**
 * Find word positions from placed tiles
 */
function findWordPositions(positions: { row: number; col: number }[]): WordPosition[] {
  if (positions.length === 0) return [];

  const rows = positions.map(p => p.row);
  const cols = positions.map(p => p.col);

  const uniqueRows = [...new Set(rows)];
  const uniqueCols = [...new Set(cols)];

  const wordPositions: WordPosition[] = [];

  // Check if all tiles are in the same row (horizontal word)
  if (uniqueRows.length === 1 && uniqueCols.length > 1) {
    wordPositions.push({
      row: uniqueRows[0],
      col: Math.min(...cols),
      direction: 'horizontal'
    });

    // Check for vertical crosswords at each position
    for (const pos of positions) {
      if (hasVerticalWord(pos)) {
        wordPositions.push({
          row: getVerticalWordStart(pos),
          col: pos.col,
          direction: 'vertical'
        });
      }
    }
  }
  // Check if all tiles are in the same column (vertical word)
  else if (uniqueCols.length === 1 && uniqueRows.length > 1) {
    wordPositions.push({
      row: Math.min(...rows),
      col: uniqueCols[0],
      direction: 'vertical'
    });

    // Check for horizontal crosswords at each position
    for (const pos of positions) {
      if (hasHorizontalWord(pos)) {
        wordPositions.push({
          row: pos.row,
          col: getHorizontalWordStart(pos),
          direction: 'horizontal'
        });
      }
    }
  }

  return wordPositions;
}

/**
 * Get the full word at a position
 */
function getFormedWord(board: BoardCell[][], pos: WordPosition): string {
  const cells = getWordCells(board, pos);
  return cells.map(c => c.tile?.char || '').join('');
}

/**
 * Get all cells in a word
 */
function getWordCells(board: BoardCell[][], pos: WordPosition): BoardCell[] {
  const cells: BoardCell[] = [];
  const { row, col, direction } = pos;

  if (direction === 'horizontal') {
    let currentCol = col;
    while (currentCol < 15 && board[row][currentCol].tile) {
      cells.push(board[row][currentCol]);
      currentCol++;
    }
  } else {
    let currentRow = row;
    while (currentRow < 15 && board[currentRow][col].tile) {
      cells.push(board[currentRow][col]);
      currentRow++;
    }
  }

  return cells;
}

/**
 * Calculate score for a word considering bonus squares
 */
function calculateWordScore(board: BoardCell[][], pos: WordPosition): number {
  const cells = getWordCells(board, pos);
  let wordScore = 0;
  let wordMultiplier = 1;

  for (const cell of cells) {
    if (!cell.tile) continue;

    let tileScore = cell.tile.points;

    // Apply letter bonuses
    if (cell.type === 'double-letter') {
      tileScore *= 2;
    } else if (cell.type === 'triple-letter') {
      tileScore *= 3;
    }

    wordScore += tileScore;

    // Apply word bonuses (only apply once per word)
    if (cell.type === 'double-word') {
      wordMultiplier *= 2;
    } else if (cell.type === 'triple-word') {
      wordMultiplier *= 3;
    } else if (cell.type === 'center') {
      // Center star counts as double word
      wordMultiplier *= 2;
    }
  }

  return wordScore * wordMultiplier;
}

/**
 * Check if there's a vertical word at a position
 */
function hasVerticalWord(pos: { row: number; col: number }): boolean {
  // This is a simplified check - in full implementation, would check board state
  return false;
}

/**
 * Check if there's a horizontal word at a position
 */
function hasHorizontalWord(pos: { row: number; col: number }): boolean {
  // This is a simplified check - in full implementation, would check board state
  return false;
}

/**
 * Get start row of vertical word
 */
function getVerticalWordStart(pos: { row: number; col: number }): number {
  return pos.row;
}

/**
 * Get start column of horizontal word
 */
function getHorizontalWordStart(pos: { row: number; col: number }): number {
  return pos.col;
}

/**
 * Check for easter egg triggers based on formed words
 */
function checkForEasterEggs(ipaWords: string[], englishWords: string[]): EasterEggTrigger | undefined {
  const allEnglish = englishWords.map(w => w.toLowerCase());

  // Wug test easter egg
  if (allEnglish.includes('wug')) {
    return {
      type: 'wug-rain',
      words: ipaWords,
      englishWords
    };
  }

  // Chomsky easter egg
  if (allEnglish.some(w => w.includes('chomsky'))) {
    return {
      type: 'chomsky-reaction',
      words: ipaWords,
      englishWords
    };
  }

  // Jean Piaget easter egg
  if (allEnglish.some(w => w.includes('piaget'))) {
    return {
      type: 'cognitive-fireworks',
      words: ipaWords,
      englishWords
    };
  }

  // Louis Hjelmslev easter egg
  if (allEnglish.some(w => w.includes('hjelmslev'))) {
    return {
      type: 'structural-sparkles',
      words: ipaWords,
      englishWords
    };
  }

  // Ferdinand de Saussure easter egg
  if (allEnglish.some(w => w.includes('saussure'))) {
    return {
      type: 'signifier-glow',
      words: ipaWords,
      englishWords
    };
  }

  return undefined;
}

/**
 * Calculate game statistics for easter eggs and fun facts
 */
export function calculateGameStats(
  moves: { tiles: { row: number; col: number; tile: IPATile }[] }[]
) {
  let totalFricatives = 0;
  let totalPlosives = 0;
  let totalNasals = 0;
  let totalVowels = 0;
  let totalAffricates = 0;
  const phonemeCounts: Record<string, number> = {};

  for (const move of moves) {
    for (const placedTile of move.tiles) {
      const tile = placedTile.tile;

      if (!phonemeCounts[tile.char]) {
        phonemeCounts[tile.char] = 0;
      }
      phonemeCounts[tile.char]++;

      switch (tile.type) {
        case 'consonant':
          // Fricatives: ʃ, ʒ, s, z, f, v, θ, ð, h
          if (['ʃ', 'ʒ', 's', 'z', 'f', 'v', 'θ', 'ð', 'h'].includes(tile.char)) {
            totalFricatives++;
          }
          // Plosives: p, b, t, d, k, g, ʔ
          else if (['p', 'b', 't', 'd', 'k', 'g', 'ʔ'].includes(tile.char)) {
            totalPlosives++;
          }
          // Nasals: m, n, ŋ
          else if (['m', 'n', 'ŋ'].includes(tile.char)) {
            totalNasals++;
          }
          break;
        case 'vowel':
          totalVowels++;
          break;
        case 'affricate':
          totalAffricates++;
          break;
      }
    }
  }

  // Find most used phoneme
  const sortedPhonemes = Object.entries(phonemeCounts)
    .sort((a, b) => b[1] - a[1]);

  return {
    totalFricatives,
    totalPlosives,
    totalNasals,
    totalVowels,
    totalAffricates,
    mostUsedPhoneme: sortedPhonemes[0] ? { phoneme: sortedPhonemes[0][0], count: sortedPhonemes[0][1] } : null,
    uniquePhonemes: Object.keys(phonemeCounts).length
  };
}
