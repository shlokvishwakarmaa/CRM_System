import { useState, useEffect, useCallback } from 'react';
import { ticketsApi, customersApi, usersApi } from '@/utils/api';
import { formatDate, getTicketPriorityColor, getTicketStatusColor, timeAgo } from '@/utils/helpers';
import type { Ticket, TicketPriority, TicketStatus, Customer, User } from '@/types';
import Modal from '@/components/Modal';
import { useAuth } from '@/context/AuthContext';
import { Search, Plus, AlertCircle, Clock, CheckCircle, X } from 'lucide-react';

const PRIORITIES: TicketPriority[] = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES: TicketStatus[] = ['Open', 'In Progress', 'Waiting on Customer', 'Resolved', 'Closed'];
const CATEGORIES = ['Technical', 'Bug', 'Feature Request', 'Billing', 'Access', 'Onboarding', 'General'];

const SUPPORT_WORKFLOW: Record<TicketStatus, TicketStatus[]> = {
  'Open': ['In Progress'],
  'In Progress': ['Waiting on Customer', 'Resolved'],
  'Waiting on Customer': ['In Progress', 'Resolved'],
  'Resolved': ['Closed', 'In Progress'],
  'Closed': [],
};

export default function TicketsPage() {
  const { user, hasRole } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null);

  const [form, setForm] = useState({
    title: '', description: '', customerId: '',
    customerName: '', assignedTo: '', priority: 'Medium' as TicketPriority,
    category: 'General',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let allTickets = await ticketsApi.getAll();
      if (hasRole('support_executive') && !hasRole('admin')) {
        allTickets = allTickets.filter(t => t.assignedTo === user?.id);
      }
      setTickets(allTickets);
      const allCustomers = await customersApi.getAll();
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

  const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Unassigned';

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.customerName.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || t.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const openCreate = () => {
    setEditingTicket(null);
    setForm({
      title: '', description: '', customerId: '',
      customerName: '', assignedTo: hasRole('support_executive') ? (user?.id || '') : '',
      priority: 'Medium', category: 'General',
    });
    setShowModal(true);
  };

  const openEdit = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setForm({
      title: ticket.title, description: ticket.description,
      customerId: ticket.customerId, customerName: ticket.customerName,
      assignedTo: ticket.assignedTo, priority: ticket.priority,
      category: ticket.category,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingTicket) {
        await ticketsApi.update(editingTicket.id, form);
      } else {
        await ticketsApi.create(form);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this ticket?')) {
      await ticketsApi.delete(id);
      loadData();
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: TicketStatus) => {
    await ticketsApi.updateStatus(ticketId, newStatus);
    loadData();
  };

  // Status counts
  const statusCounts = STATUSES.reduce((acc, status) => {
    acc[status] = tickets.filter(t => t.status === status).length;
    return acc;
  }, {} as Record<string, number>);

  // Support workflow visualization
  const WORKFLOW_STEPS = ['Complaint', 'Ticket Created', 'Assigned', 'Resolved', 'Closed'];
  const getWorkflowStep = (status: TicketStatus): number => {
    switch (status) {
      case 'Open': return 1;
      case 'In Progress': return 2;
      case 'Waiting on Customer': return 2;
      case 'Resolved': return 3;
      case 'Closed': return 4;
      default: return 0;
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-sm text-gray-500">{tickets.length} total · {statusCounts['Open'] || 0} open · {statusCounts['In Progress'] || 0} in progress</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Create Ticket
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button onClick={() => setFilterStatus('all')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${filterStatus === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          All ({tickets.length})
        </button>
        {STATUSES.map(status => (
          <button key={status} onClick={() => setFilterStatus(status)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${filterStatus === status ? 'bg-gray-900 text-white' : `${getTicketStatusColor(status)} hover:opacity-80`}`}>
            {status} ({statusCounts[status] || 0})
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X className="w-4 h-4" /></button>}
        </div>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none">
          <option value="all">All Priorities</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <AlertCircle className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-400">No tickets found</p>
          </div>
        ) : (
          filteredTickets.map(ticket => {
            const workflowStep = getWorkflowStep(ticket.status);
            return (
              <div key={ticket.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setViewingTicket(ticket)}>
                <div className="flex items-start gap-4">
                  {/* Priority Indicator */}
                  <div className={`w-1 h-12 rounded-full flex-shrink-0 ${
                    ticket.priority === 'Critical' ? 'bg-red-500' :
                    ticket.priority === 'High' ? 'bg-orange-500' :
                    ticket.priority === 'Medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-gray-900">{ticket.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getTicketPriorityColor(ticket.priority)}`}>{ticket.priority}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getTicketStatusColor(ticket.status)}`}>{ticket.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1">{ticket.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-400">
                      <span>{ticket.customerName}</span>
                      <span>· {ticket.category}</span>
                      <span>· Assigned: {getUserName(ticket.assignedTo)}</span>
                      <span>· {timeAgo(ticket.createdAt)}</span>
                    </div>
                  </div>

                  {/* Workflow Progress */}
                  <div className="hidden md:flex items-center gap-1 flex-shrink-0">
                    {WORKFLOW_STEPS.map((step, idx) => (
                      <div key={step} className="flex items-center">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                          idx <= workflowStep ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                        }`}>
                          {idx <= workflowStep ? '✓' : idx + 1}
                        </div>
                        {idx < WORKFLOW_STEPS.length - 1 && (
                          <div className={`w-3 h-0.5 ${idx < workflowStep ? 'bg-green-500' : 'bg-gray-200'}`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingTicket ? 'Edit Ticket' : 'Create Ticket'} size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Ticket title" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none" placeholder="Describe the issue..." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <select value={form.customerId} onChange={e => {
                const cust = customers.find(c => c.id === e.target.value);
                setForm({...form, customerId: e.target.value, customerName: cust?.companyName || ''});
              }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none">
                <option value="">Select Customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
              <select value={form.assignedTo} onChange={e => setForm({...form, assignedTo: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none">
                <option value="">Unassigned</option>
                {users.filter(u => u.role === 'support_executive').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value as TicketPriority})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none">
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg">
              {editingTicket ? 'Update' : 'Create'} Ticket
            </button>
          </div>
        </div>
      </Modal>

      {/* View Ticket Modal */}
      <Modal isOpen={!!viewingTicket} onClose={() => setViewingTicket(null)} title="Ticket Details" size="lg">
        {viewingTicket && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`w-1.5 h-10 rounded-full flex-shrink-0 ${
                  viewingTicket.priority === 'Critical' ? 'bg-red-500' :
                  viewingTicket.priority === 'High' ? 'bg-orange-500' :
                  viewingTicket.priority === 'Medium' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`} />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{viewingTicket.title}</h3>
                  <p className="text-xs text-gray-500">{viewingTicket.customerName} · {viewingTicket.category}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getTicketPriorityColor(viewingTicket.priority)}`}>{viewingTicket.priority}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getTicketStatusColor(viewingTicket.status)}`}>{viewingTicket.status}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">{viewingTicket.description}</p>
            </div>

            {/* Workflow Progress */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Support Workflow</p>
              <div className="flex items-center gap-2">
                {WORKFLOW_STEPS.map((step, idx) => {
                  const currentStep = getWorkflowStep(viewingTicket.status);
                  const isCompleted = idx <= currentStep;
                  return (
                    <div key={step} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                        }`}>
                          {isCompleted ? (idx === 4 ? <CheckCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />) : <Clock className="w-4 h-4" />}
                        </div>
                        <span className="text-[9px] mt-1 text-center w-16 text-gray-400">{step}</span>
                      </div>
                      {idx < WORKFLOW_STEPS.length - 1 && (
                        <div className={`w-6 h-0.5 ${idx < currentStep ? 'bg-green-500' : 'bg-gray-200'} mb-5`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-lg p-4">
              <div>
                <p className="text-xs text-gray-500">Assigned To</p>
                <p className="text-sm font-medium text-gray-900">{getUserName(viewingTicket.assignedTo)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Created</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(viewingTicket.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Last Updated</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(viewingTicket.updatedAt)}</p>
              </div>
              {viewingTicket.resolvedAt && (
                <div>
                  <p className="text-xs text-gray-500">Resolved</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(viewingTicket.resolvedAt)}</p>
                </div>
              )}
            </div>

            {/* Status Change */}
            {SUPPORT_WORKFLOW[viewingTicket.status].length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Change Status</p>
                <div className="flex gap-2">
                  {SUPPORT_WORKFLOW[viewingTicket.status].map(nextStatus => (
                    <button
                      key={nextStatus}
                      onClick={async () => {
                        await handleStatusChange(viewingTicket.id, nextStatus);
                        const updated = await ticketsApi.getById(viewingTicket.id);
                        if (updated) setViewingTicket(updated);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${getTicketStatusColor(nextStatus)} hover:opacity-80 transition-opacity`}
                    >
                      → {nextStatus}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button onClick={() => { openEdit(viewingTicket); setViewingTicket(null); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Edit</button>
              <button onClick={() => { handleDelete(viewingTicket.id); setViewingTicket(null); }} className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg">Delete</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
