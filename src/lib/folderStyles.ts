import { FolderStyle } from '../types/folder';

export const folderStyles: FolderStyle[] = [
  {
    id: 'standard',
    name: 'Dossier standard',
    render: (ctx: CanvasRenderingContext2D, color: string) => {
      ctx.save();
      
      // Ombre du corps principal du dossier
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 8;
      ctx.shadowOffsetY = 8;

      // Corps principal du dossier
      ctx.beginPath();
      ctx.moveTo(60, 160);
      ctx.lineTo(432, 160);
      ctx.quadraticCurveTo(452, 160, 452, 180);
      ctx.lineTo(452, 432);
      ctx.quadraticCurveTo(452, 452, 432, 452);
      ctx.lineTo(80, 452);
      ctx.quadraticCurveTo(60, 452, 60, 432);
      ctx.lineTo(60, 180);
      ctx.quadraticCurveTo(60, 160, 80, 160);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Onglet du dossier
      ctx.beginPath();
      ctx.moveTo(80, 160);
      ctx.lineTo(200, 80);
      ctx.quadraticCurveTo(220, 80, 240, 80);
      ctx.lineTo(432, 80);
      ctx.quadraticCurveTo(452, 80, 452, 100);
      ctx.lineTo(452, 160);
      ctx.lineTo(80, 160);
      ctx.closePath();
      ctx.fillStyle = `color-mix(in srgb, ${color} 95%, #fff)`;
      ctx.fill();

      ctx.restore();
    }
  },
  {
    id: 'rounded',
    name: 'Angles arrondis',
    render: (ctx: CanvasRenderingContext2D, color: string) => {
      ctx.save();
      
      // Ombre
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 8;
      ctx.shadowOffsetY = 8;

      // Corps principal avec coins plus arrondis
      ctx.beginPath();
      ctx.moveTo(60, 160);
      ctx.lineTo(432, 160);
      ctx.quadraticCurveTo(472, 160, 472, 200);
      ctx.lineTo(472, 412);
      ctx.quadraticCurveTo(472, 452, 432, 452);
      ctx.lineTo(100, 452);
      ctx.quadraticCurveTo(60, 452, 60, 412);
      ctx.lineTo(60, 200);
      ctx.quadraticCurveTo(60, 160, 100, 160);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Onglet arrondi
      ctx.beginPath();
      ctx.moveTo(100, 160);
      ctx.lineTo(200, 60);
      ctx.quadraticCurveTo(220, 50, 240, 50);
      ctx.lineTo(432, 50);
      ctx.quadraticCurveTo(472, 50, 472, 90);
      ctx.lineTo(472, 160);
      ctx.lineTo(100, 160);
      ctx.closePath();
      ctx.fillStyle = `color-mix(in srgb, ${color} 95%, #fff)`;
      ctx.fill();

      ctx.restore();
    }
  },
  {
    id: 'square',
    name: 'Angles carrés',
    render: (ctx: CanvasRenderingContext2D, color: string) => {
      ctx.save();
      
      // Ombre
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 8;
      ctx.shadowOffsetY = 8;

      // Corps principal plus carré
      ctx.beginPath();
      ctx.moveTo(60, 160);
      ctx.lineTo(452, 160);
      ctx.lineTo(452, 452);
      ctx.lineTo(60, 452);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Onglet carré
      ctx.beginPath();
      ctx.moveTo(60, 160);
      ctx.lineTo(180, 80);
      ctx.lineTo(452, 80);
      ctx.lineTo(452, 160);
      ctx.closePath();
      ctx.fillStyle = `color-mix(in srgb, ${color} 95%, #fff)`;
      ctx.fill();

      ctx.restore();
    }
  },
  {
    id: 'slim',
    name: 'Fin et allongé',
    render: (ctx: CanvasRenderingContext2D, color: string) => {
      ctx.save();
      
      // Ombre
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 8;
      ctx.shadowOffsetY = 8;

      // Corps principal plus étroit
      ctx.beginPath();
      ctx.moveTo(120, 160);
      ctx.lineTo(392, 160);
      ctx.quadraticCurveTo(412, 160, 412, 180);
      ctx.lineTo(412, 452);
      ctx.quadraticCurveTo(412, 472, 392, 472);
      ctx.lineTo(140, 472);
      ctx.quadraticCurveTo(120, 472, 120, 452);
      ctx.lineTo(120, 180);
      ctx.quadraticCurveTo(120, 160, 140, 160);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Onglet fin
      ctx.beginPath();
      ctx.moveTo(140, 160);
      ctx.lineTo(220, 80);
      ctx.quadraticCurveTo(240, 80, 260, 80);
      ctx.lineTo(392, 80);
      ctx.quadraticCurveTo(412, 80, 412, 100);
      ctx.lineTo(412, 160);
      ctx.lineTo(140, 160);
      ctx.closePath();
      ctx.fillStyle = `color-mix(in srgb, ${color} 95%, #fff)`;
      ctx.fill();

      ctx.restore();
    }
  },
  {
    id: 'thick',
    name: 'Épais et trapu',
    render: (ctx: CanvasRenderingContext2D, color: string) => {
      ctx.save();
      
      // Ombre
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 8;
      ctx.shadowOffsetY = 8;

      // Corps principal plus large
      ctx.beginPath();
      ctx.moveTo(40, 160);
      ctx.lineTo(472, 160);
      ctx.quadraticCurveTo(492, 160, 492, 180);
      ctx.lineTo(492, 412);
      ctx.quadraticCurveTo(492, 432, 472, 432);
      ctx.lineTo(60, 432);
      ctx.quadraticCurveTo(40, 432, 40, 412);
      ctx.lineTo(40, 180);
      ctx.quadraticCurveTo(40, 160, 60, 160);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Onglet large
      ctx.beginPath();
      ctx.moveTo(60, 160);
      ctx.lineTo(180, 100);
      ctx.quadraticCurveTo(200, 100, 220, 100);
      ctx.lineTo(472, 100);
      ctx.quadraticCurveTo(492, 100, 492, 120);
      ctx.lineTo(492, 160);
      ctx.lineTo(60, 160);
      ctx.closePath();
      ctx.fillStyle = `color-mix(in srgb, ${color} 95%, #fff)`;
      ctx.fill();

      ctx.restore();
    }
  },
  {
    id: 'tab',
    name: 'Rabat prononcé',
    render: (ctx: CanvasRenderingContext2D, color: string) => {
      ctx.save();
      
      // Ombre
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 8;
      ctx.shadowOffsetY = 8;

      // Corps principal
      ctx.beginPath();
      ctx.moveTo(60, 160);
      ctx.lineTo(452, 160);
      ctx.quadraticCurveTo(472, 160, 472, 180);
      ctx.lineTo(472, 432);
      ctx.quadraticCurveTo(472, 452, 452, 452);
      ctx.lineTo(80, 452);
      ctx.quadraticCurveTo(60, 452, 60, 432);
      ctx.lineTo(60, 180);
      ctx.quadraticCurveTo(60, 160, 80, 160);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Onglet plus grand
      ctx.beginPath();
      ctx.moveTo(80, 160);
      ctx.lineTo(160, 40);
      ctx.quadraticCurveTo(180, 30, 200, 30);
      ctx.lineTo(452, 30);
      ctx.quadraticCurveTo(472, 30, 472, 50);
      ctx.lineTo(472, 160);
      ctx.lineTo(80, 160);
      ctx.closePath();
      ctx.fillStyle = `color-mix(in srgb, ${color} 95%, #fff)`;
      ctx.fill();

      ctx.restore();
    }
  },
  {
    id: '3d',
    name: 'Effet 3D',
    render: (ctx: CanvasRenderingContext2D, color: string) => {
      ctx.save();
      
      // Effet de profondeur
      ctx.beginPath();
      ctx.moveTo(80, 180);
      ctx.lineTo(472, 180);
      ctx.lineTo(452, 160);
      ctx.lineTo(60, 160);
      ctx.closePath();
      ctx.fillStyle = `color-mix(in srgb, ${color} 70%, #000)`;
      ctx.fill();

      // Corps principal
      ctx.beginPath();
      ctx.moveTo(60, 160);
      ctx.lineTo(452, 160);
      ctx.lineTo(472, 180);
      ctx.lineTo(472, 452);
      ctx.lineTo(80, 452);
      ctx.lineTo(60, 432);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Côté droit 3D
      ctx.beginPath();
      ctx.moveTo(472, 180);
      ctx.lineTo(472, 452);
      ctx.lineTo(452, 432);
      ctx.lineTo(452, 160);
      ctx.closePath();
      ctx.fillStyle = `color-mix(in srgb, ${color} 85%, #000)`;
      ctx.fill();

      // Onglet avec effet 3D
      ctx.beginPath();
      ctx.moveTo(80, 160);
      ctx.lineTo(200, 80);
      ctx.lineTo(452, 80);
      ctx.lineTo(472, 100);
      ctx.lineTo(472, 180);
      ctx.lineTo(452, 160);
      ctx.closePath();
      ctx.fillStyle = `color-mix(in srgb, ${color} 95%, #fff)`;
      ctx.fill();

      ctx.restore();
    }
  },
  {
    id: 'tilted',
    name: 'Légèrement incliné',
    render: (ctx: CanvasRenderingContext2D, color: string) => {
      ctx.save();
      
      // Appliquer une légère rotation
      ctx.translate(256, 256);
      ctx.rotate(Math.PI / 24); // 7.5 degrés
      ctx.translate(-256, -256);

      // Ombre
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 8;
      ctx.shadowOffsetY = 8;

      // Corps principal
      ctx.beginPath();
      ctx.moveTo(60, 160);
      ctx.lineTo(452, 160);
      ctx.quadraticCurveTo(472, 160, 472, 180);
      ctx.lineTo(472, 432);
      ctx.quadraticCurveTo(472, 452, 452, 452);
      ctx.lineTo(80, 452);
      ctx.quadraticCurveTo(60, 452, 60, 432);
      ctx.lineTo(60, 180);
      ctx.quadraticCurveTo(60, 160, 80, 160);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Onglet
      ctx.beginPath();
      ctx.moveTo(80, 160);
      ctx.lineTo(200, 80);
      ctx.quadraticCurveTo(220, 80, 240, 80);
      ctx.lineTo(452, 80);
      ctx.quadraticCurveTo(472, 80, 472, 100);
      ctx.lineTo(472, 160);
      ctx.lineTo(80, 160);
      ctx.closePath();
      ctx.fillStyle = `color-mix(in srgb, ${color} 95%, #fff)`;
      ctx.fill();

      ctx.restore();
    }
  },
  {
    id: 'asymmetric',
    name: 'Rabat asymétrique',
    render: (ctx: CanvasRenderingContext2D, color: string) => {
      ctx.save();
      
      // Ombre
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 8;
      ctx.shadowOffsetY = 8;

      // Corps principal
      ctx.beginPath();
      ctx.moveTo(60, 160);
      ctx.lineTo(452, 160);
      ctx.quadraticCurveTo(472, 160, 472, 180);
      ctx.lineTo(472, 432);
      ctx.quadraticCurveTo(472, 452, 452, 452);
      ctx.lineTo(80, 452);
      ctx.quadraticCurveTo(60, 452, 60, 432);
      ctx.lineTo(60, 180);
      ctx.quadraticCurveTo(60, 160, 80, 160);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Onglet asymétrique
      ctx.beginPath();
      ctx.moveTo(80, 160);
      ctx.lineTo(160, 100);
      ctx.quadraticCurveTo(180, 90, 200, 80);
      ctx.lineTo(452, 60);
      ctx.quadraticCurveTo(472, 60, 472, 80);
      ctx.lineTo(472, 160);
      ctx.lineTo(80, 160);
      ctx.closePath();
      ctx.fillStyle = `color-mix(in srgb, ${color} 95%, #fff)`;
      ctx.fill();

      ctx.restore();
    }
  },
  {
    id: 'folded',
    name: 'Pli sur le bas',
    render: (ctx: CanvasRenderingContext2D, color: string) => {
      ctx.save();
      
      // Ombre
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 8;
      ctx.shadowOffsetY = 8;

      // Corps principal
      ctx.beginPath();
      ctx.moveTo(60, 160);
      ctx.lineTo(452, 160);
      ctx.quadraticCurveTo(472, 160, 472, 180);
      ctx.lineTo(472, 432);
      ctx.quadraticCurveTo(472, 452, 452, 452);
      ctx.lineTo(80, 452);
      ctx.quadraticCurveTo(60, 452, 60, 432);
      ctx.lineTo(60, 180);
      ctx.quadraticCurveTo(60, 160, 80, 160);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Onglet
      ctx.beginPath();
      ctx.moveTo(80, 160);
      ctx.lineTo(200, 80);
      ctx.quadraticCurveTo(220, 80, 240, 80);
      ctx.lineTo(452, 80);
      ctx.quadraticCurveTo(472, 80, 472, 100);
      ctx.lineTo(472, 160);
      ctx.lineTo(80, 160);
      ctx.closePath();
      ctx.fillStyle = `color-mix(in srgb, ${color} 95%, #fff)`;
      ctx.fill();

      // Pli en bas à droite
      ctx.beginPath();
      ctx.moveTo(452, 452);
      ctx.lineTo(422, 452);
      ctx.lineTo(452, 422);
      ctx.closePath();
      ctx.fillStyle = `color-mix(in srgb, ${color} 85%, #000)`;
      ctx.fill();

      ctx.restore();
    }
  }
];

export const getDefaultFolderStyle = () => folderStyles[0];
export const getFolderStyleById = (id: string) => folderStyles.find(style => style.id === id) || getDefaultFolderStyle();