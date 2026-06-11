'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  LayoutDashboard, FileText, Tag, Users, FolderOpen,
  Settings, MessageSquare, LogOut, Menu, Sun, Moon, ExternalLink,
} from 'lucide-react';
import Cookies from 'js-cookie';

const NAV = [
  { href: '/admin',            label: 'Dashboard',  icon: LayoutDashboard, exact: true },
  { href: '/admin/articles',   label: 'Articles',   icon: FileText },
  { href: '/admin/categories', label: 'Categories', icon: FolderOpen },
  { href: '/admin/authors',    label: 'Authors',    icon: Users },
  { href: '/admin/tags',       label: 'Tags',       icon: Tag },
  { href: '/admin/messages',   label: 'Messages',   icon: MessageSquare },
  { href: '/admin/settings',   label: 'Settings',   icon: Settings },
];

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  const [userName,    setUserName]    = useState('Admin');
  const [userEmail,   setUserEmail]   = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [themeReady,  setThemeReady]  = useState(false);
  const [authed,      setAuthed]      = useState(false);

  useEffect(() => {
    setThemeReady(true);

    const token = Cookies.get('vyom_token');
    if (!token) {
      router.replace('/admin/login');
      return;
    }

    // Token exists — show the panel right away
    setAuthed(true);

    // Load user info in background
    fetch('/api/auth', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(u => {
        if (u) {
          setUserName(u.name  || 'Admin');
          setUserEmail(u.email || '');
        } else {
          // Token rejected by server — log out
          Cookies.remove('vyom_token');
          router.replace('/admin/login');
        }
      })
      .catch(() => {
        // Network error — keep showing panel, server will block bad requests
      });
  }, [router]);

  const logout = () => {
    fetch('/api/auth', { method: 'DELETE' }).catch(() => {});
    Cookies.remove('vyom_token');
    router.replace('/admin/login');
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  // While checking auth, show a minimal loading screen (not blank)
  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading…</p>
        </div>
      </div>
    );
  }

  const SidebarInner = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-800">
        <Link href="/" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 group">
          <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400"
            style={{ fontFamily: 'var(--font-syne)' }}>Vyom</span>
          <span className="text-gray-400 text-xs">.quest</span>
          <ExternalLink size={10} className="text-gray-300 group-hover:text-indigo-400 ml-1" />
        </Link>
        <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon, exact }) => (
          <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(href, exact)
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}>
            <Icon size={16} />{label}
          </Link>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800">
        <div className="px-3 py-2 mb-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{userName}</p>
          {userEmail && <p className="text-xs text-gray-400 truncate">{userEmail}</p>}
        </div>
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <LogOut size={16} />Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 fixed h-full z-30">
        <SidebarInner />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-60 bg-white dark:bg-gray-900 flex flex-col z-50">
            <SidebarInner />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-100 dark:border-gray-800 px-4 sm:px-6 h-14 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2 ml-auto">
            {themeReady && (
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            )}
            <Link href="/admin/articles/new" className="btn-primary text-xs px-3 py-2">
              + New Article
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
