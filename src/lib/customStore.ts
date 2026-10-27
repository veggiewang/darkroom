// 用户自定义的胶卷 / 相机 / 镜头 / 扫描仪，保存在本机 localStorage
import type { FilmStock } from '../types';

const FILMS_KEY = 'darkroom.customFilms';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to save ${key}:`, e);
  }
}

export const loadCustomFilms = () => load<FilmStock[]>(FILMS_KEY, []);
export const saveCustomFilms = (films: FilmStock[]) => save(FILMS_KEY, films);

export type CustomListKind = 'cameras' | 'lenses' | 'scanners';
const listKey = (kind: CustomListKind) => `darkroom.custom${kind[0].toUpperCase()}${kind.slice(1)}`;

export const loadCustomList = (kind: CustomListKind) => load<string[]>(listKey(kind), []);
export const saveCustomList = (kind: CustomListKind, items: string[]) => save(listKey(kind), items);
