import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastProvider } from '../common/Toast';

export const AppLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen flex bg-bg text-text selection:bg-accent/30 selection:text-white relative overflow-x-hidden">
        {/* Subtle Ambient Radial Lighting in Background */}
        <div
          className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[radial-gradient(ellipse_80%_80%_at_50%_0%,rgba(139,92,246,0.12),rgba(99,102,241,0.05),transparent)] filter blur-3xl pointer-events-none" />
          <div className="absolute top-[40%] -right-40 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(6,182,212,0.06),transparent_70%)] filter blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 -left-40 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(236,72,153,0.05),transparent_70%)] filter blur-3xl pointer-events-none" />
          {/* Subtle Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] opacity-70" />
        </div>

        <Sidebar isMobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          <Topbar onMobileMenuOpen={() => setMobileOpen(true)} />

          <main className="flex-1 p-4 md:p-8 max-w-dashboard w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  );
};
