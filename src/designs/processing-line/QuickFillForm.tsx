import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Copy,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  Camera,
  Aperture,
  CalendarDays,
  FlaskConical,
  StickyNote,
  Star,
  ChevronUp,
  Minus,
  Plus,
  Film,
} from 'lucide-react';
import type { RollSettings } from './types';
import { FILM_STOCKS, DEFAULT_SETTINGS } from './types';
import { MOCK_ROLL_SETTINGS } from './mockData';

interface QuickFillFormProps {
  folderName: string;
  onComplete: (settings: RollSettings) => void;
  onBack: () => void;
}

const FILM_TYPE_OPTIONS = [
  { value: 'color_negative', label: '彩色负片', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { value: 'bw_negative', label: '黑白负片', color: 'text-gray-700 bg-gray-100 border-gray-300' },
  { value: 'color_positive', label: '彩色正片', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { value: 'bw_positive', label: '黑白正片', color: 'text-purple-600 bg-purple-50 border-purple-200' },
] as const;

const LAST_SETTINGS_KEY = 'darkroom_last_roll_settings';
const DRAFT_KEY = 'darkroom_quickfill_draft';

function loadLastSettings(): RollSettings | null {
  try {
    const raw = localStorage.getItem(LAST_SETTINGS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveDraft(settings: RollSettings) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(settings));
  } catch {}
}

function loadDraft(): RollSettings | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function QuickFillForm({ folderName, onComplete, onBack }: QuickFillFormProps) {
  const draft = loadDraft();
  const [settings, setSettings] = useState<RollSettings>(draft || DEFAULT_SETTINGS);
  const [filmSearch, setFilmSearch] = useState(settings.filmStock);
  const [filmDropdown, setFilmDropdown] = useState(false);
  const [hasDraft] = useState(!!draft);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copyFlash, setCopyFlash] = useState(false);
  const filmInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Auto-save draft on settings change
  useEffect(() => {
    saveDraft(settings);
  }, [settings]);

  const update = useCallback(<K extends keyof RollSettings>(key: K, value: RollSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleCopyLast = useCallback(() => {
    const last = loadLastSettings() || MOCK_ROLL_SETTINGS;
    setSettings(prev => ({
      ...last,
      dateShot: prev.dateShot,
      dateProcessed: prev.dateProcessed,
      notes: prev.notes,
    }));
    setFilmSearch(last.filmStock);
    setCopyFlash(true);
    setTimeout(() => setCopyFlash(false), 1000);
  }, []);

  const handleReset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    setFilmSearch('');
    localStorage.removeItem(DRAFT_KEY);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(LAST_SETTINGS_KEY, JSON.stringify(settings));
    localStorage.removeItem(DRAFT_KEY);
    onComplete(settings);
  }, [settings, onComplete]);

  const filteredFilms = FILM_STOCKS.filter(f =>
    `${f.brand} ${f.name}`.toLowerCase().includes(filmSearch.toLowerCase())
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filmInputRef.current && !filmInputRef.current.closest('.film-dropdown-container')?.contains(e.target as Node)) {
        setFilmDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const pushPullLabel = (val: number) => {
    if (val === 0) return '正常冲洗';
    if (val > 0) return `增感 +${val} 档`;
    return `减感 ${val} 档`;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <form ref={formRef} onSubmit={handleSubmit} className="max-w-2xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">填写卷级信息</h2>
            <p className="text-xs text-gray-400 font-mono mt-0.5 truncate max-w-[320px]">{folderName}</p>
          </div>
          <div className="flex items-center gap-2">
            {hasDraft && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 font-medium">
                草稿已恢复
              </span>
            )}
            <button
              type="button"
              onClick={handleCopyLast}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150',
                copyFlash
                  ? 'bg-green-50 text-green-600 border-green-200'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
              ].join(' ')}
            >
              <Copy size={12} />
              {copyFlash ? '已复制' : '从上次复制'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <RotateCcw size={12} />
              重置
            </button>
          </div>
        </div>

        {/* Section: Film */}
        <section className="mb-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Film size={11} />
            胶卷
          </h3>
          <div className="grid grid-cols-5 gap-3">
            {/* Film stock */}
            <div className="col-span-3 film-dropdown-container relative">
              <label className="block text-xs text-gray-500 mb-1 font-medium">胶卷型号</label>
              <input
                ref={filmInputRef}
                type="text"
                value={filmSearch}
                onChange={e => {
                  setFilmSearch(e.target.value);
                  update('filmStock', e.target.value);
                  setFilmDropdown(true);
                }}
                onFocus={() => setFilmDropdown(true)}
                placeholder="如 Kodak Portra 400…"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {filmDropdown && filteredFilms.length > 0 && (
                <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-52 overflow-y-auto">
                  {filteredFilms.slice(0, 12).map(film => (
                    <button
                      key={`${film.brand}-${film.name}`}
                      type="button"
                      className="w-full px-3 py-2 text-left hover:bg-blue-50 flex items-center justify-between group"
                      onClick={() => {
                        const full = `${film.brand} ${film.name}`;
                        setFilmSearch(full);
                        update('filmStock', full);
                        update('iso', film.iso);
                        update('filmType', film.type as RollSettings['filmType']);
                        setFilmDropdown(false);
                      }}
                    >
                      <span className="text-sm text-gray-800 group-hover:text-blue-700">
                        {film.brand} <span className="font-semibold">{film.name}</span>
                      </span>
                      <span className="text-xs text-gray-400 group-hover:text-blue-400">ISO {film.iso}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ISO */}
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1 font-medium">感光度 (ISO)</label>
              <input
                type="number"
                value={settings.iso}
                onChange={e => update('iso', parseInt(e.target.value) || 400)}
                min={25} max={6400} step={1}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Film type selector */}
          <div className="mt-3">
            <label className="block text-xs text-gray-500 mb-2 font-medium">胶卷类型</label>
            <div className="flex gap-2">
              {FILM_TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update('filmType', opt.value)}
                  className={[
                    'flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all',
                    settings.filmType === opt.value
                      ? opt.color
                      : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-gray-100 mb-5" />

        {/* Section: Camera */}
        <section className="mb-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Camera size={11} />
            器材
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1 font-medium">相机</label>
              <input
                type="text"
                value={settings.camera}
                onChange={e => update('camera', e.target.value)}
                placeholder="如 Nikon FM2"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 font-medium">镜头</label>
              <input
                type="text"
                value={settings.lens}
                onChange={e => update('lens', e.target.value)}
                placeholder="如 50mm f/1.4"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </section>

        <div className="h-px bg-gray-100 mb-5" />

        {/* Section: Dates */}
        <section className="mb-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <CalendarDays size={11} />
            日期
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1 font-medium">拍摄日期</label>
              <input
                type="date"
                value={settings.dateShot}
                onChange={e => update('dateShot', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 font-medium">冲洗日期</label>
              <input
                type="date"
                value={settings.dateProcessed}
                onChange={e => update('dateProcessed', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </section>

        <div className="h-px bg-gray-100 mb-5" />

        {/* Section: Lab */}
        <section className="mb-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <FlaskConical size={11} />
            冲洗实验室
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1 font-medium">冲洗机构</label>
              <input
                type="text"
                value={settings.lab}
                onChange={e => update('lab', e.target.value)}
                placeholder="如 Film Lab Shanghai"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            {/* Push/pull */}
            <div>
              <label className="block text-xs text-gray-500 mb-1 font-medium">推拉冲洗</label>
              <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => update('pushPull', Math.max(-2, settings.pushPull - 1))}
                  className="px-2 py-2 bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <Minus size={12} />
                </button>
                <div className="flex-1 text-center text-xs font-semibold text-gray-800">
                  {settings.pushPull > 0 ? `+${settings.pushPull}` : settings.pushPull}
                </div>
                <button
                  type="button"
                  onClick={() => update('pushPull', Math.min(2, settings.pushPull + 1))}
                  className="px-2 py-2 bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1 text-center">{pushPullLabel(settings.pushPull)}</p>
            </div>
          </div>
        </section>

        {/* Advanced toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(v => !v)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors mb-4"
        >
          {showAdvanced ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {showAdvanced ? '收起附加信息' : '展开附加信息'}
        </button>

        {showAdvanced && (
          <section className="mb-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <StickyNote size={11} />
              备注
            </h3>
            <textarea
              value={settings.notes}
              onChange={e => update('notes', e.target.value)}
              placeholder="本卷拍摄背景、特殊条件、创作意图…"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
            />
          </section>
        )}

        {/* Summary bar */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-6">
          <p className="text-xs text-gray-400 mb-2 font-medium">信息摘要</p>
          <div className="flex flex-wrap gap-2">
            {settings.filmStock && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                <Film size={10} />
                {settings.filmStock}
              </span>
            )}
            {settings.camera && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                <Camera size={10} />
                {settings.camera}
              </span>
            )}
            {settings.lens && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                <Aperture size={10} />
                {settings.lens}
              </span>
            )}
            {settings.dateShot && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                <CalendarDays size={10} />
                {settings.dateShot}
              </span>
            )}
            {settings.pushPull !== 0 && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                <Star size={10} />
                {pushPullLabel(settings.pushPull)}
              </span>
            )}
            {!settings.filmStock && !settings.camera && (
              <span className="text-xs text-gray-300 italic">尚未填写任何信息</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 sticky bottom-0 bg-white pt-2 pb-4 -mx-6 px-6 border-t border-gray-100">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            返回
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            进入时间轴校对
            <ChevronRight size={14} />
          </button>
        </div>
      </form>
    </div>
  );
}
