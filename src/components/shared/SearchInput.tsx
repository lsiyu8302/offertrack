import { useState } from 'react';
import { Search, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = '搜索公司、岗位…' }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        width: 200,
        height: 28,
        background: '#F8FAFC',
        borderRadius: 6,
        border: focused ? '1px solid #0EA5E9' : '0.5px solid #E2E8F0',
        boxShadow: focused ? '0 0 0 3px rgba(14,165,233,0.12)' : 'none',
        padding: '0 8px',
        boxSizing: 'border-box',
        transition: 'border 150ms, box-shadow 150ms',
      }}
    >
      <Search size={12} color="#94A3B8" style={{ flexShrink: 0 }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{
          flex: 1,
          border: 'none',
          background: 'transparent',
          fontSize: 12,
          color: '#0F172A',
          outline: 'none',
          fontFamily: 'inherit',
          minWidth: 0,
        }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={{
            display: 'flex',
            alignItems: 'center',
            border: 'none',
            background: 'none',
            padding: 0,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <X size={11} color="#94A3B8" />
        </button>
      )}
    </div>
  );
}
