
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  Palette,
  FileText,
  Tag,
  Ticket,
  CreditCard,
  Database,
  UserCheck,
  Webhook,
  Image as ImageIcon,
  MessageSquare,
  PenSquare,
  Languages,
  Home,
  LogOut,
  KeyRound,
  Megaphone,
  Briefcase,
  Smartphone,
  Mailbox,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Puzzle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { listenToCollection } from '@/lib/firestoreService';

const NavLinkItem = React.memo(function NavLinkItem({
  item,
  currentPath,
  isSidebarOpen,
  sidebarFrozen
}) {
  return (
    <Link
      to={sidebarFrozen ? '#' : item.path}
      onClick={(e) => {
        if (sidebarFrozen) e.preventDefault();
      }}
      className={`flex items-center justify-between p-3 my-1 rounded-lg transition-all duration-200 ${currentPath === item.path || currentPath.startsWith(item.path + '/')
          ? 'bg-purple-600 text-white shadow-md'
          : 'text-gray-600 hover:bg-purple-100 hover:text-purple-700'
        } ${sidebarFrozen ? 'pointer-events-none opacity-70' : ''}`}
      aria-disabled={sidebarFrozen}
    >
      <div className="flex items-center min-w-0">
        {item.icon && <item.icon className="h-5 w-5 mr-3 shrink-0" />}
        <AnimatePresence initial={false}>
          {isSidebarOpen && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="font-medium whitespace-nowrap"
            >
              {item.name}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {isSidebarOpen && item.badge ? (
        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-2">
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
});

const DropdownMenu = React.memo(function DropdownMenu({
  title,
  icon: Icon,
  items,
  currentPath,
  isSidebarOpen,
  sidebarFrozen
}) {
  const [isOpen, setIsOpen] = useState(
    items.some((item) => currentPath === item.path || currentPath.startsWith(item.path + '/'))
  );

  useEffect(() => {
    if (items.some((item) => currentPath === item.path || currentPath.startsWith(item.path + '/'))) {
      setIsOpen(true);
    }
  }, [currentPath, items]);

  return (
    <div>
      <button
        onClick={() => {
          if (!sidebarFrozen) setIsOpen((prev) => !prev);
        }}
        className={`w-full flex items-center justify-between p-3 my-1 rounded-lg transition-colors duration-200 text-gray-600 hover:bg-purple-100 hover:text-purple-700 ${isOpen ? 'bg-purple-50' : ''
          } ${sidebarFrozen ? 'pointer-events-none opacity-70' : ''}`}
        disabled={sidebarFrozen}
      >
        <div className="flex items-center min-w-0">
          <Icon className="h-5 w-5 mr-3 shrink-0" />
          <AnimatePresence initial={false}>
            {isSidebarOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="font-medium whitespace-nowrap"
              >
                {title}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {isSidebarOpen && (
          <KeyRound className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
        )}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && isSidebarOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pl-6"
          >
            {items.map((item) => (
              <Link
                key={item.name}
                to={sidebarFrozen ? '#' : item.path}
                onClick={(e) => {
                  if (sidebarFrozen) e.preventDefault();
                }}
                className={`flex items-center p-2 my-1 rounded-md text-sm transition-colors ${currentPath === item.path || currentPath.startsWith(item.path + '/')
                    ? 'text-purple-700 font-semibold'
                    : 'text-gray-500 hover:text-purple-600'
                  } ${sidebarFrozen ? 'pointer-events-none opacity-70' : ''}`}
              >
                {item.icon ? (
                  <item.icon className="h-4 w-4 mr-2" />
                ) : (
                  <span className="w-2 h-2 bg-gray-300 rounded-full mr-3"></span>
                )}
                {item.name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

const SyncStatusPill = ({ syncState }) => {
  if (!syncState.active && syncState.status !== 'success' && syncState.status !== 'error') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 rounded-full border bg-white/95 backdrop-blur px-4 py-2 shadow-lg flex items-center gap-2 text-sm">
      {syncState.status === 'error' ? (
        <AlertCircle className="w-4 h-4 text-red-500" />
      ) : syncState.status === 'success' ? (
        <CheckCircle2 className="w-4 h-4 text-green-600" />
      ) : (
        <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
      )}

      <span className="font-medium">
        {syncState.status === 'error'
          ? syncState.message || 'Sync failed'
          : syncState.status === 'success'
            ? syncState.message || 'Sync complete'
            : syncState.background
              ? `${syncState.label || 'Sync'} in background`
              : `${syncState.label || 'Syncing'} ${syncState.progress || 0}%`}
      </span>
    </div>
  );
};

const SyncProgressBar = ({ syncState }) => {
  if (!syncState.active) return null;

  return (
    <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b">
      <div className="px-4 md:px-8 py-3 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
            <span>{syncState.label || 'Syncing'}...</span>
          </div>

          <div className="text-xs text-gray-500">
            {syncState.current || 0}/{syncState.total || 0} • {syncState.progress || 0}%
          </div>
        </div>

        <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full bg-purple-600 transition-all duration-300"
            style={{ width: `${Math.max(0, Math.min(syncState.progress || 0, 100))}%` }}
          />
        </div>

        {syncState.message ? (
          <p className="text-xs text-gray-500 mt-2">{syncState.message}</p>
        ) : null}
      </div>
    </div>
  );
};

const getDefaultSyncState = () => ({
  active: false,
  background: false,
  label: '',
  progress: 0,
  current: 0,
  total: 0,
  status: 'idle',
  message: ''
});

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [unreadContactCount, setUnreadContactCount] = useState(0);
  const [syncState, setSyncState] = useState(
    typeof window !== 'undefined' && window.__ADMIN_SYNC_STATE__
      ? window.__ADMIN_SYNC_STATE__
      : getDefaultSyncState()
  );

  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useUser();

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.__ADMIN_SYNC_STATE__) {
      window.__ADMIN_SYNC_STATE__ = getDefaultSyncState();
    }
  }, []);

  useEffect(() => {
    let timeout;

    const unsubscribe = listenToCollection('contactSubmissions', (data) => {
      if (window.__ADMIN_SYNC_STATE__?.active) return;

      clearTimeout(timeout);

      timeout = setTimeout(() => {
        const count = data.filter((sub) => !sub.isRead).length;
        setUnreadContactCount((prev) => (prev === count ? prev : count));
      }, 250);
    });

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const state = window.__ADMIN_SYNC_STATE__;
      if (!state) return;

      setSyncState((prev) => {
        const same =
          prev.active === state.active &&
          prev.background === state.background &&
          prev.label === state.label &&
          prev.progress === state.progress &&
          prev.current === state.current &&
          prev.total === state.total &&
          prev.status === state.status &&
          prev.message === state.message;

        return same ? prev : state;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout?.();
    navigate('/account');
  };

  const sidebarFrozen = syncState.active && !syncState.background;

  const mainNavItems = useMemo(
    () => [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
      { name: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
      { name: 'Products', icon: Briefcase, path: '/admin/products' },
      { name: 'Customers', icon: Users, path: '/admin/customers' },
      { name: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
      { name: 'Reviews', icon: PenSquare, path: '/admin/reviews' },
      {
        name: 'Contact Forms',
        icon: Mailbox,
        path: '/admin/contact-forms',
        badge: unreadContactCount > 0 ? unreadContactCount : null
      }
    ],
    [unreadContactCount]
  );

  const designNavItems = useMemo(
    () => [
      { name: 'Theme', path: '/admin/design/theme' },
      { name: 'Header & Footer', path: '/admin/design/header-footer' },
      { name: 'Home Page', path: '/admin/design/home-page' },
      { name: 'Product Page', path: '/admin/design/product-page' },
      { name: 'Product Listing', path: '/admin/design/product-listing' },
      { name: 'Contact Page', path: '/admin/design/contact-settings' },
      { name: 'Layout Screen', path: '/admin/design/layout-screen' },
      { name: '👉 Mobile Layout', path: '/admin/design/mobile-layout', icon: Smartphone },
      { name: 'Custom CSS', path: '/admin/design/custom-css' }
    ],
    []
  );

  const contentNavItems = useMemo(
    () => [
      { name: 'Pages', icon: FileText, path: '/admin/pages' },
      { name: 'Categories', icon: Tag, path: '/admin/categories' },
      { name: 'Media', icon: ImageIcon, path: '/admin/media' }
    ],
    []
  );

  const marketingNavItems = useMemo(
    () => [
      { name: 'Coupons', icon: Ticket, path: '/admin/coupons' },
      { name: 'Puzzle Popup', icon: Puzzle, path: '/admin/puzzle-popup' },
    ],
    []
  );

  const settingsNavItems = useMemo(
    () => [
      { name: 'General', icon: Settings, path: '/admin/settings' },
      { name: 'Checkout', icon: CreditCard, path: '/admin/checkout' },
      { name: 'Integrations', icon: Webhook, path: '/admin/integrations' },
      { name: 'WhatsApp', icon: MessageSquare, path: '/admin/whatsapp' },
      { name: 'Access Manager', icon: UserCheck, path: '/admin/access-manager' },
      { name: 'Database', icon: Database, path: '/admin/database' },
      { name: 'SEO', icon: Languages, path: '/admin/seo' },
      { name: 'Product Feed', path: '/admin/product-feed' },
    ],
    []
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <SyncStatusPill syncState={syncState} />

      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 72 }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        className={`bg-white border-r shadow-sm flex flex-col justify-between overflow-y-auto z-20 relative ${sidebarFrozen ? 'select-none' : ''
          }`}
      >
        {sidebarFrozen ? (
          <div className="absolute inset-0 z-10 bg-white/30 backdrop-blur-[1px] pointer-events-auto" />
        ) : null}

        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          {isSidebarOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xl font-bold text-purple-700"
            >
              Admin Panel
            </motion.span>
          )}

          <button
            onClick={() => {
              if (!sidebarFrozen) setIsSidebarOpen((prev) => !prev);
            }}
            className={`p-2 rounded-md hover:bg-gray-100 ${sidebarFrozen ? 'pointer-events-none opacity-60' : ''}`}
            disabled={sidebarFrozen}
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <nav className="flex-1 p-2">
          {mainNavItems.map((item) => (
            <NavLinkItem
              key={item.name}
              item={item}
              currentPath={location.pathname}
              isSidebarOpen={isSidebarOpen}
              sidebarFrozen={sidebarFrozen}
            />
          ))}

          <div className="mt-4 pt-4 border-t">
            <DropdownMenu
              title="Marketing"
              icon={Megaphone}
              items={marketingNavItems}
              currentPath={location.pathname}
              isSidebarOpen={isSidebarOpen}
              sidebarFrozen={sidebarFrozen}
            />
            <DropdownMenu
              title="Design"
              icon={Palette}
              items={designNavItems}
              currentPath={location.pathname}
              isSidebarOpen={isSidebarOpen}
              sidebarFrozen={sidebarFrozen}
            />
            <DropdownMenu
              title="Content"
              icon={FileText}
              items={contentNavItems}
              currentPath={location.pathname}
              isSidebarOpen={isSidebarOpen}
              sidebarFrozen={sidebarFrozen}
            />
          </div>

          <div className="mt-4 pt-4 border-t">
            <DropdownMenu
              title="Settings"
              icon={Settings}
              items={settingsNavItems}
              currentPath={location.pathname}
              isSidebarOpen={isSidebarOpen}
              sidebarFrozen={sidebarFrozen}
            />
          </div>
        </nav>

        <div className="p-4 border-t sticky bottom-0 bg-white">
          <Link
            to={sidebarFrozen ? '#' : '/'}
            onClick={(e) => {
              if (sidebarFrozen) e.preventDefault();
            }}
            className={`flex items-center p-3 mb-2 rounded-lg text-gray-600 hover:bg-purple-100 hover:text-purple-700 ${sidebarFrozen ? 'pointer-events-none opacity-70' : ''
              }`}
          >
            <Home className="h-5 w-5 mr-3 shrink-0" />
            {isSidebarOpen && <span className="font-medium">View Store</span>}
          </Link>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center p-3 rounded-lg text-gray-600 hover:bg-purple-100 hover:text-purple-700 ${sidebarFrozen ? 'pointer-events-none opacity-70' : ''
              }`}
            disabled={sidebarFrozen}
          >
            <LogOut className="h-5 w-5 mr-3 shrink-0" />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </motion.aside>

      <main className="flex-1 overflow-y-auto bg-gray-50 relative z-0">
        <SyncProgressBar syncState={syncState} />
        <div className="p-4 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
