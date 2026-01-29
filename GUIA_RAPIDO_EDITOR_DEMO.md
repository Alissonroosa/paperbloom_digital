# 🎨 Guia Rápido - Editor de Demonstração

## Acesso Rápido

**Editor**: http://localhost:3000/editor/demo/message  
**Demo**: http://localhost:3000/demo/message

## ⚡ Fluxo End-to-End Completo

Este editor simula o **processo completo** que os clientes usarão:
- ✅ Upload de imagens para o R2 (Cloudflare)
- ✅ Salvamento no banco de dados PostgreSQL
- ✅ Validação de todos os campos
- ✅ Geração de mensagem real

## Como Usar em 3 Passos

### 1️⃣ Preencher o Formulário
Acesse `/editor/demo/message` e use o wizard completo:
- **Passo 1**: Informações básicas (nomes, mensagem)
- **Passo 2**: Upload de imagem principal
- **Passo 3**: Galeria de imagens (até 3)
- **Passo 4**: Música do YouTube
- **Passo 5**: Personalização (título, data, assinatura)
- **Passo 6**: Informações de contato
- **Passo 7**: Preview final

### 2️⃣ Criar Mensagem Demo
Clique no botão **"Criar Mensagem Demo"** para:
- Fazer upload das imagens para o R2
- Salvar a mensagem no banco de dados
- Gerar dados para a página demo

### 3️⃣ Visualizar
Você será automaticamente redirecionado para `/demo/message` com os dados reais.

## Campos Principais

| Campo | O que é | Exemplo |
|-------|---------|---------|
| **Título da Página** | Título principal | "Feliz Aniversário!" |
| **Nome do Destinatário** | Para quem é | "Para o meu amor," |
| **Mensagem Principal** | Texto emotivo | "Você é especial..." |
| **Imagem Principal** | URL da foto de capa | https://unsplash.com/... |
| **YouTube ID** | ID do vídeo | `nSDgHBxUbVQ` |

## 💡 Diferenças do Editor Normal

| Recurso | Editor Normal | Editor Demo |
|---------|---------------|-------------|
| **Pagamento** | Redireciona para Stripe | Pula pagamento |
| **Destino** | Página de sucesso | Página demo |
| **Slug** | Gerado após pagamento | `demo-{timestamp}` |
| **Dados** | Salvos no DB | Salvos no DB + localStorage |

## 🗄️ O que é Salvo

### No Banco de Dados (PostgreSQL)
- Todos os campos da mensagem
- URLs das imagens (após upload no R2)
- URL do YouTube
- Informações de contato
- Status: `pending` (sem pagamento)

### No localStorage (para demo page)
- Textos de introdução personalizados
- Formatação da data
- ID do vídeo do YouTube
- Nome da música
- ID da mensagem criada

## 🧪 Testando o Fluxo Completo

### Teste 1: Upload de Imagens
1. Faça upload de uma imagem real
2. Verifique que o preview aparece
3. Ao criar a mensagem, a imagem será enviada ao R2
4. A URL do R2 será salva no banco de dados

### Teste 2: Galeria
1. Adicione até 3 imagens na galeria
2. Veja o preview de cada uma
3. Ao criar, todas serão enviadas ao R2
4. As URLs serão salvas como array no DB

### Teste 3: YouTube
1. Cole uma URL completa do YouTube
2. O sistema extrai automaticamente o ID
3. Testa a integração com a API do YouTube
4. Salva a URL no banco de dados

### Teste 4: Validação
1. Tente avançar sem preencher campos obrigatórios
2. Veja as mensagens de erro
3. Corrija os erros
4. Avance para o próximo passo

## 🔍 Verificando os Dados

### No Banco de Dados
```sql
SELECT * FROM messages WHERE slug LIKE 'demo-%' ORDER BY created_at DESC LIMIT 1;
```

### No R2 (Cloudflare)
As imagens estarão em:
```
https://seu-bucket.r2.cloudflarestorage.com/messages/{uuid}/...
```

### No localStorage
Abra o DevTools → Application → Local Storage → `paperbloom-demo-data`

---

**Pronto para testar o fluxo completo!** 🚀
