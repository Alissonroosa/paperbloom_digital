/**
 * Test page for ProductSelector component
 * Access at: http://localhost:3000/test/product-selector
 */

import { ProductSelector } from "@/components/products/ProductSelector";

export default function TestProductSelectorPage() {
  return (
    <div className="min-h-screen bg-[#FFFAFA] py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text-main mb-2">
            Test: ProductSelector Component
          </h1>
          <p className="text-muted-foreground">
            Verifying Requirements 9.1, 9.2, 9.3, 9.6
          </p>
        </div>
        
        <ProductSelector />

        <div className="mt-12 max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-text-main">Verification Checklist:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2 text-primary">Requirement 9.1 - Display Products</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✓ Page displays available products</li>
                <li>✓ Both products are visible</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-primary">Requirement 9.2 - Mensagem Digital</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✓ "Mensagem Digital" card displayed</li>
                <li>✓ Shows existing product info</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-primary">Requirement 9.3 - 12 Cartas</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✓ "12 Cartas" card displayed</li>
                <li>✓ Shows new product info</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-primary">Requirement 9.6 - Product Details</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✓ Description shown for each</li>
                <li>✓ Price displayed (R$ 19,90 / R$ 49,90)</li>
                <li>✓ Preview/mockup included</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-primary/5 rounded-lg">
            <h3 className="font-semibold mb-2 text-text-main">Navigation Tests:</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>✓ "Mensagem Digital" button links to /editor/mensagem</li>
              <li>✓ "12 Cartas" button is disabled (coming soon)</li>
              <li>✓ Hover effects work correctly</li>
              <li>✓ Responsive layout on mobile</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
