import type { StatusColumn } from '../types';

export const STATUS_COLUMNS: StatusColumn[] = [
  {
    id: 'wishlist',
    label: '心愿清单',
    dotColor: '#94A3B8',
    sortField: 'deadline',
    sortDirection: 'asc',
  },
  {
    id: 'applied',
    label: '已投递',
    dotColor: '#0EA5E9',
    sortField: 'appliedDate',
    sortDirection: 'desc',
  },
  {
    id: 'oa',
    label: '笔试 / OA',
    dotColor: '#8B5CF6',
    sortField: 'oaDeadline',
    sortDirection: 'asc',
  },
  {
    id: 'interview',
    label: '面试中',
    dotColor: '#0284C7',
    sortField: 'nextInterviewDate',
    sortDirection: 'asc',
  },
  {
    id: 'offer',
    label: 'Offer',
    dotColor: '#16A34A',
    sortField: 'offerDeadline',
    sortDirection: 'asc',
  },
  {
    id: 'closed',
    label: '已结束',
    dotColor: '#94A3B8',
    sortField: 'closedDate',
    sortDirection: 'desc',
  },
];

export const URGENCY_THRESHOLDS = {
  urgent: 3,   // ≤3 days: red
  warning: 7,  // 3-7 days: yellow
} as const;

export const INDUSTRY_TAGS = [
  '互联网',
  '金融',
  '咨询',
  '快消',
  '制造',
  '其他',
] as const;

export const JOB_TYPES = [
  { value: 'campus', label: '校招' },
  { value: 'intern', label: '实习' },
  { value: 'social', label: '社招' },
] as const;

export const STORAGE_KEYS = {
  jobs: 'offertrack:jobs',
  settings: 'offertrack:settings',
  version: 'offertrack:version',
} as const;

export const CURRENT_DATA_VERSION = '1';
