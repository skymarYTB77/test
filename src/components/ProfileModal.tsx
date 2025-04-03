import React, { useState, useRef } from 'react';
import { X, Upload, Loader2, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import toast from 'react-hot-toast';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !user) return;

    try {
      setIsLoading(true);
      const file = e.target.files[0];
      const storageRef = ref(storage, `profile-photos/${user.uid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      await updateProfile(user, { photoURL });
      toast.success('Photo de profil mise à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de la photo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      await updateProfile(user, { displayName });
      toast.success('Profil mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1a1a3a] rounded-xl p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Mon Profil</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Photo de profil */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-24 h-24">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <User size={40} className="text-white" />
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-blue-500 rounded-full hover:bg-blue-600 transition-colors"
              >
                <Upload size={16} className="text-white" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          {/* Nom d'utilisateur */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 bg-[#2a2a5a] border border-[#3a3a7a] rounded-lg text-white"
              placeholder="Votre nom"
            />
          </div>

          {/* Bouton de mise à jour */}
          <button
            onClick={handleUpdateProfile}
            disabled={isLoading}
            className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="animate-spin h-5 w-5 mx-auto" />
            ) : (
              'Mettre à jour le profil'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}