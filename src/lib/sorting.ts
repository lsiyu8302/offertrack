import type { Job, SortMode, Status } from '../types';
import { STATUS_COLUMNS } from './constants';
import { getUrgencyLevel, getRelevantDate, getDaysRemaining } from './urgency';

/**
 * Three-layer sort for a single column's jobs:
 *  1. smart mode: urgent cards pin to top (sorted by days remaining asc),
 *     then non-urgent by column's smart field.
 *  2. created: newest first.
 *  3. alpha: company name A-Z.
 *  4. manual: manualOrder asc (undefined goes last).
 */
export function sortColumn(
  jobs: Job[],
  mode: SortMode,
  status: Status,
): Job[] {
  const col = STATUS_COLUMNS.find((c) => c.id === status);

  if (mode === 'manual') {
    return [...jobs].sort((a, b) => {
      const ao = a.manualOrder ?? Infinity;
      const bo = b.manualOrder ?? Infinity;
      return ao - bo;
    });
  }

  if (mode === 'created') {
    return [...jobs].sort(
      (a, b) => b.createdAt.localeCompare(a.createdAt),
    );
  }

  if (mode === 'alpha') {
    return [...jobs].sort((a, b) =>
      a.company.localeCompare(b.company, 'zh-CN'),
    );
  }

  // smart
  const urgent: Job[] = [];
  const normal: Job[] = [];

  for (const job of jobs) {
    if (getUrgencyLevel(job) === 'urgent') {
      urgent.push(job);
    } else {
      normal.push(job);
    }
  }

  // Urgent jobs sorted by days remaining ascending (most urgent first)
  urgent.sort((a, b) => {
    const da = getRelevantDate(a);
    const db = getRelevantDate(b);
    const ra = da ? getDaysRemaining(da) : Infinity;
    const rb = db ? getDaysRemaining(db) : Infinity;
    return ra - rb;
  });

  // Normal jobs sorted by the column's smart field
  if (col) {
    const { sortField, sortDirection } = col;
    const dir = sortDirection === 'asc' ? 1 : -1;

    normal.sort((a, b) => {
      let va: string | undefined;
      let vb: string | undefined;

      if (sortField === 'nextInterviewDate') {
        va = getRelevantDate(a);
        vb = getRelevantDate(b);
      } else {
        va = a[sortField] as string | undefined;
        vb = b[sortField] as string | undefined;
      }

      if (!va && !vb) return 0;
      if (!va) return 1;   // nulls last
      if (!vb) return -1;
      return va.localeCompare(vb) * dir;
    });
  }

  return [...urgent, ...normal];
}

/**
 * Returns all jobs grouped by status, each column sorted according to its mode.
 */
export function sortAllColumns(
  jobs: Job[],
  columnSortModes: Partial<Record<Status, SortMode>>,
): Record<Status, Job[]> {
  const result = {} as Record<Status, Job[]>;

  for (const col of STATUS_COLUMNS) {
    const colJobs = jobs.filter((j) => j.status === col.id);
    const mode = columnSortModes[col.id] ?? 'smart';
    result[col.id] = sortColumn(colJobs, mode, col.id);
  }

  return result;
}
