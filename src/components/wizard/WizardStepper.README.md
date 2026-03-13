# WizardStepper Component

## Overview

The `WizardStepper` component is a visual navigation component that displays progress through a multi-step wizard interface. It shows all steps, indicates the current step, displays completed steps, and allows navigation between accessible steps.

## Features

- **Visual Progress Indicator**: Shows all 7 steps with clear visual distinction between active, completed, and pending states
- **Interactive Navigation**: Click on completed or current steps to navigate
- **Progress Bar**: Visual progress bar showing completion percentage
- **Responsive Design**: 
  - Desktop: Horizontal stepper with connector lines
  - Mobile: Vertical compact stepper with cards
- **Accessibility**: Full ARIA labels, keyboard navigation support, and screen reader compatibility
- **Customizable**: Supports custom step labels

## Usage

### Basic Usage

```tsx
import { WizardStepper } from '@/components/wizard';

function MyWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  return (
    <WizardStepper
      currentStep={currentStep}
      totalSteps={7}
      completedSteps={completedSteps}
      onStepClick={setCurrentStep}
    />
  );
}
```

### With Wizard Context

```tsx
import { WizardStepper } from '@/components/wizard';
import { useWizard } from '@/contexts/WizardContext';

function MyWizard() {
  const { currentStep, completedSteps, setStep } = useWizard();

  return (
    <WizardStepper
      currentStep={currentStep}
      totalSteps={7}
      completedSteps={completedSteps}
      onStepClick={setStep}
    />
  );
}
```

### Custom Step Labels

```tsx
<WizardStepper
  currentStep={currentStep}
  totalSteps={7}
  completedSteps={completedSteps}
  onStepClick={setStep}
  stepLabels={['Start', 'Details', 'Photos', 'Theme', 'Music', 'Contact', 'Review']}
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `currentStep` | `number` | Yes | - | The current active step (1-7) |
| `totalSteps` | `number` | Yes | - | Total number of steps in the wizard |
| `completedSteps` | `Set<number>` | Yes | - | Set of step numbers that have been completed |
| `onStepClick` | `(step: number) => void` | Yes | - | Callback when a step is clicked |
| `stepLabels` | `string[]` | No | `STEP_LABELS` | Custom labels for each step |

## Step States

The component displays three distinct states for each step:

### 1. Active (Current Step)
- Indigo background with white text
- Ring highlight effect
- "Atual" badge on mobile
- Always clickable

### 2. Completed
- Indigo background with check icon
- Clickable for navigation
- Contributes to progress bar

### 3. Pending
- Gray background with step number
- Not clickable
- Disabled state

## Navigation Rules

The stepper implements smart navigation rules:

1. **Can navigate to**: Current step, any completed step, or any previous step
2. **Cannot navigate to**: Future steps that haven't been reached yet
3. **Visual feedback**: Hover effects on clickable steps, disabled cursor on pending steps

## Responsive Behavior

### Desktop (≥768px)
- Horizontal layout with connector lines
- Steps displayed in a row
- Progress bar below stepper
- Hover effects on clickable steps

### Mobile (<768px)
- Vertical layout with cards
- Each step as a full-width button
- Current step highlighted with border
- Progress text showing "Etapa X de Y"

## Accessibility

The component follows WCAG 2.1 AA guidelines:

- **ARIA Labels**: Each step has descriptive labels including state (Concluído/Atual/Pendente)
- **ARIA Current**: Current step marked with `aria-current="step"`
- **Progress Bar**: Proper `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Focus Indicators**: Clear focus rings on all buttons
- **Touch Targets**: Minimum 44x44px touch targets on mobile

## Styling

The component uses Tailwind CSS classes and follows the design system:

- **Primary Color**: Indigo (indigo-600)
- **Completed State**: Indigo with check icon
- **Active State**: Indigo with ring highlight
- **Pending State**: Gray
- **Transitions**: Smooth color and size transitions (200-500ms)

## Testing

The component includes comprehensive tests covering:

- Rendering all step labels
- Highlighting current step
- Showing completed steps with check icons
- Click navigation for accessible steps
- Preventing navigation to pending steps
- Progress bar accuracy
- Custom step labels
- Mobile and desktop rendering
- Accessibility labels

Run tests with:
```bash
npm test -- src/components/wizard/__tests__/WizardStepper.test.tsx
```

## Demo

View the interactive demo at:
```
/editor/test-wizard-stepper
```

## Requirements Satisfied

This component satisfies the following requirements from the design document:

- **Requirement 1.3**: Display a visual stepper showing all steps and current progress
- **Requirement 1.4**: Allow users to navigate back to previous steps to edit information

## Related Components

- `WizardContext`: Provides wizard state management
- `useWizardState`: Hook for wizard state and actions
- Step components (Step1-Step7): Individual step content components

## Future Enhancements

Potential improvements for future iterations:

- Step validation indicators
- Optional step markers
- Custom icons per step
- Animated transitions between steps
- Vertical stepper option for desktop
- Step descriptions/subtitles
