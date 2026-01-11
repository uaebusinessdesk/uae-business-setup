import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking leads with legacy assignedAgent but no assignments...\n');

  // Get all leads with their assignments
  const leads = await prisma.lead.findMany({
    include: {
      agentAssignments: {
        include: {
          agent: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  console.log(`Total leads: ${leads.length}\n`);

  const problematicLeads = leads.filter(lead => {
    const hasAssignments = lead.agentAssignments.length > 0;
    const legacyAgent = lead.assignedAgent;
    const hasLegacyAgent = legacyAgent && 
                           legacyAgent !== 'unassigned' && 
                           legacyAgent !== 'null' &&
                           legacyAgent.trim() !== '';
    
    // Problem: No assignments but has legacy agent value
    return !hasAssignments && hasLegacyAgent;
  });

  if (problematicLeads.length === 0) {
    console.log('✅ No leads found with this issue');
  } else {
    console.log(`Found ${problematicLeads.length} lead(s) with legacy agent but no assignments:\n`);
    
    for (const lead of problematicLeads) {
      console.log(`Lead ID: ${lead.id}`);
      console.log(`  Name: ${lead.fullName}`);
      console.log(`  WhatsApp: ${lead.whatsapp}`);
      console.log(`  Legacy assignedAgent: "${lead.assignedAgent}"`);
      console.log(`  Agent Assignments: ${lead.agentAssignments.length}`);
      console.log('');
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

