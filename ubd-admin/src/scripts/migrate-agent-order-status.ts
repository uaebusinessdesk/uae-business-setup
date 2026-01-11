import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateAgentOrderAndStatus() {
  console.log('Starting migration of agent order and status...');

  try {
    // Get all leads with agent assignments
    const leads = await prisma.lead.findMany({
      include: {
        agentAssignments: {
          include: {
            agent: true,
          },
          orderBy: [
            { isPrimary: 'desc' }, // Primary agents first
            { assignedAt: 'asc' }, // Then by assigned date
          ],
        },
      },
    });

    let updated = 0;

    for (const lead of leads) {
      if (lead.agentAssignments.length === 0) continue;

      // Determine if lead has been contacted
      const hasBeenContacted = !!lead.agentContactedAt;

      // Update each assignment with order and status
      for (let i = 0; i < lead.agentAssignments.length; i++) {
        const assignment = lead.agentAssignments[i];
        
        // Set order based on position (0 = first, 1 = second, etc.)
        const order = i;
        
        // Set status:
        // - If lead has been contacted and this is the primary agent (order 0), set to 'contacted'
        // - Otherwise set to 'pending'
        let status = 'pending';
        if (hasBeenContacted && order === 0 && assignment.isPrimary) {
          status = 'contacted';
        }

        await prisma.leadAgent.update({
          where: { id: assignment.id },
          data: {
            order,
            status,
          },
        });

        updated++;
      }
    }

    console.log(`✅ Migration complete! Updated ${updated} agent assignments.`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateAgentOrderAndStatus()
  .then(() => {
    console.log('Migration script completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });

