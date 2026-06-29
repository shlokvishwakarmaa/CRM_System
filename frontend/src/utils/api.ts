import type { User, Lead, Contact, Customer, Opportunity, Ticket, UserRole, LeadStatus, PipelineStage, TicketStatus, AccountStatus } from '@/types';
import { getAllSeedData } from '@/data/mockData';

// ============== LOCAL STORAGE KEYS ==============
const KEYS = {
  USERS: 'leadcrm_users',
  LEADS: 'leadcrm_leads',
  CONTACTS: 'leadcrm_contacts',
  CUSTOMERS: 'leadcrm_customers',
  OPPORTUNITIES: 'leadcrm_opportunities',
  TICKETS: 'leadcrm_tickets',
  AUTH_TOKEN: 'leadcrm_auth_token',
  INITIALIZED: 'leadcrm_initialized',
};

// ============== INITIALIZE DATA ==============
export function initializeData() {
  if (!localStorage.getItem(KEYS.INITIALIZED)) {
    const seedData = getAllSeedData();
    localStorage.setItem(KEYS.USERS, JSON.stringify(seedData.users));
    localStorage.setItem(KEYS.LEADS, JSON.stringify(seedData.leads));
    localStorage.setItem(KEYS.CONTACTS, JSON.stringify(seedData.contacts));
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(seedData.customers));
    localStorage.setItem(KEYS.OPPORTUNITIES, JSON.stringify(seedData.opportunities));
    localStorage.setItem(KEYS.TICKETS, JSON.stringify(seedData.tickets));
    localStorage.setItem(KEYS.INITIALIZED, 'true');
  }
}

// ============== GENERIC HELPERS ==============
function getCollection<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function setCollection<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId(prefix: string): string {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function simulateDelay<T>(data: T, ms: number = 200): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(data), ms));
}

// ============== AUTH API ==============
export const authApi = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const users = getCollection<User>(KEYS.USERS);
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }
    const token = btoa(JSON.stringify({ userId: user.id, role: user.role, exp: Date.now() + 86400000 }));
    localStorage.setItem(KEYS.AUTH_TOKEN, token);
    const { password: _, ...safeUser } = user;
    return simulateDelay({ user: safeUser as User, token });
  },

  async register(data: { name: string; email: string; password: string; phone: string; role: UserRole }): Promise<{ user: User; token: string }> {
    const users = getCollection<User>(KEYS.USERS);
    if (users.find(u => u.email === data.email)) {
      throw new Error('Email already registered');
    }
    const newUser: User = {
      id: generateId('u'),
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      phone: data.phone,
      department: data.role.includes('sales') ? 'Sales' : data.role === 'support_executive' ? 'Support' : 'Administration',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(newUser);
    setCollection(KEYS.USERS, users);
    const token = btoa(JSON.stringify({ userId: newUser.id, role: newUser.role, exp: Date.now() + 86400000 }));
    localStorage.setItem(KEYS.AUTH_TOKEN, token);
    const { password: _, ...safeUser } = newUser;
    return simulateDelay({ user: safeUser as User, token });
  },

  async logout(): Promise<void> {
    localStorage.removeItem(KEYS.AUTH_TOKEN);
    return simulateDelay(undefined as unknown as void);
  },

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem(KEYS.AUTH_TOKEN);
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token));
      if (payload.exp < Date.now()) {
        localStorage.removeItem(KEYS.AUTH_TOKEN);
        return null;
      }
      const users = getCollection<User>(KEYS.USERS);
      const user = users.find(u => u.id === payload.userId);
      if (!user) return null;
      const { password: _, ...safeUser } = user;
      return safeUser as User;
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem(KEYS.AUTH_TOKEN);
  },
};

// ============== USERS API ==============
export const usersApi = {
  async getAll(): Promise<User[]> {
    const users = getCollection<User>(KEYS.USERS);
    return simulateDelay(users.map(u => { const { password: _, ...safe } = u; return safe as User; }));
  },

  async getById(id: string): Promise<User | null> {
    const users = getCollection<User>(KEYS.USERS);
    const user = users.find(u => u.id === id);
    if (!user) return null;
    const { password: _, ...safeUser } = user;
    return simulateDelay(safeUser as User);
  },

  async create(data: Partial<User> & { password: string }): Promise<User> {
    const users = getCollection<User>(KEYS.USERS);
    const newUser: User = {
      id: generateId('u'),
      name: data.name || '',
      email: data.email || '',
      password: data.password,
      role: data.role || 'sales_executive',
      phone: data.phone || '',
      department: data.department || 'Sales',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(newUser);
    setCollection(KEYS.USERS, users);
    const { password: _, ...safeUser } = newUser;
    return simulateDelay(safeUser as User);
  },

  async update(id: string, data: Partial<User>): Promise<User> {
    const users = getCollection<User>(KEYS.USERS);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    users[index] = { ...users[index], ...data, updatedAt: new Date().toISOString() };
    setCollection(KEYS.USERS, users);
    const { password: _, ...safeUser } = users[index];
    return simulateDelay(safeUser as User);
  },

  async delete(id: string): Promise<void> {
    const users = getCollection<User>(KEYS.USERS);
    setCollection(KEYS.USERS, users.filter(u => u.id !== id));
    return simulateDelay(undefined as unknown as void);
  },

  async getUsersByRole(role: UserRole): Promise<User[]> {
    const users = getCollection<User>(KEYS.USERS);
    return simulateDelay(users.filter(u => u.role === role).map(u => { const { password: _, ...safe } = u; return safe as User; }));
  },
};

// ============== LEADS API ==============
export const leadsApi = {
  async getAll(): Promise<Lead[]> {
    return simulateDelay(getCollection<Lead>(KEYS.LEADS));
  },

  async getById(id: string): Promise<Lead | null> {
    const leads = getCollection<Lead>(KEYS.LEADS);
    return simulateDelay(leads.find(l => l.id === id) || null);
  },

  async create(data: Partial<Lead>): Promise<Lead> {
    const leads = getCollection<Lead>(KEYS.LEADS);
    const newLead: Lead = {
      id: generateId('l'),
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      company: data.company || '',
      industry: data.industry || '',
      source: data.source || 'Website',
      status: data.status || 'New',
      estimatedValue: data.estimatedValue || 0,
      assignedTo: data.assignedTo || '',
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    leads.push(newLead);
    setCollection(KEYS.LEADS, leads);
    return simulateDelay(newLead);
  },

  async update(id: string, data: Partial<Lead>): Promise<Lead> {
    const leads = getCollection<Lead>(KEYS.LEADS);
    const index = leads.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Lead not found');
    leads[index] = { ...leads[index], ...data, updatedAt: new Date().toISOString() };
    setCollection(KEYS.LEADS, leads);
    return simulateDelay(leads[index]);
  },

  async updateStatus(id: string, status: LeadStatus): Promise<Lead> {
    return this.update(id, { status });
  },

  async delete(id: string): Promise<void> {
    const leads = getCollection<Lead>(KEYS.LEADS);
    setCollection(KEYS.LEADS, leads.filter(l => l.id !== id));
    return simulateDelay(undefined as unknown as void);
  },

  async search(query: string): Promise<Lead[]> {
    const leads = getCollection<Lead>(KEYS.LEADS);
    const q = query.toLowerCase();
    return simulateDelay(leads.filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.company.toLowerCase().includes(q) ||
      l.phone.includes(q)
    ));
  },
};

// ============== CONTACTS API ==============
export const contactsApi = {
  async getAll(): Promise<Contact[]> {
    return simulateDelay(getCollection<Contact>(KEYS.CONTACTS));
  },

  async getById(id: string): Promise<Contact | null> {
    const contacts = getCollection<Contact>(KEYS.CONTACTS);
    return simulateDelay(contacts.find(c => c.id === id) || null);
  },

  async create(data: Partial<Contact>): Promise<Contact> {
    const contacts = getCollection<Contact>(KEYS.CONTACTS);
    const newContact: Contact = {
      id: generateId('c'),
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      company: data.company || '',
      designation: data.designation || '',
      location: data.location || '',
      notes: data.notes || '',
      leadSource: data.leadSource,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    contacts.push(newContact);
    setCollection(KEYS.CONTACTS, contacts);
    return simulateDelay(newContact);
  },

  async update(id: string, data: Partial<Contact>): Promise<Contact> {
    const contacts = getCollection<Contact>(KEYS.CONTACTS);
    const index = contacts.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Contact not found');
    contacts[index] = { ...contacts[index], ...data, updatedAt: new Date().toISOString() };
    setCollection(KEYS.CONTACTS, contacts);
    return simulateDelay(contacts[index]);
  },

  async delete(id: string): Promise<void> {
    const contacts = getCollection<Contact>(KEYS.CONTACTS);
    setCollection(KEYS.CONTACTS, contacts.filter(c => c.id !== id));
    return simulateDelay(undefined as unknown as void);
  },

  async search(query: string): Promise<Contact[]> {
    const contacts = getCollection<Contact>(KEYS.CONTACTS);
    const q = query.toLowerCase();
    return simulateDelay(contacts.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q)
    ));
  },

  async importContacts(dataList: Partial<Contact>[]): Promise<Contact[]> {
    const contacts = getCollection<Contact>(KEYS.CONTACTS);
    const newContacts: Contact[] = dataList.map(data => ({
      id: generateId('c'),
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      company: data.company || '',
      designation: data.designation || '',
      location: data.location || '',
      notes: data.notes || '',
      leadSource: data.leadSource,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    contacts.push(...newContacts);
    setCollection(KEYS.CONTACTS, contacts);
    return simulateDelay(newContacts);
  },
};

// ============== CUSTOMERS API ==============
export const customersApi = {
  async getAll(): Promise<Customer[]> {
    return simulateDelay(getCollection<Customer>(KEYS.CUSTOMERS));
  },

  async getById(id: string): Promise<Customer | null> {
    const customers = getCollection<Customer>(KEYS.CUSTOMERS);
    return simulateDelay(customers.find(c => c.id === id) || null);
  },

  async create(data: Partial<Customer>): Promise<Customer> {
    const customers = getCollection<Customer>(KEYS.CUSTOMERS);
    const count = customers.length + 1;
    const newCustomer: Customer = {
      id: generateId('cust'),
      customerId: `LC-${1000 + count}`,
      companyName: data.companyName || '',
      industry: data.industry || '',
      revenue: data.revenue || 0,
      assignedExecutive: data.assignedExecutive || '',
      accountStatus: data.accountStatus || 'Onboarding',
      contactEmail: data.contactEmail || '',
      contactPhone: data.contactPhone || '',
      location: data.location || '',
      interactions: data.interactions || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    customers.push(newCustomer);
    setCollection(KEYS.CUSTOMERS, customers);
    return simulateDelay(newCustomer);
  },

  async update(id: string, data: Partial<Customer>): Promise<Customer> {
    const customers = getCollection<Customer>(KEYS.CUSTOMERS);
    const index = customers.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Customer not found');
    customers[index] = { ...customers[index], ...data, updatedAt: new Date().toISOString() };
    setCollection(KEYS.CUSTOMERS, customers);
    return simulateDelay(customers[index]);
  },

  async updateStatus(id: string, status: AccountStatus): Promise<Customer> {
    return this.update(id, { accountStatus: status });
  },

  async addInteraction(id: string, interaction: { type: string; description: string; by: string }): Promise<Customer> {
    const customers = getCollection<Customer>(KEYS.CUSTOMERS);
    const index = customers.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Customer not found');
    const newInteraction = {
      id: generateId('int'),
      type: interaction.type as 'call' | 'email' | 'meeting' | 'note',
      description: interaction.description,
      date: new Date().toISOString().split('T')[0],
      by: interaction.by,
    };
    customers[index].interactions.push(newInteraction);
    customers[index].updatedAt = new Date().toISOString();
    setCollection(KEYS.CUSTOMERS, customers);
    return simulateDelay(customers[index]);
  },

  async delete(id: string): Promise<void> {
    const customers = getCollection<Customer>(KEYS.CUSTOMERS);
    setCollection(KEYS.CUSTOMERS, customers.filter(c => c.id !== id));
    return simulateDelay(undefined as unknown as void);
  },

  async search(query: string): Promise<Customer[]> {
    const customers = getCollection<Customer>(KEYS.CUSTOMERS);
    const q = query.toLowerCase();
    return simulateDelay(customers.filter(c =>
      c.companyName.toLowerCase().includes(q) ||
      c.customerId.toLowerCase().includes(q) ||
      c.industry.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q)
    ));
  },
};

// ============== OPPORTUNITIES API ==============
export const opportunitiesApi = {
  async getAll(): Promise<Opportunity[]> {
    return simulateDelay(getCollection<Opportunity>(KEYS.OPPORTUNITIES));
  },

  async getById(id: string): Promise<Opportunity | null> {
    const opportunities = getCollection<Opportunity>(KEYS.OPPORTUNITIES);
    return simulateDelay(opportunities.find(o => o.id === id) || null);
  },

  async create(data: Partial<Opportunity>): Promise<Opportunity> {
    const opportunities = getCollection<Opportunity>(KEYS.OPPORTUNITIES);
    const newOpportunity: Opportunity = {
      id: generateId('opp'),
      name: data.name || '',
      expectedRevenue: data.expectedRevenue || 0,
      closingDate: data.closingDate || new Date().toISOString().split('T')[0],
      associatedCustomer: data.associatedCustomer || '',
      salesExecutive: data.salesExecutive || '',
      pipelineStage: data.pipelineStage || 'Prospecting',
      probability: data.probability || 0,
      description: data.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    opportunities.push(newOpportunity);
    setCollection(KEYS.OPPORTUNITIES, opportunities);
    return simulateDelay(newOpportunity);
  },

  async update(id: string, data: Partial<Opportunity>): Promise<Opportunity> {
    const opportunities = getCollection<Opportunity>(KEYS.OPPORTUNITIES);
    const index = opportunities.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Opportunity not found');
    opportunities[index] = { ...opportunities[index], ...data, updatedAt: new Date().toISOString() };
    setCollection(KEYS.OPPORTUNITIES, opportunities);
    return simulateDelay(opportunities[index]);
  },

  async updateStage(id: string, stage: PipelineStage): Promise<Opportunity> {
    const probabilityMap: Record<PipelineStage, number> = {
      'Prospecting': 10,
      'Qualification': 25,
      'Proposal': 50,
      'Negotiation': 75,
      'Closed Won': 100,
      'Closed Lost': 0,
    };
    return this.update(id, { pipelineStage: stage, probability: probabilityMap[stage] });
  },

  async delete(id: string): Promise<void> {
    const opportunities = getCollection<Opportunity>(KEYS.OPPORTUNITIES);
    setCollection(KEYS.OPPORTUNITIES, opportunities.filter(o => o.id !== id));
    return simulateDelay(undefined as unknown as void);
  },

  async getByStage(stage: PipelineStage): Promise<Opportunity[]> {
    const opportunities = getCollection<Opportunity>(KEYS.OPPORTUNITIES);
    return simulateDelay(opportunities.filter(o => o.pipelineStage === stage));
  },
};

// ============== TICKETS API ==============
export const ticketsApi = {
  async getAll(): Promise<Ticket[]> {
    return simulateDelay(getCollection<Ticket>(KEYS.TICKETS));
  },

  async getById(id: string): Promise<Ticket | null> {
    const tickets = getCollection<Ticket>(KEYS.TICKETS);
    return simulateDelay(tickets.find(t => t.id === id) || null);
  },

  async create(data: Partial<Ticket>): Promise<Ticket> {
    const tickets = getCollection<Ticket>(KEYS.TICKETS);
    const newTicket: Ticket = {
      id: generateId('t'),
      title: data.title || '',
      description: data.description || '',
      customerId: data.customerId || '',
      customerName: data.customerName || '',
      assignedTo: data.assignedTo || '',
      status: data.status || 'Open',
      priority: data.priority || 'Medium',
      category: data.category || 'General',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tickets.push(newTicket);
    setCollection(KEYS.TICKETS, tickets);
    return simulateDelay(newTicket);
  },

  async update(id: string, data: Partial<Ticket>): Promise<Ticket> {
    const tickets = getCollection<Ticket>(KEYS.TICKETS);
    const index = tickets.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Ticket not found');
    tickets[index] = { ...tickets[index], ...data, updatedAt: new Date().toISOString() };
    if (data.status === 'Resolved' || data.status === 'Closed') {
      tickets[index].resolvedAt = new Date().toISOString();
    }
    setCollection(KEYS.TICKETS, tickets);
    return simulateDelay(tickets[index]);
  },

  async updateStatus(id: string, status: TicketStatus): Promise<Ticket> {
    return this.update(id, { status });
  },

  async delete(id: string): Promise<void> {
    const tickets = getCollection<Ticket>(KEYS.TICKETS);
    setCollection(KEYS.TICKETS, tickets.filter(t => t.id !== id));
    return simulateDelay(undefined as unknown as void);
  },

  async search(query: string): Promise<Ticket[]> {
    const tickets = getCollection<Ticket>(KEYS.TICKETS);
    const q = query.toLowerCase();
    return simulateDelay(tickets.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.customerName.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    ));
  },
};

// ============== RESET DATA ==============
export function resetAllData(): void {
  Object.values(KEYS).forEach(key => localStorage.removeItem(key));
  initializeData();
}
