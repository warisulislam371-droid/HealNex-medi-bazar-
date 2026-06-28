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

export type ProductStatus = 'Pending' | 'Approved' | 'Rejected';

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
}

export interface Category {
  id: string;
  name: string;
  iconName: string; // lucide icon name mapping
  subcategories: string[];
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Returned' | 'Cancelled';

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
  type: 'vendor_registered' | 'vendor_approved' | 'product_submitted' | 'product_approved' | 'rfq_created' | 'rfq_received' | 'quote_received' | 'order_placed' | 'order_shipped' | 'order_delivered';
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
