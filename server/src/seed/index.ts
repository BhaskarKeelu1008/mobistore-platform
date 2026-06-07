import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Category from '../models/Category';
import Brand from '../models/Brand';
import Product from '../models/Product';
import Banner from '../models/Banner';
import Coupon from '../models/Coupon';
import Offer from '../models/Offer';
import Order from '../models/Order';
import Chat from '../models/Chat';
import Message from '../models/Message';
import Settings from '../models/Settings';
import DeliveryZone from '../models/DeliveryZone';
import Supplier from '../models/Supplier';
import Review from '../models/Review';
import Notification from '../models/Notification';
import Role from '../models/Role';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mobistore';

const categories = [
  { name: 'Mobiles', slug: 'mobiles', icon: '📱', sortOrder: 1 },
  { name: 'Screen Guards', slug: 'screen-guards', icon: '🛡️', sortOrder: 2 },
  { name: 'Back Cases', slug: 'back-cases', icon: '📦', sortOrder: 3 },
  { name: 'Chargers', slug: 'chargers', icon: '🔌', sortOrder: 4 },
  { name: 'Earphones', slug: 'earphones', icon: '🎧', sortOrder: 5 },
  { name: 'Bluetooth Devices', slug: 'bluetooth-devices', icon: '📶', sortOrder: 6 },
  { name: 'Smart Watches', slug: 'smart-watches', icon: '⌚', sortOrder: 7 },
  { name: 'Power Banks', slug: 'power-banks', icon: '🔋', sortOrder: 8 },
  { name: 'Mobile Accessories', slug: 'mobile-accessories', icon: '🎛️', sortOrder: 9 },
  { name: 'Speakers', slug: 'speakers', icon: '🔊', sortOrder: 10 },
  { name: 'Tablets', slug: 'tablets', icon: '📲', sortOrder: 11 },
];

const brands = [
  { name: 'Samsung', slug: 'samsung', sortOrder: 1 },
  { name: 'Apple', slug: 'apple', sortOrder: 2 },
  { name: 'OnePlus', slug: 'oneplus', sortOrder: 3 },
  { name: 'Xiaomi', slug: 'xiaomi', sortOrder: 4 },
  { name: 'Realme', slug: 'realme', sortOrder: 5 },
  { name: 'Vivo', slug: 'vivo', sortOrder: 6 },
  { name: 'Oppo', slug: 'oppo', sortOrder: 7 },
  { name: 'Boat', slug: 'boat', sortOrder: 8 },
  { name: 'JBL', slug: 'jbl', sortOrder: 9 },
  { name: 'Ambrane', slug: 'ambrane', sortOrder: 10 },
];

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await Promise.all([
      User.deleteMany({}), Category.deleteMany({}), Brand.deleteMany({}),
      Product.deleteMany({}), Banner.deleteMany({}), Coupon.deleteMany({}),
      Offer.deleteMany({}), Order.deleteMany({}), Chat.deleteMany({}),
      Message.deleteMany({}), Settings.deleteMany({}), DeliveryZone.deleteMany({}),
      Supplier.deleteMany({}), Review.deleteMany({}), Notification.deleteMany({}),
      Role.deleteMany({}),
    ]);

    await Role.create([
      { name: 'superadmin', permissions: ['*'], description: 'Full access' },
      { name: 'admin', permissions: ['products', 'orders', 'customers', 'settings'], description: 'Admin access' },
      { name: 'staff', permissions: ['orders', 'chat'], description: 'Staff access' },
      { name: 'customer', permissions: ['shop'], description: 'Customer access' },
    ]);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@mobistore.com',
      phone: '9876543210',
      password: 'Admin@123',
      role: 'superadmin',
      isVerified: true,
    });

    const customer = await User.create({
      name: 'Demo Customer',
      email: 'customer@demo.com',
      phone: '9123456789',
      password: 'Customer@123',
      role: 'customer',
      isVerified: true,
      addresses: [{
        label: 'Home',
        fullName: 'Demo Customer',
        phone: '9123456789',
        addressLine1: '123 MG Road',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        isDefault: true,
      }],
    });

    const staff = await User.create({
      name: 'Shop Staff',
      email: 'staff@mobistore.com',
      phone: '9988776655',
      password: 'Staff@123',
      role: 'staff',
      isVerified: true,
    });

    const createdCategories = await Category.insertMany(
      categories.map((c) => ({ ...c, description: `${c.name} collection`, isActive: true }))
    );

    const createdBrands = await Brand.insertMany(
      brands.map((b) => ({ ...b, description: `${b.name} products`, isActive: true }))
    );

    const mobilesCat = createdCategories.find((c) => c.slug === 'mobiles')!;
    const accessoriesCat = createdCategories.find((c) => c.slug === 'mobile-accessories')!;
    const samsung = createdBrands.find((b) => b.slug === 'samsung')!;
    const apple = createdBrands.find((b) => b.slug === 'apple')!;
    const oneplus = createdBrands.find((b) => b.slug === 'oneplus')!;
    const boat = createdBrands.find((b) => b.slug === 'boat')!;

    const productData = [
      {
        name: 'Samsung Galaxy S24 Ultra',
        slug: 'samsung-galaxy-s24-ultra',
        description: 'Experience the ultimate flagship with Galaxy AI, 200MP camera, and S Pen integration.',
        shortDescription: 'Flagship with Galaxy AI and 200MP camera',
        category: mobilesCat._id,
        brand: samsung._id,
        images: ['https://images.unsplash.com/photo-1610945265064-0e34e55182fa?w=800'],
        variants: [
          { color: 'Titanium Black', storage: '256GB', ram: '12GB', sku: 'SGS24U-256-BLK', price: 129999, discountPrice: 124999, stock: 15, images: [] },
          { color: 'Titanium Gray', storage: '512GB', ram: '12GB', sku: 'SGS24U-512-GRY', price: 144999, discountPrice: 139999, stock: 8, images: [] },
        ],
        basePrice: 129999,
        discountPrice: 124999,
        gstRate: 18,
        warranty: '1 Year Manufacturer Warranty',
        returnPolicy: '7 days return policy',
        deliveryCharges: 0,
        emiAvailable: true,
        emiOptions: [6, 9, 12],
        specifications: [
          { label: 'Display', value: '6.8" Dynamic AMOLED 2X' },
          { label: 'Processor', value: 'Snapdragon 8 Gen 3' },
          { label: 'Battery', value: '5000mAh' },
        ],
        isFeatured: true,
        isTrending: true,
        totalStock: 23,
        averageRating: 4.8,
        reviewCount: 156,
        soldCount: 89,
      },
      {
        name: 'Apple iPhone 15 Pro Max',
        slug: 'apple-iphone-15-pro-max',
        description: 'Titanium design, A17 Pro chip, and the most powerful iPhone camera system ever.',
        shortDescription: 'Pro Max with A17 Pro and titanium design',
        category: mobilesCat._id,
        brand: apple._id,
        images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800'],
        variants: [
          { color: 'Natural Titanium', storage: '256GB', ram: '8GB', sku: 'IP15PM-256-NAT', price: 159900, discountPrice: 154900, stock: 12, images: [] },
          { color: 'Blue Titanium', storage: '512GB', ram: '8GB', sku: 'IP15PM-512-BLU', price: 179900, discountPrice: 174900, stock: 6, images: [] },
        ],
        basePrice: 159900,
        discountPrice: 154900,
        gstRate: 18,
        warranty: '1 Year Apple Warranty',
        emiAvailable: true,
        emiOptions: [6, 12, 18],
        specifications: [
          { label: 'Display', value: '6.7" Super Retina XDR' },
          { label: 'Chip', value: 'A17 Pro' },
          { label: 'Camera', value: '48MP Main + 12MP Ultra Wide + 12MP Telephoto' },
        ],
        isFeatured: true,
        isTrending: true,
        totalStock: 18,
        averageRating: 4.9,
        reviewCount: 234,
        soldCount: 112,
      },
      {
        name: 'OnePlus 12R',
        slug: 'oneplus-12r',
        description: 'Snapdragon 8 Gen 2, 5500mAh battery, and 100W SUPERVOOC charging.',
        shortDescription: 'Performance flagship with 100W charging',
        category: mobilesCat._id,
        brand: oneplus._id,
        images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'],
        variants: [
          { color: 'Cool Blue', storage: '128GB', ram: '8GB', sku: 'OP12R-128-BLU', price: 39999, discountPrice: 36999, stock: 25, images: [] },
          { color: 'Iron Gray', storage: '256GB', ram: '12GB', sku: 'OP12R-256-GRY', price: 44999, discountPrice: 41999, stock: 20, images: [] },
        ],
        basePrice: 39999,
        discountPrice: 36999,
        flashSalePrice: 34999,
        flashSaleEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        gstRate: 18,
        emiAvailable: true,
        isFeatured: true,
        totalStock: 45,
        averageRating: 4.6,
        reviewCount: 89,
        soldCount: 156,
      },
      {
        name: 'boAt Airdopes 141',
        slug: 'boat-airdopes-141',
        description: 'True wireless earbuds with 42H total playback, ENx tech, and IPX4 rating.',
        shortDescription: 'TWS with 42H playback',
        category: accessoriesCat._id,
        brand: boat._id,
        images: ['https://images.unsplash.com/photo-1590658268037-6af12165ae66?w=800'],
        variants: [
          { color: 'Active Black', sku: 'BA141-BLK', price: 1299, discountPrice: 999, stock: 100, images: [] },
        ],
        basePrice: 1299,
        discountPrice: 999,
        gstRate: 18,
        totalStock: 100,
        averageRating: 4.3,
        reviewCount: 567,
        soldCount: 890,
        isTrending: true,
      },
      {
        name: 'Samsung 25W Fast Charger',
        slug: 'samsung-25w-fast-charger',
        description: 'Official Samsung 25W Super Fast Charging adapter with USB-C cable.',
        category: createdCategories.find((c) => c.slug === 'chargers')!._id,
        brand: samsung._id,
        images: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800'],
        variants: [{ color: 'White', sku: 'SAM-25W-WHT', price: 1499, discountPrice: 1199, stock: 50, images: [] }],
        basePrice: 1499,
        discountPrice: 1199,
        gstRate: 18,
        totalStock: 50,
        averageRating: 4.5,
        reviewCount: 123,
        soldCount: 234,
      },
      {
        name: 'Ambrane 10000mAh Power Bank',
        slug: 'ambrane-10000mah-powerbank',
        description: '10000mAh lithium polymer power bank with 22.5W fast charging.',
        category: createdCategories.find((c) => c.slug === 'power-banks')!._id,
        brand: createdBrands.find((b) => b.slug === 'ambrane')!._id,
        images: ['https://images.unsplash.com/photo-1609091839311-9a442f630e65?w=800'],
        variants: [{ color: 'Black', sku: 'AMB-PB10K-BLK', price: 999, discountPrice: 799, stock: 75, images: [] }],
        basePrice: 999,
        discountPrice: 799,
        gstRate: 18,
        totalStock: 75,
        averageRating: 4.2,
        reviewCount: 89,
        soldCount: 167,
      },
    ];

    const products = await Product.insertMany(productData);

    await Banner.insertMany([
      {
        title: 'Galaxy S24 Ultra Launch',
        subtitle: 'Get ₹5000 off + Free Galaxy Buds',
        image: 'https://images.unsplash.com/photo-1610945265064-0e34e55182fa?w=1200',
        link: '/products/samsung-galaxy-s24-ultra',
        buttonText: 'Shop Now',
        position: 'hero',
        sortOrder: 1,
        isActive: true,
      },
      {
        title: 'iPhone 15 Pro Max',
        subtitle: 'Exchange offer up to ₹15000',
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200',
        link: '/products/apple-iphone-15-pro-max',
        buttonText: 'Buy Now',
        position: 'hero',
        sortOrder: 2,
        isActive: true,
      },
      {
        title: 'Accessories Sale',
        subtitle: 'Up to 60% off on all accessories',
        image: 'https://images.unsplash.com/photo-1590658268037-6af12165ae66?w=1200',
        link: '/categories/mobile-accessories',
        buttonText: 'Explore',
        position: 'promo',
        sortOrder: 1,
        isActive: true,
      },
    ]);

    await Coupon.create({
      code: 'MOBI500',
      description: 'Flat ₹500 off on orders above ₹5000',
      discountType: 'fixed',
      discountValue: 500,
      minOrderAmount: 5000,
      usageLimit: 100,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isActive: true,
    });

    await Coupon.create({
      code: 'WELCOME10',
      description: '10% off for new customers',
      discountType: 'percentage',
      discountValue: 10,
      minOrderAmount: 1000,
      maxDiscount: 2000,
      usageLimit: 500,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
    });

    await Offer.create({
      title: 'Flash Sale - OnePlus 12R',
      description: 'Limited time offer on OnePlus 12R',
      discountType: 'fixed',
      discountValue: 5000,
      products: [products[2]._id],
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      isFlashSale: true,
    });

    await Settings.create({
      shopName: 'MobiStore',
      shopDescription: 'Your trusted mobile shop for smartphones, accessories, and more.',
      shopAddress: '123 MG Road, Bangalore, Karnataka - 560001',
      shopPhone: '+91 9876543210',
      shopEmail: 'contact@mobistore.com',
      gstin: '29AABCU9603R1ZX',
      socialLinks: {
        facebook: 'https://facebook.com/mobistore',
        instagram: 'https://instagram.com/mobistore',
        whatsapp: '919876543210',
      },
      storeTimings: 'Mon-Sat: 10:00 AM - 9:00 PM, Sun: 11:00 AM - 7:00 PM',
      seo: {
        metaTitle: 'MobiStore - Best Mobile Shop Online',
        metaDescription: 'Buy latest smartphones, accessories, and gadgets at best prices.',
        metaKeywords: ['mobile shop', 'smartphones', 'accessories', 'online mobile store'],
      },
      chat: {
        enabled: true,
        autoReplyEnabled: true,
        whatsappNumber: '919876543210',
        adminOnline: true,
      },
      cms: {
        aboutUs: '<h2>About MobiStore</h2><p>We are a leading mobile retail store serving customers since 2010.</p>',
        privacyPolicy: '<h2>Privacy Policy</h2><p>We respect your privacy and protect your personal data.</p>',
        termsConditions: '<h2>Terms & Conditions</h2><p>By using our website, you agree to our terms.</p>',
        refundPolicy: '<h2>Refund Policy</h2><p>7-day return policy on eligible products.</p>',
        faq: [
          { question: 'What payment methods do you accept?', answer: 'We accept Razorpay, UPI, Cards, and COD.' },
          { question: 'What is the delivery time?', answer: 'Standard delivery takes 2-5 business days.' },
          { question: 'Do you offer warranty?', answer: 'Yes, all products come with manufacturer warranty.' },
        ],
      },
    });

    await DeliveryZone.create([
      { name: 'Bangalore Metro', pincodes: ['560001', '560002', '560003', '560004', '560005'], charge: 0, estimatedDays: 1 },
      { name: 'Karnataka', pincodes: ['560*'], charge: 49, estimatedDays: 2 },
      { name: 'Rest of India', pincodes: [], charge: 99, estimatedDays: 5 },
    ]);

    await Supplier.create([
      { name: 'Samsung India Distributor', contactPerson: 'Raj Kumar', phone: '9876500001', email: 'raj@samsung-dist.com' },
      { name: 'Apple Authorized Reseller', contactPerson: 'Priya Sharma', phone: '9876500002', email: 'priya@apple-res.com' },
    ]);

    const order = await Order.create({
      orderNumber: 'MSDEMO001',
      user: customer._id,
      items: [{
        product: products[3]._id,
        name: products[3].name,
        image: products[3].images[0],
        quantity: 2,
        price: 999,
        gstRate: 18,
        gstAmount: 359.64,
        total: 2357.64,
      }],
      shippingAddress: customer.addresses[0],
      subtotal: 1998,
      discount: 0,
      shippingCharges: 0,
      cgst: 179.82,
      sgst: 179.82,
      totalGst: 359.64,
      total: 2357.64,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      orderStatus: 'delivered',
      deliveryOtp: '1234',
      deliveredAt: new Date(),
      trackingUpdates: [
        { status: 'pending', message: 'Order placed', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
        { status: 'confirmed', message: 'Order confirmed', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
        { status: 'shipped', message: 'Order shipped', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { status: 'delivered', message: 'Order delivered', timestamp: new Date() },
      ],
    });

    const chat = await Chat.create({
      customer: customer._id,
      assignedTo: staff._id,
      subject: 'Product Inquiry',
      product: products[0]._id,
      status: 'open',
      lastMessage: 'Is the Galaxy S24 Ultra available in Titanium Gray 512GB?',
      lastMessageAt: new Date(),
      unreadAdmin: 0,
      isBot: false,
    });

    await Message.insertMany([
      {
        chat: chat._id,
        sender: customer._id,
        senderRole: 'customer',
        content: 'Hi, I want to know about Samsung Galaxy S24 Ultra availability.',
        messageType: 'text',
        isRead: true,
      },
      {
        chat: chat._id,
        sender: staff._id,
        senderRole: 'admin',
        content: 'Hello! Yes, we have Galaxy S24 Ultra in stock. Titanium Gray 512GB is available.',
        messageType: 'text',
        isRead: true,
      },
      {
        chat: chat._id,
        sender: customer._id,
        senderRole: 'customer',
        content: 'Is the Galaxy S24 Ultra available in Titanium Gray 512GB?',
        messageType: 'text',
        isRead: false,
      },
    ]);

    await Review.create({
      product: products[3]._id,
      user: customer._id,
      rating: 5,
      title: 'Great sound quality!',
      comment: 'Amazing earbuds at this price point. Battery life is excellent.',
      isVerifiedPurchase: true,
    });

    await Notification.create({
      user: customer._id,
      title: 'Order Delivered',
      message: `Your order #${order.orderNumber} has been delivered successfully.`,
      type: 'delivery',
      link: `/account/orders/${order.orderNumber}`,
    });

    customer.wishlist.push(products[0]._id, products[1]._id);
    await customer.save();

    console.log('\n✅ Seed completed successfully!\n');
    console.log('Demo Accounts:');
    console.log('  Admin:    admin@mobistore.com / Admin@123');
    console.log('  Customer: customer@demo.com / Customer@123');
    console.log('  Staff:    staff@mobistore.com / Staff@123');
    console.log(`\n  Products: ${products.length}`);
    console.log(`  Categories: ${createdCategories.length}`);
    console.log(`  Brands: ${createdBrands.length}\n`);

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
