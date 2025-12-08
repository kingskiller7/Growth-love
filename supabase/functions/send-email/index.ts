import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  template: 'welcome' | 'transaction' | 'security_alert' | 'kyc_status' | 'two_factor' | 'custom';
  data?: Record<string, any>;
  customHtml?: string;
}

const getEmailTemplate = (template: string, data: Record<string, any> = {}): string => {
  const baseStyle = `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #000; color: #fff; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; margin-bottom: 40px; }
    .logo { font-size: 32px; font-weight: bold; color: #00ff88; }
    .content { background: #1a1a1a; border-radius: 12px; padding: 32px; border: 1px solid #333; }
    .button { display: inline-block; background: #00ff88; color: #000; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
    .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
    h1 { color: #fff; margin-bottom: 20px; }
    p { color: #ccc; line-height: 1.6; }
    .highlight { color: #00ff88; font-weight: 600; }
    .warning { color: #ffaa00; }
    .amount { font-size: 24px; font-weight: bold; color: #00ff88; }
  `;

  switch (template) {
    case 'welcome':
      return `<!DOCTYPE html><html><head><style>${baseStyle}</style></head><body><div class="container"><div class="header"><div class="logo">Growth</div></div><div class="content"><h1>Welcome to Growth!</h1><p>Hi ${data.name || 'there'},</p><p>Thank you for joining Growth.</p></div></div></body></html>`;
    case 'transaction':
      return `<!DOCTYPE html><html><head><style>${baseStyle}</style></head><body><div class="container"><div class="header"><div class="logo">Growth</div></div><div class="content"><h1>${data.type} ${data.status}</h1><p class="amount">${data.amount} ${data.asset}</p></div></div></body></html>`;
    case 'security_alert':
      return `<!DOCTYPE html><html><head><style>${baseStyle}</style></head><body><div class="container"><div class="header"><div class="logo">Growth</div></div><div class="content"><h1>Security Alert</h1><p class="warning">${data.details}</p></div></div></body></html>`;
    default:
      return `<!DOCTYPE html><html><head><style>${baseStyle}</style></head><body><div class="container"><div class="content">${data.customHtml || 'No content'}</div></div></body></html>`;
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, template, data, customHtml }: EmailRequest = await req.json();
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    console.log(`Sending ${template} email to ${to}`);
    const html = getEmailTemplate(template, { ...data, customHtml });

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Growth <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
      }),
    });

    const result = await response.json();
    console.log("Email sent:", result);

    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
