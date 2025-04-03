import React from 'react';
import { X } from 'lucide-react';
import type { RoundHistory } from '../types';

type PlayerHistoryModalProps = {
  playerName: string;
  roundHistory: RoundHistory[];
  onClose: () => void;
};

export function PlayerHistoryModal({ playerName, roundHistory, onClose }: PlayerHistoryModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-xl rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-2xl font-bold">Historique de {playerName}</h3>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          <div className="space-y-6">
            {roundHistory.map((round, index) => {
              const playerRound = round.playerAnswers[playerName];
              if (!playerRound) return null;

              return (
                <div key={index} className="bg-white/5 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold">Lettre {round.letter}</div>
                      <div className="text-yellow-400">{playerRound.score} points</div>
                    </div>
                    <div className="text-green-400">
                      {playerRound.validWords} mots valides
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(playerRound.answers).map(([category, answer]) => {
                      const isValid = answer.toLowerCase().startsWith(round.letter.toLowerCase());
                      return (
                        <div key={category} className="space-y-1">
                          <div className="text-sm text-white/70">{category}</div>
                          <div className={`font-medium ${isValid ? 'text-green-400' : 'text-red-400'}`}>
                            {answer || '-'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}