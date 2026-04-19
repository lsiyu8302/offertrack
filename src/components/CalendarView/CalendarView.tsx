import { useState } from 'react';
import {
  addMonths,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Job } from '../../types';

// ─── Event generation ─────────────────────────────────────────────────────────

interface CalEvent {
  job: Job;
  label: string;
  color: string;
}

type DayMap = Map<string, CalEvent[]>;

function eventColor(dateStr: string): string {
  const days = differenceInCalendarDays(
    startOfDay(parseISO(dateStr.slice(0, 10))),
    startOfDay(new Date()),
  );
  if (days < 0) return '#94A3B8';
  if (days <= 3) return '#DC2626';
  if (days <= 7) return '#F59E0B';
  return '#0EA5E9';
}

function buildDayMap(jobs: Job[]): DayMap {
  const map: DayMap = new Map();

  function add(dateKey: string, ev: CalEvent) {
    if (!map.has(dateKey)) map.set(dateKey, []);
    map.get(dateKey)!.push(ev);
  }

  for (const job of jobs) {
    if (job.status === 'wishlist' && job.deadline) {
      add(job.deadline.slice(0, 10), {
        job,
        label: `${job.company} 网申`,
        color: eventColor(job.deadline),
      });
    }
    if (job.status === 'oa' && job.oaDeadline) {
      add(job.oaDeadline.slice(0, 10), {
        job,
        label: `${job.company} OA`,
        color: eventColor(job.oaDeadline),
      });
    }
    for (const iv of job.interviews ?? []) {
      const key = iv.date.slice(0, 10);
      add(key, {
        job,
        label: `${job.company} ${iv.round}`,
        color: eventColor(iv.date),
      });
    }
    if (job.status === 'offer' && job.offerDeadline) {
      add(job.offerDeadline.slice(0, 10), {
        job,
        label: `${job.company} Offer截止`,
        color: eventColor(job.offerDeadline),
      });
    }
  }

  return map;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WEEK_LABELS = ['一', '二', '三', '四', '五', '六', '日'];

// ─── Sub-components ───────────────────────────────────────────────────────────

function NavBtn({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 26,
        height: 26,
        borderRadius: 6,
        border: '0.5px solid #E2E8F0',
        background: hov ? '#F1F5F9' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: 0,
        transition: 'background 150ms',
      }}
    >
      {children}
    </button>
  );
}

// ─── CalendarView ─────────────────────────────────────────────────────────────

interface Props {
  jobs: Job[];
  onJobClick: (job: Job) => void;
}

export function CalendarView({ jobs, onJobClick }: Props) {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));

  const dayMap = buildDayMap(jobs);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return (
    <div>
      {/* ── Control bar ────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        {/* Left: prev/title/next + today */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <NavBtn onClick={() => setCurrentMonth((m) => addMonths(m, -1))}>
            <ChevronLeft size={13} color="#475569" />
          </NavBtn>
          <span style={{ fontSize: 16, fontWeight: 500, color: '#0F172A', minWidth: 96, textAlign: 'center' }}>
            {format(currentMonth, 'yyyy年M月')}
          </span>
          <NavBtn onClick={() => setCurrentMonth((m) => addMonths(m, 1))}>
            <ChevronRight size={13} color="#475569" />
          </NavBtn>
          <TodayBtn onClick={() => setCurrentMonth(startOfMonth(new Date()))} />
        </div>

        {/* Right: legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {[
            { color: '#DC2626', label: '紧急' },
            { color: '#F59E0B', label: '临近' },
            { color: '#0EA5E9', label: '一般' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
              <span style={{ fontSize: 11, color: '#475569' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Calendar grid ──────────────────────────────────────────── */}
      <div
        style={{
          border: '0.5px solid #E2E8F0',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        {/* Week-day header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#F8FAFC' }}>
          {WEEK_LABELS.map((d) => (
            <div
              key={d}
              style={{
                textAlign: 'center',
                fontSize: 11,
                color: '#475569',
                padding: 8,
                borderRight: '0.5px solid #E2E8F0',
                borderBottom: '0.5px solid #E2E8F0',
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {allDays.map((day) => {
            const key = format(day, 'yyyy-MM-dd');
            const inMonth = isSameMonth(day, currentMonth);
            const todayFlag = isToday(day);
            const events = dayMap.get(key) ?? [];
            const shown = events.slice(0, 3);
            const extra = events.length - shown.length;

            return (
              <div
                key={key}
                style={{
                  minHeight: 72,
                  padding: 6,
                  background: todayFlag ? '#F0F9FF' : '#fff',
                  borderRight: '0.5px solid #E2E8F0',
                  borderBottom: '0.5px solid #E2E8F0',
                  boxSizing: 'border-box',
                }}
              >
                {/* Date number */}
                <div style={{ marginBottom: 3 }}>
                  {todayFlag ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: '#0EA5E9',
                        color: '#fff',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 500,
                      }}
                    >
                      {format(day, 'd')}
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: 11,
                        color: inMonth ? '#0F172A' : '#94A3B8',
                        lineHeight: '20px',
                      }}
                    >
                      {format(day, 'd')}
                    </span>
                  )}
                </div>

                {/* Event chips */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {shown.map((ev, i) => (
                    <button
                      key={i}
                      onClick={() => onJobClick(ev.job)}
                      title={ev.label}
                      style={{
                        display: 'block',
                        width: '100%',
                        height: 14,
                        padding: '0 4px',
                        borderRadius: 3,
                        background: ev.color,
                        color: '#fff',
                        fontSize: 9,
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontFamily: 'inherit',
                        fontWeight: 500,
                        lineHeight: '14px',
                      }}
                    >
                      {ev.label}
                    </button>
                  ))}
                  {extra > 0 && (
                    <div style={{ fontSize: 9, color: '#94A3B8', paddingLeft: 4, lineHeight: '14px' }}>
                      +{extra} 条
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TodayBtn({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        height: 26,
        padding: '0 10px',
        borderRadius: 6,
        border: '0.5px solid #E2E8F0',
        background: hov ? '#F1F5F9' : 'transparent',
        fontSize: 11,
        color: '#475569',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'background 150ms',
      }}
    >
      今天
    </button>
  );
}
