import { useState, useMemo } from 'react';
import { Search, ChevronRight, X, Upload, Camera, Aperture, Calendar, Film, Store, ScanLine, User, Gauge } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import WorkspaceCanvas from './components/workspace/WorkspaceCanvas';
import { ErrorBoundary } from './components/ErrorBoundary';
import { VectorFilmCanister } from './components/VectorFilmCanister';
import { AutocompleteInput } from './components/AutocompleteInput';
import { LocationInput } from './components/LocationInput';
import type { FilmStock, RollMetadata } from './types';

// 生成胶片盒的噪点质感
// @ts-ignore - used by inline styles
const NOISE_TEXTURE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")`;

// 完善的胶卷数据库（换用矢量渲染参数）
const FILM_DATABASE: FilmStock[] = [
  // === 135 FORMAT - KODAK ===
  { 
    id: 'k_p400_135', brand: 'Kodak', name: 'Portra 400', type: '彩色负片', iso: 400, format: '135', popular: true,
    boxStyle: '', accent: '', colorStart: '#facc15', colorEnd: '#ef4444', textColor: '#000000'
  },
  { 
    id: 'k_p160_135', brand: 'Kodak', name: 'Portra 160', type: '彩色负片', iso: 160, format: '135', popular: true,
    boxStyle: '', accent: '', colorStart: '#fef08a', colorEnd: '#fb923c', textColor: '#000000'
  },
  { 
    id: 'k_p800_135', brand: 'Kodak', name: 'Portra 800', type: '彩色负片', iso: 800, format: '135', popular: false,
    boxStyle: '', accent: '', colorStart: '#f97316', colorEnd: '#991b1b', textColor: '#000000'
  },
  { 
    id: 'k_gold200_135', brand: 'Kodak', name: 'Gold 200', type: '彩色负片', iso: 200, format: '135', popular: true,
    boxStyle: '', accent: '', colorStart: '#eab308', colorEnd: '#b45309', textColor: '#7f1d1d'
  },
  { 
    id: 'k_ultramax_135', brand: 'Kodak', name: 'Ultramax 400', type: '彩色负片', iso: 400, format: '135', popular: true,
    boxStyle: '', accent: '', colorStart: '#1d4ed8', colorEnd: '#1e3a8a', textColor: '#facc15'
  },
  { 
    id: 'k_colorplus_135', brand: 'Kodak', name: 'ColorPlus 200', type: '彩色负片', iso: 200, format: '135', popular: true,
    boxStyle: '', accent: '', colorStart: '#fef08a', colorEnd: '#dc2626', textColor: '#000000'
  },
  { 
    id: 'k_proimage_135', brand: 'Kodak', name: 'ProImage 100', type: '彩色负片', iso: 100, format: '135', popular: false,
    boxStyle: '', accent: '', colorStart: '#fde047', colorEnd: '#b45309', textColor: '#000000'
  },
  { 
    id: 'k_ektar100_135', brand: 'Kodak', name: 'Ektar 100', type: '彩色负片', iso: 100, format: '135', popular: true,
    boxStyle: '', accent: '', colorStart: '#ef4444', colorEnd: '#7f1d1d', textColor: '#ffffff'
  },
  { 
    id: 'k_trix_135', brand: 'Kodak', name: 'Tri-X 400', type: '黑白负片', iso: 400, format: '135', popular: true,
    boxStyle: '', accent: '', colorStart: '#000000', colorEnd: '#111111', textColor: '#eab308'
  },
  { 
    id: 'k_tmax100_135', brand: 'Kodak', name: 'T-Max 100', type: '黑白负片', iso: 100, format: '135', popular: false,
    boxStyle: '', accent: '', colorStart: '#18181b', colorEnd: '#000000', textColor: '#ffffff'
  },
  { 
    id: 'k_tmax400_135', brand: 'Kodak', name: 'T-Max 400', type: '黑白负片', iso: 400, format: '135', popular: false,
    boxStyle: '', accent: '', colorStart: '#18181b', colorEnd: '#000000', textColor: '#ffffff'
  },
  { 
    id: 'k_e100_135', brand: 'Kodak', name: 'Ektachrome E100', type: '彩色反转片', iso: 100, format: '135', popular: false,
    boxStyle: '', accent: '', colorStart: '#3b82f6', colorEnd: '#1d4ed8', textColor: '#ffffff'
  },
  // 电影卷 (分装卷)
  { 
    id: 'k_v350d_135', brand: 'Kodak', name: 'Vision3 50D', type: '彩色电影卷', iso: 50, format: '135', popular: true,
    boxStyle: '', accent: '', colorStart: '#f59e0b', colorEnd: '#b45309', textColor: '#000000'
  },
  { 
    id: 'k_v3250d_135', brand: 'Kodak', name: 'Vision3 250D', type: '彩色电影卷', iso: 250, format: '135', popular: true,
    boxStyle: '', accent: '', colorStart: '#fbbf24', colorEnd: '#ea580c', textColor: '#000000'
  },
  { 
    id: 'k_v3200t_135', brand: 'Kodak', name: 'Vision3 200T', type: '彩色电影卷', iso: 200, format: '135', popular: false,
    boxStyle: '', accent: '', colorStart: '#3b82f6', colorEnd: '#1e40af', textColor: '#ffffff'
  },
  { 
    id: 'k_v3500t_135', brand: 'Kodak', name: 'Vision3 500T', type: '彩色电影卷', iso: 500, format: '135', popular: true,
    boxStyle: '', accent: '', colorStart: '#6366f1', colorEnd: '#312e81', textColor: '#ffffff'
  },

  // === 135 FORMAT - FUJIFILM ===
  { 
    id: 'f_pro400h_135', brand: 'Fujifilm', name: 'Pro 400H', type: '彩色负片 (已停产)', iso: 400, format: '135', popular: true,
    boxStyle: '', accent: '', colorStart: '#ccfbf1', colorEnd: '#5eead4', textColor: '#042f2e'
  },
  { 
    id: 'f_c100_135', brand: 'Fujifilm', name: 'Fujicolor C100', type: '彩色负片', iso: 100, format: '135', popular: false,
    boxStyle: '', accent: '', colorStart: '#86efac', colorEnd: '#16a34a', textColor: '#ffffff'
  },
  { 
    id: 'f_c200_135', brand: 'Fujifilm', name: 'Fujicolor C200', type: '彩色负片 (已停产)', iso: 200, format: '135', popular: true,
    boxStyle: '', accent: '', colorStart: '#22c55e', colorEnd: '#15803d', textColor: '#ffffff'
  },
  { 
    id: 'f_c400_135', brand: 'Fujifilm', name: 'Fujicolor C400', type: '彩色负片', iso: 400, format: '135', popular: false,
    boxStyle: '', accent: '', colorStart: '#16a34a', colorEnd: '#14532d', textColor: '#ffffff'
  },
  { 
    id: 'f_xtra400_135', brand: 'Fujifilm', name: 'Superia X-TRA 400', type: '彩色负片', iso: 400, format: '135', popular: false,
    boxStyle: '', accent: '', colorStart: '#16a34a', colorEnd: '#0f766e', textColor: '#ffffff'
  },
  { 
    id: 'f_premium400_135', brand: 'Fujifilm', name: 'Premium 400', type: '彩色负片', iso: 400, format: '135', popular: false,
    boxStyle: '', accent: '', colorStart: '#bbf7d0', colorEnd: '#16a34a', textColor: '#000000'
  },
  { 
    id: 'f_biz400_135', brand: 'Fujifilm', name: '业务卷 400', type: '彩色负片 (已停产)', iso: 400, format: '135', popular: false,
    boxStyle: '', accent: '', colorStart: '#cbd5e1', colorEnd: '#475569', textColor: '#ffffff'
  },
  { 
    id: 'f_acros100ii_135', brand: 'Fujifilm', name: 'Acros 100 II', type: '黑白负片', iso: 100, format: '135', popular: true,
    boxStyle: '', accent: '', colorStart: '#f1f5f9', colorEnd: '#94a3b8', textColor: '#000000'
  },
  { 
    id: 'f_velvia50_135', brand: 'Fujifilm', name: 'Velvia 50', type: '彩色反转片', iso: 50, format: '135', popular: true,
    boxStyle: '', accent: '', colorStart: '#16a34a', colorEnd: '#b91c1c', textColor: '#ffffff'
  },
  { 
    id: 'f_velvia100_135', brand: 'Fujifilm', name: 'Velvia 100', type: '彩色反转片', iso: 100, format: '135', popular: false,
    boxStyle: '', accent: '', colorStart: '#22c55e', colorEnd: '#dc2626', textColor: '#ffffff'
  },
  { 
    id: 'f_provia100f_135', brand: 'Fujifilm', name: 'Provia 100F', type: '彩色反转片', iso: 100, format: '135', popular: false,
    boxStyle: '', accent: '', colorStart: '#38bdf8', colorEnd: '#0369a1', textColor: '#ffffff'
  },

  // === 135 FORMAT - ILFORD ===
  { 
    id: 'i_hp5_135', brand: 'Ilford', name: 'HP5 Plus', type: '黑白负片', iso: 400, format: '135', popular: true,
    boxStyle: '', accent: '', colorStart: '#18181b', colorEnd: '#27272a', textColor: '#ffffff'
  },
  { 
    id: 'i_fp4_135', brand: 'Ilford', name: 'FP4 Plus', type: '黑白负片', iso: 125, format: '135', popular: false,
    boxStyle: '', accent: '', colorStart: '#e2e8f0', colorEnd: '#94a3b8', textColor: '#000000'
  },
  { 
    id: 'i_delta100_135', brand: 'Ilford', name: 'Delta 100', type: '黑白负片', iso: 100, format: '135', popular: false,
    boxStyle: '', accent: '', colorStart: '#cbd5e1', colorEnd: '#475569', textColor: '#000000'
  },
  { 
    id: 'i_delta400_135', brand: 'Ilford', name: 'Delta 400', type: '黑白负片', iso: 400, format: '135', popular: true,
    boxStyle: '', accent: '', colorStart: '#64748b', colorEnd: '#1e293b', textColor: '#ffffff'
  },
  { 
    id: 'i_delta3200_135', brand: 'Ilford', name: 'Delta 3200', type: '黑白负片', iso: 3200, format: '135', popular: false,
    boxStyle: '', accent: '', colorStart: '#0f172a', colorEnd: '#000000', textColor: '#ffffff'
  },
  { 
    id: 'i_pan100_135', brand: 'Ilford', name: 'PAN 100', type: '黑白负片', iso: 100, format: '135', popular: false,
    boxStyle: '', accent: '', colorStart: '#f1f5f9', colorEnd: '#64748b', textColor: '#000000'
  },
  { 
    id: 'i_pan400_135', brand: 'Ilford', name: 'PAN 400', type: '黑白负片', iso: 400, format: '135', popular: false,
    boxStyle: '', accent: '', colorStart: '#94a3b8', colorEnd: '#334155', textColor: '#ffffff'
  },
  { 
    id: 'i_kent100_135', brand: 'Ilford', name: 'Kentmere PAN 100', type: '黑白负片', iso: 100, format: '135', popular: true,
    boxStyle: '', accent: '', colorStart: '#e2e8f0', colorEnd: '#64748b', textColor: '#000000'
  },
  { 
    id: 'i_kent400_135', brand: 'Ilford', name: 'Kentmere PAN 400', type: '黑白负片', iso: 400, format: '135', popular: true,
    boxStyle: '', accent: '', colorStart: '#71717a', colorEnd: '#27272a', textColor: '#ffffff'
  },
  { 
    id: 'i_phoenix200_135', brand: 'Ilford', name: 'Phoenix 200', type: '彩色负片', iso: 200, format: '135', popular: false,
    boxStyle: '', accent: '', colorStart: '#fbbf24', colorEnd: '#dc2626', textColor: '#000000'
  },

  // === 135 FORMAT - CINESTILL ===
  { 
    id: 'c_50d_135', brand: 'CineStill', name: '50D', type: '彩色电影卷', iso: 50, format: '135', popular: false,
    boxStyle: '', accent: '', colorStart: '#fef3c7', colorEnd: '#fcd34d', textColor: '#000000'
  },
  { 
    id: 'c_400d_135', brand: 'CineStill', name: '400D', type: '彩色电影卷', iso: 400, format: '135', popular: false,
    boxStyle: '', accent: '', colorStart: '#fef08a', colorEnd: '#eab308', textColor: '#000000'
  },
  { 
    id: 'c_800t_135', brand: 'CineStill', name: '800T', type: '彩色电影卷', iso: 800, format: '135', popular: true,
    boxStyle: '', accent: '', colorStart: '#09090b', colorEnd: '#18181b', textColor: '#ef4444'
  },

  // === 135 FORMAT - LUCKY (乐凯) ===
  { 
    id: 'l_c200_135', brand: 'Lucky', name: 'Color 200', type: '彩色负片', iso: 200, format: '135', popular: true,
    boxStyle: '', accent: '', colorStart: '#b91c1c', colorEnd: '#7f1d1d', textColor: '#facc15'
  },
  { 
    id: 'l_shd100_135', brand: 'Lucky', name: 'SHD 100', type: '黑白负片', iso: 100, format: '135', popular: true,
    boxStyle: '', accent: '', colorStart: '#fef3c7', colorEnd: '#b91c1c', textColor: '#000000'
  },
  { 
    id: 'l_shd400_135', brand: 'Lucky', name: 'SHD 400', type: '黑白负片', iso: 400, format: '135', popular: false,
    boxStyle: '', accent: '', colorStart: '#fcd34d', colorEnd: '#7f1d1d', textColor: '#000000'
  },

  // === 135 FORMAT - FOMA ===
  { 
    id: 'fo_100_135', brand: 'FOMA', name: 'Fomapan 100', type: '黑白负片', iso: 100, format: '135', popular: false,
    boxStyle: '', accent: '', colorStart: '#e2e8f0', colorEnd: '#475569', textColor: '#000000'
  },
  { 
    id: 'fo_200_135', brand: 'FOMA', name: 'Fomapan 200', type: '黑白负片', iso: 200, format: '135', popular: false,
    boxStyle: '', accent: '', colorStart: '#cbd5e1', colorEnd: '#334155', textColor: '#000000'
  },
  { 
    id: 'fo_400_135', brand: 'FOMA', name: 'Fomapan 400', type: '黑白负片', iso: 400, format: '135', popular: true,
    boxStyle: '', accent: '', colorStart: '#94a3b8', colorEnd: '#1e293b', textColor: '#ffffff'
  },

  // === 135 FORMAT - ROLLEI ===
  { 
    id: 'r_retro400_135', brand: 'Rollei', name: 'Retro 400S', type: '黑白负片', iso: 400, format: '135', popular: false,
    boxStyle: '', accent: '', colorStart: '#44403c', colorEnd: '#1c1917', textColor: '#fbbf24'
  },
  { 
    id: 'r_rpx400_135', brand: 'Rollei', name: 'RPX 400', type: '黑白负片', iso: 400, format: '135', popular: false,
    boxStyle: '', accent: '', colorStart: '#57534e', colorEnd: '#292524', textColor: '#ffffff'
  },

  // === 120 FORMAT ===
  // Kodak 120
  { 
    id: 'k_p400_120', brand: 'Kodak', name: 'Portra 400', type: '彩色负片', iso: 400, format: '120', popular: true,
    boxStyle: '', accent: '', colorStart: '#facc15', colorEnd: '#ef4444', textColor: '#000000'
  },
  { 
    id: 'k_p160_120', brand: 'Kodak', name: 'Portra 160', type: '彩色负片', iso: 160, format: '120', popular: false,
    boxStyle: '', accent: '', colorStart: '#fef08a', colorEnd: '#fb923c', textColor: '#000000'
  },
  { 
    id: 'k_p800_120', brand: 'Kodak', name: 'Portra 800', type: '彩色负片', iso: 800, format: '120', popular: false,
    boxStyle: '', accent: '', colorStart: '#f97316', colorEnd: '#991b1b', textColor: '#000000'
  },
  { 
    id: 'k_ektar100_120', brand: 'Kodak', name: 'Ektar 100', type: '彩色负片', iso: 100, format: '120', popular: false,
    boxStyle: '', accent: '', colorStart: '#ef4444', colorEnd: '#7f1d1d', textColor: '#ffffff'
  },
  { 
    id: 'k_trix_120', brand: 'Kodak', name: 'Tri-X 400', type: '黑白负片', iso: 400, format: '120', popular: true,
    boxStyle: '', accent: '', colorStart: '#000000', colorEnd: '#111111', textColor: '#eab308'
  },
  { 
    id: 'k_tmax100_120', brand: 'Kodak', name: 'T-Max 100', type: '黑白负片', iso: 100, format: '120', popular: false,
    boxStyle: '', accent: '', colorStart: '#18181b', colorEnd: '#000000', textColor: '#ffffff'
  },
  { 
    id: 'k_tmax400_120', brand: 'Kodak', name: 'T-Max 400', type: '黑白负片', iso: 400, format: '120', popular: false,
    boxStyle: '', accent: '', colorStart: '#18181b', colorEnd: '#000000', textColor: '#ffffff'
  },
  { 
    id: 'k_e100_120', brand: 'Kodak', name: 'Ektachrome E100', type: '彩色反转片', iso: 100, format: '120', popular: false,
    boxStyle: '', accent: '', colorStart: '#3b82f6', colorEnd: '#1d4ed8', textColor: '#ffffff'
  },
  
  // Fujifilm 120
  { 
    id: 'f_pro400h_120', brand: 'Fujifilm', name: 'Pro 400H', type: '彩色负片 (已停产)', iso: 400, format: '120', popular: false,
    boxStyle: '', accent: '', colorStart: '#ccfbf1', colorEnd: '#5eead4', textColor: '#042f2e'
  },
  { 
    id: 'f_acros100ii_120', brand: 'Fujifilm', name: 'Acros 100 II', type: '黑白负片', iso: 100, format: '120', popular: true,
    boxStyle: '', accent: '', colorStart: '#f1f5f9', colorEnd: '#94a3b8', textColor: '#000000'
  },
  { 
    id: 'f_velvia50_120', brand: 'Fujifilm', name: 'Velvia 50', type: '彩色反转片', iso: 50, format: '120', popular: false,
    boxStyle: '', accent: '', colorStart: '#16a34a', colorEnd: '#b91c1c', textColor: '#ffffff'
  },
  { 
    id: 'f_velvia100_120', brand: 'Fujifilm', name: 'Velvia 100', type: '彩色反转片', iso: 100, format: '120', popular: true,
    boxStyle: '', accent: '', colorStart: '#22c55e', colorEnd: '#dc2626', textColor: '#ffffff'
  },
  { 
    id: 'f_provia100f_120', brand: 'Fujifilm', name: 'Provia 100F', type: '彩色反转片', iso: 100, format: '120', popular: false,
    boxStyle: '', accent: '', colorStart: '#38bdf8', colorEnd: '#0369a1', textColor: '#ffffff'
  },
  
  // Ilford 120
  { 
    id: 'i_hp5_120', brand: 'Ilford', name: 'HP5 Plus', type: '黑白负片', iso: 400, format: '120', popular: true,
    boxStyle: '', accent: '', colorStart: '#18181b', colorEnd: '#27272a', textColor: '#ffffff'
  },
  { 
    id: 'i_fp4_120', brand: 'Ilford', name: 'FP4 Plus', type: '黑白负片', iso: 125, format: '120', popular: false,
    boxStyle: '', accent: '', colorStart: '#e2e8f0', colorEnd: '#94a3b8', textColor: '#000000'
  },
  { 
    id: 'i_delta100_120', brand: 'Ilford', name: 'Delta 100', type: '黑白负片', iso: 100, format: '120', popular: false,
    boxStyle: '', accent: '', colorStart: '#cbd5e1', colorEnd: '#475569', textColor: '#000000'
  },
  { 
    id: 'i_delta400_120', brand: 'Ilford', name: 'Delta 400', type: '黑白负片', iso: 400, format: '120', popular: false,
    boxStyle: '', accent: '', colorStart: '#64748b', colorEnd: '#1e293b', textColor: '#ffffff'
  },
  { 
    id: 'i_delta3200_120', brand: 'Ilford', name: 'Delta 3200', type: '黑白负片', iso: 3200, format: '120', popular: false,
    boxStyle: '', accent: '', colorStart: '#0f172a', colorEnd: '#000000', textColor: '#ffffff'
  },
  { 
    id: 'i_kent100_120', brand: 'Ilford', name: 'Kentmere PAN 100', type: '黑白负片', iso: 100, format: '120', popular: false,
    boxStyle: '', accent: '', colorStart: '#e2e8f0', colorEnd: '#64748b', textColor: '#000000'
  },
  { 
    id: 'i_kent400_120', brand: 'Ilford', name: 'Kentmere PAN 400', type: '黑白负片', iso: 400, format: '120', popular: false,
    boxStyle: '', accent: '', colorStart: '#71717a', colorEnd: '#27272a', textColor: '#ffffff'
  },
  { 
    id: 'i_phoenix200_120', brand: 'Ilford', name: 'Phoenix 200', type: '彩色负片', iso: 200, format: '120', popular: false,
    boxStyle: '', accent: '', colorStart: '#fbbf24', colorEnd: '#dc2626', textColor: '#000000'
  },
  
  // CineStill 120
  { 
    id: 'c_50d_120', brand: 'CineStill', name: '50D', type: '彩色电影卷', iso: 50, format: '120', popular: false,
    boxStyle: '', accent: '', colorStart: '#fef3c7', colorEnd: '#fcd34d', textColor: '#000000'
  },
  { 
    id: 'c_400d_120', brand: 'CineStill', name: '400D', type: '彩色电影卷', iso: 400, format: '120', popular: false,
    boxStyle: '', accent: '', colorStart: '#fef08a', colorEnd: '#eab308', textColor: '#000000'
  },
  { 
    id: 'c_800t_120', brand: 'CineStill', name: '800T', type: '彩色电影卷', iso: 800, format: '120', popular: false,
    boxStyle: '', accent: '', colorStart: '#09090b', colorEnd: '#18181b', textColor: '#ef4444'
  },
  
  // FOMA 120
  { 
    id: 'fo_100_120', brand: 'FOMA', name: 'Fomapan 100', type: '黑白负片', iso: 100, format: '120', popular: false,
    boxStyle: '', accent: '', colorStart: '#e2e8f0', colorEnd: '#475569', textColor: '#000000'
  },
  { 
    id: 'fo_200_120', brand: 'FOMA', name: 'Fomapan 200', type: '黑白负片', iso: 200, format: '120', popular: false,
    boxStyle: '', accent: '', colorStart: '#cbd5e1', colorEnd: '#334155', textColor: '#000000'
  },
  { 
    id: 'fo_400_120', brand: 'FOMA', name: 'Fomapan 400', type: '黑白负片', iso: 400, format: '120', popular: false,
    boxStyle: '', accent: '', colorStart: '#94a3b8', colorEnd: '#1e293b', textColor: '#ffffff'
  },
  
  // Rollei 120
  { 
    id: 'r_rpx100_120', brand: 'Rollei', name: 'RPX 100', type: '黑白负片', iso: 100, format: '120', popular: false,
    boxStyle: '', accent: '', colorStart: '#d6d3d1', colorEnd: '#44403c', textColor: '#000000'
  },
  { 
    id: 'r_rpx400_120', brand: 'Rollei', name: 'RPX 400', type: '黑白负片', iso: 400, format: '120', popular: false,
    boxStyle: '', accent: '', colorStart: '#57534e', colorEnd: '#292524', textColor: '#ffffff'
  },
  
  // Lucky 120
  { 
    id: 'l_shd100_120', brand: 'Lucky', name: 'SHD 100', type: '黑白负片', iso: 100, format: '120', popular: false,
    boxStyle: '', accent: '', colorStart: '#fef3c7', colorEnd: '#b91c1c', textColor: '#000000'
  },
  { 
    id: 'l_shd400_120', brand: 'Lucky', name: 'SHD 400', type: '黑白负片', iso: 400, format: '120', popular: false,
    boxStyle: '', accent: '', colorStart: '#fcd34d', colorEnd: '#7f1d1d', textColor: '#000000'
  },
];

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilm, setSelectedFilm] = useState<FilmStock | null>(null);
  
  // 新增：整卷元数据状态
  const [rollData, setRollData] = useState<Partial<RollMetadata>>({});
  // 新增：控制是否进入暗房工作台
  const [isWorkspaceActive, setIsWorkspaceActive] = useState(false);
  // 最近使用的胶卷
  const [recentFilmIds, setRecentFilmIds] = useState<string[]>([]);

  const COMMON_CAMERAS = [
    'Leica M6', 'Leica M3', 'Leica MP', 'Hasselblad 500C/M', 
    'Canon AE-1', 'Canon A-1', 'Nikon F3', 'Nikon FM2', 
    'Pentax K1000', 'Pentax 67', 'Rolleiflex 2.8F', 
    'Contax T2', 'Contax G2', 'Olympus OM-1', 'Olympus MJU II', 'Fujifilm TX-1',
    'Yashica T4', 'Mamiya 7'
  ];

  const COMMON_LENSES = [
    'Summicron 35mm f/2', 'Elmarit 28mm f/2.8',
    'Planar 80mm f/2.8', 'Distagon 50mm f/1.4',
    '50mm f/1.4', '50mm f/1.8', '35mm f/2.8', '28mm f/2.8'
  ];

  const COMMON_SCANNERS = [
    'Fujifilm Frontier SP3000', 'Fujifilm Frontier SP500', 
    'Noritsu HS-1800', 'Noritsu LS-600', 'Noritsu HS-1100',
    'Hasselblad Flextight X5', 'Hasselblad Flextight X1',
    'Epson V850 Pro', 'Epson V800', 'Epson V700', 'Epson V600',
    'Nikon Super Coolscan 9000 ED', 'Nikon Coolscan 5000 ED',
    'Plustek OpticFilm 8200i', 'Plustek OpticFilm 8100',
    'Heidelberg Tango Drum Scanner'
  ];

  // BMP 转换弹窗状态
  const [bmpDialog, setBmpDialog] = useState<{show: boolean, bmpFiles: any[], allFiles: any[], nonBmpFiles: any[]} | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  // 使用 useMemo 缓存搜索结果，避免每次输入都重新计算（必须在所有 hooks 之后、条件 return 之前）
  const filteredFilms = useMemo(() => 
    FILM_DATABASE.filter(film => 
      film.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      film.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      film.type.includes(searchQuery)
    ),
    [searchQuery]
  );

  const recentFilms = useMemo(() => 
    filteredFilms.filter(f => recentFilmIds.includes(f.id)),
    [filteredFilms, recentFilmIds]
  );
  
  // 品牌分组显示所有胶卷（包括最近使用的）
  const groupedOtherFilms = useMemo(() => 
    filteredFilms.reduce((acc, film) => {
      if (!acc[film.brand]) acc[film.brand] = [];
      acc[film.brand].push(film);
      return acc;
    }, {} as Record<string, typeof FILM_DATABASE>),
    [filteredFilms]
  );

  // 导入并扫描目录
  const handleSelectDirectory = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
      });
      
      if (selected) {
        const result: any = await invoke('scan_directory', { path: selected });
        
        if (result.files && result.files.length > 0) {
          const bmpFiles = result.files.filter((f: any) => f.format === 'bmp');
          const nonBmpFiles = result.files.filter((f: any) => f.format !== 'bmp');
          
          if (bmpFiles.length > 0) {
            // 有 BMP 文件，弹窗询问
            setBmpDialog({ show: true, bmpFiles, allFiles: result.files, nonBmpFiles });
          } else {
            // 没有 BMP，直接导入
            setRollData({
              ...rollData,
              filmStock: selectedFilm!,
              importedFiles: result.files
            });
          }
        } else {
          alert('该文件夹下没有找到支持的图片格式 (JPG, TIFF, BMP)');
        }
      }
    } catch (err) {
      console.error('Failed to open directory:', err);
      alert(`无法打开文件夹选择器: ${err}`);
    }
  };

  // 用户选择转换 BMP
  const handleConvertBmp = async () => {
    if (!bmpDialog) return;
    setIsConverting(true);
    try {
      const bmpPaths = bmpDialog.bmpFiles.map((f: any) => f.path);
      const result: any = await invoke('convert_bmp_to_tiff', { bmpPaths });
      
      // 合并：非 BMP 文件 + 转换后的 TIFF 文件
      const finalFiles = [...bmpDialog.nonBmpFiles, ...result.files].sort(
        (a: any, b: any) => a.name.localeCompare(b.name)
      );
      
      setRollData({
        ...rollData,
        filmStock: selectedFilm!,
        importedFiles: finalFiles
      });
      setBmpDialog(null);
    } catch (err) {
      console.error('BMP conversion failed:', err);
      alert(`转换失败: ${err}`);
    } finally {
      setIsConverting(false);
    }
  };

  // 用户选择跳过 BMP（只导入非 BMP 文件）
  const handleSkipBmp = () => {
    if (!bmpDialog) return;
    if (bmpDialog.nonBmpFiles.length > 0) {
      setRollData({
        ...rollData,
        filmStock: selectedFilm!,
        importedFiles: bmpDialog.nonBmpFiles
      });
    }
    setBmpDialog(null);
  };

  // 进入工作台
  const enterWorkspace = () => {
    if (selectedFilm) {
      if (!rollData.importedFiles || rollData.importedFiles.length === 0) {
        alert("请先导入包含扫描件的文件夹！");
        return;
      }
      
      setRollData({ ...rollData, filmStock: selectedFilm });
      
      // 添加到最近使用
      setRecentFilmIds(prev => {
        const newRecent = [selectedFilm.id, ...prev.filter(id => id !== selectedFilm.id)].slice(0, 4);
        return newRecent;
      });
      
      setIsWorkspaceActive(true);
    }
  };

  // 如果处于工作台模式，渲染工作台组件
  if (isWorkspaceActive && rollData.filmStock) {
    console.log("=== ENTERING WORKSPACE ===");
    console.log("rollData:", JSON.stringify(rollData, null, 2));
    console.log("filmStock:", rollData.filmStock);
    console.log("importedFiles count:", rollData.importedFiles?.length);
    console.log("importedFiles sample:", rollData.importedFiles?.[0]);
    
    return (
      <ErrorBoundary>
        <WorkspaceCanvas 
          rollMetadata={rollData as RollMetadata} 
          onBack={() => setIsWorkspaceActive(false)} 
        />
      </ErrorBoundary>
    );
  }

  const FilmCard = ({ film }: { film: typeof FILM_DATABASE[0] }) => (
    <motion.div
      whileHover={{
        y: -4,
        scale: 1.02,
        transition: { 
          duration: 0.3, 
          ease: "easeOut"
        }
      }}
      whileTap={{ scale: 0.98, y: 0, transition: { duration: 0.1 } }}
      onClick={() => {
        setSelectedFilm(film);
        // 记录到最近使用（去重 + 限制4个）
        setRecentFilmIds(prev => {
          const filtered = prev.filter(id => id !== film.id);
          return [film.id, ...filtered].slice(0, 4);
        });
      }}
      className="flex flex-col bg-zinc-900/50 border border-zinc-800/80 rounded-2xl overflow-hidden cursor-pointer group hover:border-zinc-700 hover:bg-zinc-800/50 shadow-lg hover:shadow-2xl hover:shadow-black/50 relative will-change-transform"
    >
      <div className={`h-56 w-full relative flex items-center justify-center overflow-hidden bg-black`}>
        {/* Vector 3D Film Canister */}
        <div className="z-10 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-translate-y-2">
          <VectorFilmCanister 
            brandColorStart={film.colorStart} 
            brandColorEnd={film.colorEnd} 
            textColor={film.textColor}
            iso={film.iso}
            className="w-32 h-32 drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)] group-hover:drop-shadow-[0_20px_20px_rgba(0,0,0,0.9)] transition-all duration-500"
          />
        </div>
        
        {/* Background glow based on the film accent color */}
        <div 
          className="absolute inset-0 opacity-40 blur-[50px] z-0 transition-opacity duration-500 group-hover:opacity-80 mix-blend-screen" 
          style={{ background: `radial-gradient(circle at center, ${film.colorStart} 0%, transparent 60%)` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent z-10 pointer-events-none"></div>
      </div>

      <div className="p-4 flex flex-col justify-between flex-1 bg-zinc-900/80 backdrop-blur-sm z-30 border-t border-zinc-800/50">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-100 group-hover:text-white transition-colors">
              {film.brand} {film.name}
            </h3>
            <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] font-black text-zinc-400">
              {film.format}
            </span>
          </div>
          <p className="text-xs font-medium text-zinc-500 mt-1 uppercase tracking-wider">{film.type}</p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs font-bold px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-zinc-300 shadow-inner">ISO {film.iso}</span>
          <ChevronRight size={18} className="text-zinc-600 group-hover:text-zinc-300 transition-colors transform group-hover:translate-x-1" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen w-full bg-zinc-950 flex flex-col items-center pt-16 pb-12 px-8 overflow-y-auto custom-scrollbar relative">
      
      {/* 顶部标题区 */}
      <div className="w-full max-w-6xl flex items-end justify-between mb-12 relative z-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-zinc-100 mb-2">Film Stock</h1>
          <p className="text-zinc-400 text-lg">选择胶卷，进入暗房工作台</p>
        </div>
        
        <div className="relative group w-72">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-zinc-300">
            <Search size={16} />
          </div>
          <input
            type="text"
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl py-2 pl-9 pr-4 text-sm outline-none focus:border-zinc-700 focus:bg-zinc-800/80 transition-all placeholder:text-zinc-600 shadow-inner"
            placeholder="搜索胶卷名称或品牌..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 胶卷列表区 */}
      <div className="w-full max-w-6xl flex-1 relative z-10">
        {recentFilms.length > 0 && searchQuery === '' && (
          <div className="mb-16">
            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center">
              <span className="w-2 h-2 rounded-full bg-zinc-600 mr-3"></span>
              Recently Used / 最近使用
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recentFilms.map(film => <FilmCard key={film.id} film={film} />)}
            </div>
          </div>
        )}

        {Object.entries(groupedOtherFilms).map(([brand, films]) => (
          <div key={brand} className="mb-12">
            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6 border-b border-zinc-800/50 pb-3 flex items-center">
              {brand}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {films.map(film => <FilmCard key={film.id} film={film} />)}
            </div>
          </div>
        ))}
      </div>

      {/* 弹出层：新建底片卷 (整卷元数据录入 & 导入) */}
      <AnimatePresence>
        {selectedFilm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedFilm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="px-8 py-5 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/80 backdrop-blur-sm">
                <h2 className="text-xl font-bold text-white">配置底片卷元数据</h2>
                <button onClick={() => setSelectedFilm(null)} className="p-2 -mr-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition">
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-8 space-y-8 overflow-y-auto max-h-[75vh] custom-scrollbar">
                
                {/* 1. 已选胶卷状态指示 */}
                <div className="flex items-center space-x-6 bg-zinc-950/50 p-6 rounded-2xl border border-zinc-800/50 relative overflow-hidden">
                   {/* 背景光晕 */}
                   <div 
                     className="absolute -left-10 w-40 h-40 blur-[50px] rounded-full opacity-30 z-0 mix-blend-screen" 
                     style={{ background: `radial-gradient(circle, ${selectedFilm.colorStart} 0%, transparent 70%)` }}
                   ></div>
                   
                   <div className="w-24 h-24 flex items-center justify-center z-10">
                      <VectorFilmCanister 
                        brandColorStart={selectedFilm.colorStart} 
                        brandColorEnd={selectedFilm.colorEnd} 
                        textColor={selectedFilm.textColor}
                        iso={selectedFilm.iso}
                        className="w-24 h-24 drop-shadow-2xl"
                      />
                   </div>
                   
                   <div className="z-10 ml-2">
                     <div className="text-xs font-semibold tracking-wider text-zinc-500 uppercase mb-1 flex items-center gap-2">
                        <Film size={12} />
                        Selected Film Stock
                     </div>
                     <div className="font-black text-2xl text-white tracking-tight flex items-center gap-3">
                       {selectedFilm.brand} {selectedFilm.name}
                       <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-xs font-black text-zinc-400 align-middle">
                         {selectedFilm.format}
                       </span>
                     </div>
                   </div>
                   <div className="ml-auto z-10">
                     <span className="px-4 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-bold text-zinc-300 shadow-inner">ISO {selectedFilm.iso}</span>
                   </div>
                </div>

                {/* 2. 整卷元数据表单 (相机/镜头/位置) */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                       <Camera size={16} className="text-zinc-500" /> 
                       相机型号
                     </label>
                     <AutocompleteInput 
                       value={rollData.cameraMakeModel || ''}
                       onChange={val => setRollData({...rollData, cameraMakeModel: val})}
                       placeholder="例如: Leica M6"
                       options={COMMON_CAMERAS}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                       <Aperture size={16} className="text-zinc-500" /> 
                       拍摄镜头
                     </label>
                     <AutocompleteInput 
                       value={rollData.lens || ''}
                       onChange={val => setRollData({...rollData, lens: val})}
                       placeholder="例如: Summicron 35mm"
                       options={COMMON_LENSES}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                       <Calendar size={16} className="text-zinc-500" /> 
                       拍摄/冲扫日期
                     </label>
                     {/* Web 原生的 date picker 在暗色模式下也需要一点美化 */}
                     <input 
                       type="date" 
                       className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 outline-none transition-all [color-scheme:dark]" 
                       value={rollData.dateShot || ''}
                       onChange={e => setRollData({...rollData, dateShot: e.target.value})}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                       拍摄地点
                     </label>
                     <LocationInput 
                       value={rollData.location || ''}
                       onChange={(val, lat, lon) => setRollData({...rollData, location: val, latitude: lat, longitude: lon})}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                       <Store size={16} className="text-zinc-500" /> 
                       冲扫店 / 冲洗机构
                     </label>
                     <input
                       type="text"
                       className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 outline-none transition-all"
                       placeholder="例如: 某某暗房 / 菲林照相馆"
                       value={rollData.developer || ''}
                       onChange={e => setRollData({...rollData, developer: e.target.value})}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                       <ScanLine size={16} className="text-zinc-500" /> 
                       扫描仪型号
                     </label>
                     <AutocompleteInput 
                       value={rollData.scanner || ''}
                       onChange={val => setRollData({...rollData, scanner: val})}
                       placeholder="例如: Noritsu HS-1800"
                       options={COMMON_SCANNERS}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                       <Film size={16} className="text-zinc-500" /> 
                       ISO 感光度
                     </label>
                     <input
                       type="text"
                       className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 outline-none transition-all placeholder:text-zinc-700"
                       placeholder={`默认: ${selectedFilm?.iso || '100'}`}
                       value={rollData.iso || ''}
                       onChange={e => setRollData({...rollData, iso: e.target.value})}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                       <Gauge size={16} className="text-zinc-500" /> 
                       曝光补偿 (EV)
                     </label>
                     <input
                       type="text"
                       className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 outline-none transition-all placeholder:text-zinc-700"
                       placeholder="例如: +1, -0.5, 0"
                       value={rollData.ev || ''}
                       onChange={e => setRollData({...rollData, ev: e.target.value})}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                       <User size={16} className="text-zinc-500" /> 
                       摄影师 / 作者
                     </label>
                     <input
                       type="text"
                       className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 outline-none transition-all placeholder:text-zinc-700"
                       placeholder="例如: 你的名字"
                       value={rollData.author || ''}
                       onChange={e => setRollData({...rollData, author: e.target.value})}
                     />
                   </div>
                </div>

                {/* 3. 导入照片文件夹 (Dropzone) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                    导入扫描件
                  </label>
                  <div 
                    onClick={handleSelectDirectory}
                    className={`border-2 border-dashed transition-colors rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer group ${
                      rollData.importedFiles && rollData.importedFiles.length > 0
                        ? 'border-green-500/50 bg-green-500/10 hover:border-green-400' 
                        : 'border-zinc-700/60 bg-zinc-950/30 hover:border-zinc-500'
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 transition-all shadow-lg ${
                      rollData.importedFiles && rollData.importedFiles.length > 0
                        ? 'bg-green-500/20 border border-green-500/30 text-green-400 group-hover:bg-green-500/30'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:bg-zinc-800 group-hover:border-zinc-700 group-hover:text-zinc-200'
                    }`}>
                      <Upload size={24} />
                    </div>
                    {rollData.importedFiles && rollData.importedFiles.length > 0 ? (
                      <>
                        <p className="text-green-400 font-bold text-lg mb-2">已导入 {rollData.importedFiles.length} 张照片</p>
                        <p className="text-green-500/70 text-sm">点击可重新选择文件夹</p>
                      </>
                    ) : (
                      <>
                        <p className="text-zinc-200 font-medium text-lg mb-2 group-hover:text-white transition-colors">点击选择包含图片的文件夹</p>
                        <p className="text-zinc-500 text-sm flex items-center">
                          支持 <span className="text-zinc-400 font-mono mx-1">.JPG</span> / <span className="text-zinc-400 font-mono mx-1">.TIFF</span> / <span className="text-zinc-400 font-mono mx-1">.BMP</span> 格式
                        </p>
                      </>
                    )}
                  </div>
                </div>

              </div>

              {/* Footer Actions */}
              <div className="px-8 py-5 border-t border-zinc-800/50 bg-zinc-950/80 flex justify-end items-center space-x-4">
                 <button 
                   onClick={() => setSelectedFilm(null)}
                   className="px-6 py-2.5 text-zinc-400 hover:text-white font-medium transition-colors"
                 >
                   取消
                 </button>
                 <button 
                   onClick={enterWorkspace}
                   className="px-8 py-2.5 bg-white text-black font-bold rounded-full hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/10"
                 >
                   进入暗房工作台
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BMP 转换确认弹窗 */}
      <AnimatePresence>
        {bmpDialog?.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
                    <span className="text-yellow-500 text-lg">⚠</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">检测到 BMP 文件</h3>
                </div>

                <p className="text-sm text-zinc-400 mb-3">
                  发现 <span className="text-yellow-400 font-bold">{bmpDialog.bmpFiles.length}</span> 个 BMP 文件。BMP 格式不支持写入 EXIF 元数据。
                </p>
                <p className="text-sm text-zinc-400 mb-4">
                  是否将它们转换为 TIFF 格式？
                </p>

                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 mb-4">
                  <p className="text-xs text-red-400 font-medium flex items-center gap-1.5">
                    <span>⚠</span>
                    此操作将直接修改原始文件（BMP → TIFF），不可撤销
                  </p>
                </div>

                <div className="text-xs text-zinc-600 mb-1">涉及文件：</div>
                <div className="max-h-24 overflow-y-auto custom-scrollbar bg-zinc-950 rounded-lg p-2 mb-4">
                  {bmpDialog.bmpFiles.map((f: any, i: number) => (
                    <div key={i} className="text-xs text-zinc-500 font-mono truncate py-0.5">{f.name}</div>
                  ))}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/80 flex justify-end gap-3">
                <button
                  onClick={handleSkipBmp}
                  disabled={isConverting}
                  className="px-5 py-2 text-sm text-zinc-400 hover:text-white font-medium transition-colors"
                >
                  {bmpDialog.nonBmpFiles.length > 0 ? '跳过 BMP，仅导入其他文件' : '取消'}
                </button>
                <button
                  onClick={handleConvertBmp}
                  disabled={isConverting}
                  className="px-5 py-2 text-sm bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isConverting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      转换中...
                    </>
                  ) : (
                    `转换为 TIFF (${bmpDialog.bmpFiles.length} 个文件)`
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
