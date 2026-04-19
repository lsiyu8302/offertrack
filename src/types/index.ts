export type Status =
  | 'wishlist'
  | 'applied'
  | 'oa'
  | 'interview'
  | 'offer'
  | 'closed';

export type JobType = 'campus' | 'intern' | 'social';

export type ClosedReason = 'rejected' | 'abandoned' | 'accepted_other';

export type InterviewFormat = 'onsite' | 'video' | 'phone';

export type InterviewResult = 'pending' | 'passed' | 'failed';

export type SortMode = 'smart' | 'created' | 'alpha' | 'manual';

export type UrgencyLevel = 'normal' | 'warning' | 'urgent' | 'expired';

export type ViewMode = 'kanban' | 'calendar';

export interface Interview {
  id: string;
  date: string;
  round: string;
  format: InterviewFormat;
  result?: InterviewResult;
  notes?: string;
}

export interface Materials {
  resume?: { checked: boolean; version?: string };
  coverLetter?: { checked: boolean };
  portfolio?: { checked: boolean };
  transcript?: { checked: boolean };
  recommendation?: { checked: boolean };
  custom?: Array<{ name: string; checked: boolean }>;
}

export interface OfferComparison {
  scores?: Record<string, number>;
  personalNote?: string;
}

export interface Job {
  id: string;
  company: string;
  position: string;
  city?: string;
  salary?: string;
  jobType?: JobType;
  industry?: string;
  jdLink?: string;

  status: Status;

  deadline?: string;
  appliedDate?: string;
  oaDeadline?: string;
  interviews?: Interview[];
  offerReceivedDate?: string;
  offerDeadline?: string;
  closedDate?: string;
  closedReason?: ClosedReason;

  materials?: Materials;
  notes?: string;
  offerComparison?: OfferComparison;
  manualOrder?: number;

  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  columnSortModes: Record<Status, SortMode>;
  view: ViewMode;
  customComparisonDimensions: string[];
  onboarded: boolean;
}

export interface StatusColumn {
  id: Status;
  label: string;
  dotColor: string;
  sortField: keyof Job | 'nextInterviewDate';
  sortDirection: 'asc' | 'desc';
}
