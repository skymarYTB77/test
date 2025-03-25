import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { FolderIcon } from '../types/folder';

export const saveFolderIcon = async (folderIcon: Omit<FolderIcon, 'createdAt'>) => {
  try {
    if (folderIcon.id) {
      const docRef = doc(db, 'folderIcons', folderIcon.id);
      const { id, ...updateData } = folderIcon;
      await updateDoc(docRef, updateData);
      return id;
    } else {
      const docRef = await addDoc(collection(db, 'folderIcons'), {
        ...folderIcon,
        createdAt: new Date()
      });
      return docRef.id;
    }
  } catch (error) {
    console.error('Error saving folder icon:', error);
    throw error;
  }
};

export const getUserFolderIcons = async (userId: string): Promise<FolderIcon[]> => {
  try {
    const q = query(
      collection(db, 'folderIcons'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as FolderIcon[];
  } catch (error) {
    console.error('Error fetching user folder icons:', error);
    throw error;
  }
};

export const deleteFolderIcon = async (iconId: string) => {
  try {
    await deleteDoc(doc(db, 'folderIcons', iconId));
  } catch (error) {
    console.error('Error deleting folder icon:', error);
    throw error;
  }
};

export const updateFolderIcon = async (iconId: string, data: Partial<FolderIcon>) => {
  try {
    const docRef = doc(db, 'folderIcons', iconId);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error('Error updating folder icon:', error);
    throw error;
  }
};