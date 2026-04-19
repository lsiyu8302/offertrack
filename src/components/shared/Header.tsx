import { useState, type ReactNode } from 'react';
import { CheckCircle2, LayoutGrid, CalendarDays, Plus, SlidersHorizontal } from 'lucide-react';
import type { ViewMode } from '../../types';
import { SearchInput } from './SearchInput';
import { SettingsMenu } from './SettingsMenu';

interface HeaderProps {
  urgentCount: number;
  hasRecentOffer: boolean;
  totalCount: number;
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  onNewJob: () => void;
  // Search & filter
  searchValue: string;
  onSearch: (q: string) => void;
  filterActive: boolean;
  onFilterClick: () => void;
  // Settings / data
  onExport: () => void;
  onImportFile: (file: File) => void;
  onClearAll: () => void;
}

function getSubtitle(urgentCount: number, hasRecentOffer: boolean, totalCount: number): string {
  if (totalCount === 0) return '开始你的求职旅程吧';
  if (urgentCount > 0) return `今天有 ${urgentCount} 件紧急的事，先处理它们 →`;
  if (hasRecentOffer) return '恭喜拿到新 Offer！慢慢选，别着急';
  return '你已经很努力了，继续加油 ✦';
}

export function Header({
  urgentCount,
  hasRecentOffer,
  totalCount,
  view,
  onViewChange,
  onNewJob,
  searchValue,
  onSearch,
  filterActive,
  onFilterClick,
  onExport,
  onImportFile,
  onClearAll,
}: HeaderProps) {
  const subtitle = getSubtitle(urgentCount, hasRecentOffer, totalCount);

  return (
    <header style={{ width: '100%' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        gap: 12,
      }}>
        {/* ── Left: Logo + title ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: '0 1 auto', minWidth: 0 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            backgroundColor: '#E0F2FE',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <CheckCircle2 size={18} color="#0284C7" strokeWidth={2} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: '#0F172A', lineHeight: 1.3, whiteSpace: 'nowrap' }}>
              我的求职旅程
            </div>
            <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.3, whiteSpace: 'nowrap' }}>
              {subtitle}
            </div>
          </div>
        </div>

        {/* ── Right: search + filter + settings + view + new ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* Search */}
          <SearchInput value={searchValue} onChange={onSearch} />

          {/* Filter button */}
          <FilterBtn active={filterActive} onClick={onFilterClick} />

          {/* Settings */}
          <SettingsMenu
            onExport={onExport}
            onImportFile={onImportFile}
            onClearAll={onClearAll}
          />

          {/* Separator */}
          <div style={{ width: '0.5px', height: 20, background: '#E2E8F0' }} />

          {/* View switcher */}
          <div style={{
            display: 'flex', alignItems: 'center',
            backgroundColor: '#F8FAFC', borderRadius: 8,
            padding: 2, gap: 2,
          }}>
            <ViewTab active={view === 'kanban'} onClick={() => onViewChange('kanban')} label="看板" icon={<LayoutGrid size={13} strokeWidth={2} />} />
            <ViewTab active={view === 'calendar'} onClick={() => onViewChange('calendar')} label="日历" icon={<CalendarDays size={13} strokeWidth={2} />} />
          </div>

          {/* New job */}
          <button
            onClick={onNewJob}
            aria-label="新增申请"
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              height: 34, padding: '0 16px',
              backgroundColor: '#0EA5E9', color: '#FFFFFF',
              border: 'none', borderRadius: 999,
              fontSize: 12, fontWeight: 500,
              cursor: 'pointer', whiteSpace: 'nowrap',
              fontFamily: 'inherit', transition: 'background-color 150ms',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0284C7')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0EA5E9')}
          >
            <Plus size={13} strokeWidth={2.5} />
            <span>新增申请</span>
          </button>
        </div>
      </div>

      <div style={{ marginTop: 16, borderBottom: '0.5px solid #E2E8F0' }} />
    </header>
  );
}

// ─── FilterBtn ────────────────────────────────────────────────────────────────

function FilterBtn({ active, onClick }: { active: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      aria-label="筛选"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 26, height: 26, borderRadius: 6,
        border: active ? '1px solid #0EA5E9' : '0.5px solid #E2E8F0',
        background: active ? '#E0F2FE' : hov ? '#F1F5F9' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', padding: 0,
        transition: 'all 150ms',
        position: 'relative',
      }}
    >
      <SlidersHorizontal size={13} color={active ? '#0284C7' : '#475569'} />
      {active && (
        <div style={{
          position: 'absolute', top: -3, right: -3,
          width: 7, height: 7, borderRadius: '50%',
          background: '#0EA5E9', border: '1.5px solid #fff',
        }} />
      )}
    </button>
  );
}

// ─── ViewTab ──────────────────────────────────────────────────────────────────

interface ViewTabProps {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: ReactNode;
}

function ViewTab({ active, onClick, label, icon }: ViewTabProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        height: 34, padding: '0 12px',
        backgroundColor: active ? '#FFFFFF' : 'transparent',
        color: active ? '#0F172A' : '#475569',
        fontWeight: active ? 500 : 400,
        border: 'none', borderRadius: 6,
        fontSize: 12, cursor: 'pointer',
        boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
        fontFamily: 'inherit', transition: 'all 150ms',
        whiteSpace: 'nowrap',
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
