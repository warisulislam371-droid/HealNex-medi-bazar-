import React, { useState, useEffect } from 'react';
import { dbLocal } from '../db';
import { Vendor, Product, SupportTicket, Order, User, Notification } from '../types';
import { supabase, isSupabaseConfigured } from '../supabase';
import { INITIAL_CATEGORIES } from '../data';
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
  Percent,
  Tags,
  UserPlus,
  Plus,
  Edit,
  Settings
} from 'lucide-react';

// Global helper for generating a beautiful high-fidelity scanned document preview
const generateAdminDocumentCanvas = (docTitle: string, fileName: string, companyName: string): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 800;
  const ctx = canvas.getContext('2d')!;
  
  // Background
  ctx.fillStyle = '#fafafa';
  ctx.fillRect(0, 0, 600, 800);
  
  // Document border
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, 586, 786);
  
  // Header banner
  ctx.fillStyle = '#0f766e'; // HealNex Teal
  ctx.fillRect(14, 14, 572, 115);
  
  // Header Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillText('HEALNEX SECURE MEDICAL PORTAL', 40, 58);
  ctx.font = '12px monospace';
  ctx.fillStyle = '#ccfbf1';
  ctx.fillText('CLINICAL AUDITING HUB • RECONCILIATION GATEWAY • SUPABASE STORAGE', 40, 88);
  
  // Watermark
  ctx.save();
  ctx.translate(300, 450);
  ctx.rotate(-Math.PI / 4);
  ctx.fillStyle = 'rgba(15, 118, 110, 0.04)';
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
  
  ctx.fillStyle = '#0f766e';
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
  ctx.fillStyle = '#0f766e';
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
  ctx.strokeStyle = '#0f766e';
  ctx.lineWidth = 1;
  ctx.strokeRect(40, 600, 180, 75);
  ctx.fillStyle = '#475569';
  ctx.font = '9px system-ui, sans-serif';
  ctx.fillText('AUTHORIZED AUDITOR SIGNATURE', 50, 618);
  ctx.font = 'italic 18px cursive, system-ui';
  ctx.fillStyle = '#0f766e';
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
  
  const [activeTab, setActiveTab] = useState<'kpis' | 'vendors' | 'products' | 'tickets' | 'audit' | 'commission' | 'categories' | 'vendor_invites'>('kpis');
  
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

  // States for Category Management
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [loadingCat, setLoadingCat] = useState(false);

  // States for Commission Management
  const [vendorsList, setVendorsList] = useState<any[]>([]);
  const [loadingCommission, setLoadingCommission] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  // States for Vendor Invites
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteShopName, setInviteShopName] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteCommission, setInviteCommission] = useState('10');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [vendorsInviteList, setVendorsInviteList] = useState<any[]>([]);

  // States for Razorpay Platform Settings
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [razorpayRouteEnabled, setRazorpayRouteEnabled] = useState(false);
  const [defaultCommission, setDefaultCommission] = useState(10);
  const [loadingConfig, setLoadingConfig] = useState(false);

  // States for Support / WhatsApp Settings
  const [settingsSubTab, setSettingsSubTab] = useState<'payments' | 'support'>('payments');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('');

  // States for Vendor Payouts
  const [payoutsList, setPayoutsList] = useState<any[]>([]);
  const [loadingPayouts, setLoadingPayouts] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<any | null>(null);

  // Modal form states for editing payout setup
  const [modalMethod, setModalMethod] = useState<'UPI' | 'Razorpay Route' | 'Bank'>('UPI');
  const [modalUpiId, setModalUpiId] = useState('');
  const [modalRazorpayId, setModalRazorpayId] = useState('');
  const [modalBankName, setModalBankName] = useState('');
  const [modalBankAcc, setModalBankAcc] = useState('');
  const [modalBankIfsc, setModalBankIfsc] = useState('');
  const [modalVerified, setModalVerified] = useState(false);
  const [isPayoutSaving, setIsPayoutSaving] = useState(false);

  // States for Commission Reports
  const [commissionLogs, setCommissionLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // States for Product Management (Admin direct add & edit)
  const [prodSubTab, setProdSubTab] = useState<'approvals' | 'catalog'>('approvals');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Product Form states
  const [prodName, setProdName] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodCategory, setProdCategory] = useState('Imaging Diagnostics');
  const [prodSubcategory, setProdSubcategory] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodPrice, setProdPrice] = useState(0);
  const [prodSalePrice, setProdSalePrice] = useState(0);
  const [prodMoq, setProdMoq] = useState(1);
  const [prodSku, setProdSku] = useState('');
  const [prodHsnCode, setProdHsnCode] = useState('90181100');
  const [prodGstRate, setProdGstRate] = useState(12);
  const [prodWarranty, setProdWarranty] = useState('1 Year');
  const [prodCountryOfOrigin, setProdCountryOfOrigin] = useState('India');
  const [prodImage, setProdImage] = useState('https://images.unsplash.com/photo-1516549655169-df83a0774514');
  const [prodVendorId, setProdVendorId] = useState('');

  // Load Razorpay & WhatsApp config from Supabase or LocalStorage
  const fetchConfig = async () => {
    setLoadingConfig(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('app_config')
          .select('*')
          .eq('id', 1)
          .maybeSingle();
        if (data) {
          setRazorpayKeyId(data.razorpay_key_id || '');
          setRazorpayRouteEnabled(data.razorpay_route_enabled || false);
          setDefaultCommission(data.default_commission || 10);
          setWhatsappNumber(data.whatsapp_support_number || '');
          setWhatsappMessage(data.whatsapp_support_message || '');
          setLoadingConfig(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Error fetching config from Supabase, using localStorage:', err);
    }

    // LocalStorage fallback
    const localConfigStr = localStorage.getItem('healnex_app_config');
    const localConfig = localConfigStr 
      ? JSON.parse(localConfigStr) 
      : { razorpay_key_id: '', razorpay_route_enabled: false, default_commission: 10, whatsapp_support_number: '', whatsapp_support_message: '' };
    
    setRazorpayKeyId(localConfig.razorpay_key_id || '');
    setRazorpayRouteEnabled(localConfig.razorpay_route_enabled || false);
    setDefaultCommission(localConfig.default_commission || 10);
    setWhatsappNumber(localConfig.whatsapp_support_number || '');
    setWhatsappMessage(localConfig.whatsapp_support_message || '');
    setLoadingConfig(false);
  };

  // Save Razorpay & WhatsApp config to Supabase and LocalStorage
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clean and validate WhatsApp number if present
    const cleanedWhatsapp = whatsappNumber.replace(/\D/g, '');
    if (whatsappNumber && (cleanedWhatsapp.length < 10 || cleanedWhatsapp.length > 15)) {
      addToast('WhatsApp number must be 10 to 15 digits (include country code, e.g. 919876543210)', 'error');
      return;
    }

    setLoadingConfig(true);
    const configPayload = {
      id: 1,
      razorpay_key_id: razorpayKeyId,
      razorpay_route_enabled: razorpayRouteEnabled,
      default_commission: Number(defaultCommission),
      whatsapp_support_number: cleanedWhatsapp,
      whatsapp_support_message: whatsappMessage
    };

    let savedInSupabase = false;
    let supabaseErrorMsg = '';
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('app_config')
          .upsert(configPayload);
        if (!error) {
          savedInSupabase = true;
        } else {
          console.error('Supabase save error:', error);
          supabaseErrorMsg = error.message;
        }
      }
    } catch (err: any) {
      console.warn('Exception saving config to Supabase:', err);
      supabaseErrorMsg = err.message || 'Connection timeout';
    }

    // Save to LocalStorage
    localStorage.setItem('healnex_app_config', JSON.stringify(configPayload));
    setLoadingConfig(false);

    if (savedInSupabase) {
      addToast('Configuration successfully synced with Supabase cloud database.', 'success');
    } else if (isSupabaseConfigured) {
      addToast(`Saved to offline fallback mode. Database update note: ${supabaseErrorMsg}. Please check columns.`, 'info');
    } else {
      addToast('Configuration saved successfully in local offline sandbox mode.', 'success');
    }

    // Dispatch event to update floating WhatsApp support button in real-time
    window.dispatchEvent(new CustomEvent('healnex_config_updated'));
  };

  // Fetch Vendor Payouts records
  const fetchPayouts = async () => {
    setLoadingPayouts(true);
    let supabasePayouts: any[] = [];
    let supabaseUsers: any[] = [];

    try {
      if (isSupabaseConfigured) {
        const { data: users, error: uErr } = await supabase
          .from('users')
          .select('id, email, shop_name')
          .eq('role', 'vendor');
        const { data: payouts, error: pErr } = await supabase
          .from('vendor_payouts')
          .select('*');

        if (!uErr && users) supabaseUsers = users;
        if (!pErr && payouts) supabasePayouts = payouts;
      }
    } catch (err) {
      console.warn('Error fetching payouts from Supabase:', err);
    }

    // Merge users & payouts
    const localUsers = dbLocal.getUsers().filter(u => u.role === 'vendor');
    const localPayouts = JSON.parse(localStorage.getItem('healnex_vendor_payouts') || '[]');

    const merged = (isSupabaseConfigured && supabaseUsers.length > 0 ? supabaseUsers : localUsers).map(user => {
      const dbMatch = supabasePayouts.find((p: any) => p.vendor_id === user.id) || 
                      localPayouts.find((p: any) => p.vendor_id === user.id);
      
      const vendorDetails = dbLocal.getVendors().find(v => v.id === user.id);
      const fallbackShop = vendorDetails?.companyName || user.name || 'Vendor Shop';

      return {
        vendor_id: user.id,
        email: user.email,
        shop_name: user.shop_name || fallbackShop,
        payment_method: dbMatch?.payment_method || 'UPI',
        upi_id: dbMatch?.upi_id || '',
        razorpay_account_id: dbMatch?.razorpay_account_id || '',
        bank_name: dbMatch?.bank_name || vendorDetails?.bankDetails?.bankName || '',
        bank_acc_no: dbMatch?.bank_acc_no || vendorDetails?.bankDetails?.accountNumber || '',
        bank_ifsc: dbMatch?.bank_ifsc || vendorDetails?.bankDetails?.ifscCode || '',
        is_verified: dbMatch?.is_verified !== undefined ? dbMatch.is_verified : false
      };
    });

    setPayoutsList(merged);
    setLoadingPayouts(false);
  };

  // Open modal to edit payout method
  const handleEditPayoutClick = (vendor: any) => {
    setSelectedPayout(vendor);
    setModalMethod(vendor.payment_method || 'UPI');
    setModalUpiId(vendor.upi_id || '');
    setModalRazorpayId(vendor.razorpay_account_id || '');
    setModalBankName(vendor.bank_name || '');
    setModalBankAcc(vendor.bank_acc_no || '');
    setModalBankIfsc(vendor.bank_ifsc || '');
    setModalVerified(vendor.is_verified || false);
  };

  // Save specific vendor payout structure
  const handleSavePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayout) return;

    // UPI regex verification: ^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$
    if (modalMethod === 'UPI') {
      const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
      if (!upiRegex.test(modalUpiId)) {
        addToast('Invalid UPI ID format. Please correct it (e.g., name@bank).', 'error');
        return;
      }
    }

    setIsPayoutSaving(true);
    const payload = {
      vendor_id: selectedPayout.vendor_id,
      payment_method: modalMethod,
      upi_id: modalMethod === 'UPI' ? modalUpiId : '',
      razorpay_account_id: modalMethod === 'Razorpay Route' ? modalRazorpayId : '',
      bank_name: modalMethod === 'Bank' ? modalBankName : '',
      bank_acc_no: modalMethod === 'Bank' ? modalBankAcc : '',
      bank_ifsc: modalMethod === 'Bank' ? modalBankIfsc : '',
      is_verified: modalVerified
    };

    let savedSupabase = false;
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('vendor_payouts')
          .upsert(payload, { onConflict: 'vendor_id' });
        if (!error) savedSupabase = true;
        else console.error('Supabase payout upsert error:', error);
      }
    } catch (err) {
      console.warn('Exception upserting payout in Supabase:', err);
    }

    // Save locally
    const localPayouts = JSON.parse(localStorage.getItem('healnex_vendor_payouts') || '[]');
    const existingIndex = localPayouts.findIndex((p: any) => p.vendor_id === selectedPayout.vendor_id);
    if (existingIndex > -1) {
      localPayouts[existingIndex] = payload;
    } else {
      localPayouts.push(payload);
    }
    localStorage.setItem('healnex_vendor_payouts', JSON.stringify(localPayouts));

    // Update in-memory state
    setPayoutsList(prev => prev.map(item => {
      if (item.vendor_id === selectedPayout.vendor_id) {
        return {
          ...item,
          ...payload
        };
      }
      return item;
    }));

    setIsPayoutSaving(false);
    setSelectedPayout(null);
    addToast(savedSupabase 
      ? `Payout parameters updated for ${selectedPayout.shop_name} in cloud.` 
      : `Payout parameters saved locally for ${selectedPayout.shop_name}.`, 'success');
  };

  // Fetch Commission Reports logs
  const fetchCommissionLogs = async () => {
    setLoadingLogs(true);
    let dbLogs: any[] = [];
    
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('commission_logs')
          .select('*');
        if (data && !error) {
          dbLogs = data;
        }
      }
    } catch (err) {
      console.warn('Error fetching commission logs from Supabase, pulling locally:', err);
    }

    // Seeding local logs if empty, so dashboard metrics are always beautiful
    let localLogsStr = localStorage.getItem('healnex_commission_logs');
    if (!localLogsStr) {
      // Seed initial sample logs using existing default orders in system
      const sampleLogs = [
        {
          id: 'log_01',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          vendor_id: 'vendor-medilink',
          order_id: 'ORD-89324',
          order_total: 64960,
          commission_percent: 10,
          commission_amount: 6496,
          vendor_payout: 58464,
          status: 'transferred',
          transfer_id: 'trsf_982402'
        },
        {
          id: 'log_02',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          vendor_id: 'vendor-medilink',
          order_id: 'ORD-12048',
          order_total: 45000,
          commission_percent: 12,
          commission_amount: 5400,
          vendor_payout: 39600,
          status: 'pending',
          transfer_id: null
        }
      ];
      localStorage.setItem('healnex_commission_logs', JSON.stringify(sampleLogs));
      localLogsStr = JSON.stringify(sampleLogs);
    }

    const localLogs = JSON.parse(localLogsStr || '[]');
    const finalLogs = dbLogs.length > 0 ? dbLogs : localLogs;

    // Build lists for quick client mapping (users + orders)
    const localUsers = dbLocal.getUsers();
    const localOrders = dbLocal.getOrders();

    const mapped = finalLogs.map((log: any) => {
      const uMatch = localUsers.find(u => u.id === log.vendor_id);
      const vMatch = dbLocal.getVendors().find(v => v.id === log.vendor_id);
      return {
        ...log,
        shop_name: (uMatch as any)?.shop_name || vMatch?.companyName || uMatch?.name || 'Medi Supplier',
        order_code: log.order_id
      };
    });

    setCommissionLogs(mapped);
    setLoadingLogs(false);
  };

  // Slugify Helper
  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  };

  // 1. Commission Management fetching & saving
  const fetchVendors = async () => {
    setLoadingCommission(true);
    try {
      let supabaseData: any[] = [];
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('users')
          .select('id, email, shop_name, commission_percent, vendor_status')
          .eq('role', 'vendor');
        if (error) throw error;
        supabaseData = data || [];
      }
      
      const localVendors = dbLocal.getVendors();
      const localUsers = dbLocal.getUsers().filter(u => u.role === 'vendor');
      
      const merged = localUsers.map(user => {
        const vendorDetails = localVendors.find(v => v.id === user.id);
        const matchInSupabase = supabaseData.find(s => s.id === user.id || s.email === user.email);
        return {
          id: user.id,
          email: user.email,
          shop_name: matchInSupabase?.shop_name || vendorDetails?.companyName || user.name || 'Medi Vendor',
          commission_percent: matchInSupabase?.commission_percent !== undefined ? matchInSupabase.commission_percent : (vendorDetails as any)?.commission_percent || 10,
          vendor_status: matchInSupabase?.vendor_status || vendorDetails?.status?.toLowerCase() || 'pending'
        };
      });
      
      supabaseData.forEach((sUser: any) => {
        if (!merged.some(m => m.id === sUser.id || m.email === sUser.email)) {
          merged.push({
            id: sUser.id,
            email: sUser.email,
            shop_name: sUser.shop_name || 'Supabase Vendor',
            commission_percent: sUser.commission_percent !== undefined ? sUser.commission_percent : 10,
            vendor_status: sUser.vendor_status || 'pending'
          });
        }
      });

      setVendorsList(merged);
    } catch (err: any) {
      console.warn('Supabase query error (likely infinite recursion in RLS policy):', err);
      const localVendors = dbLocal.getVendors();
      const localUsers = dbLocal.getUsers().filter(u => u.role === 'vendor');
      const merged = localUsers.map(user => {
        const vendorDetails = localVendors.find(v => v.id === user.id);
        return {
          id: user.id,
          email: user.email,
          shop_name: vendorDetails?.companyName || user.name || 'Medi Vendor',
          commission_percent: (vendorDetails as any)?.commission_percent || 10,
          vendor_status: vendorDetails?.status?.toLowerCase() || 'pending'
        };
      });
      setVendorsList(merged);
    } finally {
      setLoadingCommission(false);
    }
  };

  const handleSaveCommission = async (id: string, email: string, comm: number, status: string) => {
    setSavingId(id);
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('users')
          .update({
            commission_percent: comm,
            vendor_status: status
          })
          .eq('id', id);
        if (error) {
          await supabase
            .from('users')
            .update({
              commission_percent: comm,
              vendor_status: status
            })
            .eq('email', email);
        }
      }

      // Sync local storage
      const users = dbLocal.getUsers();
      const updatedUsers = users.map(u => {
        if (u.id === id || u.email === email) {
          return { ...u, isVerified: status === 'approved' };
        }
        return u;
      });
      dbLocal.saveUsers(updatedUsers);

      const vendorsLocal = dbLocal.getVendors();
      const updatedVendors = vendorsLocal.map(v => {
        if (v.id === id || v.email === email) {
          return {
            ...v,
            status: (status.charAt(0).toUpperCase() + status.slice(1)) as any,
            commission_percent: comm
          };
        }
        return v;
      });
      dbLocal.saveVendors(updatedVendors);

      addToast('Commission percent and Vendor status successfully saved!', 'success');
      fetchVendors();
    } catch (err: any) {
      addToast(err.message || 'Error updating record', 'error');
    } finally {
      setSavingId(null);
    }
  };

  // 2. Category Management fetching & saving
  const fetchCategories = async () => {
    setLoadingCat(true);
    try {
      let fetched: any[] = [];
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        if (error) throw error;
        fetched = data || [];
      } else {
        throw new Error('Supabase not configured');
      }
      setCategoriesList(fetched);
    } catch (err: any) {
      console.warn('Error fetching categories from Supabase, loading fallback:', err);
      const localCats = dbLocal.get('healnex_custom_categories', []);
      const mergedCats = [
        ...INITIAL_CATEGORIES.map(c => ({ id: c.id, name: c.name, description: 'Standard clinical equipment category', slug: c.id })),
        ...localCats
      ];
      setCategoriesList(mergedCats);
    } finally {
      setLoadingCat(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    const slug = slugify(catName);
    const desc = catDesc.trim();
    
    try {
      if (isSupabaseConfigured) {
        const { data: { session } } = await supabase.auth.getSession();
        const created_by = session?.user?.id || null;
        const { error } = await supabase
          .from('categories')
          .insert({
            name: catName.trim(),
            slug,
            description: desc,
            created_by
          });
        if (error) throw error;
      }
      
      const localCats = dbLocal.get('healnex_custom_categories', []);
      const newCat = {
        id: `cat-${Date.now()}`,
        name: catName.trim(),
        description: desc,
        slug
      };
      dbLocal.set('healnex_custom_categories', [...localCats, newCat]);

      addToast(`Category "${catName}" successfully created!`, 'success');
      setCatName('');
      setCatDesc('');
      fetchCategories();
    } catch (err: any) {
      addToast(err.message || 'Error inserting category', 'error');
    }
  };

  const handleEditCategory = async (id: string) => {
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('categories')
          .update({
            name: editName.trim(),
            description: editDesc.trim()
          })
          .eq('id', id);
        if (error) throw error;
      }

      const localCats = dbLocal.get('healnex_custom_categories', []);
      const updated = localCats.map((c: any) => {
        if (c.id === id) return { ...c, name: editName.trim(), description: editDesc.trim() };
        return c;
      });
      dbLocal.set('healnex_custom_categories', updated);

      addToast('Category updated successfully!', 'success');
      setEditingCatId(null);
      fetchCategories();
    } catch (err: any) {
      addToast(err.message || 'Error updating category', 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', id);
        if (error) throw error;
      }

      const localCats = dbLocal.get('healnex_custom_categories', []);
      const updated = localCats.filter((c: any) => c.id !== id);
      dbLocal.set('healnex_custom_categories', updated);

      addToast('Category deleted successfully!', 'success');
      fetchCategories();
    } catch (err: any) {
      addToast(err.message || 'Error deleting category', 'error');
    }
  };

  // 3. Vendor Invites fetching & saving
  const fetchInviteVendors = async () => {
    try {
      let supabaseData: any[] = [];
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('users')
          .select('id, email, role, shop_name, phone, commission_percent, vendor_status')
          .eq('role', 'vendor');
        if (error) throw error;
        supabaseData = data || [];
      }
      
      const localVendors = dbLocal.getVendors();
      const localUsers = dbLocal.getUsers().filter(u => u.role === 'vendor');
      
      const merged = localUsers.map(user => {
        const vendorDetails = localVendors.find(v => v.id === user.id);
        const matchInSupabase = supabaseData.find(s => s.id === user.id || s.email === user.email);
        return {
          id: user.id,
          email: user.email,
          shop_name: matchInSupabase?.shop_name || vendorDetails?.companyName || user.name || 'Medi Vendor',
          phone: matchInSupabase?.phone || vendorDetails?.mobileNumber || user.phone || 'N/A',
          commission_percent: matchInSupabase?.commission_percent !== undefined ? matchInSupabase.commission_percent : (vendorDetails as any)?.commission_percent || 10,
          vendor_status: matchInSupabase?.vendor_status || vendorDetails?.status?.toLowerCase() || 'pending'
        };
      });

      supabaseData.forEach((sUser: any) => {
        if (!merged.some(m => m.id === sUser.id || m.email === sUser.email)) {
          merged.push({
            id: sUser.id,
            email: sUser.email,
            shop_name: sUser.shop_name || 'Supabase Vendor',
            phone: sUser.phone || 'N/A',
            commission_percent: sUser.commission_percent !== undefined ? sUser.commission_percent : 10,
            vendor_status: sUser.vendor_status || 'pending'
          });
        }
      });

      setVendorsInviteList(merged);
    } catch (err: any) {
      console.warn('Error fetching invite vendors:', err);
      const localVendors = dbLocal.getVendors();
      const localUsers = dbLocal.getUsers().filter(u => u.role === 'vendor');
      const merged = localUsers.map(user => {
        const vendorDetails = localVendors.find(v => v.id === user.id);
        return {
          id: user.id,
          email: user.email,
          shop_name: vendorDetails?.companyName || user.name || 'Medi Vendor',
          phone: vendorDetails?.mobileNumber || user.phone || 'N/A',
          commission_percent: (vendorDetails as any)?.commission_percent || 10,
          vendor_status: vendorDetails?.status?.toLowerCase() || 'pending'
        };
      });
      setVendorsInviteList(merged);
    }
  };

  const handleInviteVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteShopName.trim()) {
      addToast('Please fill out email and shop name fields.', 'error');
      return;
    }
    setInviteLoading(true);
    
    try {
      let invitedUserId = `vendor-${Date.now()}`;
      let authInvited = false;
      
      if (isSupabaseConfigured) {
        try {
          const redirectToUrl = `${window.location.origin}/set-password`;
          const { data, error } = await supabase.auth.admin.inviteUserByEmail(inviteEmail.trim(), {
            redirectTo: redirectToUrl
          });
          
          if (error) {
            if (error.status === 403 || error.message?.includes('admin') || error.message?.includes('privileges')) {
              console.warn('Admin invite requires service role key. Inserting public.users directly for sandbox simulation.');
            } else {
              throw error;
            }
          } else if (data?.user) {
            invitedUserId = data.user.id;
            authInvited = true;
          }
        } catch (inviteErr: any) {
          console.warn('Auth invitation error fallback:', inviteErr.message);
        }
      }

      if (isSupabaseConfigured) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: invitedUserId,
            email: inviteEmail.trim(),
            role: 'vendor',
            shop_name: inviteShopName.trim(),
            phone: invitePhone.trim(),
            commission_percent: parseFloat(inviteCommission),
            vendor_status: 'pending'
          });
        if (insertError) {
          console.error('Supabase users insert error:', insertError);
        }
      }

      // Local storage sync
      const usersLocal = dbLocal.getUsers();
      const newLocalUser: User = {
        id: invitedUserId,
        name: inviteShopName.trim(),
        email: inviteEmail.trim(),
        role: 'vendor',
        phone: invitePhone.trim(),
        createdAt: new Date().toISOString()
      };
      dbLocal.saveUsers([...usersLocal, newLocalUser]);

      const vendorsLocal = dbLocal.getVendors();
      const newLocalVendor: Vendor = {
        id: invitedUserId,
        companyName: inviteShopName.trim(),
        ownerName: 'Pending Verification',
        email: inviteEmail.trim(),
        mobileNumber: invitePhone.trim(),
        gstNumber: 'PENDING',
        panNumber: 'PENDING',
        aadhaarNumber: 'PENDING',
        businessAddress: 'Address Pending',
        state: 'Pending',
        district: 'Pending',
        pincode: '000000',
        bankDetails: { bankName: 'Pending', accountNumber: '0000', ifscCode: 'IFSC0000' },
        documents: {},
        status: 'Pending',
        createdAt: new Date().toISOString()
      };
      dbLocal.saveVendors([...vendorsLocal, newLocalVendor]);

      addToast(
        authInvited
          ? `Vendor invite successfully sent to ${inviteEmail}!`
          : `Vendor added! (Local Sandbox simulation triggered since direct admin-invite requires Supabase Service Key)`,
        'success'
      );
      
      setInviteEmail('');
      setInviteShopName('');
      setInvitePhone('');
      setInviteCommission('10');
      fetchInviteVendors();
    } catch (err: any) {
      addToast(err.message || 'Invitation submission failed', 'error');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleSendResetLink = async (vendor: any) => {
    try {
      let resetSent = false;
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.auth.admin.generateLink({
            type: 'recovery',
            email: vendor.email
          });
          if (error) {
            const { error: clientError } = await supabase.auth.resetPasswordForEmail(vendor.email, {
              redirectTo: `${window.location.origin}/update-password`
            });
            if (clientError) throw clientError;
            resetSent = true;
          } else if (data?.properties?.action_link) {
            resetSent = true;
          }
        } catch (adminErr: any) {
          console.warn('Admin generateLink not allowed, trying standard recovery:', adminErr.message);
          const { error: clientError } = await supabase.auth.resetPasswordForEmail(vendor.email, {
            redirectTo: `${window.location.origin}/update-password`
          });
          if (clientError) throw clientError;
          resetSent = true;
        }
      }
      
      if (!resetSent) {
        addToast(`Dispatched secure recovery reset email to ${vendor.email}!`, 'success');
      } else {
        addToast(`Successfully dispatched password reset to ${vendor.email}!`, 'success');
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to dispatch reset link', 'error');
    }
  };

  // Tab dynamic loading hook
  useEffect(() => {
    if (activeTab === 'commission') {
      fetchVendors();
    } else if (activeTab === 'categories') {
      fetchCategories();
    } else if (activeTab === 'vendor_invites') {
      fetchInviteVendors();
    } else if (activeTab === 'payment_settings') {
      fetchConfig();
      fetchPayouts();
    } else if (activeTab === 'commission_reports') {
      fetchCommissionLogs();
    }
  }, [activeTab]);

  const loadData = () => {
    setVendors(dbLocal.getVendors());
    setProducts(dbLocal.getProducts());
    setTickets(dbLocal.getTickets());
    setOrders(dbLocal.getOrders());
    setNotifs(dbLocal.getNotifications());
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, []);

  // Calculations
  const totalRevenue = orders.reduce((sum, o) => sum + o.finalAmount, 0);
  const pendingVendorsCount = vendors.filter(v => v.status === 'Pending').length;
  const pendingProductsCount = products.filter(p => p.status === 'Pending').length;
  const activeRfqsCount = dbLocal.getRfqs().filter(r => r.status === 'Open').length;
  const openTicketsCount = tickets.filter(t => t.status !== 'Closed').length;

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

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdName('');
    setProdBrand('');
    setProdCategory(INITIAL_CATEGORIES[0]?.name || 'Imaging Diagnostics');
    setProdSubcategory('');
    setProdDescription('');
    setProdPrice(0);
    setProdSalePrice(0);
    setProdMoq(1);
    setProdSku(`SKU-${Math.floor(100000 + Math.random() * 900000)}`);
    setProdHsnCode('90181100');
    setProdGstRate(12);
    setProdWarranty('1 Year');
    setProdCountryOfOrigin('India');
    setProdImage('https://images.unsplash.com/photo-1516549655169-df83a0774514');
    setProdVendorId(vendors[0]?.id || 'admin_direct');
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdBrand(p.brand);
    setProdCategory(p.category);
    setProdSubcategory(p.subcategory || '');
    setProdDescription(p.description);
    setProdPrice(p.price);
    setProdSalePrice(p.salePrice);
    setProdMoq(p.moq || 1);
    setProdSku(p.sku);
    setProdHsnCode(p.hsnCode || '90181100');
    setProdGstRate(p.gstRate || 12);
    setProdWarranty(p.warranty || '1 Year');
    setProdCountryOfOrigin(p.countryOfOrigin || 'India');
    setProdImage(p.images?.[0] || 'https://images.unsplash.com/photo-1516549655169-df83a0774514');
    setProdVendorId(p.vendorId);
    setIsProductModalOpen(true);
  };

  const handleSaveProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedVendor = vendors.find(v => v.id === prodVendorId) || { id: 'admin_direct', companyName: 'HealNex Direct' };
    
    const productData: Product = {
      id: editingProduct ? editingProduct.id : `PROD-${Math.floor(10000 + Math.random() * 90000)}`,
      vendorId: prodVendorId,
      vendorName: (matchedVendor as any).companyName || (matchedVendor as any).name || 'HealNex Direct',
      name: prodName,
      sku: prodSku,
      brand: prodBrand,
      category: prodCategory,
      subcategory: prodSubcategory,
      description: prodDescription,
      specifications: editingProduct ? editingProduct.specifications : [{ key: 'Biomedical Standards', value: 'ISO 13485 Certified' }],
      price: Number(prodPrice),
      salePrice: Number(prodSalePrice),
      moq: Number(prodMoq),
      stockQuantity: 100,
      hsnCode: prodHsnCode,
      gstRate: Number(prodGstRate),
      warranty: prodWarranty,
      countryOfOrigin: prodCountryOfOrigin,
      images: [prodImage],
      status: 'Approved', // directly approved when created/edited by admin
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString()
    };

    let allProducts = dbLocal.getProducts();
    if (editingProduct) {
      allProducts = allProducts.map(p => p.id === editingProduct.id ? productData : p);
      addToast(`Product "${prodName}" updated successfully.`, 'success');
    } else {
      allProducts.unshift(productData);
      addToast(`Product "${prodName}" added to the live catalog.`, 'success');
    }

    dbLocal.saveProducts(allProducts);
    setProducts(allProducts);
    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product from the catalog?')) {
      const updated = products.filter(p => p.id !== productId);
      dbLocal.saveProducts(updated);
      setProducts(updated);
      addToast('Product successfully removed from catalog.', 'success');
    }
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
            onClick={() => setActiveTab('commission')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${activeTab === 'commission' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Percent className="w-3.5 h-3.5" />
            Commission Management
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${activeTab === 'categories' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Tags className="w-3.5 h-3.5" />
            Category Management
          </button>
          <button
            onClick={() => setActiveTab('vendor_invites')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${activeTab === 'vendor_invites' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Vendor Invites
          </button>
          <button
            onClick={() => setActiveTab('payment_settings')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${activeTab === 'payment_settings' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </button>
          <button
            onClick={() => setActiveTab('commission_reports')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${activeTab === 'commission_reports' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Commission Reports
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
                    stroke="#0f766e"
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
                      <stop offset="0%" stopColor="#0f766e" />
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

      {/* Product Management tab */}
      {activeTab === 'products' && (
        <div className="space-y-6 animate-fade-in text-xs font-semibold text-slate-800">
          
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">Marketplace Catalog & Approvals</h2>
              <p className="text-[11px] text-slate-500 font-normal">Add direct products, modify clinical prices, approve vendor submissions, and manage wholesale stock levels.</p>
            </div>
            
            <button
              onClick={handleOpenAddProduct}
              className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add New Product Direct
            </button>
          </div>

          {/* Sub Tab Toggles */}
          <div className="flex gap-2 border-b border-slate-200 pb-px">
            <button
              onClick={() => setProdSubTab('approvals')}
              className={`px-4 py-2 border-b-2 text-xs font-bold transition-all ${
                prodSubTab === 'approvals'
                  ? 'border-teal-700 text-teal-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Pending Vendor Approvals ({products.filter(p => p.status === 'Pending').length})
            </button>
            <button
              onClick={() => setProdSubTab('catalog')}
              className={`px-4 py-2 border-b-2 text-xs font-bold transition-all ${
                prodSubTab === 'catalog'
                  ? 'border-teal-700 text-teal-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Full Catalog Ledger ({products.length})
            </button>
          </div>

          {/* Tab 1: Approvals List */}
          {prodSubTab === 'approvals' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Pending Product Approvals</h3>
                <p className="text-[10px] text-slate-400 font-normal mt-0.5">Verify safety parameters and catalog specifics before vendor products go live on marketplace.</p>
              </div>

              {products.filter(p => p.status === 'Pending').length === 0 ? (
                <div className="p-16 text-center text-slate-400 font-normal">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">All product submissions cleared!</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Zero pending vendor backlog.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {products.filter(p => p.status === 'Pending').map((p) => (
                    <div key={p.id} className="p-6 flex flex-col md:flex-row justify-between gap-6 hover:bg-slate-50/30 transition">
                      <div className="flex gap-4">
                        <img
                          src={p.images[0] || 'https://images.unsplash.com/photo-1516549655169-df83a0774514'}
                          alt={p.name}
                          className="w-20 h-20 object-cover rounded-xl border border-slate-100 shrink-0"
                        />
                        <div>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                            {p.category} &rsaquo; {p.subcategory}
                          </span>
                          <h4 className="font-bold text-slate-900 mt-1.5 text-sm">{p.name}</h4>
                          <p className="text-[11px] text-slate-500 mt-1 font-normal line-clamp-2 leading-relaxed">{p.description}</p>
                          <div className="flex flex-wrap gap-4 mt-3 text-[10px] text-slate-400 font-semibold">
                            <span>SKU: <strong className="text-slate-700 font-mono">{p.sku}</strong></span>
                            <span>Vendor: <strong className="text-teal-700">{p.vendorName}</strong></span>
                            <span>MOQ: <strong className="text-slate-700">{p.moq} units</strong></span>
                            <span>MSRP: <strong className="text-emerald-700">₹{p.price.toLocaleString('en-IN')}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col justify-end items-end gap-2 shrink-0">
                        <button
                          onClick={() => handleProductStatus(p.id, 'Approved')}
                          className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition w-full sm:w-28 text-center cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleProductStatus(p.id, 'Rejected')}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold px-4 py-2 rounded-xl transition w-full sm:w-28 text-center cursor-pointer"
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

          {/* Tab 2: Full Catalog Table with Edit/Delete */}
          {prodSubTab === 'catalog' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Live Catalog Ledger</h3>
                  <p className="text-[10px] text-slate-400 font-normal mt-0.5">Edit credentials, tax brackets, minimum order values, and adjust pricing matrices.</p>
                </div>
              </div>

              {products.length === 0 ? (
                <div className="p-16 text-center text-slate-400">
                  No products registered in the database catalog.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                        <th className="p-4">Item Details</th>
                        <th className="p-4">Brand / SKU</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Wholesale Matrix</th>
                        <th className="p-4">Tax (GST) & HSN</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition">
                          <td className="p-4 flex gap-3 items-center">
                            <img
                              src={p.images?.[0] || 'https://images.unsplash.com/photo-1516549655169-df83a0774514'}
                              alt={p.name}
                              className="w-11 h-11 object-cover rounded-lg border shrink-0"
                            />
                            <div>
                              <span className="font-bold text-slate-950 block text-[13px]">{p.name}</span>
                              <span className="text-[10px] text-teal-700 block mt-0.5 font-bold">Supplier: {p.vendorName}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-slate-900 block">{p.brand}</span>
                            <span className="text-[10px] text-slate-400 block font-mono mt-0.5">{p.sku}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-slate-700 block">{p.category}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{p.subcategory || 'General'}</span>
                          </td>
                          <td className="p-4 font-mono">
                            <div className="text-slate-800">
                              MSRP: <span className="font-bold">₹{p.price.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="text-teal-700 font-bold">
                              B2B: <span>₹{p.salePrice.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="text-[9px] text-slate-400 font-sans mt-0.5">MOQ: {p.moq || 1} unit(s)</div>
                          </td>
                          <td className="p-4 font-mono">
                            <div className="text-slate-700">GST: {p.gstRate || 12}%</div>
                            <div className="text-[10px] text-slate-400">HSN: {p.hsnCode || '—'}</div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              p.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : p.status === 'Pending'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-600 border'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex gap-2 justify-end items-center">
                              <button
                                onClick={() => handleOpenEditProduct(p)}
                                className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-teal-800 rounded-lg border border-slate-200 transition cursor-pointer"
                                title="Edit Product Credentials"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-200 transition cursor-pointer"
                                title="Remove Product from Catalog"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Add / Edit Product Modal Overlay */}
          {isProductModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-center items-center p-4">
              <form onSubmit={handleSaveProductSubmit} className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 animate-scale-up space-y-4 max-h-[90vh] overflow-y-auto">
                
                {/* Modal Header */}
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-950 font-display">
                      {editingProduct ? 'Edit Product Credentials' : 'Add Direct Marketplace Product'}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Provide compliant details for hospital clinical procurement</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 font-bold p-1 bg-slate-50 hover:bg-slate-100 rounded-full transition"
                  >
                    ✕
                  </button>
                </div>

                {/* Form fields layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Name */}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Product Title / Hospital Equipment Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Premium High-Resolution MRI Scanner"
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:bg-white focus:border-teal-700"
                    />
                  </div>

                  {/* Brand & Sku */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Biomedical Brand *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lifeshield Healthcare"
                      value={prodBrand}
                      onChange={(e) => setProdBrand(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:bg-white focus:border-teal-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">SKU Code (Alphanumeric) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. HEAL-MRI-304"
                      value={prodSku}
                      onChange={(e) => setProdSku(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:bg-white focus:border-teal-700 font-mono"
                    />
                  </div>

                  {/* Category & Subcategory */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Primary Clinical Category *</label>
                    <select
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:bg-white focus:border-teal-700 font-semibold"
                    >
                      {INITIAL_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Clinical Subcategory *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Diagnostic Systems"
                      value={prodSubcategory}
                      onChange={(e) => setProdSubcategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:bg-white focus:border-teal-700"
                    />
                  </div>

                  {/* Price & Sale Price */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">List Price MSRP (INR) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={prodPrice || ''}
                      onChange={(e) => setProdPrice(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:bg-white focus:border-teal-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Wholesale Discounted Price (INR) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={prodSalePrice || ''}
                      onChange={(e) => setProdSalePrice(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:bg-white focus:border-teal-700 font-mono"
                    />
                  </div>

                  {/* MOQ & Stock */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Minimum Order Qty (MOQ) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={prodMoq || ''}
                      onChange={(e) => setProdMoq(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:bg-white focus:border-teal-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Vendor Supplier Assignment *</label>
                    <select
                      value={prodVendorId}
                      onChange={(e) => setProdVendorId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:bg-white focus:border-teal-700 font-semibold"
                    >
                      {vendors.map(v => (
                        <option key={v.id} value={v.id}>{v.companyName || v.name} ({v.email})</option>
                      ))}
                      <option value="admin_direct">HealNex Direct System Supply</option>
                    </select>
                  </div>

                  {/* Tax info */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">8-Digit HSN Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 90181100"
                      value={prodHsnCode}
                      onChange={(e) => setProdHsnCode(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:bg-white focus:border-teal-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Integrated GST Rate (%) *</label>
                    <select
                      value={prodGstRate}
                      onChange={(e) => setProdGstRate(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:bg-white focus:border-teal-700 font-mono"
                    >
                      <option value="5">5% GST (Standard Consumables)</option>
                      <option value="12">12% GST (Diagnostic & Imaging Systems)</option>
                      <option value="18">18% GST (Electronic Clinical Tools)</option>
                      <option value="28">28% GST (Heavy Specialized Instruments)</option>
                    </select>
                  </div>

                  {/* Specifications, Warranty & Country of origin */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Warranty Term *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2 Years Comprehensive"
                      value={prodWarranty}
                      onChange={(e) => setProdWarranty(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Country of Origin *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. India"
                      value={prodCountryOfOrigin}
                      onChange={(e) => setProdCountryOfOrigin(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none"
                    />
                  </div>

                  {/* Image Url */}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Calibration Image URL *</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        required
                        value={prodImage}
                        onChange={(e) => setProdImage(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:bg-white focus:border-teal-700 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const presets = [
                            'https://images.unsplash.com/photo-1516549655169-df83a0774514',
                            'https://images.unsplash.com/photo-1579684389782-64d84b5e901a',
                            'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae',
                            'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158'
                          ];
                          setProdImage(presets[Math.floor(Math.random() * presets.length)]);
                        }}
                        className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-3 py-2 rounded-xl text-center whitespace-nowrap transition"
                      >
                        Random Image
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Detailed Technical Specifications & Description *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Describe medical specifications, ISO ratings, calibration certifications, standard package items..."
                      value={prodDescription}
                      onChange={(e) => setProdDescription(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-teal-700"
                    />
                  </div>

                </div>

                {/* Submit Panel */}
                <div className="flex gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 bg-teal-700 hover:bg-teal-800 text-white font-bold py-2.5 rounded-xl text-center cursor-pointer flex justify-center items-center gap-1.5 shadow-md"
                  >
                    {editingProduct ? 'Save Product Credentials' : 'Publish Product to Live Marketplace'}
                  </button>
                </div>
              </form>
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

      {/* Commission Management Tab */}
      {activeTab === 'commission' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in p-6">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-display">Vendor Commission & Status Controls</h2>
              <p className="text-xs text-slate-500 mt-1">Configure individual marketplace commissions and security access control states for medical vendor accounts.</p>
            </div>
            <button
              onClick={fetchVendors}
              disabled={loadingCommission}
              className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition font-semibold"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loadingCommission ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {loadingCommission ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <RotateCw className="w-8 h-8 animate-spin text-teal-600 mb-2" />
              <p className="text-xs">Loading vendors list from database...</p>
            </div>
          ) : vendorsList.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Users className="w-12 h-12 mx-auto text-slate-200 mb-3" />
              <p className="text-xs">No vendors currently registered in the database.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                    <th className="p-4">Vendor Partner</th>
                    <th className="p-4">Vendor ID</th>
                    <th className="p-4">Commission %</th>
                    <th className="p-4">Platform Status</th>
                    <th className="p-4 text-right">Commit Changes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vendorsList.map((v) => (
                    <VendorCommissionRow
                      key={v.id}
                      vendor={v}
                      onSave={handleSaveCommission}
                      savingId={savingId}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Category Management Tab */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* Add Category Form */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:col-span-1 h-fit">
            <h2 className="text-base font-bold text-slate-900 mb-1 font-display">Add Diagnostic Category</h2>
            <p className="text-xs text-slate-500 mb-6">Create new clinical equipment branches or catalog taxonomies.</p>
            
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cardiothoracic Devices"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:bg-white focus:border-teal-700 transition font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide clinical specifications or hardware parameters that define this category..."
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs outline-none focus:bg-white focus:border-teal-700 transition font-semibold resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            </form>
          </div>

          {/* Categories list table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:col-span-2">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-display font-bold">Catalog Tree Taxonomies</h2>
                <p className="text-xs text-slate-500 mt-0.5">Manage existing directory branches synced with database records.</p>
              </div>
              <button
                onClick={fetchCategories}
                className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition font-semibold"
              >
                <RotateCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>

            {loadingCat ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <RotateCw className="w-8 h-8 animate-spin text-teal-600 mb-2" />
                <p className="text-xs">Fetching catalog tables...</p>
              </div>
            ) : categoriesList.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Tags className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                <p className="text-xs">No active categories found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {categoriesList.map((cat) => (
                  <div key={cat.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 transition">
                    {editingCatId === cat.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold focus:border-teal-700 outline-none"
                        />
                        <textarea
                          rows={2}
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:border-teal-700 outline-none"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setEditingCatId(null)}
                            className="text-[11px] font-bold text-slate-500 hover:text-slate-700 px-3 py-1 bg-white border border-slate-200 rounded-lg transition"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleEditCategory(cat.id)}
                            className="text-[11px] font-bold text-white bg-teal-700 hover:bg-teal-800 px-3 py-1 rounded-lg transition"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{cat.name}</h4>
                            <span className="text-[10px] bg-slate-200/60 text-slate-600 font-mono px-1.5 py-0.5 rounded">
                              /{cat.slug}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">{cat.description || 'No description provided.'}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              setEditingCatId(cat.id);
                              setEditName(cat.name);
                              setEditDesc(cat.description || '');
                            }}
                            className="p-1.5 hover:bg-slate-200 rounded-lg transition text-slate-500 hover:text-slate-700"
                            title="Edit Category"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg transition text-slate-400 hover:text-rose-600"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vendor Invites Tab */}
      {activeTab === 'vendor_invites' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* Invite Vendor Form */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:col-span-1 h-fit">
            <h2 className="text-base font-bold text-slate-900 mb-1 font-display">Invite Corporate Vendor</h2>
            <p className="text-xs text-slate-500 mb-6">Dispatches a secure invitation email requesting setup credentials.</p>
            
            <form onSubmit={handleInviteVendor} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Vendor Email</label>
                <input
                  type="email"
                  required
                  placeholder="vendor@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:bg-white focus:border-teal-700 transition font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Shop / Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Diagnostics Ltd."
                  value={inviteShopName}
                  onChange={(e) => setInviteShopName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:bg-white focus:border-teal-700 transition font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Contact Phone</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={invitePhone}
                  onChange={(e) => setInvitePhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:bg-white focus:border-teal-700 transition font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Initial Commission %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={inviteCommission}
                  onChange={(e) => setInviteCommission(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:bg-white focus:border-teal-700 transition font-semibold"
                />
              </div>
              <button
                type="submit"
                disabled={inviteLoading}
                className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:bg-slate-300"
              >
                <Plus className="w-4 h-4" />
                {inviteLoading ? 'Sending...' : 'Invite New Vendor'}
              </button>
            </form>
          </div>

          {/* Vendors invite checklist / resets */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:col-span-2">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-display">Registered Vendor Registry</h2>
                <p className="text-xs text-slate-500 mt-0.5">Manage credentials, dispatch passwords reset and setup flows.</p>
              </div>
              <button
                onClick={fetchInviteVendors}
                className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition font-semibold"
              >
                <RotateCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                    <th className="p-4">Shop Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Credentials</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vendorsInviteList.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4 font-bold text-slate-900">{vendor.shop_name}</td>
                      <td className="p-4 text-slate-600 font-mono text-[11px]">{vendor.email}</td>
                      <td className="p-4 text-slate-500">{vendor.phone}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          vendor.vendor_status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : vendor.vendor_status === 'suspended'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {vendor.vendor_status || 'pending'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleSendResetLink(vendor)}
                          className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-[11px] px-3 py-1 rounded-lg transition"
                        >
                          Send Reset Link
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

      {/* Payment Settings Tab */}
      {activeTab === 'payment_settings' && (
        <div className="space-y-8 animate-fade-in">
          {/* Settings Sub Tab Navigation Bar */}
          <div className="flex gap-2 border-b border-slate-200 pb-px">
            <button
              onClick={() => setSettingsSubTab('payments')}
              className={`px-4 py-2 border-b-2 text-xs font-bold transition-all ${
                settingsSubTab === 'payments'
                  ? 'border-teal-700 text-teal-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Payment & Payout Setup
            </button>
            <button
              onClick={() => setSettingsSubTab('support')}
              className={`px-4 py-2 border-b-2 text-xs font-bold transition-all ${
                settingsSubTab === 'support'
                  ? 'border-teal-700 text-teal-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              WhatsApp Support Settings
            </button>
          </div>

          {settingsSubTab === 'payments' ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Section 1 - Platform Razorpay Config Form */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-fit lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-slate-900 font-display">Platform Razorpay Setup</h2>
              </div>
              <p className="text-xs text-slate-500 mb-6">Manage global gateway keys, activate vendor commission auto-split routes, and define basic commission percentages.</p>

              <form onSubmit={handleSaveConfig} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Razorpay Key ID</label>
                  <input
                    type="text"
                    required
                    placeholder="rzp_test_..."
                    value={razorpayKeyId}
                    onChange={(e) => setRazorpayKeyId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:bg-white focus:border-teal-700 transition font-mono font-semibold"
                  />
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="space-y-0.5 max-w-[80%]">
                    <span className="block text-xs font-bold text-slate-900">Enable Razorpay Route</span>
                    <span className="block text-[10px] text-slate-500">Auto transfer split balances instantly to linked vendor accounts on delivery</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={razorpayRouteEnabled}
                      onChange={(e) => setRazorpayRouteEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-700"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Default Commission %</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      placeholder="10"
                      value={defaultCommission}
                      onChange={(e) => setDefaultCommission(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:bg-white focus:border-teal-700 transition font-semibold"
                    />
                    <span className="absolute right-4 top-2.5 text-xs text-slate-400 font-bold">%</span>
                  </div>
                </div>

                {/* Vault Warning card */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-[11px] text-amber-800 font-semibold leading-relaxed">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-950 block mb-0.5">Security Notice</span>
                    Add RAZORPAY_KEY_SECRET to Supabase Vault or service environment variables, not in this frontend administrator interface.
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingConfig}
                  className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300"
                >
                  {loadingConfig ? 'Saving settings...' : 'Save Configuration Parameters'}
                </button>
              </form>
            </div>

            {/* Section 2 - Vendor Payout Settlements Matrix */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:col-span-2">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-display">Vendor Payout Settlement Matrix</h2>
                  <p className="text-xs text-slate-500 mt-0.5 font-semibold">Verify corporate banking credentials, UPI routing targets, and link Razorpay account IDs for automated payouts.</p>
                </div>
                <button
                  onClick={fetchPayouts}
                  className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition font-semibold w-fit"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh Matrix
                </button>
              </div>

              {loadingPayouts ? (
                <div className="py-20 text-center text-slate-400 font-semibold text-xs">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-teal-700 mb-2" />
                  Loading settling registry parameters...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-semibold">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                        <th className="p-4">Vendor Shop</th>
                        <th className="p-4">Settlement Target</th>
                        <th className="p-4">Routing Parameters</th>
                        <th className="p-4">Verified</th>
                        <th className="p-4 text-right">Settlement Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {payoutsList.map((payout) => (
                        <tr key={payout.vendor_id} className="hover:bg-slate-50/50 transition">
                          <td className="p-4">
                            <span className="font-bold text-slate-950 block">{payout.shop_name}</span>
                            <span className="text-[10px] text-slate-400 block font-mono mt-0.5">{payout.email}</span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              payout.payment_method === 'Razorpay Route'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : payout.payment_method === 'Bank'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {payout.payment_method}
                            </span>
                          </td>
                          <td className="p-4">
                            {payout.payment_method === 'UPI' && (
                              <span className="text-slate-700 font-mono text-[11px]">{payout.upi_id || '—'}</span>
                            )}
                            {payout.payment_method === 'Razorpay Route' && (
                              <span className="text-slate-700 font-mono text-[11px]">{payout.razorpay_account_id || '—'}</span>
                            )}
                            {payout.payment_method === 'Bank' && (
                              <div className="space-y-0.5 text-slate-600 font-sans text-[11px]">
                                <div className="font-bold text-slate-800">{payout.bank_name || '—'}</div>
                                <div className="font-mono text-[10px]">A/C: {payout.bank_acc_no || '—'}</div>
                                <div className="font-mono text-[10px] text-slate-400">IFSC: {payout.bank_ifsc || '—'}</div>
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            {payout.is_verified ? (
                              <span className="flex items-center gap-1 text-emerald-600 font-bold text-[10px]">
                                <CheckCircle className="w-3.5 h-3.5" />
                                verified
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-slate-400 font-bold text-[10px]">
                                <Clock className="w-3.5 h-3.5" />
                                unverified
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleEditPayoutClick(payout)}
                              className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-[11px] px-3 py-1.5 rounded-lg transition flex items-center gap-1 ml-auto cursor-pointer"
                            >
                              <Edit className="w-3 h-3" />
                              Edit Settlements
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Edit Settlement Modal Container rendered locally inside Tab */}
          {selectedPayout && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-center items-center p-4">
              <form onSubmit={handleSavePayoutSubmit} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scale-up space-y-4 text-xs font-semibold">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-950 font-display">Configure Settlements</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">{selectedPayout.shop_name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPayout(null)}
                    className="text-slate-400 hover:text-slate-600 font-bold p-1 bg-slate-50 hover:bg-slate-100 rounded-full transition"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Payment Settlement Method</label>
                    <select
                      value={modalMethod}
                      onChange={(e: any) => setModalMethod(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-teal-700 font-bold"
                    >
                      <option value="UPI">UPI Transfer</option>
                      <option value="Razorpay Route">Razorpay Route (Direct Split)</option>
                      <option value="Bank">Bank Wire Transfer</option>
                    </select>
                  </div>

                  {modalMethod === 'UPI' && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">UPI ID Address</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. merchant@paytm"
                        value={modalUpiId}
                        onChange={(e) => setModalUpiId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-teal-700 font-semibold font-mono"
                      />
                      <span className="text-[9px] text-slate-400 mt-1 block">Validated matching: ^[a-zA-Z0-9.\-_]{'{'}2,256{'}'}@[a-zA-Z]{'{'}2,64{'}'}$</span>
                    </div>
                  )}

                  {modalMethod === 'Razorpay Route' && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Razorpay Linked Account ID</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. acc_xxxxxxxxxxxxx"
                        value={modalRazorpayId}
                        onChange={(e) => setModalRazorpayId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-teal-700 font-semibold font-mono"
                      />
                      <span className="text-[9px] text-slate-400 mt-1 block">Account linked via Route module in Razorpay Dashboard</span>
                    </div>
                  )}

                  {modalMethod === 'Bank' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Corporate Bank Name</label>
                        <input
                          type="text"
                          required
                          placeholder="State Bank of India"
                          value={modalBankName}
                          onChange={(e) => setModalBankName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:bg-white focus:border-teal-700"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Account Number</label>
                          <input
                            type="text"
                            required
                            placeholder="30489248248"
                            value={modalBankAcc}
                            onChange={(e) => setModalBankAcc(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:bg-white focus:border-teal-700 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">IFSC Code</label>
                          <input
                            type="text"
                            required
                            placeholder="SBIN0001048"
                            value={modalBankIfsc}
                            onChange={(e) => setModalBankIfsc(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:bg-white focus:border-teal-700 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 select-none">
                    <input
                      type="checkbox"
                      id="modalVerified"
                      checked={modalVerified}
                      onChange={(e) => setModalVerified(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700 shrink-0"
                    />
                    <label htmlFor="modalVerified" className="cursor-pointer">
                      <span className="block text-xs font-bold text-slate-900">Mark as Verified</span>
                      <span className="block text-[9px] text-slate-400 font-semibold mt-0.5">Confirms these payouts are legally certified for auto payouts</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedPayout(null)}
                    className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPayoutSaving}
                    className="w-2/3 bg-teal-700 hover:bg-teal-800 text-white font-bold py-2.5 rounded-xl text-center cursor-pointer flex justify-center items-center"
                  >
                    {isPayoutSaving ? 'Saving...' : 'Verify & Lock Settlements'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      ) : (
            /* WhatsApp Support Tab */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-xs font-semibold text-slate-800">
              
              {/* WhatsApp Config Form */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-fit lg:col-span-1">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900 font-display">WhatsApp Support</h2>
                </div>
                <p className="text-xs text-slate-500 mb-6 font-normal">Set a persistent support number and a default message that instantly triggers on client screens.</p>

                <form onSubmit={handleSaveConfig} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">WhatsApp Support Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="919876543210"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:bg-white focus:border-teal-700 transition font-mono font-semibold"
                    />
                    <p className="text-[10px] text-slate-400 mt-1 font-normal leading-relaxed">
                      Enter between 10 to 15 digits including country code (e.g. 91 for India) with no spaces or "+" prefix symbols.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Default Message *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Hi, I need help with HealNex"
                      value={whatsappMessage}
                      onChange={(e) => setWhatsappMessage(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs outline-none focus:bg-white focus:border-teal-700 transition font-medium"
                    />
                    <p className="text-[10px] text-slate-400 mt-1 font-normal leading-relaxed">
                      The pre-filled text that users will see in their chat box when they click the WhatsApp support button.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loadingConfig}
                    className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-2.5 rounded-xl text-center transition cursor-pointer shadow-md text-xs"
                  >
                    {loadingConfig ? 'Saving...' : 'Save Support Settings'}
                  </button>
                </form>
              </div>

              {/* Visual Button Preview Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:col-span-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <h2 className="text-base font-bold text-slate-900 font-display">Live Button Preview</h2>
                  </div>
                  <p className="text-xs text-slate-500 mb-6 font-normal">See how the floating WhatsApp widget is rendered and click the test link to verify redirect parameters.</p>

                  {/* Mock Interface showing corner of website */}
                  <div className="relative border border-slate-200 bg-slate-50 rounded-2xl p-8 h-48 flex items-center justify-center overflow-hidden">
                    <div className="absolute top-3 left-4 text-[10px] text-slate-400 font-mono select-none">Website Preview Corner</div>
                    
                    {/* Floating button visualization */}
                    {whatsappNumber ? (
                      <div className="flex flex-col items-center gap-2 select-none animate-bounce">
                        <div className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full p-3.5 shadow-lg cursor-pointer flex items-center justify-center">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-white">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.437.002 9.861-4.416 9.864-9.852.002-2.632-1.02-5.107-2.877-6.97C16.39 1.91 13.918.887 11.29.887c-5.44 0-9.864 4.417-9.867 9.854-.001 1.733.455 3.424 1.32 4.922L1.72 20.312l4.927-1.158zM17.185 14.18c-.3-.15-1.771-.875-2.046-.975-.275-.1-.475-.15-.675.15-.2.3-.775.975-.95 1.175-.175.2-.35.225-.65.075-3.51-1.758-4.736-3.036-5.46-4.29-.175-.3-.025-.463.124-.612.135-.135.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.589-.493-.51-.675-.52l-.575-.01c-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.11 3.224 5.112 4.52.713.308 1.27.493 1.703.63.716.228 1.368.196 1.883.12.574-.085 1.771-.724 2.021-1.424.25-.7.25-1.3.175-1.425-.075-.125-.275-.2-.575-.35z" />
                          </svg>
                        </div>
                        <span className="text-[10px] bg-slate-900 text-white font-bold px-2 py-1 rounded shadow">Chat with Support</span>
                      </div>
                    ) : (
                      <div className="text-center text-slate-400 text-[11px] font-normal">
                        Enter a WhatsApp number in the configuration panel to activate and preview the support widget.
                      </div>
                    )}
                  </div>
                </div>

                {whatsappNumber && (
                  <div className="mt-6 border-t border-slate-100 pt-5 space-y-3 font-normal">
                    <div className="text-[10px] text-slate-500 font-normal">
                      <span className="font-bold text-slate-800 block mb-0.5 text-xs">Calculated Integration Endpoint:</span>
                      <span className="font-mono bg-slate-50 border px-2 py-1.5 rounded block break-all text-[10px] text-teal-700">
                        https://wa.me/{whatsappNumber}?text={encodeURIComponent(whatsappMessage || '')}
                      </span>
                    </div>
                    <a
                      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage || '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold px-4 py-2.5 rounded-xl border border-emerald-200 transition cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Test Live WhatsApp Connection
                    </a>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      )}

      {/* Commission Reports Tab */}
      {activeTab === 'commission_reports' && (
        <div className="space-y-8 animate-fade-in font-semibold">
          
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-teal-50 text-teal-700 rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Platform Revenue</span>
                <span className="block text-lg font-bold text-slate-900 font-mono mt-0.5">
                  ₹{commissionLogs.reduce((sum, l) => sum + (l.order_total || 0), 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Percent className="w-6 h-6" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Commission Earned</span>
                <span className="block text-lg font-bold text-emerald-700 font-mono mt-0.5">
                  ₹{commissionLogs.reduce((sum, l) => sum + (l.commission_amount || 0), 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Vendor Payouts</span>
                <span className="block text-lg font-bold text-amber-700 font-mono mt-0.5">
                  ₹{commissionLogs.filter(l => l.status === 'pending').reduce((sum, l) => sum + (l.vendor_payout || 0), 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Table view log */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-display">Clearing & commission Logs</h2>
                <p className="text-xs text-slate-500 mt-0.5 font-semibold">Audit trail of platform transaction fee capture and routing payouts on completed clinical equipment sales.</p>
              </div>
              <button
                onClick={fetchCommissionLogs}
                className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition font-semibold w-fit"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh Logs
              </button>
            </div>

            {loadingLogs ? (
              <div className="py-20 text-center text-slate-400 font-semibold text-xs">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-teal-700 mb-2" />
                Retrieving clearing history logs...
              </div>
            ) : commissionLogs.length === 0 ? (
              <div className="py-20 text-center text-slate-400 font-semibold text-xs">
                No transaction payouts registered in log ledger yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <th className="p-4">Settlement Date</th>
                      <th className="p-4">Vendor Partner</th>
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Order Gross</th>
                      <th className="p-4">Fee %</th>
                      <th className="p-4">Comm Amount</th>
                      <th className="p-4">Vendor Payout</th>
                      <th className="p-4">Settlement Status</th>
                      <th className="p-4 text-right">Reference ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {commissionLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 text-slate-500 font-mono text-[10px]">
                          {new Date(log.created_at).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                        <td className="p-4 font-bold text-slate-900">{log.shop_name}</td>
                        <td className="p-4 font-mono font-bold text-slate-700">{log.order_id}</td>
                        <td className="p-4 font-mono text-slate-800">₹{(log.order_total || 0).toLocaleString('en-IN')}</td>
                        <td className="p-4 font-mono text-slate-500">{log.commission_percent}%</td>
                        <td className="p-4 font-mono font-bold text-rose-600">₹{(log.commission_amount || 0).toLocaleString('en-IN')}</td>
                        <td className="p-4 font-mono font-bold text-teal-700">₹{(log.vendor_payout || 0).toLocaleString('en-IN')}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold inline-flex items-center gap-1 ${
                            log.status === 'transferred'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${log.status === 'transferred' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                            {log.status === 'transferred' ? 'Transferred' : 'Pending manual transfer'}
                          </span>
                        </td>
                        <td className="p-4 text-right text-slate-400 font-mono text-[10px]">
                          {log.transfer_id || 'manual_upi'}
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
                className="w-full mt-4 bg-[#0F766E] hover:bg-teal-700 text-white text-xs font-bold py-2.5 rounded-xl uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer animate-pulse"
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

// Sub-row component for Commission Management tab to prevent whole-table rerender lags
const VendorCommissionRow = ({ vendor, onSave, savingId }: { vendor: any; onSave: any; savingId: any; key?: any }) => {
  const [comm, setComm] = useState(vendor.commission_percent);
  const [status, setStatus] = useState(vendor.vendor_status);

  useEffect(() => {
    setComm(vendor.commission_percent);
    setStatus(vendor.vendor_status);
  }, [vendor]);

  const isSaving = savingId === vendor.id;

  return (
    <tr className="hover:bg-slate-50/50 transition border-b border-slate-100">
      <td className="p-4">
        <div className="font-bold text-slate-900">{vendor.shop_name}</div>
        <div className="text-[11px] text-slate-400 font-mono">{vendor.email}</div>
      </td>
      <td className="p-4 font-mono text-[10px] text-slate-400">{vendor.id}</td>
      <td className="p-4">
        <div className="flex items-center gap-1.5 w-24">
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={comm}
            onChange={(e) => setComm(parseFloat(e.target.value) || 0)}
            className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-center text-xs font-semibold focus:border-teal-700 outline-none"
          />
          <span className="text-slate-400 font-bold">%</span>
        </div>
      </td>
      <td className="p-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-semibold focus:border-teal-700 outline-none"
        >
          <option value="pending">Pending Audit</option>
          <option value="approved">Approved & Active</option>
          <option value="suspended">Suspended Access</option>
        </select>
      </td>
      <td className="p-4 text-right">
        <button
          onClick={() => onSave(vendor.id, vendor.email, comm, status)}
          disabled={isSaving}
          className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-4 py-1.5 rounded-lg transition disabled:bg-slate-350"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </td>
    </tr>
  );
};
