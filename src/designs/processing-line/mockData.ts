import type { Frame, RollSettings } from './types';

// Generate gradient-based placeholder thumbnails using canvas data URLs
function generatePlaceholderThumbnail(index: number): string {
  // A set of visually varied color stops for film-like aesthetics
  const palettes = [
    ['#f5e6d3', '#c9a87c'],
    ['#d4e8d4', '#7aaa7a'],
    ['#d3e4f5', '#7aaac9'],
    ['#f5d3d3', '#c97a7a'],
    ['#e8d4f5', '#aa7ac9'],
    ['#f5f0d3', '#c9bf7c'],
    ['#d3f5f0', '#7ac9bf'],
    ['#f5d3f0', '#c97abf'],
    ['#e0e0e0', '#888888'],
    ['#ffe4b5', '#cd853f'],
    ['#b0c4de', '#4682b4'],
    ['#f0fff0', '#3cb371'],
    ['#fff5ee', '#fa8072'],
    ['#f0f8ff', '#4169e1'],
    ['#fdf5e6', '#daa520'],
    ['#f5fffa', '#2e8b57'],
    ['#e6e6fa', '#7b68ee'],
    ['#ffefd5', '#ff8c00'],
    ['#e0ffff', '#008b8b'],
    ['#ffe4e1', '#ff69b4'],
    ['#f0e68c', '#8b8b00'],
    ['#dda0dd', '#8b008b'],
    ['#90ee90', '#006400'],
    ['#add8e6', '#00008b'],
    ['#fa8072', '#8b0000'],
    ['#98fb98', '#006400'],
    ['#deb887', '#8b4513'],
    ['#b0e0e6', '#4682b4'],
    ['#ffb6c1', '#8b0000'],
    ['#c0c0c0', '#2f2f2f'],
    ['#ffd700', '#b8860b'],
    ['#00ced1', '#008b8b'],
    ['#ff7f50', '#8b3a2c'],
    ['#6495ed', '#00008b'],
    ['#dc143c', '#8b0000'],
    ['#00fa9a', '#006400'],
  ];

  const palette = palettes[index % palettes.length];

  // Use a simple SVG as the thumbnail placeholder
  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="80">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette[0]}"/>
          <stop offset="100%" stop-color="${palette[1]}"/>
        </linearGradient>
      </defs>
      <rect width="120" height="80" fill="url(#g)"/>
      <text x="60" y="45" font-family="monospace" font-size="12" fill="rgba(0,0,0,0.35)" text-anchor="middle">#${String(index + 1).padStart(2, '0')}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
}

const STATUSES: Frame['status'][] = ['pending', 'pending', 'pending', 'reviewed', 'flagged', 'approved', 'pending', 'rejected', 'pending', 'reviewed'];
const APERTURES = ['f/1.4', 'f/2', 'f/2.8', 'f/4', 'f/5.6', 'f/8'];
const SHUTTERS = ['1/30', '1/60', '1/125', '1/250', '1/500', '1/1000'];

export function generateMockFrames(count: number = 36): Frame[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `frame-${i + 1}`,
    index: i,
    thumbnail: generatePlaceholderThumbnail(i),
    filename: `ROLL_001_${String(i + 1).padStart(3, '0')}.tif`,
    status: STATUSES[i % STATUSES.length],
    rating: i % 6 === 0 ? 5 : i % 4 === 0 ? 4 : i % 3 === 0 ? 3 : i % 7 === 0 ? 2 : 0,
    metadata: {
      aperture: APERTURES[i % APERTURES.length],
      shutter: SHUTTERS[i % SHUTTERS.length],
      date: '2024-03-15',
      notes: i % 8 === 0 ? '光线很好，手持稍有模糊' : i % 5 === 0 ? '需要裁剪' : '',
    },
    adjustments: {
      exposure: (i % 5 - 2) * 0.3,
      contrast: (i % 3 - 1) * 0.2,
      highlights: (i % 4 - 2) * 15,
      shadows: (i % 3 - 1) * 10,
    },
  }));
}

export const MOCK_ROLL_SETTINGS: RollSettings = {
  filmStock: 'Kodak Portra 400',
  filmType: 'color_negative',
  iso: 400,
  camera: 'Nikon FM2',
  lens: 'Nikkor 50mm f/1.4',
  dateShot: '2024-03-15',
  dateProcessed: '2024-03-18',
  lab: 'Film Lab Shanghai',
  notes: '春日外拍，公园系列',
  pushPull: 0,
};
