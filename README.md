# LeadCRM Backend API

Production-ready Node.js + Express + MongoDB backend for the LeadCRM Indian CRM System.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your MongoDB URI and other settings

# Seed the database with sample data
npm run seed

# Start development server
npm run dev
```

The API will be running at `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection config
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── leadController.js    # Lead management
│   ├── contactController.js # Contact management
│   ├── customerController.js # Customer management
│   ├── opportunityController.js # Opportunity management
│   ├── ticketController.js  # Support ticket management
│   └── userController.js    # User management
├── middleware/
│   ├── auth.js             # JWT authentication & RBAC
│   └── errorHandler.js     # Global error handling
├── models/
│   ├── User.js             # User schema
│   ├── Lead.js             # Lead schema
│   ├── Contact.js          # Contact schema
│   ├── Customer.js         # Customer schema
│   ├── Opportunity.js      # Opportunity schema
│   └── Ticket.js           # Ticket schema
├── routes/
│   ├── authRoutes.js       # Auth endpoints
│   ├── leadRoutes.js       # Lead endpoints
│   ├── contactRoutes.js    # Contact endpoints
│   ├── customerRoutes.js   # Customer endpoints
│   ├── opportunityRoutes.js # Opportunity endpoints
│   ├── ticketRoutes.js     # Ticket endpoints
│   └── userRoutes.js       # User endpoints
├── seeders/
│   └── seed.js             # Database seeder
├── .env.example            # Environment variables template
├── .gitignore
├── package.json
├── README.md
└── server.js               # Express app entry point
```

## 🔐 Authentication

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+91 98765 43210",
  "role": "sales_executive",
  "department": "Sales"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "rajesh@leadcrm.in",
  "password": "admin123"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Update Password
```http
PUT /api/auth/updatepassword
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

## 📊 API Endpoints

### Leads (`/api/leads`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/leads` | Get all leads | All authenticated |
| GET | `/api/leads/:id` | Get single lead | All authenticated |
| POST | `/api/leads` | Create lead | Admin, Manager, Executive |
| PUT | `/api/leads/:id` | Update lead | Admin, Manager, Executive |
| DELETE | `/api/leads/:id` | Delete lead | Admin, Manager |
| PATCH | `/api/leads/:id/status` | Update lead status | Admin, Manager, Executive |
| GET | `/api/leads/stats` | Get lead statistics | Admin, Manager |

### Contacts (`/api/contacts`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/contacts` | Get all contacts | All authenticated |
| GET | `/api/contacts/:id` | Get single contact | All authenticated |
| POST | `/api/contacts` | Create contact | All authenticated |
| PUT | `/api/contacts/:id` | Update contact | All authenticated |
| DELETE | `/api/contacts/:id` | Delete contact | All authenticated |
| POST | `/api/contacts/import` | Import multiple contacts | All authenticated |

### Customers (`/api/customers`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/customers` | Get all customers | All authenticated |
| GET | `/api/customers/:id` | Get single customer | All authenticated |
| POST | `/api/customers` | Create customer | All authenticated |
| PUT | `/api/customers/:id` | Update customer | All authenticated |
| DELETE | `/api/customers/:id` | Delete customer | Admin, Manager |
| PATCH | `/api/customers/:id/status` | Update customer status | All authenticated |
| POST | `/api/customers/:id/interactions` | Add interaction | All authenticated |
| GET | `/api/customers/stats` | Get customer statistics | All authenticated |

### Opportunities (`/api/opportunities`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/opportunities` | Get all opportunities | Admin, Manager, Executive |
| GET | `/api/opportunities/:id` | Get single opportunity | Admin, Manager, Executive |
| POST | `/api/opportunities` | Create opportunity | Admin, Manager, Executive |
| PUT | `/api/opportunities/:id` | Update opportunity | Admin, Manager, Executive |
| DELETE | `/api/opportunities/:id` | Delete opportunity | Admin, Manager |
| PATCH | `/api/opportunities/:id/stage` | Update pipeline stage | Admin, Manager, Executive |
| GET | `/api/opportunities/stats` | Get opportunity statistics | Admin, Manager, Executive |

### Tickets (`/api/tickets`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/tickets` | Get all tickets | Admin, Support |
| GET | `/api/tickets/:id` | Get single ticket | Admin, Support |
| POST | `/api/tickets` | Create ticket | Admin, Support |
| PUT | `/api/tickets/:id` | Update ticket | Admin, Support |
| DELETE | `/api/tickets/:id` | Delete ticket | Admin |
| PATCH | `/api/tickets/:id/status` | Update ticket status | Admin, Support |
| POST | `/api/tickets/:id/comments` | Add comment | Admin, Support |
| GET | `/api/tickets/stats` | Get ticket statistics | Admin, Support |

### Users (`/api/users`) - Admin Only

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get single user |
| POST | `/api/users` | Create user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |
| GET | `/api/users/role/:role` | Get users by role |

## 🔒 Role-Based Access Control (RBAC)

### Roles

1. **Admin** - Full system access
2. **Sales Manager** - Manage sales team, view all sales data
3. **Sales Executive** - Manage own leads, opportunities, customers
4. **Support Executive** - Manage support tickets, view customers

### Permission Matrix

| Resource | Admin | Sales Manager | Sales Executive | Support Executive |
|----------|-------|---------------|-----------------|-------------------|
| Users | Full | - | - | - |
| Leads | Full | Full | Own only | - |
| Contacts | Full | Full | Full | Read |
| Customers | Full | Full | Own only | Read |
| Opportunities | Full | Full | Own only | - |
| Tickets | Full | - | - | Own only |

## 🌍 Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/leadcrm
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
CORS_ORIGIN=http://localhost:5173
BCRYPT_ROUNDS=10
```

## 📝 Sample Login Credentials (After Seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | rajesh@leadcrm.in | admin123 |
| Sales Manager | priya@leadcrm.in | manager123 |
| Sales Executive | amit@leadcrm.in | executive123 |
| Support Executive | sneha@leadcrm.in | support123 |

## 🔧 Development Commands

```bash
# Start development server with nodemon
npm run dev

# Start production server
npm start

# Seed database with sample data
npm run seed

# Clear and reseed database
npm run seed
```

## 🚢 Production Deployment

### MongoDB Atlas Setup

1. Create a MongoDB Atlas cluster
2. Get connection string
3. Add to `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/leadcrm
   ```

### Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create leadcrm-api

# Set environment variables
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_secret_key
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### Deploy to Railway/Render

1. Connect GitHub repository
2. Set environment variables in dashboard
3. Deploy automatically on push

## 📊 Database Schema

### User Schema
- Authentication with bcrypt
- JWT token generation
- Role-based access
- Active/inactive status

### Lead Schema
- Lead lifecycle tracking
- Status history
- Assignment to sales executives
- Estimated value tracking

### Customer Schema
- Auto-generated customer ID (LC-1001, LC-1002...)
- Interaction history
- Revenue tracking
- Account status management

### Opportunity Schema
- Pipeline stage management
- Auto-calculated probability
- Stage history tracking
- Weighted value calculation

### Ticket Schema
- Support workflow
- Priority levels
- Comments and attachments
- SLA tracking

## 🛡️ Security Features

- JWT authentication with HTTP-only cookies
- Password hashing with bcryptjs
- Helmet for security headers
- Rate limiting (100 requests per 15 minutes)
- CORS configuration
- Input validation
- Error handling middleware

## 📈 Performance

- MongoDB indexes for faster queries
- Aggregation pipelines for statistics
- Efficient population of references
- Query filtering and pagination ready

## 🧪 Testing

```bash
# Install testing dependencies (if needed)
npm install --save-dev jest supertest

# Run tests
npm test
```

## 📄 License

MIT License - Built for Indian Businesses

## 👥 Support

For issues and questions:
- GitHub Issues
- Email: shlokv326@gmail.com

---

**LeadCRM Backend API v1.0.0**
