import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Restaurant {
  id?: string;
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
  category: 'Restaurants' | 'Hôtels';
  [key: string]: string | number | undefined;
}

interface RestaurantState {
  visibleData: Restaurant[];
  acceptedData: Restaurant[];
  rejectedData: Restaurant[];
  past: {
    visibleData: Restaurant[];
    acceptedData: Restaurant[];
    rejectedData: Restaurant[];
  }[];
  future: {
    visibleData: Restaurant[];
    acceptedData: Restaurant[];
    rejectedData: Restaurant[];
  }[];
  loading: boolean;
  error: string | null;
}

const initialState: RestaurantState = {
  visibleData: [],
  acceptedData: [],
  rejectedData: [],
  past: [],
  future: [],
  loading: false,
  error: null
};

const saveToHistory = (state: RestaurantState) => {
  state.past.push({
    visibleData: [...state.visibleData],
    acceptedData: [...state.acceptedData],
    rejectedData: [...state.rejectedData]
  });
  state.future = [];
};

const getCollectionForStatus = (status: 'visible' | 'accepted' | 'rejected', category: 'Restaurants' | 'Hôtels') => {
  const prefix = category.toLowerCase();
  switch (status) {
    case 'visible':
      return `${prefix}_visible`;
    case 'accepted':
      return `${prefix}_accepted`;
    case 'rejected':
      return `${prefix}_rejected`;
  }
};

export const restaurantSlice = createSlice({
  name: 'restaurants',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setInitialData: (state, action: PayloadAction<{
      visible: Restaurant[];
      accepted: Restaurant[];
      rejected: Restaurant[];
    }>) => {
      state.visibleData = action.payload.visible;
      state.acceptedData = action.payload.accepted;
      state.rejectedData = action.payload.rejected;
    },
    addRestaurantSuccess: (state, action: PayloadAction<Restaurant>) => {
      saveToHistory(state);
      state.visibleData.push(action.payload);
    },
    deleteRestaurantSuccess: (state, action: PayloadAction<{ id: string; database: 'visible' | 'accepted' | 'rejected' }>) => {
      saveToHistory(state);
      const { id, database } = action.payload;
      if (database === 'visible') {
        state.visibleData = state.visibleData.filter(r => r.id !== id);
      } else if (database === 'accepted') {
        state.acceptedData = state.acceptedData.filter(r => r.id !== id);
      } else {
        state.rejectedData = state.rejectedData.filter(r => r.id !== id);
      }
    },
    moveRestaurantSuccess: (state, action: PayloadAction<{
      restaurant: Restaurant;
      fromStatus: 'visible' | 'accepted' | 'rejected';
      toStatus: 'visible' | 'accepted' | 'rejected';
    }>) => {
      saveToHistory(state);
      const { restaurant, fromStatus, toStatus } = action.payload;
      
      if (fromStatus === 'visible') {
        state.visibleData = state.visibleData.filter(r => r.id !== restaurant.id);
      } else if (fromStatus === 'accepted') {
        state.acceptedData = state.acceptedData.filter(r => r.id !== restaurant.id);
      } else {
        state.rejectedData = state.rejectedData.filter(r => r.id !== restaurant.id);
      }

      if (toStatus === 'visible') {
        state.visibleData.push(restaurant);
      } else if (toStatus === 'accepted') {
        state.acceptedData.push(restaurant);
      } else {
        state.rejectedData.push(restaurant);
      }
    },
    updateRestaurantSuccess: (state, action: PayloadAction<{
      restaurant: Restaurant;
      database: 'visible' | 'accepted' | 'rejected';
    }>) => {
      saveToHistory(state);
      const { restaurant, database } = action.payload;
      if (database === 'visible') {
        state.visibleData = state.visibleData.map(r => r.id === restaurant.id ? restaurant : r);
      } else if (database === 'accepted') {
        state.acceptedData = state.acceptedData.map(r => r.id === restaurant.id ? restaurant : r);
      } else {
        state.rejectedData = state.rejectedData.map(r => r.id === restaurant.id ? restaurant : r);
      }
    },
    undo: (state) => {
      if (state.past.length > 0) {
        const previous = state.past[state.past.length - 1];
        state.future.push({
          visibleData: [...state.visibleData],
          acceptedData: [...state.acceptedData],
          rejectedData: [...state.rejectedData]
        });
        state.visibleData = [...previous.visibleData];
        state.acceptedData = [...previous.acceptedData];
        state.rejectedData = [...previous.rejectedData];
        state.past.pop();
      }
    },
    redo: (state) => {
      if (state.future.length > 0) {
        const next = state.future[state.future.length - 1];
        state.past.push({
          visibleData: [...state.visibleData],
          acceptedData: [...state.acceptedData],
          rejectedData: [...state.rejectedData]
        });
        state.visibleData = [...next.visibleData];
        state.acceptedData = [...next.acceptedData];
        state.rejectedData = [...next.rejectedData];
        state.future.pop();
      }
    }
  }
});

// Thunks
export const fetchRestaurants = (category: 'Restaurants' | 'Hôtels') => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    
    const [visibleSnapshot, acceptedSnapshot, rejectedSnapshot] = await Promise.all([
      getDocs(collection(db, getCollectionForStatus('visible', category))),
      getDocs(collection(db, getCollectionForStatus('accepted', category))),
      getDocs(collection(db, getCollectionForStatus('rejected', category)))
    ]);

    const visible = visibleSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Restaurant[];
    const accepted = acceptedSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Restaurant[];
    const rejected = rejectedSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Restaurant[];

    dispatch(setInitialData({ visible, accepted, rejected }));
  } catch (error) {
    dispatch(setError(error instanceof Error ? error.message : 'Une erreur est survenue'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const addRestaurant = (restaurant: Omit<Restaurant, 'id'>) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    const restaurantsRef = collection(db, getCollectionForStatus('visible', restaurant.category));
    const docRef = await addDoc(restaurantsRef, {
      ...restaurant,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    dispatch(addRestaurantSuccess({ ...restaurant, id: docRef.id }));
  } catch (error) {
    dispatch(setError(error instanceof Error ? error.message : 'Une erreur est survenue'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const deleteRestaurant = (
  id: string,
  database: 'visible' | 'accepted' | 'rejected',
  category: 'Restaurants' | 'Hôtels'
) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    const collectionName = getCollectionForStatus(database, category);
    const restaurantRef = doc(db, collectionName, id);
    await deleteDoc(restaurantRef);
    dispatch(deleteRestaurantSuccess({ id, database }));
  } catch (error) {
    dispatch(setError(error instanceof Error ? error.message : 'Une erreur est survenue'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const moveRestaurant = (
  restaurant: Restaurant,
  fromStatus: 'visible' | 'accepted' | 'rejected',
  toStatus: 'visible' | 'accepted' | 'rejected'
) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    
    // Delete from source collection
    const sourceCollection = getCollectionForStatus(fromStatus, restaurant.category);
    await deleteDoc(doc(db, sourceCollection, restaurant.id!));
    
    // Add to destination collection
    const destCollection = getCollectionForStatus(toStatus, restaurant.category);
    const docRef = await addDoc(collection(db, destCollection), {
      ...restaurant,
      updatedAt: serverTimestamp()
    });
    
    dispatch(moveRestaurantSuccess({ 
      restaurant: { ...restaurant, id: docRef.id }, 
      fromStatus, 
      toStatus 
    }));
  } catch (error) {
    dispatch(setError(error instanceof Error ? error.message : 'Une erreur est survenue'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const updateRestaurant = (
  restaurant: Restaurant,
  database: 'visible' | 'accepted' | 'rejected'
) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    const collectionName = getCollectionForStatus(database, restaurant.category);
    const restaurantRef = doc(db, collectionName, restaurant.id!);
    const updatedRestaurant = {
      ...restaurant,
      updatedAt: serverTimestamp()
    };
    await updateDoc(restaurantRef, updatedRestaurant);
    dispatch(updateRestaurantSuccess({ restaurant: updatedRestaurant, database }));
  } catch (error) {
    dispatch(setError(error instanceof Error ? error.message : 'Une erreur est survenue'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const importRestaurants = (restaurants: Restaurant[]) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    const batch = writeBatch(db);
    
    // Group restaurants by category
    const restaurantsByCategory = restaurants.reduce((acc, restaurant) => {
      const category = restaurant.category || 'Restaurants';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(restaurant);
      return acc;
    }, {} as Record<'Restaurants' | 'Hôtels', Restaurant[]>);

    // Add each restaurant to its respective collection
    Object.entries(restaurantsByCategory).forEach(([category, items]) => {
      const visibleRef = collection(db, getCollectionForStatus('visible', category as 'Restaurants' | 'Hôtels'));
      items.forEach(restaurant => {
        const newDocRef = doc(visibleRef);
        batch.set(newDocRef, {
          ...restaurant,
          category, // Ensure category is set
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });
    });

    await batch.commit();
    
    // Fetch data for the current category only
    const currentCategory = store.getState().category.currentCategory;
    await dispatch(fetchRestaurants(currentCategory));
  } catch (error) {
    dispatch(setError(error instanceof Error ? error.message : 'Une erreur est survenue'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const {
  setLoading,
  setError,
  setInitialData,
  addRestaurantSuccess,
  deleteRestaurantSuccess,
  moveRestaurantSuccess,
  updateRestaurantSuccess,
  undo,
  redo
} = restaurantSlice.actions;

export default restaurantSlice.reducer;