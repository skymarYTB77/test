import React from 'react';
import { Users, Crown, RefreshCw, Copy } from 'lucide-react';
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
  const allPlayersReady = room.players.every(p => p.isReady);
  const canStart = isHost && allPlayersReady && room.players.length > 1;

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.code);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/10 rounded-xl p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Salon de jeu</h2>
            <button 
              onClick={copyRoomCode}
              className="flex items-center gap-2 text-xl bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20"
            >
              <span className="font-mono font-bold">{room.code}</span>
              <Copy className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6" />
              <span className="text-xl">
                {room.players.length} / {room.settings.maxPlayers} joueurs
              </span>
            </div>

            <div className="grid gap-3">
              {room.players.map((player) => (
                <div
                  key={player.name}
                  className="flex items-center justify-between bg-white/5 p-4 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {player.isHost && (
                      <Crown className="w-5 h-5 text-yellow-400" />
                    )}
                    <span className="font-medium">
                      {player.name}
                      {player.name === playerName && " (vous)"}
                    </span>
                  </div>
                  <div className="text-sm">
                    {player.isReady ? (
                      <span className="text-green-400">Prêt</span>
                    ) : (
                      <span className="text-orange-400">En attente</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onLeave}
            className="flex-1 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-lg"
          >
            Quitter le salon
          </button>
          {!currentPlayer?.isReady ? (
            <button
              onClick={onReady}
              className="flex-1 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg"
            >
              Je suis prêt
            </button>
          ) : isHost ? (
            <button
              onClick={onStart}
              disabled={!canStart}
              className={`flex-1 px-6 py-3 rounded-lg flex items-center justify-center gap-2
                ${canStart 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700' 
                  : 'bg-gray-600 cursor-not-allowed'}`}
            >
              <RefreshCw className="w-5 h-5" />
              Lancer la partie
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}