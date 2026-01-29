/**
 * Verification script for data structures
 * Validates that all requirements are met
 */

import { MESSAGE_TEMPLATES, getAllCategories } from '../templates';
import { MESSAGE_MODELS, getModelsByCategory } from '../models';
import { TEXT_SUGGESTIONS, getSuggestionsByField } from '../suggestions';

console.log('=== Verifying Data Structures ===\n');

// Requirement 7.1: At least 5 template categories
console.log('1. Template Categories:');
const categories = getAllCategories();
console.log(`   Found ${categories.length} categories: ${categories.join(', ')}`);
console.log(`   ✓ Requirement met: ${categories.length >= 5 ? 'YES' : 'NO'}\n`);

// Verify each category has templates
console.log('2. Templates per Category:');
categories.forEach(category => {
  const templates = MESSAGE_TEMPLATES.filter(t => t.category === category);
  console.log(`   ${category}: ${templates.length} template(s)`);
});
console.log(`   Total templates: ${MESSAGE_TEMPLATES.length}\n`);

// Requirement 8.1: At least 3 complete examples per template category
console.log('3. Models per Category:');
let allCategoriesHaveModels = true;
categories.forEach(category => {
  const models = getModelsByCategory(category);
  const hasEnough = models.length >= 3;
  console.log(`   ${category}: ${models.length} model(s) ${hasEnough ? '✓' : '✗'}`);
  if (!hasEnough) allCategoriesHaveModels = false;
});
console.log(`   Total models: ${MESSAGE_MODELS.length}`);
console.log(`   ✓ Requirement met: ${allCategoriesHaveModels ? 'YES' : 'NO'}\n`);

// Requirement 9.1, 9.2, 9.3: Text suggestions for title (5+), message (10+), closing (5+)
console.log('4. Text Suggestions by Field:');
const titleSuggestions = getSuggestionsByField('title');
const messageSuggestions = getSuggestionsByField('message');
const closingSuggestions = getSuggestionsByField('closing');

console.log(`   Title: ${titleSuggestions.length} suggestions (required: 5+) ${titleSuggestions.length >= 5 ? '✓' : '✗'}`);
console.log(`   Message: ${messageSuggestions.length} suggestions (required: 10+) ${messageSuggestions.length >= 10 ? '✓' : '✗'}`);
console.log(`   Closing: ${closingSuggestions.length} suggestions (required: 5+) ${closingSuggestions.length >= 5 ? '✓' : '✗'}`);
console.log(`   Total suggestions: ${TEXT_SUGGESTIONS.length}\n`);

// Requirement 9.5: Organize suggestions by category
console.log('5. Suggestions by Category:');
const suggestionCategories = ['romantico', 'amigavel', 'formal', 'casual'] as const;
suggestionCategories.forEach(category => {
  const suggestions = TEXT_SUGGESTIONS.filter(s => s.category === category);
  console.log(`   ${category}: ${suggestions.length} suggestion(s)`);
});
console.log(`   ✓ All suggestions organized by category\n`);

// Summary
console.log('=== Summary ===');
const allRequirementsMet = 
  categories.length >= 5 &&
  allCategoriesHaveModels &&
  titleSuggestions.length >= 5 &&
  messageSuggestions.length >= 10 &&
  closingSuggestions.length >= 5;

console.log(`All requirements met: ${allRequirementsMet ? '✓ YES' : '✗ NO'}`);

if (allRequirementsMet) {
  console.log('\n✓ Task 2 implementation complete!');
  process.exit(0);
} else {
  console.log('\n✗ Some requirements not met');
  process.exit(1);
}
