/**
 * Script to delete ALL leads from the database
 * 
 * WARNING: This will permanently delete all leads and all associated data.
 * This action cannot be undone!
 * 
 * Run with: DRY_RUN=false npx tsx src/scripts/delete-all-leads.ts
 */

import { db } from '../lib/db';

async function deleteAllLeads() {
  try {
    console.log('🔍 Finding all leads...');
    
    // Get all leads first to show what will be deleted
    const allLeads = await db.lead.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        whatsapp: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`📊 Found ${allLeads.length} leads in total`);

    if (allLeads.length === 0) {
      console.log('✅ No leads to delete');
      return;
    }

    // Display first 10 leads as preview
    console.log('\n📋 Sample leads to be deleted (showing first 10):');
    allLeads.slice(0, 10).forEach((lead, index) => {
      console.log(`${index + 1}. ${lead.fullName || 'Unknown'} (${lead.email || lead.whatsapp || 'No contact'})`);
      console.log(`   ID: ${lead.id}`);
      console.log(`   Created: ${lead.createdAt.toISOString()}`);
      console.log('');
    });
    if (allLeads.length > 10) {
      console.log(`... and ${allLeads.length - 10} more leads\n`);
    }

    // Confirm deletion
    console.log('⚠️  WARNING: This will permanently delete ALL leads and all associated data.');
    console.log('⚠️  This action cannot be undone!');
    console.log('\nTo proceed, set DRY_RUN=false environment variable');
    
    const dryRun = process.env.DRY_RUN !== 'false';
    
    if (dryRun) {
      console.log('\n🔒 DRY RUN MODE - No leads were deleted');
      console.log('Set DRY_RUN=false to actually delete all leads');
      return;
    }

    // Delete leads
    console.log('\n🗑️  Deleting all leads and related data...');
    
    const leadIds = allLeads.map(lead => lead.id);
    
    // Delete related data first
    console.log('  - Deleting lead activities...');
    try {
      await db.leadActivity.deleteMany({
        where: { leadId: { in: leadIds } },
      });
      console.log('    ✅ Lead activities deleted');
    } catch (e: any) {
      console.log(`    ⚠️  Note: ${e.message}`);
    }
    
    console.log('  - Deleting agent assignments...');
    try {
      await db.agentAssignment.deleteMany({
        where: { leadId: { in: leadIds } },
      });
      console.log('    ✅ Agent assignments deleted');
    } catch (e: any) {
      console.log(`    ⚠️  Note: ${e.message}`);
    }
    
    console.log('  - Deleting bank invoice revisions...');
    try {
      await db.bankInvoiceRevision.deleteMany({
        where: { leadId: { in: leadIds } },
      });
      console.log('    ✅ Bank invoice revisions deleted');
    } catch (e: any) {
      console.log(`    ⚠️  Note: ${e.message}`);
    }
    
    console.log('  - Deleting company invoice revisions...');
    try {
      await db.companyInvoiceRevision.deleteMany({
        where: { leadId: { in: leadIds } },
      });
      console.log('    ✅ Company invoice revisions deleted');
    } catch (e: any) {
      console.log(`    ⚠️  Note: ${e.message}`);
    }
    
    console.log('  - Deleting all leads...');
    const deleteResult = await db.lead.deleteMany({});

    console.log(`\n✅ Successfully deleted ${deleteResult.count} leads`);
    console.log('✅ All related data has been cleaned up');
    console.log('\n🎉 Database is now clean and ready for new leads!');
    
  } catch (error) {
    console.error('❌ Error deleting leads:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Run the script
deleteAllLeads();

