# Requirements Document

## Introduction

Este documento especifica os requisitos para aprimorar o editor de mensagens do Paper Bloom, transformando-o em uma ferramenta completa de criação de experiências emocionais digitais. O editor atual em `/editor` será movido para `/editor/mensagem` e expandido para incluir todos os campos e funcionalidades demonstrados na página `/demo/message`, além de adicionar templates, modelos e sugestões de texto para facilitar a criação de mensagens personalizadas.

## Glossary

- **Editor de Mensagens**: Interface de criação e personalização de mensagens emocionais digitais
- **Template**: Estrutura pré-definida de mensagem com campos e layout específicos
- **Modelo**: Exemplo completo de mensagem que pode ser usado como ponto de partida
- **Sugestão de Texto**: Texto pré-escrito que o usuário pode selecionar e personalizar
- **Experiência Cinemática**: Sequência animada de apresentação da mensagem com múltiplos estágios
- **Preview**: Visualização em tempo real de como a mensagem será exibida ao destinatário
- **Sistema**: O editor de mensagens do Paper Bloom

## Requirements

### Requirement 1

**User Story:** Como usuário criador, eu quero acessar o editor de mensagens em uma URL específica `/editor/mensagem`, para que eu possa criar mensagens enquanto outros produtos futuros tenham seus próprios editores.

#### Acceptance Criteria

1. WHEN a user navigates to `/editor/mensagem`, THE Sistema SHALL display the message editor interface
2. WHEN a user navigates to the old `/editor` path, THE Sistema SHALL redirect to `/editor/mensagem`
3. THE Sistema SHALL maintain the current editor layout with form on the left and preview on the right
4. THE Sistema SHALL preserve all existing functionality during the migration

### Requirement 2

**User Story:** Como usuário criador, eu quero adicionar um título personalizado à minha mensagem, para que eu possa criar um impacto inicial forte como visto na demo.

#### Acceptance Criteria

1. THE Sistema SHALL provide an input field for the message title
2. WHEN a user enters a title, THE Sistema SHALL display it in the preview with large, prominent typography
3. THE Sistema SHALL limit the title to 100 characters maximum
4. THE Sistema SHALL display the title in the cinematic intro sequence of the preview
5. WHEN the title field is empty, THE Sistema SHALL use a default placeholder text in the preview

### Requirement 3

**User Story:** Como usuário criador, eu quero adicionar uma data especial à minha mensagem, para que eu possa marcar ocasiões importantes como aniversários ou comemorações.

#### Acceptance Criteria

1. THE Sistema SHALL provide a date picker input field
2. WHEN a user selects a date, THE Sistema SHALL format it as "DD de MMMM, YYYY" in Portuguese
3. THE Sistema SHALL display the formatted date in the preview header
4. WHEN no date is selected, THE Sistema SHALL use the current date as default
5. THE Sistema SHALL validate that the selected date is a valid calendar date

### Requirement 4

**User Story:** Como usuário criador, eu quero adicionar múltiplas fotos à minha mensagem, para que eu possa criar uma galeria de memórias como mostrado na demo.

#### Acceptance Criteria

1. THE Sistema SHALL allow users to upload up to 4 photos total (1 principal + 3 gallery)
2. WHEN a user uploads photos, THE Sistema SHALL display them in a grid layout in the preview
3. THE Sistema SHALL validate that each uploaded file is an image format (JPEG, PNG, WebP)
4. THE Sistema SHALL limit each image file size to 5MB maximum
5. THE Sistema SHALL provide visual feedback during image upload process
6. WHEN gallery photos are uploaded, THE Sistema SHALL display them in the full-view section of the preview

### Requirement 5

**User Story:** Como usuário criador, eu quero adicionar uma mensagem de fechamento personalizada, para que eu possa criar uma experiência completa com introdução e conclusão.

#### Acceptance Criteria

1. THE Sistema SHALL provide a textarea field for the closing message
2. WHEN a user enters closing text, THE Sistema SHALL display it in the closing sequence of the preview
3. THE Sistema SHALL limit the closing message to 200 characters maximum
4. WHEN the closing field is empty, THE Sistema SHALL use default closing text
5. THE Sistema SHALL display character count feedback as the user types

### Requirement 6

**User Story:** Como usuário criador, eu quero adicionar uma assinatura personalizada à minha mensagem, para que eu possa assinar de forma criativa além do campo "De".

#### Acceptance Criteria

1. THE Sistema SHALL provide an input field for custom signature text
2. WHEN a user enters a signature, THE Sistema SHALL display it below the main message in script font
3. THE Sistema SHALL limit the signature to 50 characters maximum
4. WHEN the signature field is empty, THE Sistema SHALL use the "from" field value with a default prefix
5. THE Sistema SHALL format the signature with decorative styling in the preview

### Requirement 7

**User Story:** Como usuário criador, eu quero selecionar templates pré-definidos, para que eu possa começar rapidamente com estruturas apropriadas para diferentes ocasiões.

#### Acceptance Criteria

1. THE Sistema SHALL provide at least 5 template options (Aniversário, Amor, Amizade, Gratidão, Parabéns)
2. WHEN a user selects a template, THE Sistema SHALL populate all fields with template-specific content
3. WHEN a user selects a template, THE Sistema SHALL allow editing of all populated fields
4. THE Sistema SHALL display template previews before selection
5. THE Sistema SHALL preserve user-entered data when switching between templates with a confirmation dialog

### Requirement 8

**User Story:** Como usuário criador, eu quero ver modelos completos de mensagens, para que eu possa me inspirar ou usar como ponto de partida.

#### Acceptance Criteria

1. THE Sistema SHALL provide at least 3 complete message examples for each template category
2. WHEN a user views a model, THE Sistema SHALL display a full preview of the example message
3. WHEN a user selects a model, THE Sistema SHALL populate all editor fields with the model content
4. THE Sistema SHALL allow users to customize any aspect of the selected model
5. THE Sistema SHALL clearly indicate that models are starting points for customization

### Requirement 9

**User Story:** Como usuário criador, eu quero receber sugestões de texto para diferentes campos, para que eu possa superar o bloqueio criativo e escrever mensagens mais impactantes.

#### Acceptance Criteria

1. THE Sistema SHALL provide at least 10 text suggestions for the main message field
2. THE Sistema SHALL provide at least 5 text suggestions for the title field
3. THE Sistema SHALL provide at least 5 text suggestions for the closing message field
4. WHEN a user clicks a suggestion, THE Sistema SHALL insert it into the corresponding field
5. THE Sistema SHALL organize suggestions by category (Romântico, Amigável, Formal, Casual)
6. THE Sistema SHALL allow users to edit inserted suggestions
7. WHEN a field already contains text, THE Sistema SHALL ask for confirmation before replacing with a suggestion

### Requirement 10

**User Story:** Como usuário criador, eu quero visualizar minha mensagem em modo preview cinemático, para que eu possa ver exatamente como o destinatário experimentará a mensagem.

#### Acceptance Criteria

1. THE Sistema SHALL provide a preview that simulates the full cinematic experience
2. WHEN preview data changes, THE Sistema SHALL update the preview in real-time
3. THE Sistema SHALL display all stages of the cinematic sequence (intro, photo reveal, message, closing)
4. THE Sistema SHALL allow users to restart the preview sequence
5. THE Sistema SHALL display the full-view layout with all content sections
6. THE Sistema SHALL accurately reflect all user customizations in the preview

### Requirement 11

**User Story:** Como usuário criador, eu quero que o editor valide meus dados antes de prosseguir para o pagamento, para que eu não perca tempo com informações incompletas ou inválidas.

#### Acceptance Criteria

1. WHEN a user attempts to proceed to payment, THE Sistema SHALL validate all required fields
2. THE Sistema SHALL display clear error messages for each invalid or missing field
3. THE Sistema SHALL prevent navigation to payment when validation fails
4. THE Sistema SHALL highlight invalid fields with visual indicators
5. THE Sistema SHALL validate YouTube URL format when provided
6. THE Sistema SHALL validate image file formats and sizes
7. THE Sistema SHALL validate character limits for all text fields

### Requirement 12

**User Story:** Como usuário criador, eu quero salvar meu progresso automaticamente, para que eu não perca meu trabalho se fechar acidentalmente o navegador.

#### Acceptance Criteria

1. WHEN a user makes changes to any field, THE Sistema SHALL save the data to browser local storage after 2 seconds of inactivity
2. WHEN a user returns to the editor, THE Sistema SHALL restore previously saved data from local storage
3. THE Sistema SHALL display a visual indicator when auto-save occurs
4. WHEN a user completes payment, THE Sistema SHALL clear the saved draft from local storage
5. THE Sistema SHALL provide a manual "Clear Draft" button to discard saved progress

### Requirement 13

**User Story:** Como desenvolvedor, eu quero que o editor seja responsivo e acessível, para que todos os usuários possam criar mensagens em qualquer dispositivo.

#### Acceptance Criteria

1. THE Sistema SHALL display a mobile-optimized layout on screens smaller than 768px width
2. THE Sistema SHALL maintain all functionality on mobile devices
3. THE Sistema SHALL use appropriate touch targets (minimum 44x44px) for mobile interactions
4. THE Sistema SHALL provide keyboard navigation for all interactive elements
5. THE Sistema SHALL include appropriate ARIA labels for screen readers
6. THE Sistema SHALL maintain readable text contrast ratios (minimum 4.5:1)
