import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface LocationInputProps {
  value: string;
  onChange: (val: string, lat?: number, lon?: number) => void;
  placeholder?: string;
}

export function LocationInput({ value, onChange, placeholder = "搜索拍摄地点..." }: LocationInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchLocation = async (query: string) => {
    if (!query || query.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      // Nominatim API (OpenStreetMap) - Free and no key required
      // Added accept-language to prefer user's local language
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        setIsOpen(true);
      }
    } catch (e) {
      console.error("Location search failed", e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val); // 手动输入时不传坐标
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      searchLocation(val);
    }, 600); // 600ms debounce
  };

  const formatDisplayName = (item: any) => {
    // Attempt to make the address shorter/cleaner
    const a = item.address || {};
    const parts = [
      a.city || a.town || a.village || a.county,
      a.state || a.province,
      a.country
    ].filter(Boolean);
    
    // Fallback to display_name if address details fail
    return parts.length > 0 ? parts.join(', ') : item.display_name;
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative flex items-center">
        <div className="absolute left-4 z-10 pointer-events-none text-zinc-500">
          {isSearching ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
        </div>
        <input 
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-zinc-100 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 outline-none transition-all placeholder:text-zinc-700"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar">
          {results.map((item, idx) => {
            const shortName = formatDisplayName(item);
            return (
              <div 
                key={idx}
                className="px-4 py-3 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800 cursor-pointer transition-colors"
                onClick={() => {
                  onChange(shortName, parseFloat(item.lat), parseFloat(item.lon));
                  setIsOpen(false);
                }}
              >
                <div className="text-zinc-200 text-sm font-medium">{item.name || shortName}</div>
                {item.name && <div className="text-zinc-500 text-xs mt-0.5 truncate">{item.display_name}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
