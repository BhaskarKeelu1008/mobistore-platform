# MobiStore Platform

MobiStore Platform is a modern full-stack mobile shop e-commerce solution designed for mobile stores to create and manage their own online storefront with advanced admin management, inventory tracking, billing, payments, customer chat, and analytics.

---

## 🚀 Features

### Customer Website

* Responsive modern UI
* Product browsing & search
* Categories & filters
* Cart & wishlist
* Checkout & online payments
* Order tracking
* Customer authentication
* Reviews & ratings
* WhatsApp integration
* Live customer chat

### Admin Panel

* Dashboard analytics
* Product management
* Inventory management
* Order management
* Customer management
* Billing & invoice generation
* Banner & CMS management
* Theme customization
* Coupon & offer management
* Sales reports

### Additional Features

* Razorpay payment gateway
* Cloudinary image upload
* JWT authentication
* Role-based access
* SEO optimization
* Mobile-first design
* Dark/Light mode
* REST APIs
* Deployment-ready setup

---

## 🛠️ Tech Stack

### Frontend

* Next.js 15
* TypeScript
* Tailwind CSS
* ShadCN UI
* Zustand / Redux Toolkit

### Backend

* Node.js
* Express.js
* TypeScript

### Database

* MongoDB Atlas

### Deployment

* Vercel (Frontend)
* Render / Railway (Backend)
* MongoDB Atlas (Database)
* Cloudinary (Image Storage)

---

## 📁 Project Structure

```bash
mobistore-platform/
│
├── client/                 # Frontend Application
├── server/                 # Backend APIs
├── docs/                   # Documentation
├── public/                 # Static Assets
├── scripts/                # Utility Scripts
└── README.md
```

---

## ⚙️ Environment Variables

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_RAZORPAY_KEY=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
```

### Backend (.env)

```env
PORT=
MONGODB_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
FRONTEND_URL=
```

---

## 📦 Installation

### Clone Repository

```bash
git clone <repository-url>
cd mobistore-platform
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

### Backend Setup

```bash
cd server
npm install
npm run dev
```

---

## 🧩 Core Modules

* Authentication System
* Product Management
* Category Management
* Inventory Management
* Billing & Invoice System
* Order Management
* Payment Gateway
* Customer Chat System
* Notification System
* Analytics Dashboard
* CMS & Theme Management

---

## 🔐 Authentication

* JWT Authentication
* Refresh Token Support
* Role-Based Access Control
* Protected Routes
* Secure API Middleware

---

## 💳 Payment Integration

Integrated with:

* Razorpay
* UPI Payments
* Credit/Debit Cards
* COD Support

---

## ☁️ Deployment

### Frontend Deployment

Deploy frontend using Vercel Free Tier.

### Backend Deployment

Deploy backend using Render or Railway Free Tier.

### Database

Use MongoDB Atlas Free Cluster.

### Image Uploads

Use Cloudinary Free Tier.

---

## 📊 Admin Dashboard

Dashboard includes:

* Total Revenue
* Orders
* Customers
* Sales Graphs
* Top Products
* Inventory Reports
* Order Analytics

---

## 📱 Responsive Design

Fully optimized for:

* Mobile Devices
* Tablets
* Desktop Screens

---

## 🔥 Future Enhancements

* PWA Support
* Multi-vendor Support
* AI Chatbot
* Delivery Partner Integration
* Mobile App Version
* Advanced Analytics

---

## 📄 License

This project is intended for educational, client POC, and commercial customization purposes.

---

## 👨‍💻 Developed With

Built using modern MERN stack architecture and scalable production-ready practices.
