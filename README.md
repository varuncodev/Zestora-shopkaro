<<<<<<< HEAD
# Zestora-shopkaro
"affordable," "premium," "handcrafted"
=======
# 🛍️ ShopKaro — Full Stack E-Commerce Platform

> React · Node.js · MongoDB · Stripe · JWT · Redux · Cloudinary

---

## 📁 Project Structure

```
ecommerce/
├── server/          ← Node.js + Express backend
│   ├── config/      ← MongoDB, Cloudinary setup
│   ├── controllers/ ← Auth, Product, Order, Stripe, Admin logic
│   ├── middleware/  ← JWT auth, error handler
│   ├── models/      ← User, Product, Order schemas
│   ├── routes/      ← All API routes
│   └── utils/       ← Token generation, email, seeder
│
└── client/          ← React frontend
    └── src/
        ├── api/     ← Axios with auto JWT refresh
        ├── components/ ← Navbar, ProductCard, CheckoutForm
        ├── pages/   ← All user + admin pages
        └── store/   ← Redux slices (auth, cart, product, order)
```

---

## ⚡ QUICK SETUP (Step by Step)

### STEP 1 — Prerequisites

Install these if you don't have them:
- **Node.js** v18+ → https://nodejs.org
- **Git** → https://git-scm.com
- A code editor (VS Code recommended)

---

### STEP 2 — MongoDB Atlas (Free Cloud DB)

1. Go to → https://www.mongodb.com/atlas
2. Create free account → Create free cluster (M0)
3. **Database Access** → Add user → username + password (save these!)
4. **Network Access** → Add IP → "Allow Access from Anywhere" (0.0.0.0/0)
5. Click **Connect** → "Connect your application" → Copy the URI

   It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`

   Change it to: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ecommerce`

---

### STEP 3 — Stripe Account (Payments)

1. Go to → https://stripe.com → Create account
2. Dashboard → **Developers** → **API Keys**
3. Copy **Publishable key** (pk_test_...) → goes in client `.env`
4. Copy **Secret key** (sk_test_...) → goes in server `.env`
5. For webhooks (local testing):
   ```bash
   # Install Stripe CLI
   stripe listen --forward-to localhost:5000/api/payments/webhook
   # Copy the webhook signing secret (whsec_...) → server .env
   ```

---

### STEP 4 — Cloudinary (Image Uploads)

1. Go to → https://cloudinary.com → Free account
2. Dashboard → Copy: **Cloud name**, **API Key**, **API Secret**

---

### STEP 5 — Gmail App Password (Emails)

1. Go to → https://myaccount.google.com/security
2. Enable **2-Step Verification**
3. Search "App passwords" → Create one named "ShopKaro"
4. Copy the 16-char password

---

### STEP 6 — Configure Environment Variables

**Server** — copy `.env.example` to `.env` and fill in:
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://youruser:yourpass@cluster0.xxxxx.mongodb.net/ecommerce
JWT_SECRET=any_long_random_string_like_xj92kQmP7vL
JWT_REFRESH_SECRET=another_long_random_string_aBc3dEf
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM=ShopKaro <yourgmail@gmail.com>
CLIENT_URL=http://localhost:3000
```

**Client** — copy `.env.example` to `.env`:
```bash
cd ../client
cp .env.example .env
```

Edit `client/.env`:
```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
REACT_APP_API_URL=http://localhost:5000/api
```

---

### STEP 7 — Install Dependencies

Open **two terminals**:

**Terminal 1 (Backend):**
```bash
cd server
npm install
```

**Terminal 2 (Frontend):**
```bash
cd client
npm install
```

---

### STEP 8 — Seed Sample Data

In the server terminal:
```bash
npm run seed
```

This creates:
- **10 products** (phones, books, clothes, etc.)
- **3 users** ready to use:

| Role  | Email              | Password    |
|-------|--------------------|-------------|
| Admin | admin@shop.com     | password123 |
| User  | rahul@test.com     | password123 |
| User  | priya@test.com     | password123 |

---

### STEP 9 — Start the App

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```
→ Server running on http://localhost:5000

**Terminal 2 (Frontend):**
```bash
cd client
npm start
```
→ App opens at http://localhost:3000

---

## 🧪 Test Stripe Payment

Use this test card on the checkout page:
```
Card Number:  4242 4242 4242 4242
Expiry:       12/26
CVV:          123
ZIP:          Any 5 digits
```

---

## 🗺️ All Routes

### Frontend
| Route              | Description            | Access   |
|--------------------|------------------------|----------|
| /                  | Home page              | Public   |
| /products          | Product listing + filter | Public |
| /products/:id      | Product detail + reviews | Public |
| /cart              | Cart page              | Public   |
| /login             | Login                  | Public   |
| /register          | Register               | Public   |
| /checkout          | Checkout + Stripe      | User     |
| /orders            | Order history          | User     |
| /orders/:id        | Order detail           | User     |
| /profile           | Edit profile           | User     |
| /admin             | Admin dashboard        | Admin    |
| /admin/products    | Product CRUD           | Admin    |
| /admin/orders      | Order management       | Admin    |
| /admin/users       | User management        | Admin    |

### Backend API
| Method | Route                              | Access |
|--------|------------------------------------|--------|
| POST   | /api/auth/register                 | Public |
| POST   | /api/auth/login                    | Public |
| POST   | /api/auth/refresh                  | Public |
| GET    | /api/auth/me                       | User   |
| GET    | /api/products                      | Public |
| GET    | /api/products/:id                  | Public |
| POST   | /api/products                      | Admin  |
| PUT    | /api/products/:id                  | Admin  |
| DELETE | /api/products/:id                  | Admin  |
| POST   | /api/orders                        | User   |
| GET    | /api/orders/my                     | User   |
| PUT    | /api/orders/:id/pay                | User   |
| PUT    | /api/orders/:id/ship               | Admin  |
| POST   | /api/payments/create-payment-intent| User   |
| POST   | /api/payments/webhook              | Stripe |
| GET    | /api/admin/dashboard               | Admin  |
| GET    | /api/admin/orders                  | Admin  |
| GET    | /api/admin/users                   | Admin  |

---

## 🚀 Deployment

### Frontend → Vercel (Free)
1. Push to GitHub
2. Go to vercel.com → Import project → Select `client` folder
3. Add env vars: `REACT_APP_STRIPE_PUBLISHABLE_KEY` and `REACT_APP_API_URL`
4. Deploy!

### Backend → Render (Free)
1. Go to render.com → New Web Service → Select `server` folder
2. Build command: `npm install`
3. Start command: `node server.js`
4. Add all environment variables from `.env`
5. Deploy!

### Update CORS
After deploy, update `CLIENT_URL` in Render env vars to your Vercel URL.

---

## 🎯 Resume Bullet Points

```
• Built full-stack e-commerce platform (React/Node.js/MongoDB) with Stripe payment
  integration, JWT authentication, and role-based admin dashboard

• Implemented Redux Toolkit for cart state management with localStorage persistence,
  supporting guest-to-user cart merge on login

• Integrated Stripe PaymentIntent API with webhook handlers for real-time order
  status updates and automated email confirmations via Nodemailer

• Built admin dashboard with product CRUD, inventory tracking (low-stock alerts),
  order management, and sales analytics using Recharts

• Implemented server-side pagination, MongoDB full-text search, and dynamic category
  + price filters across 200+ product listings

• Deployed frontend on Vercel and backend on Render with JWT refresh token rotation
  and environment-separated configs for dev/prod
```

---

## 💬 Common Interview Questions

**Q: How does JWT auth work here?**
A: User logs in → server returns access token (15min) + refresh token (7 days). Access token sent in every API request header. When it expires, Axios interceptor automatically calls /auth/refresh with the refresh token to get a new pair. No manual login needed.

**Q: How does Stripe payment work?**
A: 1) Frontend calls our backend to create a PaymentIntent. 2) Backend creates it via Stripe SDK and returns `clientSecret`. 3) Frontend uses `stripe.confirmCardPayment(clientSecret)` with card details. 4) Stripe sends a webhook event `payment_intent.succeeded` to our server. 5) Server marks order as paid and sends confirmation email.

**Q: What is Redux Persist used for?**
A: Cart and auth state are persisted to localStorage so users don't lose their cart on page refresh, and don't need to re-login on every visit.

**Q: How did you handle role-based access?**
A: Users have a `role` field (user/admin) in MongoDB. Backend has `isAdmin` middleware that checks `req.user.role`. Frontend has `<AdminRoute>` component that checks Redux auth state and redirects non-admins.
>>>>>>> 4677c6eb (added cart and payment stripe setup)
