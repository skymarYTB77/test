import { useEffect, useState } from 'react';
import { Trash2, Edit, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserFolderIcons, FolderIcon, deleteFolderIcon } from '../services/folders';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { IconCanvas } from './IconCanvas';

interface DashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (icon: FolderIcon) => void;
}

export function Dashboard({ isOpen, onClose, onEdit }: DashboardProps) {
  const [icons, setIcons] = useState<FolderIcon[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        const userIcons = await getUserFolderIcons(user.uid);
        setIcons(userIcons);
      } catch (error) {
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleDelete = async (iconId: string) => {
    try {
      await deleteFolderIcon(iconId);
      toast.success('Icône supprimée avec succès');
      setIcons(icons.filter(icon => icon.id !== iconId));
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDownload = async (icon: FolderIcon) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      const img = new Image();
      img.crossOrigin = "anonymous"; // Ajout de l'attribut crossOrigin
      img.onload = () => {
        ctx.filter = `
          brightness(${icon.imageSettings.brightness}%)
          contrast(${icon.imageSettings.contrast}%)
          saturate(${icon.imageSettings.saturation}%)
          hue-rotate(${icon.imageSettings.hue}deg)
        `;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        try {
          const url = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `${icon.name}.png`;
          link.href = url;
          link.click();
        } catch (error) {
          toast.error('Erreur lors du téléchargement de l\'image');
        }
      };
      img.onerror = () => {
        toast.error('Erreur lors du chargement de l\'image');
      };
      img.src = icon.image;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Mes icônes de dossier</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement de vos icônes...</p>
          </div>
        ) : icons.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Vous n'avez pas encore créé d'icônes</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {icons.map((icon) => (
              <div
                key={icon.id}
                className="bg-gray-50 rounded-lg p-4 flex flex-col shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="relative w-full aspect-square mb-4">
                  <IconCanvas
                    mainImage={icon.image}
                    imageSettings={icon.imageSettings}
                    overlaySettings={icon.overlayImage || { image: '', x: 0, y: 0, scale: 100 }}
                    textSettings={icon.overlayText || { text: '', x: 0, y: 0, size: 32, color: '#000000', fontFamily: 'Arial' }}
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-800">
                    {icon.name || 'Sans nom'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Créé le {format(
                      icon.createdAt?.toDate() || new Date(),
                      'dd MMMM yyyy à HH:mm',
                      { locale: fr }
                    )}
                  </p>
                </div>

                <div className="flex gap-1 justify-center mt-4">
                  <button
                    onClick={() => onEdit(icon)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(icon.id!)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDownload(icon)}
                    className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                    title="Télécharger"
                  >
                    <Download size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}