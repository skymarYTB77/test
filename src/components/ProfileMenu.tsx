import React, { useState } from 'react';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProfileMenuProps {
  onOpenProfile: () => void;
  onOpenSettings: () => void;
}

export function ProfileMenu({ onOpenProfile, onOpenSettings }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-[#2a2a5a] hover:bg-[#3a3a7a] rounded-xl transition-all duration-300"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User size={20} className="text-white" />
          )}
        </div>
        <span className="text-white">{user?.displayName || 'Utilisateur'}</span>
        <ChevronDown size={20} className="text-white" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#2a2a5a] rounded-xl shadow-lg py-1 z-50">
          <button
            onClick={() => {
              onOpenProfile();
              setIsOpen(false);
            }}
            className="flex items-center gap-2 px-4 py-2 text-white hover:bg-[#3a3a7a] w-full text-left"
          >
            <User size={18} />
            Mon Profil
          </button>
          <button
            onClick={() => {
              onOpenSettings();
              setIsOpen(false);
            }}
            className="flex items-center gap-2 px-4 py-2 text-white hover:bg-[#3a3a7a] w-full text-left"
          >
            <Settings size={18} />
            Paramètres
          </button>
          <hr className="border-[#3a3a7a] my-1" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-[#3a3a7a] w-full text-left"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}