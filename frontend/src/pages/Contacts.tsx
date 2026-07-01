// This is the code for contacts detail //


import { useState, useEffect, useCallback } from 'react';
import { contactsApi } from '@/utils/api';
import { formatDate, getInitials, getAvatarColor } from '@/utils/helpers';
import type { Contact } from '@/types';
import Modal from '@/components/Modal';
import { Search, Plus, Phone, Mail, MapPin, Building2, Briefcase, StickyNote, X, Download, Upload } from 'lucide-react';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [viewingContact, setViewingContact] = useState<Contact | null>(null);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '',
    designation: '', location: '', notes: '', leadSource: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const allContacts = await contactsApi.getAll();
      setContacts(allContacts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredContacts = contacts.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.designation.toLowerCase().includes(q);
  });

  const openCreate = () => {
    setEditingContact(null);
    setForm({ name: '', email: '', phone: '', company: '', designation: '', location: '', notes: '', leadSource: '' });
    setShowModal(true);
  };

  const openEdit = (contact: Contact) => {
    setEditingContact(contact);
    setForm({
      name: contact.name, email: contact.email, phone: contact.phone,
      company: contact.company, designation: contact.designation,
      location: contact.location, notes: contact.notes,
      leadSource: contact.leadSource || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingContact) {
        await contactsApi.update(editingContact.id, form);
      } else {
        await contactsApi.create(form);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      await contactsApi.delete(id);
      loadData();
    }
  };

  const handleExport = () => {
    const csv = [
      ['Name', 'Email', 'Phone', 'Company', 'Designation', 'Location', 'Notes'].join(','),
      ...contacts.map(c => [c.name, c.email, c.phone, c.company, c.designation, c.location, `"${c.notes.replace(/"/g, '""')}"`].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leadcrm_contacts.csv';
    a.click();
    URL.revokeObjectURL(url);
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
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-sm text-gray-500">{contacts.length} contacts · {filteredContacts.length} shown</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add Contact
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search contacts by name, email, company, location..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Contacts Grid */}
      {filteredContacts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Upload className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-400">No contacts found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredContacts.map(contact => (
            <div
              key={contact.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => setViewingContact(contact)}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold ${getAvatarColor(contact.name)}`}>
                  {getInitials(contact.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{contact.name}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    {contact.designation}
                  </p>
                </div>
              </div>
              <div className="space-y-1.5 mb-3">
                <p className="text-xs text-gray-600 flex items-center gap-1.5 truncate">
                  <Building2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" /> {contact.company}
                </p>
                <p className="text-xs text-gray-600 flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" /> {contact.email}
                </p>
                <p className="text-xs text-gray-600 flex items-center gap-1.5 truncate">
                  <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" /> {contact.phone}
                </p>
                <p className="text-xs text-gray-600 flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" /> {contact.location}
                </p>
              </div>
              {contact.notes && (
                <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-2 line-clamp-2 flex items-start gap-1">
                  <StickyNote className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  {contact.notes}
                </p>
              )}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className="text-[10px] text-gray-400">Added {formatDate(contact.createdAt)}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); openEdit(contact); }} className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 text-xs">Edit</button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(contact.id); }} className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 text-xs">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingContact ? 'Edit Contact' : 'Add New Contact'} size="lg">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input type="text" value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Company name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
              <input type="text" value={form.designation} onChange={e => setForm({...form, designation: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Job title" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" placeholder="City, State" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lead Source</label>
              <input type="text" value={form.leadSource} onChange={e => setForm({...form, leadSource: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Where did this contact come from?" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none" placeholder="Add notes..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg">
              {editingContact ? 'Update Contact' : 'Create Contact'}
            </button>
          </div>
        </div>
      </Modal>

      {/* View Contact Modal */}
      <Modal isOpen={!!viewingContact} onClose={() => setViewingContact(null)} title="Contact Details" size="md">
        {viewingContact && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold ${getAvatarColor(viewingContact.name)}`}>
                {getInitials(viewingContact.name)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{viewingContact.name}</h3>
                <p className="text-sm text-gray-500">{viewingContact.designation} at {viewingContact.company}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{viewingContact.location}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-lg p-4">
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900 flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{viewingContact.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-medium text-gray-900 flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{viewingContact.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Company</p>
                <p className="text-sm font-medium text-gray-900 flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{viewingContact.company}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Lead Source</p>
                <p className="text-sm text-gray-900">{viewingContact.leadSource || 'N/A'}</p>
              </div>
            </div>
            {viewingContact.notes && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Notes</p>
                <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-100">{viewingContact.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}


