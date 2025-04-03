import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { TextTool } from './components/tools/TextTool';
import { ImageTool } from './components/tools/ImageTool';
import { FolderTool } from './components/tools/FolderTool';
import { FormatTool } from './components/tools/FormatTool';
import { IconCanvas } from './components/IconCanvas';
import { defaultImageSettings, defaultOverlaySettings, defaultTextSettings, ExportFormat } from './types/folder';
import { Download, LayoutDashboard, ArrowLeft, X } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { LegalModal } from './components/LegalModal';
import { ProfileMenu } from './components/ProfileMenu';
import { ProfileModal } from './components/ProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { useTheme } from './contexts/ThemeContext';
import { saveFolderIcon } from './services/folders';
import toast from 'react-hot-toast';

const folderImages = [
  'https://res.cloudinary.com/dp1u62e2c/image/upload/v1743627455/Dossier_1_oyjjb9.svg',
  'https://res.cloudinary.com/dp1u62e2c/image/upload/v1743627455/Dossier_2_lj5ivq.svg',
  'https://res.cloudinary.com/dp1u62e2c/image/upload/v1743627459/Dossier_3_rrntkt.svg',
  'https://res.cloudinary.com/dp1u62e2c/image/upload/v1743627455/Dossier_4_c2zhoj.svg',
  'https://res.cloudinary.com/dp1u62e2c/image/upload/v1743627456/Dossier_5_rxykop.svg',
  'https://res.cloudinary.com/dp1u62e2c/image/upload/v1743627457/Dossier_6_bpqhd6.svg',
  'https://res.cloudinary.com/dp1u62e2c/image/upload/v1743627455/Dossier_7_dscdon.svg',
  'https://res.cloudinary.com/dp1u62e2c/image/upload/v1743627458/Dossier_8_owljjd.svg',
  'https://res.cloudinary.com/dp1u62e2c/image/upload/v1743627460/Dossier_9_cy8p9w.svg',
  'https://res.cloudinary.com/dp1u62e2c/image/upload/v1743627455/Dossier_10_btmy1w.svg'
];

function App() {
  const [folderName, setFolderName] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageSettings, setImageSettings] = useState<ImageSettings>(defaultImageSettings);
  const [overlaySettings, setOverlaySettings] = useState<OverlaySettings>(defaultOverlaySettings);
  const [textSettings, setTextSettings] = useState<TextSettings>(defaultTextSettings);
  const [activeTab, setActiveTab] = useState('folder');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');
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
  
  const { user, logout } = useAuth();
  const { theme, background } = useTheme();

  const handleDrag = (type: 'text' | 'image', data: { x: number; y: number }) => {
    if (type === 'text') {
      setTextSettings(prev => ({
        ...prev,
        x: data.x,
        y: data.y
      }));
    } else {
      setOverlaySettings(prev => ({
        ...prev,
        x: data.x,
        y: data.y
      }));
    }
    setHasUnsavedChanges(true);
  };

  const resetSettings = () => {
    setFolderName('');
    setImageSettings(defaultImageSettings);
    setOverlaySettings(defaultOverlaySettings);
    setTextSettings(defaultTextSettings);
    setHasUnsavedChanges(false);
  };

  const convertToIco = async (canvas: HTMLCanvasElement): Promise<Blob> => {
    const ICON_SIZES = [
      { width: 16, height: 16, usePNG: false },
      { width: 32, height: 32, usePNG: false },
      { width: 48, height: 48, usePNG: false },
      { width: 64, height: 64, usePNG: false },
      { width: 128, height: 128, usePNG: true },
      { width: 256, height: 256, usePNG: true }
    ];

    const createIconHeader = (numImages: number) => {
      const buffer = new ArrayBuffer(6);
      const view = new DataView(buffer);
      view.setInt16(0, 0, true); // Reserved
      view.setInt16(2, 1, true); // ICO type
      view.setInt16(4, numImages, true); // Number of images
      return buffer;
    };

    const createIconDirectoryEntry = (width: number, height: number, size: number, offset: number) => {
      const buffer = new ArrayBuffer(16);
      const view = new DataView(buffer);
      view.setInt8(0, width === 256 ? 0 : width);
      view.setInt8(1, height === 256 ? 0 : height);
      view.setInt8(2, 0); // Color palette
      view.setInt8(3, 0); // Reserved
      view.setInt16(4, 1, true); // Color planes
      view.setInt16(6, 32, true); // Bits per pixel
      view.setInt32(8, size, true); // Image size
      view.setInt32(12, offset, true); // Image offset
      return buffer;
    };

    const createBMPHeader = (width: number, height: number) => {
      const buffer = new ArrayBuffer(40);
      const view = new DataView(buffer);
      view.setInt32(0, 40, true); // Header size
      view.setInt32(4, width, true);
      view.setInt32(8, height * 2, true); // Height is doubled for BMP
      view.setInt16(12, 1, true); // Planes
      view.setInt16(14, 32, true); // Bits per pixel
      view.setInt32(16, 0, true); // Compression
      view.setInt32(20, 0, true); // Image size (can be 0 for uncompressed)
      view.setInt32(24, 0, true); // X pixels per meter
      view.setInt32(28, 0, true); // Y pixels per meter
      view.setInt32(32, 0, true); // Colors in color table
      view.setInt32(36, 0, true); // Important color count
      return buffer;
    };

    const resizeImage = async (img: HTMLImageElement, width: number, height: number, usePNG: boolean): Promise<ArrayBuffer> => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = width;
      canvas.height = height;

      if (!ctx) throw new Error('Impossible de créer le contexte 2D');

      ctx.clearRect(0, 0, width, height);
      
      const scale = Math.min(width / img.width, height / img.height);
      const x = (width - img.width * scale) / 2;
      const y = (height - img.height * scale) / 2;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      if (!usePNG) {
        const headerSize = 40;
        const pixelDataSize = width * height * 4;
        const buffer = new ArrayBuffer(headerSize + pixelDataSize);
        const view = new Uint8Array(buffer);

        const header = new Uint8Array(createBMPHeader(width, height));
        view.set(header, 0);

        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const sourceOffset = (y * width + x) * 4;
            const targetOffset = headerSize + ((height - 1 - y) * width + x) * 4;
            
            view[targetOffset] = data[sourceOffset + 2];
            view[targetOffset + 1] = data[sourceOffset + 1];
            view[targetOffset + 2] = data[sourceOffset];
            view[targetOffset + 3] = data[sourceOffset + 3];
          }
        }

        return buffer;
      } else {
        return new Promise((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                blob.arrayBuffer().then(resolve).catch(reject);
              } else {
                reject(new Error('La conversion a échoué'));
              }
            },
            'image/png'
          );
        });
      }
    };

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        try {
          const imageBuffers: { size: typeof ICON_SIZES[0]; buffer: ArrayBuffer }[] = [];

          for (const size of ICON_SIZES) {
            const buffer = await resizeImage(img, size.width, size.height, size.usePNG);
            imageBuffers.push({ size, buffer });
          }

          const headerSize = 6;
          const dirEntrySize = 16;
          const dirEntriesSize = ICON_SIZES.length * dirEntrySize;
          
          let offset = headerSize + dirEntriesSize;
          const totalSize = imageBuffers.reduce((sum, { buffer }) => sum + buffer.byteLength, offset);
          
          const finalBuffer = new ArrayBuffer(totalSize);
          const finalArray = new Uint8Array(finalBuffer);

          const headerBuffer = createIconHeader(ICON_SIZES.length);
          finalArray.set(new Uint8Array(headerBuffer), 0);

          let currentOffset = offset;
          imageBuffers.forEach(({ size, buffer }, index) => {
            const entry = createIconDirectoryEntry(size.width, size.height, buffer.byteLength, currentOffset);
            finalArray.set(new Uint8Array(entry), headerSize + (index * dirEntrySize));
            currentOffset += buffer.byteLength;
          });

          imageBuffers.forEach(({ buffer }, index) => {
            const imageData = new Uint8Array(buffer);
            const imageOffset = offset + imageBuffers
              .slice(0, index)
              .reduce((sum, { buffer }) => sum + buffer.byteLength, 0);
            finalArray.set(imageData, imageOffset);
          });

          resolve(new Blob([finalBuffer], { type: 'image/x-icon' }));
        } catch (err) {
          reject(err);
        }
      };
      img.src = canvas.toDataURL('image/png');
    });
  };

  const handleExport = async () => {
    if (!selectedImage) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    if (!folderName.trim()) {
      toast.error('Veuillez donner un nom au dossier');
      return;
    }

    if (canvasRef.current) {
      try {
        let dataUrl: string;
        let blob: Blob;
        
        if (exportFormat === 'ico') {
          blob = await convertToIco(canvasRef.current);
          dataUrl = URL.createObjectURL(blob);
        } else {
          dataUrl = canvasRef.current.toDataURL('image/png');
        }
        
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

        const link = document.createElement('a');
        link.download = `${folderName}.${exportFormat}`;
        link.href = dataUrl;
        link.click();

        if (exportFormat === 'ico') {
          URL.revokeObjectURL(dataUrl);
        }
      } catch (error) {
        toast.error('Erreur lors de la sauvegarde ou de l\'exportation');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Déconnexion réussie');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const handleImageSelect = (image: string) => {
    setSelectedImage(image);
    setHasUnsavedChanges(false);
  };

  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      setShowConfirmModal(true);
    } else {
      setSelectedImage(null);
      resetSettings();
    }
  };

  const showPrivacyPolicy = () => {
    setLegalModal({
      isOpen: true,
      title: 'Politique de confidentialité',
      content: (
        <div>
          <p>Dernière mise à jour : 25/03/2025</p>

          <p>Nous accordons une grande importance à la protection de vos données personnelles. Cette politique de confidentialité explique quelles informations nous collectons, comment nous les utilisons et quels sont vos droits.</p>

          <h3>1. Informations collectées</h3>
          <p>Nous collectons les données suivantes lorsque vous utilisez notre application :</p>
          <ul>
            <li>Informations de compte : Lorsque vous vous inscrivez, nous collectons votre adresse e-mail et toute information fournie via Firebase Authentication.</li>
            <li>Données d'utilisation : Nous collectons des informations sur votre activité, telles que la création et la personnalisation d'icônes.</li>
            <li>Fichiers et images : Toute image ou fichier importé est stocké de manière sécurisée sur Firebase Storage.</li>
          </ul>

          <h3>2. Utilisation des données</h3>
          <p>Vos données sont utilisées pour :</p>
          <ul>
            <li>Fournir et améliorer nos services</li>
            <li>Sauvegarder et restaurer vos icônes personnalisées</li>
            <li>Garantir la sécurité de votre compte</li>
            <li>Vous envoyer des notifications si nécessaire</li>
          </ul>

          <h3>3. Partage des données</h3>
          <p>Nous ne vendons ni ne partageons vos données personnelles avec des tiers, sauf dans les cas suivants :</p>
          <ul>
            <li>Conformité à une obligation légale</li>
            <li>Protection de nos droits et prévention des fraudes</li>
          </ul>

          <h3>4. Sécurité</h3>
          <p>Nous utilisons Firebase pour assurer un stockage sécurisé de vos données. Vos informations sont cryptées et protégées contre tout accès non autorisé.</p>

          <h3>5. Vos droits</h3>
          <p>Vous pouvez à tout moment :</p>
          <ul>
            <li>Accéder à vos données personnelles</li>
            <li>Supprimer votre compte et vos fichiers stockés</li>
            <li>Modifier vos préférences de confidentialité</li>
          </ul>

          <h3>6. Contact</h3>
          <p>Pour toute question concernant cette politique, contactez-nous à : kristopher@meunierdigital.fr</p>
        </div>
      )
    });
  };

  const showTermsOfService = () => {
    setLegalModal({
      isOpen: true,
      title: "Conditions d'utilisation",
      content: (
        <div>
          <p>Dernière mise à jour : 25/03/2025</p>

          <h3>1. Acceptation des termes</h3>
          <p>En accédant et en utilisant notre application, vous acceptez ces conditions d'utilisation. Si vous n'adhérez pas à ces conditions, veuillez ne pas utiliser l'application.</p>

          <h3>2. Accès et inscription</h3>
          <p>L'inscription à l'application est requise pour utiliser certaines fonctionnalités. Vous êtes responsable de la confidentialité de vos informations de connexion.</p>

          <h3>3. Utilisation des services</h3>
          <p>Vous acceptez de ne pas :</p>
          <ul>
            <li>Utiliser l'application à des fins illégales ou frauduleuses</li>
            <li>Télécharger du contenu offensant ou protégé par des droits d'auteur sans autorisation</li>
            <li>Tenter d'accéder à des données d'autres utilisateurs</li>
          </ul>

          <h3>4. Responsabilité</h3>
          <p>Nous fournissons notre service "en l'état" sans garantie d'absence de bugs. Nous ne serons pas responsables des pertes de données.</p>

          <h3>5. Résiliation</h3>
          <p>Nous nous réservons le droit de suspendre ou de supprimer un compte en cas de violation des présentes conditions.</p>

          <h3>6. Modification des conditions</h3>
          <p>Nous nous réservons le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés en cas de changements importants.</p>

          <h3>7. Contact</h3>
          <p>Pour toute question, contactez-nous à : kristopher@meunierdigital.fr</p>
        </div>
      )
    });
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
          <FormatTool
            format={exportFormat}
            onChange={setExportFormat}
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
                  onClick={handleBackClick}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2a2a5a] hover:bg-[#3a3a7a] rounded-xl transition-all duration-300"
                >
                  <ArrowLeft size={20} />
                  Retour
                </button>
              )}
              <div className="flex items-center gap-4">
                <img
                  src="https://res.cloudinary.com/dp1u62e2c/image/upload/v1743603652/Logo_xdcrfd.svg"
                  alt="Logo"
                  className="w-12 h-12"
                />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Créateur d'Icônes de Dossier
                </h1>
              </div>
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
                      onDrag={(type, x, y) => handleDrag(type, { x, y })}
                    />
                  </div>
                </div>

                <button
                  onClick={handleExport}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl transition-all duration-300 text-lg font-medium shadow-lg hover:shadow-xl"
                >
                  <Download size={24} />
                  {user ? 'Sauvegarder et télécharger' : 'Télécharger'}
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

      <footer className="bg-[#1a1a3a] border-t border-[#2a2a5a] py-4 px-6">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-400">
            © {new Date().getFullYear()} MEUNIERDIGITAL. Tous droits réservés.
          </p>
          <div className="flex gap-4">
            <button
              onClick={showPrivacyPolicy}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Politique de confidentialité
            </button>
            <button
              onClick={showTermsOfService}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Conditions d'utilisation
            </button>
          </div>
        </div>
      </footer>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1a1a3a] rounded-2xl p-6 max-w-md w-full mx-4 border border-[#2a2a5a]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Modifications non sauvegardées</h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-300 mb-6">
              Vous avez des modifications non sauvegardées. Que souhaitez-vous faire ?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedImage(null);
                  resetSettings();
                }}
                className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300"
              >
                Abandonner
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl transition-all duration-300"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

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