import { useState } from 'react';
import { parseISO, format, startOfDay } from 'date-fns';
import type { Job, UrgencyLevel } from '../../types';
import { getUrgencyLevel, getRelevantDate, getDaysRemaining } from '../../lib/urgency';

interface JobCardProps {
  job: Job;
  onClick: () => void;
  dragHandleProps?: Record<string, unknown>;
}

export function JobCard({ job, onClick }: JobCardProps) {
  const [hovered, setHovered] = useState(false);
  const level = getUrgencyLevel(job);

  const isExpired = level === 'expired' || job.status === 'closed';
  const isWarning = level === 'warning';
  const isUrgent = level === 'urgent';
  const hasLeftAccent = isWarning || isUrgent;

  const borderColor = hovered ? '#CBD5E1' : '#E2E8F0';
  const sideBorder = isExpired ? '1px dashed #CBD5E1' : `0.5px solid ${borderColor}`;

  const badge = getBadge(job, level);
  const thirdRow = getThirdRow(job);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: isExpired ? '#F8FAFC' : '#FFFFFF',
        borderTop: sideBorder,
        borderRight: sideBorder,
        borderBottom: sideBorder,
        borderLeft: isWarning
          ? '3px solid #F59E0B'
          : isUrgent
            ? '3px solid #DC2626'
            : sideBorder,
        borderRadius: hasLeftAccent ? '0 8px 8px 0' : '8px',
        padding: '11px 13px',
        cursor: 'pointer',
        transform: hovered && !isExpired ? 'translateY(-2px)' : 'none',
        boxShadow: hovered && !isExpired ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
        transition: 'transform 150ms ease-out, border-color 150ms ease-out, box-shadow 150ms ease-out',
      }}
    >
      {/* Row 1: company + urgency badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
        <div style={{
          fontSize: 13,
          fontWeight: 500,
          color: isExpired ? '#94A3B8' : '#0F172A',
          textDecoration: isExpired ? 'line-through' : 'none',
          lineHeight: 1.4,
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {job.company}
        </div>
        {badge && (
          <div style={{
            fontSize: 10,
            fontWeight: 500,
            padding: '2px 6px',
            borderRadius: 4,
            flexShrink: 0,
            backgroundColor: isUrgent ? '#FEE2E2' : '#FEF3C7',
            color: isUrgent ? '#991B1B' : '#92400E',
            lineHeight: 1.4,
            whiteSpace: 'nowrap',
          }}>
            {badge}
          </div>
        )}
      </div>

      {/* Row 2: position · city */}
      <div style={{
        fontSize: 11,
        color: isExpired ? '#94A3B8' : '#475569',
        marginTop: 3,
        lineHeight: 1.5,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {[job.position, job.city].filter(Boolean).join(' · ')}
      </div>

      {/* Row 3: contextual info */}
      {thirdRow && (
        <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 4, lineHeight: 1.4 }}>
          {thirdRow}
        </div>
      )}
    </div>
  );
}

function getBadge(job: Job, level: UrgencyLevel): string | null {
  if (level !== 'warning' && level !== 'urgent') return null;

  const dateStr = getRelevantDate(job);
  if (!dateStr) return null;

  const days = getDaysRemaining(dateStr);

  if (job.status === 'interview') {
    const upcoming = (job.interviews ?? [])
      .filter((i) => i.result !== 'failed')
      .sort((a, b) => a.date.localeCompare(b.date))
      .find((i) => new Date(i.date) >= startOfDay(new Date()));

    if (upcoming) {
      const d = parseISO(upcoming.date);
      const timeStr = format(d, 'HH:mm');
      const hasTime = timeStr !== '00:00';
      if (days === 0) return hasTime ? timeStr : '今天';
      if (days === 1) return hasTime ? `明天 ${timeStr}` : '明天';
      return `${days} 天`;
    }
  }

  if (days === 0) return '今天';
  if (days === 1) return '明天';
  return `${days} 天`;
}

function getThirdRow(job: Job): string | null {
  if (job.status === 'applied' && job.appliedDate) {
    const days = getDaysRemaining(job.appliedDate);
    const abs = Math.abs(days);
    return abs === 0 ? '今天投递' : `${abs} 天前投递`;
  }

  if (job.status === 'interview') {
    const upcoming = (job.interviews ?? [])
      .filter((i) => i.result !== 'failed')
      .sort((a, b) => a.date.localeCompare(b.date))
      .find((i) => new Date(i.date) >= startOfDay(new Date()));

    if (!upcoming) {
      const passedCount = (job.interviews ?? []).filter((i) => i.result === 'passed').length;
      const roundNames = ['一', '二', '三', '四', '五'];
      const round = roundNames[passedCount] ?? `${passedCount + 1}`;
      return `等待${round}面安排`;
    }
    return null;
  }

  if (job.status === 'closed' && job.closedReason) {
    const labels: Record<string, string> = {
      rejected: '已被拒',
      abandoned: '已放弃',
      accepted_other: '接受其他 Offer',
    };
    return labels[job.closedReason] ?? null;
  }

  return null;
}
