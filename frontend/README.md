# CampusKart — Frontend

A modern student marketplace UI built with React + Vite + Tailwind CSS.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and set your FastAPI backend URL

# 3. Start development server
npm run dev
```

Open http://localhost:5173

## ⚙️ Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=CampusKart
```

## 📁 Folder Structure

```
src/
├── components/         # Reusable UI components
│   ├── Navbar.jsx
│   ├── ListingCard.jsx
│   ├── SkeletonCard.jsx
│   ├── Modal.jsx
│   ├── EmptyState.jsx
│   ├── StatsCard.jsx
│   ├── PageHeader.jsx
│   └── OrderStatusBadge.jsx
├── pages/              # Route-level page components
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── CreateListingPage.jsx
│   ├── MyListingsPage.jsx
│   ├── OrdersPage.jsx
│   ├── AdminDashboardPage.jsx
│   ├── ListingDetailPage.jsx
│   └── NotFoundPage.jsx
├── services/
│   └── api.js          # Axios instance + all API calls
├── context/
│   └── AuthContext.jsx  # JWT auth state, login/logout/register
├── routes/
│   └── ProtectedRoute.jsx  # ProtectedRoute, AdminRoute, PublicRoute
├── layouts/
│   └── MainLayout.jsx   # Shared layout with Navbar
├── App.jsx             # Route definitions
├── main.jsx            # App entry point
└── index.css           # Tailwind + global styles
```

## 🗺️ Pages & Routes

| Route | Page | Auth |
|---|---|---|
| `/` | Marketplace | Public |
| `/login` | Login | Public (redirects if authed) |
| `/register` | Register | Public (redirects if authed) |
| `/listings/:id` | Listing Detail | Public |
| `/listings/create` | Create Listing | Authenticated |
| `/my-listings` | My Listings | Authenticated |
| `/orders` | My Orders | Authenticated |
| `/admin` | Admin Dashboard | Admin only |

## 🔌 API Endpoints Used

```
POST  /auth/register
POST  /auth/login
GET   /listings
GET   /listings/:id
POST  /listings
PUT   /listings/:id
DELETE /listings/:id
GET   /listings/me
POST  /orders
GET   /orders/me
GET   /orders           (admin)
GET   /admin/stats      (admin)
```

## 🛠️ Tech Stack

- **React 18** + **Vite 5**
- **Tailwind CSS 3** (dark theme, custom design system)
- **React Router DOM 6**
- **Axios** (with JWT interceptors)
- **Context API** (auth state)
- **react-hot-toast** (notifications)
- **Recharts** (admin charts)
- **Lucide React** (icons)
- **Google Fonts** — Playfair Display + DM Sans

## 🏗️ Build for Production

```bash
npm run build
# Output in dist/
```
