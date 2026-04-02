# Requirements Document

## Introduction

Este documento define os requisitos para transformar os formulários padrão dos produtos "12 Cartas" e "Mensagem Digital" em formulários interativos fullscreen, seguindo o padrão já existente do produto "Revelação Virtual". O objetivo é criar uma experiência imersiva e emocional para os usuários durante a criação de seus presentes digitais personalizados.

## Glossary

- **Interactive_Wizard**: Sistema de formulário fullscreen com steps animados, transições suaves e elementos visuais emocionais (emojis, gradientes)
- **Step_Component**: Componente React que representa uma etapa do wizard, ocupando 100vh com foco total no conteúdo
- **Progress_Indicator**: Indicador visual de progresso usando bolinhas coloridas que mostram o step atual
- **Animated_Emoji**: Emoji com animação de entrada (scale, opacity) usado como elemento visual emocional
- **Step_Transition**: Animação de transição entre steps usando Framer Motion (AnimatePresence)
- **Fullscreen_Layout**: Layout que ocupa toda a viewport (100dvh) com gradiente de fundo suave
- **Auto_Save_System**: Sistema que salva automaticamente o progresso do usuário em sessionStorage/localStorage
- **Validation_System**: Sistema de validação de campos por step antes de permitir navegação
- **12_Cartas_Editor**: Editor atual do produto 12 Cartas com 5 steps e layout tradicional (sidebar + preview)
- **Mensagem_Digital_Editor**: Editor atual do produto Mensagem Digital com 7 steps e WizardEditor
- **Revelacao_Virtual_Editor**: Editor de referência com 4 steps fullscreen interativos (padrão a seguir)

## Requirements

### Requirement 1: Sistema de Wizard Interativo Genérico

**User Story:** As a developer, I want a reusable interactive wizard system, so that I can easily create fullscreen immersive forms for different products.

#### Acceptance Criteria

1. THE Interactive_Wizard SHALL provide a generic context provider that manages step navigation, form data, and validation state
2. THE Interactive_Wizard SHALL support configurable number of steps via props
3. THE Interactive_Wizard SHALL provide hooks for accessing wizard state (useInteractiveWizard)
4. THE Interactive_Wizard SHALL support custom step components via children or render props
5. WHEN a step is rendered, THE Step_Component SHALL occupy 100dvh with centered content
6. THE Interactive_Wizard SHALL apply a gradient background (configurable colors) across all steps

### Requirement 2: Animações e Transições entre Steps

**User Story:** As a user, I want smooth animated transitions between form steps, so that the experience feels fluid and engaging.

#### Acceptance Criteria

1. WHEN navigating between steps, THE Step_Transition SHALL animate with opacity and x-axis movement (enter from right, exit to left)
2. THE Step_Transition SHALL use Framer Motion AnimatePresence with mode="wait"
3. THE Step_Transition SHALL complete within 300ms duration
4. WHEN a step loads, THE Animated_Emoji SHALL animate with scale (0 to 1) and spring physics (damping: 10)
5. WHEN a step loads, THE Step_Component content SHALL animate with staggered delays (0.1s, 0.2s, 0.4s, 0.5s, 0.7s)
6. THE Progress_Indicator SHALL highlight the current step with scale transformation (scale-125) and distinct color

### Requirement 3: Indicador de Progresso Visual

**User Story:** As a user, I want to see my progress through the form, so that I know how many steps remain.

#### Acceptance Criteria

1. THE Progress_Indicator SHALL display circular dots for each step in the wizard
2. WHEN a step is current, THE Progress_Indicator SHALL highlight that dot with a distinct color and scale-125 transformation
3. WHEN a step is completed, THE Progress_Indicator SHALL show that dot with a secondary completed color
4. THE Progress_Indicator SHALL be positioned at the top of each step, between navigation links
5. THE Progress_Indicator SHALL support configurable colors per product (blue/pink for Revelação, other themes for other products)

### Requirement 4: Migração do Editor 12 Cartas

**User Story:** As a user creating 12 Cartas, I want an immersive fullscreen experience, so that I can focus on each card creation step without distractions.

#### Acceptance Criteria

1. THE 12_Cartas_Editor SHALL be migrated to use the Interactive_Wizard system with fullscreen steps
2. THE 12_Cartas_Editor SHALL maintain all existing functionality (card editing, photo upload, message editing)
3. THE 12_Cartas_Editor SHALL organize its 5 current steps into fullscreen interactive steps
4. WHEN editing a card message, THE 12_Cartas_Editor SHALL display an inline editor within the fullscreen step (not modal)
5. WHEN uploading a photo, THE 12_Cartas_Editor SHALL display the upload interface within the fullscreen step
6. THE 12_Cartas_Editor SHALL preserve auto-save functionality using the existing CardCollectionEditorContext
7. THE 12_Cartas_Editor SHALL use themed emojis appropriate for the product (💌, 💝, 📝, 🎁, ✨)
8. THE 12_Cartas_Editor SHALL move from (marketing) layout to (fullscreen) layout

### Requirement 5: Migração do Editor Mensagem Digital

**User Story:** As a user creating Mensagem Digital, I want an immersive fullscreen experience, so that I can focus on crafting my personalized message.

#### Acceptance Criteria

1. THE Mensagem_Digital_Editor SHALL be migrated to use the Interactive_Wizard system with fullscreen steps
2. THE Mensagem_Digital_Editor SHALL maintain all existing 7 steps functionality
3. THE Mensagem_Digital_Editor SHALL preserve the WizardContext data structure and validation
4. WHEN on the photo upload step, THE Mensagem_Digital_Editor SHALL display the upload interface fullscreen
5. WHEN on the theme customization step, THE Mensagem_Digital_Editor SHALL show theme options in a visually appealing grid
6. THE Mensagem_Digital_Editor SHALL preserve auto-save functionality using useWizardAutoSave
7. THE Mensagem_Digital_Editor SHALL use themed emojis appropriate for the product (💌, 📅, 💬, 📸, 🎨, 🎵, 📧)
8. THE Mensagem_Digital_Editor SHALL move from (marketing) layout to (fullscreen) layout

### Requirement 6: Validação por Step

**User Story:** As a user, I want clear validation feedback on each step, so that I know what information is required before proceeding.

#### Acceptance Criteria

1. WHEN required fields are empty, THE Validation_System SHALL display inline error messages below each field
2. WHEN the user clicks "Continuar", THE Validation_System SHALL validate all required fields in the current step
3. IF validation fails, THEN THE Validation_System SHALL prevent navigation to the next step
4. IF validation fails, THEN THE Validation_System SHALL highlight invalid fields with red border and background
5. WHEN all required fields are valid, THE Validation_System SHALL allow navigation to the next step
6. THE Validation_System SHALL clear field errors when the user starts typing in that field

### Requirement 7: Navegação entre Steps

**User Story:** As a user, I want intuitive navigation between form steps, so that I can move forward and backward easily.

#### Acceptance Criteria

1. THE Interactive_Wizard SHALL display a "Continuar →" button at the bottom of each step (except the last)
2. THE Interactive_Wizard SHALL display a "← Voltar" link at the top-left of each step (except the first)
3. WHEN on the first step, THE Interactive_Wizard SHALL display a link to return to the home page
4. WHEN on the last step, THE Interactive_Wizard SHALL display a "Finalizar Compra →" button
5. THE Interactive_Wizard SHALL support keyboard navigation (Enter to proceed, Escape to go back)
6. WHEN the user clicks a completed step in the Progress_Indicator, THE Interactive_Wizard SHALL navigate to that step

### Requirement 8: Preservação de Dados e Auto-Save

**User Story:** As a user, I want my progress to be automatically saved, so that I don't lose my work if I accidentally close the browser.

#### Acceptance Criteria

1. THE Auto_Save_System SHALL save form data to sessionStorage after each field change
2. THE Auto_Save_System SHALL debounce saves with a 2000ms delay to avoid excessive writes
3. WHEN the user returns to the editor, THE Auto_Save_System SHALL restore the saved state
4. THE Auto_Save_System SHALL display a visual indicator when saving is in progress
5. THE Auto_Save_System SHALL display the last saved timestamp
6. WHEN the user completes the purchase, THE Auto_Save_System SHALL clear the saved draft

### Requirement 9: Responsividade Mobile

**User Story:** As a mobile user, I want the fullscreen wizard to work well on my device, so that I can create my gift on any screen size.

#### Acceptance Criteria

1. THE Interactive_Wizard SHALL use min-h-[100dvh] to account for mobile browser chrome
2. THE Interactive_Wizard SHALL use responsive padding (px-4 on mobile, larger on desktop)
3. THE Interactive_Wizard SHALL ensure all touch targets are at least 44x44 pixels
4. THE Interactive_Wizard SHALL use responsive font sizes (text-3xl on mobile, text-4xl on desktop for titles)
5. WHEN on mobile, THE Interactive_Wizard SHALL stack form elements vertically
6. THE Interactive_Wizard SHALL support touch gestures for navigation (swipe left/right)

### Requirement 10: Compatibilidade com Backend Existente

**User Story:** As a developer, I want the new wizard to use the existing API endpoints, so that no backend changes are required.

#### Acceptance Criteria

1. THE 12_Cartas_Editor SHALL continue using the existing /api/card-collections/* endpoints
2. THE 12_Cartas_Editor SHALL continue using the existing /api/cards/* endpoints
3. THE Mensagem_Digital_Editor SHALL continue using the existing /api/messages/* endpoints
4. THE Interactive_Wizard SHALL not modify the data structure sent to the backend
5. THE Interactive_Wizard SHALL preserve all existing checkout flows (/api/checkout/*)
6. IF an API error occurs, THEN THE Interactive_Wizard SHALL display the error message to the user
