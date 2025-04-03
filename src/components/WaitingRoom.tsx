import React from 'react';
import { Users, Crown, RefreshCw, Copy, ChevronLeft } from 'lucide-react';
import type { GameRoom } from '../types';

type WaitingRoomProps = {
  room: GameRoom;
  playerName: string;
  onStart: () => void;
  onLeave: () => void;
  onReady: () => void;
};

export function WaitingRoom({ room, playerName, onStart, onLeave, onReady }: WaitingRoomProps) {
  const currentPlayer = room.players.find(p => p.name === playerName);
  const isHost = currentPlayer?.isHost;
  const allPlayersReady = room.players.every(p => p.isReady || p.isHost);
  const canStart = isHost && allPlayersReady && room.players.length > 1;

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.code);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onLeave}
          className="mb-8 flex items-center text-lg hover:text-indigo-300"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Retour au menu
        </button>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 mb-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Salon de jeu</h2>
            <button 
              onClick={copyRoomCode}
              className="flex items-center gap-3 text-xl bg-white/10 px-6 py-3 rounded-lg hover:bg-white/20 transition-colors duration-200"
            >
              <span className="font-mono font-bold">{room.code}</span>
              <Copy className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 text-xl text-indigo-200">
              <Users className="w-6 h-6" />
              <span>
                {room.players.length} / {room.settings.maxPlayers} joueurs
              </span>
            </div>

            <div className="space-y-3">
              {room.players.map((player) => (
                <div
                  key={player.name}
                  className={`flex items-center justify-between ${
                    player.name === playerName ? 'bg-white/20' : 'bg-white/10'
                  } p-4 rounded-lg transition-colors duration-200`}
                >
                  <div className="flex items-center gap-3">
                    {player.isHost ? (
                      <Crown className="w-5 h-5 text-yellow-400" />
                    ) : null}
                    <span className="font-medium">
                      {player.name}
                      {player.name === playerName && " (vous)"}
                    </span>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                    player.isReady || player.isHost
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {player.isHost ? 'Hôte' : player.isReady ? 'Prêt' : 'En attente'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          {!isHost && !currentPlayer?.isReady && (
            <button
              onClick={onReady}
              className="w-full bg-green-600 hover:bg-green-700 px-6 py-4 rounded-lg text-lg font-medium transition-colors duration-200"
            >
              Je suis prêt
            </button>
          )}
          {isHost && (
            <button
              onClick={onStart}
              disabled={!canStart}
              className={`w-full px-6 py-4 rounded-lg text-lg font-medium flex items-center justify-center gap-2 transition-all duration-200
                ${canStart 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 cursor-pointer' 
                  : 'bg-gray-600 cursor-not-allowed opacity-50'}`}
            >
              <RefreshCw className="w-5 h-5" />
              Lancer la partie
            </button>
          )}
        </div>

        {isHost && !canStart && (
          <p className="mt-4 text-center text-indigo-200 text-sm">
            En attente que tous les joueurs soient prêts pour lancer la partie...
          </p>
        )}
      </div>
    </div>
  );
}