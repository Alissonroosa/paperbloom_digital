# Implementation Plan: 12 Cartas - Jornada Emocional

## Overview

Este plano implementa o produto "12 Cartas" reutilizando ao máximo a infraestrutura existente. A implementação seguirá uma abordagem incremental: primeiro o modelo de dados e services, depois a criação e edição, seguido pelo pagamento e visualização, e finalmente testes.

## Tasks

- [x] 1. Criar schema de banco de dados e migrations
  - Criar migration para tabela `card_collections`
  - Criar migration para tabela `cards`
  - Adicionar índices para otimização de queries
  - Executar migrations no banco de desenvolvimento
  - _Requirements: 10.1, 10.2, 10.3, 10.6, 10.7_

- [ ]* 1.1 Escrever testes de schema do banco de dados
  - Verificar que tabela `card_collections` existe com colunas corretas
  - Verificar que tabela `cards` existe com colunas corretas
  - Verificar relacionamento one-to-many (foreign key)
  - Verificar índices criados
  - _Requirements: 10.1, 10.2, 10.3, 10.6_

- [x] 2. Criar tipos TypeScript e schemas de validação
  - Criar interfaces `CardCollection` e `Card` em `src/types/card.ts`
  - Criar schemas Zod para validação de criação e atualização
  - Criar funções de conversão `rowToCardCollection` e `rowToCard`
  - Criar constante `CARD_TEMPLATES` com os 12 templates
  - _Requirements: 1.3, 2.1, 3.3, 3.5_

- [ ]* 2.1 Escrever property test para validação de tamanho de texto
  - **Property 3: Validação de tamanho de texto**
  - **Validates: Requirements 1.5, 3.3**
  - Gerar strings aleatórias de vários tamanhos
  - Verificar que ≤500 chars são aceitos e >500 chars são rejeitados

- [ ]* 2.2 Escrever property test para validação de URL do YouTube
  - **Property 4: Validação de URL do YouTube**
  - **Validates: Requirements 1.7, 3.5**
  - Gerar URLs válidas e inválidas do YouTube
  - Verificar que apenas URLs válidas são aceitas

- [x] 3. Implementar CardCollectionService
  - Criar `src/services/CardCollectionService.ts`
  - Implementar método `create()` para criar conjunto
  - Implementar métodos `findById()` e `findBySlug()`
  - Implementar métodos `updateStatus()`, `updateQRCode()`, `updateStripeSession()`
  - Implementar método `findByStripeSessionId()`
  - _Requirements: 1.1, 1.2, 6.3, 6.4, 6.6_

- [ ]* 3.1 Escrever property test para UUID único
  - **Property 2: UUID único para cada conjunto**
  - **Validates: Requirements 1.2**
  - Criar múltiplos conjuntos
  - Verificar que todos têm UUIDs válidos e únicos

- [ ]* 3.2 Escrever property test para armazenamento de metadados
  - **Property 17: Armazenamento completo de metadados**
  - **Validates: Requirements 10.4**
  - Criar conjunto com dados aleatórios
  - Verificar que todos os metadados estão presentes no banco

- [x] 4. Implementar CardService
  - Criar `src/services/CardService.ts`
  - Implementar método `create()` para criar carta individual
  - Implementar método `createBulk()` para criar 12 cartas de uma vez
  - Implementar métodos `findById()` e `findByCollectionId()`
  - Implementar método `update()` para atualizar conteúdo
  - Implementar métodos `markAsOpened()` e `canOpen()`
  - _Requirements: 1.1, 1.3, 1.4, 1.5, 3.2, 4.1, 4.2_

- [ ]* 4.1 Escrever property test para criação de 12 cartas
  - **Property 1: Conjunto sempre criado com 12 cartas**
  - **Validates: Requirements 1.1, 1.3**
  - Criar conjunto com dados aleatórios
  - Verificar que exatamente 12 cartas são criadas com conteúdo pré-preenchido

- [ ]* 4.2 Escrever property test para ordem dos templates
  - **Property 6: Ordem mantida dos templates**
  - **Validates: Requirements 2.4**
  - Criar conjunto
  - Verificar que cartas estão ordenadas de 1 a 12

- [ ]* 4.3 Escrever property test para status inicial unopened
  - **Property 8: Status inicial unopened**
  - **Validates: Requirements 4.1**
  - Criar cartas aleatórias
  - Verificar que todas têm status "unopened"

- [ ]* 4.4 Escrever property test para armazenamento de dados da carta
  - **Property 18: Armazenamento completo de dados da carta**
  - **Validates: Requirements 10.5**
  - Criar carta com dados aleatórios
  - Verificar que todos os dados estão presentes no banco

- [x] 5. Checkpoint - Verificar services e banco de dados
  - Executar todos os testes de services
  - Verificar que migrations foram aplicadas corretamente
  - Testar criação manual de conjunto via service
  - Perguntar ao usuário se há dúvidas ou ajustes necessários

- [x] 6. Criar API route para criação de conjunto
  - Criar `src/app/api/card-collections/create/route.ts`
  - Implementar POST handler que cria conjunto + 12 cartas
  - Validar input com Zod
  - Retornar conjunto e cartas criadas
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 7. Criar API routes para gerenciamento de cartas
  - Criar `src/app/api/cards/[id]/route.ts` para GET e PATCH
  - Implementar GET para buscar carta por ID
  - Implementar PATCH para atualizar conteúdo da carta
  - Validar que apenas cartas "unopened" podem ser editadas
  - _Requirements: 1.4, 1.5, 1.6, 1.7, 3.2_

- [ ]* 7.1 Escrever property test para persistência de edições
  - **Property 7: Persistência de edições**
  - **Validates: Requirements 3.2, 8.4, 8.5**
  - Editar carta com dados aleatórios
  - Recarregar e verificar que alterações persistiram

- [x] 8. Criar API route para abertura de carta
  - Criar `src/app/api/cards/[id]/open/route.ts`
  - Implementar POST handler que marca carta como aberta
  - Verificar se carta já foi aberta antes
  - Registrar timestamp de abertura
  - Retornar conteúdo completo apenas na primeira abertura
  - _Requirements: 4.2, 4.3, 4.4, 4.5_

- [ ]* 8.1 Escrever property test para transição de status
  - **Property 9: Transição de status ao abrir**
  - **Validates: Requirements 4.2, 4.4**
  - Criar carta "unopened"
  - Abrir carta
  - Verificar que status mudou para "opened" e timestamp foi registrado

- [ ]* 8.2 Escrever property test para bloqueio após abertura
  - **Property 10: Bloqueio de conteúdo após abertura**
  - **Validates: Requirements 4.3, 4.5**
  - Criar e abrir carta
  - Tentar acessar novamente
  - Verificar que conteúdo completo não é retornado

- [x] 9. Criar API routes para busca de conjuntos
  - Criar `src/app/api/card-collections/[id]/route.ts` para GET por ID
  - Criar `src/app/api/card-collections/slug/[slug]/route.ts` para GET por slug
  - Retornar conjunto com todas as cartas
  - Para cartas "opened", não retornar conteúdo completo
  - _Requirements: 5.1, 5.5_

- [x] 10. Criar componente ProductSelector
  - Criar `src/components/products/ProductSelector.tsx`
  - Exibir card para "Mensagem Digital" (produto existente)
  - Exibir card para "12 Cartas" (novo produto)
  - Incluir descrição, preço e preview de cada produto
  - Implementar navegação para editores correspondentes
  - _Requirements: 9.1, 9.2, 9.3, 9.6_

- [x] 11. Atualizar página inicial para seleção de produtos
  - Modificar `src/app/(marketing)/page.tsx`
  - Integrar componente ProductSelector
  - Manter hero section existente
  - Adicionar seção de seleção de produtos
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 12. Criar context para editor de cartas
  - Criar `src/contexts/CardCollectionEditorContext.tsx`
  - Gerenciar estado do conjunto e das 12 cartas
  - Implementar auto-save de alterações
  - Gerenciar índice da carta atual
  - Implementar navegação entre cartas
  - _Requirements: 8.3, 8.4, 8.5_

- [x] 13. Criar componente CardEditorStep
  - Criar `src/components/card-editor/CardEditorStep.tsx`
  - Campos para título, mensagem, foto e música
  - Validação em tempo real
  - Preview da carta
  - Integrar com upload de imagem (reutilizar ImageService)
  - Validar URL do YouTube
  - _Requirements: 1.4, 1.5, 1.6, 1.7, 3.1, 3.3, 3.5_

- [ ]* 13.1 Escrever property test para upload de imagem
  - **Property 5: Upload e armazenamento de imagem**
  - **Validates: Requirements 1.6, 3.4**
  - Gerar imagens válidas aleatórias
  - Fazer upload
  - Verificar que URL retornada é acessível

- [x] 14. Criar componente CardCollectionEditor (wizard principal)
  - Criar `src/components/card-editor/CardCollectionEditor.tsx`
  - Adaptar WizardStepper para 12 steps
  - Exibir indicador de progresso
  - Permitir navegação entre cartas
  - Integrar CardEditorStep para cada carta
  - Implementar botão de finalização
  - _Requirements: 8.1, 8.2, 8.3, 8.6_

- [x] 15. Criar página do editor de 12 cartas
  - Criar `src/app/(marketing)/editor/12-cartas/page.tsx`
  - Integrar CardCollectionEditor
  - Criar conjunto ao carregar página (se não existir)
  - Salvar ID do conjunto em sessionStorage
  - Implementar navegação para checkout
  - _Requirements: 1.1, 8.1, 8.4, 8.5_

- [x] 16. Checkpoint - Testar fluxo de criação e edição
  - Testar criação de novo conjunto via UI
  - Editar todas as 12 cartas
  - Verificar auto-save funcionando
  - Testar navegação entre cartas
  - Verificar validações de campos
  - Perguntar ao usuário se há ajustes necessários

- [x] 17. Criar API route para checkout de conjunto de cartas
  - Criar `src/app/api/checkout/card-collection/route.ts`
  - Reutilizar StripeService existente
  - Definir preço do produto "12 Cartas"
  - Criar sessão de checkout
  - Associar stripe_session_id ao conjunto
  - _Requirements: 6.1, 6.2_

- [ ]* 17.1 Escrever property test para validação antes do checkout
  - **Property 15: Validação antes do checkout**
  - **Validates: Requirements 8.7**
  - Criar conjuntos com dados válidos e inválidos
  - Verificar que checkout é bloqueado para dados inválidos
  - Verificar que checkout é permitido para dados válidos

- [x] 18. Atualizar webhook do Stripe para conjuntos de cartas
  - Modificar `src/app/api/checkout/webhook/route.ts`
  - Detectar se sessão é de "mensagem" ou "conjunto de cartas"
  - Para conjuntos: gerar slug, gerar QR code, enviar email
  - Atualizar status para "paid"
  - _Requirements: 6.3, 6.4, 6.5, 6.6_

- [ ]* 18.1 Escrever property test para geração de slug
  - **Property 11: Geração de slug único após pagamento**
  - **Validates: Requirements 6.3**
  - Simular pagamentos confirmados
  - Verificar que slugs únicos são gerados

- [ ]* 18.2 Escrever property test para geração de QR code
  - **Property 12: Geração de QR code após pagamento**
  - **Validates: Requirements 6.4**
  - Gerar slugs aleatórios
  - Verificar que QR codes válidos são criados

- [ ]* 18.3 Escrever property test para envio de email
  - **Property 13: Envio de email após pagamento**
  - **Validates: Requirements 6.5**
  - Simular pagamentos com emails válidos
  - Verificar que emails são enviados com link e QR code

- [ ]* 18.4 Escrever property test para atualização de status
  - **Property 14: Atualização de status após pagamento**
  - **Validates: Requirements 6.6**
  - Simular pagamento confirmado
  - Verificar que status muda para "paid"

- [x] 19. Criar template de email para conjunto de cartas
  - Criar template em EmailService para "12 Cartas"
  - Incluir link para visualização
  - Incluir QR code como anexo
  - Incluir instruções de uso
  - Manter identidade visual do site
  - _Requirements: 6.5_

- [x] 20. Criar componente CardCollectionViewer
  - Criar `src/components/card-viewer/CardCollectionViewer.tsx`
  - Exibir grid com as 12 cartas
  - Indicar visualmente status (aberta/fechada)
  - Implementar click handler para abrir cartas
  - Exibir modal de confirmação antes de abrir
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 21. Criar componente CardModal
  - Criar `src/components/card-viewer/CardModal.tsx`
  - Exibir conteúdo completo da carta
  - Exibir foto (se houver)
  - Reproduzir música automaticamente (reutilizar YouTubePlayer)
  - Animação especial na primeira abertura
  - Reutilizar FallingEmojis para efeito visual
  - _Requirements: 5.5, 5.6, 5.7_

- [x] 22. Criar página de visualização do conjunto
  - Criar `src/app/(fullscreen)/cartas/[slug]/page.tsx`
  - Buscar conjunto por slug
  - Integrar CardCollectionViewer
  - Exibir informações do remetente
  - Implementar lógica de abertura de cartas
  - _Requirements: 5.1, 5.5_

- [x] 23. Checkpoint - Testar fluxo completo
  - Criar conjunto completo
  - Editar todas as cartas
  - Completar checkout (usar modo test do Stripe)
  - Receber email com link
  - Acessar página de visualização
  - Abrir algumas cartas
  - Verificar que cartas abertas não podem ser reabertas
  - Perguntar ao usuário se há ajustes necessários

- [ ]* 24. Escrever property test para integridade referencial
  - **Property 16: Integridade referencial**
  - **Validates: Requirements 10.7**
  - Tentar deletar collection com cards
  - Verificar que operação falha ou cards são deletados em cascata
  - Verificar que operações válidas sucedem

- [ ]* 25. Escrever testes de integração
  - Testar fluxo completo: criação → edição → pagamento → visualização
  - Testar webhook do Stripe para conjuntos
  - Testar upload de imagens
  - Testar envio de emails

- [ ]* 26. Escrever testes end-to-end
  - Testar criação de conjunto via UI
  - Testar edição de todas as 12 cartas
  - Testar checkout completo
  - Testar visualização como destinatário
  - Testar abertura de cartas e bloqueio

- [x] 27. Adicionar documentação
  - Criar README.md para o produto "12 Cartas"
  - Documentar API routes
  - Documentar componentes principais
  - Criar guia de uso para usuários
  - Documentar diferenças entre produtos

- [x] 28. Checkpoint final - Revisão completa
  - Executar todos os testes
  - Verificar que todos os requirements foram atendidos
  - Testar em diferentes navegadores
  - Testar responsividade mobile
  - Verificar acessibilidade
  - Perguntar ao usuário se está pronto para produção

## Notes

- Tasks marcadas com `*` são opcionais e podem ser puladas para MVP mais rápido
- Cada task referencia requirements específicos para rastreabilidade
- Checkpoints garantem validação incremental
- Property tests validam propriedades universais de correção
- Testes de integração e E2E validam fluxos completos
- Máxima reutilização de código existente (Services, Components, Styling)
