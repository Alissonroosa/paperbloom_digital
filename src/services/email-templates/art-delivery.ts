/**
 * Template de email de entrega de arte digital.
 * Mesmo padrão visual do QR_CODE_EMAIL_TEMPLATE (brand bar, fonte serif, #FFFAFA).
 * HTML inline com CSS inline — sem React Email.
 */

export interface ArtDeliveryEmailData {
  recipientEmail: string;
  productTitle: string;
  canvaUrl: string;
  canvaLabel?: string;
  canvaUrlSecondary?: string;
  canvaLabelSecondary?: string;
  recoveryUrl: string;
  licenseText: string;
}

export const ART_DELIVERY_EMAIL_TEMPLATE = {
  subject: (productTitle: string) => `Sua arte chegou! 🌸 ${productTitle}`,

  html: (data: ArtDeliveryEmailData) => `<!DOCTYPE html>
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
      .content { padding: 36px 30px; text-align: center; }
      .content h2 { font-family: 'Georgia', serif; color: #8B5F5F; font-size: 22px; font-weight: normal; margin: 0 0 12px; }
      .content p { color: #4A4A4A; font-size: 15px; margin: 8px 0; }
      .hero { margin: 20px 30px; padding: 28px 20px; background: linear-gradient(135deg, #FFFAFA 0%, #f5e6e6 100%); border-radius: 12px; border: 1px solid #E6C2C2; text-align: center; }
      .hero h3 { font-family: 'Georgia', serif; color: #8B5F5F; font-size: 18px; font-weight: normal; margin: 0 0 6px; }
      .hero p { color: #4A4A4A; font-size: 14px; margin: 4px 0; }
      .btn-wrap { margin: 32px 0 24px; }
      .btn { display: inline-block; padding: 16px 40px; background: #D4A5A5; color: #ffffff !important; text-decoration: none; border-radius: 50px; font-size: 16px; font-family: 'Georgia', serif; letter-spacing: 0.5px; }
      .how { margin: 20px 30px; padding: 20px; background: #fdf8f4; border-radius: 12px; border: 1px solid #f0ddd0; text-align: left; }
      .how h4 { color: #8B5F5F; font-family: 'Georgia', serif; font-weight: normal; margin: 0 0 12px; font-size: 15px; }
      .how ol { margin: 0; padding-left: 20px; }
      .how li { color: #4A4A4A; font-size: 14px; margin: 6px 0; }
      .license { margin: 20px 30px; padding: 16px 20px; background: #fdf2f2; border-radius: 10px; border: 1px solid #f0d4d4; text-align: center; }
      .license p { color: #8B5F5F; font-size: 12px; margin: 0; line-height: 1.6; }
      .personal { margin: 16px 30px; text-align: center; }
      .personal p { color: #a09090; font-size: 12px; font-style: italic; margin: 0; }
      .footer { text-align: center; padding: 24px 30px 30px; border-top: 1px solid #f0e6e6; }
      .footer .name { color: #8B5F5F; font-family: 'Georgia', serif; font-size: 15px; margin: 0 0 6px; }
      .footer a { color: #D4A5A5; text-decoration: none; font-size: 13px; }
      .footer .auto { font-size: 11px; color: #c4b0b0; margin-top: 12px; }
      .footer .recover { font-size: 12px; color: #b0a0a0; margin-top: 8px; }
      .footer .recover a { color: #b0a0a0; text-decoration: underline; font-size: 12px; }
      @media only screen and (max-width: 600px) { .content { padding: 24px 20px; } .hero, .how, .license, .personal { margin: 16px 15px; } }
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
      <span style="display:none;font-size:1px;color:#ffffff;max-height:0;max-width:0;opacity:0;overflow:hidden;">Sua arte está pronta para abrir no Canva!</span>

      <div class="content">
        <h2>Sua arte está pronta! 🌸</h2>
        <p>Obrigada pela compra de <strong>${data.productTitle}</strong>.</p>
        <p>Clique no botão abaixo para abrir sua arte no Canva:</p>
        <div class="btn-wrap">
          <a href="${data.canvaUrl}" class="btn">${data.canvaLabel ?? 'Abrir no Canva'}</a>
        </div>
        ${data.canvaUrlSecondary ? `<div class="btn-wrap" style="margin-top:0">
          <a href="${data.canvaUrlSecondary}" class="btn" style="background:#8B5F5F">${data.canvaLabelSecondary ?? 'Abrir arquivo 2 no Canva'}</a>
        </div>` : ''}
      </div>

      <div class="hero">
        <h3>🎨 Como usar sua arte</h3>
        <p>Clique em &ldquo;Abrir no Canva&rdquo; e o Canva criará uma cópia editável na sua conta.</p>
      </div>

      <div class="how">
        <h4>📋 Passo a passo</h4>
        <ol>
          <li>Clique no botão <strong>"Abrir no Canva"</strong> acima</li>
          <li>Faça login ou crie uma conta gratuita no Canva (se ainda não tiver)</li>
          <li>O Canva vai criar uma cópia editável da arte exclusivamente para você</li>
          <li>Personalize, baixe em alta resolução e imprima onde quiser</li>
        </ol>
      </div>

      <div class="license">
        <p>${data.licenseText}</p>
      </div>

      <div class="personal">
        <p>Este link é pessoal — não compartilhe com outras pessoas.</p>
      </div>

      <div class="footer">
        <p class="name">Paper Bloom</p>
        <p><a href="https://paperbloom.com.br">paperbloom.com.br</a></p>
        <p class="auto">Este é um email automático. Por favor, não responda.</p>
        <p class="recover"><a href="${data.recoveryUrl}">Precisa recuperar sua arte? Clique aqui</a></p>
      </div>
    </div>
  </body>
</html>`,
};
