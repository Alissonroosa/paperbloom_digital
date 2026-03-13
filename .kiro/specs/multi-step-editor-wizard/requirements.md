# Requirements Document

## Introduction

Este documento especifica os requisitos para transformar o editor de mensagens do Paper Bloom em um fluxo multi-etapas (wizard/stepper), melhorando a experiência do usuário ao dividir o processo de criação em etapas lógicas e gerenciáveis. O sistema também incluirá entrega do QR Code por email usando Resend após o pagamento bem-sucedido.

## Glossary

- **Wizard**: Interface de múltiplas etapas que guia o usuário através de um processo sequencial
- **Stepper**: Componente visual que mostra o progresso através das etapas do wizard
- **Etapa**: Uma seção específica do formulário focada em um conjunto relacionado de campos
- **Preview em Tempo Real**: Atualização instantânea da visualização conforme o usuário preenche os campos
- **Toggle de Visualização**: Controle que permite alternar entre visualização Card e Cinema
- **Resend**: Serviço de envio de emails transacionais
- **Tela de Entrega**: Página exibida após pagamento bem-sucedido contendo o QR Code
- **Sistema**: O editor de mensagens multi-etapas do Paper Bloom

## Requirements

### Requirement 1

**User Story:** Como usuário criador, eu quero preencher o formulário em etapas organizadas, para que eu possa focar em um aspecto da mensagem por vez sem me sentir sobrecarregado.

#### Acceptance Criteria

1. THE Sistema SHALL divide o formulário em 7 etapas distintas
2. WHEN a user completes a step, THE Sistema SHALL allow navigation to the next step
3. WHEN a user is on any step, THE Sistema SHALL display a visual stepper showing all steps and current progress
4. THE Sistema SHALL allow users to navigate back to previous steps to edit information
5. THE Sistema SHALL preserve all entered data when navigating between steps

### Requirement 2

**User Story:** Como usuário criador, eu quero preencher o título da página e URL personalizada na primeira etapa, para que eu possa definir a identidade básica da minha mensagem.

#### Acceptance Criteria

1. WHEN a user is on Step 1, THE Sistema SHALL display fields for page title and custom URL slug
2. THE Sistema SHALL validate that the URL slug contains only alphanumeric characters and hyphens
3. THE Sistema SHALL check URL slug availability in real-time
4. WHEN a user enters a title, THE Sistema SHALL auto-generate a suggested URL slug
5. THE Sistema SHALL limit the page title to 100 characters maximum
6. THE Sistema SHALL limit the URL slug to 50 characters maximum

### Requirement 3

**User Story:** Como usuário criador, eu quero selecionar uma data especial na segunda etapa, para que eu possa associar a mensagem a uma ocasião importante.

#### Acceptance Criteria

1. WHEN a user is on Step 2, THE Sistema SHALL display a date picker for special date selection
2. THE Sistema SHALL format the selected date as "DD de MMMM, YYYY" in Portuguese
3. THE Sistema SHALL allow users to optionally skip date selection
4. THE Sistema SHALL validate that the selected date is a valid calendar date
5. THE Sistema SHALL display the formatted date in the real-time preview

### Requirement 4

**User Story:** Como usuário criador, eu quero escrever a mensagem principal na terceira etapa, para que eu possa focar no conteúdo emocional central.

#### Acceptance Criteria

1. WHEN a user is on Step 3, THE Sistema SHALL display fields for recipient name, sender name, and main message
2. THE Sistema SHALL provide text suggestions for the main message field
3. THE Sistema SHALL limit the main message to 500 characters maximum
4. THE Sistema SHALL display character count feedback as the user types
5. THE Sistema SHALL validate that recipient and sender names are not empty
6. THE Sistema SHALL update the preview in real-time as the user types

### Requirement 5

**User Story:** Como usuário criador, eu quero fazer upload de fotos na quarta etapa, para que eu possa adicionar elementos visuais à mensagem.

#### Acceptance Criteria

1. WHEN a user is on Step 4, THE Sistema SHALL display upload areas for 1 main photo and up to 3 gallery photos
2. THE Sistema SHALL validate that each uploaded file is an image format (JPEG, PNG, WebP)
3. THE Sistema SHALL limit each image file size to 5MB maximum
4. THE Sistema SHALL display upload progress for each image
5. THE Sistema SHALL allow users to remove uploaded images and upload replacements
6. THE Sistema SHALL display uploaded images in the real-time preview

### Requirement 6

**User Story:** Como usuário criador, eu quero selecionar cor de fundo e tema na quinta etapa, para que eu possa personalizar a aparência visual da mensagem.

#### Acceptance Criteria

1. WHEN a user is on Step 5, THE Sistema SHALL display at least 8 background color options
2. WHEN a user is on Step 5, THE Sistema SHALL display at least 3 theme options (Light, Dark, Gradient)
3. WHEN a user selects a color or theme, THE Sistema SHALL apply it to the preview immediately
4. THE Sistema SHALL provide a color picker for custom background colors
5. THE Sistema SHALL ensure text remains readable with selected background (contrast validation)

### Requirement 7

**User Story:** Como usuário criador, eu quero adicionar link do YouTube e selecionar tempo de música na sexta etapa, para que eu possa incluir uma trilha sonora emocional.

#### Acceptance Criteria

1. WHEN a user is on Step 6, THE Sistema SHALL display a field for YouTube URL input
2. THE Sistema SHALL validate that the entered URL is a valid YouTube link
3. THE Sistema SHALL extract video ID from various YouTube URL formats
4. THE Sistema SHALL provide a slider to select music start time (0-300 seconds)
5. THE Sistema SHALL allow users to optionally skip music selection
6. THE Sistema SHALL display music player preview when YouTube link is valid

### Requirement 8

**User Story:** Como usuário criador, eu quero fornecer informações de contato na sétima etapa, para que eu possa receber o link e QR Code da mensagem.

#### Acceptance Criteria

1. WHEN a user is on Step 7, THE Sistema SHALL display fields for name, email, and phone number
2. THE Sistema SHALL validate email format using standard email regex
3. THE Sistema SHALL validate phone number format for Brazilian numbers
4. THE Sistema SHALL require all three fields (name, email, phone) to be filled
5. THE Sistema SHALL display a summary of all entered information before proceeding to payment
6. WHEN validation passes, THE Sistema SHALL enable the "Proceed to Payment" button

### Requirement 9

**User Story:** Como usuário criador, eu quero ver a preview atualizada em tempo real enquanto preencho as etapas, para que eu possa visualizar como a mensagem ficará.

#### Acceptance Criteria

1. WHEN a user enters data in any field, THE Sistema SHALL update the preview within 300ms
2. THE Sistema SHALL maintain preview visibility on desktop screens (min-width 1024px)
3. THE Sistema SHALL provide a "Preview" button on mobile/tablet screens to view the preview
4. THE Sistema SHALL reflect all customizations (text, images, colors, theme) in the preview
5. THE Sistema SHALL display placeholder content for empty fields in the preview

### Requirement 10

**User Story:** Como usuário criador, eu quero alternar entre visualização Card e Cinema na preview, para que eu possa ver ambas as experiências que o destinatário terá.

#### Acceptance Criteria

1. THE Sistema SHALL provide a toggle control with two options: "Card" and "Cinema"
2. WHEN a user selects "Card" view, THE Sistema SHALL display the static card layout preview
3. WHEN a user selects "Cinema" view, THE Sistema SHALL display the animated cinematic sequence
4. THE Sistema SHALL preserve the selected view mode when navigating between steps
5. THE Sistema SHALL default to "Card" view on initial load

### Requirement 11

**User Story:** Como usuário criador, eu quero ver o QR Code em uma tela de entrega após o pagamento, para que eu possa acessá-lo imediatamente.

#### Acceptance Criteria

1. WHEN payment is completed successfully, THE Sistema SHALL redirect to a delivery page
2. WHEN a user accesses the delivery page, THE Sistema SHALL display the generated QR Code
3. THE Sistema SHALL display the message URL alongside the QR Code
4. THE Sistema SHALL provide a "Download QR Code" button to save as PNG
5. THE Sistema SHALL provide a "Copy Link" button to copy the message URL
6. THE Sistema SHALL display instructions on how to share the message

### Requirement 12

**User Story:** Como usuário criador, eu quero receber o QR Code por email após o pagamento, para que eu possa acessá-lo posteriormente e compartilhar facilmente.

#### Acceptance Criteria

1. WHEN payment is completed successfully, THE Sistema SHALL send an email to the provided email address
2. THE Sistema SHALL include the QR Code as an embedded image in the email
3. THE Sistema SHALL include the message URL as a clickable link in the email
4. THE Sistema SHALL include instructions on how to use and share the message
5. WHEN email sending fails, THE Sistema SHALL log the error but still show the delivery page
6. THE Sistema SHALL use Resend service for email delivery
7. THE Sistema SHALL send the email within 30 seconds of payment completion

### Requirement 13

**User Story:** Como desenvolvedor, eu quero integrar o serviço Resend para envio de emails, para que o sistema possa enviar QR Codes de forma confiável.

#### Acceptance Criteria

1. THE Sistema SHALL use Resend API for all transactional emails
2. THE Sistema SHALL store Resend API key securely in environment variables
3. THE Sistema SHALL use a verified sender email address
4. THE Sistema SHALL handle Resend API errors gracefully
5. THE Sistema SHALL log all email sending attempts and results
6. THE Sistema SHALL retry failed email sends up to 3 times with exponential backoff

### Requirement 14

**User Story:** Como usuário criador, eu quero que o wizard seja responsivo em dispositivos móveis, para que eu possa criar mensagens em qualquer dispositivo.

#### Acceptance Criteria

1. THE Sistema SHALL display a mobile-optimized layout on screens smaller than 768px width
2. THE Sistema SHALL stack form and preview vertically on mobile devices
3. THE Sistema SHALL maintain all wizard functionality on mobile devices
4. THE Sistema SHALL use appropriate touch targets (minimum 44x44px) for mobile interactions
5. THE Sistema SHALL provide a floating "Preview" button on mobile to view the preview

### Requirement 15

**User Story:** Como usuário criador, eu quero que meu progresso seja salvo automaticamente, para que eu não perca meu trabalho se fechar o navegador.

#### Acceptance Criteria

1. WHEN a user makes changes to any field, THE Sistema SHALL save the data to browser local storage after 2 seconds of inactivity
2. WHEN a user returns to the editor, THE Sistema SHALL restore previously saved data and current step
3. THE Sistema SHALL display a visual indicator when auto-save occurs
4. WHEN payment is completed, THE Sistema SHALL clear the saved draft from local storage
5. THE Sistema SHALL provide a "Start Over" button to clear saved progress and restart from Step 1
