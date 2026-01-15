export default function BankAccountFaq() {
  const faqItems = [
    {
      question: 'Do you support both UAE and international business accounts?',
      answer: 'Yes. We support UAE local business bank account applications and international business accounts, subject to eligibility review and documentation requirements.',
    },
    {
      question: 'When can UAE local business account setup begin?',
      answer: 'Only after company formation is completed and final company documents are available.',
    },
    {
      question: 'Do you guarantee approvals?',
      answer: 'No. Banks and account providers make independent decisions based on eligibility and compliance.',
    },
    {
      question: "Can I apply if I don't have a UAE company yet?",
      answer: 'UAE local bank accounts require a completed UAE company. International accounts may be possible depending on eligibility.',
    },
    {
      question: 'How long does it take?',
      answer: 'Timelines depend on review cycles and compliance checks by banks/providers. We aim to prepare documentation promptly once eligibility is confirmed.',
    },
    {
      question: 'Can companies located outside the UAE open accounts?',
      answer: 'Yes. We support documentation preparation and application facilitation for international business accounts for companies located outside the UAE. Initial review is conducted first to determine eligibility based on the account provider&apos;s requirements.',
    },
  ];

  return (
    <section className="faq-section" style={{ background: '#ffffff', padding: '50px 0 60px 0' }}>
      <div className="content-wrapper">
        <div className="faq-content" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2>Frequently Asked Questions</h2>
          <div className="faq">
            {faqItems.map((item) => (
              <details
                key={item.question}
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
                  padding: '20px 24px',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  boxShadow: '0 2px 8px rgba(11, 42, 74, 0.04)',
                  transition: 'all 0.3s ease',
                }}
              >
                <summary style={{ fontSize: '1.0625rem', fontWeight: 600, color: '#0b2a4a', cursor: 'pointer', listStyle: 'none', paddingRight: '24px', position: 'relative' }}>
                  {item.question}
                </summary>
                <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: '#64748b', marginTop: '12px', marginBottom: 0 }}>
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
