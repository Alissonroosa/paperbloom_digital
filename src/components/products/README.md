# ProductSelector Component

## Overview

The `ProductSelector` component displays available products on the Paper Bloom platform, allowing users to choose between different product offerings. Currently supports two products:
1. **Mensagem Digital** - Single personalized message (existing product)
2. **12 Cartas** - 12 unique messages journey (new product)

## Requirements Validation

This component satisfies the following requirements from the spec:

- **Requirement 9.1**: Displays a page with available products
- **Requirement 9.2**: Shows the existing "Mensagem Digital" product
- **Requirement 9.3**: Shows the new "12 Cartas" product
- **Requirement 9.6**: Displays description, price, and preview for each product

## Features

### Product Cards
- Side-by-side layout on desktop, stacked on mobile
- Animated entrance with staggered timing
- Hover effects with shadow and border transitions
- Badge system for highlighting (e.g., "Mais Popular", "Produto Premium")
- "Coming Soon" badge for unreleased products

### Product Information
Each product card displays:
- **Icon**: Visual identifier (Heart for messages, Calendar for 12 cards)
- **Title**: Product name
- **Description**: Brief explanation of the product
- **Features**: Bulleted list of key features
- **Price**: Clear pricing with "pagamento único" label
- **Preview**: Visual representation with number and subtitle
- **CTA Button**: Call-to-action with navigation or disabled state

### Navigation
- **Mensagem Digital**: Links to `/editor/mensagem`
- **12 Cartas**: Currently disabled with "Em Breve" state, will link to `/editor/12-cartas`

## Usage

```tsx
import { ProductSelector } from "@/components/products/ProductSelector";

export default function ProductsPage() {
  return (
    <div>
      <ProductSelector />
    </div>
  );
}
```

## Product Configuration

Products are defined in the component with the following structure:

```typescript
interface Product {
  id: string;                    // Unique identifier
  title: string;                 // Display name
  description: string;           // Product description
  price: string;                 // Formatted price
  badge?: string;                // Optional badge text
  badgeVariant?: "default" | "secondary";
  icon: React.ComponentType;     // Lucide icon component
  features: string[];            // List of features
  href: string;                  // Navigation URL
  buttonText: string;            // CTA button text
  comingSoon?: boolean;          // Disable if not yet available
  preview: {
    number: string;              // Large display number
    subtitle: string;            // Preview subtitle
    bgClass: string;             // Tailwind background class
  };
}
```

## Styling

The component uses:
- **Tailwind CSS**: For all styling
- **Framer Motion**: For entrance animations
- **Lucide Icons**: For visual elements
- **Custom UI Components**: Card, Button, Badge from `@/components/ui`

### Color Scheme
- Primary color for accents and CTAs
- Gradient backgrounds for preview sections
- Muted foreground for secondary text
- Border transitions on hover

## Accessibility

- Semantic HTML structure with proper heading hierarchy
- Keyboard navigation support through Link and Button components
- Disabled state properly communicated for "coming soon" products
- Icon labels for screen readers

## Testing

Test page available at: `/test/product-selector`

The test page verifies:
1. Both products render correctly
2. Badges display appropriately
3. Prices are shown correctly
4. Features lists are complete
5. Navigation works for available products
6. Disabled state works for unreleased products
7. Responsive layout functions properly
8. Hover effects are smooth

## Future Enhancements

When the "12 Cartas" product is ready:
1. Remove `comingSoon: true` from the product configuration
2. The button will automatically become active
3. Navigation to `/editor/12-cartas` will work

## Related Components

- `ProductCarousel` - Alternative carousel-style product display
- `Card`, `Button`, `Badge` - UI primitives used in this component
- Editor pages - Destination pages for product selection

## File Location

```
src/
  components/
    products/
      ProductSelector.tsx    # Main component
      README.md             # This file
```
