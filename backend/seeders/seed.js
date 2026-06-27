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
    const users = await User.create
      

    // Seed Tickets
    console.log('🎫 Seeding tickets...');
    await Ticket.create


    console.log('✅ Database seeded successfully!');
    console.log('\n📝 Sample Login Credentials:');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
