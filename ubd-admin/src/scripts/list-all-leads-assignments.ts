import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📋 Listing all leads with assignment status...\n');

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
  console.log('='.repeat(80));

  for (const lead of leads) {
    const hasAssignments = lead.agentAssignments.length > 0;
    const legacyAgent = lead.assignedAgent;
    
    console.log(`\nLead: ${lead.fullName}`);
    console.log(`  ID: ${lead.id}`);
    console.log(`  WhatsApp: ${lead.whatsapp}`);
    console.log(`  Legacy assignedAgent: ${legacyAgent || 'null'}`);
    console.log(`  Agent Assignments: ${hasAssignments ? lead.agentAssignments.length : 0}`);
    
    if (hasAssignments) {
      console.log('  Current Assignments:');
      lead.agentAssignments.forEach(la => {
        console.log(`    - ${la.agent.name} (Primary: ${la.isPrimary})`);
      });
    } else {
      console.log('  No assignments');
    }
    
    // Determine what would be shown on list page
    let wouldShow: string;
    if (hasAssignments) {
      const primary = lead.agentAssignments.find(la => la.isPrimary);
      const agent = primary || lead.agentAssignments[0];
      wouldShow = agent.agent.name;
    } else if (legacyAgent && 
               legacyAgent !== 'unassigned' && 
               legacyAgent !== 'null' &&
               !legacyAgent.includes(' - ') &&
               !legacyAgent.includes(' | ')) {
      // Check if it's a valid agent ID
      if (legacyAgent === 'athar' || legacyAgent === 'anoop' || legacyAgent === 'self' || 
          legacyAgent.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        wouldShow = `Legacy: ${legacyAgent}`;
      } else {
        wouldShow = 'No agent assigned (invalid legacy value)';
      }
    } else {
      wouldShow = 'No agent assigned';
    }
    
    console.log(`  Would show on list: ${wouldShow}`);
    console.log('-'.repeat(80));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

