import { useCallback } from 'react';
import { nanoid } from 'nanoid';
import { format } from 'date-fns';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../lib/constants';
import type { Job, Status, ClosedReason } from '../types';

function now(): string {
  return new Date().toISOString();
}

function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * When a job moves to a new status column, auto-fill obvious date fields.
 */
function applyStatusDefaults(
  job: Job,
  newStatus: Status,
  closedReason?: ClosedReason,
): Partial<Job> {
  const patch: Partial<Job> = { status: newStatus };

  switch (newStatus) {
    case 'applied':
      if (!job.appliedDate) patch.appliedDate = todayISO();
      break;
    case 'oa':
      if (!job.appliedDate) patch.appliedDate = todayISO();
      break;
    case 'offer':
      if (!job.offerReceivedDate) patch.offerReceivedDate = todayISO();
      break;
    case 'closed':
      patch.closedDate = todayISO();
      if (closedReason) patch.closedReason = closedReason;
      break;
    default:
      break;
  }

  return patch;
}

export interface UseJobsReturn {
  jobs: Job[];
  addJob: (data: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => Job;
  updateJob: (id: string, patch: Partial<Omit<Job, 'id' | 'createdAt'>>) => void;
  deleteJob: (id: string) => void;
  moveJob: (id: string, newStatus: Status, closedReason?: ClosedReason) => void;
  reorderJobs: (status: Status, orderedIds: string[]) => void;
  importJobs: (incoming: Job[], merge: boolean) => void;
}

export function useJobs(initialJobs: Job[] = []): UseJobsReturn {
  const [jobs, setJobs] = useLocalStorage<Job[]>(STORAGE_KEYS.jobs, initialJobs);

  const addJob = useCallback(
    (data: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Job => {
      const ts = now();
      const newJob: Job = { ...data, id: nanoid(), createdAt: ts, updatedAt: ts };
      setJobs((prev) => [...prev, newJob]);
      return newJob;
    },
    [setJobs],
  );

  const updateJob = useCallback(
    (id: string, patch: Partial<Omit<Job, 'id' | 'createdAt'>>) => {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === id ? { ...j, ...patch, updatedAt: now() } : j,
        ),
      );
    },
    [setJobs],
  );

  const deleteJob = useCallback(
    (id: string) => {
      setJobs((prev) => prev.filter((j) => j.id !== id));
    },
    [setJobs],
  );

  const moveJob = useCallback(
    (id: string, newStatus: Status, closedReason?: ClosedReason) => {
      setJobs((prev) =>
        prev.map((j) => {
          if (j.id !== id) return j;
          const defaults = applyStatusDefaults(j, newStatus, closedReason);
          return { ...j, ...defaults, updatedAt: now() };
        }),
      );
    },
    [setJobs],
  );

  /**
   * Persist manual drag-order within a column.
   * orderedIds: full ordered list of job ids in that column after drag.
   */
  const reorderJobs = useCallback(
    (status: Status, orderedIds: string[]) => {
      const indexMap = new Map(orderedIds.map((id, i) => [id, i]));
      setJobs((prev) =>
        prev.map((j) => {
          if (j.status !== status) return j;
          const order = indexMap.get(j.id);
          if (order === undefined) return j;
          return { ...j, manualOrder: order, updatedAt: now() };
        }),
      );
    },
    [setJobs],
  );

  /**
   * Import jobs from JSON backup.
   * merge=true  → keep existing jobs, add new ones (dedup by id)
   * merge=false → replace all
   */
  const importJobs = useCallback(
    (incoming: Job[], merge: boolean) => {
      if (!merge) {
        setJobs(incoming);
        return;
      }
      setJobs((prev) => {
        const existingIds = new Set(prev.map((j) => j.id));
        const toAdd = incoming.filter((j) => !existingIds.has(j.id));
        return [...prev, ...toAdd];
      });
    },
    [setJobs],
  );

  return { jobs, addJob, updateJob, deleteJob, moveJob, reorderJobs, importJobs };
}
