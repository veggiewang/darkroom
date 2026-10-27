import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Plus, X } from 'lucide-react';

interface AutocompleteInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  options: string[];
  // 可选：允许把当前输入保存为自定义选项
  customOptions?: string[];
  onAddCustom?: (val: string) => void;
  onRemoveCustom?: (val: string) => void;
}

export function AutocompleteInput({ value, onChange, placeholder, icon, options, customOptions = [], onAddCustom, onRemoveCustom }: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const allOptions = [...customOptions, ...options.filter(o => !customOptions.includes(o))];
  const trimmed = value.trim();
  const canAdd = !!onAddCustom && trimmed !== '' && !allOptions.some(o => o.toLowerCase() === trimmed.toLowerCase());
  const filteredOptions = value
    ? allOptions.filter(o => o.toLowerCase().includes(value.toLowerCase()))
    : allOptions;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-4 z-10 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={`w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 text-zinc-100 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 outline-none transition-all placeholder:text-zinc-700 ${icon ? 'pl-11' : 'px-4'} pr-10`}
          placeholder={placeholder}
          value={value}
          onChange={e => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <div
          className="absolute right-3 cursor-pointer text-zinc-500 hover:text-zinc-300"
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronDown size={18} />
        </div>
      </div>

      {isOpen && (filteredOptions.length > 0 || canAdd) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto custom-scrollbar">
          {canAdd && (
            <div
              className="px-4 py-2.5 text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer transition-colors flex items-center gap-2 border-b border-zinc-800"
              onClick={() => {
                onAddCustom!(trimmed);
                onChange(trimmed);
                setIsOpen(false);
              }}
            >
              <Plus size={14} className="text-zinc-500" />
              添加自定义 “{trimmed}”
            </div>
          )}
          {filteredOptions.map((opt) => {
            const isCustom = customOptions.includes(opt);
            return (
              <div
                key={opt}
                className="px-4 py-2.5 text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer transition-colors flex items-center justify-between group"
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
              >
                <span>
                  {opt}
                  {isCustom && <span className="ml-2 text-[10px] text-zinc-500 uppercase tracking-wider">自定义</span>}
                </span>
                {isCustom && onRemoveCustom && (
                  <button
                    className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="删除这个自定义选项"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveCustom(opt);
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
