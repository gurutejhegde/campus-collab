import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastProvider } from '../common/Toast';

export const AppLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen flex bg-bg text-text selection:bg-accent/20">
        <Sidebar isMobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0">
          <Topbar onMobileMenuOpen={() => setMobileOpen(true)} />

          <main className="flex-1 p-4 md:p-8 max-w-dashboard w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  );
};
