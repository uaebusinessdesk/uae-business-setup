import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking all leads for assignment mismatches...\n');

  // Get all leads with their assignments
  const leads = await prisma.lead.findMany({
    include: {
      agentAssignments: {
        include: {
          agent: true,
        },
        orderBy: {
          isPrimary: 'desc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  console.log(`Total leads: ${leads.length}\n`);

  let mismatchCount = 0;

  for (const lead of leads) {
    // Check if there's a mismatch
    const hasAssignments = lead.agentAssignments.length > 0;
    const legacyAgent = lead.assignedAgent;
    const isLegacyUnassigned = !legacyAgent || legacyAgent === 'unassigned' || legacyAgent === 'null';
    
    // Mismatch: has assignments but legacy says unassigned, OR no assignments but legacy has agent
    const hasMismatch = 
      (hasAssignments && isLegacyUnassigned) || 
      (!hasAssignments && legacyAgent && legacyAgent !== 'unassigned' && legacyAgent !== 'null' && !legacyAgent.includes(' - '));

    if (hasMismatch || hasAssignments) {
      console.log(`Lead ID: ${lead.id}`);
      console.log(`  Name: ${lead.fullName}`);
      console.log(`  WhatsApp: ${lead.whatsapp}`);
      console.log(`  Legacy assignedAgent: ${legacyAgent || 'null'}`);
      console.log(`  Agent Assignments: ${lead.agentAssignments.length}`);
      
      if (lead.agentAssignments.length > 0) {
        console.log('  Assignments:');
        lead.agentAssignments.forEach(la => {
          console.log(`    - ${la.agent.name} (ID: ${la.agentId}, Primary: ${la.isPrimary})`);
        });
      }
      
      if (hasMismatch) {
        console.log('  ⚠️  MISMATCH DETECTED');
        mismatchCount++;
      }
      console.log('');
    }
  }

  console.log(`\nFound ${mismatchCount} lead(s) with mismatches`);
  console.log(`Found ${leads.filter(l => l.agentAssignments.length > 0).length} lead(s) with agent assignments`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

