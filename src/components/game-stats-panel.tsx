'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trophy, Award, Zap, Target, BookOpen } from 'lucide-react';

interface GameStats {
  totalFricatives: number;
  totalPlosives: number;
  totalNasals: number;
  totalVowels: number;
  totalAffricates: number;
  mostUsedPhoneme: { phoneme: string; count: number } | null;
  uniquePhonemes: number;
}

interface GameStatsPanelProps {
  playerStats: { playerName: string; stats: GameStats }[];
}

const StatCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
}> = ({ title, value, icon, description }) => (
  <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg">
    <div className="text-2xl">{icon}</div>
    <div className="flex-1">
      <div className="text-xs text-muted-foreground uppercase font-medium">{title}</div>
      <div className="text-xl font-bold text-slate-900">{value}</div>
      {description && (
        <div className="text-xs text-muted-foreground">{description}</div>
      )}
    </div>
  </div>
);

const GameStatsPanel: React.FC<GameStatsPanelProps> = ({ playerStats }) => {
  const getMostObscureWord = (stats: GameStats) => {
    if (!stats.mostUsedPhoneme) return null;
    const rarePhonemes = ['θ', 'ð', 'ʒ', 'ŋ', 'ʔ', 't͡s', 'd͡z', 't͡ʃ', 'd͡ʒ'];
    if (rarePhonemes.includes(stats.mostUsedPhoneme.phoneme)) {
      return stats.mostUsedPhoneme.phoneme;
    }
    return null;
  };

  const getFricativeLeader = () => {
    return playerStats.reduce((leader, player) =>
      player.stats.totalFricatives > leader.stats.totalFricatives ? player : leader
    );
  };

  const getPlosiveLeader = () => {
    return playerStats.reduce((leader, player) =>
      player.stats.totalPlosives > leader.stats.totalPlosives ? player : leader
    );
  };

  const getNasalLeader = () => {
    return playerStats.reduce((leader, player) =>
      player.stats.totalNasals > leader.stats.totalNasals ? player : leader
    );
  };

  const getVowelLeader = () => {
    return playerStats.reduce((leader, player) =>
      player.stats.totalVowels > leader.stats.totalVowels ? player : leader
    );
  };

  const getAffricateLeader = () => {
    return playerStats.reduce((leader, player) =>
      player.stats.totalAffricates > leader.stats.totalAffricates ? player : leader
    );
  };

  const getPhonemeDiversityLeader = () => {
    return playerStats.reduce((leader, player) =>
      player.stats.uniquePhonemes > leader.stats.uniquePhonemes ? player : leader
    );
  };

  const fricativeLeader = getFricativeLeader();
  const plosiveLeader = getPlosiveLeader();
  const nasalLeader = getNasalLeader();
  const vowelLeader = getVowelLeader();
  const affricateLeader = getAffricateLeader();
  const diversityLeader = getPhonemeDiversityLeader();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Linguistics Game Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Fun Facts Section */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
            Fun Facts & Achievements
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
              <Award className="w-4 h-4 text-blue-600" />
              <span className="text-sm">
                <strong>Fricative Fanatic:</strong> {fricativeLeader.playerName} ({fricativeLeader.stats.totalFricatives})
              </span>
            </div>

            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="text-sm">
                <strong>Plosive Powerhouse:</strong> {plosiveLeader.playerName} ({plosiveLeader.stats.totalPlosives})
              </span>
            </div>

            <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg border border-purple-200">
              <Target className="w-4 h-4 text-purple-600" />
              <span className="text-sm">
                <strong>Nasal Navigator:</strong> {nasalLeader.playerName} ({nasalLeader.stats.totalNasals})
              </span>
            </div>

            <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span className="text-sm">
                <strong>Vowel Virtuoso:</strong> {vowelLeader.playerName} ({vowelLeader.stats.totalVowels})
              </span>
            </div>

            <div className="flex items-center gap-2 p-2 bg-rose-50 rounded-lg border border-rose-200">
              <Award className="w-4 h-4 text-rose-600" />
              <span className="text-sm">
                <strong>Affricate Ace:</strong> {affricateLeader.playerName} ({affricateLeader.stats.totalAffricates})
              </span>
            </div>

            <div className="flex items-center gap-2 p-2 bg-cyan-50 rounded-lg border border-cyan-200">
              <BookOpen className="w-4 h-4 text-cyan-600" />
              <span className="text-sm">
                <strong>Phoneme Diversity:</strong> {diversityLeader.playerName} ({diversityLeader.stats.uniquePhonemes} unique phonemes)
              </span>
            </div>
          </div>
        </div>

        {/* Individual Player Stats */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
            Detailed Player Statistics
          </h3>
          <ScrollArea className="h-96 w-full">
            <div className="space-y-4">
              {playerStats.map((player, index) => (
                <div key={index} className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg">
                  <h4 className="font-bold text-lg mb-3">{player.playerName}</h4>

                  <div className="grid grid-cols-2 gap-2">
                    <StatCard
                      title="Fricatives"
                      value={player.stats.totalFricatives}
                      icon="🌬️"
                      description="s, z, f, v, θ, ð, etc."
                    />

                    <StatCard
                      title="Plosives"
                      value={player.stats.totalPlosives}
                      icon="💥"
                      description="p, b, t, d, k, g, ʔ"
                    />

                    <StatCard
                      title="Nasals"
                      value={player.stats.totalNasals}
                      icon="👃"
                      description="m, n, ŋ"
                    />

                    <StatCard
                      title="Vowels"
                      value={player.stats.totalVowels}
                      icon="🗣️"
                      description="All vowel sounds"
                    />

                    <StatCard
                      title="Affricates"
                      value={player.stats.totalAffricates}
                      icon="🔀"
                      description="t͡s, d͡z, t͡ʃ, d͡ʒ"
                    />

                    <StatCard
                      title="Unique Phonemes"
                      value={player.stats.uniquePhonemes}
                      icon="🔠"
                    />
                  </div>

                  {/* Most Used Phoneme */}
                  {player.stats.mostUsedPhoneme && (
                    <div className="mt-3 p-3 bg-white rounded-lg border">
                      <div className="text-xs text-muted-foreground uppercase font-medium mb-1">
                        Most Used Phoneme
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold text-amber-900">
                          {player.stats.mostUsedPhoneme.phoneme}
                        </span>
                        <Badge variant="secondary">
                          Used {player.stats.mostUsedPhoneme.count}x
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Fun Linguistics Facts */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
            Did You Know?
          </h3>
          <ul className="space-y-1 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span>
                Fricatives are created by forcing air through a narrow channel - you used {playerStats.reduce((sum, p) => sum + p.stats.totalFricatives, 0)} in total!
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">•</span>
              <span>
                Plosives (stops) completely block airflow before releasing - {playerStats.reduce((sum, p) => sum + p.stats.totalPlosives, 0)} were played!
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500">•</span>
              <span>
                Nasal sounds are produced with airflow through the nose - {playerStats.reduce((sum, p) => sum + p.stats.totalNasals, 0)} appeared!
              </span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameStatsPanel;
