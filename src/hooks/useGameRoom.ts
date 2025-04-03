import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  getDoc,
  deleteDoc
} from 'firebase/firestore';
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

    const unsubscribe = onSnapshot(
      doc(db, 'games', roomCode),
      (snapshot) => {
        if (snapshot.exists()) {
          const roomData = snapshot.data() as GameRoom;
          setRoom(roomData);
          setError(null);
        } else {
          setRoom(null);
          setError('Salon introuvable');
        }
      },
      (err) => {
        console.error('Error fetching room:', err);
        setError('Erreur lors de la récupération du salon');
      }
    );

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
      let code: string;
      let isUnique = false;
      
      while (!isUnique) {
        code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const roomDoc = await getDoc(doc(db, 'games', code));
        isUnique = !roomDoc.exists();
      }

      const playerId = Math.random().toString(36).substring(2);
      
      const newRoom: GameRoom = {
        id: code,
        code: code,
        host: hostName,
        players: [{
          id: playerId,
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

      await setDoc(doc(db, 'games', code), newRoom);
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
      const playerId = Math.random().toString(36).substring(2);
      const newPlayer: Player = {
        id: playerId,
        name: playerName,
        isHost: false,
        isReady: false
      };

      await updateDoc(doc(db, 'games', roomCode), {
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
      const remainingPlayers = room.players.filter(p => p.name !== playerName);
      
      if (remainingPlayers.length === 0) {
        await deleteDoc(doc(db, 'games', roomCode));
      } else {
        const updates: Partial<GameRoom> = {
          players: remainingPlayers
        };
        
        if (room.host === playerName) {
          const newHost = remainingPlayers[0];
          updates.host = newHost.name;
          updates.players = remainingPlayers.map(p => 
            p.id === newHost.id ? { ...p, isHost: true } : p
          );
        }
        
        await updateDoc(doc(db, 'games', roomCode), updates);
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
      const updatedPlayers = room.players.map(p =>
        p.name === playerName ? { ...p, isReady } : p
      );
      
      await updateDoc(doc(db, 'games', roomCode), {
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
      const roomDoc = await getDoc(doc(db, 'games', code));
      
      if (!roomDoc.exists()) {
        throw new Error('Salon introuvable');
      }

      return roomDoc.data() as GameRoom;
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
      await updateDoc(doc(db, 'games', roomCode), updates);
    } catch (err) {
      console.error('Error updating game state:', err);
      throw new Error('Erreur lors de la mise à jour du jeu');
    }
  };

  const deleteRoom = async (code: string) => {
    try {
      await deleteDoc(doc(db, 'games', code));
    } catch (err) {
      console.error('Error deleting room:', err);
      throw new Error('Erreur lors de la suppression du salon');
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
    updateGameState,
    deleteRoom
  };
}