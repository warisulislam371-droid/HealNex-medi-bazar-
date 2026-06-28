import React, { useState, useEffect } from 'react';
import { dbLocal } from './db';
import { User, Product } from './types';
import Navbar from './components/Navbar';
import CustomerPanel from './components/CustomerPanel';
import AdminPanel from './components/AdminPanel';
import VendorPanel from './components/VendorPanel';
import SupportChat from './components/SupportChat';
import BlogSection from './components/BlogSection';
import AuthModal from './components/AuthModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>('marketplace');
  const [showAuth, setShowAuth] = useState(false);

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

  // System setup trigger inside useEffect
  useEffect(() => {
    // Initialize Local Database Mock with default credentials & categories
    dbLocal.init();

    // Load active session if any
    const savedSession = dbLocal.getCurrentUser();
    if (savedSession) {
      setCurrentUser(savedSession);
    } else {
      // By default, let's auto-log in as Customer (Dr. Waris Ul Islam) for smooth initial testing
      const customers = dbLocal.getUsers().filter(u => u.role === 'customer');
      if (customers.length > 0) {
        dbLocal.setCurrentUser(customers[0]);
        setCurrentUser(customers[0]);
      }
    }
  }, []);

  const handleLogout = () => {
    dbLocal.setCurrentUser(null);
    setCurrentUser(null);
    setCurrentView('marketplace');
    addToast('Logged out from clinical workspace session.', 'info');
  };

  const handleRoleChange = (selectedRole: 'super_admin' | 'vendor' | 'customer') => {
    const allUsers = dbLocal.getUsers();
    
    let targetUser: User | undefined;
    if (selectedRole === 'super_admin') {
      targetUser = allUsers.find(u => u.role === 'super_admin');
      setCurrentView('admin');
    } else if (selectedRole === 'vendor') {
      targetUser = allUsers.find(u => u.role === 'vendor');
      setCurrentView('vendor');
    } else {
      targetUser = allUsers.find(u => u.role === 'customer');
      setCurrentView('marketplace');
    }

    if (targetUser) {
      dbLocal.setCurrentUser(targetUser);
      setCurrentUser(targetUser);
    }
  };

  const handleCategorySelect = (catName: string) => {
    setSelectedCategoryName(catName);
    setCurrentView('marketplace');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentView('marketplace');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 text-slate-800 font-sans selection:bg-teal-700 selection:text-white">
      
      {/* Left Sidebar (Only visible on medium screens and up) */}
      <aside className="w-64 bg-[#0F766E] flex flex-col text-white shrink-0 hidden md:flex border-r border-teal-900/40 shadow-xl">
        {/* Brand Header */}
        <div className="p-6 border-b border-teal-800">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-white p-1 rounded-lg shadow-sm">
              <svg className="w-5 h-5 text-[#0F766E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight leading-none font-display">HEALNEX</span>
          </div>
          <p className="text-[10px] uppercase tracking-widest opacity-70 font-bold font-display">Medi Bazar India</p>
        </div>

        {/* Sidebar Nav items */}
        <nav className="flex-1 py-5 px-3.5 space-y-1.5 overflow-y-auto">
          <div className="text-[10px] text-teal-300 font-bold uppercase tracking-wider px-3 mb-2.5">Control Center</div>
          
          {/* Marketplace */}
          <button 
            onClick={() => {
              setCurrentView('marketplace');
              setSearchQuery('');
              setSelectedCategoryName('');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-left ${
              currentView === 'marketplace' ? 'bg-teal-800 text-white shadow-md' : 'hover:bg-teal-800/55 text-teal-100'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentView === 'marketplace' ? 'bg-orange-400 animate-ping' : 'bg-transparent'}`}></span>
            Marketplace
          </button>

          {/* Super Admin Desk (Conditional) */}
          {currentUser?.role === 'super_admin' && (
            <button 
              onClick={() => setCurrentView('admin')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-left ${
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
              onClick={() => setCurrentView('vendor')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-left ${
                currentView === 'vendor' ? 'bg-teal-800 text-white shadow-md' : 'hover:bg-teal-800/55 text-teal-100'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${currentView === 'vendor' ? 'bg-orange-400 animate-pulse' : 'bg-transparent'}`}></span>
              Vendor Desk
            </button>
          )}

          {/* RFQ Procurement */}
          <button 
            onClick={() => setCurrentView('rfqs')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-left ${
              currentView === 'rfqs' ? 'bg-teal-800 text-white shadow-md' : 'hover:bg-teal-800/55 text-teal-100'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentView === 'rfqs' ? 'bg-orange-400 animate-ping' : 'bg-transparent'}`}></span>
            RFQ Procurement
          </button>

          <div className="text-[10px] text-teal-300 font-bold uppercase tracking-wider px-3 mt-6 mb-2.5">Operations</div>

          {/* Shopping Cart */}
          <button 
            onClick={() => setCurrentView('cart')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-left ${
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
            onClick={() => setCurrentView('tickets')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-left ${
              currentView === 'tickets' ? 'bg-teal-800 text-white shadow-md' : 'hover:bg-teal-800/55 text-teal-100'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentView === 'tickets' ? 'bg-orange-400' : 'bg-transparent'}`}></span>
            Support Tickets
          </button>

          {/* Clinical Blogs */}
          <button 
            onClick={() => setCurrentView('blogs')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-left ${
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
              setShowAuth(true);
              return;
            }
            if (view === 'admin-panel') {
              setCurrentView('admin');
              return;
            }
            if (view === 'vendor-panel') {
              setCurrentView('vendor');
              return;
            }
            setCurrentView(view);
            if (view === 'marketplace') {
              setSearchQuery('');
              setSelectedCategoryName('');
            }
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
              onNavigate={setCurrentView}
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
            <SupportChat currentUser={currentUser} onNavigate={setCurrentView} addToast={addToast} />
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
              <h4 className="text-xs font-bold text-teal-400 font-display">HealNex Medi Bazar</h4>
              <p className="text-[9px] text-slate-500">India's Trusted Medical Equipment Marketplace &bull; CDSCO Registered</p>
            </div>
            <p className="text-[9px] text-slate-500">&copy; 2026 HealNex Medi Bazar Ltd.</p>
          </div>
        </footer>

      </div>

      {/* Secure Auth Overlay */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            if (user.role === 'super_admin') {
              setCurrentView('admin');
            } else if (user.role === 'vendor') {
              setCurrentView('vendor');
            } else {
              setCurrentView('marketplace');
            }
          }}
          addToast={addToast}
        />
      )}

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
