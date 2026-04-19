import { differenceInCalendarDays, parseISO, startOfDay, format } from 'date-fns';
import type { Job, UrgencyLevel } from '../types';
import { URGENCY_THRESHOLDS } from './constants';

/**
 * Returns the date string that matters for urgency in the job's current column.
 * Only statuses with deadlines participate in urgency calculation.
 */
export function getRelevantDate(job: Job): string | undefined {
  switch (job.status) {
    case 'wishlist':
      return job.deadline;
    case 'oa':
      return job.oaDeadline;
    case 'interview': {
      // Next upcoming interview (first one not yet passed)
      const upcoming = (job.interviews ?? [])
        .filter((i) => i.result !== 'failed')
        .sort((a, b) => a.date.localeCompare(b.date))
        .find((i) => new Date(i.date) >= startOfDay(new Date()));
      return upcoming?.date ?? job.interviews?.[0]?.date;
    }
    case 'offer':
      return job.offerDeadline;
    default:
      return undefined;
  }
}

/**
 * Days remaining until dateStr from today (start of day).
 * Positive = future, 0 = today, negative = past.
 */
export function getDaysRemaining(dateStr: string): number {
  const target = startOfDay(parseISO(dateStr));
  const today = startOfDay(new Date());
  return differenceInCalendarDays(target, today);
}

export function getUrgencyLevel(job: Job): UrgencyLevel {
  const dateStr = getRelevantDate(job);
  if (!dateStr) return 'normal';

  const days = getDaysRemaining(dateStr);

  if (days < 0) {
    // Expired DDL only matters visually in wishlist
    return job.status === 'wishlist' ? 'expired' : 'normal';
  }
  if (days <= URGENCY_THRESHOLDS.urgent) return 'urgent';
  if (days <= URGENCY_THRESHOLDS.warning) return 'warning';
  return 'normal';
}

/**
 * Returns a human-friendly label for days remaining.
 */
export function formatDaysRemaining(days: number): string {
  if (days < 0) return '已错过';
  if (days === 0) return '今天';
  if (days === 1) return '明天';
  return `${days} 天`;
}

/**
 * Returns a friendly label for the relevant date of a job.
 * e.g. "还剩 2 天", "今天", "明天", "已错过"
 */
export function formatJobUrgency(job: Job): string | null {
  const dateStr = getRelevantDate(job);
  if (!dateStr) return null;
  const days = getDaysRemaining(dateStr);
  return formatDaysRemaining(days);
}

export interface UrgentEventsSummary {
  prefix: string;
  events: string[];
  extraCount: number;
}

/**
 * Generates structured data for the urgent banner text.
 * Collects all urgent (≤3 days) events, sorts by urgency,
 * returns prefix + up to 2 event labels + overflow count.
 */
export function getUrgentEventsText(jobs: Job[]): UrgentEventsSummary | null {
  const all: Array<{ days: number; text: string }> = [];

  for (const job of jobs) {
    if (getUrgencyLevel(job) !== 'urgent') continue;

    const dateStr = getRelevantDate(job);
    if (!dateStr) continue;

    const days = getDaysRemaining(dateStr);
    if (days < 0) continue;

    let text: string;

    if (job.status === 'interview') {
      const upcoming = (job.interviews ?? [])
        .filter((i) => i.result !== 'failed')
        .sort((a, b) => a.date.localeCompare(b.date))
        .find((i) => new Date(i.date) >= startOfDay(new Date()));
      if (!upcoming) continue;
      const d = parseISO(upcoming.date);
      const timeStr = format(d, 'HH:mm');
      const showTime = timeStr !== '00:00';
      text = `${job.company}${upcoming.round}${showTime ? ' ' + timeStr : ''}`;
    } else if (job.status === 'wishlist') {
      text = `${job.company}网申截止`;
    } else if (job.status === 'oa') {
      text = `${job.company}笔试截止`;
    } else if (job.status === 'offer') {
      text = `${job.company} Offer 截止`;
    } else {
      continue;
    }

    all.push({ days, text });
  }

  if (all.length === 0) return null;

  all.sort((a, b) => a.days - b.days);

  const minDay = all[0].days;
  let prefix: string;
  if (minDay === 0) prefix = '今天';
  else if (minDay === 1) prefix = '明天';
  else prefix = `还剩 ${minDay} 天`;

  const shown = all.slice(0, 2).map((e) => e.text);
  const extraCount = all.length - shown.length;

  return { prefix, events: shown, extraCount };
}
