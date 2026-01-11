import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Deleting all leads and agents...');

  // Delete in correct order (respecting foreign key constraints)
  
  // 1. Delete LeadAgent relationships first
  const leadAgentCount = await prisma.leadAgent.deleteMany({});
  console.log(`✅ Deleted ${leadAgentCount.count} lead-agent assignments`);

  // 2. Delete AgentService relationships
  const agentServiceCount = await prisma.agentService.deleteMany({});
  console.log(`✅ Deleted ${agentServiceCount.count} agent-service relationships`);

  // 3. Delete all agents
  const agentCount = await prisma.agent.deleteMany({});
  console.log(`✅ Deleted ${agentCount.count} agents`);

  // 4. Delete ServiceTypes (optional - you might want to keep these)
  const serviceTypeCount = await prisma.serviceType.deleteMany({});
  console.log(`✅ Deleted ${serviceTypeCount.count} service types`);

  // 5. Delete LeadActivity
  const activityCount = await prisma.leadActivity.deleteMany({});
  console.log(`✅ Deleted ${activityCount.count} lead activities`);

  // 6. Delete CompanyInvoiceRevision
  const companyInvoiceRevCount = await prisma.companyInvoiceRevision.deleteMany({});
  console.log(`✅ Deleted ${companyInvoiceRevCount.count} company invoice revisions`);

  // 7. Delete BankInvoiceRevision
  const bankInvoiceRevCount = await prisma.bankInvoiceRevision.deleteMany({});
  console.log(`✅ Deleted ${bankInvoiceRevCount.count} bank invoice revisions`);

  // 8. Delete all leads
  const leadCount = await prisma.lead.deleteMany({});
  console.log(`✅ Deleted ${leadCount.count} leads`);

  console.log('\n✨ All leads and agents deleted successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error deleting:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

