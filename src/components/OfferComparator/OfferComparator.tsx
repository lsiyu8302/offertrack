import { useEffect, useRef, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { X, Plus, Check } from 'lucide-react';
import { getDaysRemaining } from '../../lib/urgency';
import type { Job } from '../../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getScore(job: Job, dim: string): number {
  return job.offerComparison?.scores?.[dim] ?? 0;
}

function getTotalScore(job: Job, dims: string[]): number {
  return dims.reduce((sum, dim) => sum + getScore(job, dim), 0);
}

// ─── Score dots ───────────────────────────────────────────────────────────────

function ScoreDots({
  score,
  onChange,
}: {
  score: number;
  onChange: (n: number) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 5, justifyContent: 'center', alignItems: 'center' }}>
      {Array.from({ length: 5 }, (_, i) => {
        const val = i + 1;
        const filled = val <= score;
        return (
          <button
            key={i}
            onClick={() => onChange(score === val ? 0 : val)}
            title={`${val} 分`}
            style={{
              width: 11,
              height: 11,
              borderRadius: '50%',
              background: filled ? '#F59E0B' : 'transparent',
              border: filled ? 'none' : '1.5px solid #CBD5E1',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 120ms',
              flexShrink: 0,
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Deadline badge ───────────────────────────────────────────────────────────

function DeadlineCell({ dateStr }: { dateStr?: string }) {
  if (!dateStr) return <span style={{ fontSize: 12, color: '#94A3B8' }}>—</span>;
  const days = getDaysRemaining(dateStr);
  const label = format(parseISO(dateStr), 'M月d日');
  const badge =
    days < 0
      ? { text: '已过期', bg: '#F1F5F9', color: '#94A3B8' }
      : days <= 3
        ? { text: `剩 ${days} 天`, bg: '#FEE2E2', color: '#991B1B' }
        : days <= 7
          ? { text: `剩 ${days} 天`, bg: '#FEF3C7', color: '#92400E' }
          : { text: `剩 ${days} 天`, bg: '#E0F2FE', color: '#0C4A6E' };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 12, color: '#0F172A' }}>{label}</span>
      <span style={{ fontSize: 10, fontWeight: 500, background: badge.bg, color: badge.color, borderRadius: 4, padding: '1px 5px' }}>
        {badge.text}
      </span>
    </div>
  );
}

// ─── Grid cell primitives ─────────────────────────────────────────────────────

function LabelCell({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: '#F8FAFC',
        padding: '10px 12px',
        fontSize: 13,
        color: '#475569',
        display: 'flex',
        alignItems: 'center',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function DataCell({
  children,
  bg,
  center,
  style,
}: {
  children: React.ReactNode;
  bg: string;
  center?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: bg,
        padding: '10px 12px',
        fontSize: 12,
        color: '#0F172A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: center ? 'center' : 'center',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Select step ──────────────────────────────────────────────────────────────

function SelectStep({
  offers,
  selectedIds,
  onToggle,
  onContinue,
}: {
  offers: Job[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onContinue: () => void;
}) {
  return (
    <div>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: '#475569' }}>
        选择 2-4 个 Offer 进行对比：
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {offers.map((offer) => {
          const checked = selectedIds.includes(offer.id);
          const disabled = !checked && selectedIds.length >= 4;
          return (
            <button
              key={offer.id}
              onClick={() => !disabled && onToggle(offer.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 8,
                border: checked ? '1px solid #0EA5E9' : '0.5px solid #E2E8F0',
                background: checked ? '#F0F9FF' : '#fff',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                textAlign: 'left',
                fontFamily: 'inherit',
                transition: 'all 150ms',
              }}
            >
              <div
                style={{
                  width: 16, height: 16, borderRadius: 3, flexShrink: 0,
                  background: checked ? '#0EA5E9' : '#fff',
                  border: checked ? 'none' : '1px solid #CBD5E1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {checked && <Check size={10} color="#fff" />}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#0F172A' }}>{offer.company}</div>
                <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
                  {offer.position}{offer.city ? ` · ${offer.city}` : ''}
                  {offer.salary ? ` · ${offer.salary}` : ''}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={onContinue}
          disabled={selectedIds.length < 2}
          style={{
            height: 34, padding: '0 24px', borderRadius: 999,
            background: selectedIds.length >= 2 ? '#0EA5E9' : '#CBD5E1',
            color: '#fff', border: 'none', fontSize: 12, fontWeight: 500,
            cursor: selectedIds.length >= 2 ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
          }}
        >
          继续对比 ({selectedIds.length}/4)
        </button>
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  offers: Job[];
  dimensions: string[];
  onUpdateJob: (id: string, patch: Partial<Job>) => void;
  onAddDimension: (dim: string) => void;
  onRemoveDimension: (dim: string) => void;
}

// ─── OfferComparator ─────────────────────────────────────────────────────────

export function OfferComparator({
  open,
  onClose,
  offers,
  dimensions,
  onUpdateJob,
  onAddDimension,
  onRemoveDimension,
}: Props) {
  const [step, setStep] = useState<'select' | 'compare'>('select');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [addingDim, setAddingDim] = useState(false);
  const [newDimName, setNewDimName] = useState('');
  const dimInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (offers.length <= 4) {
      setSelectedIds(offers.map((j) => j.id));
      setStep('compare');
    } else {
      setSelectedIds([]);
      setStep('select');
    }
    setAddingDim(false);
    setNewDimName('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);

  useEffect(() => {
    if (addingDim) dimInputRef.current?.focus();
  }, [addingDim]);

  if (!open) return null;

  const selectedOffers = offers.filter((j) => selectedIds.includes(j.id));
  const n = selectedOffers.length;

  const totals = selectedOffers.map((j) => getTotalScore(j, dimensions));
  const maxTotal = Math.max(...totals, 0);
  const bestIndex = maxTotal > 0 ? totals.indexOf(maxTotal) : -1;

  function cellBg(i: number) {
    return i === bestIndex ? '#F0F9FF' : '#fff';
  }

  function handleScoreChange(jobId: string, dim: string, score: number) {
    const job = offers.find((j) => j.id === jobId);
    if (!job) return;
    onUpdateJob(jobId, {
      offerComparison: {
        ...job.offerComparison,
        scores: { ...job.offerComparison?.scores, [dim]: score },
      },
    });
  }

  function handleAddDim() {
    const name = newDimName.trim();
    if (!name) return;
    onAddDimension(name);
    setNewDimName('');
    setAddingDim(false);
  }

  // ─── Build grid cells ──────────────────────────────────────────────────────

  const gridCols = `110px repeat(${n}, 1fr)`;

  const gridCells: React.ReactNode[] = [];

  // Header row
  gridCells.push(
    <div key="h-label" style={{ background: '#F8FAFC', padding: '12px 12px' }} />,
  );
  selectedOffers.forEach((offer, i) => {
    const isBest = i === bestIndex;
    gridCells.push(
      <div
        key={`h-${offer.id}`}
        style={{
          background: isBest ? '#F0F9FF' : '#fff',
          padding: '12px 12px',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {isBest && (
          <span
            style={{
              position: 'absolute',
              top: 6,
              right: 8,
              fontSize: 9,
              fontWeight: 500,
              background: '#0EA5E9',
              color: '#fff',
              borderRadius: 999,
              padding: '2px 6px',
              lineHeight: 1.4,
            }}
          >
            推荐
          </span>
        )}
        <div style={{ fontSize: 13, fontWeight: 500, color: '#0F172A' }}>{offer.company}</div>
        <div style={{ fontSize: 11, color: '#475569', marginTop: 3 }}>{offer.position}</div>
      </div>,
    );
  });

  // Fixed rows
  const fixedRows: Array<{ label: string; render: (o: Job) => React.ReactNode }> = [
    { label: '城市', render: (o) => o.city || '—' },
    { label: '薪资', render: (o) => o.salary || '—' },
    { label: '截止日期', render: (o) => <DeadlineCell dateStr={o.offerDeadline} /> },
  ];

  fixedRows.forEach(({ label, render }, ri) => {
    gridCells.push(<LabelCell key={`fr-${ri}`}>{label}</LabelCell>);
    selectedOffers.forEach((o, i) => {
      gridCells.push(
        <DataCell key={`fr-${ri}-${o.id}`} bg={cellBg(i)} center>
          {render(o)}
        </DataCell>,
      );
    });
  });

  // Separator
  gridCells.push(
    <div key="sep1" style={{ gridColumn: '1 / -1', height: 8, background: '#F8FAFC' }} />,
  );

  // Dimension rows
  dimensions.forEach((dim) => {
    gridCells.push(
      <LabelCell key={`dim-l-${dim}`} style={{ justifyContent: 'space-between' }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {dim}
        </span>
        <button
          onClick={() => onRemoveDimension(dim)}
          aria-label={`删除维度${dim}`}
          style={{
            width: 16, height: 16, borderRadius: 4, border: 'none',
            background: 'transparent', color: '#94A3B8',
            cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#DC2626')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
        >
          <X size={10} />
        </button>
      </LabelCell>,
    );
    selectedOffers.forEach((o, i) => {
      gridCells.push(
        <DataCell key={`dim-${dim}-${o.id}`} bg={cellBg(i)} center>
          <ScoreDots score={getScore(o, dim)} onChange={(s) => handleScoreChange(o.id, dim, s)} />
        </DataCell>,
      );
    });
  });

  // Add dimension inline input row
  if (addingDim) {
    gridCells.push(
      <div
        key="add-dim-row"
        style={{
          gridColumn: '1 / -1',
          background: '#F8FAFC',
          padding: '8px 12px',
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}
      >
        <input
          ref={dimInputRef}
          value={newDimName}
          onChange={(e) => setNewDimName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddDim();
            if (e.key === 'Escape') { setAddingDim(false); setNewDimName(''); }
          }}
          placeholder="输入维度名称（如：晋升空间）"
          style={{
            flex: 1, height: 28, border: '1px solid #0EA5E9',
            borderRadius: 6, padding: '0 8px', fontSize: 12,
            fontFamily: 'inherit', outline: 'none',
            boxShadow: '0 0 0 3px rgba(14,165,233,0.12)',
          }}
        />
        <button
          onClick={handleAddDim}
          style={{ height: 28, padding: '0 12px', borderRadius: 6, background: '#0EA5E9', color: '#fff', border: 'none', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          确认
        </button>
        <button
          onClick={() => { setAddingDim(false); setNewDimName(''); }}
          style={{ height: 28, padding: '0 10px', borderRadius: 6, border: '0.5px solid #E2E8F0', background: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: '#475569' }}
        >
          取消
        </button>
      </div>,
    );
  }

  // Separator
  gridCells.push(
    <div key="sep2" style={{ gridColumn: '1 / -1', height: 8, background: '#F8FAFC' }} />,
  );

  // Total row
  gridCells.push(
    <LabelCell key="total-label" style={{ fontWeight: 500, color: '#0F172A', fontSize: 13 }}>
      总分
    </LabelCell>,
  );
  selectedOffers.forEach((o, i) => {
    const total = getTotalScore(o, dimensions);
    const isBest = i === bestIndex;
    gridCells.push(
      <div
        key={`total-${o.id}`}
        style={{
          background: isBest ? '#E0F2FE' : '#F8FAFC',
          padding: '10px 12px',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 500, color: isBest ? '#0C4A6E' : '#0F172A' }}>
          {total}
        </span>
        <span style={{ fontSize: 10, color: '#94A3B8' }}>
          / {dimensions.length * 5}
        </span>
      </div>,
    );
  });

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15,23,42,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, zIndex: 100,
      }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: '#fff', borderRadius: 12,
          width: '100%', maxWidth: 900, maxHeight: '90vh',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
          animation: 'modalIn 200ms ease-out',
          boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div
          style={{
            padding: '18px 22px',
            borderBottom: '0.5px solid #E2E8F0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 500, color: '#0F172A' }}>Offer 对比</div>
            <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
              帮你理清选择，决定权仍在你手中
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {step === 'compare' && (
              <button
                onClick={() => setAddingDim(true)}
                style={{
                  height: 28, padding: '0 10px', borderRadius: 6,
                  border: '0.5px solid #E2E8F0', background: 'transparent',
                  fontSize: 12, color: '#475569', cursor: 'pointer',
                  fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                <Plus size={11} />
                添加维度
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="关闭"
              style={{
                width: 26, height: 26, borderRadius: 6,
                border: '0.5px solid #E2E8F0', background: 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', padding: 0,
              }}
            >
              <X size={13} color="#94A3B8" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
          {step === 'select' ? (
            <SelectStep
              offers={offers}
              selectedIds={selectedIds}
              onToggle={(id) =>
                setSelectedIds((prev) =>
                  prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
                )
              }
              onContinue={() => setStep('compare')}
            />
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: gridCols,
                gap: 1,
                background: '#E2E8F0',
                borderRadius: 8,
                overflow: 'hidden',
                border: '0.5px solid #E2E8F0',
              }}
            >
              {gridCells}
            </div>
          )}
        </div>

        {/* Footer disclaimer */}
        {step === 'compare' && (
          <div
            style={{
              padding: '12px 22px',
              background: '#F8FAFC',
              borderTop: '0.5px solid #E2E8F0',
              flexShrink: 0,
            }}
          >
            <p style={{ margin: 0, fontSize: 11, color: '#475569', lineHeight: 1.6 }}>
              打分只是辅助参考。真正的决定取决于你对自己职业发展的理解 ——
              分数最高的不一定是最适合你的。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
