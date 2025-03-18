import { useEffect, useState } from 'react';
import { ref, onValue, set, push, remove } from 'firebase/database';
import { database } from '../lib/firebase';

export interface Restaurant {
  Nom: string;
  Étoiles: string;
  "Nombre d'Avis": string;
  Type: string;
  Adresse: string;
  Téléphone: string;
  "Lien Site Web": string;
  "Horaires d'ouverture"?: string;
  Classification?: string;
  Note?: string;
  lat?: number;
  lng?: number;
  [key: string]: string | number | undefined;
}

export function useFirebaseData() {
  const [visibleData, setVisibleData] = useState<Restaurant[]>([]);
  const [acceptedData, setAcceptedData] = useState<Restaurant[]>([]);
  const [rejectedData, setRejectedData] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const visibleRef = ref(database, 'restaurants/visible');
    const acceptedRef = ref(database, 'restaurants/accepted');
    const rejectedRef = ref(database, 'restaurants/rejected');

    const unsubscribeVisible = onValue(visibleRef, (snapshot) => {
      const data = snapshot.val();
      setVisibleData(data ? Object.values(data) : []);
    });

    const unsubscribeAccepted = onValue(acceptedRef, (snapshot) => {
      const data = snapshot.val();
      setAcceptedData(data ? Object.values(data) : []);
    });

    const unsubscribeRejected = onValue(rejectedRef, (snapshot) => {
      const data = snapshot.val();
      setRejectedData(data ? Object.values(data) : []);
      setLoading(false);
    });

    return () => {
      unsubscribeVisible();
      unsubscribeAccepted();
      unsubscribeRejected();
    };
  }, []);

  const addRestaurant = async (restaurant: Restaurant) => {
    try {
      const visibleRef = ref(database, 'restaurants/visible');
      await push(visibleRef, restaurant);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return false;
    }
  };

  const moveRestaurant = async (restaurant: Restaurant, fromStatus: string, toStatus: string) => {
    try {
      const fromRef = ref(database, `restaurants/${fromStatus}`);
      const toRef = ref(database, `restaurants/${toStatus}`);
      
      // Remove from old status
      await remove(fromRef);
      
      // Add to new status
      await push(toRef, restaurant);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return false;
    }
  };

  const deleteRestaurant = async (status: string, restaurantId: string) => {
    try {
      const restaurantRef = ref(database, `restaurants/${status}/${restaurantId}`);
      await remove(restaurantRef);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return false;
    }
  };

  const updateRestaurant = async (status: string, restaurantId: string, updates: Partial<Restaurant>) => {
    try {
      const restaurantRef = ref(database, `restaurants/${status}/${restaurantId}`);
      await set(restaurantRef, updates);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return false;
    }
  };

  return {
    visibleData,
    acceptedData,
    rejectedData,
    loading,
    error,
    addRestaurant,
    moveRestaurant,
    deleteRestaurant,
    updateRestaurant
  };
}