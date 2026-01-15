type CompanyFaqVariant = 'mainland' | 'freezone' | 'offshore';

const faqItems: Record<CompanyFaqVariant, Array<{ question: string; answer: string }>> = {
  mainland: [
    {
      question: 'What is Mainland Company Formation?',
      answer: 'Mainland companies are licensed by local economic departments. Unlike free zones, they operate freely across the UAE with unrestricted local market access.',
    },
    {
      question: 'How long does it take to form a mainland company in the UAE?',
      answer: 'Initial review typically takes a few business days. Documentation preparation and application facilitation timelines vary depending on authority schedules and complexity.',
    },
    {
      question: 'Can I own 100% of the company?',
      answer: 'Yes. Recent reforms allow 100% foreign ownership in most sectors without a local sponsor. Some activities may require local partnership—we&apos;ll clarify during consultation.',
    },
    {
      question: 'What documents are required for mainland company formation?',
      answer: 'Passport copies, visa copies (if applicable), proof of address, business plan, and activity-specific requirements. We provide a tailored checklist and handle all documentation preparation.',
    },
    {
      question: 'What are the costs involved in mainland company formation?',
      answer: 'Costs vary based on business requirements and are shared after initial review. Government fees are paid directly to local economic departments, and our service fees cover documentation preparation and application facilitation.',
    },
    {
      question: 'What happens after I submit the consultation form?',
      answer: 'We review your requirements, conduct initial assessment, and contact you to discuss next steps before any documentation work begins.',
    },
  ],
  freezone: [
    {
      question: 'What is Free Zone company formation?',
      answer: 'Free Zone companies are registered within designated free zones and operate under the regulations of the respective free zone authority.',
    },
    {
      question: 'Who should consider a Free Zone company?',
      answer: 'Free Zones are suitable for international businesses, startups, and companies operating within specific industry sectors.',
    },
    {
      question: 'Do you guarantee approvals?',
      answer: 'No. We prepare documentation and facilitate applications, but approvals are decided by free zone authorities.',
    },
    {
      question: 'How long does Free Zone company formation take?',
      answer: 'Initial review takes a few business days. Timelines for registration depend on the selected free zone and authority processing.',
    },
    {
      question: 'When does bank account support begin?',
      answer: 'Bank account support is introduced after company incorporation is completed, depending on your requirements.',
    },
    {
      question: 'Do I need to pay upfront?',
      answer: 'No. We conduct initial review first and proceed only after your approval.',
    },
  ],
  offshore: [
    {
      question: 'What is an offshore company in the UAE?',
      answer: 'An offshore company is a legal entity used for asset holding, ownership, and international structuring purposes. It does not conduct business within the UAE.',
    },
    {
      question: 'Who should consider an offshore company?',
      answer: 'Offshore structures are suitable for investors, holding companies, and international businesses that do not require local UAE operations.',
    },
    {
      question: 'Can offshore companies open UAE bank accounts?',
      answer: 'Bank account eligibility depends on the structure, ownership, and compliance requirements. We conduct initial review before proceeding.',
    },
    {
      question: 'Do you guarantee approvals?',
      answer: 'No. We prepare documentation and facilitate applications, but approvals are decided by offshore authorities and banks.',
    },
    {
      question: 'How long does offshore company formation take?',
      answer: 'Initial review takes a few business days. Timelines vary depending on jurisdiction and registrar processing.',
    },
    {
      question: 'Do I need to pay upfront?',
      answer: 'No. We conduct initial review first and proceed only after your approval.',
    },
  ],
};

export default function CompanyFaq({ variant }: { variant: CompanyFaqVariant }) {
  return (
    <section className="faq-section">
      <div className="content-wrapper">
        <div className="faq-content">
          <h2>Frequently Asked Questions</h2>
          <div className="faq">
            {faqItems[variant].map((item) => (
              <details key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
