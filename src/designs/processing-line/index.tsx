import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Film,
  Download,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Flag,
  XCircle,
  Keyboard,
  ChevronDown,
  Package,
  X,
} from 'lucide-react';
import BatchImporter from './BatchImporter';
import QuickFillForm from './QuickFillForm';
import TimelineStrip from './TimelineStrip';
import FrameEditor from './FrameEditor';
import type { Frame, RollSettings, ProcessingStage } from './types';

// ── Stage step indicator ────────────────────────────────────────
const STAGES: { key: ProcessingStage; label: string }[] = [
  { key: 'import', label: '① 导入' },
  { key: 'quickfill', label: '② 卷信息' },
  { key: 'timeline', label: '③ 时间轴' },
  { key: 'export', label: '④ 导出' },
];

function StageBar({ current }: { current: ProcessingStage }) {
  const idx = STAGES.findIndex(s => s.key === current);
  return (
    <div className="flex items-center gap-0 shrink-0">
      {STAGES.map((stage, i) => (
        <React.Fragment key={stage.key}>
          <div
            className={[
              'px-3 py-1 text-xs font-semibold transition-all',
              i === idx
                ? 'text-blue-600'
                : i < idx
                ? 'text-green-500'
                : 'text-gray-300',
            ].join(' ')}
          >
            {i < idx ? '✓ ' : ''}{stage.label}
          </div>
          {i < STAGES.length - 1 && (
            <div className={[
              'w-8 h-px transition-colors',
              i < idx ? 'bg-green-300' : 'bg-gray-200',
            ].join(' ')} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Keyboard shortcuts overlay ──────────────────────────────────
function KeyboardHelpOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Keyboard size={16} className="text-blue-500" />
            键盘快捷键
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-2">
          {[
            { keys: ['←', '→'], desc: '切换帧' },
            { keys: ['1', '2', '3', '4', '5'], desc: '设置评分' },
            { keys: ['Enter'], desc: '切换确认状态' },
            { keys: ['F'], desc: '标记帧' },
            { keys: ['R'], desc: '排除帧' },
            { keys: ['N'], desc: '编辑备注' },
            { keys: ['A'], desc: '切换调整面板' },
            { keys: ['?'], desc: '显示快捷键帮助' },
          ].map(({ keys, desc }) => (
            <div key={desc} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-600">{desc}</span>
              <div className="flex gap-1">
                {keys.map(k => (
                  <kbd key={k} className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-mono border border-gray-200">
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Export view ─────────────────────────────────────────────────
function ExportView({
  frames,
  settings,
  folderName,
  onBack,
}: {
  frames: Frame[];
  settings: RollSettings;
  folderName: string;
  onBack: () => void;
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportDone, setExportDone] = useState(false);

  const approved = frames.filter(f => f.status === 'approved');
  const reviewed = frames.filter(f => f.status === 'reviewed');
  const flagged = frames.filter(f => f.status === 'flagged');
  const rejected = frames.filter(f => f.status === 'rejected');
  const pending = frames.filter(f => f.status === 'pending');
  const exportable = [...approved, ...reviewed, ...flagged];

  const handleExport = useCallback(() => {
    setIsExporting(true);
    setExportProgress(0);
    const interval = setInterval(() => {
      setExportProgress(prev => {
        const next = prev + Math.random() * 12 + 3;
        if (next >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          setExportDone(true);
          return 100;
        }
        return next;
      });
    }, 80);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="max-w-2xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-900">导出准备</h2>
            <p className="text-xs text-gray-400 font-mono">{folderName}</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {[
            { icon: <CheckCircle2 size={16} />, label: '已确认', count: approved.length, color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
            { icon: <Film size={16} />, label: '已审阅', count: reviewed.length, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
            { icon: <Flag size={16} />, label: '已标记', count: flagged.length, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
            { icon: <XCircle size={16} />, label: '已排除', count: rejected.length, color: 'text-red-500', bg: 'bg-red-50 border-red-100' },
            { icon: <Clock size={16} />, label: '待处理', count: pending.length, color: 'text-gray-500', bg: 'bg-gray-50 border-gray-100' },
          ].map(stat => (
            <div key={stat.label} className={`rounded-xl border p-3 text-center ${stat.bg}`}>
              <div className={`flex justify-center mb-1 ${stat.color}`}>{stat.icon}</div>
              <div className={`text-xl font-bold ${stat.color}`}>{stat.count}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Roll info summary */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">卷信息</p>
          <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-sm">
            {[
              { label: '胶卷型号', value: settings.filmStock || '—' },
              { label: '相机', value: settings.camera || '—' },
              { label: 'ISO', value: String(settings.iso) },
              { label: '镜头', value: settings.lens || '—' },
              { label: '拍摄日期', value: settings.dateShot || '—' },
              { label: '冲洗机构', value: settings.lab || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-gray-400 text-xs">{label}</span>
                <span className="text-gray-800 text-xs font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Export settings */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">导出设置</p>
          <div className="space-y-3">
            {[
              {
                label: '导出范围',
                options: ['全部可导出帧', '仅已确认帧', '仅已标记帧'],
                selected: '全部可导出帧',
              },
              {
                label: '输出格式',
                options: ['JPEG (高质量)', 'TIFF 16-bit', 'PNG', '原始扫描'],
                selected: 'JPEG (高质量)',
              },
              {
                label: '目标目录',
                options: ['原文件夹/export', '桌面/导出', '自定义…'],
                selected: '原文件夹/export',
              },
            ].map(({ label, options, selected }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{label}</span>
                <div className="relative">
                  <select
                    defaultValue={selected}
                    className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 pr-7 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {options.map(o => <option key={o}>{o}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export progress or button */}
        {exportDone ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="w-14 h-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 size={28} className="text-green-500" />
            </div>
            <p className="text-base font-bold text-gray-900 mb-1">导出完成！</p>
            <p className="text-sm text-gray-500 mb-6">{exportable.length} 帧已成功导出</p>
            <button
              onClick={onBack}
              className="px-6 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              返回时间轴
            </button>
          </div>
        ) : isExporting ? (
          <div className="py-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700 font-medium">正在导出…</span>
              <span className="text-sm text-blue-600 font-mono">{Math.round(exportProgress)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-100"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              正在处理 {Math.ceil(exportable.length * exportProgress / 100)} / {exportable.length} 帧
            </p>
          </div>
        ) : (
          <button
            onClick={handleExport}
            className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Download size={16} />
            导出 {exportable.length} 帧
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Processing Line App ─────────────────────────────────────
export default function ProcessingLineApp() {
  const [stage, setStage] = useState<ProcessingStage>('import');
  const [frames, setFrames] = useState<Frame[]>([]);
  const [rollSettings, setRollSettings] = useState<RollSettings | null>(null);
  const [folderName, setFolderName] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showKeyHelp, setShowKeyHelp] = useState(false);
  const appRef = useRef<HTMLDivElement>(null);

  // Statistics
  const stats = {
    total: frames.length,
    reviewed: frames.filter(f => f.status !== 'pending').length,
    approved: frames.filter(f => f.status === 'approved').length,
    rejected: frames.filter(f => f.status === 'rejected').length,
    flagged: frames.filter(f => f.status === 'flagged').length,
  };
  const pct = frames.length > 0 ? (stats.reviewed / stats.total) * 100 : 0;

  // ── Keyboard handler ──────────────────────────────────────────
  useEffect(() => {
    if (stage !== 'timeline') return;

    const handler = (e: KeyboardEvent) => {
      // Don't intercept when typing in an input/textarea
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setSelectedIndex(i => Math.max(0, i - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setSelectedIndex(i => Math.min(frames.length - 1, i + 1));
          break;
        case 'Enter':
          e.preventDefault();
          setFrames(prev => prev.map((f, i) => {
            if (i !== selectedIndex) return f;
            return {
              ...f,
              status: f.status === 'approved' ? 'reviewed' : 'approved',
            };
          }));
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          setFrames(prev => prev.map((f, i) => {
            if (i !== selectedIndex) return f;
            return { ...f, status: f.status === 'flagged' ? 'pending' : 'flagged' };
          }));
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          setFrames(prev => prev.map((f, i) => {
            if (i !== selectedIndex) return f;
            return { ...f, status: f.status === 'rejected' ? 'pending' : 'rejected' };
          }));
          break;
        case '1': case '2': case '3': case '4': case '5': {
          e.preventDefault();
          const rating = parseInt(e.key);
          setFrames(prev => prev.map((f, i) => {
            if (i !== selectedIndex) return f;
            return { ...f, rating: f.rating === rating ? 0 : rating };
          }));
          break;
        }
        case '?':
          setShowKeyHelp(v => !v);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [stage, selectedIndex, frames.length]);

  // ── Frame update handler ──────────────────────────────────────
  const handleFrameUpdate = useCallback((id: string, updates: Partial<Frame>) => {
    setFrames(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  }, []);

  // ── Import complete ───────────────────────────────────────────
  const handleImportComplete = useCallback((newFrames: Frame[], name: string) => {
    setFrames(newFrames);
    setFolderName(name);
    setSelectedIndex(0);
    setStage('quickfill');
  }, []);

  // ── Quick fill complete ───────────────────────────────────────
  const handleQuickFillComplete = useCallback((settings: RollSettings) => {
    setRollSettings(settings);
    setStage('timeline');
  }, []);

  // ── Current frame ─────────────────────────────────────────────
  const currentFrame = frames[selectedIndex];

  return (
    <div
      ref={appRef}
      className="h-screen flex flex-col bg-white overflow-hidden font-sans"
      tabIndex={-1}
      style={{ outline: 'none' }}
    >
      {showKeyHelp && <KeyboardHelpOverlay onClose={() => setShowKeyHelp(false)} />}

      {/* ── Top Navigation Bar ──────────────────────────────────── */}
      <header className="flex items-center gap-4 px-4 py-2 border-b border-gray-100 bg-white shrink-0 z-10">
        {/* Back to home */}
        <Link
          to="/"
          className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={14} />
          <span className="text-xs">返回</span>
        </Link>

        <div className="w-px h-4 bg-gray-200" />

        {/* App logo */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center">
            <Film size={13} className="text-white" />
          </div>
          <span className="text-sm font-bold text-gray-900 tracking-tight">Processing Line</span>
          <span className="text-xs text-gray-300 font-mono">v2</span>
        </div>

        <div className="w-px h-4 bg-gray-200" />

        {/* Stage indicator */}
        <StageBar current={stage} />

        <div className="flex-1" />

        {/* Stats (only in timeline stage) */}
        {stage === 'timeline' && frames.length > 0 && (
          <div className="flex items-center gap-4">
            {/* Mini progress bar */}
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 font-mono">
                {stats.reviewed}/{stats.total}
              </span>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle2 size={11} />
                {stats.approved}
              </span>
              <span className="flex items-center gap-1 text-amber-500">
                <Flag size={11} />
                {stats.flagged}
              </span>
              <span className="flex items-center gap-1 text-red-500">
                <XCircle size={11} />
                {stats.rejected}
              </span>
            </div>

            {/* Export button */}
            <button
              onClick={() => setStage('export')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold transition-colors"
            >
              <Download size={12} />
              导出
            </button>
          </div>
        )}

        {/* Keyboard shortcut help */}
        {stage === 'timeline' && (
          <button
            onClick={() => setShowKeyHelp(true)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="键盘快捷键 (?)"
          >
            <Keyboard size={14} />
          </button>
        )}
      </header>

      {/* ── Main Content Area ──────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {stage === 'import' && (
          <BatchImporter onImportComplete={handleImportComplete} />
        )}

        {stage === 'quickfill' && (
          <QuickFillForm
            folderName={folderName}
            onComplete={handleQuickFillComplete}
            onBack={() => setStage('import')}
          />
        )}

        {stage === 'timeline' && currentFrame && (
          <>
            {/* Frame editor takes the bulk of the space */}
            <FrameEditor
              frame={currentFrame}
              totalFrames={frames.length}
              onUpdate={handleFrameUpdate}
              onPrev={() => setSelectedIndex(i => Math.max(0, i - 1))}
              onNext={() => setSelectedIndex(i => Math.min(frames.length - 1, i + 1))}
            />

            {/* Film strip pinned at bottom */}
            <div className="h-28 shrink-0">
              <TimelineStrip
                frames={frames}
                selectedIndex={selectedIndex}
                onSelect={setSelectedIndex}
              />
            </div>
          </>
        )}

        {stage === 'export' && rollSettings && (
          <ExportView
            frames={frames}
            settings={rollSettings}
            folderName={folderName}
            onBack={() => setStage('timeline')}
          />
        )}

        {/* Empty state when timeline but no frames (shouldn't happen) */}
        {stage === 'timeline' && frames.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Package size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">没有帧数据</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
