import React, { useState } from 'react';
import { Users, Crown, RefreshCw, Copy, ChevronLeft, MoreVertical, Shield, UserMinus, UserX, UserPlus } from 'lucide-react';
import type { GameRoom } from '../types';

type WaitingRoomProps = {
  room: GameRoom;
  playerName: string;
  onStart: () => void;
  onLeave: () => void;
  onReady: () => void;
  onKickPlayer?: (playerName: string) => void;
  onBanPlayer?: (playerName: string) => void;
  onTransferHost?: (playerName: string) => void;
};

export function WaitingRoom({ 
  room, 
  playerName, 
  onStart, 
  onLeave, 
  onReady,
  onKickPlayer,
  onBanPlayer,
  onTransferHost
}: WaitingRoomProps) {
  const currentPlayer = room.players.find(p => p.name === playerName);
  const isHost = currentPlayer?.isHost;
  const allPlayersReady = room.players.every(p => p.isReady || p.isHost);
  const canStart = isHost && allPlayersReady && room.players.length > 1;

  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<{
    type: 'kick' | 'ban' | 'transfer' | null;
    playerName: string | null;
  }>({ type: null, playerName: null });

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.code);
  };

  const handleAction = (type: 'kick' | 'ban' | 'transfer', playerName: string) => {
    setShowConfirmation({ type, playerName });
  };

  const confirmAction = () => {
    if (!showConfirmation.type || !showConfirmation.playerName) return;

    switch (showConfirmation.type) {
      case 'kick':
        onKickPlayer?.(showConfirmation.playerName);
        break;
      case 'ban':
        onBanPlayer?.(showConfirmation.playerName);
        break;
      case 'transfer':
        onTransferHost?.(showConfirmation.playerName);
        break;
    }

    setShowConfirmation({ type: null, playerName: null });
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
                  key={player.id}
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
                  <div className="flex items-center gap-4">
                    <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                      player.isReady || player.isHost
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {player.isHost ? 'Hôte' : player.isReady ? 'Prêt' : 'En attente'}
                    </div>
                    {isHost && player.name !== playerName && (
                      <div className="relative">
                        <button
                          onClick={() => setSelectedPlayer(selectedPlayer === player.name ? null : player.name)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {selectedPlayer === player.name && (
                          <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-lg rounded-lg shadow-lg overflow-hidden z-10">
                            <button
                              onClick={() => handleAction('transfer', player.name)}
                              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors duration-200"
                            >
                              <Shield className="w-4 h-4" />
                              <span>Transférer l'hôte</span>
                            </button>
                            <button
                              onClick={() => handleAction('kick', player.name)}
                              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors duration-200 text-orange-400"
                            >
                              <UserMinus className="w-4 h-4" />
                              <span>Exclure</span>
                            </button>
                            <button
                              onClick={() => handleAction('ban', player.name)}
                              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors duration-200 text-red-400"
                            >
                              <UserX className="w-4 h-4" />
                              <span>Bannir</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
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

      {/* Modal de confirmation */}
      {showConfirmation.type && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">
              {showConfirmation.type === 'kick' && "Confirmer l'exclusion"}
              {showConfirmation.type === 'ban' && "Confirmer le bannissement"}
              {showConfirmation.type === 'transfer' && "Confirmer le transfert d'hôte"}
            </h3>
            <p className="mb-6">
              {showConfirmation.type === 'kick' && `Êtes-vous sûr de vouloir exclure ${showConfirmation.playerName} ?`}
              {showConfirmation.type === 'ban' && `Êtes-vous sûr de vouloir bannir définitivement ${showConfirmation.playerName} ?`}
              {showConfirmation.type === 'transfer' && `Êtes-vous sûr de vouloir transférer votre statut d'hôte à ${showConfirmation.playerName} ?`}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmation({ type: null, playerName: null })}
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
              >
                Annuler
              </button>
              <button
                onClick={confirmAction}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors duration-200 ${
                  showConfirmation.type === 'transfer'
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}