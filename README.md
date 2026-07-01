**Core Functions**
Authentication Function

**Purpose:**
Handles user login and authentication.

**Description:**
The authentication function verifies the user's email and password. If the credentials are correct, it generates a JWT (JSON Web Token) and stores it in an HTTP-only cookie. This allows secure access to protected routes without requiring the user to log in repeatedly.

**Key Features**

User Login
Password Verification
JWT Token Generation
Secure Session Management


**User Registration Function**

**Purpose:**
Creates a new user account.

**Description:**
This function validates user input, checks whether the email already exists, encrypts the password using hashing, and stores the new user in the database.

**Key Features**

Input Validation
Duplicate Email Check
Password Encryption
Database Storage
Authorization Function

**Purpose:**
Controls access based on user roles.

**Description:**
After authentication, this function checks the user's role (Admin, Sales Manager, Sales Executive, Support Executive) and grants or denies access to specific resources.

**Key Features**

Role-Based Access Control (RBAC)
Permission Verification
Protected Routes

**Lead Management Function**

**Purpose:**
Manages customer leads.

**Description:**
Allows users to create, update, view, search, and delete leads. Leads can later be converted into customers when they are successfully qualified.

**Key Features**

Add Lead
Update Lead
Delete Lead
Search Lead
Lead Status Management

**Customer Management Function**

**Purpose:**
Maintains customer records.

**Description:**
Stores complete customer information in a centralized database. Users can update contact information, view customer history, and manage customer profiles efficiently.

**Key Features**

Customer Registration
Customer Profile Management
Contact Information
Customer History

**Opportunity Management Function**

**Purpose:**
Tracks sales opportunities.

**Description:**
This module monitors the progress of potential business deals from initial proposal to final closure.

Stages

Prospecting
Qualification
Proposal
Negotiation
Won / Lost

**Ticket Management Function**

Purpose:
Handles customer support requests.

Description:
Customers' issues are recorded as support tickets. Each ticket has a priority and status that can be updated by support staff until it is resolved.

**Ticket Status**

Open
In Progress
Resolved
Closed
Dashboard Function

**Purpose:**
Displays overall CRM statistics.

**Description:**
The dashboard collects data from different modules and presents important business information using cards and charts.

Displays

Total Customers
Total Leads
Sales Revenue
Open Opportunities
Pending Tickets
Search Function

**Purpose:**
Provides quick data retrieval.

**Description:**
Allows users to search customers, leads, contacts, and tickets using keywords or filters, reducing the time required to locate records.

Report Generation Function

**Purpose:**
Generates business reports.

**Description:**
Collects data from different CRM modules and presents useful insights that help management analyze business performance.

**Reports Include**

Sales Report
Customer Report
Lead Report
Support Ticket Report
Database Connection Function

Purpose:
Establishes connection with MongoDB.

Description:
Initializes the MongoDB connection using Mongoose. If the connection is successful, the server starts; otherwise, an appropriate error is logged.

API Request Handling

**Purpose:**
Processes HTTP requests.

**Description:**
The backend exposes RESTful APIs that allow the frontend to perform CRUD (Create, Read, Update, Delete) operations on CRM data.

**HTTP Methods**

GET – Retrieve Data
POST – Create Data
PUT – Update Data
DELETE – Remove Data
Error Handling Function

**Purpose:**
Handles runtime errors gracefully.

**Description:**
Captures exceptions and sends meaningful error responses to the client without crashing the server.

**Security Middleware**

**Purpose:**
Protects the application from common web vulnerabilities.

**Includes**

JWT Authentication
Helmet Security Headers
CORS Configuration
Rate Limiting
HTTP-only Cookies
