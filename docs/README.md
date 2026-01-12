# LeboLink E-Labour Software

A professional, mobile-first platform connecting local labour workers with customers and employers. 30-minute labour delivery guarantee. Built with Next.js 14 frontend and NestJS backend.

## 🚀 Quick Start

### Option 1: Development Mode (Recommended)
```bash
npm run dev
```
This starts both API and Web servers in development mode with hot-reload.

### Option 2: Production Mode
```bash
npm run start
```
This runs both API and Web servers in production mode (requires build first).

### Individual Server Commands
```bash
# Start API only (port 3001)
npm run dev:api

# Start Web only (port 3000)
npm run dev:web

# Build both
npm run build

# Start after build
npm run start:api
npm run start:web
```

## 📋 Project Structure
## 📋 Project Structure
- **apps/web** - Next.js 14 frontend with Tailwind, Framer Motion, Zustand, React Query, PWA
- **apps/api** - NestJS backend with MongoDB (in-memory), Mongoose, JWT auth, OTP
- **packages/shared** - Shared TypeScript types
- **infra** - Dockerfiles and docker-compose

## 🌐 Access Points
- **Web Frontend**: http://localhost:3000
- **API Server**: http://localhost:3001 (default) • http://localhost:3002 (VS Code task)
- **API Docs**: http://localhost:3001/docs (default) • http://localhost:3002/docs (task)

## ✨ Features
- ✅ 30-minute labour delivery guarantee
- ✅ OTP-based authentication
- ✅ Location-based worker discovery
- ✅ Service booking with location types (Home, Office, Friends & Family, Other)
- ✅ Receiver details for non-home deliveries
- ✅ Professional e-commerce UI (Flipkart, Uber, Swiggy style)
- ✅ Real-time search and filtering
- ✅ Rating and review system
- ✅ PWA support with offline mode

## 📚 Prerequisites
- Node.js 18+ (required)
- npm 9+ (comes with Node.js)
- Optional: Docker & Docker Compose for external services

## 🔧 Environment Setup
Copy environment files:
```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
```
Then set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in `apps/web/.env.local`.
Set payments and database envs:
- `MONGO_URI=mongodb://localhost:27017/lebolink` (for external MongoDB)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` in `apps/api/.env`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `apps/web/.env.local`

## 📊 Database Setup (Optional)
The API uses in-memory MongoDB by default. For persistent storage via Docker:
```bash
# Start MongoDB, Mongo Express, and optional Redis
docker-compose up -d

# Then set environment
export MONGO_URI="mongodb://localhost:27017/lebolink"

# Initialize database with indexes and seed data
npm run -w apps/api db:seed

# Reset database (drop all collections)
npm run -w apps/api db:reset
```
- **MongoDB**: http://localhost:27017
- **Mongo Express (GUI)**: http://localhost:8081 (admin/pass)
- **Redis** (optional): localhost:6379

## 📦 Installation
```bash
# Install all dependencies
npm install
```

## 🎯 Usage

### 1. Login/Authentication
- Enter 10-digit phone number
- Verify with OTP (dev OTP shown in amber box)
- Redirects to home page after verification

### 2. Browse Workers
- See 30+ workers available in your area
- Search by name or skill
- Filter by category (Electrician, Plumber, Cleaner, etc.)

### 3. Book Service
- Click "Book Now" on any worker card
- Enter your details (name, phone, address)
- Choose location type (Home, Office, Friends & Family, Other)
- If not Home/Office, add receiver details (name, phone, relation)
- Confirm booking

### 4. Manage Bookings (Customers)
- View active and past bookings
- Cancel requested bookings
- Review and rate completed work

### 5. View Worker Jobs (Workers)
- See available job requests
- Accept jobs or schedule for later
- Track booking progress with map view

### 6. Profile Management
- View booking history and earnings
- Check ratings and reviews
- Manage notifications and settings

## 🏗️ Architecture

### Frontend Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS 3.4+
- **State**: Zustand (global) + React Query (server)
- **Animation**: Framer Motion
- **Maps**: Google Maps via @react-google-maps/api
- **Payments**: Stripe Elements (card/UPI) with COD fallback
- **PWA**: next-pwa

### Backend Stack
- **Framework**: NestJS 10
- **Database**: MongoDB (in-memory via mongodb-memory-server by default)
- **ODM**: Mongoose 8.4
- **Auth**: OTP-based (JWT ready)
- **Rate Limiting**: @nestjs/throttler
- **API Docs**: Swagger/OpenAPI
- **Payments**: Stripe Payment Intents + webhook; COD supported
- **Health Check**: `/api/v1/system/health` endpoint

## 🗄️ Database
- **Default**: In-memory MongoDB (mongodb-memory-server) - zero setup required
- **Persistent**: Docker Compose available for MongoDB, Mongo Express, optional Redis
- **Collections**: Users, Workers, Jobs, Bookings, Payments, Reviews
- **Indexes**: Optimized indexes on users (role, name, skills, location), bookings (customerId, workerId, status), payments (bookingId, status+createdAt)

## 🔐 Authentication
- OTP-based login (6-digit code)
- 15-minute OTP validity
- JWT token storage (dev implementation)
- AuthContext for global user state
- Protected routes with ProtectedRoute component

## 📝 API Endpoints

### Authentication
- `POST /api/v1/auth/send-otp` - Send OTP to phone
- `POST /api/v1/auth/verify-otp` - Verify OTP and login

### Users
- `GET /api/v1/users/:id` - Get user profile

## 🤝 Contributing
1. Create a feature branch
2. Make your changes
3. Test locally with `npm run dev`
4. Build with `npm run build`

## 📄 License
All rights reserved - LeboLink E-Labour Software

## 🆘 Troubleshooting

### Port Already in Use
If you get "EADDRINUSE" error:
```bash
# Kill all Node processes
taskkill /F /IM node.exe
# Then retry
npm run dev
```

### MongoDB Connection Issues
The app uses in-memory MongoDB via mongodb-memory-server, so no external setup needed.

### Slow Performance
Make sure you're running on the latest Node.js (v18+):
```bash
node --version
```
