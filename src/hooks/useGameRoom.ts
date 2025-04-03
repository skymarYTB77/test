import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, doc, onSnapshot, setDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import type { GameRoom, Player } from '../types';

export function useGameRoom(roomCode: string | null) {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomCode) return;

    const unsubscribe = onSnapshot(
      doc(db, 'rooms', roomCode),
      (doc) => {
        if (doc.exists()) {
          setRoom(doc.data() as GameRoom);
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

    return () => unsubscribe();
  }, [roomCode]);

  const createRoom = async (hostName: string, settings: GameRoom['settings']) => {
    try {
      const roomsRef = collection(db, 'rooms');
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const newRoom: GameRoom = {
        id: code,
        code,
        host: hostName,
        players: [{
          id: hostName,
          name: hostName,
          isHost: true,
          isReady: true
        }],
        status: 'waiting',
        settings
      };

      await setDoc(doc(roomsRef, code), newRoom);
      return code;
    } catch (err) {
      console.error('Error creating room:', err);
      throw new Error('Erreur lors de la création du salon');
    }
  };

  const joinRoom = async (playerName: string) => {
    if (!room || !roomCode) return;

    try {
      const newPlayer: Player = {
        id: playerName,
        name: playerName,
        isHost: false,
        isReady: false
      };

      await updateDoc(doc(db, 'rooms', roomCode), {
        players: [...room.players, newPlayer]
      });
    } catch (err) {
      console.error('Error joining room:', err);
      throw new Error('Erreur lors de la connexion au salon');
    }
  };

  const leaveRoom = async (playerName: string) => {
    if (!room || !roomCode) return;

    try {
      await updateDoc(doc(db, 'rooms', roomCode), {
        players: room.players.filter(p => p.name !== playerName)
      });
    } catch (err) {
      console.error('Error leaving room:', err);
      throw new Error('Erreur lors de la déconnexion du salon');
    }
  };

  const findRoomByCode = async (code: string) => {
    try {
      const roomsRef = collection(db, 'rooms');
      const q = query(roomsRef, where('code', '==', code));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Salon introuvable');
      }

      return querySnapshot.docs[0].data() as GameRoom;
    } catch (err) {
      console.error('Error finding room:', err);
      throw new Error('Erreur lors de la recherche du salon');
    }
  };

  return {
    room,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    findRoomByCode
  };
}