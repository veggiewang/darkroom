export interface Frame {
  id: string;
  index: number;
  thumbnail: string;
  filename: string;
  status: 'pending' | 'reviewed' | 'flagged' | 'approved' | 'rejected';
  rating: number; // 1-5 stars
  metadata: {
    aperture?: string;
    shutter?: string;
    date?: string;
    notes?: string;
  };
  adjustments?: {
    exposure: number;
    contrast: number;
    highlights: number;
    shadows: number;
  };
}

export interface RollSettings {
  filmStock: string;
  filmType: 'bw_negative' | 'color_negative' | 'color_positive' | 'bw_positive';
  iso: number;
  camera: string;
  lens: string;
  dateShot: string;
  dateProcessed: string;
  lab: string;
  notes: string;
  pushPull: number; // -2 to +2 stops
}

export type ProcessingStage = 'import' | 'quickfill' | 'timeline' | 'export';

export const DEFAULT_SETTINGS: RollSettings = {
  filmStock: '',
  filmType: 'color_negative',
  iso: 400,
  camera: '',
  lens: '',
  dateShot: '',
  dateProcessed: new Date().toISOString().split('T')[0],
  lab: '',
  notes: '',
  pushPull: 0,
};

export const FILM_STOCKS = [
  { brand: 'Kodak', name: 'Portra 400', type: 'color_negative', iso: 400 },
  { brand: 'Kodak', name: 'Portra 160', type: 'color_negative', iso: 160 },
  { brand: 'Kodak', name: 'Portra 800', type: 'color_negative', iso: 800 },
  { brand: 'Kodak', name: 'Gold 200', type: 'color_negative', iso: 200 },
  { brand: 'Kodak', name: 'Ultramax 400', type: 'color_negative', iso: 400 },
  { brand: 'Kodak', name: 'Ektar 100', type: 'color_negative', iso: 100 },
  { brand: 'Kodak', name: 'Tri-X 400', type: 'bw_negative', iso: 400 },
  { brand: 'Kodak', name: 'T-Max 400', type: 'bw_negative', iso: 400 },
  { brand: 'Kodak', name: 'T-Max 100', type: 'bw_negative', iso: 100 },
  { brand: 'Fujifilm', name: 'Pro 400H', type: 'color_negative', iso: 400 },
  { brand: 'Fujifilm', name: 'Superia X-tra 400', type: 'color_negative', iso: 400 },
  { brand: 'Fujifilm', name: 'C200', type: 'color_negative', iso: 200 },
  { brand: 'Fujifilm', name: 'Velvia 50', type: 'color_positive', iso: 50 },
  { brand: 'Fujifilm', name: 'Provia 100F', type: 'color_positive', iso: 100 },
  { brand: 'Ilford', name: 'HP5 Plus 400', type: 'bw_negative', iso: 400 },
  { brand: 'Ilford', name: 'Delta 400', type: 'bw_negative', iso: 400 },
  { brand: 'Ilford', name: 'Delta 100', type: 'bw_negative', iso: 100 },
  { brand: 'Ilford', name: 'Pan F Plus 50', type: 'bw_negative', iso: 50 },
  { brand: 'Cinestill', name: '800T', type: 'color_negative', iso: 800 },
  { brand: 'Cinestill', name: '50D', type: 'color_negative', iso: 50 },
];

export const STATUS_LABELS: Record<Frame['status'], string> = {
  pending: '待处理',
  reviewed: '已审阅',
  flagged: '已标记',
  approved: '已确认',
  rejected: '已排除',
};

export const STATUS_COLORS: Record<Frame['status'], string> = {
  pending: 'bg-gray-400',
  reviewed: 'bg-blue-500',
  flagged: 'bg-amber-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
};
