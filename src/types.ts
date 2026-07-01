export type UserRole = 'super_admin' | 'admin' | 'vendor' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  isVerified?: boolean;
  forcePasswordChange?: boolean;
  password?: string;
  createdAt: string;
}

export type VendorStatus = 'Pending' | 'Approved' | 'Rejected' | 'Suspended' | 'MoreInfoRequired';

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
}

export interface VendorDocuments {
  gstCertificateUrl?: string;
  panCardUrl?: string;
  aadhaarCardUrl?: string;
  tradeLicenseUrl?: string;
  companyRegCertificateUrl?: string;
  cancelledChequeUrl?: string;
  drugLicenseUrl?: string;
  fssaiLicenseUrl?: string;
  
  gstCertificateName?: string;
  panCardName?: string;
  aadhaarCardName?: string;
  tradeLicenseName?: string;
  companyRegCertificateName?: string;
  cancelledChequeName?: string;
  drugLicenseName?: string;
  fssaiLicenseName?: string;
}

export interface Vendor {
  id: string; // matches user.id
  companyName: string;
  ownerName: string;
  email: string;
  mobileNumber: string;
  gstNumber: string;
  panNumber: string;
  aadhaarNumber: string;
  businessAddress: string;
  state: string;
  district: string;
  pincode: string;
  bankDetails: BankDetails;
  documents: VendorDocuments;
  status: VendorStatus;
  statusReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export type ProductStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected' | 'Inactive';

export interface ProductSpecification {
  key: string;
  value: string;
}

export interface Product {
  id: string;
  vendorId: string;
  vendorName: string;
  name: string;
  sku: string;
  brand: string;
  category: string;
  subcategory: string;
  description: string;
  specifications: ProductSpecification[];
  price: number;
  salePrice: number;
  moq: number; // Minimum Order Quantity
  stockQuantity: number;
  hsnCode: string;
  gstRate: number; // e.g., 12 for 12%, 18 for 18%
  warranty: string;
  countryOfOrigin: string;
  images: string[];
  brochureUrl?: string;
  status: ProductStatus;
  createdAt: string;
  
  // Extended Vendor Product Fields
  shortDescription?: string;
  fullDescription?: string;
  tags?: string[];
  mrp?: number;
  wholesalePrice?: number;
  discountPercentage?: number;
  unit?: string; // Piece, Box, Pack, etc.
  videoUrl?: string;
  manufacturer?: string;
  modelNumber?: string;
  certifications?: string[];
  packageContents?: string;
  lowStockAlert?: number;
  outOfStock?: boolean;
  weight?: number; // Weight in kg
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  shippingCharges?: number;
  estimatedDeliveryTime?: string;
  rejectionReason?: string;
  performance?: {
    views: number;
    inquiries: number;
    sales: number;
  };
}

export interface Category {
  id: string;
  name: string;
  iconName: string; // lucide icon name mapping
  subcategories: string[];
}

export type OrderStatus = 
  | 'Pending' 
  | 'Confirmed' 
  | 'Processing' 
  | 'Shipped' 
  | 'Delivered' 
  | 'Returned' 
  | 'Cancelled'
  | 'Pending Payment'
  | 'Payment Submitted'
  | 'Awaiting Payment Verification'
  | 'Payment Verified'
  | 'Order Sent to Vendor'
  | 'Vendor Accepted'
  | 'Completed'
  | 'Refunded';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  gstRate: number;
  hsnCode: string;
  vendorId: string;
  vendorName: string;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  time: string;
  note: string;
}

export interface PaymentVerificationLog {
  action: 'submit' | 'approve' | 'reject' | 'request_reupload';
  performedBy: string;
  performedByRole: string;
  timestamp: string;
  note?: string;
}

export interface PaymentSettings {
  id: string; // 'global_payment_settings'
  razorpayEnabled: boolean;
  razorpayKeyId: string;
  razorpaySecret: string;
  razorpayMode: 'test' | 'live';
  
  upiEnabled: boolean;
  upiId: string;
  upiHolderName: string;
  upiQrCodeUrl?: string;
  
  bankEnabled: boolean;
  bankHolderName: string;
  bankName: string;
  bankAccountNumber: string;
  bankIfsc: string;
  bankBranch: string;
  bankQrCodeUrl?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  vendorId: string; // Single vendor or combined
  vendorName: string;
  items: OrderItem[];
  totalAmount: number; // Excl GST
  gstAmount: number;
  discountAmount: number;
  finalAmount: number; // Incl GST & discounts
  status: OrderStatus;
  paymentMethod: string;
  paymentId?: string; // Razorpay transaction ID
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  shippingProvider?: 'Shiprocket' | 'Delhivery';
  trackingNumber?: string;
  invoiceUrl?: string;
  timeline: OrderTimelineEvent[];
  createdAt: string;
  // Manual Payment Fields
  paymentProofUrl?: string;
  paymentTxId?: string; // Transaction ID or UTR Number
  paymentNote?: string;
  paymentRejectionReason?: string;
  paymentVerificationLogs?: PaymentVerificationLog[];
}

export interface RFQ {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  quantity: number;
  budget: number;
  deliveryLocation: string;
  description: string;
  attachmentName?: string;
  attachmentUrl?: string;
  status: 'Open' | 'Closed';
  createdAt: string;
  quotationsCount: number;
}

export interface Quotation {
  id: string;
  rfqId: string;
  vendorId: string;
  vendorName: string;
  companyName: string;
  pricePerUnit: number;
  totalPrice: number;
  validUntil: string;
  deliveryDays: number;
  specifications: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  createdAt: string;
}

export interface TicketReply {
  id: string;
  senderName: string;
  senderRole: string;
  message: string;
  time: string;
  isStaff: boolean;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  category: 'Customer Support' | 'Vendor Support' | 'Technical Support';
  subject: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Closed';
  assignedTo?: string;
  replies: TicketReply[];
  createdAt: string;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  author: string;
  tags: string[];
  image: string;
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string; // 'all', 'admin', 'vendor_id', 'customer_id'
  title: string;
  message: string;
  read: boolean;
  type: string;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  productId: string;
  customerId: string;
  createdAt: string;
}

export interface WhatsAppSettings {
  id: string; // 'global_whatsapp_settings'
  enabled: boolean;
  phoneNumber: string;
  businessLink?: string;
  defaultMessage: string;
  position: 'floating' | 'contact_page';
  buttonText: string;
  iconUrl?: string;
  showOnAllScreens: boolean;
  selectedScreens: string[]; // ['Home', 'ProductDetails', 'Cart', 'Checkout', 'Orders', 'Profile', 'HelpSupport']
}

export interface WhatsAppClickLog {
  id: string;
  timestamp: string;
  customerId?: string;
  customerName?: string;
  contextPage: string;
  orderNumber?: string;
  productName?: string;
}

