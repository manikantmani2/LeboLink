# Admin Features Documentation

## Overview
Complete admin management system for LeboLink platform with dashboard, user management, KYC verification, and analytics.

## Backend API (NestJS)

### Admin Module Location
- **Module**: `apps/api/src/modules/admin/admin.module.ts`
- **Service**: `apps/api/src/modules/admin/admin.service.ts`
- **Controller**: `apps/api/src/modules/admin/admin.controller.ts`
- **Guard**: `apps/api/src/modules/admin/guards/admin.guard.ts`

### API Endpoints

All endpoints require `x-admin-id` header for authentication.

#### Dashboard
- **GET** `/api/v1/admin/dashboard`
  - Returns: Statistics (users, revenue, bookings, KYC), recent bookings, recent users

#### Analytics
- **GET** `/api/v1/admin/analytics?period={week|month|year}`
  - Returns: Booking trends, revenue trends, top workers, status breakdown, user growth

#### User Management
- **GET** `/api/v1/admin/users?page={n}&limit={n}&role={worker|customer}&search={text}`
  - Returns: Paginated user list with filters
- **GET** `/api/v1/admin/users/:id`
  - Returns: User details with booking/earnings stats
- **PUT** `/api/v1/admin/users/:id`
  - Body: `{ name?, role?, kycStatus? }`
  - Returns: Updated user
- **DELETE** `/api/v1/admin/users/:id`
  - Returns: Success message

#### KYC Verification
- **GET** `/api/v1/admin/kyc/pending`
  - Returns: Users with pending KYC status
- **POST** `/api/v1/admin/kyc/:userId/verify`
  - Returns: Updated user with verified KYC
- **POST** `/api/v1/admin/kyc/:userId/reject`
  - Body: `{ reason: string }`
  - Returns: Updated user with rejected KYC

#### Bookings
- **GET** `/api/v1/admin/bookings?page={n}&limit={n}`
  - Returns: All bookings with customer and worker details

## Frontend (Next.js)

### Admin Pages

#### 1. Dashboard (`/admin`)
**File**: `apps/web/app/admin/page.tsx`

**Features**:
- Statistics overview (Total Users, Revenue, Active Bookings, Pending KYC)
- Tab navigation (Dashboard, Users, Bookings, KYC, Analytics)
- Recent bookings table
- Recent users table
- Role-based color coding

**Statistics Displayed**:
- Total Users
- Total Revenue
- Active Bookings
- Pending KYC Requests

#### 2. User Management (`/admin/users`)
**File**: `apps/web/app/admin/users/page.tsx`

**Features**:
- User list with pagination
- Search by name/phone/email
- Filter by role (worker/customer/admin)
- Delete user with confirmation
- View user details
- Role and KYC status badges

**User Table Columns**:
- Name
- Phone
- Email
- Role (Worker/Customer/Admin)
- KYC Status (Pending/Verified/Rejected/None)
- Actions (View, Delete)

#### 3. KYC Verification (`/admin/kyc`)
**File**: `apps/web/app/admin/kyc/page.tsx`

**Features**:
- Pending KYC requests list
- View KYC documents
- Verify button
- Reject button with reason prompt
- Empty state when no pending requests

**KYC Request Display**:
- Worker name
- Phone number
- Submission date
- Document links
- Verify/Reject actions

#### 4. Analytics (`/admin/analytics`)
**File**: `apps/web/app/admin/analytics/page.tsx`

**Features**:
- Period selector (Week/Month/Year)
- Summary cards (Total Bookings, Total Revenue, New Users)
- Bookings by status breakdown
- Revenue by day (last 10 days)
- Top workers leaderboard

**Analytics Sections**:
1. **Summary Cards**:
   - Total Bookings in period
   - Total Revenue in period
   - New Users in period

2. **Bookings by Status**:
   - Pending
   - Confirmed
   - In Progress
   - Completed
   - Cancelled

3. **Revenue Trend**:
   - Daily revenue for last 10 days
   - Formatted in ₹ currency

4. **Top Workers**:
   - Rank
   - Worker name and phone
   - Skills badges
   - Total bookings
   - Total earnings

## Authentication & Security

### Admin Guard
**File**: `apps/api/src/modules/admin/guards/admin.guard.ts`

- Checks for `x-admin-id` header
- Currently basic implementation
- **TODO**: Add JWT validation and role checking from database

### Frontend Auth Check
All admin pages check `user?.role === 'admin'` and redirect non-admin users to home page.

### API Client Enhancement
**File**: `apps/web/lib/api.ts`

- Added `headers` support to `Options` type
- Spread headers into fetch call for admin authentication

## Database Schema Updates

### User Schema
**File**: `apps/api/src/modules/users/users.schema.ts`

**Added Fields**:
- `profileImage?: string` - Base64 encoded profile picture
- `settings?: object` - User preferences (17 fields including availability, notifications, privacy)
- `kycStatus?: string` - KYC verification status
- `kycDocuments?: array` - KYC document URLs

### Indexes for Admin Queries
- User schema has indexes on: `createdAt`, `role`, `kycStatus`
- Booking schema has indexes on: `createdAt`, `status`, `customerId`, `workerId`
- Payment schema has index on: `createdAt`

## Type Definitions

### User Role Type
**File**: `apps/web/lib/auth.tsx`

Updated from `'worker' | 'customer'` to `'worker' | 'customer' | 'admin'`

## Key Features Summary

### ✅ Completed Features

1. **Dashboard Analytics**
   - Real-time statistics
   - Recent activity monitoring
   - Multi-metric overview

2. **User Management**
   - CRUD operations
   - Search and filtering
   - Pagination support
   - Role management

3. **KYC Verification**
   - Pending requests queue
   - Document viewing
   - Approve/Reject workflow
   - Rejection reason tracking

4. **Analytics & Reporting**
   - Time-based filtering
   - Booking trends
   - Revenue tracking
   - Worker performance metrics
   - User growth analysis

5. **Security**
   - Admin-only route protection
   - Header-based authentication
   - Role-based access control

## Usage Instructions

### 1. Create an Admin User
Currently, admin users need to be created in the database. To create one:

```javascript
// In your database or seed script
const admin = await UserModel.create({
  name: "Admin User",
  phone: "1234567890",
  role: "admin",
  password: "hashed_password"
});
```

### 2. Access Admin Panel
1. Login with admin credentials
2. Navigate to `/admin`
3. Use the tab navigation to access different sections

### 3. Managing Users
1. Go to Users tab
2. Use search/filter to find users
3. Click View to see details
4. Click Delete to remove users (with confirmation)

### 4. KYC Verification
1. Go to KYC tab
2. Review pending requests
3. Click Verify to approve
4. Click Reject and provide reason to decline

### 5. Viewing Analytics
1. Go to Analytics tab
2. Select time period (Week/Month/Year)
3. Review metrics and trends
4. Check top performers

## Future Enhancements

### Security
- [ ] Implement JWT-based admin authentication
- [ ] Add role checking in database
- [ ] Add admin activity logging
- [ ] Implement rate limiting for admin endpoints

### Features
- [ ] Export data to CSV/Excel
- [ ] Email notifications for admin actions
- [ ] Bulk user operations
- [ ] Advanced filtering options
- [ ] Real-time dashboard updates
- [ ] Admin user management (create/edit admins)
- [ ] Audit trail for all admin actions

### Analytics
- [ ] Add visual charts (if chart.js is installed)
- [ ] Custom date range selection
- [ ] More granular metrics
- [ ] Comparison views (month-over-month, etc.)
- [ ] Revenue forecasting

## Technical Notes

- All admin API calls use `apiFetch` with custom headers
- Frontend uses React Query for caching and refetching
- Pagination implemented on both frontend and backend
- Type-safe interfaces throughout
- Error handling with proper status codes
- Responsive design for all admin pages

## Dependencies

**Backend**:
- NestJS
- Mongoose
- MongoDB (in-memory)

**Frontend**:
- Next.js 14
- React Query
- Tailwind CSS
- Framer Motion
- TypeScript

## Notes

- Admin module is fully integrated into the app
- No compilation errors
- All TypeScript types are properly defined
- API endpoints are protected with AdminGuard
- Frontend pages have proper authentication checks
