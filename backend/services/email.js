/**
 * Email Service for Wayfinder
 *
 * Uses the Resend API to send transactional emails.
 * API documentation: https://resend.com/docs/api-reference/emails/send
 */

/**
 * Send an invitation email via Resend API
 * @param {string} recipientEmail - Email address of the recipient
 * @param {string} inviterName - Name of the person sending the invite
 * @param {string} inviteCode - The unique invite code (e.g., "WF-A3X9K2")
 * @param {string} inviteLink - Full invite link (e.g., "https://wayfinderai.org/?invite=WF-A3X9K2")
 * @returns {Promise<{success: boolean} | {error: string}>}
 */
export async function sendInviteEmail(recipientEmail, inviterName, inviteCode, inviteLink) {
  const apiKey = process.env.RESEND_API_KEY;

  // If API key is not set, log warning but don't crash
  if (!apiKey) {
    console.warn('RESEND_API_KEY not configured. Email invitations will not be sent.');
    return { success: true }; // Return success to not break the flow
  }

  try {
    // Prepare the email HTML body
    const htmlBody = `
<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.6;
        color: #333;
      }
      .container {
        max-width: 500px;
        margin: 0 auto;
        padding: 20px;
      }
      .header {
        margin-bottom: 30px;
      }
      h1 {
        color: #1f2937;
        font-size: 24px;
        margin: 0;
      }
      .content {
        margin: 20px 0;
        color: #555;
      }
      .invite-section {
        background: #f3f4f6;
        padding: 20px;
        border-radius: 8px;
        margin: 25px 0;
        text-align: center;
      }
      .invite-code {
        font-family: monospace;
        font-size: 14px;
        color: #666;
        margin-top: 10px;
      }
      .cta-button {
        display: inline-block;
        background: #2563eb;
        color: white;
        padding: 12px 32px;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 500;
        margin-top: 15px;
      }
      .cta-button:hover {
        background: #1d4ed8;
      }
      .footer {
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;
        font-size: 12px;
        color: #999;
      }
      .footer p {
        margin: 5px 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>You're invited to Wayfinder</h1>
      </div>

      <div class="content">
        <p>Hey there!</p>
        <p><strong>${inviterName}</strong> thinks you'd get a lot out of Wayfinder — it's an AI-powered career and college admissions advisor built on real labor market data, not generic advice.</p>
      </div>

      <div class="invite-section">
        <p style="margin: 0 0 15px 0; color: #666;">Click below to accept your invitation:</p>
        <a href="${inviteLink}" class="cta-button">Accept Invitation</a>
        <div class="invite-code">Invite code: ${inviteCode}</div>
      </div>

      <div class="content">
        <p>This invitation link expires in 14 days, so don't wait too long.</p>
        <p>See you on Wayfinder!</p>
      </div>

      <div class="footer">
        <p>Questions? Reply to this email or visit us at <a href="https://wayfinderai.org" style="color: #2563eb;">wayfinderai.org</a></p>
        <p>© 2024 Wayfinder. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
`;

    // Prepare the plain text fallback
    const textBody = `You're invited to Wayfinder

Hey there!

${inviterName} thinks you'd get a lot out of Wayfinder — it's an AI-powered career and college admissions advisor built on real labor market data, not generic advice.

Accept your invitation here:
${inviteLink}

Invite code: ${inviteCode}

This invitation link expires in 14 days, so don't wait too long.

See you on Wayfinder!

---
Questions? Visit us at https://wayfinderai.org
© 2024 Wayfinder. All rights reserved.
`;

    // Call Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: recipientEmail,
        subject: `${inviterName} invited you to Wayfinder`,
        html: htmlBody,
        text: textBody
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Resend API error:', errorData);
      return { error: `Failed to send email: ${errorData.message || 'Unknown error'}` };
    }

    const result = await response.json();
    console.log('Email sent successfully:', result.id);

    return { success: true };
  } catch (err) {
    console.error('Email service error:', err);
    return { error: `Email service error: ${err.message}` };
  }
}
