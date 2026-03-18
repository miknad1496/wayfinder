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
        <h1>You've been invited to Wayfinder</h1>
      </div>

      <div class="content">
        <p><strong>${inviterName}</strong> invited you to Wayfinder — an invite-only AI advisor that combines deep career intelligence with college admissions strategy.</p>
        <p style="color: #555; font-size: 14px; line-height: 1.7;">Wayfinder is powered by Claude Opus and trained on structured data from the Bureau of Labor Statistics, O*NET, NCES College Scorecard, and insights distilled from admissions officers, career counselors, and hiring professionals. It's not a chatbot with opinions — it's a reasoning engine backed by real data.</p>
      </div>

      <div class="invite-section">
        <a href="${inviteLink}" class="cta-button">Accept Your Invitation</a>
        <div class="invite-code">Invite code: ${inviteCode}</div>
      </div>

      <div class="content">
        <p style="font-size: 13px; color: #777;">This invitation expires in 14 days. Wayfinder is currently invite-only.</p>
      </div>

      <div class="footer">
        <p><a href="https://wayfinderai.org" style="color: #2563eb;">wayfinderai.org</a></p>
        <p>&copy; 2026 Wayfinder. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
`;

    // Prepare the plain text fallback
    const textBody = `You've been invited to Wayfinder

${inviterName} invited you to Wayfinder — an invite-only AI advisor that combines deep career intelligence with college admissions strategy.

Wayfinder is powered by Claude Opus and trained on structured data from the Bureau of Labor Statistics, O*NET, NCES College Scorecard, and insights distilled from admissions officers, career counselors, and hiring professionals. It's not a chatbot with opinions — it's a reasoning engine backed by real data.

Accept your invitation: ${inviteLink}

Invite code: ${inviteCode}

This invitation expires in 14 days. Wayfinder is currently invite-only.

wayfinderai.org
`;

    // Call Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Wayfinder <onboarding@resend.dev>',
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

// ─── Shared email sending helper ────────────────────────────────
async function sendEmail({ to, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[Email] RESEND_API_KEY not configured. Email not sent.');
    return { success: true };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Wayfinder <onboarding@resend.dev>',
        to,
        subject,
        html,
        text
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Email] Resend API error:', errorData);
      return { error: errorData.message || 'Unknown error' };
    }

    const result = await response.json();
    console.log(`[Email] Sent to ${to}: "${subject}" (${result.id})`);
    return { success: true };
  } catch (err) {
    console.error('[Email] Send error:', err.message);
    return { error: err.message };
  }
}

// ─── Deadline Reminder Email ────────────────────────────────────
export async function sendDeadlineReminder(recipientEmail, userName, events) {
  const eventRows = events.map(e => `
    <tr>
      <td style="padding: 10px 15px; border-bottom: 1px solid #eee;">
        <strong style="color: ${e.category === 'deadline' ? '#dc2626' : '#059669'};">${e.date}</strong>
      </td>
      <td style="padding: 10px 15px; border-bottom: 1px solid #eee;">${e.label}</td>
      <td style="padding: 10px 15px; border-bottom: 1px solid #eee; color: #666; font-size: 13px;">${e.daysUntil} days</td>
    </tr>
  `).join('');

  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, sans-serif; color: #333;">
      <h2 style="color: #1f2937;">🎯 Upcoming Admissions Dates</h2>
      <p>Hey ${userName || 'there'}, here's what's coming up on your admissions timeline:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background: #f3f4f6;">
            <th style="padding: 10px 15px; text-align: left;">Date</th>
            <th style="padding: 10px 15px; text-align: left;">Event</th>
            <th style="padding: 10px 15px; text-align: left;">In</th>
          </tr>
        </thead>
        <tbody>${eventRows}</tbody>
      </table>
      <p><a href="https://wayfinderai.org" style="color: #2563eb;">Open Wayfinder</a> to view your full timeline.</p>
      <p style="font-size: 12px; color: #999; margin-top: 30px;">You're receiving this because you have reminders enabled. Manage preferences in your Wayfinder settings.</p>
    </div>
  `;

  const text = `Upcoming Admissions Dates\n\n${events.map(e => `${e.date} — ${e.label} (${e.daysUntil} days)`).join('\n')}\n\nView your full timeline at https://wayfinderai.org`;

  return sendEmail({
    to: recipientEmail,
    subject: `⏰ ${events.length} upcoming admissions date${events.length > 1 ? 's' : ''}`,
    html,
    text
  });
}

// ─── Decision Date Alert ────────────────────────────────────────
export async function sendDecisionDateAlert(recipientEmail, userName, schoolName, decisionDate) {
  const html = `
    <div style="max-width: 500px; margin: 0 auto; font-family: -apple-system, sans-serif; color: #333;">
      <h2 style="color: #059669;">🟢 Decision Day Alert</h2>
      <p>Hey ${userName || 'there'},</p>
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
        <p style="font-size: 18px; margin: 0 0 5px;"><strong>${schoolName}</strong></p>
        <p style="color: #059669; font-size: 14px; margin: 0;">Decision release date: <strong>${decisionDate}</strong></p>
      </div>
      <p>Good luck! Remember to check your portal.</p>
      <p style="font-size: 12px; color: #999; margin-top: 30px;">— Wayfinder AI</p>
    </div>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: `🟢 ${schoolName} — Decision release today`,
    html,
    text: `Decision Day Alert\n\n${schoolName} decision release date: ${decisionDate}\n\nGood luck! Check your portal.`
  });
}

// ─── Scholarship Reminder ───────────────────────────────────────
export async function sendScholarshipReminder(recipientEmail, userName, scholarships) {
  const rows = scholarships.map(s => `
    <li style="margin: 10px 0;">
      <strong>${s.name}</strong> — ${s.amount || 'Varies'}
      <br><span style="color: #dc2626; font-size: 13px;">Deadline: ${s.deadline}</span>
    </li>
  `).join('');

  const html = `
    <div style="max-width: 500px; margin: 0 auto; font-family: -apple-system, sans-serif; color: #333;">
      <h2 style="color: #1f2937;">🎓 Scholarship Deadline Reminders</h2>
      <p>Hey ${userName}, these scholarships have upcoming deadlines:</p>
      <ul style="padding-left: 20px;">${rows}</ul>
      <p><a href="https://wayfinderai.org" style="color: #2563eb;">View all scholarships</a></p>
      <p style="font-size: 12px; color: #999; margin-top: 30px;">Manage reminders in your Wayfinder settings.</p>
    </div>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: `🎓 ${scholarships.length} scholarship deadline${scholarships.length > 1 ? 's' : ''} coming up`,
    html,
    text: `Scholarship Deadlines\n\n${scholarships.map(s => `${s.name} — ${s.amount || 'Varies'} — Deadline: ${s.deadline}`).join('\n')}`
  });
}

// ─── Essay Review Ready ─────────────────────────────────────────
export async function sendEssayReviewReady(recipientEmail, userName, essayType, score) {
  const html = `
    <div style="max-width: 500px; margin: 0 auto; font-family: -apple-system, sans-serif; color: #333;">
      <h2 style="color: #1f2937;">✍️ Your Essay Review is Ready</h2>
      <p>Hey ${userName},</p>
      <p>Your ${essayType} review is complete.</p>
      <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
        <p style="font-size: 32px; margin: 0;"><strong>${score}/10</strong></p>
        <p style="color: #666; font-size: 14px; margin: 5px 0 0;">Overall Score</p>
      </div>
      <p><a href="https://wayfinderai.org" style="color: #2563eb;">View full feedback</a></p>
    </div>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: `✍️ Essay review ready — Score: ${score}/10`,
    html,
    text: `Your ${essayType} review is ready. Score: ${score}/10. View feedback at https://wayfinderai.org`
  });
}
