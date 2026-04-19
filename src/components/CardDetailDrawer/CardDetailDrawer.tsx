import { useEffect, useRef, useState } from 'react';
import { X, Trash2, ExternalLink } from 'lucide-react';
import { differenceInCalendarDays, format, parseISO, startOfDay } from 'date-fns';
import { getRelevantDate, getDaysRemaining, getUrgencyLevel } from '../../lib/urgency';
import { STATUS_COLUMNS, JOB_TYPES } from '../../lib/constants';
import type { Job, Materials, InterviewResult } from '../../types';

interface Props {
  job: Job | null;
  open: boolean;
  onClose: () => void;
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Job>) => void;
}

// ─── Timeline ────────────────────────────────────────────────────────────────

type NodeType = 'completed' | 'upcoming' | 'urgent' | 'failed';

interface TLEvent {
  label: string;
  dateStr: string;
  nodeType: NodeType;
  isDatetime: boolean;
}

function getNodeType(dateStr: string, result?: InterviewResult): NodeType {
  const today = startOfDay(new Date());
  const eventDay = startOfDay(parseISO(dateStr.slice(0, 10)));
  const days = differenceInCalendarDays(eventDay, today);
  if (days < 0) {
    return result === 'failed' ? 'failed' : 'completed';
  }
  if (result === 'failed') return 'failed';
  return days <= 3 ? 'urgent' : 'upcoming';
}

function buildTimeline(job: Job): TLEvent[] {
  const events: TLEvent[] = [];

  if (job.appliedDate) {
    events.push({ label: '投递简历', dateStr: job.appliedDate, nodeType: 'completed', isDatetime: false });
  }
  if (job.oaDeadline) {
    events.push({ label: '笔试截止', dateStr: job.oaDeadline, nodeType: getNodeType(job.oaDeadline), isDatetime: false });
  }
  for (const iv of [...(job.interviews ?? [])].sort((a, b) => a.date.localeCompare(b.date))) {
    events.push({ label: iv.round, dateStr: iv.date, nodeType: getNodeType(iv.date, iv.result), isDatetime: true });
  }
  if (job.offerReceivedDate) {
    events.push({ label: '收到 Offer', dateStr: job.offerReceivedDate, nodeType: 'completed', isDatetime: false });
  }
  if (job.offerDeadline) {
    events.push({ label: '截止接受', dateStr: job.offerDeadline, nodeType: getNodeType(job.offerDeadline), isDatetime: false });
  }
  if (job.closedDate) {
    events.push({ label: '结束', dateStr: job.closedDate, nodeType: 'completed', isDatetime: false });
  }

  events.sort((a, b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime());
  return events;
}

function formatEventDate(dateStr: string, isDatetime: boolean): string {
  try {
    const d = parseISO(dateStr);
    if (isDatetime) {
      const timeStr = format(d, 'HH:mm');
      return timeStr === '00:00' ? format(d, 'M月d日') : format(d, 'M月d日 HH:mm');
    }
    return format(d, 'M月d日');
  } catch {
    return dateStr.slice(0, 10);
  }
}

const NODE_COLORS: Record<NodeType, { border: string; bg: string; solid: boolean }> = {
  completed: { border: '#16A34A', bg: '#fff', solid: false },
  upcoming:  { border: '#0EA5E9', bg: '#0EA5E9', solid: true },
  urgent:    { border: '#DC2626', bg: '#DC2626', solid: true },
  failed:    { border: '#CBD5E1', bg: '#F1F5F9', solid: false },
};

// ─── Urgency alert text ───────────────────────────────────────────────────────

function buildUrgentText(job: Job): string {
  const dateStr = getRelevantDate(job);
  if (!dateStr) return '';
  const days = getDaysRemaining(dateStr);
  const prefix = days === 0 ? '今天' : days === 1 ? '明天' : `还剩 ${days} 天`;

  if (job.status === 'interview') {
    const today = startOfDay(new Date());
    const upcoming = [...(job.interviews ?? [])]
      .filter((i) => i.result !== 'failed')
      .sort((a, b) => a.date.localeCompare(b.date))
      .find((i) => new Date(i.date) >= today);
    if (upcoming) {
      const d = parseISO(upcoming.date);
      const timeStr = format(d, 'HH:mm');
      const showTime = timeStr !== '00:00';
      return `${prefix}${showTime ? ' ' + timeStr : ''}有${upcoming.round}，别忘了准备`;
    }
  }
  if (job.status === 'wishlist') return `${prefix}截止申请，记得提交`;
  if (job.status === 'oa') return `${prefix}笔试截止，抓紧完成`;
  if (job.status === 'offer') return `${prefix}需要决定是否接受 Offer`;
  return '';
}

// ─── Materials ────────────────────────────────────────────────────────────────

const MATERIAL_LABELS: Partial<Record<keyof Materials, string>> = {
  resume: '简历',
  coverLetter: '求职信',
  portfolio: '作品集',
  transcript: '成绩单',
  recommendation: '推荐信',
};
const MATERIAL_ORDER: Array<keyof Materials> = ['resume', 'coverLetter', 'portfolio', 'transcript', 'recommendation'];

type StandardKey = Exclude<keyof Materials, 'custom'>;

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
}

function Checkbox({ checked, onChange }: CheckboxProps) {
  return (
    <button
      onClick={onChange}
      style={{
        width: 14, height: 14, borderRadius: 3, flexShrink: 0,
        border: checked ? 'none' : '1px solid #CBD5E1',
        background: checked ? '#0EA5E9' : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', padding: 0,
      }}
    >
      {checked && (
        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
          <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Overline({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 500, color: '#94A3B8', letterSpacing: '0.5px', marginBottom: 10 }}>
      {children}
    </div>
  );
}

function Section({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ marginTop: 20, ...style }}>{children}</div>;
}

function IconBtn({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      aria-label={label}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 26, height: 26, borderRadius: 6,
        border: '0.5px solid #E2E8F0',
        background: hovered ? '#F1F5F9' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', padding: 0, transition: 'background 150ms',
      }}
    >
      {children}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CardDetailDrawer({ job, open, onClose, onEdit, onDelete, onUpdate }: Props) {
  // Keep last job in ref so content stays visible during slide-out animation
  const lastJobRef = useRef<Job | null>(null);
  if (job) lastJobRef.current = job;
  const dj = job ?? lastJobRef.current; // display job

  const [notesValue, setNotesValue] = useState('');
  const [notesEditing, setNotesEditing] = useState(false);

  // Reset notes when a new job is opened
  useEffect(() => {
    if (job) {
      setNotesValue(job.notes ?? '');
      setNotesEditing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?.id]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!dj) return null;

  const col = STATUS_COLUMNS.find((c) => c.id === dj.status);
  const dotColor = col?.dotColor ?? '#94A3B8';
  const statusLabel = col?.label ?? dj.status;

  const urgencyLevel = getUrgencyLevel(dj);
  const isUrgent = urgencyLevel === 'urgent';
  const urgentText = isUrgent ? buildUrgentText(dj) : '';

  const jobTypeLabel = JOB_TYPES.find((t) => t.value === dj.jobType)?.label ?? dj.jobType ?? '—';

  const timeline = buildTimeline(dj);

  function handleDelete() {
    if (window.confirm(`确认删除"${dj!.company}"的申请记录？此操作不可撤销。`)) {
      onDelete(dj!.id);
      onClose();
    }
  }

  function handleNotesSave() {
    const trimmed = notesValue.trim();
    if (trimmed !== (dj?.notes ?? '').trim()) {
      onUpdate(dj!.id, { notes: trimmed || undefined });
    }
    setNotesEditing(false);
  }

  function toggleMaterial(key: StandardKey) {
    const mat = dj!.materials ?? {};
    const current = mat[key] as { checked: boolean; version?: string } | undefined;
    onUpdate(dj!.id, {
      materials: {
        ...mat,
        [key]: { ...current, checked: !(current?.checked ?? false) },
      },
    });
  }

  function toggleCustomMaterial(index: number) {
    const mat = dj!.materials ?? {};
    const customs = [...(mat.custom ?? [])];
    customs[index] = { ...customs[index], checked: !customs[index].checked };
    onUpdate(dj!.id, { materials: { ...mat, custom: customs } });
  }

  // Collect standard materials to display (only ones present in the job)
  const standardMaterials = MATERIAL_ORDER.filter((k) => k in (dj.materials ?? {})) as StandardKey[];
  const customMaterials = dj.materials?.custom ?? [];
  const hasMaterials = standardMaterials.length > 0 || customMaterials.length > 0;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.20)',
          zIndex: 50,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 200ms',
        }}
      />

      {/* Drawer panel */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0,
          width: 480, height: '100vh',
          background: '#fff',
          borderLeft: '0.5px solid #E2E8F0',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
          zIndex: 51,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 250ms cubic-bezier(0.32, 0.72, 0, 1)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ── Sticky header ──────────────────────────────────────── */}
        <div
          style={{
            flexShrink: 0,
            borderBottom: '0.5px solid #E2E8F0',
            padding: '14px 22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#fff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: '#475569' }}>{statusLabel}</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <IconBtn onClick={handleDelete} label="删除">
              <Trash2 size={13} color="#94A3B8" />
            </IconBtn>
            <IconBtn onClick={onClose} label="关闭">
              <X size={13} color="#94A3B8" />
            </IconBtn>
          </div>
        </div>

        {/* ── Scrollable content ─────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px 36px' }}>

          {/* Company + Position */}
          <div>
            <div style={{ fontSize: 20, fontWeight: 500, color: '#0F172A', lineHeight: 1.4 }}>
              {dj.company}
            </div>
            <div style={{ fontSize: 13, color: '#475569', marginTop: 3 }}>
              {dj.position}
            </div>
          </div>

          {/* Urgency alert */}
          {isUrgent && urgentText && (
            <div
              style={{
                marginTop: 12,
                background: '#FEF2F2',
                border: '0.5px solid #FCA5A5',
                borderRadius: 8,
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
              }}
            >
              <div
                style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#DC2626', flexShrink: 0,
                  animation: 'urgentPulse 2s ease-in-out infinite',
                }}
              />
              <span style={{ fontSize: 12, color: '#475569' }}>{urgentText}</span>
            </div>
          )}

          {/* ── Basic info ────────────────────────────────────────── */}
          <Section>
            <Overline>基本信息</Overline>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '90px 1fr',
                gap: '10px 14px',
                alignItems: 'start',
              }}
            >
              <InfoLabel>岗位</InfoLabel>
              <InfoValue>{dj.position}</InfoValue>

              <InfoLabel>城市</InfoLabel>
              <InfoValue>{dj.city || '—'}</InfoValue>

              <InfoLabel>薪资</InfoLabel>
              <InfoValue>{dj.salary || '—'}</InfoValue>

              <InfoLabel>招聘类型</InfoLabel>
              <InfoValue>{jobTypeLabel}</InfoValue>

              <InfoLabel>行业</InfoLabel>
              <InfoValue>
                {dj.industry ? (
                  <span
                    style={{
                      display: 'inline-block',
                      background: '#E0F2FE',
                      color: '#0C4A6E',
                      borderRadius: 999,
                      padding: '2px 8px',
                      fontSize: 11,
                      fontWeight: 500,
                    }}
                  >
                    {dj.industry}
                  </span>
                ) : (
                  '—'
                )}
              </InfoValue>

              <InfoLabel>JD 链接</InfoLabel>
              <InfoValue>
                {dj.jdLink ? (
                  <a
                    href={dj.jdLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#0284C7',
                      textDecoration: 'underline',
                      fontSize: 13,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                    }}
                  >
                    查看 JD
                    <ExternalLink size={11} />
                  </a>
                ) : (
                  '—'
                )}
              </InfoValue>
            </div>

            {/* Edit button */}
            <button
              onClick={() => onEdit(dj!)}
              style={{
                marginTop: 14,
                fontSize: 12,
                color: '#0284C7',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              编辑基本信息
            </button>
          </Section>

          {/* ── Timeline ─────────────────────────────────────────── */}
          {timeline.length > 0 && (
            <Section>
              <Overline>时间线</Overline>
              <div style={{ position: 'relative', paddingLeft: 20 }}>
                {/* Vertical line */}
                <div
                  style={{
                    position: 'absolute',
                    left: 4,
                    top: 6,
                    bottom: 6,
                    width: 1,
                    background: '#E2E8F0',
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {timeline.map((ev, i) => {
                    const nc = NODE_COLORS[ev.nodeType];
                    const isCurrentOrUrgent = ev.nodeType === 'urgent' || ev.nodeType === 'upcoming';
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                        {/* Node dot */}
                        <div
                          style={{
                            position: 'absolute',
                            left: -20,
                            width: 9,
                            height: 9,
                            borderRadius: '50%',
                            background: nc.solid ? nc.bg : '#fff',
                            border: `1.5px solid ${nc.border}`,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 13,
                            color: ev.nodeType === 'failed' ? '#94A3B8' : '#0F172A',
                            textDecoration: ev.nodeType === 'failed' ? 'line-through' : 'none',
                          }}
                        >
                          {ev.label}
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            color: isCurrentOrUrgent ? (ev.nodeType === 'urgent' ? '#DC2626' : '#0284C7') : '#94A3B8',
                            fontWeight: isCurrentOrUrgent ? 500 : 400,
                            marginLeft: 12,
                            flexShrink: 0,
                          }}
                        >
                          {formatEventDate(ev.dateStr, ev.isDatetime)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Section>
          )}

          {/* ── Materials ────────────────────────────────────────── */}
          {hasMaterials && (
            <Section>
              <Overline>材料清单</Overline>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px 14px',
                }}
              >
                {standardMaterials.map((key) => {
                  const item = dj.materials![key] as { checked: boolean; version?: string } | undefined;
                  const checked = item?.checked ?? false;
                  const label = MATERIAL_LABELS[key] ?? key;
                  const version = key === 'resume' && checked && item?.version ? ` ${item.version}` : '';
                  return (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <Checkbox checked={checked} onChange={() => toggleMaterial(key)} />
                      <span
                        style={{
                          fontSize: 13,
                          color: checked ? '#0F172A' : '#475569',
                        }}
                      >
                        {label}
                        {version && (
                          <span style={{ fontSize: 11, color: '#94A3B8', marginLeft: 3 }}>
                            {version}
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
                {customMaterials.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Checkbox checked={item.checked} onChange={() => toggleCustomMaterial(i)} />
                    <span style={{ fontSize: 13, color: item.checked ? '#0F172A' : '#475569' }}>
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ── Notes ───────────────────────────────────────────── */}
          <Section>
            <Overline>备注</Overline>
            {notesEditing ? (
              <textarea
                autoFocus
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                onBlur={handleNotesSave}
                style={{
                  width: '100%',
                  minHeight: 80,
                  background: '#F8FAFC',
                  border: '1px solid #0EA5E9',
                  boxShadow: '0 0 0 3px rgba(14,165,233,0.15)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  fontSize: 12,
                  color: '#0F172A',
                  lineHeight: 1.6,
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            ) : (
              <div
                onClick={() => setNotesEditing(true)}
                style={{
                  background: '#F8FAFC',
                  borderRadius: 8,
                  padding: '10px 12px',
                  fontSize: 12,
                  color: notesValue ? '#0F172A' : '#94A3B8',
                  lineHeight: 1.6,
                  cursor: 'text',
                  minHeight: 40,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {notesValue || '点击添加备注…'}
              </div>
            )}
          </Section>
        </div>
      </div>
    </>
  );
}

// ─── Small helper components (defined after main to keep code readable) ───────

function InfoLabel({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize: 13, color: '#475569' }}>{children}</span>;
}

function InfoValue({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize: 13, color: '#0F172A' }}>{children}</span>;
}
