import { useState, useEffect, useCallback } from 'react';
import { customersApi, usersApi } from '@/utils/api';
import { formatINR, formatDate, getAccountStatusColor, getAvatarColor } from '@/utils/helpers';
import type { Customer, AccountStatus, User, InteractionRecord } from '@/types';
import Modal from '@/components/Modal';
import { Search, Plus, Building2, Phone, Mail, MapPin, IndianRupee, MessageSquare, Calendar, FileText, X, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const INDUSTRIES = ['Information Technology', 'Healthcare', 'Financial Services', 'Real Estate & Construction', 'Automotive', 'Export & Import', 'Education Technology', 'Biotechnology', 'Agriculture', 'Textile & Manufacturing', 'Retail & Luxury', 'Logistics & Supply Chain', 'Other'];
const STATUSES: AccountStatus[] = ['Active', 'Onboarding', 'Inactive', 'Churned'];

export default function CustomersPage() {
  const { user, hasRole } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [interactionCustomerId, setInteractionCustomerId] = useState('');

  const [form, setForm] = useState({
    companyName: '', industry: '', revenue: 0, assignedExecutive: '',
    accountStatus: 'Onboarding' as AccountStatus, contactEmail: '',
    contactPhone: '', location: '',
  });

  const [interactionForm, setInteractionForm] = useState({
    type: 'note' as InteractionRecord['type'],
    description: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let allCustomers = await customersApi.getAll();
      if (hasRole('sales_executive') && !hasRole('admin', 'sales_manager')) {
        allCustomers = allCustomers.filter(c => c.assignedExecutive === user?.id);
      }
      setCustomers(allCustomers);
      const allUsers = await usersApi.getAll();
      setUsers(allUsers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, hasRole]);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = !search ||
      c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.customerId.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.accountStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Unassigned';

  const openCreate = () => {
    setEditingCustomer(null);
    setForm({
      companyName: '', industry: '', revenue: 0,
      assignedExecutive: hasRole('sales_executive') ? (user?.id || '') : '',
      accountStatus: 'Onboarding', contactEmail: '', contactPhone: '', location: '',
    });
    setShowModal(true);
  };

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setForm({
      companyName: customer.companyName, industry: customer.industry,
      revenue: customer.revenue, assignedExecutive: customer.assignedExecutive,
      accountStatus: customer.accountStatus, contactEmail: customer.contactEmail,
      contactPhone: customer.contactPhone, location: customer.location,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingCustomer) {
        await customersApi.update(editingCustomer.id, form);
      } else {
        await customersApi.create(form);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      await customersApi.delete(id);
      loadData();
    }
  };

  const handleAddInteraction = async () => {
    try {
      await customersApi.addInteraction(interactionCustomerId, {
        type: interactionForm.type,
        description: interactionForm.description,
        by: user?.id || '',
      });
      setShowInteractionModal(false);
      setInteractionForm({ type: 'note', description: '' });
      loadData();
      // Refresh viewing customer
      if (viewingCustomer && viewingCustomer.id === interactionCustomerId) {
        const updated = await customersApi.getById(interactionCustomerId);
        if (updated) setViewingCustomer(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="w-4 h-4 text-blue-500" />;
      case 'email': return <Mail className="w-4 h-4 text-green-500" />;
      case 'meeting': return <Calendar className="w-4 h-4 text-purple-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  // Customer Journey Stage
  const getJourneyStage = (customer: Customer): string => {
    switch (customer.accountStatus) {
      case 'Onboarding': return 'Customer Onboarded';
      case 'Active': return 'Support & Retention';
      case 'Inactive': return 'At Risk';
      case 'Churned': return 'Churned';
      default: return 'Unknown';
    }
  };

  const JOURNEY_STAGES = ['Website Inquiry', 'Lead Created', 'Sales Follow-Up', 'Deal Closed', 'Customer Onboarded', 'Support & Retention'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500">{customers.length} customers · ₹{(customers.reduce((s, c) => s + c.revenue, 0) / 10000000).toFixed(1)}Cr total revenue</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button onClick={() => setFilterStatus('all')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filterStatus === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          All ({customers.length})
        </button>
        {STATUSES.map(status => (
          <button key={status} onClick={() => setFilterStatus(status)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filterStatus === status ? 'bg-gray-900 text-white' : `${getAccountStatusColor(status)} hover:opacity-80`}`}>
            {status} ({customers.filter(c => c.accountStatus === status).length})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers by name, ID, industry, location..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
        {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X className="w-4 h-4" /></button>}
      </div>

      {/* Customers List */}
      <div className="space-y-3">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Building2 className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-400">No customers found</p>
          </div>
        ) : (
          filteredCustomers.map(customer => (
            <div key={customer.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-bold ${getAvatarColor(customer.companyName)}`}>
                  {customer.companyName.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-gray-900">{customer.companyName}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getAccountStatusColor(customer.accountStatus)}`}>{customer.accountStatus}</span>
                    <span className="text-xs text-gray-400">#{customer.customerId}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{customer.location}</span>
                    <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" />Revenue: {formatINR(customer.revenue)}</span>
                    <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{customer.industry}</span>
                    <span className="flex items-center gap-1">Executive: {getUserName(customer.assignedExecutive)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setInteractionCustomerId(customer.id); setShowInteractionModal(true); }} className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50" title="Add Interaction">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewingCustomer(customer)} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Customer Journey Progress */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-[10px] text-gray-400 mb-1.5">Customer Journey</p>
                <div className="flex items-center gap-0.5">
                  {JOURNEY_STAGES.map((stage, idx) => {
                    const currentStageIdx = JOURNEY_STAGES.indexOf(getJourneyStage(customer));
                    const isCompleted = idx <= currentStageIdx;
                    const isCurrent = stage === getJourneyStage(customer);
                    return (
                      <div key={stage} className="flex items-center">
                        <div className={`h-1.5 w-8 rounded-full ${isCompleted ? (isCurrent ? 'bg-orange-500' : 'bg-green-500') : 'bg-gray-200'}`} title={stage} />
                        {idx < JOURNEY_STAGES.length - 1 && <div className="w-0.5" />}
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-0.5">
                  <span className="text-[9px] text-gray-400">Inquiry</span>
                  <span className="text-[9px] text-orange-500 font-medium">{getJourneyStage(customer)}</span>
                  <span className="text-[9px] text-gray-400">Retention</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingCustomer ? 'Edit Customer' : 'Add New Customer'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
              <input type="text" value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <select value={form.industry} onChange={e => setForm({...form, industry: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none">
                <option value="">Select Industry</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Revenue (₹)</label>
              <input type="number" value={form.revenue} onChange={e => setForm({...form, revenue: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
              <select value={form.accountStatus} onChange={e => setForm({...form, accountStatus: e.target.value as AccountStatus})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input type="email" value={form.contactEmail} onChange={e => setForm({...form, contactEmail: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
              <input type="tel" value={form.contactPhone} onChange={e => setForm({...form, contactPhone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" placeholder="City, State" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Executive</label>
              <select value={form.assignedExecutive} onChange={e => setForm({...form, assignedExecutive: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none">
                <option value="">Unassigned</option>
                {users.filter(u => u.role === 'sales_executive').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg">
              {editingCustomer ? 'Update Customer' : 'Create Customer'}
            </button>
          </div>
        </div>
      </Modal>

      {/* View Customer Modal */}
      <Modal isOpen={!!viewingCustomer} onClose={() => setViewingCustomer(null)} title="Customer Details" size="xl">
        {viewingCustomer && (
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-white text-lg font-bold ${getAvatarColor(viewingCustomer.companyName)}`}>
                {viewingCustomer.companyName.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">{viewingCustomer.companyName}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getAccountStatusColor(viewingCustomer.accountStatus)}`}>{viewingCustomer.accountStatus}</span>
                </div>
                <p className="text-sm text-gray-500">{viewingCustomer.customerId} · {viewingCustomer.industry}</p>
                <p className="text-xs text-gray-400 mt-0.5">Executive: {getUserName(viewingCustomer.assignedExecutive)}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{formatINR(viewingCustomer.revenue)}</p>
                <p className="text-xs text-gray-400">Annual Revenue</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-lg p-4">
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900 flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{viewingCustomer.contactEmail}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-medium text-gray-900 flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{viewingCustomer.contactPhone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="text-sm font-medium text-gray-900 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{viewingCustomer.location}</p>
              </div>
            </div>

            {/* Interaction History */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">Interaction History</h4>
                <button onClick={() => { setInteractionCustomerId(viewingCustomer.id); setShowInteractionModal(true); }} className="text-xs text-orange-600 hover:text-orange-700 font-medium">+ Add</button>
              </div>
              {viewingCustomer.interactions.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No interactions recorded</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {[...viewingCustomer.interactions].reverse().map(interaction => (
                    <div key={interaction.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className="mt-0.5">{getInteractionIcon(interaction.type)}</div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{interaction.description}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(interaction.date)} · by {getUserName(interaction.by)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => { openEdit(viewingCustomer); setViewingCustomer(null); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Edit Customer</button>
              <button onClick={() => { handleDelete(viewingCustomer.id); setViewingCustomer(null); }} className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg">Delete</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Interaction Modal */}
      <Modal isOpen={showInteractionModal} onClose={() => setShowInteractionModal(false)} title="Add Interaction" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select value={interactionForm.type} onChange={e => setInteractionForm({...interactionForm, type: e.target.value as InteractionRecord['type']})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none">
              <option value="note">Note</option>
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="meeting">Meeting</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={interactionForm.description} onChange={e => setInteractionForm({...interactionForm, description: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none" placeholder="Describe the interaction..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowInteractionModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
            <button onClick={handleAddInteraction} className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg">Save Interaction</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
