import type { Job } from '../../types';
import { getUrgencyLevel } from '../../lib/urgency';

interface StatsBarProps {
  jobs: Job[];
  onUrgentClick?: () => void;
}

export function StatsBar({ jobs, onUrgentClick }: StatsBarProps) {
  const totalCount = jobs.filter((j) => j.status !== 'wishlist' && j.status !== 'closed').length;
  const activeCount = jobs.filter((j) => ['applied', 'oa', 'interview'].includes(j.status)).length;
  const offerCount = jobs.filter((j) => j.status === 'offer').length;
  const urgentCount = jobs.filter((j) => getUrgencyLevel(j) === 'urgent').length;
  const hasUrgent = urgentCount > 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
      <StatCard label="总投递" value={totalCount} valueColor="#0F172A" />
      <StatCard label="进行中" value={activeCount} valueColor="#0284C7" />
      <StatCard label="Offer" value={offerCount} valueColor="#16A34A" />
      <StatCard
        label="紧急"
        value={urgentCount}
        valueColor={hasUrgent ? '#DC2626' : '#94A3B8'}
        labelColor={hasUrgent ? '#991B1B' : '#475569'}
        bgColor={hasUrgent ? '#FEE2E2' : '#F8FAFC'}
        onClick={hasUrgent ? onUrgentClick : undefined}
        clickable={hasUrgent}
      />
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  valueColor: string;
  labelColor?: string;
  bgColor?: string;
  onClick?: () => void;
  clickable?: boolean;
}

function StatCard({
  label,
  value,
  valueColor,
  labelColor = '#475569',
  bgColor = '#F8FAFC',
  onClick,
  clickable,
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: bgColor,
        borderRadius: 8,
        padding: '12px 14px',
        cursor: clickable ? 'pointer' : 'default',
        userSelect: 'none',
      }}
    >
      <div style={{ fontSize: 11, color: labelColor, lineHeight: 1.5, marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 500, color: valueColor, lineHeight: 1.3 }}>
        {value}
      </div>
    </div>
  );
}
