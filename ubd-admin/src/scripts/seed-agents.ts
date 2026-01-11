import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding agents and service types...');

  // Create service types (matching website footer)
  const mainlandService = await prisma.serviceType.upsert({
    where: { slug: 'mainland' },
    update: { name: 'Mainland Company Setup' },
    create: {
      name: 'Mainland Company Setup',
      slug: 'mainland',
    },
  });

  const freezoneService = await prisma.serviceType.upsert({
    where: { slug: 'freezone' },
    update: { name: 'Free Zone Company Setup' },
    create: {
      name: 'Free Zone Company Setup',
      slug: 'freezone',
    },
  });

  const offshoreService = await prisma.serviceType.upsert({
    where: { slug: 'offshore' },
    update: { name: 'Offshore Company Setup' },
    create: {
      name: 'Offshore Company Setup',
      slug: 'offshore',
    },
  });

  const bankService = await prisma.serviceType.upsert({
    where: { slug: 'bank' },
    update: { name: 'Bank Account Setup' },
    create: {
      name: 'Bank Account Setup',
      slug: 'bank',
    },
  });

  console.log('✅ Service types created');

  // Create agents for Mainland Company Setup (5 agents)
  const mainlandAgents = [];
  for (let i = 1; i <= 5; i++) {
    const agentName = `Agent ${i} - Mainland Company Setup`;
    let agent = await prisma.agent.findFirst({
      where: { name: agentName },
    });

    if (!agent) {
      agent = await prisma.agent.create({
        data: {
          name: agentName,
          whatsappNumber: '+971559053330',
          isActive: true,
        },
      });
    }
    mainlandAgents.push(agent);

    // Link agent to Mainland service
    await prisma.agentService.upsert({
      where: {
        agentId_serviceTypeId: {
          agentId: agent.id,
          serviceTypeId: mainlandService.id,
        },
      },
      update: {},
      create: {
        agentId: agent.id,
        serviceTypeId: mainlandService.id,
      },
    });
  }

  // Create agents for Free Zone Company Setup (5 agents)
  const freezoneAgents = [];
  for (let i = 1; i <= 5; i++) {
    const agentName = `Agent ${i} - Free Zone Company Setup`;
    let agent = await prisma.agent.findFirst({
      where: { name: agentName },
    });

    if (!agent) {
      agent = await prisma.agent.create({
        data: {
          name: agentName,
          whatsappNumber: '+971559053330',
          isActive: true,
        },
      });
    }
    freezoneAgents.push(agent);

    // Link agent to Freezone service
    await prisma.agentService.upsert({
      where: {
        agentId_serviceTypeId: {
          agentId: agent.id,
          serviceTypeId: freezoneService.id,
        },
      },
      update: {},
      create: {
        agentId: agent.id,
        serviceTypeId: freezoneService.id,
      },
    });
  }

  // Create agents for Offshore Company Setup (5 agents)
  const offshoreAgents = [];
  for (let i = 1; i <= 5; i++) {
    const agentName = `Agent ${i} - Offshore Company Setup`;
    let agent = await prisma.agent.findFirst({
      where: { name: agentName },
    });

    if (!agent) {
      agent = await prisma.agent.create({
        data: {
          name: agentName,
          whatsappNumber: '+971559053330',
          isActive: true,
        },
      });
    }
    offshoreAgents.push(agent);

    // Link agent to Offshore service
    await prisma.agentService.upsert({
      where: {
        agentId_serviceTypeId: {
          agentId: agent.id,
          serviceTypeId: offshoreService.id,
        },
      },
      update: {},
      create: {
        agentId: agent.id,
        serviceTypeId: offshoreService.id,
      },
    });
  }

  // Create agents for Bank Account Setup (20 agents)
  const bankAgents = [];
  for (let i = 1; i <= 20; i++) {
    const agentName = `Agent ${i} - Bank Account Setup`;
    let agent = await prisma.agent.findFirst({
      where: { name: agentName },
    });

    if (!agent) {
      agent = await prisma.agent.create({
        data: {
          name: agentName,
          whatsappNumber: '+971559053330',
          isActive: true,
        },
      });
    }
    bankAgents.push(agent);

    // Link agent to Bank Account Setup service
    await prisma.agentService.upsert({
      where: {
        agentId_serviceTypeId: {
          agentId: agent.id,
          serviceTypeId: bankService.id,
        },
      },
      update: {},
      create: {
        agentId: agent.id,
        serviceTypeId: bankService.id,
      },
    });
  }

  console.log('✅ Agents created:');
  console.log(`   - Mainland: ${mainlandAgents.length} agents`);
  console.log(`   - Freezone: ${freezoneAgents.length} agents`);
  console.log(`   - Offshore: ${offshoreAgents.length} agents`);
  console.log(`   - Bank Account Setup: ${bankAgents.length} agents`);
  console.log(`   - Total: ${mainlandAgents.length + freezoneAgents.length + offshoreAgents.length + bankAgents.length} agents`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

