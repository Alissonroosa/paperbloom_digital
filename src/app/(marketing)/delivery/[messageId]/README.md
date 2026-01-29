# Delivery Page

## Overview

The Delivery Page displays the QR code and message URL after successful payment. This page is the final step in the message creation flow, providing users with all the tools they need to share their message.

## Requirements

This component implements the following requirements from the multi-step-editor-wizard spec:

- **11.1**: Redirect to delivery page after payment completion
- **11.2**: Display generated QR code prominently
- **11.3**: Show message URL with copy button
- **11.4**: Add download QR code button (PNG format)
- **11.5**: Display sharing instructions
- **11.6**: Show email confirmation message

## Route

```
/delivery/[messageId]
```

## Features

### 1. QR Code Display (Requirement 11.2)
- Displays the generated QR code prominently in a styled card
- Shows a placeholder with loading message if QR code is still being generated
- QR code is displayed at 240x240 pixels with proper styling

### 2. Message URL (Requirement 11.3)
- Shows the complete shareable URL for the message
- Includes a copy button for easy sharing
- Provides visual feedback when URL is copied

### 3. Download QR Code (Requirement 11.4)
- Button to download the QR code as a PNG file
- Downloaded file is named with the recipient's name for easy identification
- Button is disabled if QR code is not yet available

### 4. Sharing Instructions (Requirement 11.5)
- Clear, numbered instructions on how to share the message
- Multiple sharing methods: WhatsApp, Email, Print, Social Media
- Explains how to scan the QR code

### 5. Email Confirmation (Requirement 11.6)
- Shows a confirmation banner when email has been sent
- Informs user to check their inbox
- Only displayed when message status is 'paid'

## Data Flow

1. Page receives `messageId` from URL parameters
2. Fetches message data from `/api/messages/id/[messageId]`
3. Displays loading state while fetching
4. Shows error state if message not found
5. Renders success state with QR code and sharing options

## API Integration

### GET /api/messages/id/[messageId]

Fetches message data including:
- `id`: Message UUID
- `recipientName`: Name of the recipient
- `senderName`: Name of the sender
- `slug`: URL slug for the message
- `qrCodeUrl`: Public URL of the QR code image
- `status`: Payment status ('pending' or 'paid')
- `title`: Optional message title

## Components Used

- `Button`: Action buttons for copy and download
- `Card`: Container for QR code and message details
- `Image`: Next.js optimized image for QR code
- Lucide icons: CheckCircle, Copy, Download, Mail, Share2, etc.

## User Experience

### Success Flow
1. User completes payment
2. Redirected to `/delivery/[messageId]`
3. Sees success message with recipient name
4. Views QR code and message URL
5. Can copy URL or download QR code
6. Reads sharing instructions
7. Sees email confirmation (if sent)

### Error Handling
- Loading state with spinner
- Error message if message not found
- Disabled buttons if QR code not available
- Fallback UI for missing data

## Styling

- Responsive design for mobile and desktop
- Centered layout with max-width container
- Card-based UI with shadows and borders
- Color-coded confirmation messages
- Hover effects on interactive elements

## Cross-sell Section

Includes a promotional section for physical products:
- Suggests printing QR code on physical items
- Links to WhatsApp for customer support
- Animated gift icon with hover effect

## Future Enhancements

- Social media sharing buttons
- Preview of the actual message
- Analytics tracking for shares
- Multiple QR code formats (SVG, PDF)
- Customizable QR code colors
