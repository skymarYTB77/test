import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { v4 as uuidv4 } from 'uuid';
import { SHA256 } from 'crypto-js';
import { Settings, Copy, Key, Trash2, X } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: any;
  userId: string;
}

export function ApiKeyManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (auth.currentUser) {
      fetchApiKeys();
    }
  }, []);

  const fetchApiKeys = async () => {
    try {
      if (!auth.currentUser) return;

      const apiKeysRef = collection(db, 'apiKeys');
      const q = query(apiKeysRef, where('userId', '==', auth.currentUser.uid));
      const snapshot = await getDocs(q);
      const keys = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ApiKey[];
      setApiKeys(keys);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      setMessage('Erreur lors de la récupération des clés API');
    }
  };

  const generateApiKey = async () => {
    if (!auth.currentUser) return;
    
    if (!newKeyName.trim()) {
      setMessage('Veuillez entrer un nom pour la clé API');
      return;
    }

    try {
      const uuid = uuidv4();
      const hashedKey = SHA256(uuid).toString();
      const apiKey = {
        name: newKeyName,
        key: hashedKey,
        createdAt: serverTimestamp(),
        userId: auth.currentUser.uid
      };

      const apiKeysRef = collection(db, 'apiKeys');
      await addDoc(apiKeysRef, apiKey);
      
      setMessage('Nouvelle clé API générée !');
      setNewKeyName('');
      fetchApiKeys();
    } catch (error) {
      console.error('Error generating API key:', error);
      setMessage('Erreur lors de la génération de la clé API');
    }
  };

  const deleteApiKey = async (id: string) => {
    try {
      const apiKeyRef = doc(db, 'apiKeys', id);
      await deleteDoc(apiKeyRef);
      setMessage('Clé API supprimée !');
      fetchApiKeys();
    } catch (error) {
      console.error('Error deleting API key:', error);
      setMessage('Erreur lors de la suppression de la clé API');
    }
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setMessage('Clé API copiée !');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        <Settings className="h-5 w-5 text-white" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Gestion des clés API</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Nom de la clé API"
                  className="flex-1 bg-gray-700 text-white rounded-md px-4 py-2 border border-gray-600 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={generateApiKey}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Key size={16} />
                  Générer
                </button>
              </div>
            </div>

            {message && (
              <div className="mb-4 p-3 bg-gray-700 text-white rounded-md">
                {message}
              </div>
            )}

            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="bg-gray-700 rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-white font-medium">{key.name}</h3>
                    <p className="text-gray-400 text-sm font-mono mt-1">{key.key}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Créée le {new Date(key.createdAt?.toDate()).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(key.key)}
                      className="text-gray-400 hover:text-white p-2 rounded-md hover:bg-gray-600"
                      title="Copier la clé"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => deleteApiKey(key.id)}
                      className="text-red-400 hover:text-red-300 p-2 rounded-md hover:bg-gray-600"
                      title="Supprimer la clé"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}