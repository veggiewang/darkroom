import React, { useState, useCallback, useRef } from 'react';
import {
  FolderOpen,
  Upload,
  Film,
  FileImage,
  X,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Layers,
} from 'lucide-react';
import type { Frame } from './types';
import { generateMockFrames } from './mockData';

interface BatchImporterProps {
  onImportComplete: (frames: Frame[], folderName: string) => void;
}

interface ImportSession {
  folderName: string;
  fileCount: number;
  validCount: number;
  frames: Frame[];
}

const SUPPORTED_EXTENSIONS = ['.tif', '.tiff', '.jpg', '.jpeg', '.png', '.raw', '.dng', '.cr2', '.cr3', '.nef', '.arw'];

export default function BatchImporter({ onImportComplete }: BatchImporterProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [importSession, setImportSession] = useState<ImportSession | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const simulateImport = useCallback((folderName: string, fileCount: number) => {
    setIsScanning(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        const next = prev + Math.random() * 18 + 5;
        if (next >= 100) {
          clearInterval(interval);
          const frames = generateMockFrames(Math.min(fileCount, 36));
          const session: ImportSession = {
            folderName,
            fileCount,
            validCount: frames.length,
            frames,
          };
          setImportSession(session);
          setIsScanning(false);
          return 100;
        }
        return next;
      });
    }, 120);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const items = Array.from(e.dataTransfer.items);
    const folderItem = items.find(item => item.kind === 'file');
    if (folderItem) {
      const file = folderItem.getAsFile();
      const folderName = file?.name || 'ROLL_2024_001';
      const fileCount = Math.floor(Math.random() * 12) + 24;
      simulateImport(folderName.replace(/\.[^/.]+$/, '') || 'ROLL_2024_001', fileCount);
    }
  }, [simulateImport]);

  const handleFolderClick = useCallback(() => {
    // Simulate folder pick
    const mockFolders = [
      { name: 'ROLL_2024_003_Portra400', count: 36 },
      { name: '20240315_春日公园', count: 24 },
      { name: 'Film_001_HP5', count: 36 },
    ];
    const picked = mockFolders[Math.floor(Math.random() * mockFolders.length)];
    simulateImport(picked.name, picked.count);
  }, [simulateImport]);

  const handleConfirm = useCallback(() => {
    if (importSession) {
      onImportComplete(importSession.frames, importSession.folderName);
    }
  }, [importSession, onImportComplete]);

  const handleReset = useCallback(() => {
    setImportSession(null);
    setScanProgress(0);
    setIsScanning(false);
  }, []);

  // ── Scanning state ──────────────────────────────────────────────
  if (isScanning) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white">
        <div className="w-full max-w-md px-8 text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
            <div
              className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent transition-all duration-150"
              style={{ transform: `rotate(${scanProgress * 3.6}deg)` }}
            />
            <Film className="absolute inset-0 m-auto text-blue-500" size={28} />
          </div>
          <p className="text-lg font-semibold text-gray-900 mb-1">正在扫描文件…</p>
          <p className="text-sm text-gray-500 mb-6">识别图像格式与元数据</p>
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-150"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-400">{Math.round(scanProgress)}%</p>
        </div>
      </div>
    );
  }

  // ── Confirm state ───────────────────────────────────────────────
  if (importSession) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white">
        <div className="w-full max-w-lg px-8">
          {/* Success icon */}
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-green-50 border border-green-100 mx-auto mb-6">
            <CheckCircle2 className="text-green-500" size={32} />
          </div>

          <h2 className="text-xl font-bold text-gray-900 text-center mb-1">扫描完成</h2>
          <p className="text-sm text-gray-500 text-center mb-8">确认导入以下内容</p>

          {/* Summary card */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 flex items-center gap-2">
                <FolderOpen size={14} />
                文件夹
              </span>
              <span className="text-sm font-semibold text-gray-900 font-mono truncate max-w-[240px]">
                {importSession.folderName}
              </span>
            </div>
            <div className="h-px bg-gray-200" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 flex items-center gap-2">
                <FileImage size={14} />
                检测到文件
              </span>
              <span className="text-sm font-semibold text-gray-900">{importSession.fileCount} 个</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 flex items-center gap-2">
                <Layers size={14} />
                可导入帧
              </span>
              <span className="text-sm font-semibold text-blue-600">{importSession.validCount} 帧</span>
            </div>
            {importSession.fileCount > importSession.validCount && (
              <div className="flex items-start gap-2 pt-1">
                <AlertCircle size={13} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-600">
                  {importSession.fileCount - importSession.validCount} 个文件格式不支持，已自动跳过
                </p>
              </div>
            )}
          </div>

          {/* Supported formats */}
          <div className="mb-8">
            <p className="text-xs text-gray-400 mb-2">支持格式</p>
            <div className="flex flex-wrap gap-1">
              {SUPPORTED_EXTENSIONS.map(ext => (
                <span key={ext} className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-500 font-mono">
                  {ext}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <X size={14} />
              重新选择
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              确认导入
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Default drop zone ───────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white px-8">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">批量导入胶片扫描</h1>
          <p className="text-sm text-gray-500">拖入文件夹或点击选择，支持多种 RAW 和图像格式</p>
        </div>

        {/* Drop zone */}
        <div
          ref={dropZoneRef}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleFolderClick}
          className={[
            'relative rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-150',
            'flex flex-col items-center justify-center py-16 px-8 select-none',
            isDragging
              ? 'border-blue-400 bg-blue-50 scale-[1.01]'
              : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/40',
          ].join(' ')}
        >
          {/* Background film strip decoration */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none opacity-5">
            <div className="absolute left-4 top-4 bottom-4 w-6 flex flex-col justify-evenly">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-full h-3 bg-gray-900 rounded-sm" />
              ))}
            </div>
            <div className="absolute right-4 top-4 bottom-4 w-6 flex flex-col justify-evenly">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-full h-3 bg-gray-900 rounded-sm" />
              ))}
            </div>
          </div>

          <div className={[
            'w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-150',
            isDragging ? 'bg-blue-100 text-blue-500 scale-110' : 'bg-white text-gray-400 shadow-sm border border-gray-100',
          ].join(' ')}>
            {isDragging ? <Upload size={28} /> : <FolderOpen size={28} />}
          </div>

          <p className={[
            'text-base font-semibold mb-1 transition-colors',
            isDragging ? 'text-blue-600' : 'text-gray-700',
          ].join(' ')}>
            {isDragging ? '松开以导入' : '拖入文件夹'}
          </p>
          <p className="text-sm text-gray-400">
            {isDragging ? '识别所有支持的图像格式' : '或点击此处浏览文件夹'}
          </p>
        </div>

        {/* Quick tips */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { icon: <Film size={14} />, label: '36 帧 / 卷', hint: '自动按文件名排序' },
            { icon: <Layers size={14} />, label: '批量元数据', hint: '一键填写卷级信息' },
            { icon: <CheckCircle2 size={14} />, label: '快速审阅', hint: '键盘驱动时间轴' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="text-blue-500 mb-1.5">{item.icon}</div>
              <p className="text-xs font-semibold text-gray-700 mb-0.5">{item.label}</p>
              <p className="text-xs text-gray-400">{item.hint}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
