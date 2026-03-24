import { useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Check, FlaskConical } from 'lucide-react';
import type { FilmRoll } from './FilmSelector';

// ─── 类型 ─────────────────────────────────────────────────────────────────────

export interface DevelopConfig {
  camera: string;
  lens: string;
  shootDate: string;
  developer: string;
  temperature: number;
  pushPull: number; // -2 to +2 stops
  notes: string;
}

interface ChemicalBathProps {
  roll: FilmRoll;
  onBack: () => void;
  onConfirm: (config: DevelopConfig) => void;
}

// ─── 选项数据 ─────────────────────────────────────────────────────────────────

const CAMERAS = [
  'Leica M6', 'Leica M3', 'Nikon F3', 'Nikon FM2',
  'Canon F-1', 'Olympus OM-1', 'Pentax K1000',
  'Hasselblad 500C/M', 'Mamiya RB67',
];

const LENSES = [
  'Summicron 35mm f/2', 'Summilux 50mm f/1.4', 'Elmarit 28mm f/2.8',
  'Nikkor 50mm f/1.4', 'Nikkor 35mm f/2', 'Nikkor 105mm f/2.5',
  'FD 50mm f/1.4', 'FD 28mm f/2.8',
  'Planar 80mm f/2.8', 'Sekor 90mm f/3.8',
];

const DEVELOPERS = [
  'Kodak D-76 (1:1)', 'Kodak HC-110 (B)', 'Ilford ID-11',
  'Ilford Microphen', 'Rodinal (1:50)', 'Pyrocat-HD',
  'XTOL (Stock)', 'Kodak T-MAX Dev',
];

// ─── 拨盘组件 ─────────────────────────────────────────────────────────────────

function ScrollDrum<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: T[];
  value: T;
  onChange: (v: T) => void;
}) {
  const currentIndex = options.indexOf(value);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startIndex = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    startY.current = e.clientY;
    startIndex.current = options.indexOf(value);
  }, [options, value]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const delta = Math.round((startY.current - e.clientY) / 28);
    const newIndex = Math.max(0, Math.min(options.length - 1, startIndex.current + delta));
    onChange(options[newIndex] as T);
  }, [options, onChange]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const prev = () => {
    if (currentIndex > 0) onChange(options[currentIndex - 1] as T);
  };
  const next = () => {
    if (currentIndex < options.length - 1) onChange(options[currentIndex + 1] as T);
  };

  const getDisplayItems = () => {
    const items = [];
    for (let offset = -2; offset <= 2; offset++) {
      const idx = currentIndex + offset;
      items.push({
        value: idx >= 0 && idx < options.length ? options[idx] : null,
        offset,
      });
    }
    return items;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <span
        style={{
          fontSize: '10px',
          fontFamily: 'monospace',
          color: '#664400',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
        }}
      >
        {label}
      </span>

      {/* 滚筒容器 */}
      <div
        style={{
          position: 'relative',
          backgroundColor: '#0a0700',
          border: '1px solid #2a1e00',
          borderRadius: '6px',
          overflow: 'hidden',
          cursor: 'ns-resize',
          userSelect: 'none',
          boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.6), inset 0 -4px 12px rgba(0,0,0,0.6)',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* 刻度线 */}
        {getDisplayItems().map(({ value: itemVal, offset }) => (
          <div
            key={offset}
            style={{
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '16px',
              paddingRight: '40px',
              fontSize: offset === 0 ? '13px' : '11px',
              color: offset === 0 ? '#ffaa22' : `rgba(102,68,0,${0.3 - Math.abs(offset) * 0.08})`,
              fontWeight: offset === 0 ? 600 : 400,
              borderBottom: offset === 0 ? '1px solid #2a1e00' : 'none',
              borderTop: offset === 0 ? '1px solid #2a1e00' : 'none',
              backgroundColor: offset === 0 ? '#0f0800' : 'transparent',
              transition: 'all 0.2s ease',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {itemVal ?? '·'}
          </div>
        ))}

        {/* 顶部渐变遮罩 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '40px',
            background: 'linear-gradient(to bottom, #0a0700 0%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />
        {/* 底部渐变遮罩 */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '40px',
            background: 'linear-gradient(to top, #0a0700 0%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* 右侧箭头 */}
        <div
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <button
            onClick={prev}
            style={{
              background: 'none',
              border: 'none',
              color: '#664400',
              cursor: 'pointer',
              padding: '0',
              lineHeight: 1,
            }}
          >
            <ChevronRight size={12} style={{ transform: 'rotate(-90deg)' }} />
          </button>
          <button
            onClick={next}
            style={{
              background: 'none',
              border: 'none',
              color: '#664400',
              cursor: 'pointer',
              padding: '0',
              lineHeight: 1,
            }}
          >
            <ChevronRight size={12} style={{ transform: 'rotate(90deg)' }} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 旋钮组件（温度/推拉） ────────────────────────────────────────────────────

function Knob({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startValue = useRef(value);

  // 将值映射到角度 (135deg 到 -135deg，即 -135 到 +135 共 270 度)
  const range = max - min;
  const normalized = (value - min) / range;
  const angle = -135 + normalized * 270;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    startY.current = e.clientY;
    startValue.current = value;
    e.preventDefault();
  }, [value]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const delta = (startY.current - e.clientY) * (step / 2);
    const newVal = Math.max(min, Math.min(max, startValue.current + delta));
    onChange(Math.round(newVal / step) * step);
  }, [min, max, step, onChange]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <span
        style={{
          fontSize: '10px',
          fontFamily: 'monospace',
          color: '#664400',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
        }}
      >
        {label}
      </span>

      {/* 旋钮外圈 */}
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'conic-gradient(from 225deg, #1a0f00 0%, #2d1800 100%)',
          border: '2px solid #2a1e00',
          boxShadow: '0 4px 16px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,153,0,0.1)',
          position: 'relative',
          cursor: 'ns-resize',
          userSelect: 'none',
        }}
        onMouseDown={handleMouseDown}
      >
        {/* 刻度标记 */}
        {Array.from({ length: 11 }).map((_, i) => {
          const tickAngle = -135 + i * 27;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '2px',
                height: i % 5 === 0 ? '8px' : '5px',
                backgroundColor: i % 5 === 0 ? '#3d2e00' : '#1f1500',
                transformOrigin: '50% 36px',
                transform: `translate(-50%, -36px) rotate(${tickAngle}deg)`,
              }}
            />
          );
        })}

        {/* 指针 */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '3px',
            height: '26px',
            backgroundColor: '#ff9900',
            transformOrigin: '50% 100%',
            transform: `translate(-50%, -100%) rotate(${angle}deg)`,
            borderRadius: '2px 2px 0 0',
            boxShadow: '0 0 6px rgba(255,153,0,0.6)',
            transition: 'transform 0.1s ease',
          }}
        />

        {/* 中心点 */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: '#1a0f00',
            border: '1px solid #3d2e00',
          }}
        />
      </div>

      {/* 当前值 */}
      <div
        style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#ffaa22',
          fontFamily: 'monospace',
          letterSpacing: '0.05em',
        }}
      >
        {value > 0 ? `+${value}` : value}
        <span style={{ fontSize: '11px', color: '#664400', marginLeft: '2px' }}>{unit}</span>
      </div>
    </div>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────

export default function ChemicalBath({ roll, onBack, onConfirm }: ChemicalBathProps) {
  const [config, setConfig] = useState<DevelopConfig>({
    camera: CAMERAS[0],
    lens: LENSES[0],
    shootDate: roll.date,
    developer: DEVELOPERS[0],
    temperature: 20,
    pushPull: 0,
    notes: '',
  });
  const [isPouring, setIsPouring] = useState(false);

  const handleConfirm = () => {
    setIsPouring(true);
    setTimeout(() => {
      onConfirm(config);
    }, 2000);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#050505',
        color: '#cc8800',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 颗粒层 */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          pointerEvents: 'none',
          zIndex: 100,
        }}
      />

      {/* 安全灯光晕 */}
      <div
        style={{
          position: 'fixed',
          top: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(255,100,0,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 32px' }}>

        {/* 导航 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              color: '#664400',
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: 'monospace',
              padding: '6px 0',
              transition: 'color 0.3s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ff9900')}
            onMouseLeave={e => (e.currentTarget.style.color = '#664400')}
          >
            <ChevronLeft size={14} />
            返回挑选底片
          </button>

          <div style={{ width: '1px', height: '16px', backgroundColor: '#1a1200' }} />

          <span
            style={{
              fontSize: '11px',
              fontFamily: 'monospace',
              color: '#3d2e00',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            Step 02 / Chemical Bath
          </span>
        </div>

        {/* 标题 */}
        <div style={{ marginBottom: '40px' }}>
          <h2
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: '#cc8800',
              letterSpacing: '-0.02em',
              marginBottom: '8px',
            }}
          >
            调配显影液
          </h2>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '13px',
              color: '#4d3300',
            }}
          >
            <FlaskConical size={14} />
            <span>
              正在配制：{roll.name} · {roll.filmStock} · ISO {roll.iso}
            </span>
          </div>
        </div>

        {/* 工作台面 */}
        <div
          style={{
            backgroundColor: '#070500',
            border: '1px solid #1a1200',
            borderRadius: '12px',
            padding: '32px',
            position: 'relative',
          }}
        >
          {/* 台面纹理 */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '12px',
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 19px,
                rgba(26,18,0,0.4) 19px,
                rgba(26,18,0,0.4) 20px
              )`,
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>

            {/* 第一行：机身 + 镜头 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '32px',
                marginBottom: '40px',
              }}
            >
              <ScrollDrum
                label="机身 Camera"
                options={CAMERAS}
                value={config.camera}
                onChange={(v) => setConfig(c => ({ ...c, camera: v }))}
              />
              <ScrollDrum
                label="镜头 Lens"
                options={LENSES}
                value={config.lens}
                onChange={(v) => setConfig(c => ({ ...c, lens: v }))}
              />
            </div>

            {/* 分割线 */}
            <div
              style={{
                height: '1px',
                backgroundColor: '#1a1200',
                marginBottom: '40px',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: '#070500',
                  padding: '0 12px',
                  fontSize: '9px',
                  color: '#2a1e00',
                  fontFamily: 'monospace',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                }}
              >
                显影配方
              </div>
            </div>

            {/* 第二行：显影液选择 */}
            <div style={{ marginBottom: '40px' }}>
              <ScrollDrum
                label="显影液 Developer"
                options={DEVELOPERS}
                value={config.developer}
                onChange={(v) => setConfig(c => ({ ...c, developer: v }))}
              />
            </div>

            {/* 第三行：旋钮组 */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'flex-end',
                paddingTop: '16px',
                borderTop: '1px solid #0f0900',
              }}
            >
              <Knob
                label="温度 Temp"
                value={config.temperature}
                min={15}
                max={30}
                step={0.5}
                unit="°C"
                onChange={(v) => setConfig(c => ({ ...c, temperature: v }))}
              />

              <div style={{ width: '1px', height: '60px', backgroundColor: '#1a1200' }} />

              <Knob
                label="推拉 Push/Pull"
                value={config.pushPull}
                min={-2}
                max={2}
                step={1}
                unit="stop"
                onChange={(v) => setConfig(c => ({ ...c, pushPull: v }))}
              />

              <div style={{ width: '1px', height: '60px', backgroundColor: '#1a1200' }} />

              {/* 拍摄日期 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    color: '#664400',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                  }}
                >
                  拍摄日期
                </span>
                <input
                  type="date"
                  value={config.shootDate}
                  onChange={e => setConfig(c => ({ ...c, shootDate: e.target.value }))}
                  style={{
                    backgroundColor: '#0a0700',
                    border: '1px solid #2a1e00',
                    borderRadius: '4px',
                    color: '#ffaa22',
                    padding: '8px 12px',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    outline: 'none',
                    cursor: 'pointer',
                    colorScheme: 'dark',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 备注 */}
        <div style={{ marginTop: '24px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '10px',
              fontFamily: 'monospace',
              color: '#664400',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              marginBottom: '8px',
            }}
          >
            备注 Notes
          </label>
          <textarea
            value={config.notes}
            onChange={e => setConfig(c => ({ ...c, notes: e.target.value }))}
            rows={3}
            placeholder="拍摄条件、曝光情况、特殊备注..."
            style={{
              width: '100%',
              backgroundColor: '#070500',
              border: '1px solid #1a1200',
              borderRadius: '6px',
              color: '#cc8800',
              padding: '12px 16px',
              fontFamily: 'monospace',
              fontSize: '13px',
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* 配方摘要 + 确认按钮 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '32px',
            padding: '16px 20px',
            backgroundColor: '#060400',
            border: '1px solid #1a1200',
            borderRadius: '8px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontFamily: 'monospace',
              color: '#4d3300',
              lineHeight: 1.8,
            }}
          >
            <div>{config.camera} + {config.lens.split(' ').slice(0, 2).join(' ')}</div>
            <div>
              {config.developer} · {config.temperature}°C
              {config.pushPull !== 0 && ` · ${config.pushPull > 0 ? '+' : ''}${config.pushPull} stop`}
            </div>
          </div>

          <button
            onClick={handleConfirm}
            disabled={isPouring}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 28px',
              backgroundColor: isPouring ? '#1a0f00' : '#0f0800',
              border: `1px solid ${isPouring ? '#3d2e00' : '#ff990050'}`,
              borderRadius: '6px',
              color: isPouring ? '#4d3300' : '#ff9900',
              fontSize: '13px',
              fontFamily: 'monospace',
              fontWeight: 600,
              cursor: isPouring ? 'not-allowed' : 'pointer',
              transition: 'all 0.4s ease',
              letterSpacing: '0.05em',
            }}
          >
            {isPouring ? (
              <>
                <RotateCcw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                正在显影...
              </>
            ) : (
              <>
                <Check size={14} />
                注入显影液，开始冲洗
              </>
            )}
          </button>
        </div>
      </div>

      {/* 旋转动画 */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
