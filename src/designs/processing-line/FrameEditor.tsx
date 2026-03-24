import { useState, useCallback, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Check,
  X,
  Star,
  StickyNote,
  Sliders,
  RotateCcw,
  Sun,
  Contrast,
  CloudSun,
  Moon,
  Info,
} from 'lucide-react';
import type { Frame } from './types';
import { STATUS_LABELS } from './types';

interface FrameEditorProps {
  frame: Frame;
  totalFrames: number;
  onUpdate: (id: string, updates: Partial<Frame>) => void;
  onPrev: () => void;
  onNext: () => void;
}

const STATUS_CYCLE: Frame['status'][] = ['pending', 'reviewed', 'flagged', 'approved', 'rejected'];

export default function FrameEditor({ frame, totalFrames, onUpdate, onPrev, onNext }: FrameEditorProps) {
  const [showAdjustments, setShowAdjustments] = useState(false);
  const [noteText, setNoteText] = useState(frame.metadata.notes || '');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [hoverPreview, setHoverPreview] = useState(false);

  // Sync note with frame changes
  useEffect(() => {
    setNoteText(frame.metadata.notes || '');
    setIsEditingNote(false);
  }, [frame.id]);

  const setStatus = useCallback((status: Frame['status']) => {
    onUpdate(frame.id, { status });
  }, [frame.id, onUpdate]);

  const setRating = useCallback((rating: number) => {
    onUpdate(frame.id, { rating: frame.rating === rating ? 0 : rating });
  }, [frame.id, frame.rating, onUpdate]);

  const updateAdjustment = useCallback((key: keyof NonNullable<Frame['adjustments']>, value: number) => {
    onUpdate(frame.id, {
      adjustments: {
        ...frame.adjustments,
        exposure: frame.adjustments?.exposure ?? 0,
        contrast: frame.adjustments?.contrast ?? 0,
        highlights: frame.adjustments?.highlights ?? 0,
        shadows: frame.adjustments?.shadows ?? 0,
        [key]: value,
      },
    });
  }, [frame.id, frame.adjustments, onUpdate]);

  const resetAdjustments = useCallback(() => {
    onUpdate(frame.id, {
      adjustments: { exposure: 0, contrast: 0, highlights: 0, shadows: 0 },
    });
  }, [frame.id, onUpdate]);

  const saveNote = useCallback(() => {
    onUpdate(frame.id, { metadata: { ...frame.metadata, notes: noteText } });
    setIsEditingNote(false);
  }, [frame.id, frame.metadata, noteText, onUpdate]);

  const hasAdjustments = frame.adjustments && (
    frame.adjustments.exposure !== 0 ||
    frame.adjustments.contrast !== 0 ||
    frame.adjustments.highlights !== 0 ||
    frame.adjustments.shadows !== 0
  );

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">

      {/* ── Top toolbar ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 bg-white shrink-0">
        {/* Frame counter */}
        <div className="flex items-center gap-1 text-xs text-gray-500 font-mono">
          <span className="font-bold text-gray-900 text-sm">{String(frame.index + 1).padStart(2, '0')}</span>
          <span className="text-gray-300">/</span>
          <span>{totalFrames}</span>
        </div>

        {/* Filename */}
        <span className="text-xs text-gray-400 font-mono truncate max-w-[200px]">{frame.filename}</span>

        <div className="flex-1" />

        {/* Status selector */}
        <div className="flex items-center gap-1">
          {STATUS_CYCLE.filter(s => s !== 'pending').map(s => (
            <button
              key={s}
              onClick={() => setStatus(s === frame.status ? 'pending' : s)}
              title={STATUS_LABELS[s]}
              className={[
                'px-2.5 py-1 rounded text-xs font-medium border transition-all',
                frame.status === s
                  ? s === 'approved' ? 'bg-green-500 text-white border-green-500'
                  : s === 'rejected' ? 'bg-red-500 text-white border-red-500'
                  : s === 'flagged' ? 'bg-amber-400 text-white border-amber-400'
                  : 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700',
              ].join(' ')}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {/* Rating stars */}
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <button
              key={i}
              onClick={() => setRating(i + 1)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                size={14}
                className={i < frame.rating ? 'fill-blue-500 text-blue-500' : 'text-gray-200'}
              />
            </button>
          ))}
        </div>

        {/* Adjustments toggle */}
        <button
          onClick={() => setShowAdjustments(v => !v)}
          className={[
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
            showAdjustments
              ? 'bg-blue-50 text-blue-600 border-blue-200'
              : hasAdjustments
              ? 'bg-orange-50 text-orange-600 border-orange-200'
              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50',
          ].join(' ')}
        >
          <Sliders size={12} />
          调整
          {hasAdjustments && !showAdjustments && (
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
          )}
        </button>

        {/* Navigation */}
        <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={onPrev}
            disabled={frame.index === 0}
            className="px-2 py-1.5 hover:bg-gray-50 disabled:opacity-30 text-gray-600 transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={onNext}
            disabled={frame.index === totalFrames - 1}
            className="px-2 py-1.5 hover:bg-gray-50 disabled:opacity-30 text-gray-600 transition-colors border-l border-gray-200"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Image area */}
        <div
          className="flex-1 relative flex items-center justify-center bg-gray-50 overflow-hidden cursor-zoom-in"
          onMouseEnter={() => setHoverPreview(true)}
          onMouseLeave={() => setHoverPreview(false)}
        >
          {/* Main image */}
          <img
            src={frame.thumbnail}
            alt={frame.filename}
            className={[
              'max-w-full max-h-full object-contain transition-transform duration-200',
              hoverPreview ? 'scale-[1.02]' : 'scale-100',
            ].join(' ')}
            style={{ maxHeight: 'calc(100vh - 280px)' }}
            draggable={false}
          />

          {/* Status overlay badge */}
          {frame.status !== 'pending' && (
            <div className={[
              'absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white shadow-sm',
              frame.status === 'approved' ? 'bg-green-500'
              : frame.status === 'rejected' ? 'bg-red-500'
              : frame.status === 'flagged' ? 'bg-amber-400'
              : 'bg-blue-500',
            ].join(' ')}>
              {frame.status === 'approved' && <Check size={11} />}
              {frame.status === 'rejected' && <X size={11} />}
              {frame.status === 'flagged' && <Flag size={11} />}
              {STATUS_LABELS[frame.status]}
            </div>
          )}

          {/* Hover: zoom instruction */}
          <div className={[
            'absolute bottom-3 right-3 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded-lg backdrop-blur-sm transition-opacity duration-150',
            hoverPreview ? 'opacity-100' : 'opacity-0',
          ].join(' ')}>
            悬停缩放预览
          </div>

          {/* Rating overlay */}
          {frame.rating > 0 && (
            <div className="absolute bottom-3 left-3 flex gap-0.5">
              {Array.from({ length: frame.rating }, (_, i) => (
                <Star key={i} size={12} className="fill-blue-500 text-blue-500 drop-shadow" />
              ))}
            </div>
          )}
        </div>

        {/* ── Right panel ─────────────────────────────────────── */}
        <div className="w-56 border-l border-gray-100 flex flex-col overflow-y-auto">

          {/* Metadata */}
          <div className="p-4 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Info size={10} />
              元数据
            </p>
            <dl className="space-y-2">
              {[
                { label: '光圈', value: frame.metadata.aperture },
                { label: '快门', value: frame.metadata.shutter },
                { label: '拍摄日期', value: frame.metadata.date },
              ].map(({ label, value }) => value ? (
                <div key={label}>
                  <dt className="text-[10px] text-gray-400 leading-none mb-0.5">{label}</dt>
                  <dd className="text-xs font-mono text-gray-800">{value}</dd>
                </div>
              ) : null)}
            </dl>
          </div>

          {/* Notes */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <StickyNote size={10} />
                备注
              </p>
              {!isEditingNote && (
                <button
                  onClick={() => setIsEditingNote(true)}
                  className="text-[10px] text-blue-500 hover:text-blue-700"
                >
                  编辑
                </button>
              )}
            </div>
            {isEditingNote ? (
              <div>
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  autoFocus
                  rows={3}
                  className="w-full px-2 py-1.5 text-xs border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="添加帧备注…"
                />
                <div className="flex gap-1.5 mt-1.5">
                  <button
                    onClick={saveNote}
                    className="flex-1 py-1 rounded text-xs bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => { setNoteText(frame.metadata.notes || ''); setIsEditingNote(false); }}
                    className="px-2 py-1 rounded text-xs border border-gray-200 text-gray-500 hover:bg-gray-50"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-600 leading-relaxed min-h-[2.5rem]">
                {frame.metadata.notes || <span className="text-gray-300 italic">无备注</span>}
              </p>
            )}
          </div>

          {/* Adjustments panel */}
          {showAdjustments && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sliders size={10} />
                  调整
                </p>
                <button
                  onClick={resetAdjustments}
                  className="text-[10px] text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw size={10} />
                  重置
                </button>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'exposure' as const, label: '曝光', icon: <Sun size={11} />, min: -3, max: 3, step: 0.1, unit: ' EV' },
                  { key: 'contrast' as const, label: '对比度', icon: <Contrast size={11} />, min: -1, max: 1, step: 0.05, unit: '' },
                  { key: 'highlights' as const, label: '高光', icon: <CloudSun size={11} />, min: -100, max: 100, step: 5, unit: '' },
                  { key: 'shadows' as const, label: '阴影', icon: <Moon size={11} />, min: -100, max: 100, step: 5, unit: '' },
                ].map(({ key, label, icon, min, max, step, unit }) => {
                  const value = frame.adjustments?.[key] ?? 0;
                  const pct = ((value - min) / (max - min)) * 100;
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] text-gray-500 flex items-center gap-1">
                          {icon} {label}
                        </span>
                        <span className={[
                          'text-[10px] font-mono font-semibold',
                          value !== 0 ? 'text-orange-500' : 'text-gray-400',
                        ].join(' ')}>
                          {value > 0 ? '+' : ''}{value.toFixed(key === 'exposure' ? 1 : 0)}{unit}
                        </span>
                      </div>
                      <div className="relative h-1 bg-gray-200 rounded-full">
                        {/* Track fill */}
                        <div
                          className="absolute h-full bg-blue-500 rounded-full"
                          style={{
                            left: `${Math.min(50, pct)}%`,
                            width: `${Math.abs(pct - 50)}%`,
                          }}
                        />
                        {/* Center marker */}
                        <div className="absolute top-1/2 left-1/2 w-px h-2.5 -translate-y-1/2 bg-gray-300" />
                        <input
                          type="range"
                          min={min} max={max} step={step}
                          value={value}
                          onChange={e => updateAdjustment(key, parseFloat(e.target.value))}
                          className="absolute inset-0 w-full opacity-0 cursor-pointer h-4 -top-1.5"
                        />
                        {/* Thumb indicator */}
                        <div
                          className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white shadow -translate-x-1/2 transition-all pointer-events-none"
                          style={{ left: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
