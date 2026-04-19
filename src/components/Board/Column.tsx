import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus } from 'lucide-react';
import type { Job, SortMode, Status } from '../../types';
import { JobCard } from '../Card/JobCard';
import { SortModeDropdown } from './SortModeDropdown';

// ─── SortableJobCard ────────────────────────────────────────────────────────

interface SortableJobCardProps {
  job: Job;
  onCardClick: (job: Job) => void;
}

function SortableJobCard({ job, onCardClick }: SortableJobCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
        touchAction: 'none',
      }}
      {...attributes}
      {...listeners}
    >
      <JobCard job={job} onClick={() => onCardClick(job)} />
    </div>
  );
}

// ─── Column ─────────────────────────────────────────────────────────────────

const EMPTY_MESSAGES: Partial<Record<Status, string>> = {
  wishlist: '还没有心仪的公司',
  applied: '还没有投递记录',
  oa: '暂无待做的笔试',
  interview: '暂无面试安排',
  offer: '还在努力中，加油 ✦',
};

interface ColumnProps {
  statusId: Status;
  title: string;
  dotColor: string;
  jobs: Job[];
  sortMode: SortMode;
  isOver?: boolean;
  onCardClick: (job: Job) => void;
  onAddClick: () => void;
  onSortModeChange: (mode: SortMode) => void;
  onCompareOffers?: () => void;
}

export function Column({
  statusId,
  title,
  dotColor,
  jobs,
  sortMode,
  isOver = false,
  onCardClick,
  onAddClick,
  onSortModeChange,
  onCompareOffers,
}: ColumnProps) {
  const { setNodeRef } = useDroppable({ id: statusId });

  const sortedIds = jobs.map((j) => j.id);
  const emptyMsg = EMPTY_MESSAGES[statusId];
  const showCompare = statusId === 'offer' && jobs.length >= 2 && !!onCompareOffers;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>

      {/* Column header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 4,
        paddingRight: 4,
        marginBottom: 12,
      }}>
        {/* Left: dot + title + count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            backgroundColor: dotColor, flexShrink: 0,
          }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: '#0F172A', whiteSpace: 'nowrap' }}>
            {title}
          </span>
          <span style={{ fontSize: 11, color: '#94A3B8' }}>{jobs.length}</span>
        </div>

        {/* Right: compare (offer only) + sort + add */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {showCompare && (
            <CompareBtn onClick={onCompareOffers!} />
          )}
          <SortModeDropdown value={sortMode} onChange={onSortModeChange} />
          <button
            onClick={onAddClick}
            aria-label={`在${title}新增申请`}
            style={{
              width: 18, height: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: '0.5px solid #E2E8F0',
              borderRadius: 6, cursor: 'pointer', color: '#94A3B8',
              padding: 0, flexShrink: 0,
            }}
          >
            <Plus size={11} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Card list — droppable + sortable */}
      <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            minHeight: 48,
            borderRadius: 8,
            backgroundColor: isOver ? '#F1F5F9' : 'transparent',
            transition: 'background-color 150ms ease-out',
            padding: isOver ? '4px 4px' : '0px',
          }}
        >
          {jobs.length === 0 ? (
            <div>
              {emptyMsg && (
                <div style={{
                  fontSize: 11, color: '#94A3B8',
                  textAlign: 'center', padding: '16px 8px 8px',
                  lineHeight: 1.6,
                }}>
                  {emptyMsg}
                </div>
              )}
              <DashedAddBtn onClick={onAddClick} />
            </div>
          ) : null}
          {jobs.map((job) => (
            <SortableJobCard key={job.id} job={job} onCardClick={onCardClick} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

// ─── Dashed add placeholder ───────────────────────────────────────────────────

function DashedAddBtn({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      aria-label="新增申请"
      style={{
        width: '100%', height: 36,
        border: `1px dashed ${hov ? '#CBD5E1' : '#E2E8F0'}`,
        borderRadius: 8,
        background: 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        color: hov ? '#475569' : '#94A3B8',
        transition: 'border-color 150ms, color 150ms',
      }}
    >
      <Plus size={12} strokeWidth={1.5} />
    </button>
  );
}

// ─── Compare button ───────────────────────────────────────────────────────────

function CompareBtn({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        height: 18, padding: '0 6px',
        borderRadius: 6,
        border: '0.5px solid #E2E8F0',
        background: hov ? '#F1F5F9' : 'transparent',
        fontSize: 10, color: '#475569',
        cursor: 'pointer', fontFamily: 'inherit',
        whiteSpace: 'nowrap',
        transition: 'background 150ms',
      }}
    >
      对比
    </button>
  );
}
