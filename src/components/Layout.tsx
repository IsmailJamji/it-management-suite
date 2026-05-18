import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-cloud-navy/20 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
          aria-hidden
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-[260px] transform transition-transform duration-300 ease-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="lg:pl-[260px] min-h-screen">
        <Header onMenuClick={toggleSidebar} user={user} />
        <main className="flex flex-1 flex-col animate-fade-in">
          <div className="flex-1 p-5 lg:p-8 max-w-[1600px] mx-auto w-full">{children}</div>
          <footer className="border-t border-border/50 px-5 py-4 lg:px-8">
            <p className="text-center text-xs text-cloud-muted">© 2026 IT Suite</p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Layout;
