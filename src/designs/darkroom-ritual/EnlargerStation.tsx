import { useState, useRef } from 'react';
import { ChevronLeft, ZoomIn, ZoomOut, RotateCcw, Sun, Moon, Contrast, Droplets, Check, X, Edit3 } from 'lucide-react';
import type { FilmRoll } from './FilmSelector';
import type { DevelopConfig } from './ChemicalBath';

// ─── 类型 ─────────────────────────────────────────────────────────────────────

interface FrameData {
  id: number;
  color: string; // 占位颜色
  label: string;
  selected: boolean;
  adjustments: {
    exposure: number; // -3 to +3
    contrast: number; // -100 to +100
    highlights: number; // -100 to +100
    shadows: number; // -100 to +100
    temperature: number; // -50 to +50
    tint: number; // -50 to +50
    grain: number; // 0 to 100
  };
  tags: string[];
  note: string;
}

interface EnlargerStationProps {
  roll: FilmRoll;
  config: DevelopConfig;
  onBack: () => void;
}

// ─── 生成模拟帧数据 ───────────────────────────────────────────────────────────

const FRAME_COLORS = [
  '#2d1810', '#3d2820', '#1a2d20', '#20182d',
  '#2d2818', '#181820', '#2d1818', '#182820',
  '#28201a', '#1a2028', '#281a20', '#201a28',
  '#2d2010', '#102d20', '#10202d', '#2d1020',
];

const FRAME_LABELS = [
  '清晨巷弄', '午后光影', '黄昏余晖', '夜幕降临',
  '阴雨天光', '背光人像', '细节特写', '大景远眺',
  '动态街拍', '静物台面', '建筑线条', '自然植被',
  '人群剪影', '光斑虚焦', '倒影水面', '窗框构图',
];

function generateFrames(count: number): FrameData[] {
  return Array.from({ length: Math.min(count, 36) }, (_, i) => ({
    id: i + 1,
    color: FRAME_COLORS[i % FRAME_COLORS.length],
    label: FRAME_LABELS[i % FRAME_LABELS.length],
    selected: false,
    adjustments: {
      exposure: 0,
      contrast: 0,
      highlights: 0,
      shadows: 0,
      temperature: 0,
      tint: 0,
      grain: 20,
    },
    tags: [],
    note: '',
  }));
}

// ─── 调整滑块 ─────────────────────────────────────────────────────────────────

function AdjustSlider({
  label,
  value,
  min,
  max,
  accentColor,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  accentColor?: string;
  onChange: (v: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const accent = accentColor || '#ff9900';
  const normalized = (value - min) / (max - min);

  const handleClick = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onChange(Math.round(min + pct * (max - min)));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: '10px',
            fontFamily: 'monospace',
            color: '#664400',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: '11px',
            fontFamily: 'monospace',
            color: value !== 0 ? accent : '#4d3300',
            fontWeight: value !== 0 ? 600 : 400,
            minWidth: '32px',
            textAlign: 'right',
          }}
        >
          {value > 0 ? `+${value}` : value}
        </span>
      </div>

      {/* 滑轨 */}
      <div
        ref={trackRef}
        onClick={handleClick}
        style={{
          position: 'relative',
          height: '4px',
          backgroundColor: '#1a1200',
          borderRadius: '2px',
          cursor: 'pointer',
        }}
      >
        {/* 中线（如果范围包含负值） */}
        {min < 0 && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '1px',
              height: '8px',
              backgroundColor: '#2a1e00',
            }}
          />
        )}

        {/* 已填充部分 */}
        <div
          style={{
            position: 'absolute',
            left: min < 0 ? `${50}%` : 0,
            width: min < 0 ? `${(normalized - 0.5) * 100}%` : `${normalized * 100}%`,
            top: 0,
            bottom: 0,
            backgroundColor: accent,
            borderRadius: '2px',
            opacity: 0.6,
            transition: 'width 0.15s ease, left 0.15s ease',
          }}
        />

        {/* 拖柄 */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: `${normalized * 100}%`,
            transform: 'translate(-50%, -50%)',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#0a0700',
            border: `2px solid ${accent}`,
            boxShadow: `0 0 6px ${accent}44`,
            transition: 'left 0.15s ease',
          }}
        />
      </div>
    </div>
  );
}

// ─── 对焦环覆盖层 ─────────────────────────────────────────────────────────────

function FocusRingOverlay({
  frame,
  onClose,
  onUpdate,
}: {
  frame: FrameData;
  onClose: () => void;
  onUpdate: (adj: FrameData['adjustments'], note: string) => void;
}) {
  const [adj, setAdj] = useState({ ...frame.adjustments });
  const [note, setNote] = useState(frame.note);
  const [editNote, setEditNote] = useState(false);

  const update = (key: keyof typeof adj, val: number) => {
    setAdj(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.85) 100%)',
        backdropFilter: 'blur(2px)',
      }}
    >
      {/* 对焦环装饰圆 */}
      <div
        style={{
          position: 'absolute',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          border: '1px solid rgba(255,153,0,0.15)',
          boxShadow: '0 0 40px rgba(255,153,0,0.05), inset 0 0 40px rgba(255,153,0,0.05)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          border: '1px dashed rgba(255,153,0,0.08)',
          pointerEvents: 'none',
        }}
      />

      {/* 调整面板 */}
      <div
        style={{
          position: 'relative',
          backgroundColor: '#080500',
          border: '1px solid #2a1e00',
          borderRadius: '8px',
          padding: '20px',
          width: '240px',
          boxShadow: '0 0 40px rgba(0,0,0,0.8)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 面板顶部 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: '1px solid #1a1200',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: '#ff9900', fontWeight: 600 }}>
              Frame #{frame.id}
            </div>
            <div style={{ fontSize: '10px', color: '#4d3300', fontFamily: 'monospace' }}>
              {frame.label}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#4d3300',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* 调整项 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <AdjustSlider
            label="曝光 EV"
            value={adj.exposure}
            min={-3}
            max={3}
            accentColor="#ffaa22"
            onChange={v => update('exposure', v)}
          />
          <AdjustSlider
            label="对比度"
            value={adj.contrast}
            min={-100}
            max={100}
            accentColor="#ff9900"
            onChange={v => update('contrast', v)}
          />
          <AdjustSlider
            label="高光"
            value={adj.highlights}
            min={-100}
            max={100}
            accentColor="#ffcc44"
            onChange={v => update('highlights', v)}
          />
          <AdjustSlider
            label="阴影"
            value={adj.shadows}
            min={-100}
            max={100}
            accentColor="#884400"
            onChange={v => update('shadows', v)}
          />
          <AdjustSlider
            label="色温"
            value={adj.temperature}
            min={-50}
            max={50}
            accentColor="#4499cc"
            onChange={v => update('temperature', v)}
          />
          <AdjustSlider
            label="颗粒感"
            value={adj.grain}
            min={0}
            max={100}
            accentColor="#886644"
            onChange={v => update('grain', v)}
          />
        </div>

        {/* 备注 */}
        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #1a1200' }}>
          {editNote ? (
            <textarea
              autoFocus
              value={note}
              onChange={e => setNote(e.target.value)}
              onBlur={() => setEditNote(false)}
              rows={2}
              style={{
                width: '100%',
                backgroundColor: '#0a0700',
                border: '1px solid #2a1e00',
                borderRadius: '4px',
                color: '#cc8800',
                padding: '6px 8px',
                fontSize: '11px',
                fontFamily: 'monospace',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box',
              }}
            />
          ) : (
            <div
              onClick={() => setEditNote(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                color: note ? '#664400' : '#2a1e00',
                fontSize: '11px',
                fontFamily: 'monospace',
                padding: '4px 0',
              }}
            >
              <Edit3 size={10} />
              <span>{note || '添加帧备注...'}</span>
            </div>
          )}
        </div>

        {/* 确认按钮 */}
        <button
          onClick={() => onUpdate(adj, note)}
          style={{
            marginTop: '16px',
            width: '100%',
            padding: '8px',
            backgroundColor: '#0f0800',
            border: '1px solid #ff990040',
            borderRadius: '4px',
            color: '#ff9900',
            fontSize: '11px',
            fontFamily: 'monospace',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Check size={12} />
          应用调整
        </button>
      </div>
    </div>
  );
}

// ─── 单帧缩略图 ───────────────────────────────────────────────────────────────

function FrameThumb({
  frame,
  isActive,
  onClick,
}: {
  frame: FrameData;
  isActive: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const hasAdjustments = Object.values(frame.adjustments).some((v, i) =>
    i === 6 ? v !== 20 : v !== 0
  );

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '52px',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'all 0.4s ease',
        transform: hovered || isActive ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      {/* 帧号 */}
      <div
        style={{
          textAlign: 'center',
          fontSize: '8px',
          fontFamily: 'monospace',
          color: isActive ? '#ff9900' : '#2a1e00',
          marginBottom: '3px',
          transition: 'color 0.3s ease',
        }}
      >
        {frame.id}
      </div>

      {/* 缩略图 */}
      <div
        style={{
          height: '36px',
          backgroundColor: frame.color,
          borderRadius: '2px',
          border: isActive
            ? '1px solid #ff9900'
            : hovered
            ? '1px solid #664400'
            : '1px solid #1a1200',
          position: 'relative',
          overflow: 'hidden',
          transition: 'border-color 0.3s ease',
          boxShadow: isActive ? '0 0 8px rgba(255,153,0,0.3)' : 'none',
        }}
      >
        {/* 调整指示点 */}
        {hasAdjustments && (
          <div
            style={{
              position: 'absolute',
              top: '3px',
              right: '3px',
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              backgroundColor: '#ff9900',
            }}
          />
        )}
      </div>
    </div>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────

export default function EnlargerStation({ roll, config, onBack }: EnlargerStationProps) {
  const [frames] = useState(() => generateFrames(roll.frameCount));
  const [currentFrames, setCurrentFrames] = useState<FrameData[]>(() =>
    generateFrames(roll.frameCount)
  );
  const [activeFrameId, setActiveFrameId] = useState<number | null>(null);
  const [showFocusRing, setShowFocusRing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [lightboxBrightness, setLightboxBrightness] = useState(70);
  const [exportDone, setExportDone] = useState(false);
  void frames; // suppress unused

  const activeFrame = currentFrames.find(f => f.id === activeFrameId) ?? null;

  const handleFrameClick = (id: number) => {
    setActiveFrameId(id);
    setShowFocusRing(false);
  };

  const handleEnlargerHover = () => {
    if (activeFrameId !== null) {
      setShowFocusRing(true);
    }
  };

  const handleUpdateFrame = (adj: FrameData['adjustments'], note: string) => {
    setCurrentFrames(prev =>
      prev.map(f =>
        f.id === activeFrameId ? { ...f, adjustments: adj, note } : f
      )
    );
    setShowFocusRing(false);
  };

  const handleExport = () => {
    setExportDone(true);
    setTimeout(() => setExportDone(false), 3000);
  };

  const adjustedCount = currentFrames.filter(f =>
    Object.entries(f.adjustments).some(([k, v]) => k === 'grain' ? v !== 20 : v !== 0)
  ).length;

  return (
    <div
      style={{
        height: '100vh',
        backgroundColor: '#050505',
        color: '#cc8800',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 颗粒层 */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          pointerEvents: 'none',
          zIndex: 200,
        }}
      />

      {/* ─── 顶部工具栏 ─── */}
      <div
        style={{
          height: '52px',
          backgroundColor: '#060400',
          borderBottom: '1px solid #1a1200',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: '16px',
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: '#4d3300',
            cursor: 'pointer',
            fontSize: '12px',
            fontFamily: 'monospace',
            padding: '0',
            transition: 'color 0.3s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ff9900')}
          onMouseLeave={e => (e.currentTarget.style.color = '#4d3300')}
        >
          <ChevronLeft size={14} />
          显影配方
        </button>

        <div style={{ width: '1px', height: '20px', backgroundColor: '#1a1200' }} />

        <div
          style={{
            fontSize: '11px',
            fontFamily: 'monospace',
            color: '#3d2e00',
            letterSpacing: '0.1em',
          }}
        >
          Step 03 · 放大台 ·{' '}
          <span style={{ color: '#664400' }}>
            {roll.name} / {roll.filmStock}
          </span>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* 灯箱亮度 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Moon size={12} style={{ color: '#3d2e00' }} />
            <input
              type="range"
              min={20}
              max={100}
              value={lightboxBrightness}
              onChange={e => setLightboxBrightness(Number(e.target.value))}
              style={{
                width: '80px',
                accentColor: '#ff9900',
                cursor: 'pointer',
              }}
            />
            <Sun size={12} style={{ color: '#664400' }} />
          </div>

          <div style={{ width: '1px', height: '20px', backgroundColor: '#1a1200' }} />

          {/* 缩放 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
              style={{
                background: 'none',
                border: 'none',
                color: '#4d3300',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <ZoomOut size={14} />
            </button>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#664400',
                minWidth: '36px',
                textAlign: 'center',
              }}
            >
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(z => Math.min(3, z + 0.25))}
              style={{
                background: 'none',
                border: 'none',
                color: '#4d3300',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <ZoomIn size={14} />
            </button>
          </div>

          <div style={{ width: '1px', height: '20px', backgroundColor: '#1a1200' }} />

          {/* 导出 */}
          <button
            onClick={handleExport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 16px',
              backgroundColor: exportDone ? '#0d1f0d' : '#0f0800',
              border: `1px solid ${exportDone ? '#2d5a27' : '#ff990040'}`,
              borderRadius: '4px',
              color: exportDone ? '#4a9940' : '#ff9900',
              fontSize: '11px',
              fontFamily: 'monospace',
              cursor: 'pointer',
              transition: 'all 0.4s ease',
            }}
          >
            {exportDone ? <Check size={12} /> : <Contrast size={12} />}
            {exportDone ? '已导出！' : '导出冲洗结果'}
          </button>
        </div>
      </div>

      {/* ─── 主体区域 ─── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* 胶片条 - 左侧 */}
        <div
          style={{
            width: '80px',
            backgroundColor: '#040300',
            borderRight: '1px solid #1a1200',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflowY: 'auto',
            padding: '12px 0',
            gap: '8px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#1a1200 transparent',
            flexShrink: 0,
          }}
        >
          {currentFrames.map(frame => (
            <FrameThumb
              key={frame.id}
              frame={frame}
              isActive={frame.id === activeFrameId}
              onClick={() => handleFrameClick(frame.id)}
            />
          ))}
        </div>

        {/* 放大台主区域 */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {activeFrame ? (
            <>
              {/* 灯箱边框 */}
              <div
                style={{
                  position: 'relative',
                  width: `${Math.min(480, 480 * zoom)}px`,
                  maxWidth: '90%',
                  transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                }}
                onMouseEnter={handleEnlargerHover}
                onMouseLeave={() => setShowFocusRing(false)}
              >
                {/* 灯箱外框 */}
                <div
                  style={{
                    position: 'relative',
                    backgroundColor: '#0a0800',
                    border: '3px solid #2a1e00',
                    borderRadius: '4px',
                    padding: '12px',
                    boxShadow: `0 0 60px rgba(255,153,0,${(lightboxBrightness / 100) * 0.15}), inset 0 0 30px rgba(255,153,0,${(lightboxBrightness / 100) * 0.08})`,
                  }}
                >
                  {/* 灯箱光源（底部发光效果） */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: '12px',
                      background: `rgba(255,240,200,${(lightboxBrightness / 100) * 0.06})`,
                      borderRadius: '2px',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* 照片本体 */}
                  <div
                    style={{
                      position: 'relative',
                      aspectRatio: '3/2',
                      backgroundColor: activeFrame.color,
                      borderRadius: '2px',
                      overflow: 'hidden',
                      filter: `brightness(${1 + activeFrame.adjustments.exposure * 0.2}) contrast(${1 + activeFrame.adjustments.contrast * 0.005})`,
                      transition: 'filter 0.3s ease',
                    }}
                  >
                    {/* 颗粒叠层 */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='${activeFrame.adjustments.grain / 500}'/%3E%3C/svg%3E")`,
                        mixBlendMode: 'overlay',
                        pointerEvents: 'none',
                      }}
                    />

                    {/* 暗角 */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
                        pointerEvents: 'none',
                      }}
                    />

                    {/* 色温叠层 */}
                    {activeFrame.adjustments.temperature !== 0 && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundColor: activeFrame.adjustments.temperature > 0
                            ? `rgba(255,200,100,${Math.abs(activeFrame.adjustments.temperature) * 0.006})`
                            : `rgba(100,150,255,${Math.abs(activeFrame.adjustments.temperature) * 0.006})`,
                          mixBlendMode: 'multiply',
                          pointerEvents: 'none',
                        }}
                      />
                    )}

                    {/* 悬停时对焦环覆盖层 */}
                    {showFocusRing && (
                      <FocusRingOverlay
                        frame={activeFrame}
                        onClose={() => setShowFocusRing(false)}
                        onUpdate={handleUpdateFrame}
                      />
                    )}
                  </div>

                  {/* 胶片信息条 */}
                  <div
                    style={{
                      marginTop: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '9px',
                        fontFamily: 'monospace',
                        color: '#ff9900',
                        opacity: 0.5,
                      }}
                    >
                      {roll.filmStock} · ISO {roll.iso}
                    </span>
                    <span
                      style={{
                        fontSize: '9px',
                        fontFamily: 'monospace',
                        color: '#ff9900',
                        opacity: 0.5,
                      }}
                    >
                      FRAME {String(activeFrame.id).padStart(2, '0')} / {String(roll.frameCount).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {/* 帧标题 */}
                <div
                  style={{
                    textAlign: 'center',
                    marginTop: '16px',
                    fontSize: '14px',
                    color: '#cc8800',
                    fontWeight: 600,
                  }}
                >
                  {activeFrame.label}
                </div>
                {activeFrame.note && (
                  <div
                    style={{
                      textAlign: 'center',
                      marginTop: '4px',
                      fontSize: '11px',
                      color: '#4d3300',
                      fontFamily: 'monospace',
                    }}
                  >
                    {activeFrame.note}
                  </div>
                )}

                {/* 悬停提示 */}
                {!showFocusRing && (
                  <div
                    style={{
                      textAlign: 'center',
                      marginTop: '8px',
                      fontSize: '10px',
                      color: '#2a1e00',
                      fontFamily: 'monospace',
                      transition: 'opacity 0.3s ease',
                    }}
                  >
                    悬停照片以调整参数
                  </div>
                )}
              </div>

              {/* 当前调整信息 */}
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  marginTop: '20px',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                {[
                  { icon: <Sun size={10} />, label: 'EV', value: activeFrame.adjustments.exposure },
                  { icon: <Contrast size={10} />, label: 'Con', value: activeFrame.adjustments.contrast },
                  { icon: <Droplets size={10} />, label: 'Temp', value: activeFrame.adjustments.temperature },
                ].map(({ icon, label, value }) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '10px',
                      fontFamily: 'monospace',
                      color: value !== 0 ? '#ff9900' : '#2a1e00',
                    }}
                  >
                    {icon}
                    <span>{label}:</span>
                    <span>{value > 0 ? `+${value}` : value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* 未选中帧时的空状态 */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                color: '#1a1200',
              }}
            >
              <div
                style={{
                  width: '120px',
                  height: '80px',
                  border: '1px dashed #1a1200',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RotateCcw size={24} style={{ opacity: 0.3 }} />
              </div>
              <span style={{ fontSize: '12px', fontFamily: 'monospace', opacity: 0.4 }}>
                从左侧胶片条选择一帧
              </span>
            </div>
          )}
        </div>

        {/* 右侧信息栏 */}
        <div
          style={{
            width: '200px',
            backgroundColor: '#040300',
            borderLeft: '1px solid #1a1200',
            padding: '20px 16px',
            overflow: 'auto',
            flexShrink: 0,
            scrollbarWidth: 'thin',
            scrollbarColor: '#1a1200 transparent',
          }}
        >
          {/* 卷级信息 */}
          <div style={{ marginBottom: '24px' }}>
            <div
              style={{
                fontSize: '9px',
                fontFamily: 'monospace',
                color: '#2a1e00',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                marginBottom: '10px',
              }}
            >
              Roll Info
            </div>
            {[
              ['底片', roll.name],
              ['胶卷', roll.filmStock],
              ['ISO', String(roll.iso)],
              ['帧数', String(roll.frameCount)],
              ['机身', config.camera.split(' ').slice(0, 2).join(' ')],
              ['镜头', config.lens.split(' ').slice(0, 2).join(' ')],
              ['显影液', config.developer.split(' ')[0]],
              [`温度`, `${config.temperature}°C`],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '10px',
                  fontFamily: 'monospace',
                  marginBottom: '6px',
                }}
              >
                <span style={{ color: '#3d2e00' }}>{k}</span>
                <span
                  style={{
                    color: '#664400',
                    maxWidth: '110px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    textAlign: 'right',
                  }}
                >
                  {v}
                </span>
              </div>
            ))}
          </div>

          {/* 进度 */}
          <div
            style={{
              paddingTop: '16px',
              borderTop: '1px solid #0d0900',
            }}
          >
            <div
              style={{
                fontSize: '9px',
                fontFamily: 'monospace',
                color: '#2a1e00',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                marginBottom: '10px',
              }}
            >
              Progress
            </div>

            {/* 进度条 */}
            <div
              style={{
                height: '4px',
                backgroundColor: '#1a1200',
                borderRadius: '2px',
                overflow: 'hidden',
                marginBottom: '6px',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${(adjustedCount / roll.frameCount) * 100}%`,
                  backgroundColor: '#ff9900',
                  borderRadius: '2px',
                  transition: 'width 0.5s ease',
                  opacity: 0.6,
                }}
              />
            </div>
            <div
              style={{
                fontSize: '10px',
                fontFamily: 'monospace',
                color: '#4d3300',
              }}
            >
              {adjustedCount} / {roll.frameCount} 帧已调整
            </div>
          </div>

          {/* 快捷键提示 */}
          <div
            style={{
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid #0d0900',
            }}
          >
            <div
              style={{
                fontSize: '9px',
                fontFamily: 'monospace',
                color: '#1a1200',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                marginBottom: '8px',
              }}
            >
              Tips
            </div>
            {[
              ['悬停', '打开对焦调整'],
              ['滚轮', '缩放照片'],
              ['拖动', '拨盘/旋钮'],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  fontSize: '9px',
                  fontFamily: 'monospace',
                  color: '#1a1200',
                  marginBottom: '4px',
                  display: 'flex',
                  gap: '6px',
                }}
              >
                <span style={{ color: '#2a1e00' }}>{k}:</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
