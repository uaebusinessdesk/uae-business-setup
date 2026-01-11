import { db } from '../lib/db';

async function updateAllAgentsWhatsApp() {
  try {
    console.log('Updating all agents WhatsApp numbers to +971504209110...');

    const result = await db.agent.updateMany({
      data: {
        whatsappNumber: '+971504209110',
      },
    });

    console.log(`✅ Successfully updated ${result.count} agents' WhatsApp numbers to +971504209110`);

    // Fetch and display updated agents
    const agents = await db.agent.findMany({
      select: {
        id: true,
        name: true,
        whatsappNumber: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    console.log('\nUpdated agents:');
    agents.forEach((agent) => {
      console.log(`  - ${agent.name}: ${agent.whatsappNumber}`);
    });
  } catch (error) {
    console.error('❌ Error updating agents:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

updateAllAgentsWhatsApp();

