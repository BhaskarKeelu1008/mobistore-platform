export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin' | 'staff' | 'superadmin';
  avatar?: string;
  isVerified?: boolean;
  isActive?: boolean;
  createdAt?: string;
  addresses?: Address[];
  wishlist?: Product[];
}

export interface Address {
  _id?: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface ProductVariant {
  color?: string;
  storage?: string;
  ram?: string;
  sku: string;
  barcode?: string;
  price: number;
  discountPrice?: number;
  flashSalePrice?: number;
  stock: number;
  images: string[];
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  category: Category | string;
  brand: Brand | string;
  images: string[];
  variants: ProductVariant[];
  basePrice: number;
  discountPrice?: number;
  flashSalePrice?: number;
  flashSaleEnd?: string;
  gstRate: number;
  warranty?: string;
  returnPolicy?: string;
  deliveryCharges: number;
  emiAvailable: boolean;
  emiOptions?: number[];
  specifications: { label: string; value: string }[];
  faqs: { question: string; answer: string }[];
  isFeatured: boolean;
  isTrending: boolean;
  isActive?: boolean;
  totalStock: number;
  averageRating: number;
  reviewCount: number;
  soldCount: number;
}

export interface Review {
  _id: string;
  user: { name: string; avatar?: string };
  rating: number;
  title?: string;
  comment: string;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice: number;
  quantity: number;
  variantSku?: string;
  variant?: { color?: string; storage?: string; ram?: string };
  stock: number;
  gstRate: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: Address;
  subtotal: number;
  discount: number;
  shippingCharges: number;
  cgst: number;
  sgst: number;
  totalGst: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  trackingUpdates: { status: string; message: string; timestamp: string }[];
  estimatedDelivery?: string;
  deliveredAt?: string;
  invoiceNumber?: string;
  createdAt: string;
}

export interface OrderItem {
  product: Product | string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  total: number;
  variant?: { color?: string; storage?: string; ram?: string; sku?: string };
}

export interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  buttonText?: string;
}

export interface Chat {
  _id: string;
  customer: User;
  assignedTo?: User;
  subject?: string;
  product?: Product;
  status: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCustomer: number;
  unreadAdmin: number;
}

export interface Message {
  _id: string;
  sender: User;
  senderRole: string;
  content: string;
  messageType: string;
  attachments?: string[];
  isRead: boolean;
  createdAt: string;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Settings {
  shopName: string;
  shopDescription?: string;
  shopLogo?: string;
  shopAddress?: string;
  shopPhone?: string;
  shopEmail?: string;
  socialLinks: Record<string, string>;
  theme: { primaryColor: string; secondaryColor: string; accentColor: string };
  storeTimings?: string;
  seo: { metaTitle?: string; metaDescription?: string };
  cms: Record<string, unknown>;
  chat: { enabled: boolean; adminOnline: boolean; whatsappNumber?: string; autoReplyMessage?: string };
  payment?: {
    razorpayEnabled: boolean;
    codEnabled: boolean;
    upiEnabled: boolean;
  };
  shipping?: {
    freeShippingAbove: number;
    defaultShippingCharge: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: { page: number; limit: number; total: number; pages: number };
}

export interface Offer {
  _id: string;
  title: string;
  description?: string;
  image?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  products: Product[] | string[];
  categories: Category[] | string[];
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  isFlashSale: boolean;
}

export interface ProductDetailResponse {
  product: Product;
  reviews: Review[];
  similarProducts: Product[];
}

export interface CMSPageContent {
  page: string;
  content?: string;
  faq?: { question: string; answer: string }[];
}

export interface DashboardStats {
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  totalRevenue: number;
  monthlyOrders: number;
  avgOrderValue: number;
  topProducts: Product[];
  recentOrders: Order[];
  pendingChats: number;
  lowStock: Product[];
  monthlyRevenue: { _id: number; revenue: number; orders: number }[];
}
