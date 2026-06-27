import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Lead from '../models/Lead.js';
import Contact from '../models/Contact.js';
import Customer from '../models/Customer.js';
import Opportunity from '../models/Opportunity.js';
import Ticket from '../models/Ticket.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📊 Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany();
    await Lead.deleteMany();
    await Contact.deleteMany();
    await Customer.deleteMany();
    await Opportunity.deleteMany();
    await Ticket.deleteMany();

    // Seed Users
    console.log('👥 Seeding users...');
    const users = await User.create([
      {
        name: 'Rajesh Sharma',
        email: 'rajesh@leadcrm.in',
        password: 'admin123',
        role: 'admin',
        phone: '+91 98765 43210',
        department: 'Administration',
        isActive: true,
      },
      {
        name: 'Amit Kumar',
        email: 'amit@leadcrm.in',
        password: 'executive123',
        role: 'sales_executive',
        phone: '+91 98765 43212',
        department: 'Sales',
        isActive: true,
      },
      {
        name: 'Sneha Reddy',
        email: 'sneha@leadcrm.in',
        password: 'support123',
        role: 'support_executive',
        phone: '+91 98765 43213',
        department: 'Support',
        isActive: true,
      },
      {
        name: 'Vikram Singh',
        email: 'vikram@leadcrm.in',
        password: 'executive123',
        role: 'sales_executive',
        phone: '+91 98765 43214',
        department: 'Sales',
        isActive: true,
      },
      {
        name: 'Anjali Gupta',
        email: 'anjali@leadcrm.in',
        password: 'support123',
        role: 'support_executive',
        phone: '+91 98765 43215',
        department: 'Support',
        isActive: true,
      },
    ]);

    const [admin, manager, amit, sneha, vikram, anjali] = users;

    // Seed Leads
    console.log('🎯 Seeding leads...');
    const leads = await Lead.create([
      {
        name: 'Suresh Menon',
        email: 'suresh@techsolutions.in',
        phone: '+91 99887 76655',
        company: 'TechSolutions India Pvt Ltd',
        industry: 'Information Technology',
        source: 'Website',
        status: 'New',
        estimatedValue: 500000,
        assignedTo: amit._id,
        notes: 'Interested in our enterprise CRM package. Follow up next week.',
        createdBy: amit._id,
      },
      {
        name: 'Kavitha Nair',
        email: 'kavitha@keralaexports.com',
        phone: '+91 94430 12345',
        company: 'Kerala Exports Ltd',
        industry: 'Export & Import',
        source: 'LinkedIn',
        status: 'Contacted',
        estimatedValue: 750000,
        assignedTo: amit._id,
        notes: 'Had initial call. Looking for supply chain management solution.',
        createdBy: amit._id,
      },
      {
        name: 'Deepak Joshi',
        email: 'deepak@maharashtrahealth.in',
        phone: '+91 98234 56789',
        company: 'Maharashtra HealthCare',
        industry: 'Healthcare',
        source: 'Referral',
        status: 'Qualified',
        estimatedValue: 1200000,
        assignedTo: vikram._id,
        notes: 'Referred by Dr. Mehta. Needs patient management system.',
        createdBy: vikram._id,
      },
      {
        name: 'Ritu Agarwal',
        email: 'ritu@delhiconstruction.in',
        phone: '+91 97123 45678',
        company: 'Delhi Construction Corp',
        industry: 'Real Estate & Construction',
        source: 'Google Ads',
        status: 'Proposal Sent',
        estimatedValue: 2500000,
        assignedTo: vikram._id,
        notes: 'Sent detailed proposal for project management suite. Awaiting response.',
        createdBy: vikram._id,
      },
      {
        name: 'Mohammed Faisal',
        email: 'faisal@hyderabadauto.in',
        phone: '+91 98876 54321',
        company: 'Hyderabad Auto Parts',
        industry: 'Automotive',
        source: 'Trade Show',
        status: 'Negotiation',
        estimatedValue: 1800000,
        assignedTo: amit._id,
        notes: 'Negotiating pricing. Decision expected by end of month.',
        createdBy: amit._id,
      },
      {
        name: 'Arjun Malhotra',
        email: 'arjun@mumbaistartup.in',
        phone: '+91 99876 11111',
        company: 'Mumbai Startup Hub',
        industry: 'Technology',
        source: 'Email Campaign',
        status: 'Won',
        estimatedValue: 600000,
        assignedTo: amit._id,
        notes: 'Deal closed! Onboarding started.',
        createdBy: amit._id,
      },
    ]);

    // Seed Contacts
    console.log('📇 Seeding contacts...');
    await Contact.create([
      {
        name: 'Sanjay Verma',
        email: 'sanjay@tataconsulting.in',
        phone: '+91 98765 11111',
        company: 'Tata Consulting Services',
        designation: 'VP of Operations',
        location: 'Mumbai, Maharashtra',
        notes: 'Key decision maker for enterprise deals. Prefers email communication.',
        createdBy: amit._id,
      },
      {
        name: 'Nandini Rao',
        email: 'nandini@infosystech.in',
        phone: '+91 98765 22222',
        company: 'Infosys Technologies',
        designation: 'Director of Sales',
        location: 'Bangalore, Karnataka',
        notes: 'Long-term relationship. Interested in expanding current contract.',
        createdBy: vikram._id,
      },
      {
        name: 'Ashok Tiwari',
        email: 'ashok@relianceretail.in',
        phone: '+91 98765 33333',
        company: 'Reliance Retail',
        designation: 'CTO',
        location: 'Mumbai, Maharashtra',
        notes: 'Met at Tech Summit 2024. Very interested in retail analytics.',
        createdBy: amit._id,
      },
    ]);

    // Seed Customers
    console.log('🏢 Seeding customers...');
    const customers = await Customer.create([
      {
        companyName: 'Arjun Enterprises Pvt Ltd',
        industry: 'Information Technology',
        revenue: 5000000,
        assignedExecutive: amit._id,
        accountStatus: 'Active',
        contactEmail: 'billing@arjunenterprises.in',
        contactPhone: '+91 99887 65544',
        location: 'Bangalore, Karnataka',
        interactions: [
          {
            type: 'call',
            description: 'Quarterly review call - discussed renewal',
            by: amit._id,
            date: new Date('2024-10-20'),
          },
        ],
        createdBy: amit._id,
      },
      {
        companyName: 'Chennai Logistics Corp',
        industry: 'Logistics & Supply Chain',
        revenue: 8500000,
        assignedExecutive: vikram._id,
        accountStatus: 'Active',
        contactEmail: 'ops@chennailogistics.in',
        contactPhone: '+91 94411 99887',
        location: 'Chennai, Tamil Nadu',
        interactions: [
          {
            type: 'call',
            description: 'Monthly check-in call',
            by: vikram._id,
            date: new Date('2024-11-01'),
          },
        ],
        createdBy: vikram._id,
      },
      {
        companyName: 'Delhi EduTech Solutions',
        industry: 'Education Technology',
        revenue: 3200000,
        assignedExecutive: vikram._id,
        accountStatus: 'Onboarding',
        contactEmail: 'hello@delhiedutech.in',
        contactPhone: '+91 97112 33445',
        location: 'New Delhi',
        interactions: [
          {
            type: 'meeting',
            description: 'Onboarding kickoff meeting',
            by: vikram._id,
            date: new Date('2024-11-01'),
          },
        ],
        createdBy: vikram._id,
      },
    ]);

    // Seed Opportunities
    console.log('💼 Seeding opportunities...');
    await Opportunity.create([
      {
        name: 'TechSolutions Enterprise Deal',
        expectedRevenue: 500000,
        closingDate: new Date('2024-12-15'),
        associatedCustomer: customers[0]._id,
        salesExecutive: amit._id,
        pipelineStage: 'Qualification',
        probability: 40,
        description: 'Enterprise CRM package for IT company with 200+ users',
        createdBy: amit._id,
      },
      {
        name: 'Delhi Construction PM Suite',
        expectedRevenue: 2500000,
        closingDate: new Date('2024-12-20'),
        salesExecutive: vikram._id,
        pipelineStage: 'Proposal',
        probability: 60,
        description: 'Project management suite for construction company',
        createdBy: vikram._id,
      },
      {
        name: 'Hyderabad Auto Parts ERP Integration',
        expectedRevenue: 1800000,
        closingDate: new Date('2024-11-30'),
        salesExecutive: amit._id,
        pipelineStage: 'Negotiation',
        probability: 75,
        description: 'ERP integration with CRM for auto parts manufacturer',
        createdBy: amit._id,
      },
      {
        name: 'Mumbai Startup Hub Basic CRM',
        expectedRevenue: 600000,
        closingDate: new Date('2024-10-20'),
        salesExecutive: amit._id,
        pipelineStage: 'Closed Won',
        probability: 100,
        description: 'Basic CRM package for startup incubator',
        createdBy: amit._id,
      },
    ]);

    // Seed Tickets
    console.log('🎫 Seeding tickets...');
    await Ticket.create([
      {
        title: 'Login issue on mobile app',
        description: 'Customer reports inability to login on the mobile application. Getting "Invalid credentials" error despite correct login.',
        customerId: customers[0]._id,
        customerName: 'Arjun Enterprises Pvt Ltd',
        assignedTo: sneha._id,
        status: 'In Progress',
        priority: 'High',
        category: 'Technical',
        createdBy: admin._id,
      },
      {
        title: 'Report generation failing',
        description: 'Monthly sales report generation throwing 500 error for Chennai Logistics account.',
        customerId: customers[1]._id,
        customerName: 'Chennai Logistics Corp',
        assignedTo: anjali._id,
        status: 'Open',
        priority: 'Critical',
        category: 'Bug',
        createdBy: admin._id,
      },
      {
        title: 'Data import assistance needed',
        description: 'New customer needs help importing existing data from their old CRM system.',
        customerId: customers[2]._id,
        customerName: 'Delhi EduTech Solutions',
        assignedTo: anjali._id,
        status: 'In Progress',
        priority: 'Medium',
        category: 'Onboarding',
        createdBy: admin._id,
      },
    ]);

    console.log('✅ Database seeded successfully!');
    console.log('\n📝 Sample Login Credentials:');
    console.log('Admin: rajesh@leadcrm.in / admin123');
    console.log('Sales Manager: priya@leadcrm.in / manager123');
    console.log('Sales Executive: amit@leadcrm.in / executive123');
    console.log('Support Executive: sneha@leadcrm.in / support123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
