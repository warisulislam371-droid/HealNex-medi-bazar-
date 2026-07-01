import { User, Vendor, Product, Order, RFQ, Quotation, SupportTicket, Blog, Notification, Review, WhatsAppSettings, WhatsAppClickLog } from './types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_BLOGS, DEFAULT_SUPER_ADMIN } from './data';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from './firebase';

// Helper to seed a collection if empty in Firestore
async function seedCollectionIfEmpty<T extends { id: string }>(collName: string, defaultData: T[]) {
  try {
    const collRef = collection(db, collName);
    const snap = await getDocs(collRef);
    if (snap.empty) {
      console.log(`Seeding Firestore collection '${collName}' with ${defaultData.length} records...`);
      for (const item of defaultData) {
        if (!item.id) continue;
        await setDoc(doc(db, collName, item.id), item);
      }
    }
  } catch (e) {
    console.error(`Error seeding collection '${collName}':`, e);
  }
}

// Helper to sync modified list to Firestore
async function syncListToFirestoreWithDeletions<T extends { id: string }>(collName: string, items: T[], existingLocalItems: T[]) {
  try {
    // Write new or updated items
    for (const item of items) {
      if (!item.id) continue;
      await setDoc(doc(db, collName, item.id), item);
    }
    // Delete items that are no longer in the list
    const incomingIds = new Set(items.map(item => item.id));
    for (const oldItem of existingLocalItems) {
      if (!incomingIds.has(oldItem.id)) {
        await deleteDoc(doc(db, collName, oldItem.id));
      }
    }
  } catch (e) {
    console.error(`Error syncing list to Firestore collection '${collName}':`, e);
  }
}

// Global active real-time listeners tracker to avoid multiple listener attachments
const activeListeners = new Set<string>();

// Real-time collection synchronization
function listenToCollection<T extends { id: string }>(collName: string, storageKey: string, defaultValue: T[]) {
  if (activeListeners.has(collName)) return;
  activeListeners.add(collName);

  const collRef = collection(db, collName);
  onSnapshot(collRef, (snapshot) => {
    const items: T[] = [];
    snapshot.forEach((docSnap) => {
      items.push(docSnap.data() as T);
    });
    if (items.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(items));
      window.dispatchEvent(new Event('healnex_db_update'));
    }
  }, (error) => {
    console.warn(`Firestore subscription error on '${collName}':`, error);
  });
}


const STORAGE_KEYS = {
  USERS: 'healnex_users',
  VENDORS: 'healnex_vendors',
  PRODUCTS: 'healnex_products',
  ORDERS: 'healnex_orders',
  RFQS: 'healnex_rfqs',
  QUOTATIONS: 'healnex_quotations',
  TICKETS: 'healnex_tickets',
  BLOGS: 'healnex_blogs',
  NOTIFICATIONS: 'healnex_notifications',
  REVIEWS: 'healnex_reviews',
  CURRENT_USER: 'healnex_current_user',
  PAYMENT_SETTINGS: 'healnex_payment_settings',
  WHATSAPP_SETTINGS: 'healnex_whatsapp_settings',
  WHATSAPP_CLICK_LOGS: 'healnex_whatsapp_click_logs'
};

import { PaymentSettings } from './types';

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  id: 'global_payment_settings',
  razorpayEnabled: true,
  razorpayKeyId: 'rzp_test_Hnx19283746',
  razorpaySecret: 'shh_secret_91823746',
  razorpayMode: 'test',
  
  upiEnabled: true,
  upiId: 'payments@hdfcbank',
  upiHolderName: 'HealNex Medi Bazar Pvt Ltd',
  upiQrCodeUrl: 'https://images.unsplash.com/photo-1601597111158-2fceff270190',
  
  bankEnabled: true,
  bankHolderName: 'HealNex Medi Bazar Private Limited',
  bankName: 'HDFC Bank Ltd',
  bankAccountNumber: '50200098765432',
  bankIfsc: 'HDFC0001234',
  bankBranch: 'Senapati Bapat Road, Pune',
  bankQrCodeUrl: 'https://images.unsplash.com/photo-1601597111158-2fceff270190'
};

export const DEFAULT_WHATSAPP_SETTINGS: WhatsAppSettings = {
  id: 'global_whatsapp_settings',
  enabled: true,
  phoneNumber: '+919876543210',
  businessLink: 'https://wa.me/919876543210',
  defaultMessage: 'Hello Healnex Medi Bazar Support. My name is {CustomerName}. I need help with Order #{OrderNumber} regarding {ProductName}.',
  position: 'floating',
  buttonText: 'Chat on WhatsApp',
  showOnAllScreens: true,
  selectedScreens: ['Home', 'ProductDetails', 'Cart', 'Checkout', 'Orders', 'Profile', 'HelpSupport']
};


// Seed initial users if empty
const DEFAULT_USERS: User[] = [
  { ...DEFAULT_SUPER_ADMIN, password: 'Waris@123' },
  {
    id: 'customer-sharma',
    name: 'Dr. Ramesh Sharma',
    email: 'doctor.sharma@hospital.com',
    role: 'customer',
    phone: '+91 94432 10987',
    password: 'password',
    isVerified: true,
    createdAt: '2026-06-10T12:00:00Z'
  },
  {
    id: 'vendor-medilink',
    name: 'MediLink Systems',
    email: 'vendor.medilink@healnex.com',
    role: 'vendor',
    phone: '+91 88877 66554',
    password: 'password',
    isVerified: true,
    createdAt: '2026-06-12T09:00:00Z'
  },
  {
    id: 'vendor-hightech',
    name: 'HighTech Diagnostics',
    email: 'vendor.hightech@healnex.com',
    role: 'vendor',
    phone: '+91 77766 55443',
    password: 'password',
    isVerified: true,
    createdAt: '2026-06-25T14:00:00Z'
  }
];

const DEFAULT_VENDORS: Vendor[] = [
  {
    id: 'vendor-medilink',
    companyName: 'MediLink Systems Private Limited',
    ownerName: 'Waqas Ahmad',
    email: 'vendor.medilink@healnex.com',
    mobileNumber: '+91 88877 66554',
    gstNumber: '27AAAAA1111A1Z1',
    panNumber: 'AAAAA1111A',
    aadhaarNumber: '123456789012',
    businessAddress: '402, Elite Business Hub, S.G. Highway',
    state: 'Gujarat',
    district: 'Ahmedabad',
    pincode: '380054',
    bankDetails: {
      bankName: 'HDFC Bank',
      accountNumber: '50200012345678',
      ifscCode: 'HDFC0000123'
    },
    documents: {
      gstCertificateUrl: 'gst_certificate.pdf',
      panCardUrl: 'pan_card.jpg',
      aadhaarCardUrl: 'aadhaar_card.jpg'
    },
    status: 'Approved',
    createdAt: '2026-06-12T09:15:00Z'
  },
  {
    id: 'vendor-hightech',
    companyName: 'HighTech Diagnostics Ltd',
    ownerName: 'John Doe',
    email: 'vendor.hightech@healnex.com',
    mobileNumber: '+91 77766 55443',
    gstNumber: '27BBBBB2222B2Z2',
    panNumber: 'BBBBB2222B',
    aadhaarNumber: '987654321098',
    businessAddress: '99 Tech Galleria, Electronic City Phase 1',
    state: 'Karnataka',
    district: 'Bengaluru',
    pincode: '560100',
    bankDetails: {
      bankName: 'State Bank of India',
      accountNumber: '30211122233',
      ifscCode: 'SBIN0001234'
    },
    documents: {
      gstCertificateUrl: 'hightech_gst.pdf',
      panCardUrl: 'hightech_pan.jpg',
      aadhaarCardUrl: 'hightech_aadhaar.jpg'
    },
    status: 'Pending',
    createdAt: '2026-06-25T14:10:00Z'
  }
];

const DEFAULT_ORDERS: Order[] = [
  {
    id: 'ORD-89324',
    customerId: 'customer-sharma',
    customerName: 'Dr. Ramesh Sharma',
    customerEmail: 'doctor.sharma@hospital.com',
    vendorId: 'vendor-medilink',
    vendorName: 'MediLink Systems Private Limited',
    items: [
      {
        productId: 'prod-ecg-12',
        productName: '12-Channel Electrocardiograph (ECG Machine)',
        productImage: 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&q=80&w=400',
        price: 58000,
        quantity: 1,
        gstRate: 12,
        hsnCode: '90181100',
        vendorId: 'vendor-medilink',
        vendorName: 'MediLink Systems Private Limited'
      }
    ],
    totalAmount: 58000,
    gstAmount: 6960,
    discountAmount: 0,
    finalAmount: 64960,
    status: 'Delivered',
    paymentMethod: 'UPI',
    paymentId: 'pay_HN_982472912',
    shippingAddress: {
      address: 'City Hospital, Emergency Wing, Station Road',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001'
    },
    shippingProvider: 'Delhivery',
    trackingNumber: 'DEL123456789',
    timeline: [
      { status: 'Pending', time: '2026-06-20T10:00:00Z', note: 'Order placed successfully by Dr. Ramesh Sharma.' },
      { status: 'Confirmed', time: '2026-06-20T10:30:00Z', note: 'Order confirmed by MediLink Systems.' },
      { status: 'Processing', time: '2026-06-21T09:00:00Z', note: 'Product sanitization and clinical calibration complete.' },
      { status: 'Shipped', time: '2026-06-21T14:00:00Z', note: 'Dispatched via Delhivery Express.' },
      { status: 'Delivered', time: '2026-06-23T16:30:00Z', note: 'Received & signature verified.' }
    ],
    createdAt: '2026-06-20T10:00:00Z'
  }
];

const DEFAULT_RFQS: RFQ[] = [
  {
    id: 'RFQ-77123',
    customerId: 'customer-sharma',
    customerName: 'Dr. Ramesh Sharma',
    customerEmail: 'doctor.sharma@hospital.com',
    productName: 'High-Flow Oxygen Concentrators 10L',
    quantity: 10,
    budget: 450000,
    deliveryLocation: 'Fortis Clinic Network, Phase 3, Mohali',
    description: 'Require 10 units of CE certified Oxygen Concentrators with 10 LPM capacity. Continuous flow rate, low decibel operability, and integrated nebulizer function are critical parameters.',
    status: 'Open',
    createdAt: '2026-06-26T10:00:00Z',
    quotationsCount: 1
  }
];

const DEFAULT_QUOTATIONS: Quotation[] = [
  {
    id: 'QUO-103',
    rfqId: 'RFQ-77123',
    vendorId: 'vendor-medilink',
    vendorName: 'Waqas Ahmad',
    companyName: 'MediLink Systems Private Limited',
    pricePerUnit: 44000,
    totalPrice: 440000,
    validUntil: '2026-07-15',
    deliveryDays: 5,
    specifications: 'Offering the OxyFlow 10L model as requested. Includes dual nasal cannulas, integrated humidifier bottles, and 12 months full replacement warranty.',
    status: 'Pending',
    createdAt: '2026-06-27T11:30:00Z'
  }
];

const DEFAULT_TICKETS: SupportTicket[] = [
  {
    id: 'TCK-29402',
    userId: 'customer-sharma',
    userName: 'Dr. Ramesh Sharma',
    userEmail: 'doctor.sharma@hospital.com',
    userRole: 'customer',
    category: 'Customer Support',
    subject: 'Delayed Shipping on Order #89324',
    description: 'Hi, I received my ECG machine, but the user manual booklet and calibration certificate are missing from the packaging box. Please dispatch them immediately.',
    status: 'In Progress',
    replies: [
      {
        id: 'rep-1',
        senderName: 'Dr. Ramesh Sharma',
        senderRole: 'customer',
        message: 'Hi, I received my ECG machine, but the user manual booklet and calibration certificate are missing from the packaging box. Please dispatch them immediately.',
        time: '2026-06-24T10:00:00Z',
        isStaff: false
      },
      {
        id: 'rep-2',
        senderName: 'Super Admin',
        senderRole: 'super_admin',
        message: 'Hello Dr. Sharma, we sincerely apologize for this oversight. I have contacted the vendor, MediLink Systems, to courier a printed copy of the calibration report. In the meantime, I have emailed a PDF copy of both documents to your inbox.',
        time: '2026-06-24T14:30:00Z',
        isStaff: true
      }
    ],
    createdAt: '2026-06-24T10:00:00Z'
  }
];

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    userId: 'admin',
    title: 'New Vendor Registered',
    message: 'HighTech Diagnostics Ltd has applied for vendor status. Review their documents in the approval panel.',
    read: false,
    type: 'vendor_registered',
    createdAt: '2026-06-25T14:10:00Z'
  },
  {
    id: 'notif-2',
    userId: 'vendor-medilink',
    title: 'New RFQ Received',
    message: 'A new RFQ for "High-Flow Oxygen Concentrators 10L" matches your categories. Submit a quote now.',
    read: false,
    type: 'rfq_received',
    createdAt: '2026-06-26T10:05:00Z'
  }
];

const DEFAULT_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-ecg-12',
    customerId: 'customer-sharma',
    customerName: 'Dr. Ramesh Sharma',
    rating: 5,
    comment: 'Exceptional build quality. The 12-channel output is crisp, and the built-in automatic interpretation software has saved our diagnostic team precious time. Highly recommended.',
    createdAt: '2026-06-24T08:00:00Z'
  }
];

// Database Helpers
export const dbLocal = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Error saving to LocalStorage: ', e);
    }
  },

  async init() {
    // Synchronous local state initialization for immediate rendering
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) this.set(STORAGE_KEYS.USERS, DEFAULT_USERS);
    if (!localStorage.getItem(STORAGE_KEYS.VENDORS)) this.set(STORAGE_KEYS.VENDORS, DEFAULT_VENDORS);
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) this.set(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) this.set(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
    if (!localStorage.getItem(STORAGE_KEYS.RFQS)) this.set(STORAGE_KEYS.RFQS, DEFAULT_RFQS);
    if (!localStorage.getItem(STORAGE_KEYS.QUOTATIONS)) this.set(STORAGE_KEYS.QUOTATIONS, DEFAULT_QUOTATIONS);
    if (!localStorage.getItem(STORAGE_KEYS.TICKETS)) this.set(STORAGE_KEYS.TICKETS, DEFAULT_TICKETS);
    if (!localStorage.getItem(STORAGE_KEYS.BLOGS)) this.set(STORAGE_KEYS.BLOGS, INITIAL_BLOGS);
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) this.set(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
    if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) this.set(STORAGE_KEYS.REVIEWS, DEFAULT_REVIEWS);
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENT_SETTINGS)) this.set(STORAGE_KEYS.PAYMENT_SETTINGS, [DEFAULT_PAYMENT_SETTINGS]);
    if (!localStorage.getItem(STORAGE_KEYS.WHATSAPP_SETTINGS)) this.set(STORAGE_KEYS.WHATSAPP_SETTINGS, [DEFAULT_WHATSAPP_SETTINGS]);
    if (!localStorage.getItem(STORAGE_KEYS.WHATSAPP_CLICK_LOGS)) this.set(STORAGE_KEYS.WHATSAPP_CLICK_LOGS, []);
    
    // Do not auto-login by default to allow showing login screen on startup
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      this.set(STORAGE_KEYS.CURRENT_USER, null);
    }

    // Background Firebase seeding & listening initialization
    try {
      // 1. Seed Firestore collections if empty
      await seedCollectionIfEmpty('users', DEFAULT_USERS);
      await seedCollectionIfEmpty('vendors', DEFAULT_VENDORS);
      await seedCollectionIfEmpty('products', INITIAL_PRODUCTS);
      await seedCollectionIfEmpty('orders', DEFAULT_ORDERS);
      await seedCollectionIfEmpty('rfqs', DEFAULT_RFQS);
      await seedCollectionIfEmpty('quotations', DEFAULT_QUOTATIONS);
      await seedCollectionIfEmpty('tickets', DEFAULT_TICKETS);
      await seedCollectionIfEmpty('blogs', INITIAL_BLOGS);
      await seedCollectionIfEmpty('notifications', DEFAULT_NOTIFICATIONS);
      await seedCollectionIfEmpty('reviews', DEFAULT_REVIEWS);
      await seedCollectionIfEmpty('payment_settings', [DEFAULT_PAYMENT_SETTINGS]);
      await seedCollectionIfEmpty('whatsapp_settings', [DEFAULT_WHATSAPP_SETTINGS]);
      await seedCollectionIfEmpty('whatsapp_click_logs', []);

      // 2. Start real-time Firestore synchronization
      listenToCollection('users', STORAGE_KEYS.USERS, DEFAULT_USERS);
      listenToCollection('vendors', STORAGE_KEYS.VENDORS, DEFAULT_VENDORS);
      listenToCollection('products', STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      listenToCollection('orders', STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
      listenToCollection('rfqs', STORAGE_KEYS.RFQS, DEFAULT_RFQS);
      listenToCollection('quotations', STORAGE_KEYS.QUOTATIONS, DEFAULT_QUOTATIONS);
      listenToCollection('tickets', STORAGE_KEYS.TICKETS, DEFAULT_TICKETS);
      listenToCollection('blogs', STORAGE_KEYS.BLOGS, INITIAL_BLOGS);
      listenToCollection('notifications', STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
      listenToCollection('reviews', STORAGE_KEYS.REVIEWS, DEFAULT_REVIEWS);
      listenToCollection('payment_settings', STORAGE_KEYS.PAYMENT_SETTINGS, [DEFAULT_PAYMENT_SETTINGS]);
      listenToCollection('whatsapp_settings', STORAGE_KEYS.WHATSAPP_SETTINGS, [DEFAULT_WHATSAPP_SETTINGS]);
      listenToCollection('whatsapp_click_logs', STORAGE_KEYS.WHATSAPP_CLICK_LOGS, []);
    } catch (err) {
      console.warn('Firebase sync failed to initialize (possibly offline):', err);
    }
  },

  // Users
  getUsers(): User[] {
    const users = this.get(STORAGE_KEYS.USERS, DEFAULT_USERS);
    try {
      const adminIdx = users.findIndex(u => u.role === 'super_admin' || u.id === 'user-superadmin');
      if (adminIdx !== -1) {
        const admin = users[adminIdx];
        if (admin.email !== 'warisulislam371@gmail.com' || admin.password !== 'Waris@123' || admin.forcePasswordChange) {
          users[adminIdx] = {
            ...admin,
            email: 'warisulislam371@gmail.com',
            password: 'Waris@123',
            forcePasswordChange: false
          };
          // Persist the correction back
          setTimeout(() => {
            this.saveUsers(users);
          }, 0);
        }
      } else {
        const newAdmin: User = {
          id: 'user-superadmin',
          name: 'Super Admin',
          email: 'warisulislam371@gmail.com',
          role: 'super_admin',
          phone: '+91 98765 43210',
          isVerified: true,
          forcePasswordChange: false,
          createdAt: '2026-01-01T00:00:00Z',
          password: 'Waris@123'
        };
        users.push(newAdmin);
        setTimeout(() => {
          this.saveUsers(users);
        }, 0);
      }
    } catch (e) {
      console.error('Error migrating super admin in getUsers():', e);
    }
    return users;
  },
  saveUsers(users: User[]) {
    const old = this.getUsers();
    this.set(STORAGE_KEYS.USERS, users);
    syncListToFirestoreWithDeletions('users', users, old);
  },

  // Current logged in User
  getCurrentUser(): User | null { return this.get(STORAGE_KEYS.CURRENT_USER, null); },
  setCurrentUser(user: User | null) { this.set(STORAGE_KEYS.CURRENT_USER, user); },

  // Vendors
  getVendors(): Vendor[] { return this.get(STORAGE_KEYS.VENDORS, DEFAULT_VENDORS); },
  saveVendors(vendors: Vendor[]) {
    const old = this.getVendors();
    this.set(STORAGE_KEYS.VENDORS, vendors);
    syncListToFirestoreWithDeletions('vendors', vendors, old);
  },

  // Products
  getProducts(): Product[] { return this.get(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS); },
  saveProducts(products: Product[]) {
    const old = this.getProducts();
    this.set(STORAGE_KEYS.PRODUCTS, products);
    syncListToFirestoreWithDeletions('products', products, old);
  },

  // Orders
  getOrders(): Order[] { return this.get(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS); },
  saveOrders(orders: Order[]) {
    const old = this.getOrders();
    this.set(STORAGE_KEYS.ORDERS, orders);
    syncListToFirestoreWithDeletions('orders', orders, old);
  },

  // RFQs
  getRfqs(): RFQ[] { return this.get(STORAGE_KEYS.RFQS, DEFAULT_RFQS); },
  saveRfqs(rfqs: RFQ[]) {
    const old = this.getRfqs();
    this.set(STORAGE_KEYS.RFQS, rfqs);
    syncListToFirestoreWithDeletions('rfqs', rfqs, old);
  },

  // Quotations
  getQuotations(): Quotation[] { return this.get(STORAGE_KEYS.QUOTATIONS, DEFAULT_QUOTATIONS); },
  saveQuotations(quotations: Quotation[]) {
    const old = this.getQuotations();
    this.set(STORAGE_KEYS.QUOTATIONS, quotations);
    syncListToFirestoreWithDeletions('quotations', quotations, old);
  },

  // Tickets
  getTickets(): SupportTicket[] { return this.get(STORAGE_KEYS.TICKETS, DEFAULT_TICKETS); },
  saveTickets(tickets: SupportTicket[]) {
    const old = this.getTickets();
    this.set(STORAGE_KEYS.TICKETS, tickets);
    syncListToFirestoreWithDeletions('tickets', tickets, old);
  },

  // Blogs
  getBlogs(): Blog[] { return this.get(STORAGE_KEYS.BLOGS, INITIAL_BLOGS); },
  saveBlogs(blogs: Blog[]) {
    const old = this.getBlogs();
    this.set(STORAGE_KEYS.BLOGS, blogs);
    syncListToFirestoreWithDeletions('blogs', blogs, old);
  },

  // Notifications
  getNotifications(): Notification[] { return this.get(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS); },
  saveNotifications(notifs: Notification[]) {
    const old = this.getNotifications();
    this.set(STORAGE_KEYS.NOTIFICATIONS, notifs);
    syncListToFirestoreWithDeletions('notifications', notifs, old);
  },

  // Reviews
  getReviews(): Review[] { return this.get(STORAGE_KEYS.REVIEWS, DEFAULT_REVIEWS); },
  saveReviews(reviews: Review[]) {
    const old = this.getReviews();
    this.set(STORAGE_KEYS.REVIEWS, reviews);
    syncListToFirestoreWithDeletions('reviews', reviews, old);
  },

  // Payment Settings
  getPaymentSettings(): PaymentSettings {
    const settings = this.get(STORAGE_KEYS.PAYMENT_SETTINGS, [DEFAULT_PAYMENT_SETTINGS]) as PaymentSettings[];
    return settings[0] || DEFAULT_PAYMENT_SETTINGS;
  },
  savePaymentSettings(settings: PaymentSettings) {
    this.set(STORAGE_KEYS.PAYMENT_SETTINGS, [settings]);
    syncListToFirestoreWithDeletions('payment_settings', [settings], []);
  },

  // WhatsApp Settings
  getWhatsAppSettings(): WhatsAppSettings {
    const settings = this.get(STORAGE_KEYS.WHATSAPP_SETTINGS, [DEFAULT_WHATSAPP_SETTINGS]) as WhatsAppSettings[];
    return settings[0] || DEFAULT_WHATSAPP_SETTINGS;
  },
  saveWhatsAppSettings(settings: WhatsAppSettings) {
    this.set(STORAGE_KEYS.WHATSAPP_SETTINGS, [settings]);
    syncListToFirestoreWithDeletions('whatsapp_settings', [settings], []);
  },

  // WhatsApp Click Logs
  getWhatsAppClickLogs(): WhatsAppClickLog[] {
    return this.get(STORAGE_KEYS.WHATSAPP_CLICK_LOGS, []);
  },
  logWhatsAppClick(logData: Omit<WhatsAppClickLog, 'id' | 'timestamp'>) {
    const logs = this.getWhatsAppClickLogs();
    const newLog: WhatsAppClickLog = {
      ...logData,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    this.set(STORAGE_KEYS.WHATSAPP_CLICK_LOGS, logs);
    syncListToFirestoreWithDeletions('whatsapp_click_logs', logs, []);
  },

  // Utility to push notifications
  addNotification(userId: string, title: string, message: string, type: Notification['type']) {
    const notifs = this.getNotifications();
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      userId,
      title,
      message,
      read: false,
      type,
      createdAt: new Date().toISOString()
    };
    notifs.unshift(newNotif);
    this.saveNotifications(notifs);
  }
};
