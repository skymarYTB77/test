import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { SHA256 } from 'crypto-js';

// Validate an API key
export async function validateApiKey(key: string): Promise<boolean> {
  try {
    const apiKeysRef = collection(db, 'apiKeys');
    const q = query(apiKeysRef, where('key', '==', key));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error validating API key:', error);
    return false;
  }
}

// Import restaurants via API
export async function importRestaurantsViaApi(apiKey: string, restaurants: any[]) {
  try {
    // Validate API key
    const isValid = await validateApiKey(apiKey);
    if (!isValid) {
      throw new Error('Invalid API key');
    }

    // Add restaurants to Firestore
    const restaurantsRef = collection(db, 'restaurants_visible');
    const batch = restaurants.map(restaurant => ({
      ...restaurant,
      status: 'visible',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }));

    const results = await Promise.all(
      batch.map(restaurant => addDoc(restaurantsRef, restaurant))
    );

    return {
      success: true,
      count: results.length,
      message: `${results.length} restaurants imported successfully`
    };
  } catch (error) {
    console.error('Error importing restaurants:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred during import'
    };
  }
}