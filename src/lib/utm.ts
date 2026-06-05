/**
 * Captura e persiste UTM parameters da URL no sessionStorage.
 *
 * Modelo de atribuição: **first-touch** dentro da sessão.
 * - Se a primeira visita do usuário tem UTMs, salva.
 * - Visitas subsequentes na mesma sessão (sem UTM ou com UTM diferente)
 *   não sobrescrevem — preservam o canal original.
 *
 * Quando o editor cria uma collection, lê esses UTMs e persiste no banco.
 */

export interface CapturedUtms {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
}

const SESSION_KEY = 'pb_utms_v1';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

/**
 * Lê UTMs da URL atual (window.location.search). Retorna null se não houver nenhum.
 */
function readFromUrl(): CapturedUtms | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const found: Record<string, string> = {};
  let hasAny = false;
  for (const key of UTM_KEYS) {
    const v = params.get(key);
    if (v && v.trim()) {
      found[key] = v.trim().slice(0, 255);
      hasAny = true;
    }
  }
  if (!hasAny) return null;
  return {
    utmSource: found.utm_source || null,
    utmMedium: found.utm_medium || null,
    utmCampaign: found.utm_campaign || null,
    utmContent: found.utm_content || null,
    utmTerm: found.utm_term || null,
  };
}

/**
 * Lê UTMs já salvos na sessão (se houver).
 */
export function getCapturedUtms(): CapturedUtms | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CapturedUtms;
  } catch {
    return null;
  }
}

/**
 * Captura UTMs da URL e salva na sessão (first-touch).
 * Chame uma vez no client, preferencialmente cedo (LP ou editor).
 * Idempotente: se já há UTMs salvos, não sobrescreve.
 */
export function captureUtmsFromUrl(): CapturedUtms | null {
  if (typeof window === 'undefined') return null;

  // Já há captura nesta sessão? Mantém.
  const existing = getCapturedUtms();
  if (existing) return existing;

  const fromUrl = readFromUrl();
  if (!fromUrl) return null;

  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(fromUrl));
  } catch {
    // sessionStorage indisponível — devolve em memória mesmo assim
  }
  return fromUrl;
}
