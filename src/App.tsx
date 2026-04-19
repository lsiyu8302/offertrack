import './index.css';
import { useEffect, useState } from 'react';
import { format, isAfter, subDays } from 'date-fns';
import { X } from 'lucide-react';
import { useJobs } from './hooks/useJobs';
import { useSettings } from './hooks/useSettings';
import { SAMPLE_JOBS } from './lib/sampleData';
import { getUrgencyLevel } from './lib/urgency';
import { STORAGE_KEYS } from './lib/constants';
import { Layout } from './components/shared/Layout';
import { Header } from './components/shared/Header';
import { UrgentBanner } from './components/UrgentBanner/UrgentBanner';
import { StatsBar } from './components/StatsBar/StatsBar';
import { Board } from './components/Board/Board';
import { CalendarView } from './components/CalendarView/CalendarView';
import { NewJobModal } from './components/NewJobModal/NewJobModal';
import { CardDetailDrawer } from './components/CardDetailDrawer/CardDetailDrawer';
import { FilterPanel, applyFilter, isFilterActive, EMPTY_FILTER } from './components/FilterPanel/FilterPanel';
import { OfferComparator } from './components/OfferComparator/OfferComparator';
import { Onboarding } from './components/shared/Onboarding';
import type { FilterState } from './components/FilterPanel/FilterPanel';
import type { Job, Status } from './types';

// ─── Modal state ──────────────────────────────────────────────────────────────

interface ModalState {
  open: boolean;
  mode: 'create' | 'edit';
  initialData?: Job;
  defaultStatus?: Status;
}

const CLOSED_MODAL: ModalState = { open: false, mode: 'create' };

// ─── Import confirm modal ─────────────────────────────────────────────────────

interface ImportPayload { jobs: Job[] }

function ImportConfirmModal({
  payload,
  onMerge,
  onOverwrite,
  onCancel,
}: {
  payload: ImportPayload;
  onMerge: () => void;
  onOverwrite: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onCancel]);

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        style={{ background: '#fff', borderRadius: 12, padding: 22, width: 360, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', animation: 'modalIn 200ms ease-out' }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 16, fontWeight: 500, color: '#0F172A', marginBottom: 8 }}>导入数据</div>
        <div style={{ fontSize: 13, color: '#475569', marginBottom: 20, lineHeight: 1.6 }}>
          检测到 <strong style={{ color: '#0F172A' }}>{payload.jobs.length}</strong> 条申请记录。请选择导入方式：
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={onMerge} style={{ height: 36, borderRadius: 8, border: '0.5px solid #E2E8F0', background: '#F8FAFC', fontSize: 13, color: '#0F172A', cursor: 'pointer', fontFamily: 'inherit' }}>
            合并数据（保留现有 + 导入新增）
          </button>
          <button onClick={onOverwrite} style={{ height: 36, borderRadius: 8, border: '0.5px solid #FCA5A5', background: '#FEF2F2', fontSize: 13, color: '#DC2626', cursor: 'pointer', fontFamily: 'inherit' }}>
            覆盖数据（清空现有数据）
          </button>
          <button onClick={onCancel} style={{ height: 36, borderRadius: 8, border: '0.5px solid #E2E8F0', background: 'transparent', fontSize: 13, color: '#475569', cursor: 'pointer', fontFamily: 'inherit' }}>
            取消
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  const {
    jobs, importJobs, addJob, updateJob, deleteJob, moveJob, reorderJobs,
  } = useJobs();
  const {
    settings, setView, setColumnSortMode,
    addComparisonDimension, removeComparisonDimension, setOnboarded,
  } = useSettings();

  const [modal, setModal] = useState<ModalState>(CLOSED_MODAL);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [filter, setFilter] = useState<FilterState>(EMPTY_FILTER);
  const [search, setSearch] = useState('');
  const [importPayload, setImportPayload] = useState<ImportPayload | null>(null);
  const [comparatorOpen, setComparatorOpen] = useState(false);

  // Auto-load sample data on first visit
  useEffect(() => {
    if (jobs.length === 0) importJobs(SAMPLE_JOBS, false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const urgentCount = jobs.filter((j) => getUrgencyLevel(j) === 'urgent').length;
  const hasRecentOffer = jobs.some(
    (j) =>
      j.status === 'offer' &&
      j.offerReceivedDate &&
      isAfter(new Date(j.offerReceivedDate), subDays(new Date(), 7)),
  );

  // ── Filtered jobs ────────────────────────────────────────────────────────

  const filteredJobs = applyFilter(jobs, filter, search);
  const hasFilter = isFilterActive(filter) || search !== '';

  // ── Modal helpers ────────────────────────────────────────────────────────

  function openCreate(defaultStatus?: Status) {
    setModal({ open: true, mode: 'create', defaultStatus });
  }

  function openEdit(job: Job) {
    setModal({ open: true, mode: 'edit', initialData: job });
  }

  function closeModal() { setModal(CLOSED_MODAL); }

  // ── Export ───────────────────────────────────────────────────────────────

  function handleExport() {
    const payload = JSON.stringify({ version: '1', jobs, settings }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `offertrack-backup-${format(new Date(), 'yyyyMMdd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Import ───────────────────────────────────────────────────────────────

  function handleImportFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = JSON.parse(e.target?.result as string);
        const parsed: Job[] = Array.isArray(raw) ? raw : (raw.jobs ?? []);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          alert('文件格式不正确或无有效数据。');
          return;
        }
        setImportPayload({ jobs: parsed });
      } catch {
        alert('读取文件失败，请确认是有效的 JSON 文件。');
      }
    };
    reader.readAsText(file);
  }

  function handleImportMerge() {
    if (!importPayload) return;
    importJobs(importPayload.jobs, true);
    setImportPayload(null);
  }

  function handleImportOverwrite() {
    if (!importPayload) return;
    importJobs(importPayload.jobs, false);
    setImportPayload(null);
    window.location.reload();
  }

  // ── Clear ────────────────────────────────────────────────────────────────

  function handleClearAll() {
    if (window.confirm('确认清空所有数据？这将删除所有申请记录和设置，操作不可撤销。')) {
      localStorage.removeItem(STORAGE_KEYS.jobs);
      localStorage.removeItem(STORAGE_KEYS.settings);
      window.location.reload();
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  const offerJobs = jobs.filter((j) => j.status === 'offer');

  return (
    <Layout>
      <Header
        urgentCount={urgentCount}
        hasRecentOffer={hasRecentOffer}
        totalCount={jobs.length}
        view={settings.view}
        onViewChange={setView}
        onNewJob={() => openCreate()}
        searchValue={search}
        onSearch={setSearch}
        filterActive={isFilterActive(filter)}
        onFilterClick={() => { setSelectedJob(null); setFilterPanelOpen(true); }}
        onExport={handleExport}
        onImportFile={handleImportFile}
        onClearAll={handleClearAll}
      />

      <div style={{ marginTop: 18 }}>
        <UrgentBanner
          jobs={jobs}
          onViewAll={() => {
            setFilter((prev) => ({ ...prev, urgencies: ['urgent'] }));
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>

      <div style={{ marginTop: 14 }}>
        <StatsBar jobs={jobs} onUrgentClick={() => {}} />
      </div>

      {/* Active filter badge */}
      {hasFilter && (
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#475569' }}>
            已筛选：<strong style={{ color: '#0F172A' }}>{filteredJobs.length}</strong> 条
          </span>
          <button
            onClick={() => { setFilter(EMPTY_FILTER); setSearch(''); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 3,
              height: 22, padding: '0 8px', borderRadius: 999,
              border: '0.5px solid #E2E8F0', background: '#F8FAFC',
              fontSize: 11, color: '#475569', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <X size={10} />
            清除
          </button>
        </div>
      )}

      <div style={{ marginTop: hasFilter ? 12 : 20 }}>
        {settings.view === 'kanban' ? (
          <Board
            jobs={filteredJobs}
            allJobsCount={jobs.length}
            sortModes={settings.columnSortModes}
            moveJob={moveJob}
            reorderJobs={reorderJobs}
            onCardClick={(job) => setSelectedJob(job)}
            onAddClick={(status) => openCreate(status)}
            onSortModeChange={setColumnSortMode}
            onCompareOffers={offerJobs.length >= 2 ? () => setComparatorOpen(true) : undefined}
          />
        ) : (
          <CalendarView
            jobs={filteredJobs}
            onJobClick={(job) => setSelectedJob(job)}
          />
        )}
      </div>

      {/* ── Modals & panels ────────────────────────────────────────────── */}

      <NewJobModal
        open={modal.open}
        mode={modal.mode}
        initialData={modal.initialData}
        defaultStatus={modal.defaultStatus}
        onClose={closeModal}
        onSave={(data) => {
          if (modal.mode === 'create') {
            addJob({
              company: data.company,
              position: data.position,
              city: data.city,
              salary: data.salary,
              status: data.status,
              industry: data.industry,
              deadline: data.deadline,
            });
          } else if (modal.mode === 'edit' && modal.initialData) {
            updateJob(modal.initialData.id, {
              company: data.company,
              position: data.position,
              city: data.city,
              salary: data.salary,
              status: data.status,
              industry: data.industry,
              deadline: data.deadline,
            });
            setSelectedJob((prev) =>
              prev?.id === modal.initialData!.id
                ? { ...prev, company: data.company, position: data.position, city: data.city, salary: data.salary, status: data.status, industry: data.industry, deadline: data.deadline }
                : prev,
            );
          }
          closeModal();
        }}
      />

      <CardDetailDrawer
        job={selectedJob}
        open={selectedJob !== null && !modal.open}
        onClose={() => setSelectedJob(null)}
        onEdit={(job) => openEdit(job)}
        onDelete={(id) => { deleteJob(id); setSelectedJob(null); }}
        onUpdate={(id, patch) => {
          updateJob(id, patch);
          setSelectedJob((prev) => (prev?.id === id ? { ...prev, ...patch } : prev));
        }}
      />

      <FilterPanel
        open={filterPanelOpen}
        onClose={() => setFilterPanelOpen(false)}
        jobs={jobs}
        filter={filter}
        onApply={(f) => setFilter(f)}
      />

      <OfferComparator
        open={comparatorOpen}
        onClose={() => setComparatorOpen(false)}
        offers={offerJobs}
        dimensions={settings.customComparisonDimensions}
        onUpdateJob={(id, patch) => updateJob(id, patch)}
        onAddDimension={addComparisonDimension}
        onRemoveDimension={removeComparisonDimension}
      />

      {importPayload && (
        <ImportConfirmModal
          payload={importPayload}
          onMerge={handleImportMerge}
          onOverwrite={handleImportOverwrite}
          onCancel={() => setImportPayload(null)}
        />
      )}

      {!settings.onboarded && (
        <Onboarding
          onComplete={() => setOnboarded(true)}
          onClearSampleData={() => {
            importJobs([], false);
            setOnboarded(true);
          }}
        />
      )}
    </Layout>
  );
}

export default App;
