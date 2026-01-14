/**
 * Script to delete leads with combined services (company setup + bank account)
 * 
 * Criteria: Leads where needsBankAccount = true AND company setup exists
 * (companyStage is not null OR companyCompletedAt is not null)
 * 
 * Run with: npx tsx src/scripts/delete-combined-service-leads.ts
 */

import { db } from '../lib/db';

async function deleteCombinedServiceLeads() {
  try {
    console.log('🔍 Finding leads with combined services...');
    
    // Find leads that have combined services
    // First get all leads with needsBankAccount = true
    const allBankLeads = await db.lead.findMany({
      where: {
        needsBankAccount: true,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        whatsapp: true,
        needsBankAccount: true,
        companyStage: true,
        companyCompletedAt: true,
        createdAt: true,
      },
    });
    
    // Filter in JavaScript to find combined services (has company setup)
    const combinedLeads = allBankLeads.filter(lead => 
      lead.companyStage !== null || lead.companyCompletedAt !== null
    );

    console.log(`📊 Found ${combinedLeads.length} leads with combined services`);

    if (combinedLeads.length === 0) {
      console.log('✅ No combined service leads to delete');
      return;
    }

    // Display leads to be deleted
    console.log('\n📋 Leads to be deleted:');
    combinedLeads.forEach((lead, index) => {
      console.log(`${index + 1}. ${lead.fullName || 'Unknown'} (${lead.email || lead.whatsapp || 'No contact'})`);
      console.log(`   ID: ${lead.id}`);
      console.log(`   Company Stage: ${lead.companyStage || 'N/A'}`);
      console.log(`   Company Completed: ${lead.companyCompletedAt ? 'Yes' : 'No'}`);
      console.log(`   Created: ${lead.createdAt.toISOString()}`);
      console.log('');
    });

    // Confirm deletion
    console.log('⚠️  WARNING: This will permanently delete the above leads and all associated data.');
    console.log('⚠️  This action cannot be undone!');
    console.log('\nTo proceed, set DRY_RUN=false environment variable');
    
    const dryRun = process.env.DRY_RUN !== 'false';
    
    if (dryRun) {
      console.log('\n🔒 DRY RUN MODE - No leads were deleted');
      console.log('Set DRY_RUN=false to actually delete the leads');
      return;
    }

    // Delete leads
    console.log('\n🗑️  Deleting leads...');
    
    const leadIds = combinedLeads.map(lead => lead.id);
    
    // Delete related data first (activities, agent assignments, etc.)
    // Check if models exist before trying to delete
    try {
      if (db.leadActivity) {
        await db.leadActivity.deleteMany({
          where: { leadId: { in: leadIds } },
        });
      }
    } catch (e) {
      console.log('Note: leadActivity model not found or already deleted');
    }
    
    try {
      if (db.leadAgent) {
        await db.leadAgent.deleteMany({
          where: { leadId: { in: leadIds } },
        });
      }
    } catch (e) {
      console.log('Note: agentAssignment model not found or already deleted');
    }
    
    try {
      if (db.bankInvoiceRevision) {
        await db.bankInvoiceRevision.deleteMany({
          where: { leadId: { in: leadIds } },
        });
      }
    } catch (e) {
      console.log('Note: bankInvoiceRevision model not found or already deleted');
    }
    
    // Delete the leads
    const deleteResult = await db.lead.deleteMany({
      where: { id: { in: leadIds } },
    });

    console.log(`✅ Successfully deleted ${deleteResult.count} leads`);
    console.log('✅ All related data has been cleaned up');
    
  } catch (error) {
    console.error('❌ Error deleting combined service leads:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Run the script
deleteCombinedServiceLeads();

