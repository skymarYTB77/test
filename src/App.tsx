import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TextTool } from './components/tools/TextTool';
import { ImageTool } from './components/tools/ImageTool';
import { FolderTool } from './components/tools/FolderTool';
import { ExportTool } from './components/tools/ExportTool';
import { IconCanvas } from './components/IconCanvas';
import { defaultImageSettings, defaultOverlaySettings, defaultTextSettings } from './types/folder';
import { Download, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { LegalModal } from './components/LegalModal';
import { ProfileMenu } from './components/ProfileMenu';
import { ProfileModal } from './components/ProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { useTheme } from './contexts/ThemeContext';
import { saveFolderIcon } from './services/folders';
import { createIcoBlob, createPngBlob } from './utils/iconConverter';
import toast from 'react-hot-toast';

const folderImages = [
  'https://res.cloudinary.com/dp1u62e2c/image/upload/v1742632209/dossier-removebg-preview_vmx772.png',
  'https://res.cloudinary.com/dp1u62e2c/image/upload/v1742633743/dossier_1_igyqow.png',
  'https://res.cloudinary.com/dp1u62e2c/image/upload/v1742633797/dossier-vide_grouhr.png',
  'https://res.cloudinary.com/dp1u62e2c/image/upload/v1742633821/dossier_2_b4iamt.png',
  'https://res.cloudinary.com/dp1u62e2c/image/upload/v1742633860/dossier_3_epivkr.png',
  'https://res.cloudinary.com/dp1u62e2c/image/upload/v1742633931/dossier_4_pgdjmf.png',
  'https://res.cloudinary.com/dp1u62e2c/image/upload/v1742633965/dossier_5_asmnp2.png',
  'https://res.cloudinary.com/dp1u62e2c/image/upload/v1742634022/dossier-3d_qjd22a.png',
  'https://res.cloudinary.com/dp1u62e2c/image/upload/v1742634042/dossier-de-presse_ui3p0z.png',
  'https://res.cloudinary.com/dp1u62e2c/image/upload/v1742634357/test_5_zhadkl.png'
];

function App() {
  const [folderName, setFolderName] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageSettings, setImageSettings] = useState<ImageSettings>(defaultImageSettings);
  const [overlaySettings, setOverlaySettings] = useState<OverlaySettings>(defaultOverlaySettings);
  const [textSettings, setTextSettings] = useState<TextSettings>(defaultTextSettings);
  const [activeTab, setActiveTab] = useState('folder');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [canvasRef] = useState<React.RefObject<HTMLCanvasElement>>(React.createRef());
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [legalModal, setLegalModal] = useState<{
    isOpen: boolean;
    title: string;
    content: React.ReactNode;
  }>({
    isOpen: false,
    title: '',
    content: null
  });

  const { user } = useAuth();
  const { theme, background } = useTheme();

  const handleImageSelect = (image: string) => {
    setSelectedImage(image);
    setHasUnsavedChanges(false);
  };

  const handleExport = async (format: 'ico' | 'png' = 'ico') => {
    if (!selectedImage) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    if (!folderName.trim()) {
      toast.error('Veuillez donner un nom au dossier');
      return;
    }

    const exportToast = toast.loading(
      format === 'ico' 
        ? 'Création du fichier ICO en cours...' 
        : 'Création du fichier PNG en cours...'
    );

    try {
      let blob: Blob;
      
      if (format === 'ico') {
        blob = await createIcoBlob(
          selectedImage,
          imageSettings,
          overlaySettings,
          textSettings,
          (progress) => {
            toast.loading(
              `Création du fichier ICO en cours... ${Math.round(progress)}%`,
              { id: exportToast }
            );
          }
        );
      } else {
        blob = await createPngBlob(
          selectedImage,
          imageSettings,
          overlaySettings,
          textSettings
        );
      }
      
      // Sauvegarder dans Firebase si l'utilisateur est connecté
      if (user) {
        await saveFolderIcon({
          userId: user.uid,
          name: folderName,
          image: selectedImage,
          imageSettings,
          overlayImage: overlaySettings.image ? overlaySettings : null,
          overlayText: textSettings.text ? textSettings : null,
          drawing: null,
          shapes: null
        });
        toast.success('Icône sauvegardée avec succès !');
        setHasUnsavedChanges(false);
      }

      // Télécharger le fichier
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${folderName}.${format}`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success('Fichier exporté avec succès !', { id: exportToast });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export', { id: exportToast });
    }
  };

  const renderToolPanel = () => {
    switch (activeTab) {
      case 'folder':
        return (
          <FolderTool
            settings={imageSettings}
            onChange={(newSettings) => {
              setImageSettings(newSettings);
              setHasUnsavedChanges(true);
            }}
          />
        );
      case 'text':
        return (
          <TextTool
            settings={textSettings}
            onChange={(newSettings) => {
              setTextSettings(newSettings);
              setHasUnsavedChanges(true);
            }}
          />
        );
      case 'image':
        return (
          <ImageTool
            settings={overlaySettings}
            onChange={(newSettings) => {
              setOverlaySettings(newSettings);
              setHasUnsavedChanges(true);
            }}
          />
        );
      case 'format':
        return (
          <ExportTool
            onExport={handleExport}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="min-h-screen text-white flex flex-col"
      style={{
        background: background 
          ? `url(${background}) center/cover no-repeat fixed`
          : theme === 'light'
          ? 'bg-white'
          : theme === 'dark'
          ? '#121212'
          : '#0a0a1f'
      }}
    >
      <div className={`flex-1 backdrop-blur-xl border border-[#2a2a5a] ${
        theme === 'light'
          ? 'bg-white/80'
          : theme === 'dark'
          ? 'bg-[#121212]/80'
          : 'bg-[#1a1a3a]/80'
      }`}>
        <div className="p-4 flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              {selectedImage && (
                <button
                  onClick={() => {
                    if (hasUnsavedChanges) {
                      setShowConfirmModal(true);
                    } else {
                      setSelectedImage(null);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2a2a5a] hover:bg-[#3a3a7a] rounded-xl transition-all duration-300"
                >
                  <ArrowLeft size={20} />
                  Retour
                </button>
              )}
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Créateur d'Icônes de Dossier
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <button
                  onClick={() => setIsDashboardOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl transition-all duration-300"
                >
                  <LayoutDashboard size={20} />
                  Tableau de bord
                </button>
              )}
              {user ? (
                <ProfileMenu
                  onOpenProfile={() => setIsProfileModalOpen(true)}
                  onOpenSettings={() => setIsSettingsModalOpen(true)}
                />
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl transition-all duration-300"
                >
                  Se connecter
                </button>
              )}
            </div>
          </div>

          {!selectedImage ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 flex-1 overflow-y-auto p-4">
              {folderImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => handleImageSelect(image)}
                  className="group relative aspect-square rounded-2xl border-2 border-[#2a2a5a] hover:border-blue-500 transition-all duration-300 p-4 bg-[#1a1a3a] hover:bg-[#2a2a5a] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <img
                    src={image}
                    alt={`Dossier ${index + 1}`}
                    className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300"
                    crossOrigin="anonymous"
                  />
                </button>
              ))}
            </div>
          ) : (
            <div className="flex gap-6 flex-1">
              <div className="flex-1 flex flex-col">
                <div className="mb-6">
                  <label className="block text-lg font-medium mb-3">
                    Nom du dossier
                  </label>
                  <input
                    type="text"
                    value={folderName}
                    onChange={(e) => {
                      setFolderName(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="Mon dossier"
                    className="w-full p-3 bg-[#2a2a5a] border border-[#3a3a7a] rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-white"
                  />
                </div>

                <div className="relative flex-1 rounded-2xl border-2 border-[#2a2a5a] p-4 mb-6 bg-[#1a1a3a] flex items-center justify-center">
                  <div className="relative w-[512px] h-[512px]">
                    <IconCanvas
                      ref={canvasRef}
                      mainImage={selectedImage}
                      imageSettings={imageSettings}
                      overlaySettings={overlaySettings}
                      textSettings={textSettings}
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleExport(localStorage.getItem('preferredFormat') as 'ico' | 'png' || 'ico')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition-colors"
                >
                  <Download size={20} />
                  Télécharger et sauvegarder
                </button>
              </div>

              <div className="flex">
                <div className="w-80 bg-[#1a1a3a] border-y border-l border-[#2a2a5a] rounded-l-xl overflow-y-auto">
                  {renderToolPanel()}
                </div>
                <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
              </div>
            </div>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <Dashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        onEdit={(icon) => {
          setFolderName(icon.name);
          setSelectedImage(icon.image);
          setImageSettings(icon.imageSettings);
          if (icon.overlayImage) {
            setOverlaySettings(icon.overlayImage);
          }
          if (icon.overlayText) {
            setTextSettings(icon.overlayText);
          }
          setIsDashboardOpen(false);
          setHasUnsavedChanges(false);
        }}
      />

      <LegalModal
        isOpen={legalModal.isOpen}
        onClose={() => setLegalModal({ ...legalModal, isOpen: false })}
        title={legalModal.title}
        content={legalModal.content}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
}

export default App;