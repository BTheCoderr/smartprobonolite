import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name, firm, message } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Send notification email to you (the founder)
    const notificationEmail = await resend.emails.send({
      from: 'SmartProBono <notifications@smartprobono.org>',
      to: ['bferrell@smartprobono.org'], // Your email
      subject: 'New Waitlist Signup - SmartProBono',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2E5BFF;">New Early Access Request</h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Contact Information</h3>
            <p><strong>Email:</strong> ${email}</p>
            ${name ? `<p><strong>Name:</strong> ${name}</p>` : ''}
            ${firm ? `<p><strong>Location:</strong> ${firm}</p>` : ''}
            ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
          </div>

          <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #0066cc;">
              <strong>Next Steps:</strong> This user will be notified when SmartProBono launches.
            </p>
          </div>

          <p style="color: #666; font-size: 14px;">
            Request submitted at: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    });

    // Send confirmation email to the user
    const confirmationEmail = await resend.emails.send({
      from: 'SmartProBono <hello@smartprobono.org>',
      to: [email],
      subject: 'Thanks for joining the SmartProBono waitlist!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2E5BFF; margin-bottom: 10px;">⚖️ SmartProBono</h1>
            <p style="color: #666; font-size: 18px;">24/7 help getting ready for court</p>
          </div>

          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">Thanks for joining our waitlist!</h2>
            <p>We're building SmartProBono to help renters like you understand your rights, organize your story, and prepare for housing court.</p>
            
            <h3 style="color: #2E5BFF;">What happens next?</h3>
            <ul style="color: #555;">
              <li>We'll email you as soon as SmartProBono is live and ready to use</li>
              <li>You'll get free access to Ermi, our AI assistant that helps with eviction cases</li>
              <li>You can practice organizing your case and drafting letters for attorney review</li>
              <li>Everything is free and designed to help you get organized before court</li>
            </ul>
          </div>

          <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0066cc; margin-top: 0;">What SmartProBono will help you with:</h3>
            <ul style="color: #555;">
              <li>🏠 <strong>Understand Your Eviction Notice</strong> - Break down legal terms in plain language</li>
              <li>📝 <strong>Organize Your Story</strong> - Get help organizing your case facts and timeline</li>
              <li>✍️ <strong>Draft Letters & Documents</strong> - Create letters to your landlord and draft responses for attorney review</li>
              <li>📚 <strong>Legal Glossary</strong> - Look up confusing legal terms anytime</li>
              <li>🔒 <strong>Private & Secure</strong> - Your information stays private and secure</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #666;">Questions? Reply to this email anytime!</p>
            <p style="color: #999; font-size: 14px;">
              SmartProBono © 2025 | Built in Rhode Island with purpose
            </p>
          </div>
        </div>
      `,
    });

    console.log('Early access emails sent:', {
      notification: notificationEmail.data?.id,
      confirmation: confirmationEmail.data?.id,
      email: email,
      name: name || 'Not provided',
      firm: firm || 'Not provided'
    });

    return res.status(200).json({
      success: true,
      message: 'Early access request submitted successfully!',
      emailId: confirmationEmail.data?.id
    });

  } catch (error: any) {
    console.error('Early access email error:', error);
    
    // If Resend is not configured, still return success for demo purposes
    if (error.message?.includes('API key') || !process.env.RESEND_API_KEY) {
      console.log('Resend not configured - returning demo response');
      return res.status(200).json({
        success: true,
        message: 'Early access request received! (Demo mode - emails will be sent when Resend is configured)',
        demo: true
      });
    }

    return res.status(500).json({
      error: 'Failed to send early access request. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
