import { useState } from 'react';
import { CheckCircle2, LayoutGrid, Zap, Search } from 'lucide-react';

interface Props {
  onComplete: () => void;
  onClearSampleData: () => void;
}

const STEPS = [
  {
    title: '欢迎来到 OfferTrack 👋',
    subtitle: '一个为求职者设计的本地应用，帮你追踪每一家公司、每一次进展。',
    body: (
      <div style={{ marginTop: 20 }}>
        <div
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '24px 0',
          }}
        >
          <div
            style={{
              width: 64, height: 64, borderRadius: 16,
              background: '#E0F2FE',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <CheckCircle2 size={32} color="#0284C7" strokeWidth={1.5} />
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#475569', textAlign: 'center', lineHeight: 1.7, maxWidth: 300 }}>
            你的所有数据都保存在本地浏览器中，<strong style={{ color: '#0F172A' }}>不上传服务器</strong>，随时可以导出备份。
          </p>
        </div>
        <div
          style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
          }}
        >
          {[
            { icon: <LayoutGrid size={16} color="#0284C7" />, text: '看板 + 日历双视图' },
            { icon: <Zap size={16} color="#F59E0B" />, text: '截止日期智能提醒' },
            { icon: <Search size={16} color="#8B5CF6" />, text: '搜索筛选快速定位' },
            { icon: <CheckCircle2 size={16} color="#16A34A" />, text: 'Offer 对比辅助决策' },
          ].map(({ icon, text }) => (
            <div
              key={text}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 12px', borderRadius: 8,
                background: '#F8FAFC', border: '0.5px solid #E2E8F0',
              }}
            >
              {icon}
              <span style={{ fontSize: 12, color: '#475569' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: '已为你加载示例数据',
    subtitle: '你可以先用示例数据探索功能，再清除换成自己的申请。',
    body: (
      <div style={{ marginTop: 20 }}>
        <div
          style={{
            background: '#F0F9FF', border: '0.5px solid #BAE6FD',
            borderRadius: 8, padding: '12px 14px', marginBottom: 16,
          }}
        >
          <p style={{ margin: 0, fontSize: 12, color: '#0C4A6E', lineHeight: 1.7 }}>
            示例包含 <strong>12 家公司</strong>的申请记录，覆盖心愿清单、面试、Offer 各阶段，帮你直观感受各功能。
          </p>
        </div>
        <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.8 }}>
          <div>✦ 拖动卡片可以在列之间移动申请状态</div>
          <div>✦ 点击卡片打开详情，可填写备注和材料清单</div>
          <div>✦ 顶部搜索框可实时搜索公司或岗位</div>
          <div>✦ 点击漏斗图标可按行业/城市/紧急程度筛选</div>
        </div>
      </div>
    ),
  },
];

export function Onboarding({ onComplete, onClearSampleData }: Props) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15,23,42,0.50)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 300,
        padding: 24,
      }}
    >
      <div
        style={{
          background: '#fff', borderRadius: 12, padding: 28,
          width: '100%', maxWidth: 420,
          boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
          animation: 'modalIn 200ms ease-out',
        }}
      >
        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1, height: 3, borderRadius: 999,
                background: i <= step ? '#0EA5E9' : '#E2E8F0',
                transition: 'background 300ms',
              }}
            />
          ))}
        </div>

        <div style={{ fontSize: 16, fontWeight: 500, color: '#0F172A' }}>
          {STEPS[step].title}
        </div>
        <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
          {STEPS[step].subtitle}
        </div>

        {STEPS[step].body}

        {/* Actions */}
        <div style={{ marginTop: 24, display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
          {isLast && (
            <button
              onClick={() => { onClearSampleData(); onComplete(); }}
              style={{
                height: 34, padding: '0 16px', borderRadius: 999,
                border: '0.5px solid #CBD5E1', background: 'transparent',
                fontSize: 12, color: '#475569', cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              清除示例数据
            </button>
          )}
          {!isLast && (
            <button
              onClick={() => setStep((s) => s + 1)}
              style={{
                height: 34, padding: '0 24px', borderRadius: 999,
                border: 'none', background: '#F8FAFC',
                fontSize: 12, color: '#475569', cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              下一步
            </button>
          )}
          <button
            onClick={onComplete}
            style={{
              height: 34, padding: '0 24px', borderRadius: 999,
              border: 'none', background: '#0EA5E9',
              color: '#fff', fontSize: 12, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {isLast ? '开始使用 →' : '跳过'}
          </button>
        </div>
      </div>
    </div>
  );
}
