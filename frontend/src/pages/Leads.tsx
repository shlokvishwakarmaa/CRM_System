// This is the details of leads, that added the lead data //


import { useState, useEffect, useCallback } from 'react';
import { leadsApi, usersApi } from '@/utils/api';
import { formatINR, formatDate, getLeadStatusColor, getInitials, getAvatarColor } from '@/utils/helpers';
import type { Lead, LeadSource, LeadStatus, User } from '@/types';
import Modal from '@/components/Modal';
import {
  Search, Plus, Target, Phone, Mail, Building2,
  MoreVertical, Edit2, Trash2, Eye, ChevronDown, X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const LEAD_SOURCES: LeadSource[] = ['Website', 'Google Ads', 'LinkedIn', 'Facebook', 'Referral', 'Cold Call', 'Email Campaign', 'Trade Show', 'Partner', 'Other'];
const LEAD_STATUSES: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Meeting Scheduled', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];
const INDUSTRIES = ['Information Technology', 'Healthcare', 'Financial Services', 'Real Estate & Construction', 'Automotive', 'Export & Import', 'Education Technology', 'Biotechnology', 'Agriculture', 'Textile & Manufacturing', 'Retail & Luxury', 'Logistics & Supply Chain', 'Other'];

const STATUS_FLOW: Record<LeadStatus, LeadStatus[]> = {
  'New': ['Contacted', 'Lost'],
  'Contacted': ['Qualified', 'Lost'],
  'Qualified': ['Meeting Scheduled', 'Lost'],
  'Meeting Scheduled': ['Proposal Sent', 'Lost'],
  'Proposal Sent': ['Negotiation', 'Lost'],
  'Negotiation': ['Won', 'Lost'],
  'Won': [],
  'Lost': [],
};

export default function LeadsPage() {
  const { user, hasRole } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '', industry: '',
    source: 'Website' as LeadSource, status: 'New' as LeadStatus,
    estimatedValue: 0, assignedTo: '', notes: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let allLeads = await leadsApi.getAll();
      // Sales executive only sees their own leads
      if (hasRole('sales_executive') && !hasRole('admin', 'sales_manager')) {
        allLeads = allLeads.filter(l => l.assignedTo === user?.id);
      }
      setLeads(allLeads);
      const allUsers = await usersApi.getAll();
      setUsers(allUsers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, hasRole]);

  useEffect(() => { loadData(); }, [loadData]);

  // Filter & search
  const filteredLeads = leads.filter(l => {
    const matchesSearch = !search || 
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      l.company.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search);
    const matchesStatus = filterStatus === 'all' || l.status === filterStatus;
    const matchesSource = filterSource === 'all' || l.source === filterSource;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const openCreate = () => {
    setEditingLead(null);
    setForm({
      name: '', email: '', phone: '', company: '', industry: '',
      source: 'Website', status: 'New', estimatedValue: 0,
      assignedTo: hasRole('sales_executive') ? (user?.id || '') : '',
      notes: '',
    });
    setShowModal(true);
  };

  const openEdit = (lead: Lead) => {
    setEditingLead(lead);
    setForm({
      name: lead.name, email: lead.email, phone: lead.phone,
      company: lead.company, industry: lead.industry,
      source: lead.source, status: lead.status,
      estimatedValue: lead.estimatedValue, assignedTo: lead.assignedTo,
      notes: lead.notes,
    });
    setShowModal(true);
    setActionMenuId(null);
  };

  const handleSave = async () => {
    try {
      if (editingLead) {
        await leadsApi.update(editingLead.id, form);
      } else {
        await leadsApi.create(form);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      await leadsApi.delete(id);
      loadData();
      setActionMenuId(null);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    await leadsApi.updateStatus(leadId, newStatus);
    loadData();
    setActionMenuId(null);
  };

  const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Unassigned';

  // Status counts
  const statusCounts = LEAD_STATUSES.reduce((acc, status) => {
    acc[status] = leads.filter(l => l.status === status).length;
    return acc;
  }, {} as Record<string, number>);

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
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500">{leads.length} total leads · {filteredLeads.length} shown</p>
        </div>
        {(hasRole('admin', 'sales_manager', 'sales_executive')) && (
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        )}
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            filterStatus === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All ({leads.length})
        </button>
        {LEAD_STATUSES.map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filterStatus === status ? 'bg-gray-900 text-white' : `${getLeadStatusColor(status)} hover:opacity-80`
            }`}
          >
            {status} ({statusCounts[status] || 0})
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads by name, email, company..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <select
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
          className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
        >
          <option value="all">All Sources</option>
          {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Lead</th>
                <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Company</th>
                <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Source</th>
                <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Status</th>
                <th className="text-right text-xs font-medium text-gray-500 py-3 px-4">Value</th>
                <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Assigned To</th>
                <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Date</th>
                <th className="text-right text-xs font-medium text-gray-500 py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    <Target className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No leads found</p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map(lead => (
                  <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${getAvatarColor(lead.name)}`}>
                          {getInitials(lead.name)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                          <p className="text-xs text-gray-500">{lead.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm text-gray-700">{lead.company}</span>
                      </div>
                      <p className="text-xs text-gray-400 ml-5">{lead.industry}</p>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{lead.source}</td>
                    <td className="py-3 px-4">
                      <div className="relative">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                          className={`appearance-none text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer pr-6 ${getLeadStatusColor(lead.status)}`}
                        >
                          {STATUS_FLOW[lead.status].length > 0 ? (
                            STATUS_FLOW[lead.status].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))
                          ) : (
                            <option value={lead.status}>{lead.status}</option>
                          )}
                        </select>
                        <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-semibold text-gray-900">{formatINR(lead.estimatedValue)}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{getUserName(lead.assignedTo)}</td>
                    <td className="py-3 px-4 text-xs text-gray-500">{formatDate(lead.createdAt)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1 relative">
                        <button onClick={() => setViewingLead(lead)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => setActionMenuId(actionMenuId === lead.id ? null : lead.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {actionMenuId === lead.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActionMenuId(null)} />
                            <div className="absolute right-0 top-8 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
                              <button onClick={() => openEdit(lead)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <Edit2 className="w-3.5 h-3.5" /> Edit
                              </button>
                              <button onClick={() => { navigator.clipboard.writeText(lead.phone); setActionMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <Phone className="w-3.5 h-3.5" /> Copy Phone
                              </button>
                              <button onClick={() => { navigator.clipboard.writeText(lead.email); setActionMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <Mail className="w-3.5 h-3.5" /> Copy Email
                              </button>
                              <button onClick={() => handleDelete(lead.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingLead ? 'Edit Lead' : 'Add New Lead'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Full name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" placeholder="email@company.in" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
              <input type="text" value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Company name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <select value={form.industry} onChange={e => setForm({...form, industry: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none">
                <option value="">Select Industry</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <select value={form.source} onChange={e => setForm({...form, source: e.target.value as LeadSource})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none">
                {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value as LeadStatus})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none">
                {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Value (₹)</label>
              <input type="number" value={form.estimatedValue} onChange={e => setForm({...form, estimatedValue: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
              <select value={form.assignedTo} onChange={e => setForm({...form, assignedTo: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none">
                <option value="">Unassigned</option>
                {users.filter(u => u.role === 'sales_executive').map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none" placeholder="Add notes about this lead..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors">
              {editingLead ? 'Update Lead' : 'Create Lead'}
            </button>
          </div>
        </div>
      </Modal>

      {/* View Lead Modal */}
      <Modal
        isOpen={!!viewingLead}
        onClose={() => setViewingLead(null)}
        title="Lead Details"
        size="lg"
      >
        {viewingLead && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold ${getAvatarColor(viewingLead.name)}`}>
                {getInitials(viewingLead.name)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{viewingLead.name}</h3>
                <p className="text-sm text-gray-500">{viewingLead.company} · {viewingLead.industry}</p>
              </div>
              <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${getLeadStatusColor(viewingLead.status)}`}>
                {viewingLead.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900 flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{viewingLead.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-medium text-gray-900 flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{viewingLead.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Source</p>
                <p className="text-sm font-medium text-gray-900">{viewingLead.source}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Estimated Value</p>
                <p className="text-sm font-semibold text-green-600">{formatINR(viewingLead.estimatedValue)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Assigned To</p>
                <p className="text-sm font-medium text-gray-900">{getUserName(viewingLead.assignedTo)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Created</p>
                <p className="text-sm text-gray-900">{formatDate(viewingLead.createdAt)}</p>
              </div>
            </div>
            {viewingLead.notes && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Notes</p>
                <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-100">{viewingLead.notes}</p>
              </div>
            )}
            {/* Lead Lifecycle Progress */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Lead Lifecycle</p>
              <div className="flex items-center gap-1">
                {LEAD_STATUSES.filter(s => s !== 'Lost').map((status, idx) => {
                  const currentIdx = LEAD_STATUSES.indexOf(viewingLead.status);
                  const isActive = LEAD_STATUSES.indexOf(status) <= currentIdx && currentIdx < LEAD_STATUSES.indexOf('Won');
                  const isCurrent = status === viewingLead.status;
                  const isWon = viewingLead.status === 'Won' && status === 'Won';
                  return (
                    <div key={status} className="flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isCurrent ? 'bg-orange-500 text-white ring-2 ring-orange-300' :
                        isActive || isWon ? 'bg-green-500 text-white' :
                        'bg-gray-200 text-gray-500'
                      }`}>
                        {idx + 1}
                      </div>
                      {idx < LEAD_STATUSES.filter(s => s !== 'Lost').length - 1 && (
                        <div className={`w-4 h-0.5 ${isActive || isWon ? 'bg-green-500' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {LEAD_STATUSES.filter(s => s !== 'Lost').map(status => (
                  <span key={status} className="text-[9px] text-gray-400 w-6 text-center truncate">{status.split(' ')[0]}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
