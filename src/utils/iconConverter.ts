import { ImageSettings, OverlaySettings, TextSettings } from '../types/folder';

const ICON_SIZES = [16, 32, 48, 64, 128, 256];

export async function createIcoBlob(
  mainImage: string,
  imageSettings: ImageSettings,
  overlaySettings: OverlaySettings,
  textSettings: TextSettings
): Promise<Blob> {
  // Créer un tableau pour stocker les données de chaque taille d'icône
  const iconData: Uint8Array[] = [];
  
  // Pour chaque taille d'icône
  for (const size of ICON_SIZES) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) continue;

    // Charger et dessiner l'image principale
    const img = await loadImage(mainImage);
    
    // Appliquer les filtres
    ctx.filter = `
      brightness(${imageSettings.brightness}%)
      contrast(${imageSettings.contrast}%)
      saturate(${imageSettings.saturation}%)
      hue-rotate(${imageSettings.hue}deg)
    `;
    
    // Dessiner l'image principale redimensionnée
    ctx.drawImage(img, 0, 0, size, size);
    
    // Réinitialiser les filtres
    ctx.filter = 'none';
    
    // Ajouter l'image superposée si elle existe
    if (overlaySettings.image) {
      const overlayImg = await loadImage(overlaySettings.image);
      const scale = overlaySettings.scale / 100;
      const overlaySize = size * scale;
      const x = (size / 2) + (overlaySettings.x * (size / 512));
      const y = (size / 2) + (overlaySettings.y * (size / 512));
      
      ctx.drawImage(
        overlayImg,
        x - (overlaySize / 2),
        y - (overlaySize / 2),
        overlaySize,
        overlaySize
      );
    }
    
    // Ajouter le texte si nécessaire
    if (textSettings.text) {
      const fontSize = (textSettings.size * size) / 512;
      ctx.font = `${fontSize}px "${textSettings.fontFamily}"`;
      ctx.fillStyle = textSettings.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const x = (size / 2) + (textSettings.x * (size / 512));
      const y = (size / 2) + (textSettings.y * (size / 512));
      
      ctx.fillText(textSettings.text, x, y);
    }
    
    // Convertir le canvas en données binaires
    const imageData = ctx.getImageData(0, 0, size, size);
    iconData.push(createIconDirectoryEntry(size, imageData));
  }
  
  // Créer l'en-tête ICO
  const header = new Uint8Array([
    0, 0,             // Reserved
    1, 0,             // ICO type
    ICON_SIZES.length, 0, // Number of images
  ]);
  
  // Combiner toutes les données
  const blob = new Blob([header, ...iconData], { type: 'image/x-icon' });
  return blob;
}

function createIconDirectoryEntry(size: number, imageData: ImageData): Uint8Array {
  const width = size === 256 ? 0 : size;
  const height = size === 256 ? 0 : size;
  const bpp = 32;
  const data = new Uint8Array(imageData.data.buffer);
  const imageSizeArray = new Uint32Array([data.length]);
  
  const entry = new Uint8Array([
    width,                    // Width
    height,                   // Height
    0,                       // Color palette size
    0,                       // Reserved
    1, 0,                    // Color planes
    bpp, 0,                  // Bits per pixel
    imageSizeArray[0] & 0xFF,        // Image size (little endian)
    (imageSizeArray[0] >> 8) & 0xFF,
    (imageSizeArray[0] >> 16) & 0xFF,
    (imageSizeArray[0] >> 24) & 0xFF,
    0, 0, 0, 0              // Image offset (will be calculated later)
  ]);
  
  return new Uint8Array([...Array.from(entry), ...Array.from(data)]);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}