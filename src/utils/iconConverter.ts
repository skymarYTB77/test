import { ImageSettings, OverlaySettings, TextSettings } from '../types/folder';

const ICON_SIZES = [16, 32, 48, 64, 128, 256];

interface IconHeader {
  width: number;
  height: number;
  colorCount: number;
  reserved: number;
  planes: number;
  bitCount: number;
  sizeInBytes: number;
  fileOffset: number;
}

export async function createIcoBlob(
  mainImage: string,
  imageSettings: ImageSettings,
  overlaySettings: OverlaySettings,
  textSettings: TextSettings,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  // Structure pour stocker les images et leurs en-têtes
  const images: { header: IconHeader; data: Uint8Array }[] = [];
  let currentOffset = 6 + (ICON_SIZES.length * 16); // Taille de l'en-tête + entrées du répertoire
  
  // Générer chaque taille d'icône
  for (let i = 0; i < ICON_SIZES.length; i++) {
    const size = ICON_SIZES[i];
    if (onProgress) {
      onProgress((i / ICON_SIZES.length) * 100);
    }

    const imageData = await generateImageData(
      size,
      mainImage,
      imageSettings,
      overlaySettings,
      textSettings
    );

    const header: IconHeader = {
      width: size === 256 ? 0 : size,
      height: size === 256 ? 0 : size,
      colorCount: 0,
      reserved: 0,
      planes: 1,
      bitCount: 32,
      sizeInBytes: imageData.length,
      fileOffset: currentOffset
    };

    images.push({ header, data: imageData });
    currentOffset += imageData.length;
  }

  // Créer l'en-tête ICO
  const headerData = new Uint8Array([
    0, 0, // Réservé
    1, 0, // Type (1 = ICO)
    ICON_SIZES.length & 0xFF, (ICON_SIZES.length >> 8) & 0xFF // Nombre d'images
  ]);

  // Créer les entrées du répertoire
  const directoryEntries = new Uint8Array(ICON_SIZES.length * 16);
  let offset = 0;

  images.forEach(({ header }) => {
    const entry = new Uint8Array([
      header.width,
      header.height,
      header.colorCount,
      header.reserved,
      header.planes & 0xFF,
      (header.planes >> 8) & 0xFF,
      header.bitCount & 0xFF,
      (header.bitCount >> 8) & 0xFF,
      header.sizeInBytes & 0xFF,
      (header.sizeInBytes >> 8) & 0xFF,
      (header.sizeInBytes >> 16) & 0xFF,
      (header.sizeInBytes >> 24) & 0xFF,
      header.fileOffset & 0xFF,
      (header.fileOffset >> 8) & 0xFF,
      (header.fileOffset >> 16) & 0xFF,
      (header.fileOffset >> 24) & 0xFF
    ]);

    directoryEntries.set(entry, offset);
    offset += 16;
  });

  // Combiner toutes les parties
  const parts = [
    headerData,
    directoryEntries,
    ...images.map(({ data }) => data)
  ];

  if (onProgress) {
    onProgress(100);
  }

  return new Blob(parts, { type: 'image/x-icon' });
}

export async function createPngBlob(
  mainImage: string,
  imageSettings: ImageSettings,
  overlaySettings: OverlaySettings,
  textSettings: TextSettings,
  size = 256
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Charger et dessiner l'image principale
  const img = await loadImage(mainImage);
  
  // Appliquer les filtres
  ctx.filter = `
    brightness(${imageSettings.brightness}%)
    contrast(${imageSettings.contrast}%)
    saturate(${imageSettings.saturation}%)
    hue-rotate(${imageSettings.hue}deg)
  `;
  
  // Dessiner l'image principale
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

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob as Blob);
    }, 'image/png');
  });
}

async function generateImageData(
  size: number,
  mainImage: string,
  imageSettings: ImageSettings,
  overlaySettings: OverlaySettings,
  textSettings: TextSettings
): Promise<Uint8Array> {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Dessiner l'image avec tous les éléments
  const img = await loadImage(mainImage);
  
  ctx.filter = `
    brightness(${imageSettings.brightness}%)
    contrast(${imageSettings.contrast}%)
    saturate(${imageSettings.saturation}%)
    hue-rotate(${imageSettings.hue}deg)
  `;
  
  ctx.drawImage(img, 0, 0, size, size);
  ctx.filter = 'none';

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

  // Convertir en RGBA
  const imageData = ctx.getImageData(0, 0, size, size);
  const rgba = new Uint8Array(imageData.data.buffer);
  
  // Convertir RGBA en BGRA (format ICO)
  const bgra = new Uint8Array(rgba.length);
  for (let i = 0; i < rgba.length; i += 4) {
    bgra[i] = rgba[i + 2]; // B
    bgra[i + 1] = rgba[i + 1]; // G
    bgra[i + 2] = rgba[i]; // R
    bgra[i + 3] = rgba[i + 3]; // A
  }

  return bgra;
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