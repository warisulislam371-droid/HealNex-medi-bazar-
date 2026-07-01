import React, { useState, useEffect } from 'react';
import { dbLocal } from '../db';
import { Vendor, Product, SupportTicket, Order, User, Notification, PaymentSettings, WhatsAppSettings, WhatsAppClickLog } from '../types';
import {
  TrendingUp,
  Users,
  Briefcase,
  AlertCircle,
  FileCheck,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Search,
  MessageSquare,
  MessageCircle,
  Activity,
  Award,
  BookOpen,
  DollarSign,
  Terminal,
  Trash2,
  Server,
  Bell,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Download,
  RefreshCw,
  FileText,
  CreditCard,
  Calendar,
  MapPin,
  ExternalLink,
  Mail,
  QrCode,
  Building,
  Copy,
  ClipboardList
} from 'lucide-react';

// Global helper for generating a beautiful high-fidelity scanned document preview
const generateAdminDocumentCanvas = (docTitle: string, fileName: string, companyName: string): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 800;
  const ctx = canvas.getContext('2d')!;
  
  // Extract dynamic theme color from document element
  const brandColor = typeof window !== 'undefined' ? (getComputedStyle(document.documentElement).getPropertyValue('--theme-brand-hex').trim() || '#0f766e') : '#0f766e';
  
  // Background
  ctx.fillStyle = '#fafafa';
  ctx.fillRect(0, 0, 600, 800);
  
  // Document border
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, 586, 786);
  
  // Header banner
  ctx.fillStyle = brandColor;
  ctx.fillRect(14, 14, 572, 115);
  
  // Header Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillText('HEALNEX SECURE MEDICAL PORTAL', 40, 58);
  ctx.font = '12px monospace';
  ctx.fillStyle = '#e0f2fe';
  ctx.fillText('CLINICAL AUDITING HUB • RECONCILIATION GATEWAY • SUPABASE STORAGE', 40, 88);
  
  // Watermark
  ctx.save();
  ctx.translate(300, 450);
  ctx.rotate(-Math.PI / 4);
  ctx.fillStyle = brandColor + '0c'; // ~5% opacity hex alpha
  ctx.font = 'bold 44px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('HEALNEX CLINICAL', 0, -25);
  ctx.fillText('OFFICIAL AUDIT COPY', 0, 35);
  ctx.restore();
  
  // Document Details Box
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(40, 165, 520, 260);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.strokeRect(40, 165, 520, 260);
  
  ctx.fillStyle = brandColor;
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillText('DOCUMENT CLASSIFICATION & INTEGRITY', 60, 205);
  
  // Divider
  ctx.beginPath();
  ctx.moveTo(60, 220);
  ctx.lineTo(540, 220);
  ctx.strokeStyle = '#e2e8f0';
  ctx.stroke();
  
  ctx.fillStyle = '#475569';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText('Owner Institution:', 60, 255);
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText(companyName, 220, 255);
 
  ctx.fillStyle = '#475569';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText('Credential Key:', 60, 290);
  ctx.fillStyle = brandColor;
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText(docTitle, 220, 290);
  
  ctx.fillStyle = '#475569';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText('File Identifier:', 60, 325);
  ctx.fillStyle = '#1e293b';
  ctx.font = '12px monospace';
  ctx.fillText(fileName, 220, 325);
  
  ctx.fillStyle = '#475569';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText('Database Backend:', 60, 360);
  ctx.fillStyle = '#1e293b';
  ctx.fillText('Supabase Storage buckets (Secured-Signed)', 220, 360);
  
  ctx.fillStyle = '#475569';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText('Onboarding Time:', 60, 395);
  ctx.fillStyle = '#64748b';
  ctx.fillText(new Date().toLocaleDateString() + ' • ' + new Date().toLocaleTimeString(), 220, 395);
  
  // Simulated Content lines representing text paragraphs or table grid
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(40, 460, 520, 14);
  ctx.fillRect(40, 490, 480, 10);
  ctx.fillRect(40, 515, 510, 10);
  ctx.fillRect(40, 540, 320, 10);
  
  // Verified stamp box
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 3;
  ctx.strokeRect(380, 600, 180, 75);
  
  ctx.fillStyle = '#059669';
  ctx.font = 'bold 14px monospace';
  ctx.fillText('SECURITY SEALED', 400, 630);
  ctx.font = '10px system-ui, sans-serif';
  ctx.fillText('HEALNEX PORTAL CDN', 412, 655);
 
  // Sign stamp box
  ctx.strokeStyle = brandColor;
  ctx.lineWidth = 1;
  ctx.strokeRect(40, 600, 180, 75);
  ctx.fillStyle = '#475569';
  ctx.font = '9px system-ui, sans-serif';
  ctx.fillText('AUTHORIZED AUDITOR SIGNATURE', 50, 618);
  ctx.font = 'italic 18px cursive, system-ui';
  ctx.fillStyle = brandColor;
  ctx.fillText('Waris Ul Islam', 60, 648);
  
  // Footer notice
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px monospace';
  ctx.fillText('CONFIDENTIAL MEDICAL RECORD INDEXED TO SUPABASE. DISCLOSURE PROHIBITED BY DATA LAW.', 40, 750);
  
  return canvas.toDataURL('image/jpeg', 0.7);
};

interface AdminPanelProps {
  currentUser: User | null;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function AdminPanel({ currentUser, addToast }: AdminPanelProps) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  
  // Custom push trigger form state
  const [pushTitle, setPushTitle] = useState('');
  const [pushMessage, setPushMessage] = useState('');
  const [pushTarget, setPushTarget] = useState('admin');
  const [pushType, setPushType] = useState('clinical_broadcast');
  
  const [activeTab, setActiveTab] = useState<'kpis' | 'vendors' | 'products' | 'tickets' | 'audit' | 'payment-settings' | 'verify-payments' | 'whatsapp-support'>('kpis');
  
  // Payment Verification admin states
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(dbLocal.getPaymentSettings());
  const [upiQrCode, setUpiQrCode] = useState<string>('');
  const [bankQrCode, setBankQrCode] = useState<string>('');
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState<string>('');
  
  // WhatsApp Support admin states
  const [whatsappSettings, setWhatsappSettings] = useState<WhatsAppSettings>(dbLocal.getWhatsAppSettings());
  const [whatsappLogs, setWhatsappLogs] = useState<WhatsAppClickLog[]>(dbLocal.getWhatsAppClickLogs());
  
  // States for document modal reviews
  const [selectedVendorDoc, setSelectedVendorDoc] = useState<Vendor | null>(null);
  const [activeReviewDocKey, setActiveReviewDocKey] = useState<string>('gstCertificate');
  const [docZoom, setDocZoom] = useState<number>(100);
  const [docRotation, setDocRotation] = useState<number>(0);
  const [statusReasonText, setStatusReasonText] = useState<string>('');
  const [reasonRequiredAction, setReasonRequiredAction] = useState<'Rejected' | 'MoreInfoRequired' | 'Suspended' | null>(null);
  
  // Ticket reply state
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');

  const loadData = () => {
    setVendors(dbLocal.getVendors());
    setProducts(dbLocal.getProducts());
    setTickets(dbLocal.getTickets());
    setOrders(dbLocal.getOrders());
    setNotifs(dbLocal.getNotifications());
    setPaymentSettings(dbLocal.getPaymentSettings());
    setWhatsappSettings(dbLocal.getWhatsAppSettings());
    setWhatsappLogs(dbLocal.getWhatsAppClickLogs());
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSavePaymentSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings = {
      ...paymentSettings,
      upiQrCodeUrl: upiQrCode || paymentSettings.upiQrCodeUrl,
      bankQrCodeUrl: bankQrCode || paymentSettings.bankQrCodeUrl
    };
    dbLocal.savePaymentSettings(updatedSettings);
    setPaymentSettings(updatedSettings);
    addToast('Global Payment Settings synchronized successfully!', 'success');
  };

  const handleUpiQrUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setUpiQrCode(e.target.result as string);
        addToast('UPI QR Code uploaded successfully!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBankQrUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setBankQrCode(e.target.result as string);
        addToast('Bank Transfer QR Code uploaded successfully!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVerifyPayment = (orderId: string) => {
    const currentOrders = dbLocal.getOrders();
    const idx = currentOrders.findIndex(o => o.id === orderId);
    if (idx > -1) {
      const originalOrder = currentOrders[idx];
      const updatedOrder: Order = {
        ...originalOrder,
        status: 'Order Sent to Vendor',
        timeline: [
          ...(originalOrder.timeline || []),
          {
            status: 'Order Sent to Vendor',
            time: new Date().toISOString(),
            note: `Payment verified by administrator ${currentUser?.name || 'Admin'}. Sent to vendor dashboard.`
          }
        ],
        paymentVerificationLogs: [
          ...(originalOrder.paymentVerificationLogs || []),
          {
            action: 'approve',
            performedBy: currentUser?.name || 'Administrator',
            performedByRole: 'admin',
            timestamp: new Date().toISOString(),
            note: `Validated transaction and cleared receipt.`
          }
        ]
      };
      currentOrders[idx] = updatedOrder;
      dbLocal.saveOrders(currentOrders);
      
      // Notify Customer & Vendor
      dbLocal.addNotification(
        originalOrder.customerId,
        `Payment Verified`,
        `Your payment receipt for Order #${orderId} was successfully validated. Procurement sent to supplier for delivery.`,
        'payment_approved'
      );
      dbLocal.addNotification(
        originalOrder.vendorId,
        `New Order Assigned`,
        `New verified procurement Order #${orderId} (₹${originalOrder.finalAmount.toLocaleString('en-IN')}) received from administrative desk.`,
        'order_assigned'
      );
      
      addToast(`Cleared and routed Order #${orderId} to the supplier dashboard!`, 'success');
      loadData();
    }
  };

  const handleRejectPayment = (orderId: string) => {
    if (!rejectionReasonText.trim()) {
      addToast('Please enter a specific rejection reason.', 'error');
      return;
    }
    
    const currentOrders = dbLocal.getOrders();
    const idx = currentOrders.findIndex(o => o.id === orderId);
    if (idx > -1) {
      const originalOrder = currentOrders[idx];
      const updatedOrder: Order = {
        ...originalOrder,
        status: 'Pending Payment',
        paymentRejectionReason: rejectionReasonText.trim(),
        timeline: [
          ...(originalOrder.timeline || []),
          {
            status: 'Pending Payment',
            time: new Date().toISOString(),
            note: `Payment rejected by administrator: ${rejectionReasonText.trim()}`
          }
        ],
        paymentVerificationLogs: [
          ...(originalOrder.paymentVerificationLogs || []),
          {
            action: 'reject',
            performedBy: currentUser?.name || 'Administrator',
            performedByRole: 'admin',
            timestamp: new Date().toISOString(),
            note: `Rejected payment receipt. Reason: ${rejectionReasonText.trim()}`
          }
        ]
      };
      currentOrders[idx] = updatedOrder;
      dbLocal.saveOrders(currentOrders);
      
      // Notify Customer
      dbLocal.addNotification(
        originalOrder.customerId,
        `Payment Receipt Rejected`,
        `Verification failed for Order #${orderId} payment proof. Reason: "${rejectionReasonText.trim()}"`,
        'payment_rejected'
      );
      
      addToast(`Rejected payment receipt for Order #${orderId}. Notification dispatched.`, 'info');
      setRejectingOrderId(null);
      setRejectionReasonText('');
      loadData();
    }
  };

  // Calculations
  const totalRevenue = orders.reduce((sum, o) => sum + o.finalAmount, 0);
  const pendingVendorsCount = vendors.filter(v => v.status === 'Pending').length;
  const pendingProductsCount = products.filter(p => p.status === 'Pending').length;
  const activeRfqsCount = dbLocal.getRfqs().filter(r => r.status === 'Open').length;
  const openTicketsCount = tickets.filter(t => t.status !== 'Closed').length;
  const pendingPaymentsCount = orders.filter(o => o.status === 'Awaiting Payment Verification').length;

  // Actions
  const handleVendorStatus = (
    vendorId: string,
    newStatus: 'Approved' | 'Rejected' | 'MoreInfoRequired' | 'Suspended',
    reasonText: string = ''
  ) => {
    const updated = vendors.map(v => {
      if (v.id === vendorId) {
        const finalReason = ['Rejected', 'Suspended', 'MoreInfoRequired'].includes(newStatus) ? reasonText : '';
        
        // Formulate a beautiful status name for printing
        const statusLabelMap: Record<string, string> = {
          Approved: 'APPROVED & LIVE',
          Rejected: 'REJECTED',
          MoreInfoRequired: 'MORE INFORMATION REQUIRED',
          Suspended: 'TEMPORARILY SUSPENDED'
        };
        const statusLabel = statusLabelMap[newStatus] || newStatus;

        // Send simulated notification
        dbLocal.addNotification(
          vendorId,
          `Vendor Portal Status: ${statusLabel}`,
          `Your corporate account verification audit result is: ${statusLabel}.${
            finalReason ? ` Administrative Audit Notes: "${finalReason}"` : ' Your account is fully active and you may now list medical products and respond to RFQs.'
          }`,
          newStatus === 'Approved' ? 'vendor_approved' : 'vendor_registered'
        );

        // Append to push log telemetries
        const pushLogMsg = `[FCM CLOUD PUSH] Target: ${v.companyName} (${v.email}) | Title: Account ${statusLabel} | Msg: ${
          finalReason ? `Notes: ${finalReason}` : 'Validation cleared.'
        }`;
        console.log(pushLogMsg);

        // Store SMTP alert logs
        dbLocal.addNotification(
          'admin',
          'Vendor Outbound SMTP Logged',
          `Dispatched email notification alert to ${v.email} regarding verification status: ${newStatus}`,
          'vendor_registered'
        );

        return {
          ...v,
          status: newStatus,
          statusReason: finalReason,
          updatedAt: new Date().toISOString()
        };
      }
      return v;
    });

    dbLocal.saveVendors(updated);
    setVendors(updated);
    setSelectedVendorDoc(null);
    setStatusReasonText('');
    setReasonRequiredAction(null);
    addToast(`Vendor partner profile status updated to: ${newStatus}`, 'success');
  };

  const handleProductStatus = (productId: string, newStatus: 'Approved' | 'Rejected') => {
    const updated = products.map(p => {
      if (p.id === productId) {
        dbLocal.addNotification(
          p.vendorId,
          `Product Approved: ${p.name}`,
          `Your medical product "${p.name}" (SKU: ${p.sku}) has been approved and is now live on the marketplace.`,
          'product_approved'
        );
        return { ...p, status: newStatus };
      }
      return p;
    });
    dbLocal.saveProducts(updated);
    setProducts(updated);
    addToast(`Product catalog item has been successfully: ${newStatus}`, 'success');
  };

  const handleTicketReply = (ticketId: string) => {
    if (!ticketReplyText.trim()) return;
    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'In Progress' as const,
          replies: [
            ...t.replies,
            {
              id: `rep-${Date.now()}`,
              senderName: currentUser?.name || 'HealNex Support Desk',
              senderRole: 'super_admin',
              message: ticketReplyText,
              time: new Date().toISOString(),
              isStaff: true
            }
          ]
        };
      }
      return t;
    });
    dbLocal.saveTickets(updated);
    setTickets(updated);
    setTicketReplyText('');
    // Update active ticket display
    const currentT = updated.find(t => t.id === ticketId);
    if (currentT) setActiveTicket(currentT);
  };

  const closeTicket = (ticketId: string) => {
    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return { ...t, status: 'Closed' as const };
      }
      return t;
    });
    dbLocal.saveTickets(updated);
    setTickets(updated);
    const currentT = updated.find(t => t.id === ticketId);
    if (currentT) setActiveTicket(currentT);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-rose-700">
            <Shield className="w-6 h-6 animate-pulse" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Administrative Operations Desk</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise-grade Multi-Vendor management, B2B clinical validations, and transaction clearing logs.
          </p>
        </div>

        {/* Action Tabs selector */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('kpis')}
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'kpis' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Insights
          </button>
          <button
            onClick={() => setActiveTab('vendors')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${activeTab === 'vendors' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Vendors Verification
            {pendingVendorsCount > 0 && (
              <span className="bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{pendingVendorsCount}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${activeTab === 'products' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Product Approvals
            {pendingProductsCount > 0 && (
              <span className="bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{pendingProductsCount}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${activeTab === 'tickets' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Help Desk
            {openTicketsCount > 0 && (
              <span className="bg-sky-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{openTicketsCount}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('verify-payments')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${activeTab === 'verify-payments' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Verify Payments
            {pendingPaymentsCount > 0 && (
              <span className="bg-teal-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{pendingPaymentsCount}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('payment-settings')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${activeTab === 'payment-settings' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Payment Settings
          </button>
          <button
            onClick={() => setActiveTab('whatsapp-support')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${activeTab === 'whatsapp-support' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            WhatsApp Settings
          </button>
        </div>
      </div>

      {/* tab view layouts */}
      {activeTab === 'kpis' && (
        <div className="space-y-8 animate-fade-in">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Gross Revenue</p>
                <p className="text-xl font-bold font-mono text-slate-900">₹{totalRevenue.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Sales</p>
                <p className="text-xl font-bold font-mono text-slate-900">{orders.length} Orders</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Pending Vendors</p>
                <p className="text-xl font-bold font-mono text-orange-700">{pendingVendorsCount} Pending</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Approval Items</p>
                <p className="text-xl font-bold font-mono text-rose-700">{pendingProductsCount} Products</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Active RFQs</p>
                <p className="text-xl font-bold font-mono text-sky-700">{activeRfqsCount} Open</p>
              </div>
            </div>
          </div>

          {/* Graphical Analytics and performance maps */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Custom SVG Sales Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Revenue Analytics (INR)</h3>
                  <p className="text-[11px] text-slate-400">Trendline representing daily corporate transactions</p>
                </div>
                <span className="text-[11px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
                  +14.2% Growth
                </span>
              </div>

              {/* Simulated Chart Container */}
              <div className="h-60 relative w-full flex items-end">
                {/* Background grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between opacity-40 text-[9px] font-mono text-slate-300 pointer-events-none">
                  <div className="border-b border-dashed border-slate-200 pb-1 w-full">₹1,00,000</div>
                  <div className="border-b border-dashed border-slate-200 pb-1 w-full">₹75,000</div>
                  <div className="border-b border-dashed border-slate-200 pb-1 w-full">₹50,000</div>
                  <div className="border-b border-dashed border-slate-200 pb-1 w-full">₹25,000</div>
                  <div className="w-full">₹0</div>
                </div>

                {/* SVG Line representation */}
                <svg className="w-full h-full absolute inset-0 pt-6 pr-4" viewBox="0 0 500 200" preserveAspectRatio="none">
                  <path
                    d="M 0 180 Q 80 140 160 150 T 320 90 T 480 50"
                    fill="none"
                    stroke="var(--theme-brand-hex, #0f766e)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 0 180 Q 80 140 160 150 T 320 90 T 480 50 L 500 200 L 0 200 Z"
                    fill="url(#gradient)"
                    opacity="0.1"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="var(--theme-brand-hex, #0f766e)" />
                      <stop offset="100%" stopColor="#fff" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Grid labels */}
                <div className="w-full flex justify-between text-[10px] text-slate-400 font-mono pt-2 mt-4 relative z-10 border-t border-slate-100 px-1">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>

            {/* Vendor distribution map */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Vendor Performance</h3>
              <p className="text-[11px] text-slate-400 mb-6">Distribution and approval ratings</p>

              <div className="space-y-4 text-xs font-semibold">
                <div>
                  <div className="flex justify-between text-slate-700 mb-1.5">
                    <span>Approved & Active</span>
                    <span className="font-mono text-emerald-600">
                      {vendors.filter(v => v.status === 'Approved').length} Vendors
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-700 mb-1.5">
                    <span>Pending Administrative Audit</span>
                    <span className="font-mono text-orange-600">
                      {vendors.filter(v => v.status === 'Pending').length} Vendors
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-700 mb-1.5">
                    <span>Suspended or Rejected</span>
                    <span className="font-mono text-rose-600">
                      {vendors.filter(v => v.status === 'Rejected' || v.status === 'Suspended').length} Vendors
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vendors Approval section */}
      {activeTab === 'vendors' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Vendor Registration Directory</h3>
            <span className="text-xs font-medium text-slate-500">
              Review company certificates, trade licenses, and PAN validations.
            </span>
          </div>

          {vendors.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No vendors currently registered.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-5">Company Details</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">State & GSTIN</th>
                    <th className="py-3 px-4">Documents</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vendors.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/40">
                      <td className="py-4 px-5">
                        <p className="font-bold text-slate-900">{v.companyName}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Owner: {v.ownerName}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-slate-800">{v.email}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{v.mobileNumber}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-slate-800 font-medium">{v.state}</p>
                        <p className="text-[10px] font-mono text-slate-500 mt-0.5">GST: {v.gstNumber}</p>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => setSelectedVendorDoc(v)}
                          className="text-xs text-teal-700 hover:text-teal-900 font-bold underline flex items-center gap-1"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          Review docs (6)
                        </button>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          v.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : v.status === 'Pending'
                            ? 'bg-orange-50 text-orange-700 border-orange-200 animate-pulse'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right space-x-1.5">
                        {v.status !== 'Approved' && (
                          <button
                            onClick={() => handleVendorStatus(v.id, 'Approved')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition"
                          >
                            Approve
                          </button>
                        )}
                        {v.status === 'Pending' && (
                          <button
                            onClick={() => handleVendorStatus(v.id, 'Rejected')}
                            className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition"
                          >
                            Reject
                          </button>
                        )}
                        {v.status === 'Approved' && (
                          <button
                            onClick={() => handleVendorStatus(v.id, 'Suspended')}
                            className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition"
                          >
                            Suspend
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Product Approval tab */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Product Approvals</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Verify catalog specifications and safety parameters before products go live.
            </p>
          </div>

          {products.filter(p => p.status === 'Pending').length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-semibold">All product submissions cleared! Zero backlog.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {products.filter(p => p.status === 'Pending').map((p) => (
                <div key={p.id} className="p-6 flex flex-col md:flex-row justify-between gap-6 hover:bg-slate-50/30">
                  <div className="flex gap-4">
                    <img
                      src={p.images[0] || 'https://images.unsplash.com/photo-1516549655169-df83a0774514'}
                      alt={p.name}
                      className="w-20 h-20 object-cover rounded-xl border border-slate-100 shrink-0"
                    />
                    <div>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                        {p.category} &rsaquo; {p.subcategory}
                      </span>
                      <h4 className="font-bold text-slate-900 mt-1">{p.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{p.description}</p>
                      <div className="flex flex-wrap gap-4 mt-2.5 text-[10px] font-medium text-slate-400">
                        <span>SKU: <strong className="text-slate-700">{p.sku}</strong></span>
                        <span>Vendor: <strong className="text-teal-700">{p.vendorName}</strong></span>
                        <span>MOQ: <strong className="text-slate-700">{p.moq} units</strong></span>
                        <span>Price: <strong className="text-emerald-700">₹{p.price.toLocaleString('en-IN')}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col justify-end items-end gap-2 shrink-0">
                    <button
                      onClick={() => handleProductStatus(p.id, 'Approved')}
                      className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition w-full sm:w-28 text-center"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleProductStatus(p.id, 'Rejected')}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold px-4 py-2 rounded-xl transition w-full sm:w-28 text-center"
                    >
                      Reject Product
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Support Tickets Tab */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* Tickets List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden lg:col-span-1">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Assigned Tickets</h3>
            </div>
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setActiveTicket(t)}
                  className={`p-4 transition text-left cursor-pointer ${
                    activeTicket?.id === t.id ? 'bg-teal-50/50 border-r-4 border-teal-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded">
                      {t.category}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      t.status === 'Open'
                        ? 'bg-rose-50 text-rose-700'
                        : t.status === 'In Progress'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{t.subject}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">{t.description}</p>
                  <p className="text-[10px] text-slate-400 mt-2">Opened by {t.userName}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Active Ticket Details Chat thread */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden lg:col-span-2 flex flex-col min-h-[500px]">
            {activeTicket ? (
              <>
                <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
                  <div>
                    <span className="text-[10px] font-mono font-semibold text-slate-400">ID: {activeTicket.id}</span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{activeTicket.subject}</h3>
                    <p className="text-[11px] text-slate-500">Contact: {activeTicket.userName} ({activeTicket.userEmail})</p>
                  </div>
                  {activeTicket.status !== 'Closed' && (
                    <button
                      onClick={() => closeTicket(activeTicket.id)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                    >
                      Close Ticket
                    </button>
                  )}
                </div>

                {/* Messages Panel */}
                <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[300px]">
                  {activeTicket.replies.map((rep) => (
                    <div key={rep.id} className={`flex flex-col ${rep.isStaff ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                        rep.isStaff
                          ? 'bg-teal-700 text-white rounded-tr-none'
                          : 'bg-slate-100 text-slate-800 rounded-tl-none'
                      }`}>
                        <p className="font-semibold text-[10px] opacity-75 mb-1">{rep.senderName}</p>
                        <p>{rep.message}</p>
                      </div>
                      <span className="text-[9px] text-slate-400 mt-1">
                        {new Date(rep.time).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                {activeTicket.status !== 'Closed' ? (
                  <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
                    <div className="flex gap-3">
                      <textarea
                        rows={2}
                        placeholder="Type clinical solution or reply to vendor..."
                        value={ticketReplyText}
                        onChange={(e) => setTicketReplyText(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-teal-700 transition resize-none"
                      />
                      <button
                        onClick={() => handleTicketReply(activeTicket.id)}
                        className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-5 rounded-xl transition flex items-center justify-center shrink-0"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border-t border-slate-100 bg-slate-50 text-center shrink-0">
                    <p className="text-xs text-slate-400 font-semibold">This support ticket has been marked Closed.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <MessageSquare className="w-12 h-12 text-slate-200 mb-2" />
                <p className="text-xs">Select a support ticket from the checklist to open details.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin B2B Payment Clearance Verification Panel */}
      {activeTab === 'verify-payments' && (
        <div className="space-y-6 animate-fade-in pb-12">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-teal-700" />
              Manual Payment Clearance Audit Desk
            </h2>
            <p className="text-xs text-slate-500 mt-1">Audit offline UPI screenshots and Bank transfers before dispatching clearance certificates to vendors.</p>
          </div>

          {orders.filter(o => o.status === 'Awaiting Payment Verification').length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4 max-w-xl mx-auto">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
              <div>
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">All Payments Audited</h4>
                <p className="text-xs text-slate-400 mt-1">There are no pending manual payment receipts awaiting administrative clearance.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {orders
                .filter(o => o.status === 'Awaiting Payment Verification')
                .map((order) => {
                  const isRejecting = rejectingOrderId === order.id;

                  return (
                    <div key={order.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-3">
                      
                      {/* Left Column: Order details */}
                      <div className="p-6 lg:col-span-2 space-y-4 border-r border-slate-100">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                          <div>
                            <span className="text-[10px] bg-teal-50 text-teal-800 border border-teal-200 font-mono font-bold px-2 py-0.5 rounded">
                              Order #{order.id}
                            </span>
                            <span className="text-[11px] text-slate-400 ml-2 font-medium">
                              Logged: {new Date(order.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                            {order.status}
                          </span>
                        </div>

                        {/* Customer detail */}
                        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div>
                            <p className="text-slate-400 text-[10px] uppercase font-bold">Procurement Customer</p>
                            <p className="text-slate-800 font-bold mt-0.5">{order.shippingAddress.address || 'Hospital Authority'}</p>
                            <p className="text-slate-500 text-[10px]">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-[10px] uppercase font-bold">Payment Method</p>
                            <p className="text-slate-800 font-bold mt-0.5">{order.paymentMethod}</p>
                            <p className="text-teal-700 font-mono font-bold">Amount: ₹{order.finalAmount.toLocaleString('en-IN')}</p>
                          </div>
                        </div>

                        {/* Line items details */}
                        <div className="space-y-2">
                          <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Procured Line Items</p>
                          <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl px-3 py-1 bg-white">
                            {order.items.map((item, index) => (
                              <div key={index} className="py-2 flex justify-between text-xs">
                                <span className="text-slate-700 font-bold max-w-[70%] truncate">{item.productName} (x{item.quantity})</span>
                                <span className="text-slate-500 font-mono">₹{(item.price * item.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Transaction Receipt coordinates reported */}
                        <div className="space-y-2">
                          <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Transaction receipt metadata</p>
                          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs space-y-1.5 font-medium text-slate-600">
                            <p className="font-mono">UTR / Transaction ID: <strong className="text-slate-900 font-bold select-all bg-white border px-1.5 py-0.5 rounded">{order.paymentTxId || 'NOT REPORTED'}</strong></p>
                            {order.paymentNote && <p>Customer Reference Note: <span className="italic text-slate-800">"{order.paymentNote}"</span></p>}
                          </div>
                        </div>

                        {/* Audit Actions */}
                        <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
                          {!isRejecting ? (
                            <>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Clear payment verification for Order #${order.id} and route to vendor?`)) {
                                    handleVerifyPayment(order.id);
                                  }
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm transition"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Approve & Route to Vendor
                              </button>
                              <button
                                onClick={() => setRejectingOrderId(order.id)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold px-4 py-2.5 rounded-xl uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition"
                              >
                                <XCircle className="w-4 h-4" />
                                Reject Receipt Proof
                              </button>
                            </>
                          ) : (
                            <div className="w-full bg-rose-50/50 p-4 rounded-xl border border-rose-200 space-y-3">
                              <h5 className="text-rose-900 font-bold text-[11px] uppercase tracking-wider">Reject Payment Clearance</h5>
                              <div>
                                <label className="text-slate-500 block mb-1 text-[10px] font-bold">Specify Rejection Reason (sent to customer) *</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Transaction ID does not match, screenshot blurred, amount mismatch..."
                                  value={rejectionReasonText}
                                  onChange={(e) => setRejectionReasonText(e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-rose-600 transition"
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleRejectPayment(order.id)}
                                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-1.5 rounded-lg uppercase transition"
                                >
                                  Confirm Rejection
                                </button>
                                <button
                                  onClick={() => { setRejectingOrderId(null); setRejectionReasonText(''); }}
                                  className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs px-3 py-1.5 rounded-lg transition"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Column: Payment Proof Receipt Visual */}
                      <div className="p-6 bg-slate-50/80 flex flex-col justify-between items-center text-center">
                        <div className="w-full space-y-2">
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider text-left">Uploaded Payment Proof</p>
                          
                          {order.paymentProofUrl ? (
                            <div className="space-y-3">
                              {/* Document frame */}
                              <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm relative group overflow-hidden">
                                <img
                                  src={order.paymentProofUrl}
                                  alt="Customer Payment Receipt"
                                  className="w-full h-48 object-contain rounded"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                  <a
                                    href={order.paymentProofUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-white text-slate-800 text-[10px] font-bold px-3 py-1.5 rounded-lg shadow flex items-center gap-1 hover:bg-slate-100"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    View Full Document
                                  </a>
                                </div>
                              </div>
                              <p className="text-[10px] text-slate-400 truncate max-w-[200px] mx-auto font-mono">receipt_screenshot.png</p>
                            </div>
                          ) : (
                            <div className="border border-dashed border-slate-300 rounded-xl p-8 bg-slate-100 text-slate-400 flex flex-col items-center justify-center space-y-2">
                              <AlertCircle className="w-8 h-8 text-slate-300" />
                              <p className="text-[11px] font-semibold">No Receipt Uploaded</p>
                            </div>
                          )}
                        </div>

                        <div className="w-full border-t border-slate-200/60 pt-4 mt-4 text-[10px] text-slate-400 font-medium">
                          Audit logs logged under super admin key.
                        </div>
                      </div>

                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Admin Payment Settings Tab */}
      {activeTab === 'payment-settings' && (
        <div className="space-y-6 animate-fade-in pb-12">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-teal-700" />
              Global Procurement Payment Settings Manager
            </h2>
            <p className="text-xs text-slate-500 mt-1">Configure enabled online payment gateways and manual B2B clearing coordinates for clinical hospital buyers.</p>
          </div>

          <form onSubmit={handleSavePaymentSettings} className="space-y-6 max-w-4xl">
            
            {/* Razorpay Setup card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-teal-700" />
                  Razorpay API Gateway Credentials
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-slate-500">Enabled</span>
                  <input
                    type="checkbox"
                    checked={paymentSettings.razorpayEnabled}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, razorpayEnabled: e.target.checked })}
                    className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                  />
                </div>
              </div>
              <div className="p-6 space-y-4 font-medium text-slate-600">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-500 block mb-1 font-bold">Razorpay Key ID *</label>
                    <input
                      type="text"
                      placeholder="rzp_test_..."
                      value={paymentSettings.razorpayKeyId}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, razorpayKeyId: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-700 transition font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1 font-bold">Razorpay Secret Key *</label>
                    <input
                      type="password"
                      placeholder="••••••••••••••••••••••••"
                      value={paymentSettings.razorpaySecret}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, razorpaySecret: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-700 transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-500 block mb-1.5 font-bold">Operation Mode</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="razorpayMode"
                        checked={paymentSettings.razorpayMode === 'test'}
                        onChange={() => setPaymentSettings({ ...paymentSettings, razorpayMode: 'test' })}
                        className="accent-teal-600"
                      />
                      <span>Test / Sandbox Mode</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="razorpayMode"
                        checked={paymentSettings.razorpayMode === 'live'}
                        onChange={() => setPaymentSettings({ ...paymentSettings, razorpayMode: 'live' })}
                        className="accent-teal-600"
                      />
                      <span>Live Production Mode</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* UPI Settings Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-teal-700" />
                  UPI Payment Channel coordinates
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-slate-500">Enabled</span>
                  <input
                    type="checkbox"
                    checked={paymentSettings.upiEnabled}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, upiEnabled: e.target.checked })}
                    className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                  />
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 font-medium text-slate-600">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="text-slate-500 block mb-1 font-bold">UPI ID (VPA Address) *</label>
                    <input
                      type="text"
                      placeholder="e.g. corporate@okaxis"
                      value={paymentSettings.upiId}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, upiId: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-700 transition font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1 font-bold">UPI Account Holder Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. HealNex Private Limited"
                      value={paymentSettings.upiHolderName}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, upiHolderName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-700 transition"
                    />
                  </div>
                </div>
                <div className="md:col-span-1 space-y-2">
                  <label className="text-slate-500 block font-bold">UPI QR Code Image</label>
                  <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 text-center space-y-2 flex flex-col items-center justify-center">
                    {(upiQrCode || paymentSettings.upiQrCodeUrl) ? (
                      <div className="space-y-1.5">
                        <img
                          src={upiQrCode || paymentSettings.upiQrCodeUrl}
                          alt="UPI QR Code"
                          className="w-24 h-24 object-contain mx-auto rounded border bg-white"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => { setUpiQrCode(''); setPaymentSettings({ ...paymentSettings, upiQrCodeUrl: '' }); }}
                          className="text-[10px] text-red-500 hover:underline"
                        >
                          Clear Image
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <QrCode className="w-8 h-8 text-slate-300 mx-auto" />
                        <input
                          type="file"
                          accept="image/*"
                          id="upi-qr-input"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleUpiQrUpload(e.target.files[0])}
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById('upi-qr-input')?.click()}
                          className="text-[10px] text-teal-700 hover:underline font-bold"
                        >
                          Upload UPI QR
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Transfer Settings Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-teal-700" />
                  Bank Wire Clearing coordinates
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-slate-500">Enabled</span>
                  <input
                    type="checkbox"
                    checked={paymentSettings.bankEnabled}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, bankEnabled: e.target.checked })}
                    className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                  />
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 font-medium text-slate-600">
                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-500 block mb-1 font-bold">Account Holder Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. HealNex Private Limited"
                        value={paymentSettings.bankHolderName}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, bankHolderName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-700 transition"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1 font-bold">Bank Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. HDFC Bank"
                        value={paymentSettings.bankName}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, bankName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-700 transition"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-slate-500 block mb-1 font-bold">Account Number *</label>
                      <input
                        type="text"
                        placeholder="e.g. 50100492817283"
                        value={paymentSettings.bankAccountNumber}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, bankAccountNumber: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-700 transition font-mono"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="text-slate-500 block mb-1 font-bold">IFSC Code *</label>
                      <input
                        type="text"
                        placeholder="e.g. HDFC0001234"
                        value={paymentSettings.bankIfsc}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, bankIfsc: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-700 transition font-mono uppercase"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1 font-bold">Branch Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. KG Marg, Connaught Place, New Delhi"
                      value={paymentSettings.bankBranch}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, bankBranch: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none"
                    />
                  </div>
                </div>

                <div className="md:col-span-1 space-y-2">
                  <label className="text-slate-500 block font-bold">Optional Banking QR Code</label>
                  <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 text-center space-y-2 flex flex-col items-center justify-center">
                    {(bankQrCode || paymentSettings.bankQrCodeUrl) ? (
                      <div className="space-y-1.5">
                        <img
                          src={bankQrCode || paymentSettings.bankQrCodeUrl}
                          alt="Bank QR Code"
                          className="w-24 h-24 object-contain mx-auto rounded border bg-white"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => { setBankQrCode(''); setPaymentSettings({ ...paymentSettings, bankQrCodeUrl: '' }); }}
                          className="text-[10px] text-red-500 hover:underline"
                        >
                          Clear Image
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <QrCode className="w-8 h-8 text-slate-300 mx-auto" />
                        <input
                          type="file"
                          accept="image/*"
                          id="bank-qr-input"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleBankQrUpload(e.target.files[0])}
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById('bank-qr-input')?.click()}
                          className="text-[10px] text-teal-700 hover:underline font-bold"
                        >
                          Upload Bank QR
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-teal-700 hover:bg-teal-800 text-white font-bold py-3 px-8 rounded-xl uppercase tracking-wider text-[11px] shadow-lg cursor-pointer transition flex items-center gap-2"
              >
                <CheckCircle className="w-4.5 h-4.5" />
                Synchronize Payment Rules
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Admin WhatsApp Support Settings Tab */}
      {activeTab === 'whatsapp-support' && (
        <div className="space-y-8 animate-fade-in pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Configurations Form */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-emerald-500" />
                  WhatsApp support settings
                </h2>
                <p className="text-[10px] text-slate-400 mt-1">Configure instantly updated live support channels for clinical customers.</p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                dbLocal.saveWhatsAppSettings(whatsappSettings);
                addToast('WhatsApp support configurations synchronized successfully!', 'success');
              }} className="space-y-6">
                
                {/* Enable / Disable Section */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-150">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Enable WhatsApp Support Feature</span>
                    <span className="text-[10px] text-slate-400">Instantly toggle the floating WhatsApp support button for all customers.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={whatsappSettings.enabled}
                    onChange={(e) => setWhatsappSettings({ ...whatsappSettings, enabled: e.target.checked })}
                    className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>

                {/* Grid Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-slate-600">
                  <div>
                    <label className="text-slate-500 block mb-1 font-bold">WhatsApp Support Number *</label>
                    <input
                      type="text"
                      placeholder="e.g. +919876543210 (with country code)"
                      value={whatsappSettings.phoneNumber}
                      onChange={(e) => setWhatsappSettings({ ...whatsappSettings, phoneNumber: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500 transition font-mono"
                      required
                    />
                    <p className="text-[9px] text-slate-400 mt-1">Include country code without special characters or spaces.</p>
                  </div>

                  <div>
                    <label className="text-slate-500 block mb-1 font-bold">Button CTA Text *</label>
                    <input
                      type="text"
                      placeholder="e.g. Chat on WhatsApp"
                      value={whatsappSettings.buttonText}
                      onChange={(e) => setWhatsappSettings({ ...whatsappSettings, buttonText: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500 transition font-bold"
                      required
                    />
                    <p className="text-[9px] text-slate-400 mt-1">Aesthetic button caption displayed to visitors.</p>
                  </div>
                </div>

                <div className="text-xs font-medium text-slate-600">
                  <label className="text-slate-500 block mb-1 font-bold">WhatsApp Business Custom Link (Optional)</label>
                  <input
                    type="url"
                    placeholder="e.g. https://wa.me/message/YOUR_BUSINESS_ID"
                    value={whatsappSettings.businessLink || ''}
                    onChange={(e) => setWhatsappSettings({ ...whatsappSettings, businessLink: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500 transition font-mono"
                  />
                  <p className="text-[9px] text-slate-400 mt-1">Overrides default phone link. Leave blank to auto-generate using standard universal URL.</p>
                </div>

                {/* Default Welcome Message Template */}
                <div className="text-xs font-medium text-slate-600 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-slate-500 block font-bold">Default Welcome Message Template *</label>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded font-mono">Dynamic Placeholders Active</span>
                  </div>
                  <textarea
                    rows={4}
                    value={whatsappSettings.defaultMessage}
                    onChange={(e) => setWhatsappSettings({ ...whatsappSettings, defaultMessage: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500 transition font-sans leading-relaxed text-slate-700"
                    placeholder="Hello support, I need assistance..."
                    required
                  />
                  
                  {/* Placeholders Legend */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 grid grid-cols-3 gap-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => setWhatsappSettings({ ...whatsappSettings, defaultMessage: whatsappSettings.defaultMessage + ' {CustomerName}' })}
                      className="p-1.5 bg-white border border-slate-200 rounded-lg text-[10px] text-slate-600 hover:border-emerald-500 hover:text-emerald-700 transition font-bold"
                      title="Click to insert placeholder"
                    >
                      &#123;CustomerName&#125;
                    </button>
                    <button
                      type="button"
                      onClick={() => setWhatsappSettings({ ...whatsappSettings, defaultMessage: whatsappSettings.defaultMessage + ' {OrderNumber}' })}
                      className="p-1.5 bg-white border border-slate-200 rounded-lg text-[10px] text-slate-600 hover:border-emerald-500 hover:text-emerald-700 transition font-bold"
                      title="Click to insert placeholder"
                    >
                      &#123;OrderNumber&#125;
                    </button>
                    <button
                      type="button"
                      onClick={() => setWhatsappSettings({ ...whatsappSettings, defaultMessage: whatsappSettings.defaultMessage + ' {ProductName}' })}
                      className="p-1.5 bg-white border border-slate-200 rounded-lg text-[10px] text-slate-600 hover:border-emerald-500 hover:text-emerald-700 transition font-bold"
                      title="Click to insert placeholder"
                    >
                      &#123;ProductName&#125;
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-400">Placeholders will be automatically resolved to real contextual parameters depending on what page the customer initiates the chat from.</p>
                </div>

                {/* Display Preferences */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-slate-600">
                  <div>
                    <label className="text-slate-500 block mb-1 font-bold">Button Visual Layout Position</label>
                    <select
                      value={whatsappSettings.position}
                      onChange={(e) => setWhatsappSettings({ ...whatsappSettings, position: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-emerald-500 transition font-bold text-slate-700"
                    >
                      <option value="floating">Floating Support Button (Bottom Right)</option>
                      <option value="contact_page">Contact Page Cards Only (Non-Floating)</option>
                    </select>
                    <p className="text-[9px] text-slate-400 mt-1">Floating mode displays on the outer workspace; Contact mode disables outer overlay.</p>
                  </div>

                  <div>
                    <label className="text-slate-500 block mb-1 font-bold">Placement Rules</label>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500">Show on All Main Screens</span>
                      <input
                        type="checkbox"
                        checked={whatsappSettings.showOnAllScreens}
                        onChange={(e) => setWhatsappSettings({ ...whatsappSettings, showOnAllScreens: e.target.checked })}
                        className="w-4 h-4 accent-emerald-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Screen Selection Grid (Conditional) */}
                {!whatsappSettings.showOnAllScreens && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs font-medium text-slate-600 animate-slide-down">
                    <label className="text-slate-500 block font-bold mb-1">Target Screens Placement Selection *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { id: 'Home', label: 'Home Page' },
                        { id: 'ProductDetails', label: 'Product Details' },
                        { id: 'Cart', label: 'Cart Checkout' },
                        { id: 'Checkout', label: 'Secure Checkout' },
                        { id: 'Orders', label: 'My Orders' },
                        { id: 'Profile', label: 'Profile Desk' },
                        { id: 'HelpSupport', label: 'Help & Support' }
                      ].map((screen) => {
                        const isSelected = whatsappSettings.selectedScreens.includes(screen.id);
                        return (
                          <label key={screen.id} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/20 select-none">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                let list = [...whatsappSettings.selectedScreens];
                                if (isSelected) {
                                  list = list.filter(s => s !== screen.id);
                                } else {
                                  list.push(screen.id);
                                }
                                setWhatsappSettings({ ...whatsappSettings, selectedScreens: list });
                              }}
                              className="w-4 h-4 accent-emerald-500 rounded"
                            />
                            <span className="text-[10px] font-semibold text-slate-700">{screen.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sync Action */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl uppercase tracking-wider text-[11px] shadow-md cursor-pointer transition flex items-center gap-2"
                  >
                    <CheckCircle className="w-4.5 h-4.5" />
                    Synchronize Support Rules
                  </button>
                </div>
              </form>
            </div>

            {/* Sidebar Analytics Dashboard */}
            <div className="space-y-6">
              
              {/* Performance Indicator Card */}
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 rounded-2xl text-white shadow-md relative overflow-hidden">
                <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10">
                  <MessageCircle className="w-44 h-44" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">WhatsApp Channels Integration</p>
                <p className="text-3xl font-extrabold font-mono mt-1">{whatsappLogs.length}</p>
                <h3 className="text-xs font-semibold mt-1 opacity-90">Total Support Requests Initiated</h3>
                <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center text-[10px] font-medium opacity-85">
                  <span>Feature Status:</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold ${whatsappSettings.enabled ? 'bg-emerald-400 text-slate-900' : 'bg-red-400 text-slate-900'}`}>
                    {whatsappSettings.enabled ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </div>
              </div>

              {/* Dynamic Context breakdown */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Inquiries by Page</h3>
                <div className="space-y-2.5 text-xs font-semibold text-slate-600">
                  {['Home', 'ProductDetails', 'Cart', 'Checkout', 'Orders', 'HelpSupport'].map((p) => {
                    const count = whatsappLogs.filter(l => l.contextPage === p).length;
                    const percent = whatsappLogs.length > 0 ? (count / whatsappLogs.length) * 100 : 0;
                    return (
                      <div key={p} className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-700">{p === 'HelpSupport' ? 'Help & Support' : p === 'ProductDetails' ? 'Product Details' : p}</span>
                          <span className="font-mono text-slate-900">{count} clicks ({percent.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* Click logs Audit trail */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="border-b border-slate-100 pb-4 mb-4 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4.5 h-4.5 text-emerald-500" />
                  Support click-through analytics logs
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">Audit log of customer WhatsApp contact requests with context pages and timestamps.</p>
              </div>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to flush WhatsApp click analytics logs?')) {
                    dbLocal.set('healnex_whatsapp_click_logs', []);
                    setWhatsappLogs([]);
                    addToast('Analytics logs successfully cleared.', 'info');
                  }
                }}
                className="text-[10px] text-red-500 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Flush Logs
              </button>
            </div>

            {whatsappLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <MessageCircle className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                No WhatsApp clicks logged in this session yet.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full text-xs font-medium text-slate-600 text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-150 text-[10px] text-slate-400 uppercase tracking-wider bg-slate-50/50">
                      <th className="py-2.5 px-4 font-bold">timestamp</th>
                      <th className="py-2.5 px-4 font-bold">customer name</th>
                      <th className="py-2.5 px-4 font-bold">context page</th>
                      <th className="py-2.5 px-4 font-bold">related product</th>
                      <th className="py-2.5 px-4 font-bold">related order</th>
                    </tr>
                  </thead>
                  <tbody>
                    {whatsappLogs.map((log) => (
                      <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50/50 font-medium">
                        <td className="py-2.5 px-4 font-mono text-[10px] text-slate-400">
                          {new Date(log.timestamp).toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-4 text-slate-950 font-bold">
                          {log.customerName}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[9px] font-bold uppercase">
                            {log.contextPage === 'HelpSupport' ? 'Help & Support' : log.contextPage}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-900 font-semibold truncate max-w-xs" title={log.productName}>
                          {log.productName || <span className="text-slate-300">-</span>}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-teal-800">
                          {log.orderNumber ? `#${log.orderNumber}` : <span className="text-slate-300">-</span>}
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

      {/* Admin actions implementation helper functions */}
      {(() => {
        // Quick inline helper function attachment
        (window as any).handleSavePaymentSettings = handleSavePaymentSettings;
        return null;
      })()}

      {/* Documents review modal popup */}
      {selectedVendorDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-3xl max-w-6xl w-full h-[90vh] overflow-hidden shadow-2xl border border-slate-100 animate-scale-up flex flex-col font-sans">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 border-b border-slate-800 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-teal-900 text-teal-300 p-1.5 rounded-lg border border-teal-500/20">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-teal-300">
                    Clinical Vendor Auditing & Verification
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    ID: <span className="font-mono">{selectedVendorDoc.id}</span> • Registered: {new Date(selectedVendorDoc.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedVendorDoc(null);
                  setReasonRequiredAction(null);
                  setStatusReasonText('');
                }}
                className="text-slate-400 hover:text-white font-bold text-2xl transition cursor-pointer p-1"
              >
                &times;
              </button>
            </div>
            
            {/* Split Screen Workspace */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Left Column: Profile & Document Selection (4/12 cols) */}
              <div className="md:w-1/3 border-r border-slate-100 bg-slate-50/50 flex flex-col overflow-y-auto">
                
                {/* Profile Overview */}
                <div className="p-5 border-b border-slate-100 bg-white space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center font-bold text-sm">
                      {selectedVendorDoc.companyName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-850 text-xs truncate">
                        {selectedVendorDoc.companyName}
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        Owner: {selectedVendorDoc.ownerName}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 font-medium">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-150">
                      <span className="text-[8px] text-slate-400 block uppercase font-bold">GSTIN Number</span>
                      <span className="font-mono text-slate-800">{selectedVendorDoc.gstNumber}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-150">
                      <span className="text-[8px] text-slate-400 block uppercase font-bold">PAN Number</span>
                      <span className="font-mono text-slate-800">{selectedVendorDoc.panNumber || 'N/A'}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-150">
                      <span className="text-[8px] text-slate-400 block uppercase font-bold">Aadhaar Card</span>
                      <span className="font-mono text-slate-800">{selectedVendorDoc.aadhaarNumber || 'N/A'}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-150">
                      <span className="text-[8px] text-slate-400 block uppercase font-bold">Contact Phone</span>
                      <span className="text-slate-800">{selectedVendorDoc.mobileNumber}</span>
                    </div>
                  </div>

                  <div className="text-[10px] space-y-1 text-slate-600 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{selectedVendorDoc.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{selectedVendorDoc.businessAddress}, {selectedVendorDoc.district}, {selectedVendorDoc.state} - {selectedVendorDoc.pincode}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate font-mono">{selectedVendorDoc.bankDetails.bankName} - A/C {selectedVendorDoc.bankDetails.accountNumber} (IFSC: {selectedVendorDoc.bankDetails.ifscCode})</span>
                    </div>
                  </div>
                </div>

                {/* Document Selector Checklist */}
                <div className="p-5 space-y-3 flex-1">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Submitted Security Attachments:
                  </h4>
                  <div className="space-y-2">
                    {[
                      { key: 'gstCertificate', label: 'GST Certificate (REG-06)', required: true },
                      { key: 'tradeLicense', label: 'Active Trade License', required: true },
                      { key: 'companyRegCertificate', label: 'Company Registration (CoI)', required: true },
                      { key: 'cancelledCheque', label: 'Cancelled Cheque leaf', required: true },
                      { key: 'panCard', label: 'Corporate PAN Card', required: false },
                      { key: 'aadhaarCard', label: 'Promoter Aadhaar Card', required: false },
                      { key: 'drugLicense', label: 'State Drug Control License', required: false },
                      { key: 'fssaiLicense', label: 'FSSAI Food Safety License', required: false },
                    ].map((item) => {
                      // Retrieve file values from vendor documents
                      const docs = selectedVendorDoc.documents || {};
                      const urlField = (docs as any)[`${item.key}Url`] || '';
                      const nameField = (docs as any)[`${item.key}Name`] || '';
                      const hasDoc = !!urlField;

                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => {
                            if (hasDoc) {
                              setActiveReviewDocKey(item.key);
                              setDocZoom(100);
                              setDocRotation(0);
                            } else {
                              addToast(`${item.label} was not uploaded by this vendor.`, 'info');
                            }
                          }}
                          className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                            !hasDoc
                              ? 'bg-slate-100/50 border-slate-200/60 opacity-60 cursor-not-allowed'
                              : activeReviewDocKey === item.key
                              ? 'bg-teal-50 border-teal-500/40 text-teal-900 shadow-sm font-bold'
                              : 'bg-white border-slate-200 hover:border-teal-500/30'
                          }`}
                          disabled={!hasDoc}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`p-1.5 rounded-lg shrink-0 ${
                              !hasDoc ? 'bg-slate-200 text-slate-400' : 'bg-teal-100/60 text-teal-700'
                            }`}>
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold leading-tight truncate">
                                {item.label}
                              </p>
                              <p className="text-[8px] text-slate-400 truncate mt-0.5">
                                {hasDoc ? (nameField || 'uploaded_document.pdf') : 'Not Provided'}
                              </p>
                            </div>
                          </div>
                          
                          {item.required ? (
                            <span className="shrink-0 text-[7px] bg-rose-50 text-rose-600 px-1 py-0.5 rounded font-bold font-mono">
                              REQ
                            </span>
                          ) : (
                            <span className="shrink-0 text-[7px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded font-mono">
                              OPT
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: High-Fidelity Viewer stage (8/12 cols) */}
              <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden relative">
                
                {/* Document configuration lookup */}
                {(() => {
                  const docs = selectedVendorDoc.documents || {};
                  const activeUrl = (docs as any)[`${activeReviewDocKey}Url`];
                  const activeName = (docs as any)[`${activeReviewDocKey}Name` ] || `${activeReviewDocKey}_document.pdf`;
                  const activeLabelMap: Record<string, string> = {
                    gstCertificate: 'GST Certificate (REG-06)',
                    tradeLicense: 'Municipal Trade License',
                    companyRegCertificate: 'Company Registration (CoI)',
                    cancelledCheque: 'Cancelled Clearing Cheque Leaf',
                    panCard: 'Corporate PAN Card',
                    aadhaarCard: 'Promoter Aadhaar Card',
                    drugLicense: 'State Drug Control License',
                    fssaiLicense: 'FSSAI Food Safety License',
                  };
                  const activeLabel = activeLabelMap[activeReviewDocKey] || 'Corporate Document';

                  // If they didn't upload or it's empty, find the first available uploaded doc as default fallback
                  let finalKey = activeReviewDocKey;
                  let finalUrl = activeUrl;
                  let finalName = activeName;
                  let finalLabel = activeLabel;

                  if (!finalUrl) {
                    const firstUploaded = Object.keys(docs).find(k => k.endsWith('Url') && (docs as any)[k]);
                    if (firstUploaded) {
                      finalKey = firstUploaded.replace('Url', '');
                      finalUrl = (docs as any)[firstUploaded];
                      finalName = (docs as any)[`${finalKey}Name`] || `${finalKey}_document.pdf`;
                      finalLabel = activeLabelMap[finalKey] || 'Corporate Document';
                    }
                  }

                  // Generate beautiful preview image
                  const previewBase64 = generateAdminDocumentCanvas(finalLabel, finalName, selectedVendorDoc.companyName);

                  return (
                    <>
                      {/* Document Toolbar */}
                      <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 shrink-0 text-white select-none">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] bg-teal-900/60 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded font-mono font-bold shrink-0 uppercase">
                            {finalName.split('.').pop() || 'PDF'}
                          </span>
                          <span className="text-xs font-bold text-slate-350 truncate" title={finalName}>
                            {finalName}
                          </span>
                        </div>

                        {/* Control buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setDocZoom(prev => Math.max(50, prev - 15))}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition cursor-pointer"
                            title="Zoom Out"
                          >
                            <ZoomOut className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[10px] font-mono text-slate-400 w-12 text-center shrink-0">
                            {docZoom}%
                          </span>
                          <button
                            type="button"
                            onClick={() => setDocZoom(prev => Math.min(250, prev + 15))}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition cursor-pointer"
                            title="Zoom In"
                          >
                            <ZoomIn className="w-3.5 h-3.5" />
                          </button>
                          <div className="w-px h-4 bg-slate-800 mx-1" />
                          <button
                            type="button"
                            onClick={() => setDocRotation(prev => prev - 90)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition cursor-pointer"
                            title="Rotate Left"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDocRotation(prev => prev + 90)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition cursor-pointer"
                            title="Rotate Right"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDocZoom(100);
                              setDocRotation(0);
                            }}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-md text-[10px] font-bold text-slate-300 transition cursor-pointer"
                          >
                            Reset
                          </button>
                          <div className="w-px h-4 bg-slate-800 mx-1" />

                          {/* Real Downloader */}
                          <a
                            href={previewBase64}
                            download={`healnex_audit_${selectedVendorDoc.companyName.toLowerCase().replace(/\s+/g, '_')}_${finalName}`}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[10px] font-bold transition cursor-pointer"
                            title="Download verified document to device"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </a>
                        </div>
                      </div>

                      {/* Display Stage */}
                      <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-slate-950/80">
                        <div
                          className="shadow-2xl border border-slate-800 bg-white rounded-lg overflow-hidden cursor-grab active:cursor-grabbing origin-center"
                          style={{
                            transform: `scale(${docZoom / 100}) rotate(${docRotation}deg)`,
                            transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
                          }}
                        >
                          <img
                            src={previewBase64}
                            alt="Digitized audit document preview"
                            referrerPolicy="no-referrer"
                            className="w-[480px] h-[640px] object-contain select-none"
                            draggable={false}
                          />
                        </div>
                      </div>
                    </>
                  );
                })()}

              </div>
            </div>

            {/* Modal Action Reason overlay (slide-up) */}
            {reasonRequiredAction && (
              <div className="absolute inset-x-0 bottom-0 bg-slate-900/95 backdrop-blur-md p-6 border-t border-slate-800 text-white animate-slide-up shrink-0 z-10">
                <div className="max-w-2xl mx-auto space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-orange-400" />
                      <h4 className="font-bold text-sm uppercase tracking-wider text-orange-300">
                        Provide Action Reason Note
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReasonRequiredAction(null)}
                      className="text-slate-400 hover:text-white font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-350">
                    You have selected <span className="text-orange-400 font-bold">{reasonRequiredAction.toUpperCase()}</span>. This audit reason will be saved in the database under <span className="font-mono text-white">statusReason</span> and pushed via in-app alerts and secure mail logs directly to the clinical vendor partner.
                  </p>
                  <div>
                    <label className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                      Reason Message Details:
                    </label>
                    <textarea
                      rows={3}
                      value={statusReasonText}
                      onChange={(e) => setStatusReasonText(e.target.value)}
                      placeholder={`e.g., GST Certificate uploaded is blurred. Please capture a clear camera scan or upload the direct REG-06 PDF copy. Thank you.`}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-teal-500/50 text-white font-medium"
                    />
                  </div>
                  <div className="flex justify-end gap-3.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setReasonRequiredAction(null)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                    >
                      Cancel Action
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!statusReasonText.trim()) {
                          addToast('Audit reason details cannot be blank.', 'error');
                          return;
                        }
                        handleVendorStatus(selectedVendorDoc.id, reasonRequiredAction, statusReasonText);
                      }}
                      className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition"
                    >
                      Confirm and Submit Audit Status
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Action Panel Footer */}
            {!reasonRequiredAction && (
              <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                    Current Partner Status:
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase ${
                    selectedVendorDoc.status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : selectedVendorDoc.status === 'Pending'
                      ? 'bg-orange-100 text-orange-800 border-orange-300'
                      : selectedVendorDoc.status === 'MoreInfoRequired'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-rose-100 text-rose-800 border-rose-300'
                  }`}>
                    {selectedVendorDoc.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Approve Action */}
                  <button
                    type="button"
                    onClick={() => handleVendorStatus(selectedVendorDoc.id, 'Approved')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve Vendor</span>
                  </button>

                  {/* Request More Documents */}
                  <button
                    type="button"
                    onClick={() => setReasonRequiredAction('MoreInfoRequired')}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Request More Info</span>
                  </button>

                  {/* Reject Action */}
                  <button
                    type="button"
                    onClick={() => setReasonRequiredAction('Rejected')}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject Onboarding</span>
                  </button>

                  {/* Suspend Action (only if approved) */}
                  {selectedVendorDoc.status === 'Approved' && (
                    <button
                      type="button"
                      onClick={() => setReasonRequiredAction('Suspended')}
                      className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-1"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Suspend Vendor</span>
                    </button>
                  )}
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}

      {/* ----------------- FCM Cloud Push Logs Footer Component ----------------- */}
      <div className="mt-12 pt-8 border-t border-slate-200">
        <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 shadow-2xl border border-slate-800 font-sans">
          
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-teal-950 text-teal-400 p-2 rounded-xl border border-teal-500/20">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  FCM Cloud Push Logs &amp; Alert Telemetry
                </h3>
                <p className="text-[10px] text-slate-400">
                  Real-time server push gateway for hospital purchasers and vendor partners
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 text-[10px] font-mono font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                ACTIVE (HTTP/2 Multiplex)
              </span>
              <button
                onClick={() => {
                  dbLocal.saveNotifications([]);
                  setNotifs([]);
                  addToast('FCM Cloud Push log buffer purged.', 'info');
                }}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 hover:text-rose-400 text-slate-400 rounded-lg transition"
                title="Purge logs"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Grid Layout: Logs feed + Trigger diagnostic box */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Logs List feed */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Server className="w-3.5 h-3.5 text-teal-500" />
                  Live Multiplex stream ({notifs.length} logged)
                </span>
                <span className="text-[9px] font-mono text-slate-500">
                  Buffer: LocalStorage DB API
                </span>
              </div>

              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/80 max-h-72 overflow-y-auto divide-y divide-slate-900/60 font-mono text-[11px] leading-relaxed">
                {notifs.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 space-y-2">
                    <p className="text-xs font-semibold">Gateway buffer is clean.</p>
                    <p className="text-[10px] text-slate-600">Push-trigger commands are online. Issue a diagnostic payload.</p>
                  </div>
                ) : (
                  notifs.map((log) => (
                    <div key={log.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3 hover:bg-slate-900/40 px-2 rounded-lg transition">
                      <div className="shrink-0 mt-1">
                        <span className="relative flex h-2 w-2">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${log.read ? 'bg-slate-600' : 'bg-teal-400'}`}></span>
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${log.read ? 'bg-slate-500' : 'bg-teal-500'}`}></span>
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-teal-400 font-bold text-[10px]">
                            {log.title}
                          </span>
                          <span className="bg-slate-800 text-slate-300 text-[8px] px-1.5 py-0.5 rounded border border-slate-700 font-bold uppercase tracking-wider">
                            {log.type}
                          </span>
                          <span className="text-slate-500 text-[9px]">
                            Target: {log.userId}
                          </span>
                        </div>
                        <p className="text-slate-300 text-[10px] mt-1 break-words">
                          {log.message}
                        </p>
                        <p className="text-slate-600 text-[9px] mt-1.5 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Diagnostics triggers Box */}
            <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800/80 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-orange-400 animate-bounce" />
                  Trigger Diagnostic Broadcast
                </h4>
                <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">
                  Generate immediate mock cloud pushes to specific segments to audit response times.
                </p>

                <div className="space-y-3 text-[10px] font-semibold text-slate-300">
                  <div>
                    <label className="block mb-1 text-slate-400">Target Segment ID</label>
                    <select
                      value={pushTarget}
                      onChange={(e) => setPushTarget(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs outline-none focus:border-teal-700 text-white"
                    >
                      <option value="admin">Administrators ('admin')</option>
                      <option value="customer-sharma">Dr. Ramesh Sharma ('customer-sharma')</option>
                      <option value="vendor-medilink">MediLink Systems ('vendor-medilink')</option>
                      <option value="all">Global Broadcast ('all')</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-400">Push Category/Topic</label>
                    <select
                      value={pushType}
                      onChange={(e) => setPushType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs outline-none focus:border-teal-700 text-white"
                    >
                      <option value="clinical_broadcast">Clinical Announcement</option>
                      <option value="critical_alert">Critical Hardware Shortage</option>
                      <option value="rfq_created">New RFQ Opened</option>
                      <option value="vendor_approved">Vendor Approval Status</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-400">Custom Alert Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Critical Supply Warning"
                      value={pushTitle}
                      onChange={(e) => setPushTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs outline-none focus:border-teal-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-400">Alert Body Content</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="e.g. Nationwide ICU ventilator inventory critical. Immediate review recommended."
                      value={pushMessage}
                      onChange={(e) => setPushMessage(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs outline-none focus:border-teal-700 text-white resize-none"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!pushTitle.trim() || !pushMessage.trim()) {
                    addToast('Please enter both custom push title and message.', 'error');
                    return;
                  }
                  dbLocal.addNotification(pushTarget, pushTitle.trim(), pushMessage.trim(), pushType);
                  setNotifs(dbLocal.getNotifications());
                  addToast('FCM Cloud Push Payload successfully dispatched to target multiplex!', 'success');
                  setPushTitle('');
                  setPushMessage('');
                }}
                className="w-full mt-4 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold py-2.5 rounded-xl uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer animate-pulse"
                style={{ animationDuration: '3s' }}
              >
                Send Cloud Push
              </button>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
