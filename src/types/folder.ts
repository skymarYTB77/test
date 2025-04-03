export interface FolderIcon {
  id?: string;
  userId: string;
  name: string;
  image: string;
  imageSettings: ImageSettings;
  overlayImage: OverlaySettings | null;
  overlayText: TextSettings | null;
  drawing: string | null;
  shapes: Shape[] | null;
  createdAt?: Date;
}

export interface ImageSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
}

export interface OverlaySettings {
  image: string;
  x: number;
  y: number;
  scale: number;
}

export interface TextSettings {
  text: string;
  x: number;
  y: number;
  size: number;
  color: string;
  fontFamily: string;
}

export interface Shape {
  type: 'rectangle' | 'circle' | 'triangle';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export type ExportFormat = 'png' | 'ico';

export const defaultImageSettings: ImageSettings = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hue: 0
};

export const defaultOverlaySettings: OverlaySettings = {
  image: '',
  x: 0,
  y: 0,
  scale: 50
};

export const defaultTextSettings: TextSettings = {
  text: '',
  x: 0,
  y: 0,
  size: 32,
  color: '#000000',
  fontFamily: 'Arial'
};