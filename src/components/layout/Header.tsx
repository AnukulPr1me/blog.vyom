'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Menu, X, Sun, Moon, Search, ChevronDown, Smartphone, Laptop, PenTool, Camera as CameraIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPhoneCategoryIcon } from '@/lib/phone-icons';
import type { Category, PhoneCategory } from '@/types';

const navLinkCls = 'px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800';
const iconBtnCls = 'p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800';

const DEVICE_TYPES = [
  { href: '/phones',  label: 'Phones',          icon: Smartphone },
  { href: '/laptops', label: 'Laptops',         icon: Laptop },
  { href: '/tablets', label: 'Drawing Tablets', icon: PenTool },
  { href: '/cameras', label: 'Cameras',         icon: CameraIcon },
];

export default function Header() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [phoneCategories, setPhoneCategories] = useState<PhoneCategory[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [devicesOpen, setDevicesOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const catRef = useRef<HTMLDivElement>(null);
  const devRef = useRef<HTMLDivElement>(null);
  // Delay timers — keep menu open briefly after cursor leaves so users
  // don't have to be pixel-perfect moving from button to menu items.
  const catTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const devTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    fetch('/api/categories?active=true')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setCategories(data.filter((c: Category) => c.showInNav).slice(0, 8)); })
      .catch(() => {});
    fetch('/api/phone-categories?active=true')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setPhoneCategories(data.slice(0, 5)); })
      .catch(() => {});
  }, []);

  // Clear close timers on unmount
  useEffect(() => {
    return () => {
      if (catTimer.current) clearTimeout(catTimer.current);
      if (devTimer.current) clearTimeout(devTimer.current);
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
      if (devRef.current && !devRef.current.contains(e.target as Node)) setDevicesOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close dropdowns on Escape key
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setCatOpen(false); setDevicesOpen(false); }
  }, []);

  return (
    <header
      className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur border-b border-gray-200 dark:border-gray-800"
      onKeyDown={handleKeyDown}
    >
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:text-sm">
        Skip to main content
      </a>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" aria-label="Vyom home">
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400" style={{ fontFamily: 'var(--font-syne)' }} aria-hidden="true">Vyom</span>
            <span className="text-gray-400 text-sm" aria-hidden="true">.quest</span>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1">
            <Link href="/" className={navLinkCls}>Home</Link>

            {/* Categories dropdown */}
            <div className="relative" ref={catRef}>
              <button
                className={cn(navLinkCls, 'flex items-center gap-1')}
                aria-expanded={catOpen}
                aria-haspopup="true"
                aria-controls="categories-menu"
                onMouseEnter={() => { if (catTimer.current) clearTimeout(catTimer.current); setCatOpen(true); }}
                onMouseLeave={() => { catTimer.current = setTimeout(() => setCatOpen(false), 150); }}
                onClick={() => setCatOpen(v => !v)}
              >
                Categories
                <ChevronDown size={14} className={cn('transition-transform duration-200', catOpen && 'rotate-180')} aria-hidden="true" />
              </button>
              {catOpen && categories.length > 0 && (
                <div
                  id="categories-menu"
                  role="menu"
                  aria-label="Article categories"
                  className="absolute top-full left-0 mt-1 w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-2 z-50"
                  onMouseEnter={() => { if (catTimer.current) clearTimeout(catTimer.current); setCatOpen(true); }}
                  onMouseLeave={() => { catTimer.current = setTimeout(() => setCatOpen(false), 150); }}
                >
                  {categories.map(cat => (
                    <Link key={cat._id} href={`/category/${cat.slug}`} role="menuitem"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors"
                      onClick={() => setCatOpen(false)}>
                      {cat.name}
                    </Link>
                  ))}
                  <hr className="my-1 border-gray-100 dark:border-gray-800" role="separator" />
                  <Link href="/categories" role="menuitem"
                    className="block px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                    onClick={() => setCatOpen(false)}>
                    All categories →
                  </Link>
                </div>
              )}
            </div>

            {/* Devices dropdown */}
            <div className="relative" ref={devRef}>
              <button
                className={cn(navLinkCls, 'flex items-center gap-1')}
                aria-expanded={devicesOpen}
                aria-haspopup="true"
                aria-controls="devices-menu"
                onMouseEnter={() => { if (devTimer.current) clearTimeout(devTimer.current); setDevicesOpen(true); }}
                onMouseLeave={() => { devTimer.current = setTimeout(() => setDevicesOpen(false), 150); }}
                onClick={() => setDevicesOpen(v => !v)}
              >
                Devices
                <ChevronDown size={14} className={cn('transition-transform duration-200', devicesOpen && 'rotate-180')} aria-hidden="true" />
              </button>
              {devicesOpen && (
                <div
                  id="devices-menu"
                  role="menu"
                  aria-label="Device categories"
                  className="absolute top-full left-0 mt-1 w-60 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-2 z-50"
                  onMouseEnter={() => { if (devTimer.current) clearTimeout(devTimer.current); setDevicesOpen(true); }}
                  onMouseLeave={() => { devTimer.current = setTimeout(() => setDevicesOpen(false), 150); }}
                >
                  {DEVICE_TYPES.map(d => (
                    <Link key={d.href} href={d.href} role="menuitem"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors"
                      onClick={() => setDevicesOpen(false)}>
                      <d.icon size={15} className="text-indigo-400" aria-hidden="true" />
                      {d.label}
                    </Link>
                  ))}
                  {phoneCategories.length > 0 && (
                    <>
                      <hr className="my-1.5 border-gray-100 dark:border-gray-800" role="separator" />
                      <p className="px-4 pb-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider" aria-hidden="true">Phone Categories</p>
                      {phoneCategories.map(cat => {
                        const Icon = getPhoneCategoryIcon(cat.icon);
                        return (
                          <Link key={cat._id} href={`/phones/category/${cat.slug}`} role="menuitem"
                            className="flex items-center gap-2 px-4 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors"
                            onClick={() => setDevicesOpen(false)}>
                            <Icon size={12} className="text-indigo-300" aria-hidden="true" />
                            {cat.name}
                          </Link>
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </div>

            <Link href="/authors" className={navLinkCls}>Authors</Link>
            <Link href="/about" className={navLinkCls}>About</Link>
            <Link href="/advertise" className={navLinkCls}>Advertise</Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1" role="group" aria-label="Site actions">
            <Link href="/search" className={iconBtnCls} aria-label="Search articles">
              <Search size={18} aria-hidden="true" />
            </Link>
            {mounted && (
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className={iconBtnCls}
                aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {resolvedTheme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
              </button>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={cn(iconBtnCls, 'lg:hidden')}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Mobile navigation"
          className="lg:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-3 space-y-0.5 max-h-[80vh] overflow-y-auto"
        >
          {[{href:'/',label:'Home'},{href:'/categories',label:'Categories'},{href:'/authors',label:'Authors'},{href:'/about',label:'About'},{href:'/contact',label:'Contact'},{href:'/advertise',label:'Advertise'}].map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
              {l.label}
            </Link>
          ))}

          <div className="pt-2 mt-1 border-t border-gray-100 dark:border-gray-800">
            <p className="px-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider" id="mobile-devices-label">Devices</p>
            <div role="list" aria-labelledby="mobile-devices-label">
              {DEVICE_TYPES.map(d => (
                <Link key={d.href} href={d.href} role="listitem" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
                  <d.icon size={14} className="text-indigo-400" aria-hidden="true" />
                  {d.label}
                </Link>
              ))}
            </div>
          </div>

          {categories.length > 0 && (
            <div className="pt-2 mt-1 border-t border-gray-100 dark:border-gray-800">
              <p className="px-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider" id="mobile-categories-label">Categories</p>
              <div role="list" aria-labelledby="mobile-categories-label">
                {categories.slice(0, 6).map(cat => (
                  <Link key={cat._id} href={`/category/${cat.slug}`} role="listitem" onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
