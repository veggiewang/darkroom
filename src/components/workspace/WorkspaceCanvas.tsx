import { useState, useEffect } from 'react';
import { ChevronLeft, Save, Maximize, CheckCircle2, X, Focus, Gauge, MapPin, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { convertFileSrc, invoke } from '@tauri-apps/api/core';
import type { RollMetadata, FrameMetadata } from '../../types';
import { LocationInput } from '../LocationInput';

interface WorkspaceProps {
  rollMetadata: RollMetadata;
  onBack: () => void;
}

// 模拟一些占位帧数据用于 UI 搭建
const MOCK_FRAMES: FrameMetadata[] = Array.from({ length: 36 }).map((_, i) => ({
  id: `frame-${i + 1}`,
  filePath: `/mock/path/IMG_${1000 + i}.jpg`,
  fileName: `IMG_${1000 + i}.jpg`,
}));

export default function WorkspaceCanvas({ rollMetadata, onBack }: WorkspaceProps) {
  // 如果有真实导入的文件，就使用它们，否则使用占位符
  let initialFrames: FrameMetadata[];
  try {
    initialFrames = rollMetadata?.importedFiles && rollMetadata.importedFiles.length > 0
      ? rollMetadata.importedFiles.map((file: any, i: number) => ({
          id: `frame-${i + 1}`,
          filePath: typeof file === 'string' ? file : file.path,
          fileName: typeof file === 'string' ? (file.split('/').pop() || `frame-${i+1}`) : file.name,
        }))
      : MOCK_FRAMES;
  } catch (e) {
    console.error("Error parsing importedFiles:", e);
    initialFrames = MOCK_FRAMES;
  }

  const [frames, setFrames] = useState<FrameMetadata[]>(initialFrames);
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);
  const [isWriting, setIsWriting] = useState(false);
  const [writeResult, setWriteResult] = useState<{show: boolean, success: number, failed: number, errors: any[]} | null>(null);

  // 键盘快捷键处理 (Enter/↓: 下一帧, ↑: 上一帧)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (activeFrameIndex < frames.length - 1) {
          const nextIndex = activeFrameIndex + 1;
          setActiveFrameIndex(nextIndex);
          // 自动继承当前帧的参数给下一帧
          const currentFrame = frames[activeFrameIndex];
          setFrames(prev => {
            const newFrames = [...prev];
            newFrames[nextIndex] = {
              ...newFrames[nextIndex],
              aperture: currentFrame.aperture || newFrames[nextIndex].aperture,
              shutterSpeed: currentFrame.shutterSpeed || newFrames[nextIndex].shutterSpeed,
              iso: currentFrame.iso || newFrames[nextIndex].iso,
              focalLength: currentFrame.focalLength || newFrames[nextIndex].focalLength,
              ev: currentFrame.ev || newFrames[nextIndex].ev,
            };
            return newFrames;
          });
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (activeFrameIndex > 0) {
          setActiveFrameIndex(activeFrameIndex - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFrameIndex, frames]);

  // 防御性检查（在所有 hooks 之后）
  if (!rollMetadata || !rollMetadata.filmStock) {
    return (
      <div className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-center text-zinc-100">
        <div className="text-red-500 mb-4 text-lg font-bold">错误: 缺少胶卷信息</div>
        <button onClick={onBack} className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
          返回
        </button>
      </div>
    );
  }

  // 处理写入 EXIF 的逻辑
  const handleWriteExif = async () => {
    try {
      setIsWriting(true);
      
      // 构造要发送给后端的任务列表
      const tasks = frames.map(frame => ({
        file_path: frame.filePath,
        camera_make_model: rollMetadata.cameraMakeModel || '',
        lens: rollMetadata.lens || '',
        film_stock: `${rollMetadata.filmStock.brand} ${rollMetadata.filmStock.name} (${rollMetadata.filmStock.format})`,
        // ISO: 优先使用帧级别 > 卷级别 > 胶片标称
        iso: frame.iso || rollMetadata.iso || rollMetadata.filmStock.iso.toString(),
        // 位置: 优先使用帧级别 > 卷级别
        location: frame.location || rollMetadata.location || null,
        latitude: frame.latitude ?? rollMetadata.latitude ?? null,
        longitude: frame.longitude ?? rollMetadata.longitude ?? null,
        date_shot: rollMetadata.dateShot || null,
        developer: rollMetadata.developer || null,
        scanner: rollMetadata.scanner || null,
        author: rollMetadata.author || null,
        // EV: 优先使用帧级别 > 卷级别
        ev: frame.ev || rollMetadata.ev || null,
        aperture: frame.aperture || null,
        shutter_speed: frame.shutterSpeed || null,
        notes: frame.notes || null,
        focal_length: frame.focalLength || null,
      }));

      console.log("Submitting EXIF tasks:", tasks);

      const results: any = await invoke('write_exif_batch', { tasks });
      
      console.log("EXIF write results:", results);
      
      const failures = results.filter((r: any) => !r.success);
      const successes = results.filter((r: any) => r.success);
      
      setWriteResult({
        show: true,
        success: successes.length,
        failed: failures.length,
        errors: failures
      });
      
    } catch (error) {
      console.error("Error writing EXIF:", error);
      alert(`写入过程发生错误: ${error}\n\n请确保你的电脑上安装了 exiftool (brew install exiftool)`);
    } finally {
      setIsWriting(false);
    }
  };

  const activeFrame = frames[activeFrameIndex];
  console.log("Currently active frame:", activeFrame);

  if (!activeFrame) {
    return (
      <div className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-center text-zinc-100 relative">
        <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-red-600/10 blur-[100px] rounded-full z-0 mix-blend-screen"></div>
        <div className="text-zinc-500 mb-4 z-10">没有找到任何底片</div>
        <button onClick={onBack} className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors z-10">
          返回重新选择文件夹
        </button>
      </div>
    );
  }

  // 更新当前帧的元数据
  const updateActiveFrame = (updates: Partial<FrameMetadata>) => {
    const newFrames = [...frames];
    newFrames[activeFrameIndex] = { ...activeFrame, ...updates };
    setFrames(newFrames);
  };

  return (
    <div className="h-screen w-full bg-zinc-950 flex flex-col overflow-hidden text-zinc-100 selection:bg-red-900/50 relative">
      
      {/* --- 暗房红灯环境光晕 (Ambient Safe Light) --- */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-red-600/10 blur-[100px] rounded-full z-0 mix-blend-screen"></div>
      <div className="pointer-events-none fixed bottom-0 left-0 w-[500px] h-[500px] bg-red-800/10 blur-[100px] rounded-full z-0 mix-blend-screen"></div>

      {/* --- Top Navigation Bar --- */}
      <header className="h-14 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between px-4 z-20 shrink-0">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="flex items-center text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} className="mr-1" />
            <span className="text-sm font-medium">返回胶卷库</span>
          </button>
          
          <div className="h-4 w-px bg-zinc-800"></div>
          
          <div className="flex flex-col">
            <div className="flex items-center space-x-2 text-sm">
              <span className="font-bold text-white">{rollMetadata.filmStock.brand} {rollMetadata.filmStock.name}</span>
              <span className="text-zinc-600 px-1.5 py-0.5 rounded bg-zinc-900 text-[10px] uppercase font-bold tracking-wider">ISO {rollMetadata.filmStock.iso}</span>
            </div>
            <div className="text-xs text-zinc-500 flex items-center space-x-2">
              <span>{rollMetadata.cameraMakeModel || '未知相机'}</span>
              <span>·</span>
              <span>{rollMetadata.lens || '未知镜头'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={handleWriteExif}
            disabled={isWriting}
            className={`flex items-center space-x-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${
              isWriting ? 'bg-zinc-800 text-zinc-400 cursor-wait' : 'bg-white text-black hover:bg-zinc-200 hover:scale-105 active:scale-95 shadow-lg shadow-white/10'
            }`}
          >
            {isWriting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-zinc-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>正在冲洗数据...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>写入 EXIF ({frames.length} 张)</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* --- Main Loupe Area (View + Rapid Entry) --- */}
      <main className="flex-1 flex overflow-hidden relative z-10">
        
        {/* Left/Center: Huge Image Preview */}
        <div className="flex-1 bg-black relative flex items-center justify-center p-8 group">
          <div className="w-full h-full max-w-5xl max-h-[80vh] border border-zinc-800/50 bg-zinc-900/20 shadow-2xl rounded flex items-center justify-center overflow-hidden relative">
             
             {/* 真实图片渲染 */}
             {activeFrame.filePath && !activeFrame.filePath.includes('/mock/path') ? (
               <img 
                 src={convertFileSrc(activeFrame.filePath)} 
                 alt={activeFrame.fileName} 
                 className="w-full h-full object-contain z-10"
               />
             ) : (
               <>
                 {/* Placeholder for no image */}
                 <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
                 <div className="text-zinc-600 flex flex-col items-center z-10">
                   <Maximize size={48} className="mb-4 opacity-50 stroke-1" />
                   <p className="font-mono text-sm tracking-widest">{activeFrame.fileName}</p>
                 </div>
               </>
             )}

             {/* Frame Counter Overlay */}
             <div className="absolute bottom-4 left-4 font-mono text-4xl font-black text-white/50 select-none drop-shadow-md z-20">
               {activeFrameIndex + 1}
               <span className="text-lg text-white/30">/{frames.length}</span>
             </div>
             
             {/* Filename Overlay */}
             <div className="absolute top-4 left-4 font-mono text-sm text-white/50 bg-black/50 px-2 py-1 rounded backdrop-blur-sm z-20">
               {activeFrame.fileName}
             </div>
          </div>
        </div>

        {/* Right: Rapid Keyboard Entry Panel */}
        <div className="w-80 border-l border-zinc-900 bg-zinc-950/50 flex flex-col z-10 shrink-0">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 px-6 pt-6">单帧曝光参数</h3>
          
          {/* 可滚动区域 */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-6">
            <div className="space-y-4 pb-6">
              {/* 摄影三要素 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">光圈 (Aperture)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-mono">f/</span>
                  <input 
                    type="text" 
                    value={activeFrame.aperture || ''}
                    onChange={(e) => updateActiveFrame({ aperture: e.target.value })}
                    placeholder="8"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white font-mono text-lg focus:border-zinc-500 focus:bg-zinc-800 outline-none transition-all placeholder:text-zinc-700"
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">快门速度 (Shutter)</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={activeFrame.shutterSpeed || ''}
                    onChange={(e) => updateActiveFrame({ shutterSpeed: e.target.value })}
                    placeholder="1/250"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 text-white font-mono text-lg focus:border-zinc-500 focus:bg-zinc-800 outline-none transition-all placeholder:text-zinc-700"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-mono">s</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <Film size={14} className="text-zinc-500" />
                  ISO 感光度
                </label>
                <input 
                  type="text" 
                  value={activeFrame.iso || ''}
                  onChange={(e) => updateActiveFrame({ iso: e.target.value })}
                  placeholder={rollMetadata.iso || `${rollMetadata.filmStock.iso}`}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-4 text-white font-mono focus:border-zinc-500 focus:bg-zinc-800 outline-none transition-all placeholder:text-zinc-700"
                />
              </div>

              {/* 其他参数 */}
              <div className="space-y-2 pt-2 border-t border-zinc-900">
                <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <Focus size={14} className="text-zinc-500" />
                  焦距 (mm)
                </label>
                <input 
                  type="text" 
                  value={activeFrame.focalLength || ''}
                  onChange={(e) => updateActiveFrame({ focalLength: e.target.value })}
                  placeholder="50"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-4 text-white font-mono focus:border-zinc-500 focus:bg-zinc-800 outline-none transition-all placeholder:text-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <Gauge size={14} className="text-zinc-500" />
                  曝光补偿 (EV)
                </label>
                <input 
                  type="text" 
                  value={activeFrame.ev || ''}
                  onChange={(e) => updateActiveFrame({ ev: e.target.value })}
                  placeholder="0"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-4 text-white font-mono focus:border-zinc-500 focus:bg-zinc-800 outline-none transition-all placeholder:text-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <MapPin size={14} className="text-zinc-500" />
                  拍摄地点
                </label>
                <LocationInput
                  value={activeFrame.location || ''}
                  onChange={(val: string, lat?: number, lon?: number) => updateActiveFrame({ location: val, latitude: lat, longitude: lon })}
                  placeholder="搜索地点..."
                />
              </div>

              {/* 备注放最下面 */}
              <div className="space-y-2 pt-2 border-t border-zinc-900">
                <label className="text-sm font-medium text-zinc-400">备注 (Notes)</label>
                <textarea 
                  value={activeFrame.notes || ''}
                  onChange={(e) => updateActiveFrame({ notes: e.target.value })}
                  placeholder="拍摄说明或备注..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 text-white text-sm focus:border-zinc-500 focus:bg-zinc-800 outline-none transition-all placeholder:text-zinc-700 resize-none h-20"
                />
              </div>
            </div>
          </div>

          {/* 固定在底部的快捷键提示 */}
          <div className="px-6 pb-6 pt-4 text-xs text-zinc-600 flex flex-col space-y-2 border-t border-zinc-900">
            <div className="flex justify-between">
              <span>下一帧</span>
              <kbd className="font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">Enter / ↓</kbd>
            </div>
            <div className="flex justify-between">
              <span>上一帧</span>
              <kbd className="font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">↑</kbd>
            </div>
            <p className="text-zinc-700 mt-2">提示: 按 Enter 切换时将自动继承当前参数</p>
          </div>
        </div>
      </main>

      {/* --- Bottom Film Strip --- */}
      <footer className="h-32 border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-md flex items-center px-4 overflow-x-auto custom-scrollbar shrink-0 z-20 relative">
        <div className="flex space-x-2 min-w-max pb-2">
          {frames.map((frame, index) => {
            const isActive = index === activeFrameIndex;
            const hasData = frame.aperture || frame.shutterSpeed || frame.notes;

            return (
              <div
                key={frame.id}
                onClick={() => setActiveFrameIndex(index)}
                className={`
                  relative w-32 h-20 rounded-md cursor-pointer flex items-center justify-center overflow-hidden
                  transition-[transform,box-shadow] duration-200 ease-out will-change-transform
                  ${isActive
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-950 bg-zinc-800 z-10'
                    : 'bg-zinc-900 border border-zinc-800 hover:border-zinc-600'
                  }
                `}
                style={{
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                {/* 真实底片缩略图或模拟 */}
                {frame.filePath && !frame.filePath.includes('/mock/path') ? (
                  <img src={convertFileSrc(frame.filePath)} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
                )}
                
                {/* 序号遮罩 */}
                <div className="absolute inset-0 bg-black/30"></div>
                <span className="font-mono text-lg font-bold text-white z-10 drop-shadow-md">{index + 1}</span>
                
                {/* 如果填写了数据，显示一个小圆点提示 */}
                {hasData && (
                  <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] z-10"></div>
                )}
              </div>
            );
          })}
        </div>
      </footer>

      {/* --- EXIF Write Success/Result Modal --- */}
      <AnimatePresence>
        {writeResult?.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col items-center p-8 relative"
            >
              <button 
                onClick={() => setWriteResult(null)} 
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6 border-4 border-green-500/30">
                <CheckCircle2 className="text-green-500" size={40} />
              </div>
              
              <h2 className="text-2xl font-black text-white mb-2">写入完成</h2>
              
              <div className="flex space-x-6 my-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-green-400">{writeResult.success}</div>
                  <div className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-bold">成功</div>
                </div>
                <div className="w-px h-full bg-zinc-800"></div>
                <div>
                  <div className={`text-3xl font-bold ${writeResult.failed > 0 ? 'text-red-500' : 'text-zinc-500'}`}>
                    {writeResult.failed}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-bold">失败</div>
                </div>
              </div>

              {writeResult.failed > 0 && (
                <div className="mt-4 w-full bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-xs text-red-400 max-h-24 overflow-y-auto">
                  {writeResult.errors.map((err, i) => (
                    <div key={i} className="mb-1 truncate" title={err.error_message}>
                      {err.file_path.split('/').pop()}: {err.error_message}
                    </div>
                  ))}
                </div>
              )}

              <button 
                onClick={() => setWriteResult(null)}
                className="mt-8 w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors"
              >
                我知道了
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
