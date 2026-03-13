# Success Page

Payment confirmation page that displays QR code and shareable link.

## Requirements
- 3.4: Payment confirmation returns both link and QR code
- 7.5: User completes payment and is redirected to success page with QR code and link

## Route

`/success?session_id={CHECKOUT_SESSION_ID}`

## Features

### 1. Fetch Message Data
- Retrieves message data using Stripe session ID from query parameter
- Displays loading state while fetching
- Shows error message if fetch fails

### 2. Display QR Code
- Shows the generated QR code image
- Displays placeholder if QR code is still processing
- QR code is displayed in a styled container with border

### 3. Display Shareable Link
- Shows the full message URL in a read-only input field
- Format: `{baseUrl}/mensagem/{recipient-name}/{message-id}`

### 4. Copy to Clipboard
- Copy button next to the shareable link
- Visual feedback when link is copied (checkmark icon)
- Separate "Copy Link" button in action buttons section

### 5. Download QR Code
- Download button to save QR code as PNG file
- Filename format: `qrcode-{recipientName}.png`
- Disabled if QR code is not yet available

### 6. Cross-sell Section
- Promotes physical products (mugs, frames)
- WhatsApp link to contact sales

## User Flow

1. User completes payment on Stripe checkout page
2. Stripe redirects to `/success?session_id={SESSION_ID}`
3. Page fetches message data using session ID
4. Displays QR code and shareable link
5. User can:
   - Copy the link to clipboard
   - Download the QR code
   - Contact sales for physical products
   - Return to home page

## State Management

- `messageData`: Stores fetched message information
- `loading`: Loading state during data fetch
- `error`: Error message if fetch fails
- `copied`: Temporary state for copy feedback

## Error Handling

- Missing session_id: Shows error message
- Failed fetch: Shows error with retry option
- Message not found: Shows error message
- All errors include link to return home

## Implementation Notes

- Client component (uses hooks and browser APIs)
- Uses Next.js Image component for QR code display
- Responsive design for mobile and desktop
- Accessible with proper ARIA labels and keyboard navigation
