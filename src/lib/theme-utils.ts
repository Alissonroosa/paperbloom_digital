/**
 * Theme Utilities
 * Funções para manipular cores e criar temas derivados
 */

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

/**
 * Converte HEX para RGB
 */
export function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

/**
 * Converte RGB para HEX
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Converte RGB para HSL
 */
export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Converte HSL para RGB
 */
export function hslToRgb(h: number, s: number, l: number): RGB {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Calcula luminância relativa (WCAG 2.0)
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calcula o contraste entre duas cores (WCAG 2.0)
 */
export function getContrast(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Verifica se uma cor é escura
 */
export function isDark(hex: string): boolean {
  return getLuminance(hex) < 0.5;
}

/**
 * Garante contraste mínimo ajustando a cor do texto
 */
export function ensureContrast(
  backgroundColor: string,
  textColor: string,
  minContrast: number = 4.5
): string {
  let contrast = getContrast(backgroundColor, textColor);
  
  if (contrast >= minContrast) {
    return textColor;
  }

  // Se o contraste é insuficiente, ajusta o brilho do texto
  const bgIsDark = isDark(backgroundColor);
  let adjustedColor = textColor;
  let attempts = 0;
  const maxAttempts = 20;

  while (contrast < minContrast && attempts < maxAttempts) {
    if (bgIsDark) {
      // Fundo escuro: clarear o texto
      adjustedColor = adjustBrightness(adjustedColor, 5);
    } else {
      // Fundo claro: escurecer o texto
      adjustedColor = adjustBrightness(adjustedColor, -5);
    }
    contrast = getContrast(backgroundColor, adjustedColor);
    attempts++;
  }

  // Se ainda não conseguiu contraste suficiente, usa branco ou preto
  if (contrast < minContrast) {
    return bgIsDark ? '#FFFFFF' : '#000000';
  }

  return adjustedColor;
}

/**
 * Ajusta o brilho de uma cor
 */
export function adjustBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.l = Math.max(0, Math.min(100, hsl.l + percent));
  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Ajusta a saturação de uma cor
 */
export function adjustSaturation(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.s = Math.max(0, Math.min(100, hsl.s + percent));
  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Gera cor complementar
 */
export function getComplementary(hex: string): string {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.h = (hsl.h + 180) % 360;
  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Aplica tema à cor base
 */
export function applyTheme(
  baseColor: string,
  theme: 'gradient' | 'bright' | 'matte' | 'pastel' | 'neon' | 'vintage'
): {
  background: string;
  backgroundGradient?: string;
  textColor: string;
  secondaryTextColor: string;
  accentColor: string;
  brandingColor: string;
} {
  const rgb = hexToRgb(baseColor);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  switch (theme) {
    case 'gradient': {
      // Gradiente suave da cor
      const color1 = baseColor;
      const color2 = adjustBrightness(baseColor, -15);
      const color3 = adjustBrightness(baseColor, -25);
      const isColorDark = isDark(baseColor);

      const primaryText = isColorDark ? '#FFFFFF' : '#1F2937';
      const secondaryText = isColorDark ? '#E5E7EB' : '#4B5563';
      const branding = isColorDark ? '#FFFFFF' : '#000000';

      return {
        background: baseColor,
        backgroundGradient: `linear-gradient(135deg, ${color1} 0%, ${color2} 50%, ${color3} 100%)`,
        textColor: ensureContrast(baseColor, primaryText, 4.5),
        secondaryTextColor: ensureContrast(baseColor, secondaryText, 4.5),
        accentColor: adjustSaturation(adjustBrightness(baseColor, isColorDark ? 20 : -20), 20),
        brandingColor: ensureContrast(baseColor, branding, 4.5),
      };
    }

    case 'bright': {
      // Cor vibrante com brilho
      const brightColor = adjustSaturation(adjustBrightness(baseColor, 10), 20);
      const isColorDark = isDark(brightColor);

      const primaryText = isColorDark ? '#FFFFFF' : '#111827';
      const secondaryText = isColorDark ? '#F3F4F6' : '#374151';
      const branding = isColorDark ? '#FFFFFF' : '#000000';

      return {
        background: brightColor,
        textColor: ensureContrast(brightColor, primaryText, 4.5),
        secondaryTextColor: ensureContrast(brightColor, secondaryText, 4.5),
        accentColor: adjustBrightness(brightColor, isColorDark ? 30 : -30),
        brandingColor: ensureContrast(brightColor, branding, 4.5),
      };
    }

    case 'matte': {
      // Acabamento fosco
      const matteColor = adjustSaturation(baseColor, -30);
      const isColorDark = isDark(matteColor);

      const primaryText = isColorDark ? '#F9FAFB' : '#111827';
      const secondaryText = isColorDark ? '#D1D5DB' : '#4B5563';
      const branding = isColorDark ? '#FFFFFF' : '#000000';

      return {
        background: matteColor,
        textColor: ensureContrast(matteColor, primaryText, 4.5),
        secondaryTextColor: ensureContrast(matteColor, secondaryText, 4.5),
        accentColor: adjustSaturation(baseColor, 10),
        brandingColor: ensureContrast(matteColor, branding, 4.5),
      };
    }

    case 'pastel': {
      // Tom pastel suave
      const pastelHsl = { ...hsl, s: Math.min(hsl.s, 40), l: Math.max(hsl.l, 75) };
      const pastelRgb = hslToRgb(pastelHsl.h, pastelHsl.s, pastelHsl.l);
      const pastelColor = rgbToHex(pastelRgb.r, pastelRgb.g, pastelRgb.b);

      const primaryText = '#1F2937';
      const secondaryText = '#4B5563';
      const branding = '#000000';

      return {
        background: pastelColor,
        textColor: ensureContrast(pastelColor, primaryText, 4.5),
        secondaryTextColor: ensureContrast(pastelColor, secondaryText, 4.5),
        accentColor: adjustSaturation(adjustBrightness(pastelColor, -30), 30),
        brandingColor: ensureContrast(pastelColor, branding, 4.5),
      };
    }

    case 'neon': {
      // Cores vibrantes e modernas
      const neonHsl = { ...hsl, s: Math.max(hsl.s, 80), l: Math.min(Math.max(hsl.l, 45), 65) };
      const neonRgb = hslToRgb(neonHsl.h, neonHsl.s, neonHsl.l);
      const neonColor = rgbToHex(neonRgb.r, neonRgb.g, neonRgb.b);
      const isColorDark = isDark(neonColor);

      const primaryText = isColorDark ? '#FFFFFF' : '#111827';
      const secondaryText = isColorDark ? '#F3F4F6' : '#1F2937';
      const branding = isColorDark ? '#FFFFFF' : '#000000';

      return {
        background: neonColor,
        backgroundGradient: `linear-gradient(135deg, ${neonColor} 0%, ${adjustBrightness(neonColor, -20)} 100%)`,
        textColor: ensureContrast(neonColor, primaryText, 4.5),
        secondaryTextColor: ensureContrast(neonColor, secondaryText, 4.5),
        accentColor: getComplementary(neonColor),
        brandingColor: ensureContrast(neonColor, branding, 4.5),
      };
    }

    case 'vintage': {
      // Tom retrô e nostálgico
      const vintageHsl = { ...hsl, s: Math.max(hsl.s - 20, 20), l: Math.min(Math.max(hsl.l, 40), 60) };
      const vintageRgb = hslToRgb(vintageHsl.h, vintageHsl.s, vintageHsl.l);
      const vintageColor = rgbToHex(vintageRgb.r, vintageRgb.g, vintageRgb.b);
      const isColorDark = isDark(vintageColor);

      const primaryText = isColorDark ? '#FEF3C7' : '#78350F';
      const secondaryText = isColorDark ? '#FDE68A' : '#92400E';
      const branding = isColorDark ? '#FFFFFF' : '#000000';

      return {
        background: vintageColor,
        textColor: ensureContrast(vintageColor, primaryText, 4.5),
        secondaryTextColor: ensureContrast(vintageColor, secondaryText, 4.5),
        accentColor: adjustBrightness(vintageColor, isColorDark ? 25 : -25),
        brandingColor: ensureContrast(vintageColor, branding, 4.5),
      };
    }

    default: {
      const isColorDark = isDark(baseColor);
      const primaryText = isColorDark ? '#FFFFFF' : '#1F2937';
      const secondaryText = isColorDark ? '#E5E7EB' : '#4B5563';
      const branding = isColorDark ? '#FFFFFF' : '#000000';

      return {
        background: baseColor,
        textColor: ensureContrast(baseColor, primaryText, 4.5),
        secondaryTextColor: ensureContrast(baseColor, secondaryText, 4.5),
        accentColor: baseColor,
        brandingColor: ensureContrast(baseColor, branding, 4.5),
      };
    }
  }
}
