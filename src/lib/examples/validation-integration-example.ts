/**
 * Example: Integrating Validation with EditorForm
 * 
 * This example demonstrates how to integrate the validation logic
 * with the EditorForm component for both real-time and submit validation.
 */

import { validateEditorForm, validateField, type EditorFormData } from '../validation';

// Example 1: Form submission validation
// Use this before proceeding to payment
export function handleFormSubmit(formData: EditorFormData) {
  const result = validateEditorForm(formData);
  
  if (!result.isValid) {
    // Display all errors to the user
    console.log('Form validation failed:', result.errors);
    
    // Example: Set errors in React state
    // setErrors(result.errors);
    
    // Prevent navigation to payment
    return false;
  }
  
  // Form is valid, proceed to payment
  console.log('Form is valid, proceeding to payment');
  return true;
}

// Example 2: Real-time field validation
// Use this on field blur or change events
export function handleFieldValidation(
  fieldName: keyof EditorFormData,
  value: any,
  formData: EditorFormData
) {
  const error = validateField(fieldName, value, formData);
  
  if (error) {
    // Display error for this specific field
    console.log(`${fieldName} error:`, error);
    
    // Example: Set field error in React state
    // setFieldError(fieldName, error);
    
    return error;
  }
  
  // Clear any existing error for this field
  // clearFieldError(fieldName);
  
  return null;
}

// Example 3: React component integration
export const EditorFormWithValidation = () => {
  // This is pseudocode showing how to integrate with React
  
  /*
  const [formData, setFormData] = useState<EditorFormData>({
    image: null,
    galleryImages: [null, null, null, null, null, null, null],
    message: '',
    from: '',
    to: '',
    youtubeLink: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Handle field change with validation
  const handleFieldChange = (field: keyof EditorFormData, value: any) => {
    // Update form data
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Validate the field
    const error = validateField(field, value, newFormData);
    
    // Update errors
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    // Validate entire form
    const result = validateEditorForm(formData);
    
    if (!result.isValid) {
      // Show all errors
      setErrors(result.errors);
      
      // Optionally scroll to first error
      const firstErrorField = Object.keys(result.errors)[0];
      document.getElementById(firstErrorField)?.scrollIntoView({ behavior: 'smooth' });
      
      return;
    }
    
    // Clear errors and proceed to payment
    setErrors({});
    await proceedToPayment(formData);
  };
  
  return (
    <EditorForm
      data={formData}
      onChange={handleFieldChange}
      errors={errors}
      onSubmit={handleSubmit}
    />
  );
  */
};

// Example 4: API route validation
// Use this in /api/messages/create to validate server-side
export function validateMessageCreation(requestBody: any) {
  // Convert request body to EditorFormData format
  const formData: EditorFormData = {
    title: requestBody.title,
    specialDate: requestBody.specialDate ? new Date(requestBody.specialDate) : null,
    image: null, // Images are already uploaded at this point
    galleryImages: [],
    message: requestBody.messageText,
    signature: requestBody.signature,
    closing: requestBody.closingMessage,
    from: requestBody.senderName,
    to: requestBody.recipientName,
    youtubeLink: requestBody.youtubeUrl || '',
  };
  
  const result = validateEditorForm(formData);
  
  if (!result.isValid) {
    // Return 400 Bad Request with validation errors
    return {
      success: false,
      errors: result.errors,
      message: 'Validation failed',
    };
  }
  
  return {
    success: true,
    data: formData,
  };
}

// Example 5: Character counter component helper
export function getCharacterCount(value: string | undefined, limit: number) {
  const current = value?.length || 0;
  const remaining = limit - current;
  const percentage = (current / limit) * 100;
  
  return {
    current,
    limit,
    remaining,
    percentage,
    isNearLimit: percentage >= 80,
    isOverLimit: percentage > 100,
  };
}

// Example usage of character counter
export function CharacterCounterExample() {
  /*
  const titleCount = getCharacterCount(formData.title, CHARACTER_LIMITS.title);
  
  return (
    <div className="flex justify-between text-xs">
      <span className={titleCount.isOverLimit ? 'text-red-600' : 'text-muted-foreground'}>
        {titleCount.current}/{titleCount.limit}
      </span>
      {titleCount.isNearLimit && !titleCount.isOverLimit && (
        <span className="text-amber-600">
          {titleCount.remaining} caracteres restantes
        </span>
      )}
    </div>
  );
  */
}
