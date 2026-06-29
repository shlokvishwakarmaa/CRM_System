// ============== CURRENCY FORMATTING (INR) ==============
export function formatINR(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatINRFull(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// ============== DATE FORMATTING ==============
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

// ============== ROLE HELPERS ==============
export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: 'Admin',
    sales_manager: 'Sales Manager',
    sales_executive: 'Sales Executive',
    support_executive: 'Support Executive',
  };
  return labels[role] || role;
}

export function getRoleBadgeColor(role: string): string {
  const colors: Record<string, string> = {
    admin: 'bg-red-100 text-red-800',
    sales_manager: 'bg-purple-100 text-purple-800',
    sales_executive: 'bg-blue-100 text-blue-800',
    support_executive: 'bg-green-100 text-green-800',
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
}

// ============== STATUS HELPERS ==============
export function getLeadStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'New': 'bg-blue-100 text-blue-800',
    'Contacted': 'bg-cyan-100 text-cyan-800',
    'Qualified': 'bg-yellow-100 text-yellow-800',
    'Meeting Scheduled': 'bg-orange-100 text-orange-800',
    'Proposal Sent': 'bg-indigo-100 text-indigo-800',
    'Negotiation': 'bg-purple-100 text-purple-800',
    'Won': 'bg-green-100 text-green-800',
    'Lost': 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getPipelineStageColor(stage: string): string {
  const colors: Record<string, string> = {
    'Prospecting': 'bg-blue-100 text-blue-800 border-blue-200',
    'Qualification': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    'Proposal': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Negotiation': 'bg-purple-100 text-purple-800 border-purple-200',
    'Closed Won': 'bg-green-100 text-green-800 border-green-200',
    'Closed Lost': 'bg-red-100 text-red-800 border-red-200',
  };
  return colors[stage] || 'bg-gray-100 text-gray-800 border-gray-200';
}

export function getTicketPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    'Low': 'bg-green-100 text-green-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'High': 'bg-orange-100 text-orange-800',
    'Critical': 'bg-red-100 text-red-800',
  };
  return colors[priority] || 'bg-gray-100 text-gray-800';
}

export function getTicketStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'Open': 'bg-blue-100 text-blue-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
    'Waiting on Customer': 'bg-orange-100 text-orange-800',
    'Resolved': 'bg-green-100 text-green-800',
    'Closed': 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getAccountStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'Active': 'bg-green-100 text-green-800',
    'Inactive': 'bg-yellow-100 text-yellow-800',
    'Churned': 'bg-red-100 text-red-800',
    'Onboarding': 'bg-blue-100 text-blue-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

// ============== INITIALS ==============
export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// ============== AVATAR COLOR ==============
export function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
    'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-red-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
