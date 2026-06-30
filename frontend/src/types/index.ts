// ============== ROLE & AUTH TYPES ==============
export type UserRole = 'admin' | 'sales_manager' | 'sales_executive' | 'support_executive';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  department: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ============== LEAD TYPES ==============
export type LeadSource = 'Website' | 'Google Ads' | 'LinkedIn' | 'Facebook' | 'Referral' | 'Cold Call' | 'Email Campaign' | 'Trade Show' | 'Partner' | 'Other';
export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Meeting Scheduled' | 'Proposal Sent' | 'Negotiation' | 'Won' | 'Lost';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  source: LeadSource;
  status: LeadStatus;
  estimatedValue: number;
  assignedTo: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ============== CONTACT TYPES ==============
export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  designation: string;
  location: string;
  notes: string;
  leadSource?: string;
  createdAt: string;
  updatedAt: string;
}

// ============== CUSTOMER TYPES ==============
export type AccountStatus = 'Active' | 'Inactive' | 'Churned' | 'Onboarding';

export interface InteractionRecord {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  description: string;
  date: string;
  by: string;
}

export interface Customer {
  id: string;
  customerId: string;
  companyName: string;
  industry: string;
  revenue: number;
  assignedExecutive: string;
  accountStatus: AccountStatus;
  contactEmail: string;
  contactPhone: string;
  location: string;
  interactions: InteractionRecord[];
  createdAt: string;
  updatedAt: string;
}

// ============== OPPORTUNITY TYPES ==============
export type PipelineStage = 'Prospecting' | 'Qualification' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';

export interface Opportunity {
  id: string;
  name: string;
  expectedRevenue: number;
  closingDate: string;
  associatedCustomer: string;
  salesExecutive: string;
  pipelineStage: PipelineStage;
  probability: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// ============== TICKET TYPES ==============
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TicketStatus = 'Open' | 'In Progress' | 'Waiting on Customer' | 'Resolved' | 'Closed';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  customerId: string;
  customerName: string;
  assignedTo: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

// ============== UI TYPES ==============
export interface DashboardMetrics {
  totalLeads: number;
  totalContacts: number;
  totalCustomers: number;
  totalOpportunities: number;
  totalRevenue: number;
  openTickets: number;
  leadsThisMonth: number;
  wonDealsThisMonth: number;
  conversionRate: number;
  avgDealSize: number;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: string;
  read: boolean;
}

export type ModalMode = 'create' | 'edit' | 'view';
