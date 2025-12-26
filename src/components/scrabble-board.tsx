'use client';

import React from 'react';
import { BoardCell, PlacedTile, IPATile } from '@/lib/game-types';

interface ScrabbleBoardProps {
  board: BoardCell[][];
  onCellClick?: (row: number, col: number) => void;
  selectedTile?: IPATile | null;
  isCurrentPlayerTurn?: boolean;
  isValidDrop?: (row: number, col: number) => boolean;
}

const ScrabbleBoard: React.FC<ScrabbleBoardProps> = ({
  board,
  onCellClick,
  selectedTile,
  isCurrentPlayerTurn = true,
  isValidDrop
}) => {
  const getBonusDisplay = (cell: BoardCell) => {
    switch (cell.type) {
      case 'double-letter':
        return <span className="text-blue-600 font-bold text-xs">DL</span>;
      case 'triple-letter':
        return <span className="text-green-600 font-bold text-xs">TL</span>;
      case 'double-word':
        return <span className="text-rose-600 font-bold text-xs">DW</span>;
      case 'triple-word':
        return <span className="text-orange-600 font-bold text-xs">TW</span>;
      case 'center':
        return <span className="text-amber-600 font-bold text-xs">★</span>;
      default:
        return '';
    }
  };

  const getBonusColor = (cell: BoardCell) => {
    switch (cell.type) {
      case 'double-letter':
        return 'bg-blue-50 border-blue-200';
      case 'triple-letter':
        return 'bg-green-50 border-green-200';
      case 'double-word':
        return 'bg-rose-50 border-rose-200';
      case 'triple-word':
        return 'bg-orange-50 border-orange-200';
      case 'center':
        return 'bg-amber-50 border-amber-300';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const isValidTarget = (row: number, col: number) => {
    if (!isCurrentPlayerTurn || !selectedTile || !isValidDrop) return false;
    return isValidDrop(row, col);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg shadow-inner">
      <div className="grid gap-0.5 bg-slate-300 p-1 rounded shadow-lg"
           style={{
             gridTemplateColumns: 'repeat(15, minmax(0, 1fr))',
             maxWidth: '100vw',
             aspectRatio: '1/1'
           }}>
        {board.map((row) =>
          row.map((cell) => (
            <button
              key={`${cell.row}-${cell.col}`}
              onClick={() => onCellClick?.(cell.row, cell.col)}
              disabled={!isCurrentPlayerTurn || !onCellClick}
              className={`
                relative w-full h-full min-w-[20px] min-h-[20px]
                border ${getBonusColor(cell)}
                flex items-center justify-center
                transition-all duration-150
                hover:shadow-md
                disabled:cursor-not-allowed
                ${cell.tile ? 'bg-white shadow-inner' : ''}
                ${isValidTarget(cell.row, cell.col) ? 'ring-2 ring-green-500 ring-offset-1' : ''}
                ${onCellClick ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
              `}
              style={{
                aspectRatio: '1/1'
              }}
            >
              {cell.tile ? (
                <div className="w-full h-full flex items-center justify-center
                             bg-gradient-to-br from-amber-100 to-amber-200
                             rounded shadow-inner border border-amber-300">
                  <span className="text-lg font-bold text-amber-900 select-none"
                        style={{ fontSize: 'clamp(0.5rem, 2.5vw, 1rem)' }}>
                    {cell.tile.char}
                  </span>
                  <span className="absolute bottom-0.5 right-1 text-xs font-bold text-amber-700"
                        style={{ fontSize: 'clamp(0.3rem, 1.5vw, 0.5rem)' }}>
                    {cell.tile.points}
                  </span>
                </div>
              ) : (
                <>{getBonusDisplay(cell)}</>
              )}
            </button>
          ))
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 justify-center text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
          <span className="text-blue-700 font-medium">Double Letter</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
          <span className="text-green-700 font-medium">Triple Letter</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-rose-50 border border-rose-200 rounded"></div>
          <span className="text-rose-700 font-medium">Double Word</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-orange-50 border border-orange-200 rounded"></div>
          <span className="text-orange-700 font-medium">Triple Word</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-amber-50 border border-amber-300 rounded"></div>
          <span className="text-amber-700 font-medium">Center (★)</span>
        </div>
      </div>
    </div>
  );
};

export default ScrabbleBoard;
