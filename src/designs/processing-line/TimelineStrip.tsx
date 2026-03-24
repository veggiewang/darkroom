import { useRef, useEffect, useCallback } from 'react';
import type { Frame } from './types';

interface TimelineStripProps {
  frames: Frame[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

const THUMB_W = 72;  // px – total cell width including gaps
const THUMB_GAP = 4;

export default function TimelineStrip({ frames, selectedIndex, onSelect }: TimelineStripProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Keep selected thumb scrolled into view
  useEffect(() => {
    const el = thumbRefs.current[selectedIndex];
    if (el && stripRef.current) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [selectedIndex]);

  const setThumbRef = useCallback((el: HTMLButtonElement | null, i: number) => {
    thumbRefs.current[i] = el;
  }, []);

  const statusColor = (status: Frame['status']) => {
    const map: Record<Frame['status'], string> = {
      pending: 'bg-gray-300',
      reviewed: 'bg-blue-500',
      flagged: 'bg-amber-400',
      approved: 'bg-green-500',
      rejected: 'bg-red-500',
    };
    return map[status];
  };

  const ratingDots = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`inline-block w-1 h-1 rounded-full ${i < rating ? 'bg-blue-400' : 'bg-gray-200'}`}
      />
    ));

  return (
    <div className="h-full bg-gray-900 flex flex-col select-none">
      {/* Film strip top perforations */}
      <div className="flex items-center h-3 bg-gray-950 px-2">
        {Array.from({ length: Math.ceil(frames.length * (THUMB_W + THUMB_GAP) / 16) }).map((_, i) => (
          <div
            key={i}
            className="w-2.5 h-1.5 bg-gray-800 rounded-sm mr-1 shrink-0"
            style={{ marginRight: '6px' }}
          />
        ))}
      </div>

      {/* Scrollable thumbnail row */}
      <div
        ref={stripRef}
        className="flex-1 flex items-center gap-1 px-2 overflow-x-auto overflow-y-hidden"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {frames.map((frame, i) => {
          const isSelected = i === selectedIndex;
          return (
            <button
              key={frame.id}
              ref={el => setThumbRef(el, i)}
              onClick={() => onSelect(i)}
              tabIndex={-1}
              className={[
                'relative flex-shrink-0 flex flex-col items-center rounded overflow-hidden transition-all duration-100',
                'focus:outline-none',
                isSelected
                  ? 'ring-2 ring-blue-400 scale-[1.08] z-10'
                  : frame.status === 'rejected'
                  ? 'opacity-40 hover:opacity-70'
                  : 'hover:scale-[1.04]',
              ].join(' ')}
              style={{ width: THUMB_W }}
            >
              {/* Thumbnail */}
              <div className="relative w-full" style={{ paddingBottom: '66.7%' }}>
                <img
                  src={frame.thumbnail}
                  alt={`Frame ${frame.index + 1}`}
                  draggable={false}
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Rejected overlay */}
                {frame.status === 'rejected' && (
                  <div className="absolute inset-0 bg-red-900/30 flex items-center justify-center">
                    <span className="text-red-400 text-xs font-bold tracking-widest">✕</span>
                  </div>
                )}

                {/* Flagged overlay */}
                {frame.status === 'flagged' && (
                  <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-amber-400" />
                )}

                {/* Approved checkmark */}
                {frame.status === 'approved' && (
                  <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-green-400" />
                )}

                {/* Notes indicator */}
                {frame.metadata.notes && (
                  <div className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 rounded-full bg-white/60" />
                )}
              </div>

              {/* Frame info bar */}
              <div className={[
                'w-full px-0.5 pb-0.5 flex items-center justify-between',
                isSelected ? 'bg-blue-500' : 'bg-gray-800',
              ].join(' ')}>
                <span className={[
                  'text-[9px] font-mono leading-none pt-0.5',
                  isSelected ? 'text-white font-bold' : 'text-gray-400',
                ].join(' ')}>
                  {String(frame.index + 1).padStart(2, '0')}
                </span>
                {/* Rating dots */}
                {frame.rating > 0 && (
                  <div className="flex gap-px pt-0.5">
                    {ratingDots(frame.rating)}
                  </div>
                )}
                {/* Status dot */}
                <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${statusColor(frame.status)}`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Film strip bottom perforations */}
      <div className="flex items-center h-3 bg-gray-950 px-2">
        {Array.from({ length: Math.ceil(frames.length * (THUMB_W + THUMB_GAP) / 16) }).map((_, i) => (
          <div
            key={i}
            className="w-2.5 h-1.5 bg-gray-800 rounded-sm shrink-0"
            style={{ marginRight: '6px' }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-3 py-1.5 bg-gray-900 border-t border-gray-800">
        {[
          { color: 'bg-gray-400', label: '待处理' },
          { color: 'bg-blue-500', label: '已审阅' },
          { color: 'bg-amber-400', label: '已标记' },
          { color: 'bg-green-500', label: '已确认' },
          { color: 'bg-red-500', label: '已排除' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${item.color}`} />
            <span className="text-[10px] text-gray-500">{item.label}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-3 text-[10px] text-gray-600">
          <span>← → 切换</span>
          <span>1-5 标记</span>
          <span>Enter 确认</span>
        </div>
      </div>
    </div>
  );
}
