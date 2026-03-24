import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface AutocompleteInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  options: string[];
}

export function AutocompleteInput({ value, onChange, placeholder, icon, options }: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value) {
      setFilteredOptions(options);
    } else {
      const lowerVal = value.toLowerCase();
      setFilteredOptions(options.filter(o => o.toLowerCase().includes(lowerVal)));
    }
  }, [value, options]);

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

      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto custom-scrollbar">
          {filteredOptions.map((opt, idx) => (
            <div 
              key={idx}
              className="px-4 py-2.5 text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer transition-colors"
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
