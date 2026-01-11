import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking leads with agent assignments...\n');

  // Find leads with phone number +971559053330 (from the image)
  const leads = await prisma.lead.findMany({
    where: {
      whatsapp: {
        contains: '971559053330',
      },
    },
    include: {
      agentAssignments: {
        include: {
          agent: true,
        },
      },
    },
  });

  console.log(`Found ${leads.length} lead(s) with that phone number\n`);

  for (const lead of leads) {
    console.log(`Lead ID: ${lead.id}`);
    console.log(`Name: ${lead.fullName}`);
    console.log(`WhatsApp: ${lead.whatsapp}`);
    console.log(`Legacy assignedAgent: ${lead.assignedAgent || 'null'}`);
    console.log(`Agent Assignments: ${lead.agentAssignments.length}`);
    
    if (lead.agentAssignments.length > 0) {
      console.log('  Assignments:');
      lead.agentAssignments.forEach(la => {
        console.log(`    - Agent: ${la.agent.name} (ID: ${la.agentId}, Primary: ${la.isPrimary})`);
      });
    } else {
      console.log('  No agent assignments');
    }
    console.log('');
  }

  // Also check for any agent named "Gaurav"
  const gauravAgents = await prisma.agent.findMany({
    where: {
      name: {
        contains: 'Gaurav',
      },
    },
  });

  console.log(`\nAgents with "Gaurav" in name: ${gauravAgents.length}`);
  gauravAgents.forEach(agent => {
    console.log(`  - ${agent.name} (ID: ${agent.id}, Active: ${agent.isActive})`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

