// this is a detail code for opportunities which includes qualification, prospecting, proposal, negotiation, closed won  //

import { useState, useEffect, useCallback } from 'react';
import { opportunitiesApi, customersApi, usersApi } from '@/utils/api';
import { formatINR, formatDate, getPipelineStageColor } from '@/utils/helpers';
import type { Opportunity, PipelineStage, Customer, User } from '@/types';
import Modal from '@/components/Modal';
import { useAuth } from '@/context/AuthContext';
import {
  Plus, IndianRupee, Calendar, User as UserIcon,
  GripVertical, LayoutGrid, List, Search, X, ChevronDown
} from 'lucide-react';

const PIPELINE_STAGES: PipelineStage[] = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

export default function OpportunitiesPage() {
  const { user, hasRole } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingOpp, setEditingOpp] = useState<Opportunity | null>(null);
  const [viewingOpp, setViewingOpp] = useState<Opportunity | null>(null);

  const [form, setForm] = useState({
    name: '', expectedRevenue: 0, closingDate: '',
    associatedCustomer: '', salesExecutive: '',
    pipelineStage: 'Prospecting' as PipelineStage,
    probability: 10, description: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let allOpps = await opportunitiesApi.getAll();
      if (hasRole('sales_executive') && !hasRole('admin', 'sales_manager')) {
        allOpps = allOpps.filter(o => o.salesExecutive === user?.id);
      }
      setOpportunities(allOpps);
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
  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.companyName || 'No Customer';

  const filteredOpportunities = opportunities.filter(o => {
    if (!search) return true;
    const q = search.toLowerCase();
    return o.name.toLowerCase().includes(q) ||
      getUserName(o.salesExecutive).toLowerCase().includes(q) ||
      getCustomerName(o.associatedCustomer).toLowerCase().includes(q);
  });

  const openCreate = (stage?: PipelineStage) => {
    setEditingOpp(null);
    setForm({
      name: '', expectedRevenue: 0, closingDate: new Date().toISOString().split('T')[0],
      associatedCustomer: '', salesExecutive: hasRole('sales_executive') ? (user?.id || '') : '',
      pipelineStage: stage || 'Prospecting', probability: 10, description: '',
    });
    setShowModal(true);
  };

  const openEdit = (opp: Opportunity) => {
    setEditingOpp(opp);
    setForm({
      name: opp.name, expectedRevenue: opp.expectedRevenue,
      closingDate: opp.closingDate, associatedCustomer: opp.associatedCustomer,
      salesExecutive: opp.salesExecutive, pipelineStage: opp.pipelineStage,
      probability: opp.probability, description: opp.description,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingOpp) {
        await opportunitiesApi.update(editingOpp.id, form);
      } else {
        await opportunitiesApi.create(form);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this opportunity?')) {
      await opportunitiesApi.delete(id);
      loadData();
    }
  };

  const handleStageChange = async (oppId: string, newStage: PipelineStage) => {
    await opportunitiesApi.updateStage(oppId, newStage);
    loadData();
  };

  const [draggedOpp, setDraggedOpp] = useState<string | null>(null);

  const handleDragStart = (oppId: string) => {
    setDraggedOpp(oppId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (stage: PipelineStage) => {
    if (draggedOpp) {
      handleStageChange(draggedOpp, stage);
      setDraggedOpp(null);
    }
  };

  // Pipeline totals
  const pipelineTotals = PIPELINE_STAGES.map(stage => ({
    stage,
    count: filteredOpportunities.filter(o => o.pipelineStage === stage).length,
    value: filteredOpportunities.filter(o => o.pipelineStage === stage).reduce((s, o) => s + o.expectedRevenue, 0),
  }));

  const totalPipelineValue = filteredOpportunities.filter(o => !['Closed Won', 'Closed Lost'].includes(o.pipelineStage)).reduce((s, o) => s + o.expectedRevenue, 0);
  const weightedPipeline = filteredOpportunities.filter(o => !['Closed Won', 'Closed Lost'].includes(o.pipelineStage)).reduce((s, o) => s + (o.expectedRevenue * o.probability / 100), 0);

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
          <h1 className="text-2xl font-bold text-gray-900">Opportunities</h1>
          <p className="text-sm text-gray-500">Pipeline: {formatINR(totalPipelineValue)} · Weighted: {formatINR(weightedPipeline)}</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setViewMode('kanban')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === 'kanban' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
          <button onClick={() => openCreate()} className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add Opportunity
          </button>
        </div>
      </div>

      {/* Pipeline Summary Bar */}
      <div className="flex gap-1 h-3 rounded-full overflow-hidden">
        {pipelineTotals.filter(pt => !['Closed Won', 'Closed Lost'].includes(pt.stage)).map(pt => (
          <div
            key={pt.stage}
            className={`${getPipelineStageColor(pt.stage).split(' ')[0]} transition-all duration-500`}
            style={{ width: `${totalPipelineValue > 0 ? (pt.value / totalPipelineValue) * 100 : 0}%` }}
            title={`${pt.stage}: ${formatINR(pt.value)}`}
          />
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search opportunities..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
        {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X className="w-4 h-4" /></button>}
      </div>

      {/* Kanban Board */}
      {viewMode === 'kanban' ? (
        <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 300px)' }}>
          {PIPELINE_STAGES.map(stage => {
            const stageOpps = filteredOpportunities.filter(o => o.pipelineStage === stage);
            const stageValue = stageOpps.reduce((s, o) => s + o.expectedRevenue, 0);
            return (
              <div
                key={stage}
                className="flex-shrink-0 w-72 flex flex-col"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(stage)}
              >
                {/* Column Header */}
                <div className={`rounded-t-xl p-3 border-b-2 ${getPipelineStageColor(stage)}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold">{stage}</h3>
                    <span className="text-xs font-medium bg-white/50 rounded-full px-2 py-0.5">{stageOpps.length}</span>
                  </div>
                  <p className="text-[11px] mt-0.5 opacity-75">{formatINR(stageValue)}</p>
                </div>

                {/* Cards */}
                <div className="flex-1 bg-gray-100 rounded-b-xl p-2 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
                  {stageOpps.map(opp => (
                    <div
                      key={opp.id}
                      draggable
                      onDragStart={() => handleDragStart(opp.id)}
                      className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                      onClick={() => setViewingOpp(opp)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900 leading-tight flex-1">{opp.name}</h4>
                        <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-green-600 flex items-center gap-1">
                          <IndianRupee className="w-3 h-3" />{formatINR(opp.expectedRevenue)}
                        </p>
                        <p className="text-[11px] text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />{opp.closingDate}
                        </p>
                        <p className="text-[11px] text-gray-500 flex items-center gap-1">
                          <UserIcon className="w-3 h-3" />{getUserName(opp.salesExecutive)}
                        </p>
                      </div>
                      {/* Probability bar */}
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              opp.probability >= 75 ? 'bg-green-500' :
                              opp.probability >= 50 ? 'bg-blue-500' :
                              opp.probability >= 25 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${opp.probability}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-medium text-gray-500">{opp.probability}%</span>
                      </div>
                    </div>
                  ))}
                  {stageOpps.length === 0 && (
                    <div className="text-center py-6 text-xs text-gray-400">
                      Drag deals here
                    </div>
                  )}
                  <button
                    onClick={() => openCreate(stage)}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-xs text-gray-400 hover:text-orange-500 hover:border-orange-300 transition-colors"
                  >
                    + Add Deal
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Opportunity</th>
                  <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Stage</th>
                  <th className="text-right text-xs font-medium text-gray-500 py-3 px-4">Revenue</th>
                  <th className="text-center text-xs font-medium text-gray-500 py-3 px-4">Probability</th>
                  <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Executive</th>
                  <th className="text-left text-xs font-medium text-gray-500 py-3 px-4">Closing</th>
                  <th className="text-right text-xs font-medium text-gray-500 py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOpportunities.map(opp => (
                  <tr key={opp.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-gray-900">{opp.name}</p>
                      <p className="text-xs text-gray-500">{getCustomerName(opp.associatedCustomer)}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="relative">
                        <select
                          value={opp.pipelineStage}
                          onChange={e => handleStageChange(opp.id, e.target.value as PipelineStage)}
                          className={`appearance-none text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer pr-5 ${getPipelineStageColor(opp.pipelineStage)}`}
                        >
                          {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-semibold text-gray-900">{formatINR(opp.expectedRevenue)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${opp.probability >= 75 ? 'bg-green-500' : opp.probability >= 50 ? 'bg-blue-500' : opp.probability >= 25 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${opp.probability}%` }} />
                        </div>
                        <span className="text-xs font-medium text-gray-600">{opp.probability}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{getUserName(opp.salesExecutive)}</td>
                    <td className="py-3 px-4 text-xs text-gray-500">{formatDate(opp.closingDate)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(opp)} className="text-xs px-2 py-1 rounded text-blue-600 hover:bg-blue-50">Edit</button>
                        <button onClick={() => handleDelete(opp.id)} className="text-xs px-2 py-1 rounded text-red-600 hover:bg-red-50">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingOpp ? 'Edit Opportunity' : 'Add New Opportunity'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Opportunity Name *</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" placeholder="e.g., Enterprise CRM Deal" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Revenue (₹) *</label>
              <input type="number" value={form.expectedRevenue} onChange={e => setForm({...form, expectedRevenue: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Closing Date</label>
              <input type="date" value={form.closingDate} onChange={e => setForm({...form, closingDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Associated Customer</label>
              <select value={form.associatedCustomer} onChange={e => setForm({...form, associatedCustomer: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none">
                <option value="">No Customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sales Executive</label>
              <select value={form.salesExecutive} onChange={e => setForm({...form, salesExecutive: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none">
                <option value="">Unassigned</option>
                {users.filter(u => u.role === 'sales_executive' || u.role === 'sales_manager').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pipeline Stage</label>
              <select value={form.pipelineStage} onChange={e => setForm({...form, pipelineStage: e.target.value as PipelineStage})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none">
                {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Probability (%)</label>
              <input type="number" min="0" max="100" value={form.probability} onChange={e => setForm({...form, probability: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none" placeholder="Describe this opportunity..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg">
              {editingOpp ? 'Update' : 'Create'} Opportunity
            </button>
          </div>
        </div>
      </Modal>

      {/* View Opportunity Modal */}
      <Modal isOpen={!!viewingOpp} onClose={() => setViewingOpp(null)} title="Opportunity Details" size="md">
        {viewingOpp && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{viewingOpp.name}</h3>
                <p className="text-sm text-gray-500">{getCustomerName(viewingOpp.associatedCustomer)}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPipelineStageColor(viewingOpp.pipelineStage)}`}>
                {viewingOpp.pipelineStage}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-lg p-4">
              <div>
                <p className="text-xs text-gray-500">Expected Revenue</p>
                <p className="text-lg font-bold text-green-600">{formatINR(viewingOpp.expectedRevenue)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Weighted Value</p>
                <p className="text-lg font-bold text-blue-600">{formatINR(viewingOpp.expectedRevenue * viewingOpp.probability / 100)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Closing Date</p>
                <p className="text-sm font-medium text-gray-900 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(viewingOpp.closingDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Sales Executive</p>
                <p className="text-sm font-medium text-gray-900 flex items-center gap-1"><UserIcon className="w-3.5 h-3.5" />{getUserName(viewingOpp.salesExecutive)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Probability</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${viewingOpp.probability >= 75 ? 'bg-green-500' : viewingOpp.probability >= 50 ? 'bg-blue-500' : viewingOpp.probability >= 25 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${viewingOpp.probability}%` }} />
                  </div>
                  <span className="text-sm font-bold text-gray-900">{viewingOpp.probability}%</span>
                </div>
              </div>
            </div>
            {viewingOpp.description && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-100">{viewingOpp.description}</p>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <button onClick={() => { openEdit(viewingOpp); setViewingOpp(null); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Edit</button>
              <button onClick={() => { handleDelete(viewingOpp.id); setViewingOpp(null); }} className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg">Delete</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
