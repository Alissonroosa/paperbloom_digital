'use client';

import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { useWizard } from '@/contexts/WizardContext';
import { BACKGROUND_COLORS, THEME_OPTIONS } from '@/types/wizard';
import { validateContrast } from '@/lib/wizard-utils';
import { Check, AlertTriangle, Palette } from 'lucide-react';
import { 
  adjustBrightness, 
  adjustSaturation, 
  isDark,
  hexToRgb,
  rgbToHsl,
  hslToRgb,
  rgbToHex
} from '@/lib/theme-utils';

/**
 * Step 5: Theme Customization Component
 * Allows users to customize the visual theme of their message
 * Features:
 * - 8 predefined background color options
 * - Custom color picker
 * - Theme selector (Gradient, Bright, Matte, Pastel, Neon, Vintage)
 * - Contrast validation with warnings
 * - Real-time preview updates
 */
export function Step5ThemeCustomization() {
  const { data, updateField } = useWizard();
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [contrastWarning, setContrastWarning] = useState<string | null>(null);

  // Helper functions for theme previews
  const getPreviewTextColor = (bgColor: string) => {
    return isDark(bgColor) ? '#FFFFFF' : '#1F2937';
  };

  const toPastel = (color: string) => {
    const rgb = hexToRgb(color);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const pastelHsl = { h: hsl.h, s: Math.min(hsl.s, 40), l: Math.max(hsl.l, 75) };
    const pastelRgb = hslToRgb(pastelHsl.h, pastelHsl.s, pastelHsl.l);
    return rgbToHex(pastelRgb.r, pastelRgb.g, pastelRgb.b);
  };

  const toNeon = (color: string) => {
    const rgb = hexToRgb(color);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const neonHsl = { h: hsl.h, s: Math.max(hsl.s, 80), l: Math.min(Math.max(hsl.l, 45), 65) };
    const neonRgb = hslToRgb(neonHsl.h, neonHsl.s, neonHsl.l);
    return rgbToHex(neonRgb.r, neonRgb.g, neonRgb.b);
  };

  const toVintage = (color: string) => {
    const rgb = hexToRgb(color);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const vintageHsl = { h: hsl.h, s: Math.max(hsl.s - 20, 20), l: Math.min(Math.max(hsl.l, 40), 60) };
    const vintageRgb = hslToRgb(vintageHsl.h, vintageHsl.s, vintageHsl.l);
    return rgbToHex(vintageRgb.r, vintageRgb.g, vintageRgb.b);
  };

  // Validate contrast whenever background color or theme changes
  useEffect(() => {
    const result = validateContrast(data.backgroundColor, data.theme);
    setContrastWarning(result.isValid ? null : result.warning || null);
  }, [data.backgroundColor, data.theme]);

  // Handle predefined color selection
  const handleColorSelect = (color: string) => {
    updateField('backgroundColor', color);
    updateField('customColor', null);
    setShowCustomPicker(false);
  };

  // Handle custom color selection
  const handleCustomColorChange = (color: string) => {
    updateField('backgroundColor', color);
    updateField('customColor', color);
  };

  // Handle theme selection
  const handleThemeSelect = (theme: 'gradient' | 'bright' | 'matte' | 'pastel' | 'neon' | 'vintage') => {
    updateField('theme', theme);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Personalização do Tema
        </h2>
        <p className="text-gray-600">
          Escolha as cores e o tema visual da sua mensagem.
        </p>
      </div>

      {/* Background Color Selection */}
      <div className="space-y-3">
        <Label>Cor de Fundo</Label>
        <div className="grid grid-cols-4 gap-3">
          {BACKGROUND_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => handleColorSelect(color.value)}
              className={`
                relative h-16 rounded-lg border-2 transition-all
                hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                ${data.backgroundColor === color.value && !data.customColor
                  ? 'border-primary ring-2 ring-primary'
                  : 'border-gray-300'
                }
              `}
              style={{ backgroundColor: color.value }}
              aria-label={`Selecionar cor ${color.name}`}
              aria-pressed={data.backgroundColor === color.value && !data.customColor}
            >
              {data.backgroundColor === color.value && !data.customColor && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white rounded-full p-1 shadow-md">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                </div>
              )}
              <span className="sr-only">{color.name}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-gray-600">
          {BACKGROUND_COLORS.map((color) => (
            <span key={color.value} className="whitespace-nowrap">
              {color.name}
            </span>
          ))}
        </div>
      </div>

      {/* Custom Color Picker */}
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowCustomPicker(!showCustomPicker)}
          className="w-full flex items-center justify-center gap-2"
          aria-expanded={showCustomPicker}
          aria-controls="custom-color-picker"
        >
          <Palette className="w-4 h-4" />
          {showCustomPicker ? 'Ocultar' : 'Escolher'} Cor Personalizada
        </Button>
        
        {showCustomPicker && (
          <div id="custom-color-picker" className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Label htmlFor="customColor">Cor Personalizada</Label>
            <div className="flex gap-3 items-center">
              <input
                id="customColor"
                type="color"
                value={data.customColor || data.backgroundColor}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                className="h-12 w-20 rounded border border-gray-300 cursor-pointer"
                aria-label="Seletor de cor personalizada"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={data.customColor || data.backgroundColor}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                      handleCustomColorChange(value);
                    }
                  }}
                  placeholder="#FFFFFF"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Código hexadecimal da cor"
                />
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Digite um código hexadecimal ou use o seletor de cor.
            </p>
          </div>
        )}
      </div>

      {/* Theme Selection */}
      <div className="space-y-3">
        <Label>Estilo do Tema</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {THEME_OPTIONS.map((themeOption) => (
            <button
              key={themeOption.value}
              type="button"
              onClick={() => handleThemeSelect(themeOption.value)}
              className={`
                relative p-4 rounded-lg border-2 transition-all text-left
                hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                ${data.theme === themeOption.value
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 bg-white'
                }
              `}
              aria-label={`Selecionar tema ${themeOption.name}`}
              aria-pressed={data.theme === themeOption.value}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{themeOption.name}</h3>
                {data.theme === themeOption.value && (
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-gray-600">{themeOption.description}</p>
              
              {/* Visual preview of theme */}
              <div className="mt-3 h-12 rounded overflow-hidden">
                {themeOption.value === 'gradient' && (
                  <div 
                    className="h-full flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${data.backgroundColor} 0%, ${adjustBrightness(data.backgroundColor, -20)} 100%)`
                    }}
                  >
                    <span className="text-sm font-semibold" style={{ color: getPreviewTextColor(data.backgroundColor) }}>
                      Gradiente
                    </span>
                  </div>
                )}
                {themeOption.value === 'bright' && (
                  <div 
                    className="h-full flex items-center justify-center"
                    style={{ backgroundColor: adjustSaturation(adjustBrightness(data.backgroundColor, 10), 20) }}
                  >
                    <span className="text-sm font-semibold" style={{ color: getPreviewTextColor(data.backgroundColor) }}>
                      Brilhante
                    </span>
                  </div>
                )}
                {themeOption.value === 'matte' && (
                  <div 
                    className="h-full flex items-center justify-center"
                    style={{ backgroundColor: adjustSaturation(data.backgroundColor, -30) }}
                  >
                    <span className="text-sm font-semibold" style={{ color: getPreviewTextColor(data.backgroundColor) }}>
                      Fosco
                    </span>
                  </div>
                )}
                {themeOption.value === 'pastel' && (
                  <div 
                    className="h-full flex items-center justify-center"
                    style={{ backgroundColor: toPastel(data.backgroundColor) }}
                  >
                    <span className="text-sm font-semibold text-gray-800">
                      Pastel
                    </span>
                  </div>
                )}
                {themeOption.value === 'neon' && (
                  <div 
                    className="h-full flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${toNeon(data.backgroundColor)} 0%, ${adjustBrightness(toNeon(data.backgroundColor), -20)} 100%)`
                    }}
                  >
                    <span className="text-sm font-semibold" style={{ color: getPreviewTextColor(toNeon(data.backgroundColor)) }}>
                      Neon
                    </span>
                  </div>
                )}
                {themeOption.value === 'vintage' && (
                  <div 
                    className="h-full flex items-center justify-center"
                    style={{ backgroundColor: toVintage(data.backgroundColor) }}
                  >
                    <span className="text-sm font-semibold" style={{ color: getPreviewTextColor(toVintage(data.backgroundColor)) }}>
                      Vintage
                    </span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Contrast Warning */}
      {contrastWarning && (
        <div 
          className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex gap-3"
          role="alert"
          aria-live="polite"
        >
          <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-orange-900 mb-1">
              Aviso de Contraste
            </h3>
            <p className="text-sm text-orange-800">
              {contrastWarning}
            </p>
            <p className="text-sm text-orange-700 mt-2">
              Para melhor legibilidade, considere ajustar a cor de fundo ou o tema.
            </p>
          </div>
        </div>
      )}

      {/* Emoji Selection */}
      <div className="space-y-3">
        <Label>Emoji Animado (Opcional)</Label>
        <p className="text-sm text-gray-600 mb-3">
          Escolha um emoji que cairá suavemente pela página.
        </p>
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
          {['❤️', '💕', '💖', '💗', '💝', '💘', '🌹', '🌺', '🌸', '🌼', '🎉', '🎊', '🎈', '🎁', '⭐', '✨', '💫', '🌟', '🦋', '🕊️', '🎵', '🎶', '☀️', '🌙'].map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => updateField('customEmoji', data.customEmoji === emoji ? null : emoji)}
              className={`
                relative h-12 rounded-lg border-2 transition-all text-2xl
                hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                ${data.customEmoji === emoji
                  ? 'border-primary bg-primary/10 ring-2 ring-primary'
                  : 'border-gray-300 bg-white hover:border-gray-400'
                }
              `}
              aria-label={`Selecionar emoji ${emoji}`}
              aria-pressed={data.customEmoji === emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
        {data.customEmoji && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Emoji selecionado: {data.customEmoji}</span>
            <button
              type="button"
              onClick={() => updateField('customEmoji', null)}
              className="text-primary hover:text-primary/80 underline"
            >
              Remover
            </button>
          </div>
        )}
      </div>

      {/* Information Box */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          💡 Dica
        </h3>
        <p className="text-sm text-gray-700">
          Escolha cores que combinem com a ocasião e a personalidade do destinatário. 
          O tema "Gradiente" cria um efeito visual moderno e dinâmico. Os emojis animados adicionam um toque especial!
        </p>
      </div>

      {/* Preview Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Visualização:</strong> As mudanças de cor e tema são aplicadas 
          automaticamente na prévia ao lado. Experimente diferentes combinações!
        </p>
      </div>
    </div>
  );
}
