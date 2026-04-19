import { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';
import type { SortMode } from '../../types';

const LABELS: Record<SortMode, string> = {
  smart: '智能 ↓',
  created: '时间 ↓',
  alpha: 'A-Z',
  manual: '手动',
};

const OPTIONS: Array<{ value: SortMode; label: string; sub: string }> = [
  { value: 'smart', label: '智能排序', sub: '紧急优先' },
  { value: 'created', label: '按添加时间', sub: '最新在前' },
  { value: 'alpha', label: '按公司名', sub: 'A → Z' },
  { value: 'manual', label: '手动排序', sub: '拖拽调整' },
];

interface SortModeDropdownProps {
  value: SortMode;
  onChange: (mode: SortMode) => void;
}

export function SortModeDropdown({ value, onChange }: SortModeDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          fontSize: 10,
          color: '#94A3B8',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px 4px',
          borderRadius: 4,
          fontFamily: 'inherit',
          lineHeight: 1.4,
        }}
      >
        {LABELS[value]}
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          right: 0,
          backgroundColor: '#FFFFFF',
          border: '0.5px solid #E2E8F0',
          borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
          zIndex: 300,
          padding: 4,
          minWidth: 148,
        }}>
          {OPTIONS.map((opt) => {
            const active = value === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '6px 10px',
                  backgroundColor: active ? '#F0F9FF' : 'transparent',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  gap: 8,
                  textAlign: 'left',
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: active ? '#0284C7' : '#0F172A', fontWeight: active ? 500 : 400 }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 1 }}>{opt.sub}</div>
                </div>
                {active && <Check size={12} color="#0284C7" strokeWidth={2.5} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
