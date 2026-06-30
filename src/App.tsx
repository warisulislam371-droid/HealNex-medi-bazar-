import React, { useState, useEffect } from 'react';
import { dbLocal } from './db';
import { User, Product, UserRole } from './types';
import Navbar from './components/Navbar';
import CustomerPanel from './components/CustomerPanel';
import AdminPanel from './components/AdminPanel';
import VendorPanel from './components/VendorPanel';
import SupportChat from './components/SupportChat';
import BlogSection from './components/BlogSection';
import SupabaseAuth from './components/SupabaseAuth';
import WhatsAppFloatingButton from './components/WhatsAppFloatingButton';
import { supabase, isSupabaseConfigured } from './supabase';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>('marketplace');
  const [currentRoute, setCurrentRoute] = useState<string>(window.location.pathname);

  // Unified high-density toast state
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Search & Navigation States passed down
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] = useState('');

  // Cart & Interaction states
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<Product[]>([]);

  // Unified routing navigate helper
  const navigate = (to: string) => {
    window.history.pushState({}, '', to);
    setCurrentRoute(to);
  };

  // Browser back/forward button support
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // System setup & Supabase Auth trigger inside useEffect
  useEffect(() => {
    // Initialize Local Database Mock (categories, products, etc.)
    dbLocal.init();

    if (!isSupabaseConfigured) {
      // Offline/Sandbox Mode: read logged in user from local storage
      const localUser = dbLocal.getCurrentUser();
      if (localUser) {
        setCurrentUser(localUser);
      } else {
        const path = window.location.pathname;
        if (path === '/AdminPanel' || path === '/VendorPanel') {
          navigate('/login');
        } else if (path === '/') {
          navigate('/marketplace');
        }
      }
      return;
    }

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const authUser = session.user;
          let userRole = 'customer';
          let userName = authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Verified User';

          if (authUser.email === 'warisulislam371@gmail.com') {
            userRole = 'admin';
          } else {
            try {
              const { data } = await supabase
                .from('users')
                .select('role, name')
                .eq('id', authUser.id)
                .single();
              if (data) {
                userRole = data.role || 'customer';
                if (data.name) userName = data.name;
              }
            } catch (err) {
              console.error('Error fetching role in initAuth:', err);
              userRole = 'customer';
            }
          }

          const matchedUser: User = {
            id: authUser.id,
            name: userName,
            email: authUser.email || '',
            role: userRole as UserRole,
            phone: authUser.phone || '',
            createdAt: authUser.created_at || new Date().toISOString()
          };
          setCurrentUser(matchedUser);

          // Redirect to panels if on root/login path on initial load
          const path = window.location.pathname;
          if (path === '/' || path === '/login' || path === '/forgot-password' || path === '/update-password') {
            if (userRole === 'admin' || userRole === 'super_admin') {
              navigate('/AdminPanel');
            } else if (userRole === 'vendor') {
              navigate('/VendorPanel');
            } else {
              navigate('/marketplace');
            }
          }
        } else {
          const path = window.location.pathname;
          if (path === '/AdminPanel' || path === '/VendorPanel') {
            navigate('/login');
          } else if (path === '/') {
            navigate('/marketplace');
          }
        }
      } catch (err) {
        console.error('Error initializing Supabase auth:', err);
      }
    };

    initAuth();

    // Listen to Supabase Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const authUser = session.user;
        let userRole = 'customer';
        let userName = authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Verified User';

        if (authUser.email === 'warisulislam371@gmail.com') {
          userRole = 'admin';
        } else {
          try {
            const { data } = await supabase
              .from('users')
              .select('role, name')
              .eq('id', authUser.id)
              .single();
            if (data) {
              userRole = data.role || 'customer';
              if (data.name) userName = data.name;
            }
          } catch (err) {
            console.error('Error in auth state change fetching user role:', err);
            userRole = 'customer';
          }
        }

        const matchedUser: User = {
          id: authUser.id,
          name: userName,
          email: authUser.email || '',
          role: userRole as UserRole,
          phone: authUser.phone || '',
          createdAt: authUser.created_at || new Date().toISOString()
        };
        setCurrentUser(matchedUser);
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sync route with view
  useEffect(() => {
    if (currentRoute === '/AdminPanel' || currentRoute === '/admin') {
      setCurrentView('admin');
    } else if (currentRoute === '/VendorPanel' || currentRoute === '/vendor') {
      setCurrentView('vendor');
    } else if (currentRoute === '/tickets') {
      setCurrentView('tickets');
    } else if (currentRoute === '/blogs') {
      setCurrentView('blogs');
    } else if (currentRoute === '/cart') {
      setCurrentView('cart');
    } else if (currentRoute === '/rfqs') {
      setCurrentView('rfqs');
    } else if (currentRoute === '/marketplace' || currentRoute === '/' || currentRoute === '/dashboard') {
      setCurrentView('marketplace');
    }
  }, [currentRoute]);

  // Route security guard checks
  useEffect(() => {
    if (currentRoute === '/AdminPanel' && currentUser && currentUser.role !== 'admin' && currentUser.role !== 'super_admin') {
      addToast('Restricted area. Admin credentials required.', 'error');
      navigate('/login');
    }
    if (currentRoute === '/VendorPanel' && currentUser && currentUser.role !== 'vendor') {
      addToast('Restricted area. Supplier partner credentials required.', 'error');
      navigate('/login');
    }
  }, [currentRoute, currentUser]);

  const handleLogout = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      dbLocal.setCurrentUser(null);
      setCurrentUser(null);
      navigate('/marketplace');
      addToast('Logged out from clinical workspace session.', 'info');
    } catch (err: any) {
      addToast(err.message || 'Logout failed.', 'error');
    }
  };

  const handleCategorySelect = (catName: string) => {
    setSelectedCategoryName(catName);
    navigate('/marketplace');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    navigate('/marketplace');
  };

  // Render Full Screen auth views if matching login paths
  const authRoutes = ['/login', '/forgot-password', '/update-password'];
  if (authRoutes.includes(currentRoute)) {
    return (
      <div className="flex-grow w-full min-h-screen bg-slate-900">
        <SupabaseAuth
          currentRoute={currentRoute}
          navigate={navigate}
          onLoginSuccess={setCurrentUser}
          addToast={addToast}
        />
        {/* High-density Floating Toast Notification Center */}
        <div className="fixed bottom-6 left-6 z-[60] flex flex-col gap-2 max-w-sm pointer-events-none">
          {toasts.map(t => (
            <div
              key={t.id}
              className={`p-3.5 rounded-xl border shadow-lg text-xs font-semibold flex items-center gap-2.5 pointer-events-auto transition-all duration-350 animate-slide-in-left ${
                t.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : t.type === 'error'
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-teal-50 border-teal-200 text-teal-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                t.type === 'success' ? 'bg-emerald-500 animate-pulse' : t.type === 'error' ? 'bg-rose-500 animate-pulse' : 'bg-teal-500 animate-pulse'
              }`}></span>
              <p className="flex-1">{t.message}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 text-slate-800 font-sans selection:bg-teal-700 selection:text-white">
      
      {/* Left Sidebar */}
      <aside className="w-64 bg-[#0F766E] flex flex-col text-white shrink-0 hidden md:flex border-r border-teal-900/40 shadow-xl">
        {/* Brand Header */}
        <div className="p-6 border-b border-teal-800">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-white p-1 rounded-lg shadow-sm cursor-pointer" onClick={() => navigate('/marketplace')}>
              <svg className="w-5 h-5 text-[#0F766E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight leading-none font-display cursor-pointer" onClick={() => navigate('/marketplace')}>
              HEALNEX
            </span>
          </div>
          <p className="text-[10px] uppercase tracking-widest opacity-70 font-bold font-display">Medi Bazar India</p>
        </div>

        {/* Sidebar Nav items */}
        <nav className="flex-1 py-5 px-3.5 space-y-1.5 overflow-y-auto">
          <div className="text-[10px] text-teal-300 font-bold uppercase tracking-wider px-3 mb-2.5">Control Center</div>
          
          {/* Marketplace */}
          <button 
            onClick={() => {
              navigate('/marketplace');
              setSearchQuery('');
              setSelectedCategoryName('');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-left cursor-pointer ${
              currentView === 'marketplace' ? 'bg-teal-800 text-white shadow-md' : 'hover:bg-teal-800/55 text-teal-100'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentView === 'marketplace' ? 'bg-orange-400 animate-ping' : 'bg-transparent'}`}></span>
            Marketplace
          </button>

          {/* Super Admin Desk (Conditional) */}
          {(currentUser?.role === 'super_admin' || currentUser?.role === 'admin') && (
            <button 
              onClick={() => navigate('/AdminPanel')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-left cursor-pointer ${
                currentView === 'admin' ? 'bg-teal-800 text-white shadow-md' : 'hover:bg-teal-800/55 text-teal-100'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${currentView === 'admin' ? 'bg-orange-400 animate-pulse' : 'bg-transparent'}`}></span>
              Super Admin Desk
            </button>
          )}

          {/* Supplier Vendor Desk (Conditional) */}
          {currentUser?.role === 'vendor' && (
            <button 
              onClick={() => navigate('/VendorPanel')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-left cursor-pointer ${
                currentView === 'vendor' ? 'bg-teal-800 text-white shadow-md' : 'hover:bg-teal-800/55 text-teal-100'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${currentView === 'vendor' ? 'bg-orange-400 animate-pulse' : 'bg-transparent'}`}></span>
              Vendor Desk
            </button>
          )}

          {/* RFQ Procurement */}
          <button 
            onClick={() => navigate('/rfqs')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-left cursor-pointer ${
              currentView === 'rfqs' ? 'bg-teal-800 text-white shadow-md' : 'hover:bg-teal-800/55 text-teal-100'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentView === 'rfqs' ? 'bg-orange-400 animate-ping' : 'bg-transparent'}`}></span>
            RFQ Procurement
          </button>

          <div className="text-[10px] text-teal-300 font-bold uppercase tracking-wider px-3 mt-6 mb-2.5">Operations</div>

          {/* Shopping Cart */}
          <button 
            onClick={() => navigate('/cart')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-left cursor-pointer ${
              currentView === 'cart' ? 'bg-teal-800 text-white shadow-md' : 'hover:bg-teal-800/55 text-teal-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`w-1.5 h-1.5 rounded-full ${currentView === 'cart' ? 'bg-orange-400' : 'bg-transparent'}`}></span>
              <span>Checkout Cart</span>
            </div>
            {cart.length > 0 && (
              <span className="bg-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>

          {/* Support Tickets */}
          <button 
            onClick={() => navigate('/tickets')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-left cursor-pointer ${
              currentView === 'tickets' ? 'bg-teal-800 text-white shadow-md' : 'hover:bg-teal-800/55 text-teal-100'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentView === 'tickets' ? 'bg-orange-400' : 'bg-transparent'}`}></span>
            Support Tickets
          </button>

          {/* Clinical Blogs */}
          <button 
            onClick={() => navigate('/blogs')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-left cursor-pointer ${
              currentView === 'blogs' ? 'bg-teal-800 text-white shadow-md' : 'hover:bg-teal-800/55 text-teal-100'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentView === 'blogs' ? 'bg-orange-400' : 'bg-transparent'}`}></span>
            Clinical Blogs
          </button>
        </nav>

        {/* Sidebar Profile Session */}
        {currentUser && (
          <div className="p-4 bg-teal-950/60 mt-auto border-t border-teal-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs shadow-md shrink-0">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="truncate leading-tight">
                <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                <p className="text-[9px] opacity-65 uppercase font-mono tracking-wider truncate">
                  {currentUser.role.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Right Column Layout Panel */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Main Header navigation */}
        <Navbar
          currentUser={currentUser}
          onLogout={handleLogout}
          onNavigate={(view) => {
            if (view === 'login') {
              navigate('/login');
              return;
            }
            if (view === 'admin-panel') {
              navigate('/AdminPanel');
              return;
            }
            if (view === 'vendor-panel') {
              navigate('/VendorPanel');
              return;
            }
            navigate('/' + view);
          }}
          currentView={currentView}
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          wishlistCount={wishlist.length}
          compareCount={compareList.length}
          onSearch={handleSearch}
          onCategorySelect={handleCategorySelect}
        />

        {/* Primary content area */}
        <main className="flex-grow overflow-y-auto">
          
          {/* Marketplace (Customer Dashboard) */}
          {(currentView === 'marketplace' || currentView === 'cart' || currentView === 'rfqs') && (
            <CustomerPanel
              currentUser={currentUser}
              onNavigate={(view) => navigate('/' + view)}
              currentView={currentView}
              cart={cart}
              onUpdateCart={setCart}
              wishlist={wishlist}
              onUpdateWishlist={setWishlist}
              compareList={compareList}
              onUpdateCompare={setCompareList}
              searchQuery={searchQuery}
              onClearSearch={() => setSearchQuery('')}
              selectedCategoryName={selectedCategoryName}
              onCategorySelect={handleCategorySelect}
              addToast={addToast}
            />
          )}

          {/* Super Admin Console */}
          {currentView === 'admin' && (
            <AdminPanel currentUser={currentUser} addToast={addToast} />
          )}

          {/* Supplier Vendor Console */}
          {currentView === 'vendor' && (
            <VendorPanel currentUser={currentUser} addToast={addToast} />
          )}

          {/* Helpdesk tickets conversation */}
          {currentView === 'tickets' && (
            <SupportChat currentUser={currentUser} onNavigate={(view) => navigate('/' + view)} addToast={addToast} />
          )}

          {/* Knowledge Blogs */}
          {currentView === 'blogs' && (
            <BlogSection currentUser={currentUser} addToast={addToast} />
          )}

        </main>

        {/* Clinical Footer */}
        <footer className="bg-slate-950 text-slate-400 text-xs py-4 border-t border-slate-800 shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="text-center md:text-left space-y-0.5">
              <h4 className="text-xs font-bold text-teal-400 font-display">HealNex medi bazar</h4>
              <p className="text-[10px] text-slate-400 font-medium">India's Trusted Medical Equipment Marketplace</p>
              <p className="text-[9px] text-slate-500">Al Salam medical equipment center</p>
            </div>
            <p className="text-[9px] text-slate-500">&copy; 2026 HealNex Medi Bazar Ltd.</p>
          </div>
        </footer>

      </div>

      {/* High-density Floating Toast Notification Center */}
      <div className="fixed bottom-6 left-6 z-[60] flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`p-3.5 rounded-xl border shadow-lg text-xs font-semibold flex items-center gap-2.5 pointer-events-auto transition-all duration-350 animate-slide-in-left ${
              t.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : t.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-teal-50 border-teal-200 text-teal-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${
              t.type === 'success' ? 'bg-emerald-500 animate-pulse' : t.type === 'error' ? 'bg-rose-500 animate-pulse' : 'bg-teal-500 animate-pulse'
            }`}></span>
            <p className="flex-1">{t.message}</p>
          </div>
        ))}
      </div>

      {/* Global Floating WhatsApp Support Button */}
      <WhatsAppFloatingButton currentView={currentView} />

    </div>
  );
}
