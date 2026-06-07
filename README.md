# MobiStore Platform

Production-ready mobile shop e-commerce platform with customer website, admin panel, billing, inventory, chat, payments, and analytics.

## Project Structure

```
mobistore-platform/
├── client/          # Next.js 15 frontend (Vercel)
├── server/          # Express.js API (Render/Railway)
├── docs/            # Deployment guide & Postman collection
└── README.md
```

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, ShadCN-style UI, Zustand, TanStack Query, Framer Motion |
| Backend | Node.js, Express, TypeScript, Socket.io |
| Database | MongoDB Atlas |
| Storage | Cloudinary |
| Payments | Razorpay (UPI, Cards, COD) |

## Quick Start (Local)

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Backend

```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
npm install
npm run seed    # Seeds demo data
npm run dev     # http://localhost:5000
```

### 2. Frontend

```bash
cd client
cp .env.example .env.local
npm install
npm run dev     # http://localhost:3000
```

## Demo Accounts (after seed)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@mobistore.com | Admin@123 |
| Customer | customer@demo.com | Customer@123 |
| Staff | staff@mobistore.com | Staff@123 |

## Features

### Customer Website
- Product catalog with filters, search, voice-ready search bar
- Cart, wishlist, checkout (COD + Razorpay)
- Order tracking, account management
- Live chat widget + WhatsApp integration
- Dark/light theme, responsive design

### Admin Panel (`/admin`)
- Dashboard with revenue charts
- Products, categories, brands, orders
- Inventory management with low-stock alerts
- Customer chat management
- Banners, offers, coupons, delivery zones
- Store settings & SEO configuration

### Backend API
- REST APIs with Swagger docs at `/api/docs`
- JWT auth with refresh tokens
- Role-based access control
- Socket.io real-time chat
- GST invoicing with PDF download
- Postman collection in `docs/postman/`

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for full Vercel + Render + MongoDB Atlas setup.

## API Documentation

- Swagger UI: `http://localhost:5000/api/docs`
- Postman: Import `docs/postman/MobiStore-API.postman_collection.json`

## Environment Variables

### Server (`server/.env`)
See `server/.env.example`

### Client (`client/.env.local`)
See `client/.env.example`

## License

For educational, client POC, and commercial customization purposes.
