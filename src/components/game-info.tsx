'use client';

import React from 'react';
import { Player, GameState } from '@/lib/game-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trophy, Clock, RotateCcw, Lightbulb } from 'lucide-react';

interface GameInfoProps {
  gameState: GameState;
  currentUserId: string;
  onPass?: () => void;
  onExchange?: () => void;
  onChallenge?: () => void;
  onResign?: () => void;
  isCurrentPlayerTurn?: boolean;
}

const GameInfo: React.FC<GameInfoProps> = ({
  gameState,
  currentUserId,
  onPass,
  onExchange,
  onChallenge,
  onResign,
  isCurrentPlayerTurn = true
}) => {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const currentUser = gameState.players.find(p => p.id === currentUserId);

  const getLeadingPlayer = () => {
    if (gameState.players.length === 0) return null;
    return gameState.players.reduce((leader, player) =>
      player.score > leader.score ? player : leader
    );
  };

  const leadingPlayer = getLeadingPlayer();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Game Info
          </span>
          {gameState.gameStarted && !gameState.gameOver && (
            <Badge variant={isCurrentPlayerTurn ? "default" : "secondary"}>
              {isCurrentPlayerTurn ? "Your Turn" : "Waiting"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Game Status */}
        {!gameState.gameStarted ? (
          <div className="text-center py-4 text-sm text-muted-foreground">
            Waiting for players to join...
          </div>
        ) : gameState.gameOver ? (
          <div className="text-center py-4">
            {gameState.winner && (
              <div className="space-y-2">
                <div className="text-lg font-bold text-primary">
                  {gameState.winner.id === currentUserId
                    ? "🎉 You Win! 🎉"
                    : `${gameState.winner.name} Wins!`}
                </div>
                <div className="text-sm text-muted-foreground">
                  Final Score: {gameState.winner.score}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Players and scores */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase">
                Players
              </div>
              {gameState.players.map((player, index) => {
                const isCurrentTurn = index === gameState.currentPlayerIndex;
                const isCurrentUser = player.id === currentUserId;
                const isLeader = leadingPlayer?.id === player.id;

                return (
                  <div
                    key={player.id}
                    className={`
                      flex items-center justify-between p-2 rounded-lg border
                      ${isCurrentTurn ? 'bg-primary/10 border-primary' : 'border-border'}
                      ${isCurrentUser ? 'ring-2 ring-primary/20' : ''}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      {isLeader && <Trophy className="w-4 h-4 text-yellow-500" />}
                      <span className={`
                        font-medium
                        ${isCurrentUser ? 'text-primary' : ''}
                      `}>
                        {player.name}
                        {isCurrentUser && ' (You)'}
                      </span>
                      {isCurrentTurn && (
                        <Clock className="w-3 h-3 animate-pulse" />
                      )}
                    </div>
                    <Badge variant={isLeader ? "default" : "outline"}>
                      {player.score}
                    </Badge>
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            {isCurrentPlayerTurn && (
              <div className="space-y-2 pt-2 border-t">
                <div className="text-xs font-semibold text-muted-foreground uppercase">
                  Actions
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onPass}
                    disabled={!onPass}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Pass
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onExchange}
                    disabled={!onExchange || currentUser?.tiles.length === 0}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Exchange
                  </Button>
                </div>
                {gameState.lastMove && gameState.lastMove.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={onChallenge}
                    disabled={!onChallenge}
                    className="w-full"
                  >
                    <Lightbulb className="w-4 h-4 mr-1" />
                    Challenge Last Move
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onResign}
                  disabled={!onResign}
                  className="w-full text-destructive border-destructive hover:bg-destructive/10"
                >
                  Resign Game
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Move History */}
        {gameState.moveHistory.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <div className="text-xs font-semibold text-muted-foreground uppercase">
              Recent Moves
            </div>
            <ScrollArea className="h-32 w-full">
              <div className="space-y-1">
                {gameState.moveHistory.slice().reverse().map((move, index) => {
                  const player = gameState.players[move.playerIndex];
                  return (
                    <div
                      key={index}
                      className="text-xs p-2 rounded bg-muted/50"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{player?.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          +{move.score}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground">
                        {move.words.join(', ')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GameInfo;
