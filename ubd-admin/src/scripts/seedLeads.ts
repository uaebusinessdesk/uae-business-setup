import { db } from '../lib/db';

const sampleLeads = [
  // Mainland leads (Athar)
  {
    fullName: 'Ahmed Al Maktoum',
    whatsapp: '+971 50 123 4567',
    email: 'ahmed.almaktoum@example.com',
    nationality: 'UAE',
    residenceCountry: 'UAE',
    setupType: 'mainland',
    activity: 'Trading & Import/Export',
    shareholdersCount: 2,
    visasRequired: true,
    visasCount: 3,
    timeline: 'urgent',
    notes: 'Looking to start trading business. Needs 3 visas for family.',
    assignedTo: 'athar',
    stage: 'feasible',
    feasible: true,
    estimatedCostMinAed: 15000,
    estimatedCostMaxAed: 20000,
    estimatedTimelineText: '3-4 weeks',
    invoiceStatus: 'sent',
    invoiceAmountAed: 18000,
    invoiceSentAt: new Date('2024-12-20'),
  },
  {
    fullName: 'Priya Sharma',
    whatsapp: '+971 55 234 5678',
    email: 'priya.sharma@gmail.com',
    nationality: 'India',
    residenceCountry: 'UAE',
    setupType: 'mainland',
    activity: 'IT Services & Consulting',
    shareholdersCount: 1,
    visasRequired: true,
    visasCount: 2,
    timeline: 'one_month',
    notes: 'Software consultant looking to establish UAE presence.',
    assignedTo: 'athar',
    stage: 'sent_to_agent',
    sentToAgentAt: new Date('2024-12-22'),
    feasible: null,
    invoiceStatus: 'not_sent',
  },
  
  // Freezone leads (Anoop)
  {
    fullName: 'James Wilson',
    whatsapp: '+971 50 345 6789',
    email: 'james.wilson@outlook.com',
    nationality: 'UK',
    residenceCountry: 'UK',
    setupType: 'freezone',
    activity: 'Digital Marketing Agency',
    shareholdersCount: 1,
    visasRequired: true,
    visasCount: 1,
    timeline: 'two_weeks',
    notes: 'Remote digital marketing agency. Needs single visa.',
    assignedTo: 'anoop',
    stage: 'invoice_sent',
    feasible: true,
    estimatedCostMinAed: 12000,
    estimatedCostMaxAed: 15000,
    estimatedTimelineText: '2-3 weeks',
    invoiceStatus: 'sent',
    invoiceAmountAed: 13500,
    invoiceSentAt: new Date('2024-12-23'),
  },
  {
    fullName: 'Fatima Hassan',
    whatsapp: '+971 55 456 7890',
    email: 'fatima.hassan@example.com',
    nationality: 'Pakistan',
    residenceCountry: 'UAE',
    setupType: 'freezone',
    activity: 'E-commerce & Retail',
    shareholdersCount: 2,
    visasRequired: true,
    visasCount: 4,
    timeline: 'exploring',
    notes: 'Planning to launch online store. Still exploring options.',
    assignedTo: 'anoop',
    stage: 'new',
    feasible: null,
    invoiceStatus: 'not_sent',
  },
  
  // Offshore lead
  {
    fullName: 'Robert Chen',
    whatsapp: '+971 50 567 8901',
    email: 'robert.chen@company.com',
    nationality: 'Singapore',
    residenceCountry: 'Singapore',
    setupType: 'offshore',
    activity: 'Holding Company',
    shareholdersCount: 3,
    visasRequired: false,
    timeline: 'one_month',
    notes: 'Asset holding structure. No visas needed.',
    assignedTo: 'self',
    stage: 'feasible',
    feasible: true,
    estimatedCostMinAed: 8000,
    estimatedCostMaxAed: 10000,
    estimatedTimelineText: '4-5 weeks',
    invoiceStatus: 'not_sent',
  },
  
  // Bank-only lead
  {
    fullName: 'Mohamed Ibrahim',
    whatsapp: '+971 55 678 9012',
    email: 'mohamed.ibrahim@example.com',
    nationality: 'Egypt',
    residenceCountry: 'UAE',
    setupType: 'bank',
    activity: 'Existing company - needs bank account',
    notes: 'Company already registered. Only needs bank account setup support.',
    assignedTo: 'self',
    stage: 'in_progress',
    feasible: true,
    invoiceStatus: 'paid',
    invoiceAmountAed: 5000,
    invoiceSentAt: new Date('2024-12-15'),
    paidAt: new Date('2024-12-18'),
  },
  
  // Paid lead
  {
    fullName: 'Sarah Johnson',
    whatsapp: '+971 50 789 0123',
    email: 'sarah.johnson@gmail.com',
    nationality: 'USA',
    residenceCountry: 'UAE',
    setupType: 'freezone',
    activity: 'Education & Training',
    shareholdersCount: 1,
    visasRequired: true,
    visasCount: 2,
    timeline: 'urgent',
    notes: 'Educational consultancy. Payment received, proceeding.',
    assignedTo: 'anoop',
    stage: 'paid',
    feasible: true,
    estimatedCostMinAed: 14000,
    estimatedCostMaxAed: 17000,
    estimatedTimelineText: '2-3 weeks',
    invoiceStatus: 'paid',
    invoiceAmountAed: 15500,
    invoiceSentAt: new Date('2024-12-10'),
    paidAt: new Date('2024-12-12'),
  },
  
  // Invoice sent but unpaid
  {
    fullName: 'Ali Abdullah',
    whatsapp: '+971 55 890 1234',
    email: 'ali.abdullah@example.com',
    nationality: 'UAE',
    residenceCountry: 'UAE',
    setupType: 'mainland',
    activity: 'Construction & Engineering',
    shareholdersCount: 3,
    visasRequired: true,
    visasCount: 5,
    timeline: 'two_weeks',
    notes: 'Construction company setup. Invoice sent, awaiting payment.',
    assignedTo: 'athar',
    stage: 'invoice_sent',
    feasible: true,
    estimatedCostMinAed: 22000,
    estimatedCostMaxAed: 28000,
    estimatedTimelineText: '3-4 weeks',
    invoiceStatus: 'sent',
    invoiceAmountAed: 25000,
    invoiceSentAt: new Date('2024-12-24'),
  },
  
  // New unassigned lead
  {
    fullName: 'David Thompson',
    whatsapp: '+971 50 901 2345',
    email: 'david.thompson@example.com',
    nationality: 'Australia',
    residenceCountry: 'Australia',
    setupType: 'not_sure',
    activity: null,
    timeline: 'exploring',
    notes: 'Not sure which setup type. Needs consultation.',
    assignedTo: 'unassigned',
    stage: 'new',
    feasible: null,
    invoiceStatus: 'not_sent',
  },
  
  // Dropped lead
  {
    fullName: 'Noor Al Zahra',
    whatsapp: '+971 55 012 3456',
    email: 'noor.alzahra@example.com',
    nationality: 'UAE',
    residenceCountry: 'UAE',
    setupType: 'freezone',
    activity: 'Beauty & Wellness',
    shareholdersCount: 1,
    visasRequired: true,
    visasCount: 1,
    timeline: 'one_month',
    notes: 'Client decided to postpone setup.',
    assignedTo: 'anoop',
    stage: 'dropped',
    feasible: false,
    dropReason: 'Client postponed indefinitely',
    invoiceStatus: 'not_sent',
  },
  
  // Another new lead
  {
    fullName: 'Rajesh Kumar',
    whatsapp: '+971 50 123 7890',
    email: 'rajesh.kumar@example.com',
    nationality: 'India',
    residenceCountry: 'India',
    setupType: 'mainland',
    activity: 'Food & Beverage Trading',
    shareholdersCount: 2,
    visasRequired: true,
    visasCount: 3,
    timeline: 'urgent',
    notes: 'Urgent setup needed for food import business.',
    assignedTo: 'unassigned',
    stage: 'new',
    feasible: null,
    invoiceStatus: 'not_sent',
  },
];

async function seedLeads() {
  try {
    console.log('Starting to seed leads...');
    
    // Check if leads already exist
    const existingCount = await db.lead.count();
    if (existingCount > 0) {
      console.log(`Database already has ${existingCount} leads. Skipping seed.`);
      console.log('To re-seed, delete existing leads first.');
      return;
    }
    
    // Insert sample leads
    for (const leadData of sampleLeads) {
      await db.lead.create({
        data: leadData,
      });
    }
    
    console.log(`✅ Successfully seeded ${sampleLeads.length} leads!`);
    console.log('\nSample leads include:');
    console.log('- 3 Mainland leads (2 assigned to Athar)');
    console.log('- 3 Freezone leads (2 assigned to Anoop)');
    console.log('- 1 Offshore lead');
    console.log('- 1 Bank-only lead');
    console.log('- 1 Paid lead');
    console.log('- 1 Invoice sent (unpaid)');
    console.log('- 2 New unassigned leads');
    console.log('- 1 Dropped lead');
  } catch (error) {
    console.error('Error seeding leads:', error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

seedLeads();

