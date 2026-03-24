// src/types/index.ts

export type FilmStock = {
  id: string;
  brand: string;
  name: string;
  type: string;
  iso: number;
  format: '135' | '120';
  popular?: boolean;
  coverImage?: string;
  boxStyle: string;
  accent: string;
  colorStart?: string;
  colorEnd?: string;
  textColor?: string;
};

export type RollMetadata = {
  filmStock: FilmStock;
  cameraMakeModel: string;
  lens: string;
  dateShot: string;
  location: string;
  latitude?: number;
  longitude?: number;
  developer?: string;
  scanner?: string;
  importedFiles?: { path: string; name: string; format: string }[];
};

export type FrameMetadata = {
  id: string;
  filePath: string;
  fileName: string;
  aperture?: string;
  shutterSpeed?: string;
  notes?: string;
};

// 后续可能还会扩展，比如 exif 写入状态 (pending, writing, success, error)
