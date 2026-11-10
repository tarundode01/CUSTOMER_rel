const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Ticket = require('./models/Ticket');
const Enquiry = require('./models/Enquiry');
const Meeting = require('./models/Meeting');
const Quotation = require('./models/Quotation');
const Invoice = require('./models/Invoice');

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to Atlas for CRM Seeding...');

    await User.deleteMany({ email: 'customer@demo.com' });
    const hashedPassword = await bcrypt.hash('Customer@123', 10);

    const customer = await User.create({
      name: 'Rahul Sharma',
      email: 'customer@demo.com',
      phone: '+91 98765 43210',
      password: hashedPassword,
      company: 'Apex Digital Global',
      businessType: 'Corporate',
      designation: 'Managing Director',
      gstNumber: '07AAAAA0000A1Z5',
      address: {
        street: 'Connaught Place, Block B',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        zipCode: '110001'
      },
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'
    });

    // Seed Enquiries
    await Enquiry.deleteMany({ customerId: customer._id });
    await Enquiry.create([
      {
        customerId: customer._id,
        enquiryId: 'ENQ-892145',
        productService: 'Custom CRM & Mobile App Development',
        subject: 'Need full-stack MERN CRM with Android & iOS',
        description: 'We need high scalability, real-time lead distribution, and customer support portal with invoice automation.',
        budget: '₹3,50,000 - ₹5,00,000',
        preferredContactTime: 'Afternoon 2 PM - 5 PM',
        status: 'In Discussion',
        timeline: [
          { status: 'Submitted', title: 'Enquiry Received', note: 'Customer registered interest online.' },
          { status: 'Under Review', title: 'Tech Team Review', note: 'Scoping requirements and architecture.' },
          { status: 'In Discussion', title: 'Senior Consultant Assigned', note: 'Discovery call held with Rahul.' }
        ]
      },
      {
        customerId: customer._id,
        enquiryId: 'ENQ-341908',
        productService: 'Cloud DevOps & Migration',
        subject: 'AWS to Dedicated Cluster Migration',
        description: 'Database replication and auto-scaling Kubernetes setup.',
        budget: '₹1,50,000',
        preferredContactTime: 'Morning 10 AM',
        status: 'Proposal Sent',
        timeline: [
          { status: 'Submitted', title: 'Submitted', note: 'Enquiry logged' },
          { status: 'Proposal Sent', title: 'Quotation Dispatched', note: 'Detailed SOW shared on email.' }
        ]
      }
    ]);

    // Seed Meetings
    await Meeting.deleteMany({ customerId: customer._id });
    await Meeting.create([
      {
        customerId: customer._id,
        meetingType: 'Online (Google Meet/Zoom)',
        subject: 'Architecture & Scope Alignment Meeting',
        preferredDate: 'Tomorrow, 11 Nov 2026',
        timeSlot: '03:30 PM - 04:15 PM',
        status: 'Confirmed',
        joinLink: 'https://meet.google.com/crm-apex-sync',
        notes: 'Discussion with Lead Architect'
      }
    ]);

    // Seed Quotations
    await Quotation.deleteMany({ customerId: customer._id });
    await Quotation.create([
      {
        customerId: customer._id,
        quotationNumber: 'QUOT-98124',
        title: 'Enterprise Multi-Role CRM License',
        subTotal: 250000,
        taxGst: 45000,
        totalAmount: 295000,
        status: 'Received',
        items: [
          { name: 'Core CRM Multi-tenant Engine', qty: 1, rate: 180000, amount: 180000 },
          { name: 'Customer Mobile App (React Native)', qty: 1, rate: 70000, amount: 70000 }
        ]
      }
    ]);

    // Seed Tickets
    await Ticket.deleteMany({ customerId: customer._id });
    await Ticket.create([
      {
        customerId: customer._id,
        ticketNumber: 'TCK-554109',
        subject: 'Webhooks rate limit increase for live inventory',
        category: 'Technical',
        priority: 'high',
        status: 'in_progress',
        description: 'Our order webhook needs throughput higher than 100 req/sec.',
        messages: [
          { sender: 'customer', senderName: customer.name, message: 'Our order webhook needs throughput higher than 100 req/sec.' },
          { sender: 'support', senderName: 'DevOps Specialist', message: 'We have provisioned higher concurrency on your sandbox cluster.' }
        ]
      }
    ]);

    // Seed Invoices
    await Invoice.deleteMany({ customerId: customer._id });
    await Invoice.create([
      {
        customerId: customer._id,
        invoiceNumber: 'INV-2026-089',
        amount: 45000,
        status: 'pending',
        dueDate: new Date(Date.now() + 7 * 86400000),
        items: [{ description: 'CRM Monthly Dedicated Cloud Tier', quantity: 1, unitPrice: 45000, total: 45000 }]
      }
    ]);

    console.log('CRM Database successfully populated with rich enterprise data!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedData();
