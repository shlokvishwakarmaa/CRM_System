import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { leadsApi, customersApi, opportunitiesApi, ticketsApi, usersApi } from '@/utils/api';
import { formatINR, getLeadStatusColor, getPipelineStageColor, getAccountStatusColor, getInitials, getAvatarColor, getRoleLabel, timeAgo } from '@/utils/helpers';
import type { Lead, Opportunity, Customer, Ticket, User } from '@/types';
import {
  Target, Building2, TrendingUp, IndianRupee,
  AlertCircle, ArrowUpRight, ArrowDownRight, Clock,
  Phone, Mail, Calendar, CheckCircle2, XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardData {
  leads: Lead[];
  opportunities: Opportunity[];
  customers: Customer[];
  tickets: Ticket[];
  users: User[];
}

export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData>({ leads: [], opportunities: [], customers: [], tickets: [], users: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [leads, opportunities, customers, tickets, users] = await Promise.all([
          leadsApi.getAll(),
          opportunitiesApi.getAll(),
          customersApi.getAll(),
          ticketsApi.getAll(),
          usersApi.getAll(),
        ]);
        setData({ leads, opportunities, customers, tickets, users });
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  const { leads, opportunities, customers, tickets } = data;

  // Calculate metrics
  const activeLeads = leads.filter(l => !['Won', 'Lost'].includes(l.status));
  const wonLeads = leads.filter(l => l.status === 'Won');
  const activeOpportunities = opportunities.filter(o => !['Closed Won', 'Closed Lost'].includes(o.pipelineStage));
  const wonOpportunities = opportunities.filter(o => o.pipelineStage === 'Closed Won');
  const totalPipelineValue = activeOpportunities.reduce((sum, o) => sum + o.expectedRevenue, 0);
  const totalWonValue = wonOpportunities.reduce((sum, o) => sum + o.expectedRevenue, 0);
  const openTickets = tickets.filter(t => !['Resolved', 'Closed'].includes(t.status));
  const activeCustomers = customers.filter(c => c.accountStatus === 'Active');
  const conversionRate = leads.length > 0 ? ((wonLeads.length / leads.length) * 100).toFixed(1) : '0';

  // Pipeline data
  const pipelineStages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'] as const;
  const pipelineData = pipelineStages.map(stage => ({
    stage,
    count: opportunities.filter(o => o.pipelineStage === stage).length,
    value: opportunities.filter(o => o.pipelineStage === stage).reduce((s, o) => s + o.expectedRevenue, 0),
  }));

  // Lead source distribution
  const leadSources = ['Website', 'Google Ads', 'LinkedIn', 'Facebook', 'Referral', 'Cold Call', 'Email Campaign', 'Trade Show', 'Partner', 'Other'] as const;
  const sourceData = leadSources.map(source => ({
    source,
    count: leads.filter(l => l.source === source).length,
  })).filter(s => s.count > 0);

  const maxSourceCount = Math.max(...sourceData.map(s => s.count), 1);

  const getUserName = (id: string) => data.users.find(u => u.id === id)?.name || 'Unassigned';

  const metrics = [
    { label: 'Active Leads', value: activeLeads.length, icon: Target, color: 'from-blue-500 to-blue-600', change: '+12%', up: true },
    { label: 'Pipeline Value', value: formatINR(totalPipelineValue), icon: IndianRupee, color: 'from-purple-500 to-purple-600', change: '+8.5%', up: true },
    { label: 'Active Customers', value: activeCustomers.length, icon: Building2, color: 'from-green-500 to-green-600', change: '+3', up: true },
    { label: 'Won Revenue', value: formatINR(totalWonValue), icon: TrendingUp, color: 'from-orange-500 to-orange-600', change: `${conversionRate}%`, up: true },
  ];

  // Support metrics only for support role
  const supportMetrics = [
    { label: 'Open Tickets', value: openTickets.length, icon: AlertCircle, color: 'from-red-500 to-red-600', change: openTickets.length > 5 ? 'High' : 'Normal', up: openTickets.length > 5 },
    { label: 'Active Customers', value: activeCustomers.length, icon: Building2, color: 'from-green-500 to-green-600', change: '+3', up: true },
  ];

  const displayMetrics = hasRole('support_executive') && !hasRole('admin', 'sales_manager') ? supportMetrics : metrics;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl" />
        <div className="relative">
          <h2 className="text-2xl font-bold mb-1">Namaste, {user?.name?.split(' ')[0]}! 🙏</h2>
          <p className="text-slate-300">
            {hasRole('support_executive') && !hasRole('admin') 
              ? 'Here are your support tickets and customer updates.'
              : `You have ${activeLeads.length} active leads and ₹${(totalPipelineValue / 100000).toFixed(1)}L in pipeline.`}
          </p>
          <div className="flex gap-3 mt-4">
            {!hasRole('support_executive') || hasRole('admin') ? (
              <>
                <button
                  onClick={() => navigate('/leads')}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm font-medium transition-colors"
                >
                  View Leads
                </button>
                <button
                  onClick={() => navigate('/opportunities')}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors border border-white/20"
                >
                  Pipeline
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/tickets')}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm font-medium transition-colors"
                >
                  View Tickets
                </button>
                <button
                  onClick={() => navigate('/customers')}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors border border-white/20"
                >
                  Customers
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{metric.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${metric.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs">
                {metric.up ? (
                  <ArrowUpRight className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
                )}
                <span className={metric.up ? 'text-green-600' : 'text-red-600'}>{metric.change}</span>
                <span className="text-gray-400 ml-1">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Pipeline */}
        {(!hasRole('support_executive') || hasRole('admin')) && (
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900">Sales Pipeline</h3>
              <button onClick={() => navigate('/opportunities')} className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {pipelineData.map((pd) => {
                const maxVal = Math.max(...pipelineData.map(p => p.value), 1);
                const widthPct = (pd.value / maxVal) * 100;
                return (
                  <div key={pd.stage} className="flex items-center gap-3">
                    <div className="w-28 text-xs font-medium text-gray-600 flex items-center gap-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${getPipelineStageColor(pd.stage).split(' ')[0]}`} />
                      {pd.stage}
                    </div>
                    <div className="flex-1 h-7 bg-gray-100 rounded-lg overflow-hidden relative">
                      <div
                        className={`h-full rounded-lg transition-all duration-500 ${getPipelineStageColor(pd.stage).split(' ')[0]} opacity-70`}
                        style={{ width: `${Math.max(widthPct, pd.count > 0 ? 8 : 0)}%` }}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-gray-700">
                        {pd.count} deal{pd.count !== 1 ? 's' : ''} · {formatINR(pd.value)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Lead Sources */}
        {(!hasRole('support_executive') || hasRole('admin')) && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-5">Lead Sources</h3>
            <div className="space-y-3">
              {sourceData.map((sd) => (
                <div key={sd.source} className="flex items-center gap-3">
                  <div className="w-20 text-xs font-medium text-gray-600 truncate">{sd.source}</div>
                  <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${(sd.count / maxSourceCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-6 text-right">{sd.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Support Pipeline - for support role */}
        {hasRole('support_executive') && (
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900">Support Tickets</h3>
              <button onClick={() => navigate('/tickets')} className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {tickets.filter(t => t.status !== 'Closed').slice(0, 5).map(ticket => (
                <div key={ticket.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => navigate('/tickets')}>
                  <AlertCircle className={`w-5 h-5 flex-shrink-0 ${ticket.priority === 'Critical' ? 'text-red-500' : ticket.priority === 'High' ? 'text-orange-500' : 'text-yellow-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{ticket.title}</p>
                    <p className="text-xs text-gray-500">{ticket.customerName}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    ticket.status === 'Open' ? 'bg-blue-100 text-blue-700' :
                    ticket.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        {(!hasRole('support_executive') || hasRole('admin')) && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Leads</h3>
              <button onClick={() => navigate('/leads')} className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {leads.slice(0, 5).map(lead => (
                <div key={lead.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${getAvatarColor(lead.name)}`}>
                    {getInitials(lead.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{lead.name}</p>
                    <p className="text-xs text-gray-500 truncate">{lead.company}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getLeadStatusColor(lead.status)}`}>
                    {lead.status}
                  </span>
                  <span className="text-xs text-gray-400">{formatINR(lead.estimatedValue)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Customers / Active Deals */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {hasRole('support_executive') && !hasRole('admin') ? 'Recent Customers' : 'Active Opportunities'}
            </h3>
            <button onClick={() => navigate(hasRole('support_executive') && !hasRole('admin') ? '/customers' : '/opportunities')} className="text-sm text-orange-600 hover:text-orange-700 font-medium">
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {hasRole('support_executive') && !hasRole('admin') ? (
              customers.slice(0, 5).map(customer => (
                <div key={customer.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${getAvatarColor(customer.companyName)}`}>
                    {customer.companyName.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{customer.companyName}</p>
                    <p className="text-xs text-gray-500">{customer.customerId} · {customer.location}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getAccountStatusColor(customer.accountStatus)}`}>
                    {customer.accountStatus}
                  </span>
                </div>
              ))
            ) : (
              activeOpportunities.slice(0, 5).map(opp => (
                <div key={opp.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${getPipelineStageColor(opp.pipelineStage).split(' ')[0]}`}>
                    {opp.probability}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{opp.name}</p>
                    <p className="text-xs text-gray-500">{getUserName(opp.salesExecutive)} · Closing {opp.closingDate}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{formatINR(opp.expectedRevenue)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Team Performance (for managers and admins) */}
      {hasRole('admin', 'sales_manager') && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-500 py-3 px-2">Executive</th>
                  <th className="text-center text-xs font-medium text-gray-500 py-3 px-2">Active Leads</th>
                  <th className="text-center text-xs font-medium text-gray-500 py-3 px-2">Won Deals</th>
                  <th className="text-center text-xs font-medium text-gray-500 py-3 px-2">Lost Deals</th>
                  <th className="text-right text-xs font-medium text-gray-500 py-3 px-2">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.users.filter(u => u.role === 'sales_executive').map(exec => {
                  const execLeads = leads.filter(l => l.assignedTo === exec.id);
                  const execOpps = opportunities.filter(o => o.salesExecutive === exec.id);
                  const execWon = execOpps.filter(o => o.pipelineStage === 'Closed Won');
                  const execLost = execOpps.filter(o => o.pipelineStage === 'Closed Lost');
                  const execRevenue = execWon.reduce((s, o) => s + o.expectedRevenue, 0);
                  return (
                    <tr key={exec.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${getAvatarColor(exec.name)}`}>
                            {getInitials(exec.name)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{exec.name}</p>
                            <p className="text-[10px] text-gray-400">{getRoleLabel(exec.role)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center text-sm text-gray-700 py-3 px-2">{execLeads.filter(l => !['Won', 'Lost'].includes(l.status)).length}</td>
                      <td className="text-center py-3 px-2">
                        <span className="inline-flex items-center gap-1 text-sm text-green-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />{execWon.length}
                        </span>
                      </td>
                      <td className="text-center py-3 px-2">
                        <span className="inline-flex items-center gap-1 text-sm text-red-600">
                          <XCircle className="w-3.5 h-3.5" />{execLost.length}
                        </span>
                      </td>
                      <td className="text-right text-sm font-semibold text-gray-900 py-3 px-2">{formatINR(execRevenue)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Activity Feed */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            ...leads.slice(0, 2).map(l => ({ type: 'lead' as const, item: l })),
            ...opportunities.filter(o => o.pipelineStage === 'Closed Won').slice(0, 1).map(o => ({ type: 'won' as const, item: o })),
            ...tickets.filter(t => t.status === 'Open').slice(0, 1).map(t => ({ type: 'ticket' as const, item: t })),
            ...customers.slice(0, 1).map(c => ({ type: 'customer' as const, item: c })),
          ].slice(0, 5).map((activity, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                activity.type === 'lead' ? 'bg-blue-100 text-blue-600' :
                activity.type === 'won' ? 'bg-green-100 text-green-600' :
                activity.type === 'ticket' ? 'bg-red-100 text-red-600' :
                'bg-purple-100 text-purple-600'
              }`}>
                {activity.type === 'lead' ? <Target className="w-4 h-4" /> :
                 activity.type === 'won' ? <CheckCircle2 className="w-4 h-4" /> :
                 activity.type === 'ticket' ? <AlertCircle className="w-4 h-4" /> :
                 <Building2 className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  {activity.type === 'lead' && `New lead "${activity.item.name}" from ${activity.item.company}`}
                  {activity.type === 'won' && `Deal won! "${activity.item.name}" - ${formatINR(activity.item.expectedRevenue)}`}
                  {activity.type === 'ticket' && `New ticket: "${activity.item.title}"`}
                  {activity.type === 'customer' && `Customer "${(activity.item as Customer).companyName}" onboarded`}
                </p>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  {timeAgo(activity.item.createdAt)}
                  {activity.type === 'lead' && <><Phone className="w-3 h-3 ml-2" />{activity.item.phone}</>}
                  {activity.type === 'won' && <><Mail className="w-3 h-3 ml-2" />Confirmation sent</>}
                  {activity.type === 'customer' && <><Calendar className="w-3 h-3 ml-2" />Onboarding meeting</>}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
