'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ScrabbleBoard from '@/components/scrabble-board';
import TileRack from '@/components/tile-rack';
import GameInfo from '@/components/game-info';
import GameStatsPanel from '@/components/game-stats-panel';
import EasterEggDisplay from '@/components/easter-egg-display';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Play, Copy, CheckCircle2, AlertCircle, Share2, ExternalLink, Globe } from 'lucide-react';
import { GameState, Player, IPATile, createEmptyGame } from '@/lib/game-types';
import { LINGUIST_NAMES, LINGUISTICS_FACTS } from '@/lib/ipa-tiles';
import { EasterEggTrigger } from '@/lib/scoring';
import { toast } from 'sonner';
import { io, Socket } from 'socket.io-client';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster';

type GamePhase = 'lobby' | 'playing' | 'game-over';

interface LobbyScreenProps {
  onHostGame: (inviteCode: string, playerName: string) => void;
  onJoinGame: (inviteCode: string, playerName: string) => void;
  isConnected: boolean;
  gameServerUrl?: string;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({ 
  onHostGame, 
  onJoinGame, 
  isConnected,
  gameServerUrl 
}) => {
  const [playerName, setPlayerName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [myInviteCode, setMyInviteCode] = useState('');
  const [myInviteLink, setMyInviteLink] = useState('');
  const [isHosting, setIsHosting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isStartingNgrok, setIsStartingNgrok] = useState(false);
  const [randomFact, setRandomFact] = useState('');
  const [ngrokAuthtoken, setNgrokAuthtoken] = useState('');
  const [showAuthtokenPrompt, setShowAuthtokenPrompt] = useState(false);

  // Load saved authtoken from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ngrok_authtoken');
    if (saved) setNgrokAuthtoken(saved);
  }, []);

  // Pick a random linguistics fact on client-side only to avoid hydration errors
  useEffect(() => {
    const fact = LINGUISTICS_FACTS[Math.floor(Math.random() * LINGUISTICS_FACTS.length)];
    setRandomFact(fact);
  }, []);

  const generateInviteCode = () => {
    const name1 = LINGUIST_NAMES[Math.floor(Math.random() * LINGUIST_NAMES.length)];
    const name2 = LINGUIST_NAMES[Math.floor(Math.random() * LINGUIST_NAMES.length)];
    return `${name1}-${name2}-${Math.random().toString(36).substr(2, 4)}`;
  };

  const handleHost = async () => {
    if (!playerName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    // Check for authtoken
    const token = ngrokAuthtoken || localStorage.getItem('ngrok_authtoken');
    if (!token) {
      setShowAuthtokenPrompt(true);
      return;
    }

    setIsStartingNgrok(true);

    try {
      // Start ngrok tunnel
      const response = await fetch('/api/ngrok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authtoken: token })
      });
      const data = await response.json();
      console.log('Ngrok API response:', data);

      if (data.error) {
        toast.error(data.details || 'Failed to start ngrok');
        setIsStartingNgrok(false);
        return;
      }

      const code = generateInviteCode();
      setMyInviteCode(code);
      setIsHosting(true);

      if (data.url) {
        setMyInviteLink(data.url);
        console.log('Share link set to:', data.url);
      } else {
        console.error('No URL in ngrok response:', data);
        toast.error('Ngrok tunnel created but no URL returned');
      }
      
      // Notify user about ngrok
      if (!data.cached) {
        toast.success('Ngrok tunnel started! Share the link below.');
      }

      onHostGame(code, playerName);
    } catch (error: any) {
      toast.error('Failed to start ngrok: ' + error.message);
    } finally {
      setIsStartingNgrok(false);
    }
  };

  const handleJoin = () => {
    if (!playerName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!inviteCode.trim()) {
      toast.error('Please enter an invite code');
      return;
    }
    setIsJoining(true);
    onJoinGame(inviteCode, playerName);
  };

  const copyInviteLink = () => {
    // Generate link for player 2 to open on their local frontend
    const shareLink = myInviteLink
      ? `http://localhost:3000/?invite=${myInviteCode}&server=${encodeURIComponent(myInviteLink)}`
      : myInviteCode;

    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success('Invite link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(myInviteCode);
    toast.success('Invite code copied!');
  };

  const shareInviteLink = async () => {
    const shareLink = myInviteLink
      ? `http://localhost:3000/?invite=${myInviteCode}&server=${encodeURIComponent(myInviteLink)}`
      : myInviteCode;

    console.log('Share button clicked, navigator.share available:', !!navigator.share);
    console.log('Share link:', shareLink);

    if (navigator.share && typeof navigator.share === 'function') {
      try {
        console.log('Attempting to use Web Share API...');
        await navigator.share({
          title: 'IPA Scrabble',
          text: `Join my IPA Scrabble game! Invite code: ${myInviteCode}`,
          url: shareLink
        });
        console.log('Web Share API succeeded');
      } catch (error) {
        console.log('Web Share API failed or cancelled:', error);
        // User cancelled or error, fallback to copy
        copyInviteLink();
      }
    } else {
      console.log('Web Share API not available, falling back to copy');
      copyInviteLink();
    }
  };

  // Check for invite code in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteParam = urlParams.get('invite');
    if (inviteParam) {
      setInviteCode(inviteParam);
    }
  }, []);

  const saveAuthtoken = () => {
    if (ngrokAuthtoken.trim()) {
      localStorage.setItem('ngrok_authtoken', ngrokAuthtoken.trim());
      setShowAuthtokenPrompt(false);
      toast.success('Authtoken saved! Click Host Game again.');
    } else {
      toast.error('Please enter a valid authtoken');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <Toaster />

      {/* Ngrok Authtoken Prompt */}
      {showAuthtokenPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Ngrok Setup Required</CardTitle>
              <p className="text-sm text-muted-foreground">
                To host online games, you need a free ngrok account.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to <a href="https://dashboard.ngrok.com/signup" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">dashboard.ngrok.com</a> and sign up (free)</li>
                <li>Copy your authtoken from the dashboard</li>
                <li>Paste it below</li>
              </ol>
              <div className="space-y-2">
                <Label htmlFor="authtoken">Authtoken</Label>
                <Input
                  id="authtoken"
                  type="password"
                  placeholder="Paste your ngrok authtoken"
                  value={ngrokAuthtoken}
                  onChange={(e) => setNgrokAuthtoken(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowAuthtokenPrompt(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={saveAuthtoken} className="flex-1">
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            IPA Scrabble
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Play Scrabble with International Phonetic Alphabet!
          </p>
          <div className="flex justify-center mt-2 gap-2">
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? "● Connected" : "● Disconnected"}
            </Badge>
            {gameServerUrl && (
              <Badge variant="outline" className="text-xs">
                <Globe className="w-3 h-3 mr-1" />
                Online
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="playerName">Your Name</Label>
            <Input
              id="playerName"
              placeholder="Enter your name..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              disabled={!isConnected}
            />
          </div>

          {!isHosting ? (
            <>
              <div className="space-y-3">
                <Button
                  onClick={handleHost}
                  className="w-full"
                  size="lg"
                  disabled={!isConnected || isStartingNgrok}
                >
                  {isStartingNgrok ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Starting Game...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Host a Game
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inviteCode">Invite Code</Label>
                  <Input
                    id="inviteCode"
                    placeholder="e.g., chomsky-saussure-a3b7"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    disabled={!isConnected}
                  />
                  <Button
                    onClick={handleJoin}
                    variant="outline"
                    className="w-full"
                    size="lg"
                    disabled={isJoining || !isConnected}
                  >
                    {isJoining ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      'Join Game'
                    )}
                  </Button>
                </div>
              </div>

              {/* Fun Fact */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Did you know?</strong> {randomFact}
                </AlertDescription>
              </Alert>
            </>
          ) : (
            <div className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Share this link or code with your friend to invite them!
                </AlertDescription>
              </Alert>

              {myInviteLink && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-blue-600">Share Link (Click to Share)</Label>
                  <Button
                    onClick={shareInviteLink}
                    variant="default"
                    className="w-full"
                    size="lg"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Invite Link
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Opens share menu or copies to clipboard
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Invite Code</Label>
                <div className="flex gap-2">
                  <Input
                    value={myInviteCode}
                    readOnly
                    className="font-mono text-lg"
                  />
                  <Button
                    onClick={copyInviteCode}
                    variant="outline"
                    size="icon"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {myInviteLink && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-xs text-blue-800 mb-1">
                    <ExternalLink className="w-3 h-3" />
                    <span className="font-semibold">Game Server URL</span>
                  </div>
                  <p className="text-xs text-blue-700 font-mono break-all">
                    {myInviteLink}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Your friend can join by entering the invite code above
                  </p>
                </div>
              )}

              <div className="text-center text-sm text-muted-foreground">
                Waiting for player 2 to join...
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default function IPA_ScrabbleGame() {
  const [gamePhase, setGamePhase] = useState<GamePhase>('lobby');
  const [gameState, setGameState] = useState<GameState>(createEmptyGame());
  const [selectedTile, setSelectedTile] = useState<IPATile | null>(null);
  const [currentUserId, setCurrentUserId] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [pendingTiles, setPendingTiles] = useState<{ row: number; col: number; tileId: string }[]>([]);
  const [currentInviteCode, setCurrentInviteCode] = useState('');
  const [easterEgg, setEasterEgg] = useState<EasterEggTrigger | null>(null);
  const [gameServerUrl, setGameServerUrl] = useState<string>('');

  const currentUser = gameState.players.find(p => p.id === currentUserId);
  const isCurrentPlayerTurn = gameState.currentPlayerIndex >= 0 &&
                               gameState.players[gameState.currentPlayerIndex]?.id === currentUserId;

  useEffect(() => {
    setCurrentUserId(Math.random().toString(36).substr(2, 9));
  }, []);

  useEffect(() => {
    // Check for server URL param (for joining remote games)
    const urlParams = new URLSearchParams(window.location.search);
    const serverParam = urlParams.get('server');

    let socketUrl: string;
    if (serverParam) {
      // Use provided server URL (remote game)
      socketUrl = serverParam;
      console.log('Connecting to remote server:', socketUrl);
    } else {
      // Default: local server
      const isLocal = typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      socketUrl = isLocal ? 'http://localhost:3004' : '/?XTransformPort=3004';
    }
    const socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Connected to game server');
      setIsConnected(true);
      toast.success('Connected to game server');
      
      // Set game server URL from window location (if using ngrok)
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        setGameServerUrl(`${window.location.protocol}//${window.location.host}`);
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from game server');
      setIsConnected(false);
      toast.error('Disconnected from game server');
    });

    socketInstance.on('room-created', (data: { inviteCode: string; playerId: string; gameState: GameState }) => {
      console.log('Room created:', data);
      setGameState(data.gameState);
      setCurrentInviteCode(data.inviteCode);
    });

    socketInstance.on('room-joined', (data: { inviteCode: string; playerId: string; gameState: GameState }) => {
      console.log('Room joined:', data);
      setGameState(data.gameState);
      setCurrentInviteCode(data.inviteCode);
      setGamePhase('playing');
    });

    socketInstance.on('game-started', (data: { gameState: GameState }) => {
      console.log('Game started:', data);
      setGameState(data.gameState);
      setGamePhase('playing');
      toast.success('Game started! Your turn to play.');
    });

    socketInstance.on('game-updated', (data: { gameState: GameState }) => {
      console.log('Game updated:', data);
      setGameState(data.gameState);
      setPendingTiles([]);
    });

    socketInstance.on('game-over', (data: { winner: Player; gameState: GameState }) => {
      console.log('Game over:', data);
      setGameState(data.gameState);
      setGamePhase('game-over');
    });

    socketInstance.on('player-disconnected', (data: { playerId: string }) => {
      console.log('Player disconnected:', data);
      toast.warning('Other player disconnected');
    });

    socketInstance.on('easter-egg', (data: { easterEgg: EasterEggTrigger }) => {
      console.log('Easter egg triggered:', data.easterEgg);
      setEasterEgg(data.easterEgg);
    });

    socketInstance.on('error', (data: { message: string }) => {
      console.error('Socket error:', data.message);
      toast.error(data.message);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const handleHostGame = useCallback((inviteCode: string, playerName: string) => {
    if (!socket || !currentUserId) return;

    setCurrentInviteCode(inviteCode);
    socket.emit('create-room', {
      inviteCode,
      playerName
    });
  }, [socket, currentUserId]);

  const handleJoinGame = useCallback((inviteCode: string, playerName: string) => {
    if (!socket || !currentUserId) return;

    setCurrentInviteCode(inviteCode);
    socket.emit('join-room', {
      inviteCode,
      playerName
    });
  }, [socket, currentUserId]);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (!selectedTile || !isCurrentPlayerTurn) return;

    if (gameState.board[row][col].tile) {
      toast.error('Cell already occupied');
      return;
    }

    const newPending = [...pendingTiles, { row, col, tileId: selectedTile.id }];
    setPendingTiles(newPending);

    const newBoard = gameState.board.map((r, rIndex) =>
      r.map((cell, cIndex) => {
        if (rIndex === row && cIndex === col && !cell.tile) {
          return {
            ...cell,
            tile: selectedTile
          };
        }
        return cell;
      })
    );

    setGameState(prev => ({
      ...prev,
      board: newBoard
    }));

    const updatedPlayers = gameState.players.map(player => {
      if (player.id === currentUserId) {
        return {
          ...player,
          tiles: player.tiles.filter(t => t.id !== selectedTile.id)
        };
      }
      return player;
    });

    setGameState(prev => ({
      ...prev,
      players: updatedPlayers
    }));

    setSelectedTile(null);
  }, [selectedTile, isCurrentPlayerTurn, gameState, pendingTiles, currentUserId]);

  const handleTileSelect = useCallback((tile: IPATile) => {
    setSelectedTile(tile);
  }, []);

  const handlePlayMove = useCallback(() => {
    if (!socket || pendingTiles.length === 0 || !currentInviteCode) return;

    socket.emit('make-move', {
      inviteCode: currentInviteCode,
      tiles: pendingTiles
    });

    toast.info('Move submitted...');
  }, [socket, pendingTiles, currentInviteCode]);

  const handlePass = useCallback(() => {
    if (!socket || !currentInviteCode) return;

    socket.emit('pass-turn', { inviteCode: currentInviteCode });
    toast.info('Turn passed');
  }, [socket, currentInviteCode]);

  const handleExchange = useCallback(() => {
    toast.info('Tile exchange coming soon');
  }, []);

  const handleChallenge = useCallback(() => {
    toast.info('Challenge feature coming soon');
  }, []);

  const handleResign = useCallback(() => {
    toast.info('Resign feature coming soon');
  }, []);

  const handleEasterEggComplete = useCallback(() => {
    setEasterEgg(null);
  }, []);

  if (gamePhase === 'lobby') {
    return (
      <LobbyScreen
        onHostGame={handleHostGame}
        onJoinGame={handleJoinGame}
        isConnected={isConnected}
        gameServerUrl={gameServerUrl}
      />
    );
  }

  if (gamePhase === 'game-over') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
        <Toaster />
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Game Over!
          </h1>
          {gameState.winner && (
            <div className="text-center mb-8">
              <div className="text-2xl font-bold">
                {gameState.winner.id === currentUserId
                  ? "🎉 You Win! 🎉"
                  : `${gameState.winner.name} Wins!`}
              </div>
            </div>
          )}
          <GameStatsPanel
            playerStats={gameState.players.map(player => ({
              playerName: player.name,
              stats: {
                totalFricatives: 0,
                totalPlosives: 0,
                totalNasals: 0,
                totalVowels: 0,
                totalAffricates: 0,
                mostUsedPhoneme: null,
                uniquePhonemes: 0
              }
            }))}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      <Toaster />

      {/* Easter Egg Display */}
      <AnimatePresence>
        {easterEgg && (
          <EasterEggDisplay
            easterEgg={easterEgg}
            onComplete={handleEasterEggComplete}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            IPA Scrabble
          </h1>
          <div className="flex items-center gap-4">
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Panel: Game Info */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <GameInfo
              gameState={gameState}
              currentUserId={currentUserId}
              onPass={handlePass}
              onExchange={handleExchange}
              onChallenge={handleChallenge}
              onResign={handleResign}
              isCurrentPlayerTurn={isCurrentPlayerTurn}
            />
          </div>

          {/* Center Panel: Board */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-white rounded-lg shadow-lg p-4">
              {gameState.gameStarted ? (
                <ScrabbleBoard
                  board={gameState.board}
                  onCellClick={handleCellClick}
                  selectedTile={selectedTile}
                  isCurrentPlayerTurn={isCurrentPlayerTurn}
                />
              ) : (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Waiting for game to start...</p>
                </div>
              )}
            </div>

            {/* Play/Submit Move Button */}
            {pendingTiles.length > 0 && isCurrentPlayerTurn && (
              <div className="mt-4 flex justify-center">
                <Button
                  onClick={handlePlayMove}
                  size="lg"
                  className="w-full max-w-md"
                >
                  Play Move ({pendingTiles.length} tiles)
                </Button>
              </div>
            )}
          </div>

          {/* Right Panel: Your Rack */}
          <div className="lg:col-span-1 order-3">
            {currentUser && (
              <div className="sticky top-4">
                <TileRack
                  tiles={currentUser.tiles}
                  selectedTile={selectedTile}
                  onTileSelect={handleTileSelect}
                  isCurrentPlayerTurn={isCurrentPlayerTurn}
                />

                {/* Selected Tile Info */}
                {selectedTile && (
                  <Card className="mt-4">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Selected Tile</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-3xl font-bold text-amber-900">
                            {selectedTile.char}
                          </span>
                          <Badge variant="secondary">
                            {selectedTile.points} pts
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground capitalize">
                          {selectedTile.type}: {selectedTile.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
