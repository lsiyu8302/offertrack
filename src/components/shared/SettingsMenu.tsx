import { useEffect, useRef, useState } from 'react';
import { Settings, Download, Upload, Trash2 } from 'lucide-react';

interface Props {
  onExport: () => void;
  onImportFile: (file: File) => void;
  onClearAll: () => void;
}

export function SettingsMenu({ onExport, onImportFile, onClearAll }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  function handleImportClick() {
    setOpen(false);
    fileRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onImportFile(file);
      e.target.value = ''; // reset so same file can be re-selected
    }
  }

  function handleExport() {
    setOpen(false);
    onExport();
  }

  function handleClear() {
    setOpen(false);
    onClearAll();
  }

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      {/* Gear button */}
      <IconBtn active={open} onClick={() => setOpen((v) => !v)} label="设置">
        <Settings size={13} color="#475569" />
      </IconBtn>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 32,
            right: 0,
            width: 180,
            background: '#fff',
            borderRadius: 8,
            border: '0.5px solid #E2E8F0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            zIndex: 200,
            overflow: 'hidden',
          }}
        >
          <MenuItem icon={<Download size={13} />} onClick={handleExport}>
            导出数据
          </MenuItem>
          <MenuItem icon={<Upload size={13} />} onClick={handleImportClick}>
            导入数据
          </MenuItem>
          <div style={{ height: '0.5px', background: '#E2E8F0', margin: '2px 0' }} />
          <MenuItem icon={<Trash2 size={13} />} onClick={handleClear} danger>
            清空所有数据
          </MenuItem>
        </div>
      )}
    </div>
  );
}

function IconBtn({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      aria-label={label}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 26,
        height: 26,
        borderRadius: 6,
        border: '0.5px solid #E2E8F0',
        background: active || hov ? '#F1F5F9' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: 0,
        transition: 'background 150ms',
      }}
    >
      {children}
    </button>
  );
}

function MenuItem({
  icon,
  onClick,
  danger,
  children,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        padding: '9px 14px',
        background: hov ? '#F8FAFC' : 'transparent',
        border: 'none',
        textAlign: 'left',
        fontSize: 12,
        color: danger ? '#DC2626' : '#0F172A',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'background 150ms',
      }}
    >
      <span style={{ color: danger ? '#DC2626' : '#94A3B8', display: 'flex', alignItems: 'center' }}>
        {icon}
      </span>
      {children}
    </button>
  );
}
