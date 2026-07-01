import React, { useState, useEffect } from 'react';
import { dbLocal } from '../db';
import { Vendor, Product, Order, RFQ, Quotation, User } from '../types';
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
  Edit,
  Copy,
  Trash2,
  Eye,
  HelpCircle,
  TrendingUp,
  Archive,
  Video,
  Image as ImageIcon,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  Search,
  Activity,
  Info
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
  const [activeTab, setActiveTab] = useState<'profile' | 'products' | 'bulk' | 'orders' | 'rfqs'>('products');

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

  // Advanced Product Editor Modal States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorStep, setEditorStep] = useState(1);
  const [editingProductId, setEditingProductId] = useState<string | null>(null); // null means creating
  const [editorData, setEditorData] = useState<Partial<Product>>({
    name: '', brand: '', sku: '', category: 'Medical Equipment', subcategory: '',
    description: '', price: 0, salePrice: 0, mrp: 0, wholesalePrice: 0,
    discountPercentage: 0, moq: 1, stockQuantity: 10, unit: 'Piece',
    hsnCode: '', gstRate: 12, warranty: '1 Year Warranty', countryOfOrigin: 'India',
    images: [], videoUrl: '', manufacturer: '', modelNumber: '',
    certifications: [], packageContents: '', lowStockAlert: 3, outOfStock: false,
    weight: 0, dimensions: { length: 0, width: 0, height: 0 },
    shippingCharges: 0, estimatedDeliveryTime: '3-5 Days', status: 'Draft',
    specifications: []
  });
  
  // Custom specification state inside form
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  
  // Search / filter in vendor dashboard
  const [prodSearch, setProdSearch] = useState('');
  const [prodFilterStatus, setProdFilterStatus] = useState<string>('All');
  const [prodFilterCat, setProdFilterCat] = useState<string>('All');

  const loadData = () => {
    if (!currentUser) return;
    const vendorsList = dbLocal.getVendors();
    const profile = vendorsList.find(v => v.id === currentUser.id) || null;
    setVendorProfile(profile);

    const prods = dbLocal.getProducts().filter(p => p.vendorId === currentUser.id);
    setProducts(prods);

    const ords = dbLocal.getOrders().filter(o => 
      o.vendorId === currentUser.id && 
      !['Pending Payment', 'Payment Submitted', 'Awaiting Payment Verification'].includes(o.status)
    );
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

  const openAddProductModal = () => {
    setEditingProductId(null);
    setEditorStep(1);
    setEditorData({
      name: '', brand: '', sku: `SKU-${Date.now().toString().slice(-6)}`, category: 'Medical Equipment', subcategory: '',
      description: '', price: 0, salePrice: 0, mrp: 0, wholesalePrice: 0,
      discountPercentage: 0, moq: 1, stockQuantity: 10, unit: 'Piece',
      hsnCode: '', gstRate: 12, warranty: '1 Year Warranty', countryOfOrigin: 'India',
      images: [], videoUrl: '', manufacturer: '', modelNumber: '',
      certifications: [], packageContents: '', lowStockAlert: 3, outOfStock: false,
      weight: 0, dimensions: { length: 0, width: 0, height: 0 },
      shippingCharges: 0, estimatedDeliveryTime: '3-5 Days', status: 'Draft',
      specifications: []
    });
    setIsEditorOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingProductId(product.id);
    setEditorStep(1);
    setEditorData({ ...product });
    setIsEditorOpen(true);
  };

  const handleDuplicateProduct = (product: Product) => {
    if (!currentUser || !vendorProfile) return;
    const duplicated: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      name: `Copy of ${product.name}`,
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      status: 'Draft',
      createdAt: new Date().toISOString(),
      performance: { views: 0, inquiries: 0, sales: 0 }
    };
    const all = dbLocal.getProducts();
    all.unshift(duplicated);
    dbLocal.saveProducts(all);
    addToast('Product duplicated successfully as Draft!', 'success');
    loadData();
  };

  const handleDeleteProduct = (prodId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action is irreversible.')) return;
    const all = dbLocal.getProducts().filter(p => p.id !== prodId);
    dbLocal.saveProducts(all);
    addToast('Product deleted from database successfully.', 'info');
    loadData();
  };

  const handleToggleProductStatus = (product: Product) => {
    const updatedStatus = product.status === 'Inactive' ? 'Draft' : 'Inactive';
    const all = dbLocal.getProducts().map(p => {
      if (p.id === product.id) {
        return { ...p, status: updatedStatus as any };
      }
      return p;
    });
    dbLocal.saveProducts(all);
    addToast(`Product set to ${updatedStatus} successfully!`, 'success');
    loadData();
  };

  const handleSaveProduct = (asDraft: boolean = false) => {
    if (!currentUser || !vendorProfile) return;
    
    let finalDiscount = editorData.discountPercentage || 0;
    if (editorData.mrp && editorData.price) {
      finalDiscount = Math.round(((editorData.mrp - editorData.price) / editorData.mrp) * 100);
    }

    const finalProduct: Product = {
      id: editingProductId || `prod-${Date.now()}`,
      vendorId: currentUser.id,
      vendorName: vendorProfile.companyName,
      name: editorData.name || 'Unnamed Product',
      sku: editorData.sku || `SKU-${Date.now().toString().slice(-6)}`,
      brand: editorData.brand || 'Generic',
      category: editorData.category || 'Medical Equipment',
      subcategory: editorData.subcategory || '',
      description: editorData.description || '',
      specifications: editorData.specifications || [],
      price: Number(editorData.price) || 0,
      salePrice: Number(editorData.salePrice) || Number(editorData.price) || 0,
      mrp: Number(editorData.mrp) || 0,
      wholesalePrice: Number(editorData.wholesalePrice) || 0,
      discountPercentage: finalDiscount,
      moq: Number(editorData.moq) || 1,
      stockQuantity: Number(editorData.stockQuantity) || 0,
      unit: editorData.unit || 'Piece',
      hsnCode: editorData.hsnCode || '',
      gstRate: Number(editorData.gstRate) || 12,
      warranty: editorData.warranty || '',
      countryOfOrigin: editorData.countryOfOrigin || 'India',
      images: editorData.images && editorData.images.length > 0 ? editorData.images : ['https://images.unsplash.com/photo-1516549655169-df83a0774514'],
      videoUrl: editorData.videoUrl || '',
      manufacturer: editorData.manufacturer || '',
      modelNumber: editorData.modelNumber || '',
      certifications: editorData.certifications || [],
      packageContents: editorData.packageContents || '',
      lowStockAlert: Number(editorData.lowStockAlert) || 3,
      outOfStock: Number(editorData.stockQuantity) <= 0,
      weight: Number(editorData.weight) || 0,
      dimensions: editorData.dimensions || { length: 0, width: 0, height: 0 },
      shippingCharges: Number(editorData.shippingCharges) || 0,
      estimatedDeliveryTime: editorData.estimatedDeliveryTime || '3-5 Days',
      status: asDraft ? 'Draft' : 'Pending',
      createdAt: editorData.createdAt || new Date().toISOString(),
      performance: editorData.performance || { views: Math.floor(Math.random() * 30), inquiries: Math.floor(Math.random() * 5), sales: 0 }
    };

    const all = dbLocal.getProducts();
    if (editingProductId) {
      const index = all.findIndex(p => p.id === editingProductId);
      if (index !== -1) {
        all[index] = finalProduct;
      }
    } else {
      all.unshift(finalProduct);
    }

    dbLocal.saveProducts(all);
    
    if (!asDraft) {
      dbLocal.addNotification(
        'admin',
        `New Product Submission: ${finalProduct.name}`,
        `Vendor ${vendorProfile.companyName} has submitted a product in ${finalProduct.category} for verification.`,
        'product_submitted'
      );
      addToast('Product submitted successfully for administration audit!', 'success');
    } else {
      addToast('Product saved successfully as Draft!', 'success');
    }

    setIsEditorOpen(false);
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
        </div>
      </div>

      {/* products tab */}
      {activeTab === 'products' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Quick Metrics Bar & Controls Header */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-teal-50 text-teal-700 rounded-xl">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Clinical Products Hub</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Catalog size: {products.length} registered products</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search catalog SKU, HSN..."
                  value={prodSearch}
                  onChange={(e) => setProdSearch(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-teal-700 w-48 sm:w-64 transition"
                />
              </div>

              {/* Status Filter */}
              <select
                value={prodFilterStatus}
                onChange={(e) => setProdFilterStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 outline-none text-slate-600 focus:border-teal-700"
              >
                <option value="All">All Statuses</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending Audit</option>
                <option value="Draft">Draft</option>
                <option value="Inactive">Inactive</option>
                <option value="Rejected">Rejected</option>
              </select>

              {/* Category Filter */}
              <select
                value={prodFilterCat}
                onChange={(e) => setProdFilterCat(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2.5 outline-none text-slate-600 focus:border-teal-700"
              >
                <option value="All">All Categories</option>
                <option>Medical Equipment</option>
                <option>Laboratory Equipment</option>
                <option>Dental Equipment</option>
                <option>Surgical Instruments</option>
                <option>Hospital Furniture</option>
                <option>Homecare Devices</option>
                <option>Consumables</option>
              </select>

              {/* Add New Trigger */}
              <button
                onClick={openAddProductModal}
                disabled={!isApproved}
                className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                Add New Product
              </button>
            </div>
          </div>

          {/* Product Cards Catalog Listing */}
          {(() => {
            const filteredList = products.filter(p => {
              const matchesSearch = p.name.toLowerCase().includes(prodSearch.toLowerCase()) || 
                                    p.sku.toLowerCase().includes(prodSearch.toLowerCase()) ||
                                    p.brand.toLowerCase().includes(prodSearch.toLowerCase());
              const matchesStatus = prodFilterStatus === 'All' ? true : p.status === prodFilterStatus;
              const matchesCat = prodFilterCat === 'All' ? true : p.category === prodFilterCat;
              return matchesSearch && matchesStatus && matchesCat;
            });

            if (filteredList.length === 0) {
              return (
                <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm text-slate-400">
                  <ClipboardList className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-xs font-bold text-slate-500">No clinical equipment matches the active filters.</p>
                  <button onClick={() => { setProdSearch(''); setProdFilterStatus('All'); setProdFilterCat('All'); }} className="text-teal-700 text-xs underline font-bold mt-2 hover:text-teal-900 block mx-auto">
                    Reset Active Filters
                  </button>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredList.map((p) => {
                  const hasPerformance = p.performance || { views: 0, inquiries: 0, sales: 0 };
                  return (
                    <div key={p.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col font-sans transition hover:shadow-md">
                      
                      {/* Top Header Card Info */}
                      <div className="p-5 flex gap-4 items-start border-b border-slate-100 flex-1">
                        <div className="relative">
                          <img
                            src={p.images && p.images[0] ? p.images[0] : 'https://images.unsplash.com/photo-1516549655169-df83a0774514'}
                            alt={p.name}
                            className="w-20 h-20 object-cover rounded-xl border border-slate-200 shrink-0 bg-slate-50"
                            referrerPolicy="no-referrer"
                          />
                          {p.images && p.images.length > 1 && (
                            <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[8px] font-extrabold px-1 py-0.5 rounded">
                              +{p.images.length - 1} imgs
                            </span>
                          )}
                        </div>

                        <div className="flex-1 space-y-1 text-xs">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-extrabold text-slate-900 text-sm leading-snug">{p.name}</h4>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{p.brand} | {p.category}</p>
                            </div>
                            
                            {/* Detailed badge */}
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border tracking-wider shrink-0 ${
                              p.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : p.status === 'Pending'
                                  ? 'bg-amber-50 text-amber-700 border-amber-100'
                                  : p.status === 'Draft'
                                    ? 'bg-slate-100 text-slate-600 border-slate-200'
                                    : p.status === 'Rejected'
                                      ? 'bg-rose-50 text-rose-700 border-rose-100'
                                      : 'bg-slate-50 text-slate-500 border-slate-100'
                            }`}>
                              {p.status}
                            </span>
                          </div>

                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider font-mono">
                            SKU: {p.sku} | HSN: {p.hsnCode} | GST: {p.gstRate}%
                          </p>

                          {/* Price Points */}
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100/60 mt-2 font-medium">
                            <div>
                              <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold block">Selling Price (Excl. GST)</span>
                              <span className="text-xs font-extrabold text-slate-900 font-mono">₹{p.price.toLocaleString('en-IN')}</span>
                            </div>
                            {p.mrp ? (
                              <div>
                                <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold block">B2B MRP (Excl. GST)</span>
                                <span className="text-xs font-bold text-slate-400 line-through font-mono">₹{p.mrp.toLocaleString('en-IN')}</span>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {/* Rejection Alert Box */}
                      {p.status === 'Rejected' && p.rejectionReason && (
                        <div className="bg-rose-50/70 p-3 border-b border-rose-100 text-[10px] font-medium text-rose-800 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                          <div>
                            <span className="font-extrabold block">Rejection Feedback / Required Action:</span>
                            <span>{p.rejectionReason}</span>
                          </div>
                        </div>
                      )}

                      {/* Performance Dashboard stats (Views / Inquiries / Sales) */}
                      <div className="bg-slate-50 p-3 px-5 border-b border-slate-150 grid grid-cols-3 gap-2 text-center text-[10px] font-medium text-slate-500 font-mono">
                        <div className="flex items-center justify-center gap-1.5 border-r border-slate-200">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span><strong>{hasPerformance.views}</strong> views</span>
                        </div>
                        <div className="flex items-center justify-center gap-1.5 border-r border-slate-200">
                          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span><strong>{hasPerformance.inquiries}</strong> inquiries</span>
                        </div>
                        <div className="flex items-center justify-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                          <span><strong>{hasPerformance.sales}</strong> sales</span>
                        </div>
                      </div>

                      {/* Bottom Controls / Actions Layout */}
                      <div className="p-3 px-5 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100">
                        {/* Quick Stock Controls */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Stock:</span>
                          <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden font-mono text-xs">
                            <button
                              onClick={() => {
                                const newQty = Math.max(0, p.stockQuantity - 1);
                                const allProds = dbLocal.getProducts().map(x => x.id === p.id ? { ...x, stockQuantity: newQty, outOfStock: newQty <= 0 } : x);
                                dbLocal.saveProducts(allProds);
                                addToast(`Stock count decreased to ${newQty}`, 'info');
                                loadData();
                              }}
                              className="px-2 py-1 hover:bg-slate-100 font-bold transition select-none"
                            >
                              -
                            </button>
                            <span className="px-3 font-extrabold text-slate-800">{p.stockQuantity}</span>
                            <button
                              onClick={() => {
                                const newQty = p.stockQuantity + 1;
                                const allProds = dbLocal.getProducts().map(x => x.id === p.id ? { ...x, stockQuantity: newQty, outOfStock: false } : x);
                                dbLocal.saveProducts(allProds);
                                addToast(`Stock count increased to ${newQty}`, 'info');
                                loadData();
                              }}
                              className="px-2 py-1 hover:bg-slate-100 font-bold transition select-none"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Interactive Context Action Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditProductModal(p)}
                            className="p-2 bg-white border border-slate-200 hover:border-teal-600 hover:text-teal-700 rounded-xl transition text-slate-600 cursor-pointer"
                            title="Edit Clinical Product Specifications"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDuplicateProduct(p)}
                            className="p-2 bg-white border border-slate-200 hover:border-teal-600 hover:text-teal-700 rounded-xl transition text-slate-600 cursor-pointer"
                            title="Duplicate Product Specifications"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleProductStatus(p)}
                            className={`p-2 rounded-xl border transition cursor-pointer ${
                              p.status === 'Inactive'
                                ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100/50'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                            title={p.status === 'Inactive' ? 'Move product out of Archival' : 'Archive / Deactivate Product'}
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-2 bg-white border border-rose-250 hover:bg-rose-50 rounded-xl transition text-rose-600 cursor-pointer"
                            title="Purge product from registry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            );
          })()}

        </div>
      )}

      {/* Advanced Multi-Step Product Editor & Gallery Upload Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-center items-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full h-[85vh] overflow-hidden shadow-2xl border border-slate-100 animate-scale-up flex flex-col font-sans">
            
            {/* Header section */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    {editingProductId ? 'Edit Clinical Specifications' : 'Submit New Medical Equipment'}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Please provide clinical-grade metrics to qualify for HealNex catalog authorization.</p>
                </div>
              </div>
              
              {/* Active step indicators */}
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                <span className={`px-2 py-1 rounded-lg ${editorStep === 1 ? 'bg-teal-700 text-white' : 'bg-slate-100'}`}>1. Info</span>
                <span className={`px-2 py-1 rounded-lg ${editorStep === 2 ? 'bg-teal-700 text-white' : 'bg-slate-100'}`}>2. Inventory</span>
                <span className={`px-2 py-1 rounded-lg ${editorStep === 3 ? 'bg-teal-700 text-white' : 'bg-slate-100'}`}>3. Media</span>
              </div>
            </div>

            {/* Modal Body Scroll Container */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6 text-xs font-semibold text-slate-600">
              
              {/* STEP 1: Clinical Info & Specifications */}
              {editorStep === 1 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-slate-500 block mb-1">Product Display Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Dual-Channel Syringe Infusion Pump Pro"
                        value={editorData.name || ''}
                        onChange={(e) => setEditorData({ ...editorData, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-700 transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1">Manufacturer Brand *</label>
                      <input
                        type="text"
                        placeholder="e.g. Philips Medical"
                        value={editorData.brand || ''}
                        onChange={(e) => setEditorData({ ...editorData, brand: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-700 transition"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-slate-500 block mb-1">Category *</label>
                      <select
                        value={editorData.category || 'Medical Equipment'}
                        onChange={(e) => setEditorData({ ...editorData, category: e.target.value })}
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
                      <label className="text-slate-500 block mb-1">Subcategory *</label>
                      <input
                        type="text"
                        placeholder="e.g. Infusion Pump"
                        value={editorData.subcategory || ''}
                        onChange={(e) => setEditorData({ ...editorData, subcategory: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-700 transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1">B2B SKU Code *</label>
                      <input
                        type="text"
                        placeholder="e.g. SKU-INF-09"
                        value={editorData.sku || ''}
                        onChange={(e) => setEditorData({ ...editorData, sku: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-700 transition font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-500 block mb-1">Short Clinical Description *</label>
                      <input
                        type="text"
                        placeholder="A concise overview sentence (displayed in search snippets)."
                        value={editorData.shortDescription || ''}
                        onChange={(e) => setEditorData({ ...editorData, shortDescription: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-700 transition"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1">Product HSN Code *</label>
                      <input
                        type="text"
                        placeholder="e.g. 90181100"
                        value={editorData.hsnCode || ''}
                        onChange={(e) => setEditorData({ ...editorData, hsnCode: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-700 transition font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-500 block mb-1">Full Specifications & Detailed Description *</label>
                    <textarea
                      rows={3}
                      placeholder="Elaborate clinical use case instructions, sensor accuracy ranges, standard operations..."
                      value={editorData.description || ''}
                      onChange={(e) => setEditorData({ ...editorData, description: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-700 transition leading-relaxed text-slate-700"
                      required
                    />
                  </div>

                  {/* Certifications and Tags */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-500 block mb-1">Certifications (comma separated)</label>
                      <input
                        type="text"
                        placeholder="ISO 13485, CE, FDA, CDSCO"
                        value={editorData.certifications ? editorData.certifications.join(', ') : ''}
                        onChange={(e) => setEditorData({ ...editorData, certifications: e.target.value.split(',').map(x => x.trim()).filter(Boolean) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1">Product Tags (comma separated)</label>
                      <input
                        type="text"
                        placeholder="clinical, pump, pediatric, hospital-grade"
                        value={editorData.tags ? editorData.tags.join(', ') : ''}
                        onChange={(e) => setEditorData({ ...editorData, tags: e.target.value.split(',').map(x => x.trim()).filter(Boolean) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none"
                      />
                    </div>
                  </div>

                  {/* Specification list builder */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <span className="font-extrabold text-slate-800 block">Interactive Specifications Table Builder</span>
                    
                    {editorData.specifications && editorData.specifications.length > 0 && (
                      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                        <table className="w-full text-left text-[11px]">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-400">
                              <th className="p-2.5 px-4">clinical key parameter</th>
                              <th className="p-2.5 px-4">dimension/value</th>
                              <th className="p-2.5 text-center">purge</th>
                            </tr>
                          </thead>
                          <tbody>
                            {editorData.specifications.map((spec, idx) => (
                              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                                <td className="p-2 px-4 font-bold text-slate-700">{spec.key}</td>
                                <td className="p-2 px-4 font-mono text-slate-600">{spec.value}</td>
                                <td className="p-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedSpecs = (editorData.specifications || []).filter((_, i) => i !== idx);
                                      setEditorData({ ...editorData, specifications: updatedSpecs });
                                    }}
                                    className="text-red-500 hover:underline"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="e.g. Battery Backup"
                        value={newSpecKey}
                        onChange={(e) => setNewSpecKey(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg p-2 outline-none flex-1 font-semibold"
                      />
                      <input
                        type="text"
                        placeholder="e.g. 4.5 Hours continuous"
                        value={newSpecValue}
                        onChange={(e) => setNewSpecValue(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg p-2 outline-none flex-1 font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newSpecKey || !newSpecValue) return;
                          const currentSpecs = editorData.specifications || [];
                          setEditorData({
                            ...editorData,
                            specifications: [...currentSpecs, { key: newSpecKey, value: newSpecValue }]
                          });
                          setNewSpecKey('');
                          setNewSpecValue('');
                        }}
                        className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-4 py-2 rounded-lg"
                      >
                        Insert Key
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* STEP 2: Pricing & Stock Inventory */}
              {editorStep === 2 && (
                <div className="space-y-5 animate-fade-in">
                  
                  {/* B2B Price Points Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="text-slate-500 block mb-1">Selling Price (Ex. GST) *</label>
                      <input
                        type="number"
                        placeholder="₹ INR Price"
                        value={editorData.price || ''}
                        onChange={(e) => setEditorData({ ...editorData, price: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-700 transition font-mono font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1">Standard MRP (Ex. GST)</label>
                      <input
                        type="number"
                        placeholder="₹ Maximum Retail"
                        value={editorData.mrp || ''}
                        onChange={(e) => setEditorData({ ...editorData, mrp: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-700 transition font-mono text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1">Wholesale price (Bulk discount)</label>
                      <input
                        type="number"
                        placeholder="₹ Wholesale B2B rate"
                        value={editorData.wholesalePrice || ''}
                        onChange={(e) => setEditorData({ ...editorData, wholesalePrice: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-700 transition font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1">GST Tax Bracket % *</label>
                      <select
                        value={editorData.gstRate || 12}
                        onChange={(e) => setEditorData({ ...editorData, gstRate: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-700 transition font-bold"
                      >
                        <option value={5}>5% Standard Medical</option>
                        <option value={12}>12% Advanced Equipment</option>
                        <option value={18}>18% High-End Electronics</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="text-slate-500 block mb-1">Current Stock Qty *</label>
                      <input
                        type="number"
                        placeholder="e.g. 150"
                        value={editorData.stockQuantity || ''}
                        onChange={(e) => setEditorData({ ...editorData, stockQuantity: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-700 transition font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1">Low Stock Threshold Alert</label>
                      <input
                        type="number"
                        placeholder="e.g. 10"
                        value={editorData.lowStockAlert || ''}
                        onChange={(e) => setEditorData({ ...editorData, lowStockAlert: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-700 transition font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1">Minimum Order Qty (MOQ) *</label>
                      <input
                        type="number"
                        placeholder="e.g. 5"
                        value={editorData.moq || ''}
                        onChange={(e) => setEditorData({ ...editorData, moq: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-700 transition font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1">Packaging Unit *</label>
                      <select
                        value={editorData.unit || 'Piece'}
                        onChange={(e) => setEditorData({ ...editorData, unit: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-700 transition font-bold"
                      >
                        <option>Piece</option>
                        <option>Box</option>
                        <option>Pack (Bundle)</option>
                        <option>Set</option>
                        <option>Carton</option>
                      </select>
                    </div>
                  </div>

                  {/* Physical parameters */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="text-slate-500 block mb-1">Package Weight (kg)</label>
                      <input
                        type="number"
                        placeholder="e.g. 4.5"
                        value={editorData.weight || ''}
                        onChange={(e) => setEditorData({ ...editorData, weight: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="text-slate-500 block mb-1">Package Dimensions L × W × H (cm)</label>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="number"
                          placeholder="L"
                          value={editorData.dimensions?.length || ''}
                          onChange={(e) => setEditorData({ ...editorData, dimensions: { ...editorData.dimensions!, length: Number(e.target.value) } })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none font-mono text-center"
                        />
                        <input
                          type="number"
                          placeholder="W"
                          value={editorData.dimensions?.width || ''}
                          onChange={(e) => setEditorData({ ...editorData, dimensions: { ...editorData.dimensions!, width: Number(e.target.value) } })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none font-mono text-center"
                        />
                        <input
                          type="number"
                          placeholder="H"
                          value={editorData.dimensions?.height || ''}
                          onChange={(e) => setEditorData({ ...editorData, dimensions: { ...editorData.dimensions!, height: Number(e.target.value) } })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none font-mono text-center"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-slate-500 block mb-1">Standard Shipping Charges (INR)</label>
                      <input
                        type="number"
                        placeholder="₹ e.g. 500"
                        value={editorData.shippingCharges || ''}
                        onChange={(e) => setEditorData({ ...editorData, shippingCharges: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1">Estimated Delivery Time *</label>
                      <input
                        type="text"
                        placeholder="e.g. 3-5 Days"
                        value={editorData.estimatedDeliveryTime || '3-5 Days'}
                        onChange={(e) => setEditorData({ ...editorData, estimatedDeliveryTime: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1">Warranty Term *</label>
                      <input
                        type="text"
                        placeholder="e.g. 1 Year Warranty"
                        value={editorData.warranty || '1 Year Warranty'}
                        onChange={(e) => setEditorData({ ...editorData, warranty: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-500 block mb-1">Country of Origin *</label>
                      <input
                        type="text"
                        placeholder="e.g. India"
                        value={editorData.countryOfOrigin || 'India'}
                        onChange={(e) => setEditorData({ ...editorData, countryOfOrigin: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1">Package Box Contents</label>
                      <input
                        type="text"
                        placeholder="e.g. 1 Device, 2 Cables, User Manual"
                        value={editorData.packageContents || ''}
                        onChange={(e) => setEditorData({ ...editorData, packageContents: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none"
                      />
                    </div>
                  </div>

                </div>
              )}

              {/* STEP 3: Media Gallery (Simulated uploads with rotation, crop & compress sliders) */}
              {editorStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Preset Injectors for clinical ease */}
                  <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="font-extrabold text-slate-800 block">Inject High-Quality Clinical Images Preset</span>
                    <p className="text-[10px] text-slate-400">Instantly populate gallery with qualified clinical equipment snapshots.</p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {[
                        { name: 'ECG Monitor', url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600' },
                        { name: 'Surgical Microscope', url: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&q=80&w=600' },
                        { name: 'Centrifuge Machine', url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=600' },
                        { name: 'Digital Stethoscope', url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600' },
                        { name: 'Surgical Gowns Pack', url: 'https://images.unsplash.com/photo-1628771065518-0d82f1118187?auto=format&fit=crop&q=80&w=600' }
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            const currentImgs = editorData.images || [];
                            if (currentImgs.length >= 10) {
                              addToast('Max 10 product gallery images allowed.', 'error');
                              return;
                            }
                            setEditorData({ ...editorData, images: [...currentImgs, preset.url] });
                            addToast(`Injected preset: ${preset.name}`, 'success');
                          }}
                          className="bg-white hover:bg-teal-50 hover:text-teal-700 text-[10px] px-2.5 py-1.5 rounded-lg border border-slate-200 font-extrabold shadow-sm transition"
                        >
                          + {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Drag and Drop Area / Local File Picker */}
                  <div className="border-2 border-dashed border-slate-200 hover:border-teal-700 bg-slate-50/50 rounded-2xl p-6 text-center space-y-2 flex flex-col items-center justify-center transition">
                    <Upload className="w-8 h-8 text-slate-300" />
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        id="vendor-multi-img"
                        className="hidden"
                        onChange={(e) => {
                          if (!e.target.files) return;
                          const files = Array.from(e.target.files);
                          const remainingLimit = 10 - (editorData.images || []).length;
                          const filesToProcess = files.slice(0, remainingLimit);
                          
                          if (files.length > remainingLimit) {
                            addToast(`Only added first ${remainingLimit} images. Max gallery limit of 10 reached.`, 'info');
                          }

                          filesToProcess.forEach((file: File) => {
                            // Check file size (max 10MB)
                            if (file.size > 10 * 1024 * 1024) {
                              addToast(`Skipped ${file.name} - exceeds 10MB limit.`, 'error');
                              return;
                            }
                            
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              if (ev.target?.result) {
                                const base64 = ev.target.result as string;
                                const current = editorData.images || [];
                                setEditorData(prev => ({ ...prev, images: [...(prev.images || []), base64] }));
                              }
                            };
                            reader.readAsDataURL(file);
                          });
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById('vendor-multi-img')?.click()}
                        className="text-teal-700 underline font-extrabold hover:text-teal-900 cursor-pointer text-xs"
                      >
                        Click to browse local files
                      </button>
                      <span className="text-slate-400"> or drag-and-drop clinical images here</span>
                    </div>
                    <p className="text-[9px] text-slate-400">Supported Formats: JPG, JPEG, PNG, WEBP. Maximum image size: 10MB per image. Limit up to 10.</p>
                  </div>

                  {/* Active Gallery Viewer with Rearranging / Cropping / Rotating */}
                  {editorData.images && editorData.images.length > 0 && (
                    <div className="space-y-4">
                      <span className="font-extrabold text-slate-800 block">Product Images Gallery (Total: {editorData.images.length}/10)</span>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                        {editorData.images.map((img, idx) => (
                          <div key={idx} className="relative bg-slate-50 p-2 rounded-xl border border-slate-200 group flex flex-col items-center">
                            
                            {/* Primary cover badge */}
                            {idx === 0 && (
                              <span className="absolute top-1 left-1 bg-teal-700 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded shadow z-10">
                                COVER
                              </span>
                            )}

                            {/* Rotate & Delete float panel */}
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition flex gap-1 z-15">
                              <button
                                type="button"
                                onClick={() => {
                                  // Simulation rotate base64/url
                                  addToast('Image rotated 90° clockwise! (compressed)', 'success');
                                }}
                                className="p-1 bg-white text-slate-800 rounded-lg hover:bg-slate-100 shadow border border-slate-200 text-[10px]"
                                title="Rotate Image clockwise"
                              >
                                ↻
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (editorData.images || []).filter((_, i) => i !== idx);
                                  setEditorData({ ...editorData, images: updated });
                                  addToast('Gallery image deleted.', 'info');
                                }}
                                className="p-1 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 shadow border border-rose-100 text-[10px]"
                                title="Delete Image"
                              >
                                ✕
                              </button>
                            </div>

                            <img
                              src={img}
                              alt={`Gallery ${idx + 1}`}
                              className="w-full h-24 object-contain bg-white rounded-lg border"
                              referrerPolicy="no-referrer"
                            />

                            {/* Sequence sorting triggers */}
                            <div className="flex gap-1.5 mt-2 justify-center w-full">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => {
                                  const list = [...(editorData.images || [])];
                                  // Swap
                                  const temp = list[idx - 1];
                                  list[idx - 1] = list[idx];
                                  list[idx] = temp;
                                  setEditorData({ ...editorData, images: list });
                                }}
                                className="bg-white border text-[10px] font-extrabold px-1.5 py-0.5 rounded hover:bg-slate-100 disabled:opacity-30"
                              >
                                ◀
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const list = [...(editorData.images || [])];
                                  // Move to cover (index 0)
                                  const item = list.splice(idx, 1)[0];
                                  list.unshift(item);
                                  setEditorData({ ...editorData, images: list });
                                  addToast('Image set as cover image.', 'success');
                                }}
                                className="bg-slate-100 text-slate-700 text-[9px] font-extrabold px-1 py-0.5 rounded hover:bg-teal-50 hover:text-teal-700"
                              >
                                Set Cover
                              </button>
                              <button
                                type="button"
                                disabled={idx === (editorData.images || []).length - 1}
                                onClick={() => {
                                  const list = [...(editorData.images || [])];
                                  // Swap
                                  const temp = list[idx + 1];
                                  list[idx + 1] = list[idx];
                                  list[idx] = temp;
                                  setEditorData({ ...editorData, images: list });
                                }}
                                className="bg-white border text-[10px] font-extrabold px-1.5 py-0.5 rounded hover:bg-slate-100 disabled:opacity-30"
                              >
                                ▶
                              </button>
                            </div>

                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* YouTube optional product video */}
                  <div className="text-xs font-medium text-slate-600 space-y-1.5">
                    <label className="text-slate-500 block font-bold">Product Video Showcase (Optional YouTube Link)</label>
                    <div className="relative">
                      <Video className="w-4.5 h-4.5 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=YOUR_VIDEO_ID"
                        value={editorData.videoUrl || ''}
                        onChange={(e) => setEditorData({ ...editorData, videoUrl: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 p-2.5 outline-none font-mono"
                      />
                    </div>
                    {editorData.videoUrl && (
                      <p className="text-[9px] text-teal-700 font-extrabold">✓ Live YouTube Video Embed Player connected to product page.</p>
                    )}
                  </div>

                </div>
              )}

            </div>

            {/* Modal Bottom controls footer */}
            <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              {/* Back controls */}
              <div>
                {editorStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setEditorStep(editorStep - 1)}
                    className="border border-slate-200 text-slate-600 font-bold px-4 py-2.5 rounded-xl text-xs hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="border border-slate-200 text-slate-400 font-bold px-4 py-2.5 rounded-xl text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {/* Step navigation / submit triggers */}
              <div className="flex gap-2">
                {/* Draft persistence option */}
                <button
                  type="button"
                  onClick={() => handleSaveProduct(true)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                >
                  Save as Draft
                </button>

                {editorStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => {
                      // Basic validation for Step 1
                      if (editorStep === 1 && (!editorData.name || !editorData.brand || !editorData.subcategory || !editorData.sku || !editorData.hsnCode || !editorData.description)) {
                        addToast('Please fill out all required clinical catalog fields * before proceeding.', 'error');
                        return;
                      }
                      setEditorStep(editorStep + 1);
                    }}
                    className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                  >
                    Next Step
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSaveProduct(false)}
                    className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle className="w-4.5 h-4.5" />
                    Submit for Approval
                  </button>
                )}
              </div>
            </div>

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

    </div>
  );
}
