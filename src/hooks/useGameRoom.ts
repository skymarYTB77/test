import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { ref, onValue, set, update, get } from 'firebase/database';
import type { GameRoom, Player } from '../types';

export function useGameRoom(roomCode: string | null) {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomCode) {
      setRoom(null);
      setError(null);
      return;
    }

    const roomRef = ref(db, `rooms/${roomCode}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const roomData = snapshot.val() as GameRoom;
        setRoom(roomData);
        setError(null);
      } else {
        setRoom(null);
        setError('Salon introuvable');
      }
    }, (err) => {
      console.error('Error fetching room:', err);
      setError('Erreur lors de la récupération du salon');
    });

    return () => {
      unsubscribe();
      setRoom(null);
      setError(null);
    };
  }, [roomCode]);

  const createRoom = async (hostName: string, settings: GameRoom['settings']): Promise<string> => {
    if (!hostName.trim()) {
      throw new Error('Le nom du joueur est requis');
    }

    try {
      // Générer un code unique
      let code: string;
      let isUnique = false;
      
      while (!isUnique) {
        code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const roomRef = ref(db, `rooms/${code}`);
        const snapshot = await get(roomRef);
        isUnique = !snapshot.exists();
      }

      const roomRef = ref(db, `rooms/${code}`);
      
      const newRoom: GameRoom = {
        id: code,
        code: code,
        host: hostName,
        players: [{
          id: hostName,
          name: hostName,
          isHost: true,
          isReady: false
        }],
        status: 'waiting',
        settings,
        currentRound: 0,
        timeLeft: settings.timeLimit,
        answers: {}
      };

      await set(roomRef, newRoom);
      return code;
    } catch (err) {
      console.error('Error creating room:', err);
      throw new Error('Erreur lors de la création du salon');
    }
  };

  const joinRoom = async (playerName: string) => {
    if (!room || !roomCode) {
      throw new Error('Aucun salon sélectionné');
    }

    if (!playerName.trim()) {
      throw new Error('Le nom du joueur est requis');
    }

    if (room.players.some(p => p.name === playerName)) {
      throw new Error('Ce nom est déjà utilisé dans le salon');
    }

    try {
      const newPlayer: Player = {
        id: playerName,
        name: playerName,
        isHost: false,
        isReady: false
      };

      const roomRef = ref(db, `rooms/${roomCode}`);
      await update(roomRef, {
        players: [...room.players, newPlayer]
      });
    } catch (err) {
      console.error('Error joining room:', err);
      throw new Error('Erreur lors de la connexion au salon');
    }
  };

  const leaveRoom = async (playerName: string) => {
    if (!room || !roomCode) {
      throw new Error('Aucun salon sélectionné');
    }

    try {
      const roomRef = ref(db, `rooms/${roomCode}`);
      const remainingPlayers = room.players.filter(p => p.name !== playerName);
      
      if (remainingPlayers.length === 0) {
        await set(roomRef, null);
      } else {
        const updates: Partial<GameRoom> = {
          players: remainingPlayers
        };
        
        if (room.host === playerName) {
          const newHost = remainingPlayers[0];
          updates.host = newHost.name;
          updates.players = remainingPlayers.map(p => 
            p.name === newHost.name ? { ...p, isHost: true } : p
          );
        }
        
        await update(roomRef, updates);
      }
    } catch (err) {
      console.error('Error leaving room:', err);
      throw new Error('Erreur lors de la déconnexion du salon');
    }
  };

  const setPlayerReady = async (playerName: string, isReady: boolean) => {
    if (!room || !roomCode) {
      throw new Error('Aucun salon sélectionné');
    }

    try {
      const roomRef = ref(db, `rooms/${roomCode}`);
      const updatedPlayers = room.players.map(p =>
        p.name === playerName ? { ...p, isReady } : p
      );
      
      await update(roomRef, {
        players: updatedPlayers
      });
    } catch (err) {
      console.error('Error updating player ready status:', err);
      throw new Error('Erreur lors de la mise à jour du statut');
    }
  };

  const findRoomByCode = async (code: string) => {
    if (!code.trim()) {
      throw new Error('Le code du salon est requis');
    }

    try {
      const roomRef = ref(db, `rooms/${code}`);
      const snapshot = await get(roomRef);
      
      if (!snapshot.exists()) {
        throw new Error('Salon introuvable');
      }

      return snapshot.val() as GameRoom;
    } catch (err) {
      console.error('Error finding room:', err);
      throw new Error('Erreur lors de la recherche du salon');
    }
  };

  const updateGameState = async (updates: Partial<GameRoom>) => {
    if (!roomCode) {
      throw new Error('Aucun salon sélectionné');
    }

    try {
      const roomRef = ref(db, `rooms/${roomCode}`);
      await update(roomRef, updates);
    } catch (err) {
      console.error('Error updating game state:', err);
      throw new Error('Erreur lors de la mise à jour du jeu');
    }
  };

  return {
    room,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    setPlayerReady,
    findRoomByCode,
    updateGameState
  };
}