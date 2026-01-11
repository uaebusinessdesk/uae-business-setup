import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const leadId = process.argv[2];
  
  if (!leadId) {
    console.log('Usage: npx tsx src/scripts/clean-lead-assignments.ts <lead-id>');
    console.log('\nTo find lead ID, check the URL when viewing the lead detail page');
    process.exit(1);
  }

  console.log(`🧹 Cleaning agent assignments for lead: ${leadId}\n`);

  // Check current state
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      agentAssignments: {
        include: {
          agent: true,
        },
      },
    },
  });

  if (!lead) {
    console.log('❌ Lead not found');
    process.exit(1);
  }

  console.log(`Lead: ${lead.fullName} (${lead.whatsapp})`);
  console.log(`Current assignments: ${lead.agentAssignments.length}`);
  lead.agentAssignments.forEach(la => {
    console.log(`  - ${la.agent.name} (Primary: ${la.isPrimary})`);
  });

  if (lead.agentAssignments.length === 0) {
    console.log('\n✅ No assignments to remove');
    process.exit(0);
  }

  // Delete all agent assignments
  const deleted = await prisma.leadAgent.deleteMany({
    where: { leadId },
  });

  // Update legacy assignedAgent field
  await prisma.lead.update({
    where: { id: leadId },
    data: { assignedAgent: 'unassigned' },
  });

  console.log(`\n✅ Deleted ${deleted.count} agent assignment(s)`);
  console.log('✅ Updated legacy assignedAgent field to "unassigned"');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

