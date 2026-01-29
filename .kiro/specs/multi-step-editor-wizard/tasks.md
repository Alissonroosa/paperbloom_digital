# Implementation Plan

- [x] 1. Setup wizard infrastructure and state management





  - Create WizardState type and initial state structure
  - Implement useWizardState hook for state management
  - Create wizard context provider for sharing state across components
  - Setup step validation schemas using Zod
  - _Requirements: 1.1, 1.5_

- [ ]* 1.1 Write property test for wizard state preservation
  - **Property 1: Step Navigation Preservation**
  - **Validates: Requirements 1.5**

- [x] 2. Create WizardStepper navigation component




  - Build visual stepper component showing all 7 steps
  - Implement step indicator with progress visualization
  - Add click handlers for step navigation
  - Style active, completed, and pending steps differently
  - Make stepper responsive for mobile devices
  - _Requirements: 1.3, 1.4_

- [x] 3. Implement Step 1: Page Title and URL





  - Create Step1PageTitleURL component with title and URL slug inputs
  - Implement auto-slug generation from title
  - Add real-time URL slug availability check
  - Display validation errors inline
  - Update preview with title changes
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ]* 3.1 Write property tests for slug generation and validation
  - **Property 2: URL Slug Validation**
  - **Property 3: Slug Generation from Title**
  - **Property 4: Title Length Validation**
  - **Property 5: URL Slug Length Validation**
  - **Validates: Requirements 2.2, 2.4, 2.5, 2.6**

- [x] 4. Implement Step 2: Special Date





  - Create Step2SpecialDate component with date picker
  - Format selected date in Portuguese (DD de MMMM, YYYY)
  - Allow optional date selection (skip functionality)
  - Update preview with formatted date
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 4.1 Write property test for date formatting
  - **Property 6: Date Formatting Consistency**
  - **Validates: Requirements 3.2**

- [x] 5. Implement Step 3: Main Message





  - Create Step3MainMessage component with recipient, sender, and message fields
  - Add character counter for message field (500 max)
  - Integrate existing TextSuggestionPanel component
  - Implement real-time validation
  - Update preview as user types
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ]* 5.1 Write property tests for message validation
  - **Property 7: Message Length Validation**
  - **Property 8: Character Count Accuracy**
  - **Validates: Requirements 4.3, 4.4**

- [x] 6. Implement Step 4: Photo Upload





  - Create Step4PhotoUpload component with main image and gallery slots
  - Implement drag-and-drop upload areas
  - Add image format validation (JPEG, PNG, WebP)
  - Add file size validation (5MB max)
  - Show upload progress indicators
  - Allow image removal and replacement
  - Update preview with uploaded images
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ]* 6.1 Write property tests for image validation
  - **Property 10: Image Format Validation**
  - **Property 11: Image Size Validation**
  - **Validates: Requirements 5.2, 5.3**

- [x] 7. Implement Step 5: Theme Customization





  - Create Step5ThemeCustomization component
  - Display 8 predefined background color options
  - Add custom color picker
  - Implement theme selector (Light, Dark, Gradient)
  - Add contrast validation with warnings
  - Update preview immediately with color/theme changes
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 7.1 Write property test for contrast validation
  - **Property 18: Contrast Validation**
  - **Validates: Requirements 6.5**

- [x] 8. Implement Step 6: Music Selection





  - Create Step6MusicSelection component
  - Add YouTube URL input field
  - Implement YouTube URL validation and video ID extraction
  - Add time slider for music start time (0-300 seconds)
  - Show music preview player when URL is valid
  - Allow optional skip
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ]* 8.1 Write property tests for YouTube URL handling
  - **Property 16: YouTube URL Validation**
  - **Property 17: YouTube Video ID Extraction**
  - **Validates: Requirements 7.2, 7.3**

- [x] 9. Implement Step 7: Contact Info and Summary





  - Create Step7ContactInfo component
  - Add name, email, and phone input fields
  - Implement email format validation
  - Implement Brazilian phone format validation
  - Display summary of all entered information
  - Enable "Proceed to Payment" button when valid
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ]* 9.1 Write property tests for contact validation
  - **Property 14: Email Format Validation**
  - **Property 15: Brazilian Phone Format Validation**
  - **Validates: Requirements 8.2, 8.3**

- [x] 10. Implement real-time preview panel





  - Create PreviewPanel component with Card/Cinema toggle
  - Implement view mode toggle control
  - Connect preview to wizard state for real-time updates
  - Ensure preview updates within 300ms of changes
  - Persist selected view mode across step navigation
  - Make preview sticky on desktop
  - Add floating preview button for mobile
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ]* 10.1 Write property tests for preview synchronization
  - **Property 9: Preview Update Responsiveness**
  - **Property 12: Preview Synchronization**
  - **Property 13: View Mode Persistence**
  - **Validates: Requirements 9.1, 9.4, 10.4**

- [x] 11. Implement wizard auto-save functionality





  - Create useWizardAutoSave hook
  - Save wizard state to localStorage after 2 seconds of inactivity
  - Include current step in saved state
  - Implement restore functionality on page load
  - Add visual auto-save indicator
  - Clear saved data after successful payment
  - Add "Start Over" button to clear progress
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ]* 11.1 Write property tests for auto-save
  - **Property 21: Auto-Save Round Trip**
  - **Property 22: Auto-Save Trigger Timing**
  - **Validates: Requirements 15.1, 15.2**

- [x] 12. Setup Resend email service integration





  - Install Resend SDK package
  - Create EmailService class with Resend integration
  - Add Resend configuration to environment variables
  - Implement email template for QR code delivery
  - Add retry logic with exponential backoff (3 attempts)
  - Implement error handling and logging
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

- [ ]* 12.1 Write property test for email retry logic
  - **Property 20: Email Retry with Exponential Backoff**
  - **Validates: Requirements 13.6**

- [x] 13. Create QR code email template





  - Design HTML email template with QR code
  - Include message URL as clickable link
  - Add usage instructions
  - Embed QR code image inline
  - Test email rendering across email clients
  - _Requirements: 12.2, 12.3, 12.4_

- [ ]* 13.1 Write property test for email content completeness
  - **Property 19: Email Content Completeness**
  - **Validates: Requirements 12.2, 12.3, 12.4**

- [x] 14. Create delivery page for QR code display





  - Create /delivery/[messageId] page route
  - Display generated QR code prominently
  - Show message URL with copy button
  - Add download QR code button (PNG format)
  - Display sharing instructions
  - Show email confirmation message
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

- [x] 15. Integrate email sending with payment webhook





  - Update Stripe webhook handler to trigger email send
  - Generate QR code after successful payment
  - Call EmailService to send QR code email
  - Handle email send failures gracefully (log but don't block)
  - Redirect to delivery page after payment
  - _Requirements: 12.1, 12.5, 12.6, 12.7_

- [x] 16. Create API route for slug availability check





  - Create /api/messages/check-slug route
  - Query database for existing slugs
  - Return availability status
  - Suggest alternative slugs if taken
  - _Requirements: 2.3_

- [x] 17. Implement mobile responsive design





  - Make wizard layout responsive for screens < 768px
  - Stack form and preview vertically on mobile
  - Ensure all wizard functionality works on mobile
  - Use minimum 44x44px touch targets
  - Add floating preview button for mobile
  - Test on various mobile devices
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ]* 17.1 Write property tests for mobile functionality
  - **Property 23: Touch Target Minimum Size**
  - **Property 24: Wizard Functionality on Mobile**
  - **Validates: Requirements 14.3, 14.4**

- [x] 18. Update main editor page to use wizard





  - Replace existing EditorForm with WizardEditor component
  - Migrate existing form fields to appropriate wizard steps
  - Ensure backward compatibility with existing data
  - Update page layout for wizard + preview
  - Test complete flow from start to payment
  - _Requirements: All_

- [x] 19. Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 20. Write integration tests for complete wizard flow
  - Test completing all 7 steps with valid data
  - Test navigation between steps preserves data
  - Test validation prevents progression with invalid data
  - Test payment integration with wizard data
  - Test email delivery after payment
  - Test auto-save and restore functionality

- [ ]* 21. Write accessibility tests
  - Test keyboard navigation through wizard
  - Test screen reader compatibility
  - Verify ARIA labels on all interactive elements
  - Test color contrast for all themes
  - Verify touch target sizes on mobile
