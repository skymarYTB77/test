import React, { useState } from 'react';
import { X, Upload, Trash2, Lock, UserX } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth';
import toast from 'react-hot-toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { background, setBackground } = useTheme();
  const { user } = useAuth();
  const [backgroundUrl, setBackgroundUrl] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackground(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (backgroundUrl) {
      setBackground(backgroundUrl);
      setBackgroundUrl('');
    }
  };

  const clearCache = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleUpdatePassword = async () => {
    if (!user || !user.email) return;

    try {
      setIsLoading(true);
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setNewPassword('');
      setCurrentPassword('');
      toast.success('Mot de passe mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du mot de passe');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !user.email) return;

    try {
      setIsLoading(true);
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await deleteUser(user);
      toast.success('Compte supprimé');
      onClose();
    } catch (error) {
      toast.error('Erreur lors de la suppression du compte');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1a1a3a] rounded-xl p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Paramètres</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-8">
          {/* Fond d'écran */}
          <section>
            <h3 className="text-lg font-medium text-white mb-4">Fond d'écran</h3>
            <div className="space-y-4">
              {/* Upload */}
              <div className="border-2 border-dashed border-[#3a3a7a] rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="background-upload"
                />
                <label htmlFor="background-upload" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-400">
                    Cliquez pour importer une image
                  </p>
                </label>
              </div>

              {/* URL */}
              <form onSubmit={handleUrlSubmit} className="space-y-2">
                <input
                  type="url"
                  value={backgroundUrl}
                  onChange={(e) => setBackgroundUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#2a2a5a] border border-[#3a3a7a] rounded-lg text-white"
                  placeholder="Ou collez un lien d'image"
                />
                <button
                  type="submit"
                  disabled={!backgroundUrl}
                  className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  Appliquer
                </button>
              </form>

              {background && (
                <button
                  onClick={() => setBackground(null)}
                  className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Supprimer le fond
                </button>
              )}
            </div>
          </section>

          {/* Sécurité */}
          <section>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Lock size={20} />
              Sécurité
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#2a2a5a] border border-[#3a3a7a] rounded-lg text-white"
                  placeholder="Mot de passe actuel"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#2a2a5a] border border-[#3a3a7a] rounded-lg text-white"
                  placeholder="Nouveau mot de passe"
                />
                <button
                  onClick={handleUpdatePassword}
                  disabled={isLoading || !currentPassword || !newPassword}
                  className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  Mettre à jour le mot de passe
                </button>
              </div>
            </div>
          </section>

          {/* Données */}
          <section>
            <h3 className="text-lg font-medium text-white mb-4">Données</h3>
            <div className="space-y-4">
              <button
                onClick={clearCache}
                className="w-full py-2 bg-[#2a2a5a] text-white rounded-lg hover:bg-[#3a3a7a] transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={20} />
                Vider le cache
              </button>
            </div>
          </section>

          {/* Danger */}
          <section>
            <h3 className="text-lg font-medium text-red-500 mb-4 flex items-center gap-2">
              <UserX size={20} />
              Zone de danger
            </h3>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Supprimer le compte
              </button>
            ) : (
              <div className="space-y-4 p-4 bg-red-500/10 rounded-lg">
                <p className="text-red-400">Cette action est irréversible. Entrez votre mot de passe pour confirmer.</p>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#2a2a5a] border border-[#3a3a7a] rounded-lg text-white"
                  placeholder="Confirmez votre mot de passe"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={!currentPassword}
                    className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    Confirmer la suppression
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}