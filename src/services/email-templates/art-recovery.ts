/**
 * Template de email de recuperação de artes digitais.
 * Lista todas as artes compradas de um email com botão "Abrir no Canva" para cada uma.
 * Mesmo padrão visual do QR_CODE_EMAIL_TEMPLATE.
 */

export interface ArtRecoveryEmailData {
  recipientEmail: string;
  orders: Array<{
    productTitle: string;
    canvaUrl: string;
  }>;
}

export const ART_RECOVERY_EMAIL_TEMPLATE = {
  subject: () => 'Seus links Paper Bloom 🌸',

  html: (data: ArtRecoveryEmailData) => {
    const orderRows = data.orders
      .map(
        (order) => `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #f0e6e6;">
          <p style="margin: 0 0 8px; font-family: 'Georgia', serif; color: #8B5F5F; font-size: 15px;">
            ${order.productTitle}
          </p>
          <a href="${order.canvaUrl}"
             style="display: inline-block; padding: 10px 24px; background: #D4A5A5; color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 14px; font-family: 'Georgia', serif;">
            Abrir no Canva
          </a>
        </td>
      </tr>`
      )
      .join('');

    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: 'Georgia', 'Times New Roman', serif; line-height: 1.7; color: #4A4A4A; margin: 0; padding: 0; background-color: #FFFAFA; }
      .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
      .brand-bar { height: 6px; background: linear-gradient(90deg, #E6C2C2, #D4A5A5, #E6C2C2); }
      .header { text-align: center; padding: 40px 30px 20px; }
      .header .logo { font-family: 'Georgia', serif; font-size: 26px; color: #8B5F5F; letter-spacing: 1px; margin: 0; }
      .header .tagline { font-size: 13px; color: #D4A5A5; margin: 6px 0 0; letter-spacing: 2px; text-transform: uppercase; }
      .divider { width: 60px; height: 1px; background: #E6C2C2; margin: 0 auto; }
      .content { padding: 30px; }
      .content h2 { font-family: 'Georgia', serif; color: #8B5F5F; font-size: 20px; font-weight: normal; margin: 0 0 12px; text-align: center; }
      .content p { color: #4A4A4A; font-size: 14px; margin: 0 0 20px; }
      .personal { margin: 16px 0 0; text-align: center; }
      .personal p { color: #a09090; font-size: 12px; font-style: italic; margin: 0; }
      .footer { text-align: center; padding: 24px 30px 30px; border-top: 1px solid #f0e6e6; }
      .footer .name { color: #8B5F5F; font-family: 'Georgia', serif; font-size: 15px; margin: 0 0 6px; }
      .footer a { color: #D4A5A5; text-decoration: none; font-size: 13px; }
      .footer .auto { font-size: 11px; color: #c4b0b0; margin-top: 12px; }
      @media only screen and (max-width: 600px) { .content { padding: 20px; } }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="brand-bar"></div>
      <div class="header">
        <p class="logo">Paper Bloom</p>
        <p class="tagline">Artes com emoção</p>
      </div>
      <div class="divider"></div>

      <!-- Preheader (hidden) -->
      <span style="display:none;font-size:1px;color:#ffffff;max-height:0;max-width:0;opacity:0;overflow:hidden;">Seus links de arte Paper Bloom estão aqui!</span>

      <div class="content">
        <h2>Seus links de arte 🌸</h2>
        <p>Encontramos as seguintes artes associadas ao seu email. Clique em "Abrir no Canva" para acessar cada uma:</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tbody>
            ${orderRows}
          </tbody>
        </table>
        <div class="personal">
          <p>Estes links são pessoais — não compartilhe com outras pessoas.</p>
        </div>
      </div>

      <div class="footer">
        <p class="name">Paper Bloom</p>
        <p><a href="https://paperbloom.com.br">paperbloom.com.br</a></p>
        <p class="auto">Este é um email automático. Por favor, não responda.</p>
      </div>
    </div>
  </body>
</html>`;
  },
};
