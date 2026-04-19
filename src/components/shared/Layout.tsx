import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-bg-primary">
      <div
        className="mx-auto px-6 py-6"
        style={{ maxWidth: 1440 }}
      >
        {children}
      </div>
    </div>
  );
}
