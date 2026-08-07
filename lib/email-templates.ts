/**
 * Shared Premium HTML Email Templates for MongondowPedia & Bogani AI (myai.nexus)
 */

interface EmailTemplateOptions {
  title: string;
  badge?: string;
  bodyContent: string;
  actionButton?: {
    text: string;
    url: string;
  };
  footerNote?: string;
}

export function renderEmailHtml({ title, badge, bodyContent, actionButton, footerNote }: EmailTemplateOptions): string {
  const badgeHtml = badge
    ? `<span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; background-color: rgba(52, 211, 153, 0.15); border: 1px solid rgba(52, 211, 153, 0.3); color: #34d399; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">${badge}</span>`
    : "";

  const buttonHtml = actionButton
    ? `
      <div style="margin: 24px 0; text-align: center;">
        <a href="${actionButton.url}" target="_blank" style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #2563eb, #3b82f6); color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px; border-radius: 12px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
          ${actionButton.text}
        </a>
      </div>
    `
    : "";

  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #07080a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #07080a; padding: 32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; background-color: #0f1117; border: 1px solid #1e2230; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
              
              <!-- Header Section with Logo -->
              <tr>
                <td style="padding: 28px 32px; background: linear-gradient(180deg, #161924 0%, #0f1117 100%); border-b: 1px solid #1e2230; text-align: center;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td align="center">
                        <div style="display: inline-flex; items-center; justify-content: center; width: 44px; height: 44px; background: linear-gradient(135deg, #0284c7, #2563eb); border-radius: 12px; margin-bottom: 8px; line-height: 44px; color: #ffffff; font-size: 20px; font-weight: bold;">
                          M
                        </div>
                        <h1 style="margin: 4px 0 0 0; font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">MongondowPedia</h1>
                        <p style="margin: 2px 0 0 0; font-size: 11px; font-weight: 600; color: #38bdf8; letter-spacing: 1.5px; text-transform: uppercase;">BOGANI AI • (ABO)</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Body Content -->
              <tr>
                <td style="padding: 32px;">
                  ${badgeHtml}
                  <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #ffffff; line-height: 1.4;">${title}</h2>
                  <div style="font-size: 14px; line-height: 1.65; color: #cbd5e1;">
                    ${bodyContent}
                  </div>
                  ${buttonHtml}
                </td>
              </tr>

              <!-- Footer Section with myai.nexus Branding -->
              <tr>
                <td style="padding: 20px 32px; background-color: #0b0c10; border-top: 1px solid #1a1d28; text-align: center;">
                  <p style="margin: 0 0 6px 0; font-size: 12px; color: #94a3b8;">
                    ${footerNote || "Portal Ensiklopedia & Pengetahuan Kebudayaan Bolaang Mongondow Raya"}
                  </p>
                  <p style="margin: 0; font-size: 11px; color: #64748b; font-family: monospace;">
                    © 2026 MongondowPedia Inc. • Powered by <a href="https://myai.nexus" target="_blank" style="color: #38bdf8; text-decoration: none; font-weight: bold;">myai.nexus</a>
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
