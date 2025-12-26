'use client';

import React from 'react';
import { IPATile } from '@/lib/game-types';

interface TileRackProps {
  tiles: IPATile[];
  selectedTile: IPATile | null;
  onTileSelect?: (tile: IPATile) => void;
  isCurrentPlayerTurn?: boolean;
}

const TileRack: React.FC<TileRackProps> = ({
  tiles,
  selectedTile,
  onTileSelect,
  isCurrentPlayerTurn = true
}) => {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 shadow-md">
      <h3 className="text-sm font-semibold text-amber-900 mb-3 text-center">
        Your Tiles ({tiles.length})
      </h3>
      <div className="flex flex-wrap gap-2 justify-center min-h-[60px]">
        {tiles.map((tile, index) => (
          <button
            key={tile.id || index}
            onClick={() => onTileSelect && isCurrentPlayerTurn && onTileSelect(tile)}
            disabled={!isCurrentPlayerTurn || !onTileSelect}
            className={`
              relative w-12 h-14 sm:w-14 sm:h-16
              flex-shrink-0
              rounded-lg shadow-md border-2
              flex flex-col items-center justify-center
              transition-all duration-200
              ${selectedTile?.id === tile.id
                ? 'ring-4 ring-green-500 ring-offset-2 scale-110 border-green-600'
                : 'border-amber-400 hover:scale-105 hover:shadow-lg'
              }
              ${!isCurrentPlayerTurn ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
              bg-gradient-to-br from-amber-100 to-amber-200
            `}
          >
            {/* Tile character */}
            <span className="text-2xl font-bold text-amber-900 leading-none">
              {tile.char}
            </span>

            {/* Points */}
            <span className="absolute bottom-1 right-1 text-xs font-bold text-amber-700">
              {tile.points}
            </span>

            {/* Type indicator */}
            <div className="absolute top-1 left-1">
              <div className={`
                w-2 h-2 rounded-full
                ${tile.type === 'consonant' ? 'bg-blue-500' : ''}
                ${tile.type === 'vowel' ? 'bg-green-500' : ''}
                ${tile.type === 'affricate' ? 'bg-purple-500' : ''}
                ${tile.type === 'modifier' ? 'bg-orange-500' : ''}
              `} />
            </div>
          </button>
        ))}

        {tiles.length === 0 && (
          <div className="text-amber-600 text-sm italic py-4">
            No tiles in rack
          </div>
        )}
      </div>

      {/* Tile type legend */}
      <div className="mt-3 flex flex-wrap gap-2 justify-center text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="text-amber-800">Consonant</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-amber-800">Vowel</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
          <span className="text-amber-800">Affricate</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
          <span className="text-amber-800">Modifier</span>
        </div>
      </div>
    </div>
  );
};

export default TileRack;
