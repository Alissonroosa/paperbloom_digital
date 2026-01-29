# Implementation Plan: Editor Agrupado de 12 Cartas

## Overview

Este plano implementa a melhoria do editor de 12 cartas, transformando o fluxo atual de 12 etapas sequenciais em 3 etapas agrupadas por momentos temáticos. A implementação será feita em fases incrementais, reutilizando ao máximo o código existente e mantendo compatibilidade com a infraestrutura atual.

## Tasks

- [x] 1. Estender Context com Estado de Momentos Temáticos
  - Adicionar `currentMomentIndex` ao `CardCollectionEditorContext`
  - Implementar constante `THEMATIC_MOMENTS` com os 3 grupos
  - Adicionar helpers: `getCurrentMomentCards()`, `getMomentCompletionStatus()`
  - Adicionar funções de navegação: `nextMoment()`, `previousMoment()`, `goToMoment()`
  - Adicionar computed properties: `isFirstMoment`, `isLastMoment`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 7.1, 7.2_

- [ ]* 1.1 Escrever testes unitários para helpers de momento
  - Testar `getCurrentMomentCards()` retorna 4 cartas corretas
  - Testar `getMomentCompletionStatus()` calcula progresso corretamente
  - Testar navegação entre momentos
  - _Requirements: 1.1, 1.6_

- [ ]* 1.2 Escrever property test para agrupamento de cartas
  - **Property 1: Agrupamento Correto de Cartas**
  - **Validates: Requirements 1.1, 1.6**

- [x] 2. Criar Componente CardPreviewCard
  - Criar `src/components/card-editor/CardPreviewCard.tsx`
  - Implementar layout de card com título, preview de mensagem (100 chars)
  - Adicionar badges para indicadores de foto/música
  - Implementar 3 botões de ação com labels dinâmicos
  - Adicionar estilos responsivos (mobile/tablet/desktop)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.5, 3.6_

- [ ]* 2.1 Escrever testes unitários para CardPreviewCard
  - Testar renderização de título e mensagem
  - Testar exibição de badges quando mídia presente
  - Testar labels dinâmicos dos botões
  - _Requirements: 2.2, 2.3, 2.4, 2.5, 3.5, 3.6_

- [ ]* 2.2 Escrever property test para indicadores de mídia
  - **Property 5: Indicadores de Mídia**
  - **Validates: Requirements 2.4, 2.5**

- [ ]* 2.3 Escrever property test para labels dinâmicos
  - **Property 10: Labels Dinâmicos dos Botões**
  - **Validates: Requirements 3.5, 3.6**

- [x] 3. Criar Componente CardGridView
  - Criar `src/components/card-editor/CardGridView.tsx`
  - Implementar grid responsivo (1 col mobile, 2 cols tablet/desktop)
  - Renderizar 4 `CardPreviewCard` components
  - Implementar callbacks para ações (editMessage, editPhoto, editMusic)
  - Adicionar animações de transição ao trocar de momento
  - _Requirements: 2.1, 2.6_

- [ ]* 3.1 Escrever testes unitários para CardGridView
  - Testar renderização de 4 cards
  - Testar callbacks são chamados corretamente
  - Testar layout responsivo
  - _Requirements: 2.1_

- [ ]* 3.2 Escrever property test para visualização simultânea
  - **Property 3: Visualização Simultânea de Cartas**
  - **Validates: Requirements 2.1**

- [x] 4. Criar Componente MomentNavigation
  - Criar `src/components/card-editor/MomentNavigation.tsx`
  - Implementar 3 botões de navegação com títulos dos momentos
  - Adicionar indicador visual de momento ativo
  - Mostrar progresso de cada momento (X/4 cartas completas)
  - Implementar navegação direta entre momentos
  - Adicionar estilos responsivos
  - _Requirements: 7.1, 7.2, 7.4, 9.5_

- [ ]* 4.1 Escrever testes unitários para MomentNavigation
  - Testar renderização de 3 botões
  - Testar indicador de momento ativo
  - Testar callback de navegação
  - _Requirements: 7.1, 7.4_

- [ ]* 4.2 Escrever property test para indicador de momento ativo
  - **Property 17: Indicador de Momento Ativo**
  - **Validates: Requirements 7.4**

- [x] 5. Criar Modal EditMessageModal
  - Criar `src/components/card-editor/modals/EditMessageModal.tsx`
  - Implementar campo de título (200 chars max)
  - Implementar textarea de mensagem (500 chars max)
  - Adicionar contador de caracteres em tempo real
  - Implementar validação de entrada
  - Adicionar botões: Salvar, Cancelar
  - Implementar confirmação ao fechar com alterações não salvas
  - Adicionar estilos responsivos (fullscreen em mobile)
  - _Requirements: 3.2, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ]* 5.1 Escrever testes unitários para EditMessageModal
  - Testar validação de título vazio
  - Testar validação de mensagem excedendo 500 chars
  - Testar salvamento atualiza carta
  - Testar cancelamento descarta alterações
  - _Requirements: 4.3, 4.4, 4.5_

- [ ]* 5.2 Escrever property test para salvamento de edições
  - **Property 11: Salvamento de Edições**
  - **Validates: Requirements 4.4, 8.1**

- [ ]* 5.3 Escrever property test para cancelamento
  - **Property 12: Cancelamento de Edições**
  - **Validates: Requirements 4.5, 5.7, 6.6**

- [x] 6. Criar Modal PhotoUploadModal
  - Criar `src/components/card-editor/modals/PhotoUploadModal.tsx`
  - Implementar área de drag-and-drop
  - Adicionar preview da foto atual (se existir)
  - Implementar validação de formato (JPEG, PNG, WebP)
  - Implementar validação de tamanho (max 5MB)
  - Adicionar indicador de progresso de upload
  - Implementar botões: Salvar, Remover Foto, Cancelar
  - Reutilizar lógica de upload existente
  - Adicionar estilos responsivos (fullscreen em mobile)
  - _Requirements: 3.3, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [ ]* 6.1 Escrever testes unitários para PhotoUploadModal
  - Testar validação de formato de imagem
  - Testar validação de tamanho de imagem
  - Testar preview de foto existente
  - Testar remoção de foto
  - _Requirements: 5.3, 5.4, 5.6_

- [ ]* 6.2 Escrever property test para validação de imagem
  - **Property 13: Validação de Imagem**
  - **Validates: Requirements 5.3, 5.4**

- [ ]* 6.3 Escrever property test para remoção de mídia
  - **Property 14: Remoção de Mídia**
  - **Validates: Requirements 5.6, 6.5**

- [x] 7. Criar Modal MusicSelectionModal
  - Criar `src/components/card-editor/modals/MusicSelectionModal.tsx`
  - Implementar input para URL do YouTube
  - Adicionar validação de URL em tempo real
  - Implementar extração de video ID
  - Adicionar preview do vídeo (iframe embed)
  - Implementar botões: Salvar, Remover Música, Cancelar
  - Reutilizar lógica de validação existente
  - Adicionar estilos responsivos (fullscreen em mobile)
  - _Requirements: 3.4, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ]* 7.1 Escrever testes unitários para MusicSelectionModal
  - Testar validação de URL do YouTube
  - Testar extração de video ID
  - Testar preview de vídeo
  - Testar remoção de música
  - _Requirements: 6.3, 6.5_

- [ ]* 7.2 Escrever property test para preview de música
  - **Property 15: Preview de Música**
  - **Validates: Requirements 6.3**

- [x] 8. Criar Componente GroupedCardCollectionEditor
  - Criar `src/components/card-editor/GroupedCardCollectionEditor.tsx`
  - Implementar header com progresso geral
  - Integrar `MomentNavigation` component
  - Integrar `CardGridView` component
  - Implementar gerenciamento de estado de modais (qual modal aberto, qual carta)
  - Integrar os 3 modais (EditMessage, Photo, Music)
  - Implementar footer com navegação Anterior/Próximo/Finalizar
  - Adicionar indicadores de auto-save
  - _Requirements: 7.3, 7.5, 7.6, 7.7, 9.1_

- [ ]* 8.1 Escrever testes unitários para GroupedCardCollectionEditor
  - Testar abertura de modais corretos
  - Testar navegação entre momentos
  - Testar botões de footer (Anterior/Próximo/Finalizar)
  - _Requirements: 7.5, 7.6, 7.7_

- [ ]* 8.2 Escrever property test para navegação entre momentos
  - **Property 16: Navegação entre Momentos**
  - **Validates: Requirements 7.2, 7.3**

- [x] 9. Checkpoint - Testar Componentes Isoladamente
  - Criar página de teste em `src/app/(marketing)/test/grouped-editor/page.tsx`
  - Testar cada componente individualmente
  - Verificar responsividade em diferentes tamanhos de tela
  - Testar acessibilidade via teclado
  - Verificar que todos os modais abrem e fecham corretamente
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Integrar GroupedCardCollectionEditor na Página Principal
  - Atualizar `src/app/(marketing)/editor/12-cartas/page.tsx`
  - Substituir `CardCollectionEditor` por `GroupedCardCollectionEditor`
  - Manter mesma lógica de inicialização e checkout
  - Verificar que props são passadas corretamente
  - _Requirements: 1.5, 8.4_

- [ ]* 10.1 Escrever testes de integração para fluxo completo
  - Testar navegação pelos 3 momentos
  - Testar edição de todas as 12 cartas
  - Testar adição de fotos e músicas
  - Testar que checkout é habilitado quando completo
  - _Requirements: 7.2, 7.3, 8.5_

- [x] 11. Implementar Persistência de Estado de Momentos
  - Atualizar localStorage para incluir `currentMomentIndex`
  - Atualizar `restoreFromLocalStorage()` para restaurar momento atual
  - Testar que momento é preservado ao recarregar página
  - _Requirements: 8.2, 8.3_

- [ ]* 11.1 Escrever property test para persistência de dados
  - **Property 18: Persistência de Dados**
  - **Validates: Requirements 8.2, 8.3, 8.5**

- [x] 12. Implementar Indicadores de Progresso
  - Adicionar indicador de progresso geral no header
  - Adicionar badges em `CardPreviewCard` para cartas completas
  - Adicionar indicadores de foto/música em cards
  - Mostrar "X de 3" para momento atual
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ]* 12.1 Escrever property test para indicadores de progresso
  - **Property 19: Indicadores de Progresso**
  - **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5**

- [x] 13. Implementar Responsividade e Acessibilidade
  - Adicionar breakpoints para mobile/tablet/desktop
  - Implementar modais fullscreen em mobile
  - Adicionar aria-labels em todos os elementos interativos
  - Implementar navegação por teclado completa
  - Adicionar focus management em modais
  - Testar com screen reader
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [ ]* 13.1 Escrever property test para responsividade
  - **Property 20: Responsividade**
  - **Validates: Requirements 10.1, 10.2, 10.3, 10.4**

- [ ]* 13.2 Escrever property test para acessibilidade
  - **Property 21: Acessibilidade**
  - **Validates: Requirements 10.5, 10.6**

- [ ]* 13.3 Escrever testes de acessibilidade
  - Testar navegação por teclado (Tab, Enter, Escape)
  - Testar que aria-labels estão presentes
  - Testar focus management em modais
  - _Requirements: 10.5, 10.6_

- [x] 14. Checkpoint - Teste End-to-End Completo
  - Testar fluxo completo de criação de coleção
  - Navegar pelos 3 momentos
  - Editar todas as 12 cartas
  - Adicionar fotos e músicas em algumas cartas
  - Verificar persistência ao recarregar página
  - Finalizar e ir para checkout
  - Testar em diferentes dispositivos (mobile, tablet, desktop)
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Otimizações de Performance
  - Adicionar `React.memo` em `CardPreviewCard`
  - Implementar lazy loading dos modais
  - Adicionar debounce em validação de URL do YouTube
  - Otimizar re-renders com `useMemo` e `useCallback`
  - Verificar performance com React DevTools Profiler

- [ ]* 15.1 Escrever testes de performance
  - Testar que componentes não re-renderizam desnecessariamente
  - Testar que modais são lazy loaded
  - _Requirements: Performance_

- [ ] 16. Documentação e Cleanup
  - Criar README para novos componentes
  - Adicionar comentários JSDoc em funções principais
  - Atualizar documentação do projeto
  - Remover código antigo não utilizado (se aplicável)
  - Atualizar CHANGELOG

- [ ] 17. Final Review e Deploy
  - Revisar todos os testes (unit, property, integration, accessibility)
  - Verificar que todos os requirements foram atendidos
  - Testar em ambiente de staging
  - Obter aprovação do usuário
  - Deploy para produção

## Notes

- Tasks marcadas com `*` são opcionais e podem ser puladas para MVP mais rápido
- Cada task referencia os requirements específicos para rastreabilidade
- Checkpoints garantem validação incremental
- Property tests validam propriedades universais de correção
- Unit tests validam exemplos específicos e edge cases
- A implementação reutiliza ao máximo o código existente
- Não há mudanças no backend ou banco de dados
- Rollback é simples: basta restaurar o import do componente antigo
