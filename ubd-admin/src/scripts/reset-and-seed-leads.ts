/**
 * Reset and Seed Leads Script
 * Deletes all existing leads and creates sample leads for testing
 */

import { db } from '../lib/db';

async function main() {
  console.log('🗑️  Deleting all existing leads...');
  
  // Delete all activities first (cascade)
  await db.leadActivity.deleteMany({});
  
  // Delete all leads
  await db.lead.deleteMany({});
  
  console.log('✅ All leads deleted');
  
  console.log('📝 Creating sample leads (all as NEW status)...');
  
  const testEmail = 'ammarahzahed@gmail.com';
  const testWhatsApp = '+971504209110';
  
  // ===== WEBSITE LEADS =====
  
  // 1. Mainland Company Setup (Company Only - No Bank Project)
  await db.lead.create({
    data: {
      fullName: 'Test Lead 1 - Mainland',
      whatsapp: testWhatsApp,
      email: testEmail,
      nationality: 'UAE',
      residenceCountry: 'UAE',
      setupType: 'mainland',
      activity: 'Trading',
      shareholdersCount: 2,
      visasRequired: true,
      visasCount: 3,
      timeline: 'Within 1 month',
      notes: 'Lead Reference: UBD-TEST-001',
      assignedAgent: 'athar',
      hasBankProject: false, // Company only - bank can be added later via admin checkbox
    },
  });
  
  // 2. Freezone Company Setup (Company Only - No Bank Project)
  await db.lead.create({
    data: {
      fullName: 'Test Lead 2 - Freezone',
      whatsapp: testWhatsApp,
      email: testEmail,
      nationality: 'UK',
      residenceCountry: 'UAE',
      setupType: 'freezone',
      activity: 'Consulting Services',
      shareholdersCount: 1,
      timeline: 'Within 2 weeks',
      notes: 'Lead Reference: UBD-TEST-002',
      assignedAgent: 'anoop',
      hasBankProject: false, // Company only - bank can be added later via admin checkbox
    },
  });
  
  // 3. Offshore Company Setup (Company Only - No Bank Project)
  await db.lead.create({
    data: {
      fullName: 'Test Lead 3 - Offshore',
      whatsapp: testWhatsApp,
      email: testEmail,
      nationality: 'India',
      residenceCountry: 'UAE',
      setupType: 'offshore',
      activity: 'IT Services',
      shareholdersCount: 3,
      timeline: 'Immediately',
      notes: 'Lead Reference: UBD-TEST-003',
      assignedAgent: 'anoop',
      hasBankProject: false, // Company only - bank can be added later via admin checkbox
    },
  });
  
  // 4. Mainland Company Setup (Company Only - No Bank Project by default)
  // Admin can enable bank project later via checkbox if customer requests it
  await db.lead.create({
    data: {
      fullName: 'Test Lead 4 - Mainland',
      whatsapp: testWhatsApp,
      email: testEmail,
      nationality: 'UAE',
      residenceCountry: 'UAE',
      setupType: 'mainland',
      activity: 'E-commerce',
      shareholdersCount: 2,
      timeline: 'Within 1 month',
      notes: 'Lead Reference: UBD-TEST-004',
      assignedAgent: 'athar',
      hasBankProject: false, // Company only - bank can be added later via admin checkbox
    },
  });
  
  // 5. Freezone Company Setup (Company Only - No Bank Project by default)
  // Admin can enable bank project later via checkbox if customer requests it
  await db.lead.create({
    data: {
      fullName: 'Test Lead 5 - Freezone',
      whatsapp: testWhatsApp,
      email: testEmail,
      nationality: 'USA',
      residenceCountry: 'UAE',
      setupType: 'freezone',
      activity: 'Marketing Agency',
      shareholdersCount: 1,
      timeline: 'Within 2 weeks',
      notes: 'Lead Reference: UBD-TEST-005',
      assignedAgent: 'anoop',
      hasBankProject: false, // Company only - bank can be added later via admin checkbox
    },
  });
  
  // 6. Bank Only (Bank Project automatically enabled)
  await db.lead.create({
    data: {
      fullName: 'Test Lead 6 - Bank Only',
      whatsapp: testWhatsApp,
      email: testEmail,
      nationality: 'UAE',
      residenceCountry: 'UAE',
      setupType: 'bank',
      activity: 'Bank Account Setup',
      shareholdersCount: 1,
      timeline: 'Within 1 month',
      notes: 'Lead Reference: UBD-TEST-006',
      assignedAgent: 'self',
      hasBankProject: true, // Bank-only service automatically enables bank project
    },
  });
  
  // ===== WHATSAPP LEADS =====
  
  console.log('✅ Sample leads created successfully!');
  console.log('\n📊 Summary:');
  console.log('   - Website Leads: 6 (Mainland, Freezone, Offshore, Bank)');
  console.log('\n📧 All leads use:');
  console.log('   - Email: ammarahzahed@gmail.com');
  console.log('   - WhatsApp: +971504209110');
  console.log('\n🎯 All leads are in "New" status (ready for testing workflow)');
}

main()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

