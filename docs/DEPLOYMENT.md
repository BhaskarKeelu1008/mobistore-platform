# MobiStore Platform - Deployment Guide

## Architecture

| Component | Service | Free Tier |
|-----------|---------|-----------|
| Frontend | Vercel | Yes |
| Backend API | Render / Railway | Yes |
| Database | MongoDB Atlas | Yes |
| Images | Cloudinary | Yes |
| Payments | Razorpay | Test mode free |

---

## 1. MongoDB Atlas Setup

1. Create account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a **Free M0 Cluster** (resume it if Atlas shows **Paused**)
3. **Database Access** → create a user with password (read/write on `mobistore`)
4. **Network Access** → **Add IP Address** → choose **Allow Access from Anywhere**
   - This adds `0.0.0.0/0` and is **required for Render** (Render uses changing outbound IPs; you cannot whitelist a single Render IP on the free tier)
   - Wait 1–2 minutes after saving before redeploying
5. **Database** → Connect → Drivers → copy URI:

```text
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/mobistore?retryWrites=true&w=majority
```

**If the password contains special characters** (`@`, `#`, `%`, `/`, etc.), URL-encode them in the connection string (e.g. `@` → `%40`).

### Atlas connection errors on Render

| Error | Fix |
|-------|-----|
| `MongooseServerSelectionError` / IP not whitelisted | Add `0.0.0.0/0` under **Network Access** |
| Works locally, fails on Render | Your home IP is whitelisted but Render’s is not → use `0.0.0.0/0` |
| Authentication failed | Wrong username/password in `MONGODB_URI` on Render |
| Cluster paused | Open Atlas → **Resume** the M0 cluster |

---

## 2. Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Copy Cloud Name, API Key, API Secret from dashboard

---

## 3. Razorpay Setup

1. Sign up at [razorpay.com](https://razorpay.com)
2. Use **Test Mode** keys for POC
3. Copy Key ID and Key Secret

---

## 4. Backend Deployment (Render)

### Option A: Render Web Service

1. Push code to GitHub
2. Create new **Web Service** on [render.com](https://render.com)
3. Connect repository, set:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node

4. Add Environment Variables (**use real values — not placeholders like `YOUR_CLUSTER`**):

   - Open **MongoDB Atlas → Database → Connect → Drivers**
   - Copy the full URI (hostname looks like `cluster0.ab1cd.mongodb.net` or `mobistore-cluster.w70agqh.mongodb.net`)
   - Or copy `MONGODB_URI` from your local `server/.env` (never commit that file)

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://dbuser:password@cluster0.xxxxx.mongodb.net/mobistore?retryWrites=true&w=majority
JWT_SECRET=your-long-random-secret
JWT_REFRESH_SECRET=your-long-random-refresh-secret
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
FRONTEND_URL=https://your-app.vercel.app
```

> **Common Render error:** `ENOTFOUND _mongodb._tcp.YOUR_CLUSTER.mongodb.net` means `MONGODB_URI` still contains a template hostname. Replace it with your real Atlas cluster host.

5. Deploy and note API URL: `https://your-api.onrender.com`

### Seed Database (one-time)

```bash
cd server
npm install
MONGODB_URI=your-uri npm run seed
```

---

## 5. Frontend Deployment (Vercel)

1. Import project on [vercel.com](https://vercel.com)
2. Set **Root Directory**: `client`
3. Add Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://your-api.onrender.com/api
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
NEXT_PUBLIC_RAZORPAY_KEY=rzp_test_...
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
```

4. Deploy

---

## 6. Local Development

### Terminal 1 - Backend
```bash
cd server
cp .env.example .env
# Edit .env with your values
npm install
npm run seed
npm run dev
```

### Terminal 2 - Frontend
```bash
cd client
cp .env.example .env.local
npm install
npm run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:5000
- API Docs: http://localhost:5000/api/docs

---

## 7. Demo Accounts (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mobistore.com | Admin@123 |
| Customer | customer@demo.com | Customer@123 |
| Staff | staff@mobistore.com | Staff@123 |

---

## 8. CI/CD Suggestions

- **GitHub Actions**: Run lint + build on PR
- **Vercel**: Auto-deploy on push to `main`
- **Render**: Auto-deploy backend on push to `main`

---

## 9. Production Checklist

- [ ] Change JWT secrets to strong random values
- [ ] Use Razorpay Live keys
- [ ] Restrict MongoDB IP whitelist
- [ ] Configure SMTP for emails
- [ ] Set up custom domain on Vercel
- [ ] Enable HTTPS (automatic on Vercel/Render)
