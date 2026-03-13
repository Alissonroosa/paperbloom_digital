# Wizard Context

This directory contains the React Context implementation for the multi-step wizard.

## WizardContext

The `WizardContext` provides a centralized state management solution for the multi-step wizard interface. It wraps the `useWizardState` hook and makes the wizard state and actions available to all child components.

### Usage

```tsx
import { WizardProvider, useWizard } from '@/contexts/WizardContext';

// Wrap your wizard components with the provider
function App() {
  return (
    <WizardProvider>
      <WizardEditor />
    </WizardProvider>
  );
}

// Access wizard state and actions in child components
function WizardStep() {
  const { currentStep, data, updateField, nextStep } = useWizard();
  
  return (
    <div>
      <h2>Step {currentStep}</h2>
      <input
        value={data.pageTitle}
        onChange={(e) => updateField('pageTitle', e.target.value)}
      />
      <button onClick={nextStep}>Next</button>
    </div>
  );
}
```

### Available Hooks

- `useWizard()` - Access complete wizard state and actions
- `useWizardData()` - Access only wizard data (read-only)
- `useWizardActions()` - Access only wizard actions
- `useWizardStep()` - Access current step information

### State Structure

The wizard context provides:

- **State**: Current step, form data, upload states, UI state, validation, completed steps
- **Actions**: Navigation, field updates, validation, state management

See `src/types/wizard.ts` for complete type definitions.
