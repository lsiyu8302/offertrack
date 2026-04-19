import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getUrgencyLevel } from '../../lib/urgency';
import { INDUSTRY_TAGS, JOB_TYPES } from '../../lib/constants';
import type { Job } from '../../types';

// ─── FilterState (exported for App.tsx) ──────────────────────────────────────

export interface FilterState {
  industries: string[];
  cities: string[];
  jobType: string; // '' | 'campus' | 'intern' | 'social'
  urgencies: string[]; // 'urgent' | 'warning' | 'normal'
}

export const EMPTY_FILTER: FilterState = {
  industries: [],
  cities: [],
  jobType: '',
  urgencies: [],
};

export function isFilterActive(f: FilterState): boolean {
  return (
    f.industries.length > 0 ||
    f.cities.length > 0 ||
    f.jobType !== '' ||
    f.urgencies.length > 0
  );
}

export function applyFilter(jobs: Job[], filter: FilterState, search: string): Job[] {
  return jobs.filter((job) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !job.company.toLowerCase().includes(q) &&
        !job.position.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (filter.industries.length > 0 && (!job.industry || !filter.industries.includes(job.industry))) {
      return false;
    }
    if (filter.cities.length > 0 && (!job.city || !filter.cities.includes(job.city))) {
      return false;
    }
    if (filter.jobType && job.jobType !== filter.jobType) {
      return false;
    }
    if (filter.urgencies.length > 0) {
      const level = getUrgencyLevel(job);
      if (!filter.urgencies.includes(level)) return false;
    }
    return true;
  });
}

// ─── FilterPanel component ────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  jobs: Job[];
  filter: FilterState;
  onApply: (f: FilterState) => void;
}

const URGENCY_OPTIONS = [
  { value: 'urgent', label: '紧急', color: '#DC2626' },
  { value: 'warning', label: '临近', color: '#F59E0B' },
  { value: 'normal', label: '正常', color: '#0EA5E9' },
];

export function FilterPanel({ open, onClose, jobs, filter, onApply }: Props) {
  const [local, setLocal] = useState<FilterState>(filter);

  useEffect(() => {
    if (open) setLocal(filter);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Extract unique cities from all jobs
  const cities = [...new Set(jobs.map((j) => j.city).filter(Boolean) as string[])].sort();

  function toggle<T>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
  }

  function handleClear() {
    setLocal(EMPTY_FILTER);
    onApply(EMPTY_FILTER);
    onClose();
  }

  function handleApply() {
    onApply(local);
    onClose();
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.15)',
          zIndex: 48,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 200ms',
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0,
          width: 320, height: '100vh',
          background: '#fff',
          borderLeft: '0.5px solid #E2E8F0',
          boxShadow: '-4px 0 20px rgba(0,0,0,0.06)',
          zIndex: 49,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 250ms cubic-bezier(0.32,0.72,0,1)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderBottom: '0.5px solid #E2E8F0',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 500, color: '#0F172A' }}>筛选</span>
          <button
            onClick={onClose}
            style={{
              width: 26, height: 26, borderRadius: 6,
              border: '0.5px solid #E2E8F0',
              background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', padding: 0,
            }}
          >
            <X size={13} color="#94A3B8" />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px' }}>

          <Section title="行业">
            {(INDUSTRY_TAGS as readonly string[]).map((tag) => (
              <Chip
                key={tag}
                active={local.industries.includes(tag)}
                onClick={() => setLocal((p) => ({ ...p, industries: toggle(p.industries, tag) }))}
              >
                {tag}
              </Chip>
            ))}
          </Section>

          <Section title="城市">
            {cities.length === 0 ? (
              <span style={{ fontSize: 12, color: '#94A3B8' }}>暂无数据</span>
            ) : (
              cities.map((city) => (
                <Chip
                  key={city}
                  active={local.cities.includes(city)}
                  onClick={() => setLocal((p) => ({ ...p, cities: toggle(p.cities, city) }))}
                >
                  {city}
                </Chip>
              ))
            )}
          </Section>

          <Section title="招聘类型">
            <Chip
              active={local.jobType === ''}
              onClick={() => setLocal((p) => ({ ...p, jobType: '' }))}
            >
              全部
            </Chip>
            {JOB_TYPES.map(({ value, label }) => (
              <Chip
                key={value}
                active={local.jobType === value}
                onClick={() => setLocal((p) => ({ ...p, jobType: value }))}
              >
                {label}
              </Chip>
            ))}
          </Section>

          <Section title="紧急程度">
            {URGENCY_OPTIONS.map(({ value, label, color }) => (
              <Chip
                key={value}
                active={local.urgencies.includes(value)}
                activeColor={color}
                onClick={() => setLocal((p) => ({ ...p, urgencies: toggle(p.urgencies, value) }))}
              >
                {label}
              </Chip>
            ))}
          </Section>
        </div>

        {/* Footer buttons */}
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            gap: 8,
            padding: '14px 18px',
            borderTop: '0.5px solid #E2E8F0',
          }}
        >
          <button
            onClick={handleClear}
            style={{
              flex: 1,
              height: 34,
              borderRadius: 999,
              border: '0.5px solid #CBD5E1',
              background: 'transparent',
              fontSize: 12,
              color: '#475569',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            清除筛选
          </button>
          <button
            onClick={handleApply}
            style={{
              flex: 1,
              height: 34,
              borderRadius: 999,
              border: 'none',
              background: '#0EA5E9',
              color: '#fff',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            应用
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 10, fontWeight: 500, color: '#94A3B8', letterSpacing: '0.5px', marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 8px' }}>
        {children}
      </div>
    </div>
  );
}

function Chip({
  active,
  activeColor,
  onClick,
  children,
}: {
  active: boolean;
  activeColor?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const bg = active ? (activeColor ?? '#0EA5E9') : '#F8FAFC';
  const color = active ? '#fff' : '#475569';
  const border = active ? 'none' : '0.5px solid #E2E8F0';

  return (
    <button
      onClick={onClick}
      style={{
        height: 26,
        padding: '0 10px',
        borderRadius: 999,
        border,
        background: bg,
        color,
        fontSize: 12,
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontWeight: active ? 500 : 400,
        transition: 'all 150ms',
      }}
    >
      {children}
    </button>
  );
}
