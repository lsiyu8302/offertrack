import { nanoid } from 'nanoid';
import { addDays, subDays, nextWednesday, format, addHours, startOfDay } from 'date-fns';
import type { Job } from '../types';

function isoDate(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

function isoDateTime(d: Date): string {
  return d.toISOString();
}

const now = new Date();
const today = startOfDay(now);

function ts(): string {
  return now.toISOString();
}

export const SAMPLE_JOBS: Job[] = [
  // 1. 字节跳动 — 心愿清单，DDL 后天 🔥
  {
    id: nanoid(),
    company: '字节跳动',
    position: '前端工程师',
    city: '北京',
    salary: '25-40k',
    jobType: 'campus',
    industry: '互联网',
    jdLink: 'https://jobs.bytedance.com',
    status: 'wishlist',
    deadline: isoDate(addDays(today, 2)),
    materials: {
      resume: { checked: true, version: 'v3-互联网岗' },
      coverLetter: { checked: false },
    },
    notes: '字节前端岗要求 React/Vue 熟练，需准备算法题。注意简历要突出项目经验。',
    createdAt: ts(),
    updatedAt: ts(),
  },

  // 2. 美团 — 心愿清单，DDL 5 天后 ⚠️
  {
    id: nanoid(),
    company: '美团',
    position: '产品经理',
    city: '北京',
    salary: '20-30k',
    jobType: 'campus',
    industry: '互联网',
    status: 'wishlist',
    deadline: isoDate(addDays(today, 5)),
    materials: {
      resume: { checked: true, version: 'v2-产品岗' },
      coverLetter: { checked: true },
    },
    notes: '需要准备产品案例分析，重点关注美团本地生活业务。',
    createdAt: ts(),
    updatedAt: ts(),
  },

  // 3. 小红书 — 心愿清单，DDL 2 周后
  {
    id: nanoid(),
    company: '小红书',
    position: '设计实习生',
    city: '上海',
    salary: '200-250/天',
    jobType: 'intern',
    industry: '互联网',
    status: 'wishlist',
    deadline: isoDate(addDays(today, 14)),
    materials: {
      resume: { checked: false },
      portfolio: { checked: false },
    },
    notes: '需要准备作品集，小红书审美偏年轻化，风格要活泼。',
    createdAt: ts(),
    updatedAt: ts(),
  },

  // 4. 腾讯 — 已投递，3 天前
  {
    id: nanoid(),
    company: '腾讯',
    position: '后端开发工程师',
    city: '深圳',
    salary: '28-45k',
    jobType: 'campus',
    industry: '互联网',
    status: 'applied',
    appliedDate: isoDate(subDays(today, 3)),
    materials: {
      resume: { checked: true, version: 'v3-后端岗' },
      coverLetter: { checked: true },
    },
    notes: '已提交，HR 说 2 周内会有消息。面试侧重系统设计和 C++ 基础。',
    createdAt: ts(),
    updatedAt: ts(),
  },

  // 5. 阿里巴巴 — 已投递，1 周前
  {
    id: nanoid(),
    company: '阿里巴巴',
    position: '数据分析师',
    city: '杭州',
    salary: '22-35k',
    jobType: 'campus',
    industry: '互联网',
    status: 'applied',
    appliedDate: isoDate(subDays(today, 7)),
    materials: {
      resume: { checked: true, version: 'v2-数据岗' },
      transcript: { checked: true },
    },
    notes: '阿里数据岗偏重 SQL 和业务感，需要熟悉 A/B 测试框架。',
    createdAt: ts(),
    updatedAt: ts(),
  },

  // 6. 网易 — 已投递，4 天前
  {
    id: nanoid(),
    company: '网易',
    position: '游戏策划',
    city: '广州',
    salary: '15-25k',
    jobType: 'campus',
    industry: '互联网',
    status: 'applied',
    appliedDate: isoDate(subDays(today, 4)),
    materials: {
      resume: { checked: true, version: 'v1-游戏岗' },
      coverLetter: { checked: true },
      portfolio: { checked: false },
    },
    notes: '策划岗需要提交游戏策划案，正在准备《原神》关卡设计分析。',
    createdAt: ts(),
    updatedAt: ts(),
  },

  // 7. 拼多多 — 笔试/OA，OA 后天截止 🔥
  {
    id: nanoid(),
    company: '拼多多',
    position: '算法工程师',
    city: '上海',
    salary: '35-60k',
    jobType: 'campus',
    industry: '互联网',
    status: 'oa',
    appliedDate: isoDate(subDays(today, 5)),
    oaDeadline: isoDate(addDays(today, 2)),
    materials: {
      resume: { checked: true, version: 'v3-算法岗' },
    },
    notes: 'OA 共 3 道算法题，120 分钟。拼多多算法难度偏高，需要复习动态规划和图论。',
    createdAt: ts(),
    updatedAt: ts(),
  },

  // 8. 小米 — 面试中，明天 14:00 二面 🔥
  {
    id: nanoid(),
    company: '小米',
    position: '硬件工程师',
    city: '北京',
    salary: '20-32k',
    jobType: 'campus',
    industry: '互联网',
    status: 'interview',
    appliedDate: isoDate(subDays(today, 14)),
    interviews: [
      {
        id: nanoid(),
        date: isoDateTime(addHours(addDays(startOfDay(today), 1), 14)),
        round: '二面',
        format: 'video',
        result: 'pending',
        notes: '技术面，重点考察嵌入式系统和硬件调试经验。',
      },
      {
        id: nanoid(),
        date: isoDateTime(subDays(addHours(startOfDay(today), 14), 7)),
        round: '一面',
        format: 'video',
        result: 'passed',
        notes: '一面通过，面试官问了电路基础和 RTOS 相关知识。',
      },
    ],
    materials: {
      resume: { checked: true, version: 'v2-硬件岗' },
    },
    notes: '明天 14:00 视频二面，需要准备硬件项目介绍和系统设计思路。',
    createdAt: ts(),
    updatedAt: ts(),
  },

  // 9. 京东 — 面试中，下周三二面
  {
    id: nanoid(),
    company: '京东',
    position: '运营专员',
    city: '北京',
    salary: '12-18k',
    jobType: 'campus',
    industry: '互联网',
    status: 'interview',
    appliedDate: isoDate(subDays(today, 10)),
    interviews: [
      {
        id: nanoid(),
        date: isoDateTime(addHours(nextWednesday(addDays(today, 1)), 15)),
        round: '二面',
        format: 'onsite',
        result: 'pending',
        notes: '线下面试，地点北京亦庄京东总部。',
      },
      {
        id: nanoid(),
        date: isoDateTime(subDays(addHours(startOfDay(today), 10), 5)),
        round: '一面',
        format: 'video',
        result: 'passed',
        notes: '一面主要聊实习经历和数据分析能力。',
      },
    ],
    materials: {
      resume: { checked: true, version: 'v1-运营岗' },
      coverLetter: { checked: true },
    },
    notes: '下周三下午 3 点二面，需要准备运营案例分析和数据思维展示。',
    createdAt: ts(),
    updatedAt: ts(),
  },

  // 10. 百度 — 面试中，一面通过等排期
  {
    id: nanoid(),
    company: '百度',
    position: 'NLP 算法工程师',
    city: '北京',
    salary: '30-50k',
    jobType: 'campus',
    industry: '互联网',
    status: 'interview',
    appliedDate: isoDate(subDays(today, 20)),
    interviews: [
      {
        id: nanoid(),
        date: isoDateTime(subDays(addHours(startOfDay(today), 14), 8)),
        round: '一面',
        format: 'video',
        result: 'passed',
        notes: '深度学习基础、Transformer 架构、NLP 任务经验。表现不错。',
      },
    ],
    materials: {
      resume: { checked: true, version: 'v3-算法岗' },
      transcript: { checked: true },
      recommendation: { checked: true },
    },
    notes: '一面通过，HR 说二面会在 1-2 周内安排。在等待消息中，继续刷 LLM 相关论文。',
    createdAt: ts(),
    updatedAt: ts(),
  },

  // 11. 普华永道 — Offer，7 天后截止 ⚠️
  {
    id: nanoid(),
    company: '普华永道',
    position: '咨询顾问',
    city: '上海',
    salary: '18-22k',
    jobType: 'campus',
    industry: '咨询',
    status: 'offer',
    appliedDate: isoDate(subDays(today, 45)),
    offerReceivedDate: isoDate(subDays(today, 3)),
    offerDeadline: isoDate(addDays(today, 7)),
    interviews: [
      {
        id: nanoid(),
        date: isoDateTime(subDays(addHours(startOfDay(today), 14), 20)),
        round: '笔试',
        format: 'onsite',
        result: 'passed',
      },
      {
        id: nanoid(),
        date: isoDateTime(subDays(addHours(startOfDay(today), 10), 12)),
        round: '一面',
        format: 'onsite',
        result: 'passed',
      },
      {
        id: nanoid(),
        date: isoDateTime(subDays(addHours(startOfDay(today), 14), 5)),
        round: 'HR 面',
        format: 'onsite',
        result: 'passed',
      },
    ],
    materials: {
      resume: { checked: true, version: 'v2-咨询岗' },
      coverLetter: { checked: true },
      transcript: { checked: true },
    },
    offerComparison: {
      scores: { 发展空间: 4, 工作强度: 2, 团队氛围: 4, 薪资水平: 3 },
      personalNote: '四大之一，平台好但强度高。可以和互联网 Offer 对比一下。',
    },
    notes: 'Offer 已到手，7 天内需要决定是否接受。薪资 18k，有年终奖。',
    createdAt: ts(),
    updatedAt: ts(),
  },

  // 12. 欧莱雅 — 已结束，已拒信
  {
    id: nanoid(),
    company: '欧莱雅',
    position: '管理培训生',
    city: '上海',
    salary: '10-15k',
    jobType: 'campus',
    industry: '快消',
    status: 'closed',
    appliedDate: isoDate(subDays(today, 30)),
    closedDate: isoDate(subDays(today, 2)),
    closedReason: 'rejected',
    interviews: [
      {
        id: nanoid(),
        date: isoDateTime(subDays(addHours(startOfDay(today), 14), 10)),
        round: '群面',
        format: 'onsite',
        result: 'passed',
        notes: '无领导小组讨论，话题是新消费品牌营销策略。',
      },
      {
        id: nanoid(),
        date: isoDateTime(subDays(addHours(startOfDay(today), 10), 4)),
        round: '终面',
        format: 'onsite',
        result: 'failed',
        notes: '终面被问到快消行业理解，回答不够深入，遗憾落选。',
      },
    ],
    materials: {
      resume: { checked: true, version: 'v1-快消岗' },
      coverLetter: { checked: true },
    },
    notes: '终面表现不理想，被拒。复盘：需要加强对快消行业的理解，多看财报和行业报告。',
    createdAt: ts(),
    updatedAt: ts(),
  },
];
