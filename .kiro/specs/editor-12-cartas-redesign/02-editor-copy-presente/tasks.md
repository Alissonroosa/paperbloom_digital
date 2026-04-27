# Spec 1.2 — Tarefas

## Implementação

- [x] **T1.** `Step1BasicInfo.tsx`: trocar `nextLabel` para `"Criar o presente →"` e ajustar subtítulo
- [x] **T2.** `Step2Intro.tsx`: usar `collection?.recipientName` em title, subtítulo, label do textarea e footer da música
- [x] **T3.** `Step3Cards1to4.tsx`: usar `recipientName` no title e subtítulo
- [x] **T4.** `Step4Cards5to8.tsx`: usar `recipientName` no title e subtítulo
- [x] **T5.** `Step5Cards9to12.tsx`: usar `recipientName` no title e subtítulo
- [x] **T6.** `Step6Contact.tsx`: a maior mudança — title, subtítulo, helper text, order summary e finalizeLabel
- [x] **T7.** Criar utilitário inline (ou usar inline mesmo) para fallback `recipientName || 'a pessoa'`
- [x] **T8.** Truncar `recipientName` a 30 chars no `finalizeLabel` para evitar overflow

## Verificação

- [x] **V1.** `npm run build` passa
- [x] **V2.** `npx tsc --noEmit` passa
- [x] **V3.** Rodar testes: 40/42 passaram, 2 falhas pré-existentes (mock de fetch), nenhuma assertion de string quebrada pelas mudanças de copy
- [ ] **V4.** Smoke test manual no editor:
  1. Abrir `/editor/12-cartas`
  2. Step 1: digitar "Maria" como destinatária e "João" como remetente
  3. Avançar e verificar que Step 2 mostra "para Maria" no subtítulo
  4. Avançar até Step 6 e verificar finalizeLabel = "💌 Presentear Maria agora"
- [ ] **V5.** Testar com nome muito longo (40+ chars) — verificar truncamento

## Out of scope desta spec

- Modificações no Step 6 que envolvem reduzir campos (telefone) → Spec 2.3
- Adicionar bloco de demo ao vivo no Step 6 → Spec 2.3
- Editar copy fora do editor (LP, emails, dashboard) → outras specs
