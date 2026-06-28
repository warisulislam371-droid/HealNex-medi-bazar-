import React, { useState, useEffect } from 'react';
import { dbLocal } from '../db';
import { Product, Order, RFQ, Quotation, Category, Review, User, OrderItem } from '../types';
import { INITIAL_CATEGORIES } from '../data';
import {
  Heart,
  ShoppingCart,
  SlidersHorizontal,
  Info,
  Layers,
  Scale,
  Send,
  IndianRupee,
  MapPin,
  ClipboardList,
  FilePlus,
  FileText,
  Loader2,
  CheckCircle,
  Truck,
  Plus,
  Minus,
  Check,
  Star,
  Search,
  MessageSquare,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Building,
  UserCheck
} from 'lucide-react';
import InvoicePDF from './InvoicePDF';

interface CustomerPanelProps {
  currentUser: User | null;
  onNavigate: (view: string) => void;
  currentView: string;
  cart: { product: Product; quantity: number }[];
  onUpdateCart: (cart: { product: Product; quantity: number }[]) => void;
  wishlist: string[];
  onUpdateWishlist: (wishlist: string[]) => void;
  compareList: Product[];
  onUpdateCompare: (compare: Product[]) => void;
  searchQuery: string;
  onClearSearch: () => void;
  selectedCategoryName: string;
  onCategorySelect: (catName: string) => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function CustomerPanel({
  currentUser,
  onNavigate,
  currentView,
  cart,
  onUpdateCart,
  wishlist,
  onUpdateWishlist,
  compareList,
  onUpdateCompare,
  searchQuery,
  onClearSearch,
  selectedCategoryName,
  onCategorySelect,
  addToast
}: CustomerPanelProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Detailed Modal view of a product
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filters State
  const [filterBrand, setFilterBrand] = useState('');
  const [filterPriceRange, setFilterPriceRange] = useState<number>(500000);
  const [filterMoq, setFilterMoq] = useState<number>(100);

  // RFQ Submission form state
  const [rfqName, setRfqName] = useState('');
  const [rfqQty, setRfqQty] = useState<number>(1);
  const [rfqBudget, setRfqBudget] = useState<number>(0);
  const [rfqLocation, setRfqLocation] = useState('');
  const [rfqDesc, setRfqDesc] = useState('');
  const [rfqAttachmentName, setRfqAttachmentName] = useState('');

  // Payment sandbox state
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout' | 'processing' | 'success'>('cart');
  const [razorpayMethod, setRazorpayMethod] = useState<'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking'>('UPI');
  const [shippingAddress, setShippingAddress] = useState({
    address: 'City Hospital, emergency Wing, Station Road',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411001'
  });
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Active invoice view
  const [viewInvoiceOrder, setViewInvoiceOrder] = useState<Order | null>(null);

  // RFQ review comparator state
  const [activeRfqReview, setActiveRfqReview] = useState<RFQ | null>(null);

  const loadData = () => {
    // Only approved products are visible to customers
    const approvedProducts = dbLocal.getProducts().filter(p => p.status === 'Approved');
    setProducts(approvedProducts);

    if (currentUser) {
      const myOrders = dbLocal.getOrders().filter(o => o.customerId === currentUser.id);
      setOrders(myOrders);

      const myRfqs = dbLocal.getRfqs().filter(r => r.customerId === currentUser.id);
      setRfqs(myRfqs);

      setQuotations(dbLocal.getQuotations());
    }
    setReviews(dbLocal.getReviews());
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Filters calculation
  const filteredProducts = products.filter(p => {
    const matchesSearch = searchQuery
      ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subcategory.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesCategory = selectedCategoryName
      ? p.category.toLowerCase() === selectedCategoryName.toLowerCase()
      : true;

    const matchesBrand = filterBrand ? p.brand.toLowerCase().includes(filterBrand.toLowerCase()) : true;
    const matchesPrice = p.salePrice <= filterPriceRange;
    const matchesMoq = p.moq <= filterMoq;

    return matchesSearch && matchesCategory && matchesBrand && matchesPrice && matchesMoq;
  });

  const handleToggleWishlist = (id: string) => {
    let updated: string[];
    if (wishlist.includes(id)) {
      updated = wishlist.filter(item => item !== id);
    } else {
      updated = [...wishlist, id];
    }
    onUpdateWishlist(updated);
  };

  const handleToggleCompare = (p: Product) => {
    let updated: Product[];
    if (compareList.some(item => item.id === p.id)) {
      updated = compareList.filter(item => item.id !== p.id);
    } else {
      if (compareList.length >= 3) {
        addToast('You can compare a maximum of 3 medical items side-by-side.', 'info');
        return;
      }
      updated = [...compareList, p];
    }
    onUpdateCompare(updated);
  };

  const handleAddToCart = (p: Product, customQty?: number) => {
    const qtyToAdd = customQty || p.moq;
    if (qtyToAdd < p.moq) {
      addToast(`Minimum Order Quantity (MOQ) for this equipment is ${p.moq} units.`, 'error');
      return;
    }

    const existingIdx = cart.findIndex(item => item.product.id === p.id);
    let updated = [...cart];
    if (existingIdx > -1) {
      updated[existingIdx].quantity += qtyToAdd;
    } else {
      updated.push({ product: p, quantity: qtyToAdd });
    }
    onUpdateCart(updated);
    addToast(`Successfully added ${qtyToAdd} unit(s) of "${p.name}" to procurement cart.`, 'success');
  };

  const handleUpdateCartQty = (pId: string, nextQty: number, moq: number) => {
    if (nextQty < moq) {
      addToast(`Cannot reduce quantity below the Minimum Order Quantity (MOQ) of ${moq} units.`, 'error');
      return;
    }
    const updated = cart.map(item => {
      if (item.product.id === pId) {
        return { ...item, quantity: nextQty };
      }
      return item;
    });
    onUpdateCart(updated);
  };

  const handleRemoveFromCart = (pId: string) => {
    const updated = cart.filter(item => item.product.id !== pId);
    onUpdateCart(updated);
  };

  // Pricing breakouts
  const getSubtotal = () => cart.reduce((sum, item) => sum + (item.product.salePrice * item.quantity), 0);
  const getGstTotal = () => cart.reduce((sum, item) => {
    const price = item.product.salePrice * item.quantity;
    const gst = price * (item.product.gstRate / 100);
    return sum + gst;
  }, 0);

  const getCheckoutTotal = () => getSubtotal() + getGstTotal();

  // Handle Checkout submission with Razorpay Sandbox
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      addToast('Please log in or switch profiles to complete checkout.', 'error');
      onNavigate('login');
      return;
    }
    if (cart.length === 0) return;

    setCheckoutStep('processing');

    setTimeout(() => {
      // Create Order Records (can support split orders but simplified here)
      const firstItem = cart[0].product;
      const sub = getSubtotal();
      const gst = getGstTotal();
      const final = getCheckoutTotal();

      const newOrder: Order = {
        id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        customerId: currentUser.id,
        customerName: currentUser.name,
        customerEmail: currentUser.email,
        vendorId: firstItem.vendorId,
        vendorName: firstItem.vendorName,
        items: cart.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.images[0],
          price: item.product.salePrice,
          quantity: item.quantity,
          gstRate: item.product.gstRate,
          hsnCode: item.product.hsnCode,
          vendorId: item.product.vendorId,
          vendorName: item.product.vendorName
        })),
        totalAmount: sub,
        gstAmount: gst,
        discountAmount: 0,
        finalAmount: final,
        status: 'Pending',
        paymentMethod: razorpayMethod,
        paymentId: `pay_HN_${Date.now().toString().slice(-9)}`,
        shippingAddress: shippingAddress,
        createdAt: new Date().toISOString(),
        timeline: [
          { status: 'Pending', time: new Date().toISOString(), note: 'Procurement order placed. Payment cleared through Razorpay.' }
        ]
      };

      const currentOrders = dbLocal.getOrders();
      currentOrders.unshift(newOrder);
      dbLocal.saveOrders(currentOrders);

      // Alert Vendor
      dbLocal.addNotification(
        newOrder.vendorId,
        'New Equipment Order Placed',
        `Order #${newOrder.id} has been received for ₹${newOrder.finalAmount.toLocaleString('en-IN')}. Verify calibrated packing.`,
        'order_placed'
      );

      // Alert Admin
      dbLocal.addNotification(
        'admin',
        `New Marketplace Transaction`,
        `Order #${newOrder.id} cleared payment for vendor ${newOrder.vendorName}.`,
        'order_placed'
      );

      setCreatedOrder(newOrder);
      setCheckoutStep('success');
      onUpdateCart([]); // clear cart
    }, 2500);
  };

  // RFQ Submission
  const handleRfqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      addToast('Access Denied. Please authenticate to open clinical tenders.', 'error');
      return;
    }

    const newRfq: RFQ = {
      id: `RFQ-${Math.floor(10000 + Math.random() * 90000)}`,
      customerId: currentUser.id,
      customerName: currentUser.name,
      customerEmail: currentUser.email,
      productName: rfqName,
      quantity: Number(rfqQty),
      budget: Number(rfqBudget),
      deliveryLocation: rfqLocation,
      description: rfqDesc,
      attachmentName: rfqAttachmentName || undefined,
      status: 'Open',
      createdAt: new Date().toISOString(),
      quotationsCount: 0
    };

    const currentRfqs = dbLocal.getRfqs();
    currentRfqs.unshift(newRfq);
    dbLocal.saveRfqs(currentRfqs);

    // Notify all approved vendors
    const allVendors = dbLocal.getVendors().filter(v => v.status === 'Approved');
    allVendors.forEach(v => {
      dbLocal.addNotification(
        v.id,
        'Matching B2B RFQ Posted',
        `A clinical client posted a tender for "${newRfq.productName}". Bid a quota now.`,
        'rfq_received'
      );
    });

    // Notify admin
    dbLocal.addNotification(
      'admin',
      'New Procurement RFQ Open',
      `Client ${currentUser.name} posted tender #${newRfq.id} for "${newRfq.productName}".`,
      'rfq_created'
    );

    addToast('Your clinical procurement RFQ Tender has been opened to supplier matches.', 'success');
    setRfqName('');
    setRfqQty(1);
    setRfqBudget(0);
    setRfqLocation('');
    setRfqDesc('');
    setRfqAttachmentName('');
    loadData();
  };

  // Accept vendor quotation and convert into paid order
  const handleAcceptQuotation = (quo: Quotation, rfq: RFQ) => {
    if (!currentUser) return;
    
    // Simulate Instant payment checkout step
    setCheckoutStep('processing');
    onNavigate('cart');

    setTimeout(() => {
      const sub = quo.totalPrice;
      const gst = sub * 0.12; // Flat 12% for diagnostic equipment
      const final = sub + gst;

      const newOrder: Order = {
        id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        customerId: currentUser.id,
        customerName: currentUser.name,
        customerEmail: currentUser.email,
        vendorId: quo.vendorId,
        vendorName: quo.companyName,
        items: [{
          productId: rfq.id,
          productName: `${rfq.productName} (RFQ Custom Specification)`,
          productImage: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a',
          price: quo.pricePerUnit,
          quantity: rfq.quantity,
          gstRate: 12,
          hsnCode: '90181100',
          vendorId: quo.vendorId,
          vendorName: quo.companyName
        }],
        totalAmount: sub,
        gstAmount: gst,
        discountAmount: 0,
        finalAmount: final,
        status: 'Pending',
        paymentMethod: 'UPI',
        paymentId: `pay_HN_${Date.now().toString().slice(-9)}`,
        shippingAddress: shippingAddress,
        createdAt: new Date().toISOString(),
        timeline: [
          { status: 'Pending', time: new Date().toISOString(), note: 'Procurement Bid accepted. Order initialized.' }
        ]
      };

      // Add to database
      const allOrders = dbLocal.getOrders();
      allOrders.unshift(newOrder);
      dbLocal.saveOrders(allOrders);

      // Mark other quotes as rejected
      const updatedQuotes = dbLocal.getQuotations().map(q => {
        if (q.id === quo.id) return { ...q, status: 'Accepted' as const };
        if (q.rfqId === rfq.id) return { ...q, status: 'Rejected' as const };
        return q;
      });
      dbLocal.saveQuotations(updatedQuotes);

      // Close RFQ
      const updatedRfqs = dbLocal.getRfqs().map(r => {
        if (r.id === rfq.id) return { ...r, status: 'Closed' as const };
        return r;
      });
      dbLocal.saveRfqs(updatedRfqs);

      // Notify vendor
      dbLocal.addNotification(
        quo.vendorId,
        'RFQ Bid Accepted & Paid!',
        `Your quotation for ${rfq.productName} was accepted. Process custom packing.`,
        'order_placed'
      );

      setCreatedOrder(newOrder);
      setCheckoutStep('success');
      setActiveRfqReview(null);
      loadData();
    }, 2000);
  };

  return (
    <div className="font-sans">
      
      {/* Home View / Landing with Marketplace Grid */}
      {currentView === 'marketplace' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Aesthetic B2B Hero Section */}
          <div className="relative bg-teal-950 text-white rounded-3xl overflow-hidden py-12 sm:py-20 px-6 sm:px-12 shadow-2xl border border-teal-800 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="absolute inset-0 opacity-15 pointer-events-none">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#fff" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            <div className="max-w-2xl relative z-10 space-y-5">
              <span className="inline-block bg-teal-500/20 text-teal-300 border border-teal-500/50 text-[10px] sm:text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider">
                clinical quality assured &bull; wholesale pricing
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display leading-tight">
                India's Premium Medical Equipment <span className="text-teal-400">Procurement</span> Hub
              </h1>
              <p className="text-xs sm:text-sm text-teal-100/80 leading-relaxed max-w-lg">
                Source directly from certified suppliers. Submit custom hospital tenders, compare commercial quotations side-by-side, and download official tax invoices.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => {
                    const el = document.getElementById('marketplace-anchor');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold px-6 py-3 rounded-xl transition shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  Explore Catalog
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate('rfqs')}
                  className="bg-transparent border border-teal-600 hover:bg-teal-900 text-white text-xs font-bold px-6 py-3 rounded-xl transition"
                >
                  Submit B2B RFQ
                </button>
              </div>
            </div>

            <div className="relative shrink-0 hidden lg:block w-72">
              <div className="bg-teal-900 p-5 rounded-2xl border border-teal-700/60 shadow-2xl relative">
                <div className="flex items-center justify-between border-b border-teal-800 pb-2 mb-3">
                  <span className="text-[10px] font-bold text-teal-300 tracking-wider">SECURE B2B DISPATCH</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-xs font-semibold leading-relaxed">
                  Every product listed on HealNex undergoes rigorous biomedical calibration before final dispatch.
                </p>
              </div>
            </div>
          </div>

          {/* Categories Horizontal Directory */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clinical Specialities</h3>
            <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin">
              <button
                onClick={() => onCategorySelect('')}
                className={`px-5 py-3 rounded-2xl border text-xs font-semibold shrink-0 transition flex items-center gap-2 ${
                  !selectedCategoryName
                    ? 'bg-teal-700 border-teal-700 text-white shadow-md'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Browse All
              </button>
              {INITIAL_CATEGORIES.map((cat) => {
                const isActive = selectedCategoryName === cat.name;
                return (
                  <button
                    key={cat.id}
                    onClick={() => onCategorySelect(cat.name)}
                    className={`px-5 py-3 rounded-2xl border text-xs font-semibold shrink-0 transition flex items-center gap-2 ${
                      isActive
                        ? 'bg-teal-700 border-teal-700 text-white shadow-md'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Marketplace catalog anchor */}
          <div id="marketplace-anchor" className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Filters Sidebar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-fit space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-teal-700" />
                  Commercial Filters
                </h3>
                {(filterBrand || filterPriceRange < 500000 || filterMoq < 100) && (
                  <button
                    onClick={() => { setFilterBrand(''); setFilterPriceRange(500000); setFilterMoq(100); }}
                    className="text-[10px] font-bold text-rose-600 hover:text-rose-800"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Brand Filter */}
              <div className="space-y-1.5 text-xs font-semibold">
                <label className="text-slate-500">Filter by Brand</label>
                <input
                  type="text"
                  placeholder="e.g. HealNex, Lifeshield..."
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none"
                />
              </div>

              {/* Price Range Filter */}
              <div className="space-y-1.5 text-xs font-semibold">
                <div className="flex justify-between text-slate-500">
                  <span>Price (Max Limit)</span>
                  <span className="font-mono text-teal-800">₹{filterPriceRange.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={500000}
                  step={5000}
                  value={filterPriceRange}
                  onChange={(e) => setFilterPriceRange(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg cursor-pointer accent-teal-700"
                />
              </div>

              {/* MOQ limits */}
              <div className="space-y-1.5 text-xs font-semibold">
                <div className="flex justify-between text-slate-500">
                  <span>MOQ Requirement</span>
                  <span className="font-mono text-slate-700">&le; {filterMoq} units</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={100}
                  step={5}
                  value={filterMoq}
                  onChange={(e) => setFilterMoq(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg cursor-pointer accent-teal-700"
                />
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="lg:col-span-3 space-y-4">
              {filteredProducts.length === 0 ? (
                <div className="p-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                  <SlidersHorizontal className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No matching certified clinical products found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((p) => {
                    const hasWish = wishlist.includes(p.id);
                    const hasComp = compareList.some(item => item.id === p.id);
                    return (
                      <div
                        key={p.id}
                        className="bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-sm overflow-hidden flex flex-col justify-between group transition-all hover:shadow-md"
                      >
                        {/* Image banner */}
                        <div className="relative bg-slate-100 h-44 overflow-hidden shrink-0">
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                          <button
                            onClick={() => handleToggleWishlist(p.id)}
                            className={`p-1.5 rounded-full absolute top-2.5 right-2.5 transition ${
                              hasWish ? 'bg-rose-500 text-white' : 'bg-white text-slate-400 hover:text-rose-500'
                            }`}
                          >
                            <Heart className="w-4 h-4 fill-current" />
                          </button>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3 text-xs">
                          <div>
                            <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                              {p.brand}
                            </span>
                            <h4
                              onClick={() => setSelectedProduct(p)}
                              className="font-bold text-slate-900 mt-1 line-clamp-1 hover:text-teal-700 hover:underline cursor-pointer"
                            >
                              {p.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                              {p.description}
                            </p>
                          </div>

                          <div className="border-t border-slate-50 pt-2 flex items-center justify-between">
                            <div>
                              <span className="text-slate-400 text-[10px] block">Price (Excl Tax)</span>
                              <span className="text-sm font-bold text-teal-800">₹{p.salePrice.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-400 text-[10px] block">MOQ Requirement</span>
                              <span className="font-semibold text-slate-700">{p.moq} unit(s)</span>
                            </div>
                          </div>
                        </div>

                        {/* Card Foot action bars */}
                        <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
                          <button
                            onClick={() => handleToggleCompare(p)}
                            className={`flex items-center gap-1 text-[10px] font-bold py-1 px-2.5 rounded ${
                              hasComp ? 'bg-orange-500 text-white' : 'text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            <Scale className="w-3.5 h-3.5" />
                            {hasComp ? 'Comparing' : 'Compare'}
                          </button>
                          <button
                            onClick={() => handleAddToCart(p)}
                            className="bg-teal-700 hover:bg-teal-800 text-white font-bold py-1.5 px-3.5 rounded-lg flex items-center gap-1 transition text-[10px] uppercase tracking-wide cursor-pointer"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            Procure
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Side by side comparison drawer */}
          {compareList.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl p-6 space-y-4 max-w-4xl mx-auto">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Scale className="w-5 h-5 text-teal-700 animate-pulse" />
                  Biomedical Comparison Dashboard ({compareList.length}/3)
                </h3>
                <button onClick={() => onUpdateCompare([])} className="text-xs text-rose-600 font-semibold uppercase">
                  Clear Compare List
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                {compareList.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl border border-slate-100 space-y-3 relative">
                    <button
                      onClick={() => handleToggleCompare(item)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-rose-600 font-bold"
                    >
                      &times;
                    </button>
                    <h4 className="font-bold text-slate-900 truncate pr-4">{item.name}</h4>
                    <p className="text-[10px] text-teal-700 uppercase font-bold">{item.brand}</p>
                    <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <p className="text-slate-500 flex justify-between">
                        <span>Price (INR)</span>
                        <strong className="text-emerald-700 font-mono">₹{item.salePrice.toLocaleString()}</strong>
                      </p>
                      <p className="text-slate-500 flex justify-between">
                        <span>MOQ Requirements</span>
                        <strong>{item.moq} unit(s)</strong>
                      </p>
                      <p className="text-slate-500 flex justify-between">
                        <span>Warranty duration</span>
                        <strong>{item.warranty || '1 Year'}</strong>
                      </p>
                      <p className="text-slate-500 flex justify-between">
                        <span>Country of origin</span>
                        <strong>{item.countryOfOrigin || 'India'}</strong>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Multi-Vendor Cart view & Checkout */}
      {currentView === 'cart' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          
          {checkoutStep === 'cart' && (
            <>
              {/* Cart List */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-teal-700" />
                  Clinical Procurement Cart
                </h3>

                {cart.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">Your procurement cart is empty. Explore catalog to add certified equipment.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.product.id} className="p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:bg-slate-50/50 transition">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-xl border border-slate-100 shrink-0"
                        />
                        <div className="flex-1 text-xs">
                          <h4 className="font-bold text-slate-900">{item.product.name}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">Supplier: {item.product.vendorName}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="font-bold text-teal-800">₹{item.product.salePrice.toLocaleString('en-IN')}</span>
                            <span className="text-[10px] text-slate-400">HSN: {item.product.hsnCode} | GST: {item.product.gstRate}%</span>
                          </div>
                        </div>

                        {/* Qty controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateCartQty(item.product.id, item.quantity - 1, item.product.moq)}
                            className="p-1 bg-slate-100 hover:bg-slate-200 rounded"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono text-xs font-bold w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateCartQty(item.product.id, item.quantity + 1, item.product.moq)}
                            className="p-1 bg-slate-100 hover:bg-slate-200 rounded"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRemoveFromCart(item.product.id)}
                            className="text-xs font-bold text-rose-600 hover:text-rose-800 ml-4"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* pricing summary */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                  Procurement Quote Summary
                </h3>

                <div className="space-y-2 text-xs font-semibold text-slate-600">
                  <div className="flex justify-between">
                    <span>Clinical Subtotal:</span>
                    <span className="font-mono">₹{getSubtotal().toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Integrated GST taxes:</span>
                    <span className="font-mono">₹{getGstTotal().toLocaleString('en-IN')}</span>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex justify-between text-slate-900 font-bold text-sm">
                    <span>Estimated Final Quote:</span>
                    <span className="font-mono text-teal-800">₹{getCheckoutTotal().toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!currentUser) {
                      addToast('Please sign in or select a profile to proceed with clinical procurement.', 'error');
                      onNavigate('login');
                      return;
                    }
                    if (cart.length === 0) return;
                    setCheckoutStep('checkout');
                  }}
                  disabled={cart.length === 0}
                  className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wide transition text-center cursor-pointer disabled:opacity-50"
                >
                  Proceed with Order Placement
                </button>
              </div>
            </>
          )}

          {checkoutStep === 'checkout' && (
            <div className="lg:col-span-3 max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="text-center pb-6 border-b border-slate-100">
                <Building className="w-12 h-12 text-teal-700 mx-auto mb-2" />
                <h3 className="text-base font-bold text-slate-950 uppercase tracking-wide">Razorpay Secured Checkout</h3>
                <p className="text-xs text-slate-400 mt-1">Complete your B2B corporate clinical procurement clearing</p>
              </div>

              <form onSubmit={handleProceedToPayment} className="space-y-4 text-xs font-semibold">
                
                {/* Shipping Location fields */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Hospital Consignment Destination</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">Detailed Street Address *</label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.address}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-700 transition"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">State *</label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Pincode *</label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.pincode}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Razorpay Method Toggle */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Razorpay Payment Method</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['UPI', 'Credit Card', 'Debit Card', 'Net Banking'] as const).map((method) => {
                      const isActive = razorpayMethod === method;
                      return (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setRazorpayMethod(method)}
                          className={`p-3 rounded-lg border text-center transition ${
                            isActive
                              ? 'bg-teal-50 border-teal-600 text-teal-800 font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {method}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Checkout summary panel info */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>Clinical Subtotal</span>
                    <span className="font-mono">₹{getSubtotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Clinical GST Breakout</span>
                    <span className="font-mono">₹{getGstTotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-slate-800 font-bold">
                    <span>Procurement Grand Total</span>
                    <span className="font-mono text-teal-700">₹{getCheckoutTotal().toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('cart')}
                    className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-center"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 bg-teal-700 hover:bg-teal-800 text-white font-bold py-2.5 rounded-xl text-center uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <IndianRupee className="w-4 h-4" />
                    Submit Secure Payment
                  </button>
                </div>
              </form>
            </div>
          )}

          {checkoutStep === 'processing' && (
            <div className="lg:col-span-3 text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4 max-w-lg mx-auto">
              <Loader2 className="w-12 h-12 text-teal-700 animate-spin mx-auto" />
              <h3 className="text-base font-bold text-slate-900">Contacting Razorpay Secure Gateway...</h3>
              <p className="text-xs text-slate-400">Verifying commercial accounts and clearing clinical consignment authorization</p>
            </div>
          )}

          {checkoutStep === 'success' && createdOrder && (
            <div className="lg:col-span-3 text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6 max-w-lg mx-auto p-6 animate-fade-in">
              <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto" />
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-display">Payment Securely Cleared!</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Your procurement order <strong className="text-slate-800">#{createdOrder.id}</strong> has been logged. 
                  A notifications dispatch alert was triggered to the supplier network.
                </p>
              </div>

              {/* Order specifics */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left text-xs font-semibold space-y-1.5">
                <p className="text-slate-400 uppercase text-[10px]">Consignment Summary</p>
                <div className="flex justify-between">
                  <span>Authorized Cleared Value:</span>
                  <span className="font-mono text-teal-800">₹{createdOrder.finalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Razorpay Reference No:</span>
                  <span className="font-mono text-slate-600">{createdOrder.paymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipment Service:</span>
                  <span className="font-mono text-slate-600">Delhivery Express Courier</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setViewInvoiceOrder(createdOrder)}
                  className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-2.5 rounded-xl text-xs uppercase transition flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  View Commercial Invoice
                </button>
                <button
                  onClick={() => { setCheckoutStep('cart'); onNavigate('marketplace'); }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs uppercase transition"
                >
                  Back to Marketplace
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* RFQ and Tenders Procurement Page */}
      {currentView === 'rfqs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          
          {/* Submit Custom RFQ Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-1 h-fit">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <FilePlus className="w-4.5 h-4.5 text-teal-700" />
              Open Custom Clinical Tender
            </h3>
            <form onSubmit={handleRfqSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="text-slate-500 block mb-1">Equipment Name / Product Requirements *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 50 ICU Ventilators with calibration"
                  value={rfqName}
                  onChange={(e) => setRfqName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-700 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 block mb-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={rfqQty || ''}
                    onChange={(e) => setRfqQty(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">Est. Total Budget (INR) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 500000"
                    value={rfqBudget || ''}
                    onChange={(e) => setRfqBudget(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Consignment Destination (Hospital/Wing) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fortis Hospital, Phase 3, Mohali"
                  value={rfqLocation}
                  onChange={(e) => setRfqLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Detailed Technical Specifications *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe mandatory ISO/CE certifications, specific sensor standards, AMC duration requirements..."
                  value={rfqDesc}
                  onChange={(e) => setRfqDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Upload Tender Specifications Sheet</label>
                <input
                  type="text"
                  placeholder="e.g. Fortis_Tender_Specs_v2.pdf"
                  value={rfqAttachmentName}
                  onChange={(e) => setRfqAttachmentName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-2.5 rounded-xl uppercase tracking-wide transition cursor-pointer"
              >
                Publish Procurement RFQ
              </button>
            </form>
          </div>

          {/* Active Tenders list with Quotation Comparator */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <ClipboardList className="w-5 h-5 text-teal-700" />
              Your Open Tenders & B2B RFQs
            </h3>

            {!currentUser ? (
              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl">
                <p className="text-xs">Authenticate to view open procurements and compare submitted vendor quotes.</p>
              </div>
            ) : rfqs.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No active RFQs posted under this profile.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rfqs.map((rfq) => {
                  const relatedQuotes = quotations.filter(q => q.rfqId === rfq.id);
                  return (
                    <div key={rfq.id} className="p-5 rounded-2xl border border-slate-100 space-y-4 hover:border-slate-200 transition">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-[10px] bg-sky-50 text-sky-700 border border-sky-100 px-2 py-0.5 rounded font-bold font-mono">
                            ID: {rfq.id}
                          </span>
                          <h4 className="font-bold text-slate-900 mt-1.5 text-sm sm:text-base">{rfq.productName}</h4>
                          <p className="text-[11px] text-slate-500 mt-1 leading-normal">{rfq.description}</p>
                          <div className="flex flex-wrap gap-4 mt-3 text-[10px] text-slate-400 font-semibold">
                            <span>Quantity: <strong className="text-slate-700">{rfq.quantity} units</strong></span>
                            <span>Budget: <strong className="text-emerald-700">₹{rfq.budget.toLocaleString()}</strong></span>
                            <span>Destination: <strong className="text-slate-700">{rfq.deliveryLocation}</strong></span>
                            <span>Status: <strong className={rfq.status === 'Open' ? 'text-teal-700' : 'text-slate-400'}>{rfq.status}</strong></span>
                          </div>
                        </div>

                        {rfq.status === 'Open' && relatedQuotes.length > 0 && (
                          <button
                            onClick={() => setActiveRfqReview(rfq)}
                            className="bg-teal-700 hover:bg-teal-800 text-white text-[10px] font-bold px-3.5 py-2 rounded-xl shrink-0 uppercase tracking-wide flex items-center gap-1"
                          >
                            <Scale className="w-3.5 h-3.5" />
                            Compare {relatedQuotes.length} Bid(s)
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* RFQ quote comparator overlay popup modal */}
      {activeRfqReview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-100 animate-scale-up">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                RFQ Quote Comparison Sheet: {activeRfqReview.productName}
              </h3>
              <button onClick={() => setActiveRfqReview(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xl leading-none">&times;</button>
            </div>

            <div className="p-6 overflow-x-auto text-xs font-semibold">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Partner Supplying Company</th>
                    <th className="py-3 px-3 text-right">Price per Unit</th>
                    <th className="py-3 px-3 text-right">Total Commercial Price</th>
                    <th className="py-3 px-3 text-center">Fulfillment Time</th>
                    <th className="py-3 px-4">Specifications & Warranty Included</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {quotations.filter(q => q.rfqId === activeRfqReview.id).map((quo) => (
                    <tr key={quo.id} className="hover:bg-slate-50/40">
                      <td className="py-4 px-4 font-bold text-slate-900">{quo.companyName}</td>
                      <td className="py-4 px-3 text-right font-mono text-slate-800">₹{quo.pricePerUnit.toLocaleString('en-IN')}</td>
                      <td className="py-4 px-3 text-right font-mono text-teal-800 font-bold">₹{quo.totalPrice.toLocaleString('en-IN')}</td>
                      <td className="py-4 px-3 text-center text-slate-800">{quo.deliveryDays} Days</td>
                      <td className="py-4 px-4 text-slate-500 leading-normal font-normal">{quo.specifications}</td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleAcceptQuotation(quo, activeRfqReview)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition"
                        >
                          Accept & Pay
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal Popup */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 animate-scale-up flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 bg-slate-100 h-64 md:h-auto overflow-hidden relative">
              <img
                src={selectedProduct.images[0]}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleToggleWishlist(selectedProduct.id)}
                className="p-1.5 bg-white text-slate-400 hover:text-rose-600 rounded-full absolute top-4 left-4 shadow-sm"
              >
                <Heart className={`w-4 h-4 ${wishlist.includes(selectedProduct.id) ? 'fill-rose-600 text-rose-600' : ''}`} />
              </button>
            </div>

            <div className="w-full md:w-1/2 p-6 flex flex-col justify-between text-xs">
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded font-mono uppercase">
                      SKU: {selectedProduct.sku}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1.5 font-display">{selectedProduct.name}</h3>
                  </div>
                  <button onClick={() => setSelectedProduct(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xl leading-none">&times;</button>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed leading-normal">
                  {selectedProduct.description}
                </p>

                {/* Spec parameters */}
                <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="font-semibold text-slate-700 text-[10px] uppercase mb-1.5">clinical validations</p>
                  {selectedProduct.specifications.map((spec, idx) => (
                    <div key={idx} className="flex justify-between text-slate-600 leading-normal">
                      <span>{spec.key}:</span>
                      <strong className="text-slate-800">{spec.value}</strong>
                    </div>
                  ))}
                  <div className="flex justify-between text-slate-600 leading-normal">
                    <span>HSN Code:</span>
                    <strong className="text-slate-800">{selectedProduct.hsnCode}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600 leading-normal">
                    <span>GST Rate:</span>
                    <strong className="text-slate-800">{selectedProduct.gstRate}% Integrated</strong>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 mt-6 flex justify-between items-center gap-3">
                <div>
                  <span className="text-slate-400 text-[9px] block">Unit Price (INR)</span>
                  <span className="text-base font-bold text-teal-800">₹{selectedProduct.salePrice.toLocaleString('en-IN')}</span>
                </div>
                <button
                  onClick={() => { handleAddToCart(selectedProduct); setSelectedProduct(null); }}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold py-2 px-5 rounded-xl uppercase tracking-wide transition flex items-center gap-1.5 text-[10px]"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice modal visual overlay */}
      {viewInvoiceOrder && (
        <InvoicePDF order={viewInvoiceOrder} onClose={() => setViewInvoiceOrder(null)} addToast={addToast} />
      )}

    </div>
  );
}
