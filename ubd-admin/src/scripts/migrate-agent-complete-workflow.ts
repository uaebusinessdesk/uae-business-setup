import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateAgentCompleteWorkflow() {
  console.log('Starting migration to complete agent workflow system...');

  try {
    // Get all leads with agent assignments
    const leads = await prisma.lead.findMany({
      include: {
        agentAssignments: {
          include: {
            agent: true,
          },
          orderBy: [
            { order: 'asc' },
          ],
        },
      },
    });

    let updated = 0;

    for (const lead of leads) {
      if (lead.agentAssignments.length === 0) continue;

      // Determine if lead needs bank setup
      const needsBank = lead.hasBankProject || lead.needsBankAccount;
      const setupType = lead.setupType || '';

      // Process each assignment
      for (let i = 0; i < lead.agentAssignments.length; i++) {
        const assignment = lead.agentAssignments[i];
        const agentName = assignment.agent.name.toLowerCase();
        
        // Determine service type
        // Check if agent name contains bank name pattern (e.g., "Gaurav - ADCB")
        const bankPattern = /- (adcb|wio|enbd|emirates nbd|dib|fgb|adib|rakbank|cbd|mashreq|hsbc|standard chartered|citibank|barclays|deutsche bank|commercial bank|ajman bank|nbad|first abu dhabi bank|fab)/i;
        const bankMatch = assignment.agent.name.match(bankPattern);
        
        let serviceType: string | null = null;
        let bankName: string | null = null;
        
        if (bankMatch || agentName.includes('bank') || agentName.includes('adcb') || agentName.includes('wio') || agentName.includes('enbd')) {
          serviceType = 'bank';
          // Extract bank name from agent name
          if (bankMatch) {
            bankName = bankMatch[1].toUpperCase();
          } else if (agentName.includes('adcb')) {
            bankName = 'ADCB';
          } else if (agentName.includes('wio')) {
            bankName = 'WIO';
          } else if (agentName.includes('enbd') || agentName.includes('emirates nbd')) {
            bankName = 'ENBD';
          }
        } else {
          serviceType = 'company';
        }

        // Determine if this is the current agent (first agent of this service type by order)
        const sameServiceAssignments = lead.agentAssignments.filter(la => {
          const laAgentName = la.agent.name.toLowerCase();
          const laBankMatch = la.agent.name.match(bankPattern);
          const laIsBank = laBankMatch || laAgentName.includes('bank') || laAgentName.includes('adcb') || laAgentName.includes('wio') || laAgentName.includes('enbd');
          return (serviceType === 'bank' && laIsBank) || (serviceType === 'company' && !laIsBank);
        }).sort((a, b) => a.order - b.order);
        
        const isCurrent = sameServiceAssignments.length > 0 && sameServiceAssignments[0].id === assignment.id;

        // Map existing status to new status values
        let newStatus = assignment.status;
        if (newStatus === 'pending') {
          newStatus = 'assigned';
        }

        // Update the assignment
        await prisma.leadAgent.update({
          where: { id: assignment.id },
          data: {
            serviceType,
            bankName,
            isCurrent,
            status: newStatus,
            // Set timestamps based on existing status
            contactedAt: (newStatus === 'contacted' || newStatus === 'accepted' || newStatus === 'working' || newStatus === 'completed') && lead.agentContactedAt 
              ? lead.agentContactedAt 
              : null,
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

migrateAgentCompleteWorkflow()
  .then(() => {
    console.log('Migration script completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });

