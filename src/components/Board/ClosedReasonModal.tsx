import { useState } from 'react';
import type { ClosedReason } from '../../types';

interface ClosedReasonModalProps {
  onConfirm: (reason: ClosedReason) => void;
  onCancel: () => void;
}

const REASONS: Array<{ value: ClosedReason; label: string }> = [
  { value: 'rejected', label: '被拒了' },
  { value: 'abandoned', label: '主动放弃' },
  { value: 'accepted_other', label: '接受了其他 Offer' },
];

export function ClosedReasonModal({ onConfirm, onCancel }: ClosedReasonModalProps) {
  const [selected, setSelected] = useState<ClosedReason | null>(null);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 22,
        width: 320,
        boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
      }}>
        <div style={{ fontSize: 16, fontWeight: 500, color: '#0F172A', marginBottom: 16 }}>
          为什么结束这个机会？
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {REASONS.map((r) => (
            <button
              key={r.value}
              onClick={() => setSelected(r.value)}
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                border: selected === r.value ? '1.5px solid #0EA5E9' : '1px solid #E2E8F0',
                backgroundColor: selected === r.value ? '#E0F2FE' : '#FFFFFF',
                color: selected === r.value ? '#0C4A6E' : '#475569',
                fontWeight: selected === r.value ? 500 : 400,
                fontSize: 13,
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
                transition: 'all 150ms',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
          <button
            onClick={onCancel}
            style={{
              height: 34,
              padding: '0 16px',
              borderRadius: 999,
              border: '0.5px solid #CBD5E1',
              backgroundColor: 'transparent',
              color: '#475569',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            取消
          </button>
          <button
            onClick={() => { if (selected) onConfirm(selected); }}
            disabled={!selected}
            style={{
              height: 34,
              padding: '0 16px',
              borderRadius: 999,
              border: 'none',
              backgroundColor: selected ? '#0EA5E9' : '#E2E8F0',
              color: selected ? '#FFFFFF' : '#94A3B8',
              fontSize: 12,
              fontWeight: 500,
              cursor: selected ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
              transition: 'background-color 150ms, color 150ms',
            }}
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
}
