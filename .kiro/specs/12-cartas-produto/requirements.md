# Requirements Document - 12 Cartas: Jornada Emocional

## Introduction

Este documento define os requisitos para o segundo produto da plataforma Paper Bloom: "12 Cartas - Uma jornada emocional única". O produto permite que usuários criem um conjunto de 12 mensagens exclusivas que só podem ser abertas uma única vez cada, criando um calendário de mistério e emoção ao longo do ano. Cada carta pode conter uma foto e uma música, proporcionando uma experiência multimídia personalizada.

## Glossary

- **Sistema**: A plataforma Paper Bloom Digital que gerencia a criação, armazenamento e entrega das 12 cartas
- **Usuário**: Pessoa que cria e personaliza o conjunto de 12 cartas
- **Destinatário**: Pessoa que receberá e abrirá as 12 cartas
- **Carta**: Uma mensagem individual dentro do conjunto de 12, contendo texto, foto opcional e música opcional
- **Conjunto_de_Cartas**: Coleção completa de 12 cartas criadas pelo usuário
- **Template_de_Carta**: Modelo pré-preenchido com sugestão de conteúdo para cada carta
- **Status_de_Abertura**: Estado que indica se uma carta já foi aberta (opened) ou ainda está fechada (unopened)
- **Slug_do_Conjunto**: Identificador único na URL para acessar o conjunto de cartas
- **QR_Code**: Código QR gerado para acesso rápido ao conjunto de cartas

## Requirements

### Requirement 1: Criação do Conjunto de 12 Cartas

**User Story:** Como usuário, eu quero criar um conjunto de 12 cartas personalizadas, para que eu possa presentear alguém especial com uma jornada emocional ao longo do ano.

#### Acceptance Criteria

1. WHEN o usuário seleciona criar o produto "12 Cartas", THE Sistema SHALL criar um novo Conjunto_de_Cartas com 12 Cartas pré-preenchidas baseadas nos templates
2. THE Sistema SHALL gerar um identificador único (UUID) para o Conjunto_de_Cartas
3. THE Sistema SHALL pré-preencher cada Carta com conteúdo sugerido baseado nos templates emocionais
4. THE Sistema SHALL permitir que o usuário personalize o título de cada Carta
5. THE Sistema SHALL permitir que o usuário edite o texto de cada Carta (máximo 500 caracteres por carta)
6. THE Sistema SHALL permitir que o usuário adicione uma foto em cada Carta
7. THE Sistema SHALL permitir que o usuário adicione uma música (YouTube URL) em cada Carta

### Requirement 2: Templates Pré-Preenchidos

**User Story:** Como usuário, eu quero receber sugestões de conteúdo para cada carta, para que eu tenha inspiração e economize tempo na criação.

#### Acceptance Criteria

1. THE Sistema SHALL fornecer 12 templates de cartas com os seguintes temas:
   - "Abra quando... estiver tendo um dia difícil"
   - "Abra quando... estiver se sentindo inseguro(a)"
   - "Abra quando... estivermos longe um do outro"
   - "Abra quando... estiver estressado(a) com o trabalho"
   - "Abra quando... quiser saber o quanto eu te amo"
   - "Abra quando... completarmos mais um ano juntos"
   - "Abra quando... estivermos celebrando uma conquista sua"
   - "Abra quando... for uma noite de chuva e tédio"
   - "Abra quando... tivermos nossa primeira briga boba"
   - "Abra quando... você precisar dar uma risada"
   - "Abra quando... eu tiver feito algo que te irritou"
   - "Abra quando... você não conseguir dormir"
2. WHEN o Conjunto_de_Cartas é criado, THE Sistema SHALL preencher automaticamente cada Carta com texto sugerido apropriado ao tema
3. THE Sistema SHALL permitir que o usuário modifique completamente o conteúdo pré-preenchido
4. THE Sistema SHALL manter a ordem dos templates (1 a 12) durante a criação

### Requirement 3: Personalização Individual de Cada Carta

**User Story:** Como usuário, eu quero personalizar cada carta individualmente, para que cada mensagem seja única e especial.

#### Acceptance Criteria

1. THE Sistema SHALL fornecer uma interface de edição para cada uma das 12 Cartas
2. WHEN o usuário edita uma Carta, THE Sistema SHALL salvar automaticamente as alterações
3. THE Sistema SHALL validar que o texto da Carta não exceda 500 caracteres
4. WHEN o usuário adiciona uma foto, THE Sistema SHALL fazer upload e armazenar a imagem
5. WHEN o usuário adiciona uma música, THE Sistema SHALL validar que a URL é do YouTube
6. THE Sistema SHALL permitir navegação entre as 12 Cartas durante a edição
7. THE Sistema SHALL indicar visualmente quais Cartas já foram personalizadas

### Requirement 4: Controle de Abertura Única

**User Story:** Como destinatário, eu quero que cada carta só possa ser aberta uma única vez, para que a experiência seja especial e única.

#### Acceptance Criteria

1. WHEN uma Carta é criada, THE Sistema SHALL definir seu Status_de_Abertura como "unopened"
2. WHEN o Destinatário abre uma Carta pela primeira vez, THE Sistema SHALL alterar o Status_de_Abertura para "opened"
3. WHEN o Destinatário tenta acessar uma Carta com Status_de_Abertura "opened", THE Sistema SHALL exibir uma mensagem indicando que a carta já foi aberta
4. THE Sistema SHALL registrar a data e hora da primeira abertura de cada Carta
5. THE Sistema SHALL impedir que o conteúdo de uma Carta "opened" seja visualizado novamente

### Requirement 5: Visualização do Conjunto de Cartas

**User Story:** Como destinatário, eu quero ver todas as 12 cartas disponíveis, para que eu possa escolher qual abrir.

#### Acceptance Criteria

1. WHEN o Destinatário acessa o Slug_do_Conjunto, THE Sistema SHALL exibir uma interface com as 12 Cartas
2. THE Sistema SHALL exibir cada Carta como um card com seu título
3. THE Sistema SHALL indicar visualmente quais Cartas estão "unopened" e quais estão "opened"
4. WHEN o Destinatário clica em uma Carta "unopened", THE Sistema SHALL exibir um modal de confirmação antes de abrir
5. WHEN o Destinatário confirma a abertura, THE Sistema SHALL exibir o conteúdo completo da Carta
6. THE Sistema SHALL exibir a foto da Carta (se houver)
7. THE Sistema SHALL reproduzir a música da Carta automaticamente (se houver)

### Requirement 6: Pagamento e Geração de Acesso

**User Story:** Como usuário, eu quero pagar pelo conjunto de cartas e receber um link de acesso, para que eu possa compartilhar com o destinatário.

#### Acceptance Criteria

1. WHEN o usuário finaliza a personalização das 12 Cartas, THE Sistema SHALL criar uma sessão de checkout no Stripe
2. THE Sistema SHALL definir o preço do produto "12 Cartas"
3. WHEN o pagamento é confirmado, THE Sistema SHALL gerar um Slug_do_Conjunto único
4. WHEN o pagamento é confirmado, THE Sistema SHALL gerar um QR_Code para o Slug_do_Conjunto
5. WHEN o pagamento é confirmado, THE Sistema SHALL enviar um email ao usuário com o link e QR_Code
6. THE Sistema SHALL atualizar o status do Conjunto_de_Cartas para "paid"

### Requirement 7: Integração com Infraestrutura Existente

**User Story:** Como desenvolvedor, eu quero reutilizar a infraestrutura existente do produto "Mensagem Digital", para que a implementação seja eficiente e consistente.

#### Acceptance Criteria

1. THE Sistema SHALL utilizar o mesmo banco de dados PostgreSQL existente
2. THE Sistema SHALL utilizar o mesmo serviço de upload de imagens (R2/Cloudflare)
3. THE Sistema SHALL utilizar o mesmo serviço de pagamento (Stripe)
4. THE Sistema SHALL utilizar o mesmo serviço de email (Resend)
5. THE Sistema SHALL utilizar o mesmo serviço de geração de QR Code
6. THE Sistema SHALL manter a mesma identidade visual e temas do site
7. THE Sistema SHALL reutilizar componentes React existentes quando possível

### Requirement 8: Experiência do Usuário na Criação

**User Story:** Como usuário, eu quero uma experiência de criação intuitiva e rápida, para que eu possa criar as 12 cartas sem dificuldades.

#### Acceptance Criteria

1. THE Sistema SHALL exibir um wizard de criação com navegação entre as 12 Cartas
2. THE Sistema SHALL exibir um indicador de progresso mostrando quantas Cartas foram personalizadas
3. THE Sistema SHALL permitir que o usuário pule Cartas e volte depois
4. THE Sistema SHALL salvar automaticamente o progresso do usuário
5. WHEN o usuário fecha o navegador, THE Sistema SHALL preservar o estado de edição
6. THE Sistema SHALL exibir um preview de cada Carta durante a edição
7. THE Sistema SHALL validar os dados antes de permitir o checkout

### Requirement 9: Página de Seleção de Produto

**User Story:** Como usuário, eu quero escolher entre os produtos disponíveis, para que eu possa selecionar o que melhor atende minhas necessidades.

#### Acceptance Criteria

1. THE Sistema SHALL exibir uma página inicial com os produtos disponíveis
2. THE Sistema SHALL exibir o produto "Mensagem Digital" existente
3. THE Sistema SHALL exibir o novo produto "12 Cartas"
4. WHEN o usuário clica em "12 Cartas", THE Sistema SHALL redirecionar para o editor de 12 Cartas
5. WHEN o usuário clica em "Mensagem Digital", THE Sistema SHALL redirecionar para o editor de mensagem existente
6. THE Sistema SHALL exibir descrição, preço e preview de cada produto

### Requirement 10: Armazenamento e Modelo de Dados

**User Story:** Como desenvolvedor, eu quero um modelo de dados eficiente para armazenar os conjuntos de cartas, para que o sistema seja escalável e performático.

#### Acceptance Criteria

1. THE Sistema SHALL criar uma nova tabela "card_collections" no banco de dados
2. THE Sistema SHALL criar uma nova tabela "cards" no banco de dados
3. THE Sistema SHALL estabelecer relacionamento one-to-many entre "card_collections" e "cards"
4. THE Sistema SHALL armazenar metadados do Conjunto_de_Cartas (id, slug, qr_code_url, status, stripe_session_id)
5. THE Sistema SHALL armazenar dados de cada Carta (id, collection_id, order, title, message, image_url, youtube_url, status, opened_at)
6. THE Sistema SHALL criar índices apropriados para otimizar consultas
7. THE Sistema SHALL garantir integridade referencial entre as tabelas
