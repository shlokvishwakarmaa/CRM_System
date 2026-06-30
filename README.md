# LeadCRM - Complete Indian CRM System

A production-ready, full-stack Customer Relationship Management (CRM) system built specifically for Indian businesses. Features comprehensive lead tracking, customer management, sales pipeline, and support ticketing with Role-Based Access Control (RBAC).

## 🎯 Overview

LeadCRM is a complete CRM solution featuring:

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB + JWT Authentication
- **Indian Context**: INR currency, Indian company names, cities, and business workflows

## ✨ Key Features

### 🔐 Authentication & RBAC
- JWT-based authentication with secure HTTP-only cookies
- 4 user roles: Admin, Sales Manager, Sales Executive, Support Executive
- Role-based route protection and data access control

### 🎯 Lead Management
- Complete lead lifecycle: New → Contacted → Qualified → Meeting Scheduled → Proposal Sent → Negotiation → Won/Lost
- Lead source tracking (Website, LinkedIn, Google Ads, etc.)
- Estimated value and assignment tracking
- Advanced search and filtering

### 👥 Contact Management
- Contact directory with company information
- Import/Export functionality (CSV)
- Location-based organization
- Notes and lead source tracking

### 🏢 Customer Management
- Auto-generated customer IDs (LC-1001, LC-1002...)
- Account status tracking (Active, Onboarding, Inactive, Churned)
- Interaction history (calls, emails, meetings, notes)
- Customer journey visualization
- Revenue tracking in INR

### 💼 Opportunity Management
- Visual **Kanban pipeline board** with drag-and-drop
- Pipeline stages: Prospecting → Qualification → Proposal → Negotiation → Closed Won/Lost
- Probability tracking and weighted pipeline value
- Expected revenue in INR (Lakhs/Crores formatting)
- Closing date management

### 🎫 Support Ticket Management
- Priority levels: Low, Medium, High, Critical
- Workflow: Open → In Progress → Waiting on Customer → Resolved → Closed
- Customer association and assignment
- Comments and resolution tracking

### 📊 Dashboard & Analytics
- Real-time metrics (Active Leads, Pipeline Value, Revenue Won)
- Sales pipeline visualization
- Lead source distribution
- Team performance tracking
- Activity feed
- Indian currency formatting (₹, Lakhs, Crores)

## 🏗️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Routing**: React Router v6
- **State**: Context API
- **Data**: LocalStorage (mock backend) + Axios (for real backend)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcryptjs
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: express-validator

## 📁 Project Structure

```
leadcrm/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   ├── Layout.tsx      # Main layout with sidebar
│   │   │   └── Modal.tsx       # Modal component
│   │   ├── context/           # React Context for state
│   │   │   └── AuthContext.tsx
│   │   ├── data/              # Mock data
│   │   │   └── mockData.ts
│   │   ├── pages/             # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Leads.tsx
│   │   │   ├── Contacts.tsx
│   │   │   ├── Customers.tsx
│   │   │   ├── Opportunities.tsx
│   │   │   ├── Tickets.tsx
│   │   │   ├── UserManagement.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── Login.tsx
│   │   ├── types/             # TypeScript types
│   │   │   └── index.ts
│   │   ├── utils/             # Utility functions
│   │   │   ├── api.ts         # API layer (mock + real)
│   │   │   └── helpers.ts     # Helper functions
│   │   ├── App.tsx            # Main app component
│   │   ├── main.tsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
└── backend/                    # Node.js backend API
    ├── config/
    │   └── database.js         # MongoDB connection
    ├── controllers/            # Business logic
    │   ├── authController.js
    │   ├── leadController.js
    │   ├── contactController.js
    │   ├── customerController.js
    │   ├── opportunityController.js
    │   ├── ticketController.js
    │   └── userController.js
    ├── middleware/
    │   ├── auth.js             # JWT & RBAC middleware
    │   └── errorHandler.js
    ├── models/                 # Mongoose schemas
    │   ├── User.js
    │   ├── Lead.js
    │   ├── Contact.js
    │   ├── Customer.js
    │   ├── Opportunity.js
    │   └── Ticket.js
    ├── routes/                 # API routes
    │   ├── authRoutes.js
    │   ├── leadRoutes.js
    │   ├── contactRoutes.js
    │   ├── customerRoutes.js
    │   ├── opportunityRoutes.js
    │   ├── ticketRoutes.js
    │   └── userRoutes.js
    ├── seeders/
    │   └── seed.js             # Database seeder
    ├── .env.example
    ├── package.json
    ├── README.md
    └── server.js               # Express server
```

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- MongoDB v6 or higher (for backend)
- npm or yarn

### Option 1: Frontend Only (Mock Backend)

The frontend can run standalone with localStorage-based mock backend:

```bash
# Install frontend dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Visit `http://localhost:5173`

**Quick Demo Logins** (mock backend):
- Admin: `rajesh@leadcrm.in` / `admin123`
- Sales Manager: `priya@leadcrm.in` / `manager123`
- Sales Executive: `amit@leadcrm.in` / `executive123`
- Support Executive: `sneha@leadcrm.in` / `support123`

### Option 2: Full Stack (Frontend + Backend)

#### 1. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your MongoDB URI
# MONGODB_URI=mongodb://localhost:27017/leadcrm

# Seed database with sample data
npm run seed

# Start backend server
npm run dev
```

Backend API runs at `http://localhost:5000`

#### 2. Setup Frontend

```bash
# Navigate to root directory
cd ..

# Install frontend dependencies
npm install

# Update frontend to use real backend API
# Edit src/utils/api.ts to point to http://localhost:5000

# Start frontend development server
npm run dev
```

Frontend runs at `http://localhost:5173`

## 🔐 User Roles & Permissions

| Feature | Admin | Sales Manager | Sales Executive | Support Executive |
|---------|-------|---------------|-----------------|-------------------|
| Dashboard | ✅ Full | ✅ Full | ✅ Own Data | ✅ Support Focus |
| Leads | ✅ All | ✅ All | ✅ Assigned | ❌ |
| Contacts | ✅ All | ✅ All | ✅ All | ✅ Read Only |
| Customers | ✅ All | ✅ All | ✅ Assigned | ✅ All |
| Opportunities | ✅ All | ✅ All | ✅ Assigned | ❌ |
| Tickets | ✅ All | ❌ | ❌ | ✅ Assigned |
| User Management | ✅ | ❌ | ❌ | ❌ |
| Settings | ✅ All | ✅ Profile | ✅ Profile | ✅ Profile |

## 📊 Business Workflows

### Lead Lifecycle
```
New → Contacted → Qualified → Meeting Scheduled → 
Proposal Sent → Negotiation → Won / Lost
```

### Customer Journey
```
Website Inquiry → Lead Created → Sales Follow-Up → 
Deal Closed → Customer Onboarded → Support & Retention
```

### Support Workflow
```
Customer Complaint → Ticket Created → Assigned to Agent → 
Issue Resolved → Ticket Closed
```

## 🌍 API Endpoints

Base URL: `http://localhost:5000/api`

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user
- `PUT /auth/updatepassword` - Update password

### Resources
- `/leads` - Lead management
- `/contacts` - Contact management
- `/customers` - Customer management
- `/opportunities` - Opportunity management
- `/tickets` - Support ticket management
- `/users` - User management (Admin only)

See `backend/README.md` for complete API documentation.

## 💾 Database Models

### User
- Authentication credentials (hashed password)
- Role-based access
- Department assignment
- Active/inactive status

### Lead
- Contact information
- Lead source and status
- Estimated value
- Status history tracking
- Assignment to sales executives

### Customer
- Auto-generated customer ID
- Revenue tracking
- Account status
- Interaction history
- Assigned executive

### Opportunity
- Pipeline stage tracking
- Expected revenue & probability
- Weighted value calculation
- Stage history
- Customer association

### Ticket
- Priority and status
- Customer association
- Comments and resolution
- SLA tracking

## 🎨 UI Features

- **Dark Sidebar** with Indian tricolor branding (Orange, White, Green)
- **Responsive Design** - Mobile, Tablet, Desktop
- **Drag & Drop** Kanban board for opportunities
- **Real-time Search** and filtering
- **Modal Forms** for CRUD operations
- **Indian Currency** formatting (₹, Lakhs, Crores)
- **Status Colors** for visual feedback
- **Avatar Generation** with initials
- **Activity Timeline**

## 🔒 Security

- JWT authentication with secure HTTP-only cookies
- Password hashing with bcrypt (10 rounds)
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers
- Input validation
- XSS protection
- SQL injection prevention (MongoDB)

## 📈 Performance

- MongoDB indexes for faster queries
- Lazy loading of components
- Optimized Tailwind CSS (purged in production)
- Efficient React rendering
- Database query optimization
- Aggregation pipelines for analytics

## 🚢 Production Deployment

### Frontend (Vercel/Netlify)

```bash
# Build frontend
npm run build

# Deploy dist/ folder to Vercel or Netlify
```

### Backend (Heroku/Railway/Render)

```bash
cd backend

# Set environment variables in hosting platform
# Deploy using Git or CLI
```

### MongoDB (Atlas)

1. Create MongoDB Atlas cluster
2. Get connection string
3. Update `MONGODB_URI` in backend `.env`

## 📝 License

MIT License - Free for commercial and personal use

## 👥 Support & Contact

- **Email**: support@leadcrm.in
- **Documentation**: See `/backend/README.md` for API docs
- **Issues**: GitHub Issues

## 🙏 Credits

Built with ❤️ for Indian businesses using:
- React, Vite, Tailwind CSS
- Node.js, Express, MongoDB
- Lucide Icons
- And many other open-source libraries

---

**LeadCRM v1.0.0** - Complete Indian CRM System
