# Requirements Document

## Introduction

Esta especificação define a melhoria da experiência do usuário no editor de 12 cartas, transformando o fluxo atual de 12 etapas sequenciais em 3 etapas agrupadas por momentos temáticos. O objetivo é reduzir significativamente o número de cliques necessários e tornar a experiência de edição mais fluida e intuitiva.

## Glossary

- **Editor_12_Cartas**: Interface de edição das 12 cartas do produto "12 Cartas para Você"
- **Momento_Temático**: Agrupamento de cartas relacionadas por tema emocional
- **Modal_Edição**: Janela popup para editar conteúdo de uma carta específica
- **Carta**: Unidade individual de conteúdo com título, mensagem, foto opcional e música opcional
- **Sistema**: A aplicação web PaperBloom

## Requirements

### Requirement 1: Agrupamento de Cartas por Momentos Temáticos

**User Story:** Como usuário, quero visualizar as 12 cartas organizadas em 3 grupos temáticos, para que eu possa entender melhor o contexto de cada carta e navegar mais rapidamente pelo editor.

#### Acceptance Criteria

1. THE Sistema SHALL agrupar as 12 cartas em exatamente 3 momentos temáticos
2. THE Sistema SHALL exibir o primeiro grupo como "Momentos Emocionais e de Apoio"
3. THE Sistema SHALL exibir o segundo grupo como "Momentos de Celebração e Romance"
4. THE Sistema SHALL exibir o terceiro grupo como "Momentos para Resolver Conflitos e Rir"
5. WHEN o usuário acessa o editor THEN THE Sistema SHALL exibir o primeiro momento temático por padrão
6. THE Sistema SHALL distribuir as 12 cartas entre os 3 momentos de forma equilibrada

### Requirement 2: Visualização de Múltiplas Cartas Simultaneamente

**User Story:** Como usuário, quero ver todas as cartas de um momento temático ao mesmo tempo, para que eu possa ter uma visão geral do conteúdo e decidir quais cartas editar.

#### Acceptance Criteria

1. WHEN um momento temático é exibido THEN THE Sistema SHALL mostrar todas as cartas daquele momento simultaneamente
2. WHEN uma carta é exibida THEN THE Sistema SHALL mostrar o título da carta
3. WHEN uma carta é exibida THEN THE Sistema SHALL mostrar o conteúdo/mensagem da carta
4. WHEN uma carta possui foto THEN THE Sistema SHALL exibir um indicador visual da foto
5. WHEN uma carta possui música THEN THE Sistema SHALL exibir um indicador visual da música
6. THE Sistema SHALL exibir as cartas de forma visualmente organizada e legível

### Requirement 3: Edição via Modal com Botões de Ação

**User Story:** Como usuário, quero editar cada carta através de botões de ação específicos, para que eu possa modificar apenas o que preciso de forma rápida e direta.

#### Acceptance Criteria

1. WHEN uma carta é exibida THEN THE Sistema SHALL mostrar 3 botões de ação: "Editar Mensagem", "Adicionar Foto" e "Adicionar Música"
2. WHEN o usuário clica em "Editar Mensagem" THEN THE Sistema SHALL abrir um modal de edição de texto
3. WHEN o usuário clica em "Adicionar Foto" THEN THE Sistema SHALL abrir um modal de upload de imagem
4. WHEN o usuário clica em "Adicionar Música" THEN THE Sistema SHALL abrir um modal de seleção de música
5. WHEN uma carta já possui foto THEN THE Sistema SHALL alterar o botão para "Editar Foto"
6. WHEN uma carta já possui música THEN THE Sistema SHALL alterar o botão para "Editar Música"

### Requirement 4: Modal de Edição de Mensagem

**User Story:** Como usuário, quero editar o texto de uma carta em um modal dedicado, para que eu possa focar na escrita sem distrações.

#### Acceptance Criteria

1. WHEN o modal de edição de mensagem abre THEN THE Sistema SHALL exibir o título da carta
2. WHEN o modal de edição de mensagem abre THEN THE Sistema SHALL exibir um campo de texto editável com o conteúdo atual
3. WHEN o usuário modifica o texto THEN THE Sistema SHALL permitir edição livre do conteúdo
4. WHEN o usuário clica em "Salvar" THEN THE Sistema SHALL atualizar o conteúdo da carta e fechar o modal
5. WHEN o usuário clica em "Cancelar" THEN THE Sistema SHALL descartar as alterações e fechar o modal
6. WHEN o usuário clica fora do modal THEN THE Sistema SHALL perguntar se deseja salvar as alterações

### Requirement 5: Modal de Adição/Edição de Foto

**User Story:** Como usuário, quero adicionar ou editar fotos nas cartas através de um modal, para que eu possa personalizar visualmente cada mensagem.

#### Acceptance Criteria

1. WHEN o modal de foto abre THEN THE Sistema SHALL exibir uma área de upload de imagem
2. WHEN uma foto já existe THEN THE Sistema SHALL exibir a foto atual no modal
3. WHEN o usuário faz upload de uma nova foto THEN THE Sistema SHALL validar o formato da imagem
4. WHEN o usuário faz upload de uma nova foto THEN THE Sistema SHALL validar o tamanho da imagem
5. WHEN o usuário clica em "Salvar" THEN THE Sistema SHALL associar a foto à carta e fechar o modal
6. WHEN o usuário clica em "Remover Foto" THEN THE Sistema SHALL remover a foto da carta
7. WHEN o usuário clica em "Cancelar" THEN THE Sistema SHALL descartar as alterações e fechar o modal

### Requirement 6: Modal de Adição/Edição de Música

**User Story:** Como usuário, quero adicionar ou editar músicas nas cartas através de um modal, para que eu possa criar uma experiência multimídia completa.

#### Acceptance Criteria

1. WHEN o modal de música abre THEN THE Sistema SHALL exibir opções de seleção de música
2. WHEN uma música já existe THEN THE Sistema SHALL exibir a música atual selecionada
3. WHEN o usuário seleciona uma música THEN THE Sistema SHALL permitir preview da música
4. WHEN o usuário clica em "Salvar" THEN THE Sistema SHALL associar a música à carta e fechar o modal
5. WHEN o usuário clica em "Remover Música" THEN THE Sistema SHALL remover a música da carta
6. WHEN o usuário clica em "Cancelar" THEN THE Sistema SHALL descartar as alterações e fechar o modal

### Requirement 7: Navegação entre Momentos Temáticos

**User Story:** Como usuário, quero navegar facilmente entre os 3 momentos temáticos, para que eu possa editar cartas de diferentes grupos sem perder o progresso.

#### Acceptance Criteria

1. THE Sistema SHALL exibir botões de navegação para os 3 momentos temáticos
2. WHEN o usuário clica em um momento temático THEN THE Sistema SHALL exibir as cartas daquele momento
3. WHEN o usuário navega entre momentos THEN THE Sistema SHALL preservar todas as edições realizadas
4. THE Sistema SHALL indicar visualmente qual momento está sendo exibido atualmente
5. WHEN o usuário está no primeiro momento THEN THE Sistema SHALL exibir botão "Próximo"
6. WHEN o usuário está no último momento THEN THE Sistema SHALL exibir botão "Finalizar e Comprar"
7. WHEN o usuário está em um momento intermediário THEN THE Sistema SHALL exibir botões "Anterior" e "Próximo"

### Requirement 8: Persistência de Dados

**User Story:** Como usuário, quero que minhas edições sejam salvas automaticamente, para que eu não perca meu trabalho caso feche o navegador acidentalmente.

#### Acceptance Criteria

1. WHEN o usuário salva uma edição em um modal THEN THE Sistema SHALL persistir os dados imediatamente
2. WHEN o usuário navega entre momentos THEN THE Sistema SHALL manter todas as edições em memória
3. WHEN o usuário recarrega a página THEN THE Sistema SHALL recuperar o estado anterior da edição
4. THE Sistema SHALL utilizar o mesmo mecanismo de persistência do editor atual
5. WHEN todas as cartas são editadas THEN THE Sistema SHALL manter os dados até a finalização da compra

### Requirement 9: Indicadores Visuais de Progresso

**User Story:** Como usuário, quero ver indicadores visuais do meu progresso, para que eu saiba quantas cartas já personalizei e quantas ainda faltam.

#### Acceptance Criteria

1. THE Sistema SHALL exibir um indicador de progresso geral mostrando quantas cartas foram editadas
2. WHEN uma carta tem mensagem personalizada THEN THE Sistema SHALL exibir um indicador visual
3. WHEN uma carta tem foto adicionada THEN THE Sistema SHALL exibir um indicador visual
4. WHEN uma carta tem música adicionada THEN THE Sistema SHALL exibir um indicador visual
5. THE Sistema SHALL exibir o número do momento atual (1 de 3, 2 de 3, 3 de 3)

### Requirement 10: Responsividade e Acessibilidade

**User Story:** Como usuário, quero que o editor funcione bem em diferentes dispositivos, para que eu possa editar as cartas no celular, tablet ou computador.

#### Acceptance Criteria

1. WHEN o editor é acessado em dispositivo móvel THEN THE Sistema SHALL adaptar o layout para telas pequenas
2. WHEN o editor é acessado em tablet THEN THE Sistema SHALL adaptar o layout para telas médias
3. WHEN o editor é acessado em desktop THEN THE Sistema SHALL utilizar o layout completo
4. WHEN modais são abertos em mobile THEN THE Sistema SHALL ocupar a tela completa
5. THE Sistema SHALL manter todos os botões e controles acessíveis via teclado
6. THE Sistema SHALL fornecer labels adequados para leitores de tela
