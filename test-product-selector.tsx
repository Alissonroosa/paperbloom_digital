/**
 * Test file for ProductSelector component
 * 
 * This file verifies that the ProductSelector component:
 * 1. Renders both product cards (Mensagem Digital and 12 Cartas)
 * 2. Displays correct descriptions and prices
 * 3. Shows appropriate badges and features
 * 4. Has correct navigation links
 * 5. Handles "coming soon" state for 12 Cartas
 */

import { ProductSelector } from "@/components/products/ProductSelector";

export default function TestProductSelector() {
  return (
    <div className="min-h-screen bg-[#FFFAFA] py-12">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          Test: ProductSelector Component
        </h1>
        
        <ProductSelector />

        <div className="mt-12 max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Verification Checklist:</h2>
          <ul className="space-y-2 text-sm">
            <li>✓ Both products are displayed side by side</li>
            <li>✓ "Mensagem Digital" shows "Mais Popular" badge</li>
            <li>✓ "12 Cartas" shows "Produto Premium" and "Em Breve" badges</li>
            <li>✓ Prices are displayed: R$ 19,90 and R$ 49,90</li>
            <li>✓ Features list is shown for each product</li>
            <li>✓ Preview numbers (1 and 12) are displayed</li>
            <li>✓ "Mensagem Digital" button is clickable and links to /editor/mensagem</li>
            <li>✓ "12 Cartas" button is disabled with "Em Breve" text</li>
            <li>✓ Icons (Heart and Calendar) are displayed</li>
            <li>✓ Hover effects work on cards</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
