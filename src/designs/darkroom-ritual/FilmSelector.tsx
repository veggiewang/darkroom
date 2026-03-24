import { useState, useRef } from 'react';
import { Film, FolderOpen, Image, ChevronDown, Star } from 'lucide-react';

// ─── 数据类型 ──────────────────────────────────────────────────────────────────

export interface FilmRoll {
  id: string;
  name: string;
  date: string;
  frameCount: number;
  filmStock: string;
  iso: number;
  thumbnails: string[]; // 占位颜色
  starred: boolean;
}

interface FilmSelectorProps {
  onSelect: (roll: FilmRoll) => void;
}

// ─── 模拟数据 ─────────────────────────────────────────────────────────────────

const DEMO_ROLLS: FilmRoll[] = [
  {
    id: 'roll-001',
    name: '京都·秋',
    date: '2024-11-03',
    frameCount: 36,
    filmStock: 'Kodak Portra 400',
    iso: 400,
    thumbnails: ['#3d2b1f', '#5c3d2e', '#8b6252', '#4a3020', '#6e4c3a', '#2a1a10'],
    starred: true,
  },
  {
    id: 'roll-002',
    name: '上海·夜',
    date: '2024-10-17',
    frameCount: 24,
    filmStock: 'CineStill 800T',
    iso: 800,
    thumbnails: ['#1a1a2e', '#16213e', '#0f3460', '#533483', '#e94560', '#1a1a2e'],
    starred: true,
  },
  {
    id: 'roll-003',
    name: '黄山·雾',
    date: '2024-09-05',
    frameCount: 36,
    filmStock: 'Ilford HP5 Plus',
    iso: 400,
    thumbnails: ['#2a2a2a', '#3d3d3d', '#505050', '#1a1a1a', '#404040', '#2d2d2d'],
    starred: false,
  },
  {
    id: 'roll-004',
    name: '大理·白',
    date: '2024-08-22',
    frameCount: 36,
    filmStock: 'Fujifilm Pro 400H',
    iso: 400,
    thumbnails: ['#e8dcc8', '#d4c4a8', '#c8b898', '#f0e8d8', '#ddd0bc', '#c0ae94'],
    starred: false,
  },
  {
    id: 'roll-005',
    name: '胡同·旧',
    date: '2024-07-14',
    frameCount: 36,
    filmStock: 'Kodak Tri-X 400',
    iso: 400,
    thumbnails: ['#1e1e1e', '#303030', '#252525', '#3a3a3a', '#1a1a1a', '#2e2e2e'],
    starred: false,
  },
  {
    id: 'roll-006',
    name: '西藏·圣',
    date: '2024-06-01',
    frameCount: 36,
    filmStock: 'Kodak Portra 160',
    iso: 160,
    thumbnails: ['#7a9eb5', '#5c8aaa', '#8fb5cc', '#4a7a9b', '#a0c4d8', '#6694aa'],
    starred: true,
  },
];

// ─── 子组件：单卷胶片 ─────────────────────────────────────────────────────────

function FilmStrip({ roll, onClick }: { roll: FilmRoll; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="film-strip-item"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        cursor: 'pointer',
        transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        transform: hovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        filter: hovered ? 'brightness(1.1)' : 'brightness(0.85)',
      }}
    >
      {/* 挂片夹顶部 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '4px 8px',
          backgroundColor: '#1a1400',
          borderTop: '1px solid #3d2e00',
          borderLeft: '1px solid #3d2e00',
          borderRight: '1px solid #3d2e00',
          borderRadius: '3px 3px 0 0',
          minHeight: '24px',
        }}
      >
        {/* 左侧夹子 */}
        <div
          style={{
            width: '14px',
            height: '8px',
            backgroundColor: '#ff9900',
            borderRadius: '2px',
            opacity: 0.8,
          }}
        />
        {/* 星标 */}
        {roll.starred && (
          <Star
            size={10}
            fill="#ff9900"
            stroke="#ff9900"
            style={{ opacity: 0.9 }}
          />
        )}
        {/* 右侧夹子 */}
        <div
          style={{
            width: '14px',
            height: '8px',
            backgroundColor: '#ff9900',
            borderRadius: '2px',
            opacity: 0.8,
          }}
        />
      </div>

      {/* 胶片主体 */}
      <div
        style={{
          width: '120px',
          backgroundColor: '#0d0d0d',
          border: '1px solid #2a2000',
          borderTop: 'none',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 胶片左侧齿孔 */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '10px',
            backgroundColor: '#0a0a0a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '4px 0',
            zIndex: 2,
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: '6px',
                height: '4px',
                backgroundColor: '#1a1a1a',
                borderRadius: '1px',
                border: '1px solid #2d2d2d',
              }}
            />
          ))}
        </div>

        {/* 胶片右侧齿孔 */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '10px',
            backgroundColor: '#0a0a0a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '4px 0',
            zIndex: 2,
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: '6px',
                height: '4px',
                backgroundColor: '#1a1a1a',
                borderRadius: '1px',
                border: '1px solid #2d2d2d',
              }}
            />
          ))}
        </div>

        {/* 缩略图帧 */}
        <div
          style={{
            margin: '6px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
          }}
        >
          {roll.thumbnails.map((color, i) => (
            <div
              key={i}
              style={{
                height: '22px',
                backgroundColor: color,
                borderRadius: '1px',
                opacity: hovered ? 0.9 : 0.6,
                transition: 'opacity 0.4s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* 帧编号 */}
              <span
                style={{
                  position: 'absolute',
                  left: '2px',
                  bottom: '1px',
                  fontSize: '7px',
                  color: 'rgba(255,153,0,0.5)',
                  fontFamily: 'monospace',
                  lineHeight: 1,
                }}
              >
                {i * 6 + 1}
              </span>
            </div>
          ))}
        </div>

        {/* 胶卷名称 */}
        <div
          style={{
            padding: '6px 14px 8px',
            borderTop: '1px solid #1a1400',
          }}
        >
          <div
            style={{
              fontSize: '9px',
              fontFamily: 'monospace',
              color: '#ff9900',
              opacity: 0.7,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {roll.filmStock.split(' ').slice(0, 2).join(' ')}
          </div>
          <div
            style={{
              fontSize: '8px',
              fontFamily: 'monospace',
              color: '#664400',
              marginTop: '2px',
            }}
          >
            ISO {roll.iso}
          </div>
        </div>
      </div>

      {/* 底部标签 */}
      <div
        style={{
          padding: '6px 8px',
          backgroundColor: '#0a0800',
          border: '1px solid #2a2000',
          borderTop: 'none',
          borderRadius: '0 0 3px 3px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: '10px',
            color: hovered ? '#ffbb44' : '#886622',
            fontWeight: 600,
            transition: 'color 0.4s ease',
            maxWidth: '100px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {roll.name}
        </div>
        <div
          style={{
            fontSize: '9px',
            color: '#553300',
            marginTop: '2px',
            fontFamily: 'monospace',
          }}
        >
          {roll.date}
        </div>
      </div>
    </div>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────

export default function FilmSelector({ onSelect }: FilmSelectorProps) {
  const [filter, setFilter] = useState<'all' | 'starred'>('all');
  const [hoveredInfo, setHoveredInfo] = useState<FilmRoll | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayedRolls = filter === 'starred'
    ? DEMO_ROLLS.filter(r => r.starred)
    : DEMO_ROLLS;

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
      {/* 全局颗粒噪点层 */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          pointerEvents: 'none',
          zIndex: 100,
        }}
      />

      {/* 暗绿色安全灯光晕 - 左上角 */}
      <div
        style={{
          position: 'fixed',
          top: -100,
          left: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(45,90,39,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* 琥珀色安全灯光晕 - 右下角 */}
      <div
        style={{
          position: 'fixed',
          bottom: -150,
          right: -100,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,153,0,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 32px' }}>

        {/* 顶部标题区 */}
        <div style={{ marginBottom: '48px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '2px',
                backgroundColor: '#ff9900',
                opacity: 0.6,
              }}
            />
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#664400',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              Step 01 / Film Selection
            </span>
          </div>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 800,
              color: '#cc8800',
              letterSpacing: '-0.02em',
              marginBottom: '8px',
            }}
          >
            挑选底片
          </h1>
          <p style={{ color: '#4d3300', fontSize: '14px' }}>
            从悬挂的底片条中选择要冲洗的胶卷
          </p>
        </div>

        {/* 过滤栏 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '40px',
            borderBottom: '1px solid #1a1200',
            paddingBottom: '16px',
          }}
        >
          {(['all', 'starred'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 16px',
                borderRadius: '4px',
                border: filter === f ? '1px solid #ff990040' : '1px solid transparent',
                backgroundColor: filter === f ? '#1a0f00' : 'transparent',
                color: filter === f ? '#ff9900' : '#4d3300',
                fontSize: '12px',
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {f === 'starred' && <Star size={10} />}
              {f === 'all' ? '全部底片' : '已加星标'}
            </button>
          ))}

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Film size={14} style={{ color: '#4d3300' }} />
            <span style={{ fontSize: '12px', color: '#4d3300', fontFamily: 'monospace' }}>
              {displayedRolls.length} rolls
            </span>
          </div>
        </div>

        {/* 挂片夹区域 - 晾衣绳 */}
        <div style={{ position: 'relative', marginBottom: '48px' }}>
          {/* 晾衣绳 */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, transparent 0%, #2a1e00 5%, #3d2e00 50%, #2a1e00 95%, transparent 100%)',
              boxShadow: '0 1px 4px rgba(255,153,0,0.15)',
              zIndex: 1,
            }}
          />

          {/* 底片条容器 */}
          <div
            ref={containerRef}
            style={{
              display: 'flex',
              gap: '24px',
              padding: '0 16px',
              paddingTop: '8px',
              overflowX: 'auto',
              scrollbarWidth: 'thin',
              scrollbarColor: '#2a1e00 transparent',
              paddingBottom: '16px',
            }}
          >
            {displayedRolls.map((roll) => (
              <div
                key={roll.id}
                onMouseEnter={() => setHoveredInfo(roll)}
                onMouseLeave={() => setHoveredInfo(null)}
                style={{ flexShrink: 0 }}
              >
                <FilmStrip roll={roll} onClick={() => onSelect(roll)} />
              </div>
            ))}

            {/* 空胶卷槽提示 */}
            <div
              style={{
                flexShrink: 0,
                width: '120px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: '24px',
                opacity: 0.3,
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '120px',
                  height: '180px',
                  border: '1px dashed #2a1e00',
                  borderRadius: '3px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <FolderOpen size={20} style={{ color: '#553300' }} />
                <span style={{ fontSize: '9px', color: '#553300', fontFamily: 'monospace' }}>
                  载入文件夹
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 悬停信息栏 */}
        <div
          style={{
            height: '80px',
            border: '1px solid #1a1200',
            borderRadius: '4px',
            padding: '16px 20px',
            backgroundColor: '#060400',
            transition: 'all 0.5s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          {hoveredInfo ? (
            <>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#ff9900',
                  boxShadow: '0 0 8px #ff9900',
                  flexShrink: 0,
                  animation: 'pulse 2s infinite',
                }}
              />
              <div>
                <div style={{ color: '#ff9900', fontWeight: 600, marginBottom: '4px' }}>
                  {hoveredInfo.name}
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '16px',
                    fontSize: '12px',
                    color: '#664400',
                    fontFamily: 'monospace',
                  }}
                >
                  <span>{hoveredInfo.filmStock}</span>
                  <span>ISO {hoveredInfo.iso}</span>
                  <span>{hoveredInfo.frameCount} 帧</span>
                  <span>{hoveredInfo.date}</span>
                </div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: '#ff9900', opacity: 0.6 }}>
                  点击进入显影
                </span>
                <ChevronDown
                  size={14}
                  style={{ color: '#ff9900', opacity: 0.6, transform: 'rotate(-90deg)' }}
                />
              </div>
            </>
          ) : (
            <div
              style={{
                fontSize: '12px',
                color: '#2a1e00',
                fontFamily: 'monospace',
                width: '100%',
                textAlign: 'center',
              }}
            >
              — 悬停底片条查看详情 —
            </div>
          )}
        </div>

        {/* 底部工具行 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '32px',
            paddingTop: '16px',
            borderTop: '1px solid #0d0900',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '11px',
              color: '#2a1e00',
              fontFamily: 'monospace',
            }}
          >
            <Image size={12} />
            <span>支持 RAW · JPEG · TIFF</span>
          </div>
          <div style={{ fontSize: '11px', color: '#2a1e00', fontFamily: 'monospace' }}>
            Digital Darkroom v1.0
          </div>
        </div>
      </div>
    </div>
  );
}
