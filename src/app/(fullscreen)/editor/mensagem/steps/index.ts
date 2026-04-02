/**
 * Mensagem Digital Editor Steps
 * 
 * Exports all step components for the interactive wizard
 * 
 * New structure (6 steps):
 * 1. Recipient - Para quem? De quem?
 * 2. Message - Sua mensagem especial
 * 3. Date - Data especial (opcional)
 * 4. Photos - Fotos e memórias (opcional)
 * 5. MusicTheme - Música e tema visual
 * 6. Finalize - Contato e pagamento
 */

export { Step1Recipient } from './Step1Recipient';
export { Step2Message } from './Step2Message';
export { Step3Date } from './Step3Date';
export { Step4Photos } from './Step4Photos';
export { Step5MusicTheme } from './Step5MusicTheme';
export { Step6Finalize } from './Step6Finalize';

// Legacy exports (kept for backwards compatibility)
export { Step1TitleURL } from './Step1TitleURL';
export { Step2Date as Step2DateLegacy } from './Step2Date';
export { Step3Message as Step3MessageLegacy } from './Step3Message';
export { Step5Theme } from './Step5Theme';
export { Step6Music } from './Step6Music';
export { Step7Contact } from './Step7Contact';
