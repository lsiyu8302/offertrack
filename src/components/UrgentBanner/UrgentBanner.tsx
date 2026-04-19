import type { Job } from '../../types';
import { getUrgentEventsText } from '../../lib/urgency';

interface UrgentBannerProps {
  jobs: Job[];
  onViewAll?: () => void;
}

export function UrgentBanner({ jobs, onViewAll }: UrgentBannerProps) {
  const summary = getUrgentEventsText(jobs);
  if (!summary) return null;

  const { events, extraCount } = summary;
  const totalCount = events.length + extraCount;
  const eventsText = events.join(' · ');

  return (
    <div
      style={{
        backgroundColor: '#F0F9FF',
        border: '0.5px solid #BAE6FD',
        borderRadius: 8,
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      {/* Left: pulse dot + text */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: '#DC2626',
            flexShrink: 0,
            animation: 'urgentPulse 2s ease-in-out infinite',
          }}
        />
        <div
          style={{
            fontSize: 12,
            color: '#0C4A6E',
            lineHeight: 1.5,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          <span>{eventsText}</span>
          <span style={{ color: '#DC2626', fontWeight: 500 }}> 等 {totalCount} 件紧急</span>
        </div>
      </div>

      {/* Right: view all */}
      <button
        onClick={onViewAll}
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: '#0284C7',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          flexShrink: 0,
          fontFamily: 'inherit',
          whiteSpace: 'nowrap',
        }}
      >
        查看全部 ›
      </button>
    </div>
  );
}
