/**
 * Visual themes for the "Chá de Fralda" guest page.
 *
 * MVP note: themes are visual-only for now. The host cannot pick one yet —
 * the guest page uses a fixed theme (see THEME_DEFAULT) until the editor/DB
 * integration is consolidated. Each theme is a self-contained set of tokens so
 * the page can be re-skinned without touching its layout.
 *
 * IMPORTANT: colors are stored as hex and applied via inline `style`, NOT as
 * Tailwind classes — dynamically-built class strings are not detected by the
 * Tailwind JIT compiler and would be purged (leaving transparent backgrounds).
 */

import type { CSSProperties } from 'react';

export type BabyShowerThemeId = 'classic' | 'safari' | 'ursos' | 'princesa';

export interface BabyShowerTheme {
  id: BabyShowerThemeId;
  name: string;
  emoji: string;
  /** Big decorative emojis scattered in the hero. */
  decorations: string[];
  /** Page background gradient stops (applied inline). */
  pageBgFrom: string;
  pageBgVia: string;
  pageBgTo: string;
  /** Card surface + border (applied inline). */
  cardBg: string;
  cardBorder: string;
  /** Primary accent (buttons/selected states). */
  accent: string;
  accentSoft: string;
  accentText: string;
  /** Heading text color. */
  heading: string;
  /** Body text color. */
  body: string;
  /** Script/cursive accent line color. */
  script: string;
  /** Emoji used for the diaper option. */
  diaperEmoji: string;
  /** Emoji used for the mimo option. */
  mimoEmoji: string;
}

export const BABY_SHOWER_THEMES: Record<BabyShowerThemeId, BabyShowerTheme> = {
  classic: {
    id: 'classic',
    name: 'Clássico',
    emoji: '🍼',
    decorations: ['🍼', '🧸', '👶', '💕'],
    pageBgFrom: '#FDF2F4',
    pageBgVia: '#FFFFFF',
    pageBgTo: '#FBEEF0',
    cardBg: '#FFFFFF',
    cardBorder: 'rgba(230,194,194,0.45)',
    accent: '#E6C2C2',
    accentSoft: '#FBEFEF',
    accentText: '#4A4A4A',
    heading: '#4A4A4A',
    body: '#4A4A4A',
    script: '#D4A5A5',
    diaperEmoji: '🍼',
    mimoEmoji: '🧸',
  },
  safari: {
    id: 'safari',
    name: 'Safari',
    emoji: '🦁',
    decorations: ['🦁', '🐘', '🦒', '🌿', '🐆', '🐊'],
    pageBgFrom: '#FBF6E9',
    pageBgVia: '#F4F7E8',
    pageBgTo: '#FBEFD9',
    cardBg: '#FFFDF5',
    cardBorder: 'rgba(146,103,42,0.30)',
    accent: '#C2843B',
    accentSoft: '#F3E6CE',
    accentText: '#3F2D14',
    heading: '#5A3E1B',
    body: '#5A4A36',
    script: '#7A9A3C',
    diaperEmoji: '🌿',
    mimoEmoji: '🦁',
  },
  ursos: {
    id: 'ursos',
    name: 'Ursos',
    emoji: '🧸',
    decorations: ['🧸', '🍯', '🌳', '🐻', '⭐'],
    pageBgFrom: '#FBF1E4',
    pageBgVia: '#FCEFE0',
    pageBgTo: '#FBF6E0',
    cardBg: '#FFFAF2',
    cardBorder: 'rgba(122,77,30,0.28)',
    accent: '#A97142',
    accentSoft: '#EFE0CF',
    accentText: '#3F2A16',
    heading: '#5C3B1E',
    body: '#5A4630',
    script: '#C08552',
    diaperEmoji: '🍯',
    mimoEmoji: '🧸',
  },
  princesa: {
    id: 'princesa',
    name: 'Princesa',
    emoji: '👑',
    decorations: ['👑', '🏰', '✨', '🌸', '💖'],
    pageBgFrom: '#FCEFF6',
    pageBgVia: '#FBEEFA',
    pageBgTo: '#F5EEFB',
    cardBg: '#FFFFFF',
    cardBorder: 'rgba(199,125,174,0.40)',
    accent: '#C77DAE',
    accentSoft: '#F6E3F0',
    accentText: '#3E2236',
    heading: '#7A3E68',
    body: '#5A4654',
    script: '#C77DAE',
    diaperEmoji: '🎀',
    mimoEmoji: '👑',
  },
};

/** Fixed theme used by the guest page during the visual-only phase. */
export const THEME_DEFAULT: BabyShowerThemeId = 'safari';

export function getTheme(id?: string | null): BabyShowerTheme {
  return BABY_SHOWER_THEMES[(id as BabyShowerThemeId) ?? THEME_DEFAULT] ?? BABY_SHOWER_THEMES[THEME_DEFAULT];
}

/** Inline style for the page background gradient. */
export function pageBgStyle(theme: BabyShowerTheme): CSSProperties {
  return {
    background: `linear-gradient(to bottom right, ${theme.pageBgFrom}, ${theme.pageBgVia}, ${theme.pageBgTo})`,
  };
}

/** Inline style for a themed card surface. */
export function cardStyle(theme: BabyShowerTheme): CSSProperties {
  return {
    backgroundColor: theme.cardBg,
    borderColor: theme.cardBorder,
    borderWidth: 1,
    borderStyle: 'solid',
  };
}
