# Implementation Plan - Paper Bloom Backend

- [x] 1. Setup project infrastructure and database





  - Install required dependencies (pg, stripe, qrcode, sharp, zod)
  - Create database schema and migrations
  - Set up environment variables
  - Configure database connection with pooling
  - _Requirements: 6.1, 6.2, 6.3_

- [ ]* 1.1 Write property test for database connection
  - **Property 25: Timestamps are automatically set**
  - **Validates: Requirements 6.2**

- [x] 2. Implement core data models and validation schemas





  - Create Zod schemas for message validation
  - Create TypeScript interfaces for all data models
  - Implement validation functions for required fields
  - _Requirements: 1.1, 5.1_

- [ ]* 2.1 Write property test for message validation
  - **Property 1: Message validation rejects incomplete data**
  - **Validates: Requirements 1.1**

- [ ]* 2.2 Write property test for JSON validation
  - **Property 20: Invalid JSON is rejected**
  - **Validates: Requirements 5.1**
-

- [x] 3. Implement MessageService with database operations




  - Create MessageService class with CRUD methods
  - Implement create() method with UUID generation
  - Implement findById() and findBySlug() methods
  - Implement updateStatus() and updateQRCode() methods
  - Implement incrementViewCount() method
  - _Requirements: 1.4, 1.5, 4.1, 4.5_

- [ ]* 3.1 Write property test for message ID uniqueness
  - **Property 4: Message ID uniqueness**
  - **Validates: Requirements 1.4**

- [ ]* 3.2 Write property test for message persistence
  - **Property 5: Message persistence round-trip**
  - **Validates: Requirements 1.5**

- [ ]* 3.3 Write property test for view count increment
  - **Property 19: View count increments on access**
  - **Validates: Requirements 4.5**

- [ ]* 3.4 Write property test for database transactions
  - **Property 27: Failed transactions rollback**
  - **Validates: Requirements 6.4**

- [x] 4. Implement SlugService for URL generation





  - Create SlugService class
  - Implement normalizeString() to handle special characters
  - Implement generateSlug() with format /mensagem/{name}/{id}
  - _Requirements: 3.1, 3.5_

- [ ]* 4.1 Write property test for slug format
  - **Property 10: Slug format validation**
  - **Validates: Requirements 3.1**

- [ ]* 4.2 Write property test for special character normalization
  - **Property 14: Special characters are normalized in slugs**
  - **Validates: Requirements 3.5**

- [x] 5. Implement ImageService for file uploads





  - Create ImageService class
  - Implement validateImageType() for JPEG, PNG, WebP
  - Implement resize() using sharp library
  - Implement upload() to save files to public/uploads/images
  - Generate and return public URLs for uploaded images
  - _Requirements: 1.2, 8.1, 8.2, 8.3, 8.5, 10.3_

- [ ]* 5.1 Write property test for image type validation
  - **Property 31: Invalid image types are rejected**
  - **Validates: Requirements 8.1**

- [ ]* 5.2 Write property test for image resizing
  - **Property 32: Large images are resized**
  - **Validates: Requirements 8.2**

- [ ]* 5.3 Write property test for image URL accessibility
  - **Property 2: Image upload round-trip**
  - **Validates: Requirements 1.2**

- [ ]* 5.4 Write property test for image size limit
  - **Property 41: Image size limit enforcement**
  - **Validates: Requirements 10.3**

- [x] 6. Implement QRCodeService for QR code generation





  - Create QRCodeService class
  - Implement generate() using qrcode library
  - Set minimum resolution to 300x300 pixels
  - Save QR codes to public/uploads/qrcodes
  - Generate unique filenames using messageId
  - Return public URLs for QR codes
  - _Requirements: 3.2, 3.3, 9.1, 9.2, 9.4, 9.5_

- [ ]* 6.1 Write property test for QR code resolution
  - **Property 36: QR codes meet minimum resolution**
  - **Validates: Requirements 9.1**

- [ ]* 6.2 Write property test for QR code content
  - **Property 11: QR code URL round-trip**
  - **Property 37: QR codes contain complete URLs**
  - **Validates: Requirements 3.2, 9.2**

- [ ]* 6.3 Write property test for QR code URL accessibility
  - **Property 12: QR code URL accessibility**
  - **Validates: Requirements 3.3**

- [ ]* 6.4 Write property test for QR code filename uniqueness
  - **Property 40: QR code filenames are unique**
  - **Validates: Requirements 9.5**

- [x] 7. Implement YouTube URL validation





  - Create validation function for YouTube URLs
  - Support various YouTube URL formats (watch, youtu.be, embed)
  - Integrate into message validation schema
  - _Requirements: 1.3_

- [ ]* 7.1 Write property test for YouTube URL validation
  - **Property 3: YouTube URL validation**
  - **Validates: Requirements 1.3**

- [x] 8. Create API route: POST /api/messages/create





  - Implement route handler for message creation
  - Validate request body using Zod schema
  - Call MessageService.create()
  - Return message ID and success response
  - Handle validation errors with 400 status
  - Include CORS headers
  - _Requirements: 1.1, 1.4, 1.5, 5.1, 5.2, 5.3, 5.4_

- [ ]* 8.1 Write property test for validation error responses
  - **Property 21: Validation errors return 4xx with message**
  - **Property 30: Error messages match fields**
  - **Validates: Requirements 5.2, 7.4**

- [ ]* 8.2 Write property test for successful responses
  - **Property 22: Successful operations return 2xx**
  - **Validates: Requirements 5.3**

- [ ]* 8.3 Write property test for CORS headers
  - **Property 23: CORS headers are present**
  - **Validates: Requirements 5.4**

- [x] 9. Create API route: POST /api/messages/upload-image




  - Implement route handler for image uploads
  - Parse multipart/form-data requests
  - Validate file type and size
  - Call ImageService.upload()
  - Return image URL
  - Handle upload errors with descriptive messages
  - _Requirements: 1.2, 5.5, 8.1, 8.4, 8.5_

- [ ]* 9.1 Write property test for multipart support
  - **Property 24: Multipart uploads are supported**
  - **Validates: Requirements 5.5**

- [ ]* 9.2 Write property test for upload error messages
  - **Property 34: Upload failures return error messages**
  - **Validates: Requirements 8.4**

- [x] 10. Create API route: GET /api/messages/[slug]





  - Implement dynamic route handler for message retrieval
  - Parse slug from URL parameters
  - Call MessageService.findBySlug()
  - Check message status (must be 'paid')
  - Increment view count
  - Return message data or appropriate error
  - Handle 404 for non-existent messages
  - Handle 402 for unpaid messages
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 10.1 Write property test for slug lookup
  - **Property 15: Slug lookup returns correct message**
  - **Validates: Requirements 4.1**

- [ ]* 10.2 Write property test for paid message data
  - **Property 16: Paid messages return complete data**
  - **Validates: Requirements 4.2**

- [ ]* 10.3 Write property test for non-existent slugs
  - **Property 17: Non-existent slugs return 404**
  - **Validates: Requirements 4.3**

- [ ]* 10.4 Write property test for unpaid messages
  - **Property 18: Unpaid messages are not accessible**
  - **Validates: Requirements 4.4**

- [x] 11. Implement StripeService for payment processing





  - Create StripeService class
  - Initialize Stripe SDK with secret key
  - Implement createCheckoutSession() method
  - Configure session with success/cancel URLs
  - Store messageId in session metadata
  - Implement verifyWebhookSignature() method
  - Implement handleSuccessfulPayment() method
  - _Requirements: 2.1, 2.5_

- [ ]* 11.1 Write property test for Stripe session creation
  - **Property 6: Stripe session contains message data**
  - **Validates: Requirements 2.1**

- [ ]* 11.2 Write property test for webhook signature validation
  - **Property 9: Invalid webhook signatures are rejected**
  - **Validates: Requirements 2.5**

- [x] 12. Create API route: POST /api/checkout/create-session





  - Implement route handler for checkout session creation
  - Validate messageId in request body
  - Verify message exists and is pending
  - Call StripeService.createCheckoutSession()
  - Update message with stripeSessionId
  - Return session ID and checkout URL
  - _Requirements: 2.1_
-

- [x] 13. Create API route: POST /api/checkout/webhook




  - Implement webhook handler for Stripe events
  - Verify webhook signature
  - Handle 'checkout.session.completed' event
  - Extract messageId from session metadata
  - Update message status to 'paid'
  - Generate slug using SlugService
  - Generate QR code using QRCodeService
  - Update message with slug and qrCodeUrl
  - Return 200 response to Stripe
  - _Requirements: 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3_

- [ ]* 13.1 Write property test for successful payment status update
  - **Property 7: Successful payment updates status**
  - **Validates: Requirements 2.2, 2.3**

- [ ]* 13.2 Write property test for failed payment status
  - **Property 8: Failed payment preserves pending status**
  - **Validates: Requirements 2.4**

- [x] 14. Create success page with QR code and link display





  - Create page at /success with session_id query parameter
  - Fetch message data using session_id
  - Display QR code image
  - Display shareable link
  - Add copy-to-clipboard functionality
  - Add download QR code button
  - _Requirements: 3.4, 7.5_

- [ ]* 14.1 Write property test for payment confirmation response
  - **Property 13: Payment confirmation returns both link and QR code**
  - **Validates: Requirements 3.4**

- [x] 15. Create message view page at /mensagem/[recipient]/[id]






  - Create dynamic route for message viewing
  - Parse recipient name and message ID from URL
  - Construct slug and fetch message
  - Display message content with cinematic experience
  - Reuse existing demo/message page components
  - Handle loading and error states
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ]* 15.1 Write property test for QR code redirect
  - **Property 38: QR codes redirect correctly**
  - **Validates: Requirements 9.3**

- [x] 16. Update editor page to integrate with backend





  - Modify /editor page to use real API endpoints
  - Implement image upload on file selection
  - Implement message creation on form submission
  - Implement checkout redirect on payment button click
  - Add loading states and error handling
  - Validate form before submission
  - _Requirements: 7.1, 7.3, 7.4_

- [ ]* 16.1 Write property test for form validation before payment
  - **Property 29: Form validation before payment**
  - **Validates: Requirements 7.3**
- [x] 17. Implement error handling middleware




- [ ] 17. Implement error handling middleware

  - Create centralized error handler
  - Map error types to HTTP status codes
  - Format error responses consistently
  - Log errors with context
  - Handle database errors
  - Handle Stripe API errors
  - Handle file system errors
  - _Requirements: 5.2, 8.4_

- [x] 18. Add database constraints and indexes




  - Add UNIQUE constraint on slug column
  - Add indexes on slug, status, stripeSessionId
  - Add NOT NULL constraints on required fields
  - Add CHECK constraint on status enum
  - Test constraint violations
  - _Requirements: 6.3_

- [ ]* 18.1 Write property test for referential integrity
  - **Property 26: Referential integrity is enforced**
  - **Validates: Requirements 6.3**

- [x] 19. Implement URL accessibility validation





  - Create utility function to validate URL accessibility
  - Check imageUrl and qrCodeUrl after storage
  - Implement retry logic for transient failures
  - Log inaccessible URLs
  - _Requirements: 6.5_

- [ ]* 19.1 Write property test for stored URL accessibility
  - **Property 28: Stored URLs are accessible**
  - **Property 33: Processed images are publicly accessible**
  - **Property 35: Stored images have public URLs**
  - **Property 39: QR code storage and URL return**
  - **Validates: Requirements 6.5, 8.3, 8.5, 9.4**

- [x] 20. Create database migration script




  - Write SQL migration for messages table
  - Include all columns, constraints, and indexes
  - Create migration runner script
  - Test migration on clean database
  - Document rollback procedure
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 21. Set up environment variables and configuration





  - Create .env.example file with all required variables
  - Document each environment variable
  - Add validation for required environment variables on startup
  - Configure different values for development/production
  - _Requirements: 6.1_

- [ ] 22. Checkpoint - Ensure all tests pass




  - Ensure all tests pass, ask the user if questions arise.

- [ ] 23. Add comprehensive error messages and logging
  - Implement structured logging
  - Add request ID tracking
  - Log all API requests and responses
  - Log all errors with stack traces
  - Add performance metrics logging
  - _Requirements: 5.2, 8.4_

- [ ] 24. Implement rate limiting (optional security enhancement)
  - Add rate limiting middleware to API routes
  - Configure limits per endpoint
  - Return 429 status when limit exceeded
  - _Requirements: Security considerations_

- [ ] 25. Add API documentation
  - Document all API endpoints
  - Include request/response examples
  - Document error codes and messages
  - Add authentication requirements (if any)
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 26. Final Checkpoint - Ensure all tests pass and system is ready
  - Run all unit tests
  - Run all property-based tests
  - Test complete user flow end-to-end
  - Verify Stripe integration in test mode
  - Verify QR code generation and scanning
  - Verify database operations
  - Ensure all tests pass, ask the user if questions arise.
