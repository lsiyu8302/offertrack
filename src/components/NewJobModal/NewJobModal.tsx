import { useState, useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import type { Job, Status } from '../../types';
import { STATUS_COLUMNS, INDUSTRY_TAGS } from '../../lib/constants';

// ─── Public types ─────────────────────────────────────────────────────────────

export interface NewJobFormData {
  company: string;
  position: string;
  city?: string;
  salary?: string;
  status: Status;
  industry?: string;
  deadline?: string;
}

interface NewJobModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialData?: Job;
  defaultStatus?: Status;
  onClose: () => void;
  onSave: (data: NewJobFormData) => void;
}

// ─── Internal form state ──────────────────────────────────────────────────────

interface FormState {
  company: string;
  position: string;
  city: string;
  salary: string;
  status: Status | '';
  industry: string;
  deadline: string;
}

function buildInitialForm(
  mode: 'create' | 'edit',
  initialData?: Job,
  defaultStatus?: Status,
): FormState {
  if (mode === 'edit' && initialData) {
    return {
      company: initialData.company,
      position: initialData.position,
      city: initialData.city ?? '',
      salary: initialData.salary ?? '',
      status: initialData.status,
      industry: initialData.industry ?? '',
      deadline: initialData.deadline ?? '',
    };
  }
  return {
    company: '',
    position: '',
    city: '',
    salary: '',
    status: defaultStatus ?? '',
    industry: '',
    deadline: '',
  };
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function NewJobModal({
  open,
  mode,
  initialData,
  defaultStatus,
  onClose,
  onSave,
}: NewJobModalProps) {
  const [form, setForm] = useState<FormState>(() =>
    buildInitialForm(mode, initialData, defaultStatus),
  );

  // Reset form each time the modal opens.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (open) setForm(buildInitialForm(mode, initialData, defaultStatus));
  }, [open]);

  // Esc to close.
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  function setField<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  const canSave =
    form.company.trim() !== '' &&
    form.position.trim() !== '' &&
    form.status !== '';

  function handleSave() {
    if (!canSave) return;
    onSave({
      company: form.company.trim(),
      position: form.position.trim(),
      city: form.city.trim() || undefined,
      salary: form.salary.trim() || undefined,
      status: form.status as Status,
      industry: form.industry || undefined,
      deadline: form.deadline || undefined,
    });
  }

  return (
    // Overlay — click outside the card to close.
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 500,
      }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Card — stopPropagation so clicks inside don't bubble to overlay */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          padding: 22,
          width: 440,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
          animation: 'modalIn 200ms ease-out',
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}>
          <div style={{ fontSize: 16, fontWeight: 500, color: '#0F172A' }}>
            {mode === 'create' ? '新增申请' : '编辑申请'}
          </div>
          <button
            onClick={onClose}
            aria-label="关闭"
            style={{
              width: 26,
              height: 26,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: '0.5px solid #E2E8F0',
              borderRadius: 6,
              cursor: 'pointer',
              color: '#475569',
              padding: 0,
            }}
          >
            <X size={13} strokeWidth={2} />
          </button>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Company */}
          <Field label="公司名" required>
            <FocusInput
              value={form.company}
              onChange={(v) => setField('company', v)}
              placeholder="如：字节跳动"
              autoFocus
            />
          </Field>

          {/* Position */}
          <Field label="岗位" required>
            <FocusInput
              value={form.position}
              onChange={(v) => setField('position', v)}
              placeholder="如：前端工程师"
            />
          </Field>

          {/* City + Salary — two columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="城市">
              <FocusInput
                value={form.city}
                onChange={(v) => setField('city', v)}
                placeholder="如：北京"
              />
            </Field>
            <Field label="薪资范围">
              <FocusInput
                value={form.salary}
                onChange={(v) => setField('salary', v)}
                placeholder="如：20-30k"
              />
            </Field>
          </div>

          {/* Status pills */}
          <Field label="所属阶段" required>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {STATUS_COLUMNS.map((col) => {
                const active = form.status === col.id;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setField('status', col.id)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 999,
                      border: 'none',
                      backgroundColor: active ? '#0EA5E9' : '#F8FAFC',
                      color: active ? '#FFFFFF' : '#475569',
                      fontWeight: active ? 500 : 400,
                      fontSize: 11,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'background-color 150ms, color 150ms',
                    }}
                  >
                    {col.label}
                  </button>
                );
              })}
            </div>
          </Field>

          {/* Deadline date */}
          <Field label="网申截止日">
            <FocusDateInput
              value={form.deadline}
              onChange={(v) => setField('deadline', v)}
            />
          </Field>

          {/* Industry tags — single-select, matches Job.industry: string */}
          <Field label="行业标签">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {INDUSTRY_TAGS.map((tag) => {
                const active = form.industry === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setField('industry', active ? '' : tag)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 999,
                      border: active ? 'none' : '0.5px solid #E2E8F0',
                      backgroundColor: active ? '#E0F2FE' : '#FFFFFF',
                      color: active ? '#0C4A6E' : '#475569',
                      fontWeight: active ? 500 : 400,
                      fontSize: 11,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'background-color 150ms, color 150ms',
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
              {/* + button placeholder (future: add custom tag) */}
              <button
                type="button"
                aria-label="添加自定义标签"
                style={{
                  padding: '4px 8px',
                  borderRadius: 999,
                  border: '0.5px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#94A3B8',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                +
              </button>
            </div>
          </Field>
        </div>

        {/* Bottom buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 22 }}>
          <button
            onClick={onClose}
            style={{
              height: 34,
              padding: '0 16px',
              borderRadius: 999,
              border: '0.5px solid #CBD5E1',
              backgroundColor: 'transparent',
              color: '#475569',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            style={{
              height: 34,
              padding: '0 20px',
              borderRadius: 999,
              border: 'none',
              backgroundColor: canSave ? '#0EA5E9' : '#E2E8F0',
              color: canSave ? '#FFFFFF' : '#94A3B8',
              fontSize: 12,
              fontWeight: 500,
              cursor: canSave ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
              transition: 'background-color 150ms',
            }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Internal sub-components ──────────────────────────────────────────────────

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <div style={{ fontSize: 11, color: '#475569', marginBottom: 6, lineHeight: 1.4 }}>
        {label}
        {required && <span style={{ color: '#DC2626', marginLeft: 2 }}>*</span>}
      </div>
      {children}
    </div>
  );
}

// Generic focus-aware text input with the spec's focus ring.
function FocusInput({
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: '100%',
        height: 34,
        padding: '0 12px',
        border: focused ? '1px solid #0EA5E9' : '0.5px solid #E2E8F0',
        borderRadius: 6,
        fontSize: 13,
        color: '#0F172A',
        backgroundColor: '#FFFFFF',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
        outline: 'none',
        boxShadow: focused ? '0 0 0 3px rgba(14, 165, 233, 0.15)' : 'none',
        transition: 'border-color 150ms, box-shadow 150ms',
      }}
    />
  );
}

// Focus-aware date input.
function FocusDateInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: '100%',
        height: 34,
        padding: '0 12px',
        border: focused ? '1px solid #0EA5E9' : '0.5px solid #E2E8F0',
        borderRadius: 6,
        fontSize: 13,
        color: value ? '#0F172A' : '#94A3B8',
        backgroundColor: '#FFFFFF',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
        outline: 'none',
        boxShadow: focused ? '0 0 0 3px rgba(14, 165, 233, 0.15)' : 'none',
        transition: 'border-color 150ms, box-shadow 150ms',
        cursor: 'pointer',
      }}
    />
  );
}
