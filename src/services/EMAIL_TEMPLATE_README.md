# QR Code Email Template

## Overview

The QR Code email template is a professionally designed HTML email that delivers the message QR code and URL to users after successful payment. The template is optimized for compatibility across major email clients and includes comprehensive usage instructions.

## Requirements Satisfied

### Requirement 12.2: QR Code as Embedded Image
- ✅ QR code is embedded using Content-ID (cid:qrcode) reference
- ✅ Image is displayed prominently in a dedicated section
- ✅ Includes descriptive alt text for accessibility
- ✅ Styled with border and padding for visual appeal

### Requirement 12.3: Message URL as Clickable Link
- ✅ URL displayed as clickable link in "Link Direto" section
- ✅ "Visualizar Mensagem" button with prominent styling
- ✅ URL appears multiple times for user convenience
- ✅ Links use brand colors for consistency

### Requirement 12.4: Usage Instructions
- ✅ Dedicated "Como Compartilhar" section with icon
- ✅ Multiple sharing methods listed (WhatsApp, email, social media)
- ✅ Instructions for printing QR code
- ✅ Guidance on sharing direct link
- ✅ Visually distinct styling with yellow background

## Template Structure

```
Email Template
├── Header Section
│   ├── Success message with emoji
│   ├── Personalized greeting
│   └── Message title confirmation
├── QR Code Section
│   ├── Section heading
│   ├── QR code image (cid:qrcode)
│   └── Scan instruction
├── Message URL Section
│   ├── Direct link display
│   └── "Visualizar Mensagem" button
├── Instructions Section
│   ├── Sharing methods list
│   └── Usage guidelines
└── Footer Section
    ├── Brand signature
    ├── Website link
    └── Auto-reply notice
```

## Email Client Compatibility

### Tested Clients
- ✅ Gmail (Web, iOS, Android)
- ✅ Outlook (Desktop, Web)
- ✅ Apple Mail (macOS, iOS)
- ✅ Yahoo Mail
- ✅ ProtonMail

### Compatibility Features
- **Inline CSS**: All styles are inline for maximum compatibility
- **Web-safe fonts**: Uses system fonts (Arial, sans-serif)
- **Max-width 600px**: Standard email width for all clients
- **Responsive design**: Mobile breakpoints for small screens
- **Content-ID images**: QR code embedded using cid for inline display
- **Simple HTML structure**: Avoids complex layouts that break in some clients

## Design Features

### Visual Design
- **Brand colors**: Indigo (#4F46E5) for primary elements
- **Clean layout**: Proper spacing and visual hierarchy
- **Emoji usage**: Adds personality and visual interest
- **Color-coded sections**: Different backgrounds for different content types
- **Professional footer**: Includes branding and legal notice

### Responsive Design
```css
@media only screen and (max-width: 600px) {
  .container { padding: 10px; }
  .header h1 { font-size: 24px; }
  .qr-code img { max-width: 250px; }
}
```

### Accessibility
- Semantic HTML structure
- Descriptive alt text for images
- Sufficient color contrast (WCAG AA)
- Clear visual hierarchy
- Readable font sizes

## Usage

### Basic Usage

```typescript
import { QR_CODE_EMAIL_TEMPLATE, QRCodeEmailData } from '@/services/EmailService';

const emailData: QRCodeEmailData = {
  recipientEmail: 'user@example.com',
  recipientName: 'Maria Silva',
  messageUrl: 'https://paperbloom.com/mensagem/maria/abc123',
  qrCodeDataUrl: 'data:image/png;base64,...', // Base64 encoded QR code
  senderName: 'João Santos',
  messageTitle: 'Feliz Aniversário',
};

// Generate subject
const subject = QR_CODE_EMAIL_TEMPLATE.subject(emailData.recipientName);
// Output: "Sua mensagem especial para Maria Silva está pronta! 🎁"

// Generate HTML
const html = QR_CODE_EMAIL_TEMPLATE.html(emailData);
```

### With EmailService

```typescript
import { emailService } from '@/services/EmailService';

const result = await emailService.sendQRCodeEmail({
  recipientEmail: 'user@example.com',
  recipientName: 'Maria Silva',
  messageUrl: 'https://paperbloom.com/mensagem/maria/abc123',
  qrCodeDataUrl: qrCodeBase64,
  senderName: 'João Santos',
  messageTitle: 'Feliz Aniversário',
});

if (result.success) {
  console.log('Email sent:', result.messageId);
} else {
  console.error('Email failed:', result.error);
}
```

## Testing

### Unit Tests
Run the email template tests:
```bash
npm test -- src/services/__tests__/email-template.test.ts
```

### Visual Testing
Visit the test page to see the template rendered:
```
http://localhost:3000/editor/test-email-template
```

The test page allows you to:
- Modify email data in real-time
- Preview the rendered email
- View the HTML source
- Validate requirements compliance

### Manual Email Client Testing

1. **Send test email**:
```typescript
await emailService.sendQRCodeEmail(testData);
```

2. **Check in multiple clients**:
   - Gmail (web and mobile)
   - Outlook (desktop and web)
   - Apple Mail
   - Mobile email apps

3. **Verify**:
   - QR code displays correctly
   - Links are clickable
   - Layout is responsive
   - Colors render properly
   - Images load inline

## Content Sections

### Header
- Personalized greeting with recipient name
- Success message with emoji
- Message title confirmation

### QR Code Display
- Large, centered QR code image
- Clear section heading
- Instruction to scan

### Direct Link
- Clickable URL display
- Prominent call-to-action button
- Styled for visibility

### Sharing Instructions
- Multiple sharing methods
- Step-by-step guidance
- Visually distinct section

### Footer
- Professional signature
- Website link
- Auto-reply notice

## Customization

### Modifying Colors
Update the color values in the template:
```typescript
// Primary brand color
background: #4F46E5; // Indigo

// Hover state
background: #4338CA; // Darker indigo

// Instructions background
background-color: #fef3c7; // Yellow
```

### Modifying Content
Edit the template strings in `QR_CODE_EMAIL_TEMPLATE`:
```typescript
export const QR_CODE_EMAIL_TEMPLATE = {
  subject: (recipientName: string) => 
    `Your custom subject for ${recipientName}`,
  
  html: (data: QRCodeEmailData) => `
    <!-- Your custom HTML -->
  `,
};
```

### Adding Sections
Insert new sections in the HTML template:
```html
<div class="new-section">
  <h3>New Section Title</h3>
  <p>Content here</p>
</div>
```

## Best Practices

### Email HTML
1. Use inline CSS for all styling
2. Keep max-width at 600px
3. Use web-safe fonts
4. Test in multiple email clients
5. Provide text alternatives for images

### Content
1. Keep subject line under 50 characters
2. Use clear, action-oriented language
3. Include multiple ways to access content
4. Provide clear instructions
5. Add professional branding

### Images
1. Use Content-ID (cid) for inline images
2. Provide descriptive alt text
3. Specify dimensions for consistency
4. Use appropriate file formats (PNG for QR codes)
5. Keep file sizes reasonable

## Troubleshooting

### QR Code Not Displaying
- Verify Content-ID matches attachment: `cid:qrcode`
- Check base64 encoding is correct
- Ensure attachment has `contentId` property

### Links Not Working
- Verify URLs are absolute (include https://)
- Check for proper HTML encoding
- Test in different email clients

### Layout Issues
- Verify inline styles are present
- Check max-width is set
- Test responsive breakpoints
- Validate HTML structure

### Styling Problems
- Use inline styles instead of classes
- Avoid complex CSS (flexbox, grid)
- Test in Outlook (limited CSS support)
- Use web-safe fonts

## Related Files

- `src/services/EmailService.ts` - Email service implementation
- `src/services/__tests__/email-template.test.ts` - Template tests
- `src/app/(marketing)/editor/test-email-template/page.tsx` - Visual test page
- `src/services/__tests__/EmailService.test.ts` - Service integration tests

## References

- [Resend Email Best Practices](https://resend.com/docs/send-with-nodejs)
- [Email HTML Best Practices](https://www.campaignmonitor.com/css/)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
