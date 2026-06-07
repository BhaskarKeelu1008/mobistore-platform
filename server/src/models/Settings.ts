import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  shopName: string;
  shopDescription?: string;
  shopLogo?: string;
  favicon?: string;
  shopAddress?: string;
  shopPhone?: string;
  shopEmail?: string;
  gstin?: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    whatsapp?: string;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    darkMode: boolean;
  };
  storeTimings?: string;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    ogImage?: string;
  };
  payment: {
    razorpayEnabled: boolean;
    codEnabled: boolean;
    upiEnabled: boolean;
    minCodAmount: number;
    maxCodAmount: number;
  };
  tax: {
    defaultGstRate: number;
    includeGstInPrice: boolean;
  };
  shipping: {
    freeShippingAbove: number;
    defaultShippingCharge: number;
  };
  invoice: {
    prefix: string;
    terms?: string;
    footerNote?: string;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    whatsappEnabled: boolean;
    pushEnabled: boolean;
  };
  chat: {
    enabled: boolean;
    autoReplyEnabled: boolean;
    autoReplyMessage?: string;
    whatsappNumber?: string;
    adminOnline: boolean;
  };
  cms: {
    aboutUs?: string;
    privacyPolicy?: string;
    termsConditions?: string;
    refundPolicy?: string;
    faq?: { question: string; answer: string }[];
    footerContent?: string;
  };
}

const settingsSchema = new Schema<ISettings>(
  {
    shopName: { type: String, default: 'MobiStore' },
    shopDescription: { type: String },
    shopLogo: { type: String },
    favicon: { type: String },
    shopAddress: { type: String },
    shopPhone: { type: String },
    shopEmail: { type: String },
    gstin: { type: String },
    socialLinks: {
      facebook: String,
      instagram: String,
      twitter: String,
      youtube: String,
      whatsapp: String,
    },
    theme: {
      primaryColor: { type: String, default: '#2563eb' },
      secondaryColor: { type: String, default: '#1e40af' },
      accentColor: { type: String, default: '#f59e0b' },
      darkMode: { type: Boolean, default: false },
    },
    storeTimings: { type: String },
    seo: {
      metaTitle: String,
      metaDescription: String,
      metaKeywords: [String],
      ogImage: String,
    },
    payment: {
      razorpayEnabled: { type: Boolean, default: true },
      codEnabled: { type: Boolean, default: true },
      upiEnabled: { type: Boolean, default: true },
      minCodAmount: { type: Number, default: 0 },
      maxCodAmount: { type: Number, default: 50000 },
    },
    tax: {
      defaultGstRate: { type: Number, default: 18 },
      includeGstInPrice: { type: Boolean, default: false },
    },
    shipping: {
      freeShippingAbove: { type: Number, default: 999 },
      defaultShippingCharge: { type: Number, default: 49 },
    },
    invoice: {
      prefix: { type: String, default: 'INV' },
      terms: String,
      footerNote: String,
    },
    notifications: {
      emailEnabled: { type: Boolean, default: true },
      smsEnabled: { type: Boolean, default: false },
      whatsappEnabled: { type: Boolean, default: true },
      pushEnabled: { type: Boolean, default: true },
    },
    chat: {
      enabled: { type: Boolean, default: true },
      autoReplyEnabled: { type: Boolean, default: true },
      autoReplyMessage: { type: String, default: 'Thank you for contacting us! Our team will respond shortly.' },
      whatsappNumber: String,
      adminOnline: { type: Boolean, default: true },
    },
    cms: {
      aboutUs: String,
      privacyPolicy: String,
      termsConditions: String,
      refundPolicy: String,
      faq: [{ question: String, answer: String }],
      footerContent: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISettings>('Settings', settingsSchema);
