# Card Collection Email Template

## Overview

This document describes the email template for the "12 Cartas" (12 Cards) product. The template is sent to the sender after successful payment, providing them with a link and QR code to share with the recipient.

## Template Features

### Visual Design
- **Gradient Hero Section**: Eye-catching purple gradient banner highlighting "12 Cartas - Uma Jornada Emocional Única"
- **Consistent Branding**: Maintains Paper Bloom's visual identity with colors (#4F46E5 primary)
- **Mobile Responsive**: Optimized for all screen sizes with media queries
- **Emoji Enhancement**: Strategic use of emojis (💌, 🎁, ✨) for emotional appeal

### Content Sections

1. **Header**
   - Personalized greeting to the sender
   - Confirmation that the 12 cards are ready
   - Recipient name highlighted

2. **Hero Banner**
   - "Uma Jornada Emocional Única" tagline
   - "12 mensagens especiais que só podem ser abertas uma vez cada"

3. **QR Code Section**
   - Embedded QR code image (attached as `cid:qrcode`)
   - Clear instructions to scan the code
   - Professional styling with border and padding

4. **Direct Link Section**
   - Full URL to the card collection
   - Prominent "Visualizar as 12 Cartas" button
   - Easy copy-paste access

5. **Special Note (Pink Box)**
   - **Critical Information**: Each card can only be opened once
   - Emphasizes the unique and special nature of the experience
   - Uses pink/rose color scheme for importance

6. **Sharing Instructions (Yellow Box)**
   - How to share via QR Code (WhatsApp, email, social media)
   - Suggestion to print the QR code for physical cards
   - Direct link sharing option
   - Reminder to save the QR code

7. **How It Works (Blue Box)**
   - Step-by-step explanation of the recipient's experience
   - Explains the "Abra quando..." (Open when...) concept
   - Clarifies the one-time opening mechanism
   - Sets expectations for the recipient

8. **Footer**
   - Paper Bloom branding
   - Website link
   - Standard email disclaimer

## Usage

### Sending the Email

```typescript
import { emailService, CardCollectionEmailData } from '@/services/EmailService';

const emailData: CardCollectionEmailData = {
  recipientEmail: 'sender@example.com',      // Email of the person who created the cards
  recipientName: 'Ana Costa',                // Name of the person who will receive the cards
  senderName: 'Pedro Silva',                 // Name of the person who created the cards
  collectionUrl: 'https://paperbloom.com/cartas/abc123',
  qrCodeDataUrl: 'data:image/png;base64,...' // Base64 encoded QR code
};

const result = await emailService.sendCardCollectionEmail(emailData);

if (result.success) {
  console.log('Email sent successfully:', result.messageId);
} else {
  console.error('Failed to send email:', result.error);
}
```

### Integration with Webhook

The email is automatically sent after successful payment via the Stripe webhook:

```typescript
// In webhook handler after payment confirmation
const qrCodeDataUrl = await qrCodeService.generateQRCode(collectionUrl);

await emailService.sendCardCollectionEmail({
  recipientEmail: collection.contactEmail,
  recipientName: collection.recipientName,
  senderName: collection.senderName,
  collectionUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/cartas/${collection.slug}`,
  qrCodeDataUrl,
});
```

## Template Customization

### Subject Line
```typescript
CARD_COLLECTION_EMAIL_TEMPLATE.subject(recipientName)
// Returns: "Suas 12 Cartas para {recipientName} estão prontas! 💌"
```

### HTML Content
The template includes:
- Personalized recipient and sender names
- Full collection URL
- Embedded QR code (via `cid:qrcode` attachment)
- Responsive CSS for mobile devices
- Accessibility features (alt text, semantic HTML)

## Requirements Validation

This template satisfies **Requirement 6.5**:
- ✅ Includes link for visualization
- ✅ Includes QR code as attachment
- ✅ Includes usage instructions
- ✅ Maintains site's visual identity
- ✅ Sent after payment confirmation

## Testing

Tests are located in `src/services/__tests__/EmailService.test.ts`:

```bash
npm test -- src/services/__tests__/EmailService.test.ts --run
```

Test coverage includes:
- Template subject generation
- HTML content with all required data
- Mobile responsive styles
- Visual identity elements
- Usage instructions
- Error handling
- Configuration validation

## Differences from Message Email Template

| Feature | Message Email | Card Collection Email |
|---------|--------------|----------------------|
| Subject | "Sua mensagem especial..." | "Suas 12 Cartas..." |
| Hero Section | Simple header | Gradient banner |
| Special Note | None | Pink box about one-time opening |
| Instructions | Basic sharing | Detailed "How It Works" |
| Tone | Single message | Journey/experience |
| Emojis | 🎁 | 💌, 🎁, ✨ |

## Accessibility

- Semantic HTML structure
- Alt text for QR code image
- High contrast text colors
- Readable font sizes (minimum 14px)
- Clear visual hierarchy
- Mobile-friendly touch targets (buttons 44px+)

## Browser Compatibility

The template is tested and compatible with:
- Gmail (web and mobile)
- Outlook (web and desktop)
- Apple Mail (iOS and macOS)
- Yahoo Mail
- ProtonMail
- Other major email clients

## Future Enhancements

Potential improvements:
- [ ] Add preview text for email clients
- [ ] Include thumbnail images of card templates
- [ ] Add social sharing buttons
- [ ] Implement email tracking (open rates)
- [ ] Add unsubscribe link (if required by regulations)
- [ ] Support for multiple languages
