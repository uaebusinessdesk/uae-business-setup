/**
 * Migration script to backfill proceedConfirmedAt for existing leads
 * that have quoteApprovedAt but not proceedConfirmedAt
 * 
 * This ensures the lead detail page correctly shows "Approved" status
 * for leads that were approved before the proceedConfirmedAt field was added.
 */

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  console.log('Starting migration to backfill proceedConfirmedAt...');

  // Find all Lead records with quoteApprovedAt but no proceedConfirmedAt
  const leadsToUpdate = await db.lead.findMany({
    where: {
      quoteApprovedAt: { not: null },
      proceedConfirmedAt: null,
    },
  });

  console.log(`Found ${leadsToUpdate.length} Lead records to update`);

  // Update each lead
  for (const lead of leadsToUpdate) {
    await db.lead.update({
      where: { id: lead.id },
      data: {
        proceedConfirmedAt: lead.quoteApprovedAt, // Use quoteApprovedAt timestamp
      },
    });
    console.log(`✅ Updated Lead ${lead.id}: set proceedConfirmedAt to ${lead.quoteApprovedAt}`);
  }

  const totalUpdated = leadsToUpdate.length;
  console.log(`\n✅ Migration complete! Updated ${totalUpdated} records.`);
  console.log(`   - ${leadsToUpdate.length} Lead records`);
}

main()
  .catch((error) => {
    console.error('Migration error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

