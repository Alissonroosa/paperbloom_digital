/**
 * Script de teste para verificar o contraste automático
 * Execute com: node testar-contraste.js
 */

// Funções copiadas de theme-utils.ts para teste

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function getLuminance(hex) {
  const rgb = hexToRgb(hex);
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrast(color1, color2) {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Testes
console.log('=== TESTE DE CONTRASTE AUTOMÁTICO ===\n');

const testCases = [
  { bg: '#FEF3C7', text: '#1F2937', name: 'Amarelo Claro + Texto Escuro' },
  { bg: '#FFE4E1', text: '#1F2937', name: 'Rosa Suave + Texto Escuro' },
  { bg: '#1A1A1A', text: '#FFFFFF', name: 'Preto + Texto Branco' },
  { bg: '#E0F2FE', text: '#1F2937', name: 'Azul Céu + Texto Escuro' },
  { bg: '#D1FAE5', text: '#1F2937', name: 'Verde Menta + Texto Escuro' },
  { bg: '#E9D5FF', text: '#1F2937', name: 'Lavanda + Texto Escuro' },
];

testCases.forEach(test => {
  const contrast = getContrast(test.bg, test.text);
  const status = contrast >= 4.5 ? '✅ PASS' : '❌ FAIL';
  const level = contrast >= 7 ? 'AAA' : contrast >= 4.5 ? 'AA' : 'FAIL';
  
  console.log(`${status} ${test.name}`);
  console.log(`   Fundo: ${test.bg}`);
  console.log(`   Texto: ${test.text}`);
  console.log(`   Contraste: ${contrast.toFixed(2)}:1 (${level})`);
  console.log('');
});

console.log('=== PADRÕES WCAG 2.0 ===');
console.log('Level AA: 4.5:1 (texto normal)');
console.log('Level AAA: 7:1 (texto normal)');
console.log('\n✅ Todos os testes devem passar Level AA (4.5:1)');
