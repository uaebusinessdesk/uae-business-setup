import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { logActivity } from '@/lib/activity';

// Google review link placeholder
const GOOGLE_REVIEW_LINK_PLACEHOLDER = process.env.GOOGLE_REVIEW_LINK || 'https://g.page/r/placeholder/review';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const lead = await db.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if (!lead.email) {
      return NextResponse.json(
        { error: 'Lead has no email address' },
        { status: 400 }
      );
    }

    // Generate review email HTML
    const reviewEmailHtml = generateReviewEmailHtml({
      clientName: lead.fullName,
      reviewLink: GOOGLE_REVIEW_LINK_PLACEHOLDER,
    });

    // Send review email to client (explicitly pass emailType="review" to exclude CC)
    try {
      const { sendCustomerEmail } = await import('@/lib/sendCustomerEmail');
      await sendCustomerEmail({
        to: lead.email,
        subject: 'Thank You for Choosing UAE Business Desk - Please Share Your Experience',
        html: reviewEmailHtml,
      }, 'review');
      await logActivity(id, 'review_email_sent', `Review email sent to ${lead.email}`);
    } catch (emailError) {
      console.error('Failed to send review email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send review email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Review email sent successfully',
    });
  } catch (error) {
    console.error('Review email failed:', error);
    return NextResponse.json(
      { error: 'Failed to send review email' },
      { status: 500 }
    );
  }
}

function generateReviewEmailHtml(data: {
  clientName: string;
  reviewLink: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You - UAE Business Desk</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.7;
      color: #1a202c;
      background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
      padding: 40px 20px;
      min-height: 100vh;
    }
    .email-wrapper {
      max-width: 650px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .email-header {
      background: linear-gradient(135deg, #0b2a4a 0%, #1a3d5f 100%);
      color: #ffffff;
      padding: 50px 40px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .email-header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -10%;
      width: 300px;
      height: 300px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 50%;
    }
    .email-header::after {
      content: '';
      position: absolute;
      bottom: -30%;
      left: -5%;
      width: 200px;
      height: 200px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 50%;
    }
    .header-content {
      position: relative;
      z-index: 1;
    }
    .thank-you-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid rgba(255, 255, 255, 0.2);
    }
    .thank-you-icon svg {
      width: 40px;
      height: 40px;
      color: #ffffff;
    }
    .header-title {
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 12px;
      letter-spacing: -0.5px;
    }
    .header-subtitle {
      font-size: 18px;
      opacity: 0.95;
      font-weight: 400;
    }
    .email-body {
      padding: 50px 40px;
    }
    .greeting {
      font-size: 18px;
      color: #0b2a4a;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .content-section {
      margin-bottom: 30px;
    }
    .content-section p {
      color: #475569;
      margin: 16px 0;
      font-size: 16px;
      line-height: 1.8;
    }
    .highlight-box {
      background: linear-gradient(135deg, #faf8f3 0%, #f5f1e8 100%);
      border-left: 4px solid #c9a14a;
      padding: 24px;
      border-radius: 8px;
      margin: 30px 0;
    }
    .highlight-box p {
      color: #1a202c;
      margin: 0;
      font-size: 15px;
      line-height: 1.7;
    }
    .review-section {
      background: linear-gradient(135deg, #faf8f3 0%, #f5f1e8 100%);
      border: 2px solid #c9a14a;
      border-radius: 12px;
      padding: 40px;
      margin: 40px 0;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .review-section::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -10%;
      width: 200px;
      height: 200px;
      background: rgba(201, 161, 74, 0.1);
      border-radius: 50%;
    }
    .review-icon {
      width: 60px;
      height: 60px;
      margin: 0 auto 20px;
      background: linear-gradient(135deg, #c9a14a 0%, #b8943f 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(201, 161, 74, 0.3);
      position: relative;
      z-index: 1;
    }
    .review-icon svg {
      width: 30px;
      height: 30px;
      color: #ffffff;
    }
    .review-section h2 {
      color: #0b2a4a;
      margin: 0 0 12px 0;
      font-size: 24px;
      font-weight: 700;
      position: relative;
      z-index: 1;
    }
    .review-section p {
      color: #475569;
      margin: 12px 0;
      font-size: 16px;
      line-height: 1.7;
      position: relative;
      z-index: 1;
    }
    .review-button {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: linear-gradient(135deg, #c9a14a 0%, #b8943f 100%);
      color: #ffffff;
      padding: 16px 36px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 17px;
      margin-top: 24px;
      box-shadow: 0 4px 12px rgba(201, 161, 74, 0.3);
      transition: all 0.3s;
      position: relative;
      z-index: 1;
    }
    .review-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(201, 161, 74, 0.4);
    }
    .review-button svg {
      width: 20px;
      height: 20px;
    }
    .benefits-list {
      background: #f8fafc;
      border-radius: 8px;
      padding: 24px;
      margin: 30px 0;
    }
    .benefits-list h3 {
      color: #0b2a4a;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    .benefits-list ul {
      list-style: none;
      padding: 0;
    }
    .benefits-list li {
      color: #475569;
      font-size: 15px;
      margin: 12px 0;
      padding-left: 28px;
      position: relative;
      line-height: 1.6;
    }
    .benefits-list li::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: #c9a14a;
      font-weight: 700;
      font-size: 18px;
    }
    .footer {
      background: #f8fafc;
      padding: 40px;
      border-top: 1px solid #e2e8f0;
    }
    .footer-content {
      text-align: center;
      margin-bottom: 24px;
    }
    .footer-content h4 {
      color: #0b2a4a;
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 12px;
    }
    .footer-content p {
      color: #64748b;
      font-size: 14px;
      margin: 6px 0;
      line-height: 1.6;
    }
    .footer-bottom {
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #94a3b8;
      font-size: 12px;
    }
    .social-links {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-top: 20px;
    }
    .social-link {
      color: #64748b;
      text-decoration: none;
      font-size: 13px;
      transition: color 0.2s;
    }
    .social-link:hover {
      color: #0b2a4a;
    }
    @media (max-width: 600px) {
      .email-header {
        padding: 40px 24px;
      }
      .email-body {
        padding: 40px 24px;
      }
      .header-title {
        font-size: 28px;
      }
      .review-section {
        padding: 30px 24px;
      }
      .footer {
        padding: 30px 24px;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-header">
      <div class="header-content">
        <div class="thank-you-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="header-title">Thank You, ${data.clientName}!</div>
        <div class="header-subtitle">We're grateful for your trust in us</div>
      </div>
    </div>

    <div class="email-body">
      <div class="greeting">Dear ${data.clientName},</div>

      <div class="content-section">
        <p>
          We hope this message finds you well. It has been our pleasure to assist you with your business setup needs in the UAE.
        </p>
        <p>
          Your journey with UAE Business Desk is now complete, and we wanted to take a moment to express our sincere gratitude for choosing us as your trusted partner.
        </p>
      </div>

      <div class="highlight-box">
        <p>
          <strong>Your feedback matters.</strong> As a growing business, your experience and insights are invaluable in helping us improve our services and assist future clients in their UAE business journey.
        </p>
      </div>

      <div class="review-section">
        <div class="review-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </div>
        <h2>Share Your Experience</h2>
        <p>
          We would be honored if you could take just a few moments to share your experience with us on Google. Your review helps other entrepreneurs and businesses make informed decisions about their UAE business setup journey.
        </p>
        <a href="${data.reviewLink}" class="review-button">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          Leave a Review on Google
        </a>
        <p style="margin-top: 20px; font-size: 14px; color: #64748b;">
          Your honest feedback helps us serve you and others better.
        </p>
      </div>

      <div class="benefits-list">
        <h3>Why Your Review Matters</h3>
        <ul>
          <li>Helps other businesses discover reliable UAE setup services</li>
          <li>Enables us to continuously improve our processes and support</li>
          <li>Builds trust in the UAE business community</li>
          <li>Takes less than 2 minutes to complete</li>
        </ul>
      </div>

      <div class="content-section">
        <p>
          If you have any questions or need further assistance, please don't hesitate to reach out to us. We're here to support your business journey in the UAE.
        </p>
        <p style="margin-top: 24px; color: #0b2a4a; font-weight: 600;">
          Thank you once again for choosing UAE Business Desk. We wish you every success in your business endeavors!
        </p>
      </div>
    </div>

    <div class="footer">
      <div class="footer-content">
        <h4>UAE Business Desk</h4>
        <p><strong>Capo Fin FZE</strong></p>
        <p>Business Center, Sharjah Publishing City</p>
        <p>Sharjah, United Arab Emirates</p>
        <p style="margin-top: 16px;">
          <strong>Phone:</strong> +971 50 420 9110<br>
          <strong>Email:</strong> support@uaebusinessdesk.com<br>
          <strong>WhatsApp:</strong> +971 50 420 9110
        </p>
      </div>
      <div class="social-links">
        <a href="mailto:support@uaebusinessdesk.com" class="social-link">Email Us</a>
        <span style="color: #cbd5e1;">•</span>
        <a href="https://wa.me/971504209110" class="social-link">WhatsApp</a>
      </div>
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} UAE Business Desk. All rights reserved.</p>
        <p style="margin-top: 8px;">Your trusted partner for UAE business setup and corporate services.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

