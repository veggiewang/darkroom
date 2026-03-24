import { useState, useEffect } from 'react';
import FilmSelector from './FilmSelector';
import ChemicalBath from './ChemicalBath';
import EnlargerStation from './EnlargerStation';
import type { FilmRoll } from './FilmSelector';
import type { DevelopConfig } from './ChemicalBath';

// ─── 流程步骤 ─────────────────────────────────────────────────────────────────

type Step = 'film' | 'chemical' | 'enlarger';

interface StepInfo {
  id: Step;
  label: string;
  sub: string;
  index: number;
}

const STEPS: StepInfo[] = [
  { id: 'film', label: '挑选底片', sub: 'Film Selection', index: 1 },
  { id: 'chemical', label: '调配显影液', sub: 'Chemical Bath', index: 2 },
  { id: 'enlarger', label: '放大台冲洗', sub: 'Enlarger Station', index: 3 },
];

// ─── 步骤指示器 ───────────────────────────────────────────────────────────────

function StepIndicator({
  current,
  selectedRoll,
}: {
  current: Step;
  selectedRoll: FilmRoll | null;
}) {
  const currentIndex = STEPS.findIndex(s => s.id === current);

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '24px',
        zIndex: 300,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        alignItems: 'flex-end',
      }}
    >
      {/* 步骤点 */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {STEPS.map((step, i) => (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: i === currentIndex ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor:
                  i < currentIndex
                    ? '#664400'
                    : i === currentIndex
                    ? '#ff9900'
                    : '#1a1200',
                transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                boxShadow: i === currentIndex ? '0 0 8px rgba(255,153,0,0.5)' : 'none',
              }}
            />
            {i < STEPS.length - 1 && (
              <div
                style={{
                  width: '16px',
                  height: '1px',
                  backgroundColor: i < currentIndex ? '#3d2e00' : '#1a1200',
                  transition: 'background-color 0.5s ease',
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* 当前步骤文字 */}
      <div
        style={{
          fontSize: '9px',
          fontFamily: 'monospace',
          color: '#3d2e00',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
        }}
      >
        {STEPS[currentIndex]?.sub}
        {selectedRoll && current !== 'film' && (
          <span style={{ color: '#2a1e00', marginLeft: '8px' }}>
            · {selectedRoll.name}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── 页面过渡动画包装 ─────────────────────────────────────────────────────────

function PageTransition({
  children,
  visible,
}: {
  children: React.ReactNode;
  visible: boolean;
}) {
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        height: '100%',
        width: '100%',
      }}
    >
      {children}
    </div>
  );
}

// ─── 主入口组件 ───────────────────────────────────────────────────────────────

export default function DarkroomRitual() {
  const [step, setStep] = useState<Step>('film');
  const [visible, setVisible] = useState(true);
  const [selectedRoll, setSelectedRoll] = useState<FilmRoll | null>(null);
  const [developConfig, setDevelopConfig] = useState<DevelopConfig | null>(null);

  // 平滑过渡到下一步
  const goTo = (nextStep: Step, cb: () => void) => {
    setVisible(false);
    setTimeout(() => {
      cb();
      setStep(nextStep);
      setTimeout(() => setVisible(true), 50);
    }, 600);
  };

  const handleSelectRoll = (roll: FilmRoll) => {
    goTo('chemical', () => setSelectedRoll(roll));
  };

  const handleConfirmChemical = (config: DevelopConfig) => {
    goTo('enlarger', () => setDevelopConfig(config));
  };

  const handleBackToFilm = () => {
    goTo('film', () => {
      setSelectedRoll(null);
      setDevelopConfig(null);
    });
  };

  const handleBackToChemical = () => {
    goTo('chemical', () => setDevelopConfig(null));
  };

  // 暗房入场动画
  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* 全局样式 */}
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* 胶片颗粒动画 */
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-1%, -1%); }
          20% { transform: translate(1%, 1%); }
          30% { transform: translate(-1%, 1%); }
          40% { transform: translate(1%, -1%); }
          50% { transform: translate(-1%, 0); }
          60% { transform: translate(0, 1%); }
          70% { transform: translate(1%, 0); }
          80% { transform: translate(-1%, -1%); }
          90% { transform: translate(0, -1%); }
        }

        /* 安全灯脉冲 */
        @keyframes safelight-pulse {
          0%, 100% { opacity: 0.08; }
          50% { opacity: 0.12; }
        }

        /* 滚动条 */
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background-color: #2a1e00; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background-color: #3d2e00; }

        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          height: 3px;
          background: #1a1200;
          border-radius: 2px;
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ff9900;
          cursor: pointer;
          box-shadow: 0 0 4px rgba(255,153,0,0.5);
        }
      `}</style>

      {/* 顶层容器 */}
      <div
        style={{
          position: 'relative',
          width: '100vw',
          height: '100vh',
          backgroundColor: '#050505',
          overflow: 'hidden',
        }}
      >
        {/* 安全灯背景光晕 - 动态呼吸 */}
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'radial-gradient(ellipse 80% 60% at 50% 120%, rgba(45,90,39,0.06) 0%, transparent 100%)',
            animation: 'safelight-pulse 8s ease-in-out infinite',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* 步骤指示器 */}
        <StepIndicator current={step} selectedRoll={selectedRoll} />

        {/* 内容区 */}
        <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
          <PageTransition visible={visible}>
            {step === 'film' && (
              <FilmSelector onSelect={handleSelectRoll} />
            )}
            {step === 'chemical' && selectedRoll && (
              <ChemicalBath
                roll={selectedRoll}
                onBack={handleBackToFilm}
                onConfirm={handleConfirmChemical}
              />
            )}
            {step === 'enlarger' && selectedRoll && developConfig && (
              <EnlargerStation
                roll={selectedRoll}
                config={developConfig}
                onBack={handleBackToChemical}
              />
            )}
          </PageTransition>
        </div>
      </div>
    </>
  );
}
