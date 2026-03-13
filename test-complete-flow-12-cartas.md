# Teste Completo do Fluxo - 12 Cartas

## Objetivo
Validar o fluxo completo do produto "12 Cartas" desde a criação até a visualização pelo destinatário.

## Pré-requisitos
- [ ] Servidor de desenvolvimento rodando (`npm run dev`)
- [ ] Stripe CLI rodando para webhooks (`stripe listen --forward-to localhost:3000/api/checkout/webhook`)
- [ ] Banco de dados acessível
- [ ] Variáveis de ambiente configuradas

## Fluxo de Teste

### 1. Criar Conjunto Completo

**Passos:**
1. Acesse: http://localhost:3000
2. Clique no card "12 Cartas - Jornada Emocional"
3. Você será redirecionado para: http://localhost:3000/editor/12-cartas

**Validações:**
- [ ] Página carrega sem erros
- [ ] Wizard mostra "Carta 1 de 12"
- [ ] Campos estão pré-preenchidos com template
- [ ] Preview mostra o conteúdo da carta

### 2. Editar Todas as Cartas

**Passos:**
1. Para cada carta (1-12):
   - Edite o título (opcional)
   - Edite a mensagem
   - Adicione uma foto (opcional)
   - Adicione uma música do YouTube (opcional)
   - Clique em "Próxima Carta" ou use a navegação

**Validações:**
- [ ] Auto-save funciona (indicador aparece)
- [ ] Navegação entre cartas preserva alterações
- [ ] Preview atualiza em tempo real
- [ ] Validação de 500 caracteres funciona
- [ ] Upload de imagem funciona
- [ ] Validação de URL do YouTube funciona
- [ ] Indicador de progresso mostra cartas editadas

**Dados de Teste Sugeridos:**
- Carta 1: Adicione uma foto e música
- Carta 2: Apenas texto
- Carta 3: Texto + foto
- Carta 4: Texto + música
- Cartas 5-12: Personalize conforme desejar

### 3. Completar Checkout (Modo Test)

**Passos:**
1. Após editar todas as cartas, clique em "Finalizar e Pagar"
2. Você será redirecionado para o Stripe Checkout
3. Use os dados de teste do Stripe:
   - **Cartão:** 4242 4242 4242 4242
   - **Data:** Qualquer data futura (ex: 12/25)
   - **CVC:** Qualquer 3 dígitos (ex: 123)
   - **Email:** Seu email real para receber o link
   - **Nome:** Qualquer nome

**Validações:**
- [ ] Checkout abre corretamente
- [ ] Preço está correto (R$ 49,90)
- [ ] Produto "12 Cartas" está listado
- [ ] Após pagamento, redireciona para página de sucesso

### 4. Webhook e Processamento

**Passos:**
1. Aguarde alguns segundos após o pagamento
2. Verifique o terminal do Stripe CLI
3. Verifique o terminal do Next.js

**Validações:**
- [ ] Webhook recebido (log no Stripe CLI)
- [ ] Evento `checkout.session.completed` processado
- [ ] Slug gerado para o conjunto
- [ ] QR Code gerado
- [ ] Status atualizado para "paid"
- [ ] Logs no terminal mostram sucesso

### 5. Receber Email com Link

**Passos:**
1. Verifique seu email (o usado no checkout)
2. Procure por email de "Paper Bloom"

**Validações:**
- [ ] Email recebido
- [ ] Assunto: "Suas 12 Cartas estão prontas! 💌"
- [ ] Email contém link para visualização
- [ ] Email contém QR Code anexado
- [ ] Link está no formato: `http://localhost:3000/cartas/[slug]`
- [ ] Design do email está correto

### 6. Acessar Página de Visualização

**Passos:**
1. Clique no link do email OU
2. Acesse manualmente: `http://localhost:3000/cartas/[slug]`

**Validações:**
- [ ] Página carrega sem erros
- [ ] Título mostra "12 Cartas para [Nome do Destinatário]"
- [ ] Mensagem do remetente aparece
- [ ] Grid com 12 cartas é exibido
- [ ] Todas as cartas mostram status "fechada" (ícone de envelope)
- [ ] Títulos das cartas são visíveis
- [ ] Design responsivo funciona

### 7. Abrir Algumas Cartas

**Passos:**
1. Clique na Carta 1
2. Confirme a abertura no modal de confirmação
3. Visualize o conteúdo completo
4. Feche o modal
5. Repita para Cartas 2, 3 e 4

**Validações para cada abertura:**
- [ ] Modal de confirmação aparece
- [ ] Mensagem de aviso sobre abertura única
- [ ] Após confirmar, modal de conteúdo abre
- [ ] Animação de abertura (emojis caindo)
- [ ] Título da carta exibido
- [ ] Mensagem completa exibida
- [ ] Foto exibida (se houver)
- [ ] Música toca automaticamente (se houver)
- [ ] Player do YouTube funciona
- [ ] Botão "Fechar" funciona

### 8. Verificar Bloqueio de Cartas Abertas

**Passos:**
1. Após fechar o modal da Carta 1
2. Tente clicar na Carta 1 novamente
3. Recarregue a página
4. Tente abrir a Carta 1 novamente

**Validações:**
- [ ] Carta 1 mostra status "aberta" (ícone diferente)
- [ ] Ao clicar, modal de aviso aparece
- [ ] Mensagem: "Esta carta já foi aberta"
- [ ] Conteúdo completo NÃO é exibido
- [ ] Após reload, status persiste
- [ ] Cartas 2, 3, 4 também mostram status "aberta"
- [ ] Cartas 5-12 ainda mostram status "fechada"

### 9. Testes Adicionais

**Navegação:**
- [ ] Voltar para home e criar outro conjunto
- [ ] Acessar link de conjunto inexistente (404)
- [ ] Acessar sem slug (erro apropriado)

**Responsividade:**
- [ ] Testar em mobile (DevTools)
- [ ] Grid de cartas se adapta
- [ ] Modal funciona em mobile
- [ ] Preview funciona em mobile

**Performance:**
- [ ] Carregamento de imagens é rápido
- [ ] Navegação entre cartas é fluida
- [ ] Auto-save não trava a UI
- [ ] Abertura de cartas é instantânea

## Problemas Encontrados

### Durante Criação/Edição:
```
[Anote aqui qualquer problema encontrado]
```

### Durante Checkout:
```
[Anote aqui qualquer problema encontrado]
```

### Durante Visualização:
```
[Anote aqui qualquer problema encontrado]
```

### Durante Abertura de Cartas:
```
[Anote aqui qualquer problema encontrado]
```

## Checklist Final

- [ ] Fluxo completo funciona sem erros
- [ ] Todos os dados persistem corretamente
- [ ] Email é enviado e recebido
- [ ] Cartas só podem ser abertas uma vez
- [ ] UI/UX está intuitiva
- [ ] Performance é aceitável
- [ ] Responsividade funciona
- [ ] Validações funcionam corretamente

## Próximos Passos

Após completar este teste, responda:
1. Todos os itens foram validados com sucesso?
2. Há algum ajuste necessário?
3. Alguma funcionalidade não está funcionando como esperado?
4. A experiência do usuário está satisfatória?

---

**Data do Teste:** _______________
**Testado por:** _______________
**Status:** [ ] Aprovado [ ] Necessita ajustes
