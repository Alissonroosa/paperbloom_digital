/**
 * Sugestão de correção pra typos comuns em domínios de email.
 * Retorna `null` se não há sugestão (domínio já conhecido ou desconhecido).
 *
 * Não substitui validação de formato — use junto com regex.
 */

// Domínios reais (whitelist) — se o domínio bater exato, não sugere nada.
const KNOWN_DOMAINS = new Set([
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'outlook.com.br',
  'yahoo.com',
  'yahoo.com.br',
  'icloud.com',
  'live.com',
  'live.com.br',
  'bol.com.br',
  'uol.com.br',
  'terra.com.br',
  'globo.com',
  'me.com',
  'msn.com',
]);

// Mapeamento direto: typo → correto. Cobre 90% dos erros de digitação reais.
const TYPO_FIXES: Record<string, string> = {
  // gmail
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gmali.com': 'gmail.com',
  'gmail.cm': 'gmail.com',
  'gmail.com.br': 'gmail.com',
  // hotmail
  'hotmial.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'hotmal.com': 'hotmail.com',
  'hotmail.co': 'hotmail.com',
  'hotmail.con': 'hotmail.com',
  'hotmail.cm': 'hotmail.com',
  'hormail.com': 'hotmail.com',
  'hotmaill.com': 'hotmail.com',
  // outlook
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'outlock.com': 'outlook.com',
  'outlook.co': 'outlook.com',
  'outlook.con': 'outlook.com',
  // yahoo
  'yaho.com': 'yahoo.com',
  'yahoo.co': 'yahoo.com',
  'yahoo.con': 'yahoo.com',
  'yhoo.com': 'yahoo.com',
  'yahho.com': 'yahoo.com',
  // icloud
  'iclod.com': 'icloud.com',
  'icloud.co': 'icloud.com',
  'icloud.con': 'icloud.com',
  'icloud.cm': 'icloud.com',
  // outras
  'uol.com': 'uol.com.br',
  'bol.com': 'bol.com.br',
};

/**
 * Se houver um typo conhecido, retorna o email corrigido. Senão retorna null.
 *
 * @example suggestEmailFix('joao@gmial.com') // 'joao@gmail.com'
 * @example suggestEmailFix('joao@gmail.com') // null (já está certo)
 * @example suggestEmailFix('joao@empresa.com') // null (domínio desconhecido, não sugere)
 */
export function suggestEmailFix(email: string): string | null {
  if (!email || !email.includes('@')) return null;
  const at = email.lastIndexOf('@');
  const local = email.slice(0, at);
  const domain = email.slice(at + 1).toLowerCase().trim();

  if (!domain || !local) return null;
  if (KNOWN_DOMAINS.has(domain)) return null;

  const fixed = TYPO_FIXES[domain];
  if (fixed && fixed !== domain) {
    return `${local}@${fixed}`;
  }
  return null;
}

/**
 * Regex simples — formato válido. Não verifica DNS.
 */
export function isEmailFormatValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
