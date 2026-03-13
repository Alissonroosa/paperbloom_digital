# Como Instalar Stripe CLI no Windows

## Opção 1: Via Scoop (Recomendado - Mais Fácil)

### Passo 1: Instalar Scoop

Abra o PowerShell como **Administrador** e execute:

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
```

### Passo 2: Instalar Stripe CLI

```powershell
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

### Passo 3: Verificar Instalação

```powershell
stripe --version
```

Deve mostrar algo como: `stripe version 1.19.0`

### Passo 4: Fazer Login

```powershell
stripe login
```

Isso vai abrir o navegador para você autorizar.

### Passo 5: Iniciar Webhook

```powershell
stripe listen --forward-to localhost:3000/api/checkout/webhook
```

Copie o `whsec_` que aparece e adicione no `.env.local`

---

## Opção 2: Download Manual

### Passo 1: Baixar

1. Acesse: https://github.com/stripe/stripe-cli/releases/latest
2. Baixe: `stripe_X.X.X_windows_x86_64.zip`
3. Extraia o arquivo

### Passo 2: Adicionar ao PATH

**Método A - Copiar para System32:**
```powershell
# Copie o stripe.exe para:
C:\Windows\System32\stripe.exe
```

**Método B - Adicionar pasta ao PATH:**
1. Crie uma pasta: `C:\stripe`
2. Mova o `stripe.exe` para lá
3. Adicione ao PATH:
   - Pesquise "Variáveis de Ambiente" no Windows
   - Clique em "Variáveis de Ambiente"
   - Em "Variáveis do Sistema", encontre "Path"
   - Clique em "Editar"
   - Clique em "Novo"
   - Adicione: `C:\stripe`
   - Clique em "OK" em todas as janelas

### Passo 3: Reiniciar Terminal

Feche e abra um novo PowerShell/CMD

### Passo 4: Verificar

```powershell
stripe --version
```

### Passo 5: Usar

```powershell
stripe login
stripe listen --forward-to localhost:3000/api/checkout/webhook
```

---

## Opção 3: Testar SEM Instalar (Mais Rápido)

Se você não quer instalar o Stripe CLI agora, pode testar o sistema de duas formas:

### Forma 1: Simulador de Webhook

Execute o script que criei:

```powershell
node simular-webhook.js
```

Este script:
- ✅ Cria uma mensagem
- ✅ Cria sessão de checkout
- ✅ Simula o webhook do Stripe
- ✅ Processa tudo automaticamente
- ✅ Envia email (se configurado)

**IMPORTANTE**: Antes de executar, abra `simular-webhook.js` e mude:
```javascript
contactEmail: 'seu-email@example.com'  // MUDE AQUI!
```

Para seu email real.

### Forma 2: Ferramenta Manual

Use a ferramenta web que criamos:

1. Acesse: `http://localhost:3000/test/update-message-status`
2. Cole o ID de uma mensagem
3. Clique em "Atualizar"

**Nota**: Esta ferramenta NÃO envia email. Apenas atualiza o status e gera QR Code.

---

## Comparação das Opções

| Opção | Vantagens | Desvantagens |
|-------|-----------|--------------|
| **Scoop** | Fácil, automático, atualiza sozinho | Precisa instalar Scoop primeiro |
| **Download Manual** | Controle total | Precisa configurar PATH manualmente |
| **Simulador** | Não precisa instalar nada | Não é o webhook real do Stripe |
| **Ferramenta Manual** | Interface visual | Não envia email |

---

## Recomendação

Para **desenvolvimento local**:
- Use o **Simulador** (`node simular-webhook.js`)
- Rápido e funciona sem instalação

Para **testar webhook real**:
- Instale via **Scoop** (mais fácil)
- Ou faça **Download Manual** se preferir

Para **produção**:
- Configure webhook no Stripe Dashboard
- Não precisa do CLI

---

## Troubleshooting

### "scoop não é reconhecido"

Execute no PowerShell como Administrador:
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
```

### "stripe não é reconhecido" após instalar

1. Feche e abra um novo terminal
2. Verifique se está no PATH:
   ```powershell
   $env:Path -split ';' | Select-String stripe
   ```

### Webhook retorna erro 400

1. Verifique se o `whsec_` está correto no `.env.local`
2. Reinicie o servidor Next.js
3. Execute `stripe listen` novamente

### Email não chega

1. Verifique `RESEND_API_KEY` no `.env.local`
2. Use `onboarding@resend.dev` para testes
3. Veja os logs do servidor Next.js

---

## Próximos Passos

Depois de instalar (ou usar o simulador):

1. ✅ Execute o teste: `node simular-webhook.js`
2. ✅ Ou inicie o webhook: `stripe listen --forward-to localhost:3000/api/checkout/webhook`
3. ✅ Teste o fluxo completo no wizard: `http://localhost:3000/editor/mensagem`
4. ✅ Verifique o email na sua caixa de entrada

---

## Links Úteis

- Stripe CLI Releases: https://github.com/stripe/stripe-cli/releases
- Documentação Stripe CLI: https://stripe.com/docs/stripe-cli
- Scoop: https://scoop.sh/
- Resend: https://resend.com/

---

**Dica**: Se você só quer testar agora, use o simulador! É mais rápido e não precisa instalar nada. 🚀
