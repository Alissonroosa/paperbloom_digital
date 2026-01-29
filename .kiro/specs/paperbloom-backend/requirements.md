# Requirements Document

## Introduction

Este documento especifica os requisitos para o sistema backend do Paper Bloom Digital, uma plataforma de presentes personalizados digitais. O sistema permitirá que usuários criem mensagens personalizadas, processem pagamentos via Stripe, e gerem links únicos com QR codes para compartilhamento das mensagens criadas.

## Glossary

- **Sistema**: O backend do Paper Bloom Digital incluindo API, banco de dados e integrações
- **Usuário**: Pessoa que cria e paga por uma mensagem personalizada
- **Destinatário**: Pessoa que receberá e visualizará a mensagem personalizada
- **Mensagem**: Conteúdo personalizado incluindo texto, imagem, música e metadados
- **Stripe**: Plataforma de processamento de pagamentos integrada ao sistema
- **QR Code**: Código de resposta rápida gerado para acesso à mensagem
- **Slug**: URL amigável no formato /mensagem/{nome_destinatario}/{id_mensagem}
- **PostgreSQL**: Sistema de gerenciamento de banco de dados relacional utilizado
- **Checkout**: Processo de pagamento através do Stripe
- **Session**: Sessão de checkout do Stripe

## Requirements

### Requirement 1

**User Story:** Como usuário, eu quero criar uma mensagem personalizada com todos os detalhes, para que eu possa presentear alguém especial.

#### Acceptance Criteria

1. WHEN um usuário submete dados de uma mensagem THEN o Sistema SHALL validar todos os campos obrigatórios (destinatário, remetente, mensagem)
2. WHEN um usuário faz upload de uma imagem THEN o Sistema SHALL armazenar a imagem e retornar uma URL acessível
3. WHEN um usuário fornece um link do YouTube THEN o Sistema SHALL validar o formato da URL
4. WHEN uma mensagem é criada THEN o Sistema SHALL gerar um ID único para a mensagem
5. WHEN uma mensagem é criada THEN o Sistema SHALL persistir todos os dados no PostgreSQL

### Requirement 2

**User Story:** Como usuário, eu quero pagar pela mensagem usando Stripe, para que minha mensagem seja ativada e compartilhável.

#### Acceptance Criteria

1. WHEN um usuário solicita checkout THEN o Sistema SHALL criar uma sessão de pagamento no Stripe com os dados da mensagem
2. WHEN o Stripe processa um pagamento com sucesso THEN o Sistema SHALL receber o webhook e atualizar o status da mensagem para "pago"
3. WHEN o pagamento é confirmado THEN o Sistema SHALL marcar a mensagem como ativa no banco de dados
4. WHEN o pagamento falha THEN o Sistema SHALL manter a mensagem com status "pendente"
5. WHEN um webhook do Stripe é recebido THEN o Sistema SHALL validar a assinatura do webhook

### Requirement 3

**User Story:** Como usuário, eu quero receber um QR code e um link único após o pagamento, para que eu possa compartilhar a mensagem com o destinatário.

#### Acceptance Criteria

1. WHEN uma mensagem é marcada como paga THEN o Sistema SHALL gerar um slug único no formato /mensagem/{nome_destinatario}/{id_mensagem}
2. WHEN um slug é gerado THEN o Sistema SHALL criar um QR code apontando para a URL completa da mensagem
3. WHEN um QR code é gerado THEN o Sistema SHALL armazenar a imagem do QR code e retornar a URL
4. WHEN o pagamento é confirmado THEN o Sistema SHALL retornar tanto o link quanto a URL do QR code ao usuário
5. WHEN um nome de destinatário contém caracteres especiais THEN o Sistema SHALL normalizar o nome para criar um slug válido

### Requirement 4

**User Story:** Como destinatário, eu quero acessar a mensagem através do link ou QR code, para que eu possa visualizar o conteúdo personalizado.

#### Acceptance Criteria

1. WHEN um destinatário acessa uma URL de mensagem THEN o Sistema SHALL buscar a mensagem pelo slug
2. WHEN uma mensagem existe e está paga THEN o Sistema SHALL retornar todos os dados da mensagem
3. WHEN uma mensagem não existe THEN o Sistema SHALL retornar um erro 404
4. WHEN uma mensagem existe mas não está paga THEN o Sistema SHALL retornar um erro indicando que a mensagem não está disponível
5. WHEN uma mensagem é acessada THEN o Sistema SHALL incrementar o contador de visualizações

### Requirement 5

**User Story:** Como desenvolvedor, eu quero uma API REST bem estruturada, para que o frontend possa interagir facilmente com o backend.

#### Acceptance Criteria

1. WHEN o Sistema recebe uma requisição THEN o Sistema SHALL validar o formato JSON do corpo da requisição
2. WHEN ocorre um erro de validação THEN o Sistema SHALL retornar uma resposta com código HTTP apropriado e mensagem descritiva
3. WHEN uma operação é bem-sucedida THEN o Sistema SHALL retornar código HTTP 200 ou 201 com os dados relevantes
4. WHEN o Sistema processa requisições THEN o Sistema SHALL incluir headers CORS apropriados
5. WHEN o Sistema recebe dados de imagem THEN o Sistema SHALL suportar upload multipart/form-data

### Requirement 6

**User Story:** Como administrador do sistema, eu quero que os dados sejam armazenados de forma segura e estruturada no PostgreSQL, para garantir integridade e persistência.

#### Acceptance Criteria

1. WHEN o Sistema inicia THEN o Sistema SHALL conectar ao PostgreSQL usando as credenciais fornecidas
2. WHEN uma mensagem é criada THEN o Sistema SHALL armazenar timestamps de criação e atualização
3. WHEN dados são persistidos THEN o Sistema SHALL garantir constraints de integridade referencial
4. WHEN uma transação falha THEN o Sistema SHALL realizar rollback automático
5. WHEN o Sistema armazena URLs THEN o Sistema SHALL validar que as URLs são acessíveis

### Requirement 7

**User Story:** Como usuário, eu quero ter uma página de criação de produto intuitiva, para que eu possa personalizar facilmente minha mensagem antes de pagar.

#### Acceptance Criteria

1. WHEN um usuário acessa a página de criação THEN o Sistema SHALL exibir um formulário com todos os campos necessários
2. WHEN um usuário preenche o formulário THEN o Sistema SHALL mostrar preview em tempo real da mensagem
3. WHEN um usuário clica em "Pagar" THEN o Sistema SHALL validar todos os campos antes de redirecionar para o Stripe
4. WHEN o formulário tem erros THEN o Sistema SHALL exibir mensagens de erro específicas para cada campo
5. WHEN o usuário completa o pagamento THEN o Sistema SHALL redirecionar para uma página de sucesso com o QR code e link

### Requirement 8

**User Story:** Como sistema, eu quero processar uploads de imagens de forma eficiente, para que as mensagens possam incluir fotos personalizadas.

#### Acceptance Criteria

1. WHEN um usuário faz upload de uma imagem THEN o Sistema SHALL validar o tipo de arquivo (JPEG, PNG, WebP)
2. WHEN uma imagem é válida THEN o Sistema SHALL redimensionar a imagem se necessário para otimizar performance
3. WHEN uma imagem é processada THEN o Sistema SHALL armazenar a imagem em um local acessível publicamente
4. WHEN o upload falha THEN o Sistema SHALL retornar uma mensagem de erro clara
5. WHEN uma imagem é armazenada THEN o Sistema SHALL gerar uma URL pública para acesso

### Requirement 9

**User Story:** Como sistema, eu quero gerar QR codes de alta qualidade, para que os usuários possam compartilhar facilmente suas mensagens.

#### Acceptance Criteria

1. WHEN um QR code é gerado THEN o Sistema SHALL criar uma imagem PNG com resolução mínima de 300x300 pixels
2. WHEN um QR code é criado THEN o Sistema SHALL incluir a URL completa da mensagem
3. WHEN um QR code é escaneado THEN o Sistema SHALL redirecionar corretamente para a página da mensagem
4. WHEN um QR code é gerado THEN o Sistema SHALL armazenar a imagem e retornar a URL
5. WHEN múltiplos QR codes são gerados THEN o Sistema SHALL garantir nomes de arquivo únicos

### Requirement 10

**User Story:** Como usuário, eu quero que o sistema seja responsivo e rápido, para que eu tenha uma boa experiência ao criar mensagens.

#### Acceptance Criteria

1. WHEN o Sistema processa uma requisição de criação THEN o Sistema SHALL responder em menos de 2 segundos
2. WHEN o Sistema gera um QR code THEN o Sistema SHALL completar a operação em menos de 1 segundo
3. WHEN o Sistema processa upload de imagem THEN o Sistema SHALL aceitar imagens de até 10MB
4. WHEN múltiplas requisições são recebidas THEN o Sistema SHALL processar requisições concorrentemente
5. WHEN o Sistema acessa o banco de dados THEN o Sistema SHALL utilizar connection pooling para otimizar performance
