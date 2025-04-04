import React, { useState } from 'react';
import { Trophy, Crown, Medal } from 'lucide-react';
import type { Player, RoundHistory, Category } from '../types';
import { PlayerHistoryModal } from './PlayerHistoryModal';

type ScoreBoardProps = {
  players: Player[];
  roundHistory: RoundHistory[];
  categories: Category[];
};

export function ScoreBoard({ players, roundHistory, categories }: ScoreBoardProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  const sortedPlayers = [...players].sort((a, b) => {
    const scoreA = a.score || 0;
    const scoreB = b.score || 0;
    return scoreB - scoreA;
  });

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 2:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Trophy className="w-7 h-7 text-yellow-400" />
            Classement final
          </h2>
        </div>

        <div className="divide-y divide-white/10">
          {sortedPlayers.map((player, index) => (
            <div
              key={player.id}
              className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 flex justify-center">
                  {getRankIcon(index)}
                </div>
                <div>
                  <button
                    onClick={() => setSelectedPlayer(player.name)}
                    className="text-lg font-medium hover:text-indigo-300 transition-colors duration-200 flex items-center gap-2"
                  >
                    {player.name}
                    {player.isHost && <Crown className="w-4 h-4 text-yellow-400" />}
                  </button>
                  <div className="text-sm text-white/70">
                    {player.validWords} mots valides
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold text-yellow-400">
                {player.score} pts
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedPlayer && (
        <PlayerHistoryModal
          playerName={selectedPlayer}
          roundHistory={roundHistory}
          categories={categories}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </>
  );
}