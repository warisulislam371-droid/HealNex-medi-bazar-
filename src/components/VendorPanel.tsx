import React, { useState, useEffect } from 'react';
import { dbLocal } from '../db';
import { Vendor, Product, Order, RFQ, Quotation, User } from '../types';
import { supabase, isSupabaseConfigured } from '../supabase';
import {
  Store,
  Upload,
  Layers,
  FileSpreadsheet,
  Plus,
  Send,
  Truck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ClipboardList,
  IndianRupee,
  Package,
  Calendar,
  FileText,
  CreditCard,
  TrendingUp,
  Percent,
  Clock,
  Settings,
  AlertCircle,
  DollarSign,
  RefreshCw
} from 'lucide-react';

interface VendorPanelProps {
  currentUser: User | null;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function VendorPanel({ currentUser, addToast }: VendorPanelProps) {
  const [vendorProfile, setVendorProfile] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'products' | 'bulk' | 'orders' | 'rfqs' | 'payout_settings' | 'earnings'>('products');

  // Payout Settings State
  const [payoutMethod, setPayoutMethod] = useState<'UPI' | 'Razorpay Route' | 'Bank'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [razorpayAccountId, setRazorpayAccountId] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccNo, setBankAccNo] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isSavingPayout, setIsSavingPayout] = useState(false);
  const [loadingPayout, setLoadingPayout] = useState(false);

  // Earnings State
  const [earningsLogs, setEarningsLogs] = useState<any[]>([]);
  const [loadingEarnings, setLoadingEarnings] = useState(false);
  const [thisMonthEarnings, setThisMonthEarnings] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);

  // Fetch Vendor Payout Settings from Supabase or LocalStorage
  const fetchPayoutSettings = async () => {
    if (!currentUser) return;
    setLoadingPayout(true);
    let dbPayout: any = null;

    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('vendor_payouts')
          .select('*')
          .eq('vendor_id', currentUser.id)
          .maybeSingle();
        if (data && !error) {
          dbPayout = data;
        }
      }
    } catch (err) {
      console.warn('Error fetching payout settings from Supabase, pulling locally:', err);
    }

    const localPayouts = JSON.parse(localStorage.getItem('healnex_vendor_payouts') || '[]');
    const localPayout = localPayouts.find((p: any) => p.vendor_id === currentUser.id);
    const finalPayout = dbPayout || localPayout;

    if (finalPayout) {
      setPayoutMethod(finalPayout.payment_method || 'UPI');
      setUpiId(finalPayout.upi_id || '');
      setRazorpayAccountId(finalPayout.razorpay_account_id || '');
      setBankName(finalPayout.bank_name || '');
      setBankAccNo(finalPayout.bank_acc_no || '');
      setBankIfsc(finalPayout.bank_ifsc || '');
      setIsVerified(finalPayout.is_verified || false);
    } else {
      // Default / empty
      setPayoutMethod('UPI');
      setUpiId('');
      setRazorpayAccountId('');
      setBankName('');
      setBankAccNo('');
      setBankIfsc('');
      setIsVerified(false);
    }
    setLoadingPayout(false);
  };

  // Save Payout Settings to Supabase or LocalStorage
  const handleSavePayoutSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // UPI Regex Verification: ^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$
    if (payoutMethod === 'UPI') {
      const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
      if (!upiRegex.test(upiId)) {
        addToast('Invalid UPI ID format. Correct structure is merchant@bank (e.g. shop@okaxis).', 'error');
        return;
      }
    }

    setIsSavingPayout(true);
    const payload = {
      vendor_id: currentUser.id,
      payment_method: payoutMethod,
      upi_id: payoutMethod === 'UPI' ? upiId : '',
      razorpay_account_id: payoutMethod === 'Razorpay Route' ? razorpayAccountId : '',
      bank_name: payoutMethod === 'Bank' ? bankName : '',
      bank_acc_no: payoutMethod === 'Bank' ? bankAccNo : '',
      bank_ifsc: payoutMethod === 'Bank' ? bankIfsc : '',
      is_verified: isVerified // Preserve the verification check
    };

    let savedCloud = false;
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('vendor_payouts')
          .upsert(payload, { onConflict: 'vendor_id' });
        if (!error) savedCloud = true;
        else console.error('Supabase payout update failed:', error);
      }
    } catch (err) {
      console.warn('Exception updating payout in Supabase:', err);
    }

    // Save locally
    const localPayouts = JSON.parse(localStorage.getItem('healnex_vendor_payouts') || '[]');
    const existingIndex = localPayouts.findIndex((p: any) => p.vendor_id === currentUser.id);
    if (existingIndex > -1) {
      localPayouts[existingIndex] = payload;
    } else {
      localPayouts.push(payload);
    }
    localStorage.setItem('healnex_vendor_payouts', JSON.stringify(localPayouts));

    setIsSavingPayout(false);
    addToast(savedCloud 
      ? 'Payout setup registered successfully in cloud.' 
      : 'Payout setup saved locally. Awaiting verification by HealNex administrator.', 'success');
  };

  // Fetch Vendor Earnings from Supabase or LocalStorage
  const fetchVendorEarnings = async () => {
    if (!currentUser) return;
    setLoadingEarnings(true);
    let dbLogs: any[] = [];

    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('commission_logs')
          .select('*')
          .eq('vendor_id', currentUser.id);
        if (data && !error) {
          dbLogs = data;
        }
      }
    } catch (err) {
      console.warn('Error fetching commission logs for vendor from Supabase:', err);
    }

    const localLogsStr = localStorage.getItem('healnex_commission_logs');
    const localLogs = JSON.parse(localLogsStr || '[]');
    const myLocalLogs = localLogs.filter((l: any) => l.vendor_id === currentUser.id);

    const finalLogs = dbLogs.length > 0 ? dbLogs : myLocalLogs;

    // Sort logs descending by date
    finalLogs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Calculate metrics
    let thisMonth = 0;
    let pending = 0;
    let paid = 0;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    finalLogs.forEach((log: any) => {
      const payoutVal = Number(log.vendor_payout) || 0;
      const logDate = new Date(log.created_at);
      
      if (logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear) {
        thisMonth += payoutVal;
      }
      if (log.status === 'transferred') {
        paid += payoutVal;
      } else {
        pending += payoutVal;
      }
    });

    setEarningsLogs(finalLogs);
    setThisMonthEarnings(thisMonth);
    setPendingAmount(pending);
    setTotalPaid(paid);
    setLoadingEarnings(false);
  };

  // Active Tab triggers loading
  useEffect(() => {
    if (activeTab === 'payout_settings') {
      fetchPayoutSettings();
    } else if (activeTab === 'earnings') {
      fetchVendorEarnings();
    }
  }, [activeTab]);

  // Add Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdBrand, setNewProdBrand] = useState('');
  const [newProdCat, setNewProdCat] = useState('Medical Equipment');
  const [newProdSubcat, setNewProdSubcat] = useState('ECG Machine');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdPrice, setNewProdPrice] = useState(0);
  const [newProdSalePrice, setNewProdSalePrice] = useState(0);
  const [newProdMoq, setNewProdMoq] = useState(1);
  const [newProdQty, setNewProdQty] = useState(10);
  const [newProdHsn, setNewProdHsn] = useState('90181100');
  const [newProdGst, setNewProdGst] = useState(12);
  const [newProdWarranty, setNewProdWarranty] = useState('1 Year Standard');
  const [newProdOrigin, setNewProdOrigin] = useState('India');
  const [newProdImage, setNewProdImage] = useState('https://images.unsplash.com/photo-1516549655169-df83a0774514');

  // Quotation/Bidding Form State
  const [activeRfqBid, setActiveRfqBid] = useState<RFQ | null>(null);
  const [bidPrice, setBidPrice] = useState<number>(0);
  const [bidDeliveryDays, setBidDeliveryDays] = useState<number>(5);
  const [bidValidDate, setBidValidDate] = useState('2026-07-30');
  const [bidSpecs, setBidSpecs] = useState('');

  // Bulk Upload state
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkStatus, setBulkStatus] = useState('');

  // Order tracking update states
  const [trackingNumber, setTrackingNumber] = useState('');
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<Order | null>(null);

  const loadData = () => {
    if (!currentUser) return;
    const vendorsList = dbLocal.getVendors();
    const profile = vendorsList.find(v => v.id === currentUser.id) || null;
    setVendorProfile(profile);

    const prods = dbLocal.getProducts().filter(p => p.vendorId === currentUser.id);
    setProducts(prods);

    const ords = dbLocal.getOrders().filter(o => o.vendorId === currentUser.id);
    setOrders(ords);

    // RFQs are public
    const openRfqs = dbLocal.getRfqs().filter(r => r.status === 'Open');
    setRfqs(openRfqs);

    const quotes = dbLocal.getQuotations().filter(q => q.vendorId === currentUser.id);
    setQuotations(quotes);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !vendorProfile) return;
    if (vendorProfile.status !== 'Approved') {
      addToast('Action blocked. Registered Vendor credentials must be audited & approved by HealNex Administrators first.', 'error');
      return;
    }

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      vendorId: currentUser.id,
      vendorName: vendorProfile.companyName,
      name: newProdName,
      sku: newProdSku || `SKU-${Date.now().toString().slice(-6)}`,
      brand: newProdBrand,
      category: newProdCat,
      subcategory: newProdSubcat,
      description: newProdDesc,
      specifications: [
        { key: 'Warranty', value: newProdWarranty },
        { key: 'Country of Origin', value: newProdOrigin }
      ],
      price: Number(newProdPrice),
      salePrice: Number(newProdSalePrice) || Number(newProdPrice),
      moq: Number(newProdMoq),
      stockQuantity: Number(newProdQty),
      hsnCode: newProdHsn,
      gstRate: Number(newProdGst),
      warranty: newProdWarranty,
      countryOfOrigin: newProdOrigin,
      images: [newProdImage],
      status: 'Pending', // All new products are Pending Admin verification
      createdAt: new Date().toISOString()
    };

    const allProducts = dbLocal.getProducts();
    allProducts.unshift(newProduct);
    dbLocal.saveProducts(allProducts);

    // Add push alert for administrators
    dbLocal.addNotification(
      'admin',
      `New Product Submission: ${newProduct.name}`,
      `Vendor ${vendorProfile.companyName} has submitted a new product in ${newProduct.category}. Review required.`,
      'product_submitted'
    );

    // Clear form
    setNewProdName('');
    setNewProdSku('');
    setNewProdBrand('');
    setNewProdDesc('');
    setNewProdPrice(0);
    setNewProdSalePrice(0);
    setNewProdMoq(1);
    setNewProdQty(10);

    addToast('Product submitted successfully! It is currently undergoing administrative audit prior to catalog publishing.', 'success');
    loadData();
  };

  const handleBulkUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorProfile || vendorProfile.status !== 'Approved') {
      addToast('Action blocked. Only approved partners can execute catalog sync operations.', 'error');
      return;
    }
    if (!bulkFile) {
      addToast('Please select a .csv or .xlsx clinical catalog file.', 'error');
      return;
    }

    setBulkStatus('Processing spreadsheet columns...');
    setTimeout(() => {
      // Create simulated bulk products
      const bulkProds: Product[] = [
        {
          id: `prod-bulk-1-${Date.now()}`,
          vendorId: currentUser!.id,
          vendorName: vendorProfile.companyName,
          name: 'High Precision Infusion Pump (HealNex Standard)',
          sku: 'SKU-BULK-INF1',
          brand: 'HealNex Medical',
          category: 'Medical Equipment',
          subcategory: 'Infusion Pump',
          description: 'Intelligent volumetric infusion pump with micro-flow rates, dual air-in-line bubbles detection, and occlusion sensors.',
          specifications: [{ key: 'Flow Rate', value: '0.1 - 1200 ml/h' }],
          price: 45000,
          salePrice: 38000,
          moq: 2,
          stockQuantity: 40,
          hsnCode: '90189019',
          gstRate: 12,
          warranty: '1 Year Warranty',
          countryOfOrigin: 'India',
          images: ['https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&q=80&w=400'],
          status: 'Pending',
          createdAt: new Date().toISOString()
        },
        {
          id: `prod-bulk-2-${Date.now()}`,
          vendorId: currentUser!.id,
          vendorName: vendorProfile.companyName,
          name: 'Portable Hospital Suction Machine 22L',
          sku: 'SKU-BULK-SUC2',
          brand: 'HealNex Surgical',
          category: 'Surgical Instruments',
          subcategory: 'Surgical Kits',
          description: 'High vacuum, high flow medical suction unit for clinical drainage applications. Built with oil-free lubrication piston pump.',
          specifications: [{ key: 'Pumping Rate', value: '22 Litres per minute' }],
          price: 18000,
          salePrice: 15000,
          moq: 1,
          stockQuantity: 20,
          hsnCode: '90189019',
          gstRate: 12,
          warranty: '1 Year Warranty',
          countryOfOrigin: 'India',
          images: ['https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400'],
          status: 'Pending',
          createdAt: new Date().toISOString()
        }
      ];

      const all = dbLocal.getProducts();
      dbLocal.saveProducts([...bulkProds, ...all]);

      // Alert admins
      dbLocal.addNotification(
        'admin',
        `Bulk Catalog Upload: ${vendorProfile.companyName}`,
        `${vendorProfile.companyName} uploaded 2 new catalog items via CSV. Auditing required.`,
        'product_submitted'
      );

      setBulkStatus('Bulk Sync Complete! 2 catalog items added in Pending verification stage.');
      setBulkFile(null);
      loadData();
    }, 2000);
  };

  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !vendorProfile || !activeRfqBid) return;

    const newQuotation: Quotation = {
      id: `QUO-${Date.now()}`,
      rfqId: activeRfqBid.id,
      vendorId: currentUser.id,
      vendorName: vendorProfile.ownerName,
      companyName: vendorProfile.companyName,
      pricePerUnit: Number(bidPrice),
      totalPrice: Number(bidPrice) * activeRfqBid.quantity,
      validUntil: bidValidDate,
      deliveryDays: Number(bidDeliveryDays),
      specifications: bidSpecs,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    const quotes = dbLocal.getQuotations();
    quotes.push(newQuotation);
    dbLocal.saveQuotations(quotes);

    // Update quote count on RFQ
    const allRfqs = dbLocal.getRfqs().map(r => {
      if (r.id === activeRfqBid.id) {
        return { ...r, quotationsCount: (r.quotationsCount || 0) + 1 };
      }
      return r;
    });
    dbLocal.saveRfqs(allRfqs);

    // Alert Customer
    dbLocal.addNotification(
      activeRfqBid.customerId,
      `New Quotation Received: ${vendorProfile.companyName}`,
      `Vendor ${vendorProfile.companyName} submitted a bid of ₹${newQuotation.totalPrice.toLocaleString('en-IN')} for your RFQ "${activeRfqBid.productName}".`,
      'quote_received'
    );

    addToast('Your commercial bid proposal has been submitted successfully to the clinical client.', 'success');
    setActiveRfqBid(null);
    setBidPrice(0);
    setBidSpecs('');
    loadData();
  };

  const handleOrderStatusUpdate = (orderId: string, nextStatus: Order['status']) => {
    const allOrders = dbLocal.getOrders().map(o => {
      if (o.id === orderId) {
        const updatedTimeline = [
          ...o.timeline,
          {
            status: nextStatus,
            time: new Date().toISOString(),
            note: `Status updated by dispatching vendor. Tracking details updated.`
          }
        ];
        
        let trackNo = o.trackingNumber;
        if (nextStatus === 'Shipped' && trackingNumber) {
          trackNo = trackingNumber;
        }

        // Notify customer
        dbLocal.addNotification(
          o.customerId,
          `Order Status: ${nextStatus}`,
          `Your equipment order #${o.id} status has changed to ${nextStatus}.`,
          nextStatus === 'Shipped' ? 'order_shipped' : 'order_delivered'
        );

        return {
          ...o,
          status: nextStatus,
          trackingNumber: trackNo,
          shippingProvider: o.shippingProvider || 'Delhivery',
          timeline: updatedTimeline
        };
      }
      return o;
    });
    dbLocal.saveOrders(allOrders);
    setTrackingNumber('');
    setSelectedTrackingOrder(null);
    addToast(`Order status synced as ${nextStatus}!`, 'success');
    loadData();
  };

  const isApproved = vendorProfile?.status === 'Approved';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Pending status banner block */}
      {vendorProfile && !isApproved && (
        <div className="bg-amber-50 border-l-4 border-amber-600 rounded-xl p-4 mb-8 flex items-start gap-3 text-xs leading-relaxed text-amber-900 shadow-sm animate-pulse">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Clinical Vendor Account Pending Verification</h4>
            <p className="mt-1">
              Your business credentials, GST Identification, and Trade certificates are undergoing active administrative validation.
              You will be notified once HealNex administrators approve your profile. 
              <strong> You cannot list catalog equipment, respond to hospital RFQs, or collect orders in the pending stage.</strong>
            </p>
          </div>
        </div>
      )}

      {/* Panel header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-teal-700">
            <Store className="w-6 h-6" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
              {vendorProfile ? vendorProfile.companyName : 'Partner Console'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Supplier Workspace: Catalog synchronization, stock replenishment, RFQ bids, and clinical logistics tracking.
          </p>
        </div>

        {/* Tab triggers */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'products' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Clinical Catalog ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'bulk' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
            disabled={!isApproved}
            style={{ opacity: isApproved ? 1 : 0.5 }}
          >
            Bulk Sync (CSV)
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'orders' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Fulfillment Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('rfqs')}
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'rfqs' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
            disabled={!isApproved}
            style={{ opacity: isApproved ? 1 : 0.5 }}
          >
            B2B Tenders/RFQs ({rfqs.length})
          </button>
          <button
            onClick={() => setActiveTab('payout_settings')}
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'payout_settings' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Payout Settings
          </button>
          <button
            onClick={() => setActiveTab('earnings')}
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'earnings' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Earnings History
          </button>
        </div>
      </div>

      {/* products tab */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* Add product form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-1 h-fit">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-teal-700" />
              Add Medical Product
            </h3>
            <form onSubmit={handleAddProduct} className="space-y-4 text-xs font-medium">
              <div>
                <label className="text-slate-500 block mb-1">Equipment Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dual Syringe Infusion Pump"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-700 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 block mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Philips"
                    value={newProdBrand}
                    onChange={(e) => setNewProdBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-700 transition"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">SKU Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. HN-INF-P2"
                    value={newProdSku}
                    onChange={(e) => setNewProdSku(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-700 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 block mb-1">Category</label>
                  <select
                    value={newProdCat}
                    onChange={(e) => setNewProdCat(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-700 transition"
                  >
                    <option>Medical Equipment</option>
                    <option>Laboratory Equipment</option>
                    <option>Dental Equipment</option>
                    <option>Surgical Instruments</option>
                    <option>Hospital Furniture</option>
                    <option>Homecare Devices</option>
                    <option>Consumables</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">Subcategory</label>
                  <input
                    type="text"
                    required
                    value={newProdSubcat}
                    onChange={(e) => setNewProdSubcat(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-700 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Clinical Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail functional specifications, therapeutic certifications, sensor accuracies..."
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-700 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 block mb-1">Price (Excl GST) *</label>
                  <input
                    type="number"
                    required
                    placeholder="INR Price"
                    value={newProdPrice || ''}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-700 transition"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">MOQ (B2B units) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="Min Order Qty"
                    value={newProdMoq || ''}
                    onChange={(e) => setNewProdMoq(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-700 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-500 block mb-1">Stock</label>
                  <input
                    type="number"
                    required
                    value={newProdQty || ''}
                    onChange={(e) => setNewProdQty(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">HSN</label>
                  <input
                    type="text"
                    required
                    value={newProdHsn}
                    onChange={(e) => setNewProdHsn(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">GST %</label>
                  <select
                    value={newProdGst}
                    onChange={(e) => setNewProdGst(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none"
                  >
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Clinical Image URL (Unsplash)</label>
                <input
                  type="text"
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={!isApproved}
                className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-2.5 rounded-xl transition text-center uppercase tracking-wide cursor-pointer disabled:opacity-50"
              >
                Submit Clinical Product
              </button>
            </form>
          </div>

          {/* Catalog Listing */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Partner Equipment Catalog</h3>
            {products.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-xs">Your clinical product catalog is empty.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((p) => (
                  <div key={p.id} className="p-4 rounded-xl border border-slate-100 flex gap-4 items-start hover:bg-slate-50/50 transition">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-16 h-16 object-cover rounded-xl border border-slate-100 shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{p.name}</h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                          p.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-orange-50 text-orange-700 border-orange-100'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wide">
                        SKU: {p.sku} | HSN: {p.hsnCode} | GST: {p.gstRate}%
                      </p>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-xs font-bold text-teal-800">₹{p.price.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-slate-500">Stock Available: <strong>{p.stockQuantity}</strong> units</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CSV sync tab */}
      {activeTab === 'bulk' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto animate-fade-in">
          <div className="text-center pb-6 border-b border-slate-100 mb-6">
            <FileSpreadsheet className="w-12 h-12 text-teal-700 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-900">B2B Bulk Catalog Synchronizer</h3>
            <p className="text-xs text-slate-400 mt-1">
              Upload standard medical inventory spreadsheets (.csv or .xlsx) containing clinical specifications.
            </p>
          </div>

          <form onSubmit={handleBulkUpload} className="space-y-4">
            <div className="border-2 border-dashed border-slate-200 hover:border-teal-600 rounded-2xl p-8 text-center transition bg-slate-50/50">
              <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <input
                type="file"
                accept=".csv, .xlsx"
                onChange={(e) => setBulkFile(e.target.files ? e.target.files[0] : null)}
                className="hidden"
                id="bulk-file-picker"
              />
              <label htmlFor="bulk-file-picker" className="cursor-pointer text-xs font-bold text-teal-700 hover:text-teal-900">
                {bulkFile ? bulkFile.name : 'Select clinical inventory spreadsheet'}
              </label>
              <p className="text-[10px] text-slate-400 mt-1">Supports columns: Name, SKU, Category, Price, MOQ, HSNCode, GST, Description</p>
            </div>

            {bulkStatus && (
              <div className="bg-slate-50 p-3 rounded-lg border text-xs text-center text-teal-800 font-semibold font-mono animate-pulse">
                {bulkStatus}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wide transition cursor-pointer"
            >
              Execute Bulk Catalog Upload
            </button>
          </form>
        </div>
      )}

      {/* Orders log tab */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Customer Equipment Sales</h3>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-xs">No orders received yet. Catalog must be approved to receive sales.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {orders.map((o) => (
                <div key={o.id} className="p-6 flex flex-col md:flex-row justify-between gap-6 hover:bg-slate-50/30 transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">Order ID: #{o.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                        o.status === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : o.status === 'Shipped'
                          ? 'bg-sky-50 text-sky-700 border-sky-100'
                          : 'bg-orange-50 text-orange-700 border-orange-100 animate-pulse'
                      }`}>
                        {o.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">
                      Purchaser: {o.customerName} | Email: {o.customerEmail}
                    </p>
                    
                    <div className="mt-3 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100 max-w-md">
                      {o.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-slate-700">
                          <span>{item.productName} <strong>(x{item.quantity})</strong></span>
                          <span className="font-mono">₹{item.price.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>

                    {o.trackingNumber && (
                      <p className="text-[10px] text-slate-500 font-mono mt-3">
                        Courier: <strong>{o.shippingProvider} ({o.trackingNumber})</strong>
                      </p>
                    )}
                  </div>

                  <div className="flex sm:flex-col justify-end items-end gap-2 shrink-0">
                    {o.status === 'Pending' && (
                      <button
                        onClick={() => handleOrderStatusUpdate(o.id, 'Confirmed')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-4 py-2 rounded-xl transition w-full sm:w-36 text-center"
                      >
                        Confirm Order
                      </button>
                    )}
                    {o.status === 'Confirmed' && (
                      <button
                        onClick={() => handleOrderStatusUpdate(o.id, 'Processing')}
                        className="bg-teal-700 hover:bg-teal-800 text-white text-[11px] font-bold px-4 py-2 rounded-xl transition w-full sm:w-36 text-center"
                      >
                        Start Processing
                      </button>
                    )}
                    {o.status === 'Processing' && (
                      <div className="space-y-2 w-full sm:w-44">
                        <input
                          type="text"
                          placeholder="Delhivery Tracking No"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          className="w-full bg-slate-50 border text-xs p-2 rounded-lg"
                        />
                        <button
                          onClick={() => handleOrderStatusUpdate(o.id, 'Shipped')}
                          disabled={!trackingNumber}
                          className="w-full bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold py-2 rounded-xl disabled:opacity-50"
                        >
                          Dispatch / Ship
                        </button>
                      </div>
                    )}
                    {o.status === 'Shipped' && (
                      <button
                        onClick={() => handleOrderStatusUpdate(o.id, 'Delivered')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-4 py-2 rounded-xl transition w-full sm:w-36 text-center"
                      >
                        Deliver / Handover
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RFQ bidding section */}
      {activeTab === 'rfqs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* Active Tenders list */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <ClipboardList className="w-5 h-5 text-teal-700" />
              Active Hospital Procurement Tenders (RFQs)
            </h3>

            {rfqs.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No active RFQs matching catalog channels.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rfqs.map((r) => {
                  const myBid = quotations.find(q => q.rfqId === r.id);
                  return (
                    <div key={r.id} className="p-5 rounded-2xl border border-slate-100 hover:border-slate-200 transition">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-[10px] bg-sky-50 text-sky-700 border border-sky-100 px-2 py-0.5 rounded-md font-bold">
                            Tender ID: {r.id}
                          </span>
                          <h4 className="font-bold text-slate-900 mt-2 text-sm sm:text-base">{r.productName}</h4>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{r.description}</p>
                          <div className="flex flex-wrap gap-4 mt-3 text-[10px] text-slate-400 font-semibold">
                            <span>Quantity: <strong className="text-slate-700">{r.quantity} units</strong></span>
                            <span>Est. Budget: <strong className="text-emerald-700">₹{r.budget.toLocaleString('en-IN')}</strong></span>
                            <span>Destination: <strong className="text-slate-700">{r.deliveryLocation}</strong></span>
                          </div>
                        </div>

                        {!myBid ? (
                          <button
                            onClick={() => {
                              setActiveRfqBid(r);
                              setBidPrice(Math.round(r.budget / r.quantity));
                            }}
                            className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-4 py-2 rounded-xl shrink-0 transition"
                          >
                            Send Quote
                          </button>
                        ) : (
                          <div className="text-right shrink-0">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              myBid.status === 'Accepted'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-50 text-slate-500 border-slate-200'
                            }`}>
                              Bid: {myBid.status}
                            </span>
                            <p className="text-xs font-bold text-slate-900 font-mono mt-1">₹{myBid.totalPrice.toLocaleString('en-IN')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active quote placement board */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-1 h-fit">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Send className="w-4 h-4 text-teal-700" />
              RFQ Bid Sheet
            </h3>

            {activeRfqBid ? (
              <form onSubmit={handleBidSubmit} className="space-y-4 text-xs font-medium">
                <div className="bg-teal-50/50 p-3 rounded-lg border border-teal-100">
                  <p className="text-[10px] text-teal-800 uppercase font-bold tracking-wide">Target Hospital Project</p>
                  <p className="font-bold text-slate-800 mt-1">{activeRfqBid.productName}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Need: {activeRfqBid.quantity} units | Budget limit: ₹{activeRfqBid.budget.toLocaleString()}</p>
                </div>

                <div>
                  <label className="text-slate-500 block mb-1">Commercial Price (Per Unit) *</label>
                  <input
                    type="number"
                    required
                    value={bidPrice || ''}
                    onChange={(e) => setBidPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none font-mono text-xs font-bold"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Total Bid Value: <strong className="text-emerald-700 font-mono">₹{(bidPrice * activeRfqBid.quantity).toLocaleString()}</strong></p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-500 block mb-1">Lead Time (Days)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={bidDeliveryDays}
                      onChange={(e) => setBidDeliveryDays(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Offer Valid Until</label>
                    <input
                      type="date"
                      required
                      value={bidValidDate}
                      onChange={(e) => setBidValidDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-500 block mb-1">Specifications & Warranty Inclusion</label>
                  <textarea
                    rows={3}
                    placeholder="Describe specific ISO/CE standards, installation services included..."
                    value={bidSpecs}
                    onChange={(e) => setBidSpecs(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveRfqBid(null)}
                    className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 bg-teal-700 hover:bg-teal-800 text-white font-bold py-2.5 rounded-xl text-center"
                  >
                    Submit Quotation
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center text-slate-400 p-8">
                <IndianRupee className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-xs">Select "Send Quote" on an active tender to construct your bid sheet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payout Settings Section */}
      {activeTab === 'payout_settings' && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6 animate-fade-in font-semibold text-xs text-slate-800">
          <div className="text-center pb-4 border-b border-slate-100">
            <CreditCard className="w-12 h-12 text-teal-700 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-900 font-display">Settlement Payout Settings</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Manage your commercial destination accounts for receiving clinical equipment sales clearances</p>
          </div>

          {loadingPayout ? (
            <div className="py-12 text-center text-slate-400 font-semibold">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-teal-700 mb-2" />
              Loading payout credentials...
            </div>
          ) : (
            <form onSubmit={handleSavePayoutSettings} className="space-y-5">
              
              {/* Status Banner */}
              <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                isVerified 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                {isVerified ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                )}
                <div>
                  <span className="block font-bold text-slate-950">
                    Settlement Status: {isVerified ? 'Certified & Verified' : 'Awaiting Administration Verification'}
                  </span>
                  <span className="block text-[10px] text-slate-500 mt-0.5 leading-normal">
                    {isVerified 
                      ? 'Your account credentials are verified. Automated settlements are fully active.'
                      : 'Changes to payout accounts must be reviewed and certified by HealNex administration before clearing can occur.'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Preferred Settlement Target</label>
                <select
                  value={payoutMethod}
                  onChange={(e: any) => setPayoutMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-teal-700 font-bold"
                >
                  <option value="UPI">UPI Address Transfer</option>
                  <option value="Razorpay Route">Razorpay Route (Linked Sub-account ID)</option>
                  <option value="Bank">Direct Corporate Bank Transfer</option>
                </select>
              </div>

              {payoutMethod === 'UPI' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">UPI ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. yourcompany@okaxis"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-teal-700 font-mono font-semibold"
                  />
                  <p className="text-[10px] text-slate-400 mt-1.5 font-normal">Standard UPI format: name@bankname. Verified via Regex routing constraint.</p>
                </div>
              )}

              {payoutMethod === 'Razorpay Route' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Razorpay Account ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. acc_xxxxxxxxxxxxx"
                    value={razorpayAccountId}
                    onChange={(e) => setRazorpayAccountId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-teal-700 font-mono font-semibold"
                  />
                  <p className="text-[10px] text-slate-400 mt-1.5 font-normal">Your custom sub-account ID allocated from Razorpay platform for split transfer payments.</p>
                </div>
              )}

              {payoutMethod === 'Bank' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Corporate Bank Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. HDFC Bank Ltd."
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-teal-700 font-semibold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Account Number</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 5020008402482"
                        value={bankAccNo}
                        onChange={(e) => setBankAccNo(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-teal-700 font-mono font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">IFSC Code</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. HDFC0000240"
                        value={bankIfsc}
                        onChange={(e) => setBankIfsc(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-teal-700 font-mono font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSavingPayout}
                className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300"
              >
                <Plus className="w-4 h-4" />
                {isSavingPayout ? 'Saving Accounts Setup...' : 'Save & Certify Settlement Targets'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Earnings History Section */}
      {activeTab === 'earnings' && (
        <div className="space-y-8 animate-fade-in font-semibold text-xs text-slate-800">
          
          {/* Top Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-teal-50 text-teal-700 rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">This Month Earnings</span>
                <span className="block text-lg font-bold text-slate-900 font-mono mt-0.5">
                  ₹{thisMonthEarnings.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Settlement Clearance</span>
                <span className="block text-lg font-bold text-amber-700 font-mono mt-0.5">
                  ₹{pendingAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Payouts Cleared</span>
                <span className="block text-lg font-bold text-emerald-700 font-mono mt-0.5">
                  ₹{totalPaid.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Table history */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-5 h-5 text-teal-700" />
                  Supplier Settlement History Logs
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Audit log of payments cleared, net vendor payouts, and automated transfer transaction codes.</p>
              </div>
              <button
                onClick={fetchVendorEarnings}
                className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition w-fit cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh History
              </button>
            </div>

            {loadingEarnings ? (
              <div className="py-16 text-center text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-teal-700 mb-2" />
                Querying ledger balances...
              </div>
            ) : earningsLogs.length === 0 ? (
              <div className="py-16 text-center text-slate-400 font-normal">
                No finalized sales payouts mapped to your partner account.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-semibold">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <th className="p-4">Finalized Date</th>
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Gross Sale</th>
                      <th className="p-4">Fee Charged</th>
                      <th className="p-4">Net Vendor Payout</th>
                      <th className="p-4">Clearance Status</th>
                      <th className="p-4 text-right">Transfer Reference ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {earningsLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 text-slate-400 font-mono text-[10px]">
                          {new Date(log.created_at).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                        <td className="p-4 font-bold text-slate-900 font-mono">{log.order_id}</td>
                        <td className="p-4 text-slate-600 font-mono">₹{log.order_total?.toLocaleString('en-IN')}</td>
                        <td className="p-4 text-rose-600 font-semibold font-mono">
                          - ₹{log.commission_amount?.toLocaleString('en-IN')} ({log.commission_percent}%)
                        </td>
                        <td className="p-4 font-bold text-teal-700 font-mono text-sm">₹{log.vendor_payout?.toLocaleString('en-IN')}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold inline-flex items-center gap-1 ${
                            log.status === 'transferred'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${log.status === 'transferred' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                            {log.status === 'transferred' ? 'Cleared & Paid' : 'Pending Administrative Clearance'}
                          </span>
                        </td>
                        <td className="p-4 text-right text-slate-400 font-mono text-[10px]">
                          {log.transfer_id || 'manual_upi_clearance'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
