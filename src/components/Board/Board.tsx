import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import type { Job, Status, SortMode, ClosedReason } from '../../types';
import { STATUS_COLUMNS } from '../../lib/constants';
import { sortColumn } from '../../lib/sorting';
import { Column } from './Column';
import { JobCard } from '../Card/JobCard';
import { ClosedReasonModal } from './ClosedReasonModal';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const COLUMN_IDS = new Set<string>(STATUS_COLUMNS.map((c) => c.id));

function resolveColumnId(id: UniqueIdentifier, jobs: Job[]): Status | null {
  const str = id as string;
  if (COLUMN_IDS.has(str)) return str as Status;
  return jobs.find((j) => j.id === str)?.status ?? null;
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onNewJob }: { onNewJob: () => void }) {
  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '80px 20px', textAlign: 'center',
      }}
    >
      {/* Envelope SVG */}
      <svg width="72" height="56" viewBox="0 0 72 56" fill="none">
        <rect x="4" y="4" width="64" height="48" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
        <path d="M4 12 L36 34 L68 12" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M4 52 L26 32" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M68 52 L46 32" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="36" cy="24" r="10" fill="#E0F2FE" />
        <path d="M32 24 L35 27 L40 21" stroke="#0284C7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <div style={{ fontSize: 15, fontWeight: 500, color: '#0F172A', marginTop: 20 }}>
        开始追踪你的第一家公司吧
      </div>
      <div style={{ fontSize: 12, color: '#475569', marginTop: 6, lineHeight: 1.6 }}>
        记录申请进展、截止日期和面试安排，不遗漏任何机会
      </div>

      <button
        onClick={onNewJob}
        style={{
          marginTop: 22, height: 36, padding: '0 24px',
          borderRadius: 999, border: 'none',
          background: '#0EA5E9', color: '#fff',
          fontSize: 12, fontWeight: 500,
          cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', gap: 6,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#0284C7')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '#0EA5E9')}
      >
        <Plus size={13} strokeWidth={2.5} />
        新增申请
      </button>
    </div>
  );
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface BoardProps {
  jobs: Job[];
  allJobsCount: number;
  sortModes: Record<Status, SortMode>;
  moveJob: (id: string, newStatus: Status, closedReason?: ClosedReason) => void;
  reorderJobs: (status: Status, orderedIds: string[]) => void;
  onCardClick: (job: Job) => void;
  onAddClick: (status: Status) => void;
  onSortModeChange: (status: Status, mode: SortMode) => void;
  onCompareOffers?: () => void;
}

// ─── Board ───────────────────────────────────────────────────────────────────

export function Board({
  jobs,
  allJobsCount,
  sortModes,
  moveJob,
  reorderJobs,
  onCardClick,
  onAddClick,
  onSortModeChange,
  onCompareOffers,
}: BoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<Status | null>(null);
  const [pendingMove, setPendingMove] = useState<{
    jobId: string;
    targetStatus: Status;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const activeJob = activeId ? (jobs.find((j) => j.id === activeId) ?? null) : null;

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string);
  }

  function handleDragOver({ over }: DragOverEvent) {
    if (!over) { setOverColumnId(null); return; }
    setOverColumnId(resolveColumnId(over.id, jobs));
  }

  function handleDragCancel() {
    setActiveId(null);
    setOverColumnId(null);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    setOverColumnId(null);

    if (!over) return;

    const dragged = jobs.find((j) => j.id === active.id);
    if (!dragged) return;

    const targetStatus = resolveColumnId(over.id, jobs);
    if (!targetStatus) return;

    const sourceStatus = dragged.status;

    if (sourceStatus === targetStatus) {
      if (active.id === over.id) return;

      const colJobs = sortColumn(
        jobs.filter((j) => j.status === sourceStatus),
        sortModes[sourceStatus] ?? 'smart',
        sourceStatus,
      );

      const oldIndex = colJobs.findIndex((j) => j.id === active.id);
      const newIndex = COLUMN_IDS.has(over.id as string)
        ? colJobs.length - 1
        : colJobs.findIndex((j) => j.id === over.id);

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

      const reordered = arrayMove(colJobs, oldIndex, newIndex);
      reorderJobs(sourceStatus, reordered.map((j) => j.id));
      onSortModeChange(sourceStatus, 'manual');
      return;
    }

    if (targetStatus === 'closed') {
      setPendingMove({ jobId: active.id as string, targetStatus });
    } else {
      moveJob(active.id as string, targetStatus);
    }
  }

  // Show empty state when no jobs exist at all (not just filtered out)
  if (allJobsCount === 0) {
    return <EmptyState onNewJob={() => onAddClick('wishlist')} />;
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
      >
        <div style={{ overflowX: 'auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
            gap: 10,
            alignItems: 'start',
            minWidth: 960,
          }}>
            {STATUS_COLUMNS.map((col) => {
              const colJobs = jobs.filter((j) => j.status === col.id);
              const sorted = sortColumn(colJobs, sortModes[col.id] ?? 'smart', col.id);
              const isOver = overColumnId === col.id && activeJob?.status !== col.id;
              return (
                <Column
                  key={col.id}
                  statusId={col.id}
                  title={col.label}
                  dotColor={col.dotColor}
                  jobs={sorted}
                  sortMode={sortModes[col.id] ?? 'smart'}
                  isOver={isOver}
                  onCardClick={onCardClick}
                  onAddClick={() => onAddClick(col.id)}
                  onSortModeChange={(mode) => onSortModeChange(col.id, mode)}
                  onCompareOffers={col.id === 'offer' ? onCompareOffers : undefined}
                />
              );
            })}
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeJob ? (
            <div style={{ opacity: 0.5, transform: 'scale(1.02)', pointerEvents: 'none', width: '100%' }}>
              <JobCard job={activeJob} onClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {pendingMove && (
        <ClosedReasonModal
          onConfirm={(reason) => {
            moveJob(pendingMove.jobId, pendingMove.targetStatus, reason);
            setPendingMove(null);
          }}
          onCancel={() => setPendingMove(null)}
        />
      )}
    </>
  );
}
