'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import styles from './AdminLayout.module.css';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // If on admin login page, render children directly without admin sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className={styles.adminWrapper}>
      {/* Sidebar (Desktop Sticky + Mobile Drawer) */}
      <AdminSidebar isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      {/* Main Area */}
      <div className={styles.mainArea}>
        <AdminTopbar onOpenMenu={() => setIsDrawerOpen(true)} />
        <main className={styles.contentContainer}>
          {children}
        </main>
      </div>
    </div>
  );
}
