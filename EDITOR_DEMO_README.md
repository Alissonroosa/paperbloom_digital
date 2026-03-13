# Editor de Demonstração - Paper Bloom

## 📝 Visão Geral

Foi criada uma página de editor para testar o **fluxo completo end-to-end** do Paper Bloom. Este editor usa o mesmo sistema do editor de mensagens real (`/editor/mensagem`), incluindo:

- ✅ **Upload real de imagens** para o Cloudflare R2
- ✅ **Salvamento no banco de dados** PostgreSQL
- ✅ **Validação completa** de todos os campos
- ✅ **Wizard de 7 passos** com preview em tempo real
- ✅ **Integração com YouTube** API

## 🔗 URLs

- **Editor Demo**: `/editor/demo/message` ou `http://localhost:3000/editor/demo/message`
- **Página Demo**: `/demo/message` ou `http://localhost:3000/demo/message`

## ⚡ Fluxo End-to-End

```
Editor Demo (/editor/demo/message)
    ↓
[Wizard de 7 Passos]
    ↓
[Upload de Imagens → R2]
    ↓
[Salvamento → PostgreSQL]
    ↓
[Dados → localStorage]
    ↓
Demo Page (/demo/message)
    ↓
[Carrega dados do DB + localStorage]
    ↓
[Exibe mensagem real]
```

## ✨ Funcionalidades

O editor usa o **WizardEditor completo** com todos os 7 passos:

### Passo 1: Informações Básicas
- Nome do destinatário
- Nome do remetente
- Mensagem principal (até 500 caracteres)

### Passo 2: Imagem Principal
- Upload de arquivo (JPG, PNG, WebP)
- Preview em tempo real
- Upload automático para R2

### Passo 3: Galeria de Imagens
- Até 3 imagens adicionais
- Upload individual para R2
- Preview de cada imagem

### Passo 4: Música do YouTube
- URL completa do YouTube
- Validação automática
- Extração do ID do vídeo
- Preview do player

### Passo 5: Personalização
- Título da página
- Data especial (date picker)
- Mensagem de encerramento
- Assinatura personalizada

### Passo 6: Informações de Contato
- Nome completo
- Email (validado)
- Telefone (formato brasileiro)

### Passo 7: Preview Final
- Visualização completa da mensagem
- Todos os elementos renderizados
- Botão para criar mensagem demo

## 🎯 Como Usar

### Passo 1: Acessar o Editor
```
http://localhost:3000/editor/demo/message
```

### Passo 2: Preencher o Wizard
Siga os 7 passos do wizard:

1. **Informações Básicas**: Nomes e mensagem
2. **Imagem Principal**: Upload de arquivo
3. **Galeria**: Até 3 imagens adicionais
4. **YouTube**: URL da música
5. **Personalização**: Título, data, assinatura
6. **Contato**: Nome, email, telefone
7. **Preview**: Visualização final

### Passo 3: Criar Mensagem Demo
- Clique em **"Criar Mensagem Demo"**
- Aguarde o upload das imagens
- Aguarde o salvamento no banco de dados

### Passo 4: Visualizar
- Você será automaticamente redirecionado para `/demo/message`
- A página carregará os dados reais do banco de dados
- As imagens virão do R2
- A música tocará do YouTube

## 🔄 Fluxo de Trabalho Detalhado

```
1. Usuário preenche wizard
    ↓
2. Clica em "Criar Mensagem Demo"
    ↓
3. Sistema faz upload das imagens
    ├─ Imagem principal → R2
    └─ Galeria (até 3) → R2
    ↓
4. Sistema cria registro no DB
    ├─ Campos básicos
    ├─ URLs das imagens (R2)
    ├─ URL do YouTube
    └─ Status: pending
    ↓
5. Sistema salva dados no localStorage
    ├─ Textos de introdução
    ├─ Formatação da data
    └─ ID da mensagem
    ↓
6. Redireciona para /demo/message
    ↓
7. Demo page carrega dados
    ├─ Do banco de dados (via localStorage messageId)
    └─ Do localStorage (textos extras)
    ↓
8. Exibe mensagem completa
```

## 💾 Armazenamento

Os dados são salvos localmente no navegador usando `localStorage` com a chave:
```
paperbloom-demo-data
```

Isso significa que:
- ✅ Os dados persistem entre recarregamentos da página
- ✅ Não precisa de backend ou banco de dados
- ⚠️ Os dados são específicos do navegador (não sincronizam entre dispositivos)
- ⚠️ Limpar o cache do navegador apaga os dados

## 🎨 Campos Editáveis

| Campo | Tipo | Exemplo |
|-------|------|---------|
| Primeira Frase | Texto | "Existe algo que só você deveria ver hoje..." |
| Segunda Frase | Texto | "Uma pessoa pensou em você com carinho." |
| Título da Página | Texto | "Feliz Aniversário!" |
| Nome do Destinatário | Texto | "Para o meu amor," |
| Data Especial | Texto | "23 de Novembro, 2024" |
| Mensagem Principal | Textarea | Mensagem longa e emotiva |
| Assinatura | Texto | "Seu Eterno Apaixonado" |
| Imagem Principal | URL | https://images.unsplash.com/... |
| Galeria (6x) | URLs | https://images.unsplash.com/... |
| YouTube ID | Texto | "nSDgHBxUbVQ" |
| Nome da Música | Texto | "Ed Sheeran - Perfect" |

## 🖼️ Dicas para Imagens

### Fontes Recomendadas
- **Unsplash**: https://unsplash.com/ (gratuito, alta qualidade)
- **Pexels**: https://pexels.com/ (gratuito)
- **Pixabay**: https://pixabay.com/ (gratuito)

### Como Obter URL da Imagem
1. Acesse o site de imagens
2. Escolha uma imagem
3. Clique com botão direito → "Copiar endereço da imagem"
4. Cole no campo correspondente

### Formato Recomendado
- Resolução: Mínimo 1920x1080px
- Formato: JPG ou PNG
- Proporção: 16:9 ou 4:3

## 🎵 Dicas para YouTube

### Como Obter o ID do Vídeo
URL completa:
```
https://www.youtube.com/watch?v=nSDgHBxUbVQ
```

ID do vídeo (use apenas isso):
```
nSDgHBxUbVQ
```

### Músicas Românticas Populares
- Ed Sheeran - Perfect: `nSDgHBxUbVQ`
- John Legend - All of Me: `450p7goxZqg`
- Bruno Mars - Just The Way You Are: `LjhCEhWiKXk`

## 🧪 Testando Funcionalidades

### Teste 1: Textos
1. Altere os textos de introdução
2. Salve e visualize
3. Verifique se aparecem na sequência inicial

### Teste 2: Imagens
1. Adicione URLs de imagens diferentes
2. Verifique o preview no editor
3. Visualize a página demo
4. Confirme que as imagens carregam corretamente

### Teste 3: YouTube
1. Altere o ID do vídeo
2. Visualize a página demo
3. Clique no botão de música
4. Confirme que a música correta toca

### Teste 4: Galeria
1. Adicione 6 imagens diferentes
2. Visualize a página demo
3. Role até a galeria
4. Confirme que as imagens rotacionam automaticamente

## 🐛 Troubleshooting

### Imagem não carrega
- ✅ Verifique se a URL está correta
- ✅ Teste a URL diretamente no navegador
- ✅ Certifique-se que a URL começa com `https://`

### Música não toca
- ✅ Verifique se o ID do YouTube está correto
- ✅ Teste o vídeo diretamente no YouTube
- ✅ Alguns vídeos podem ter restrições de incorporação

### Dados não salvam
- ✅ Verifique se o localStorage está habilitado
- ✅ Limpe o cache e tente novamente
- ✅ Verifique o console do navegador para erros

### Alterações não aparecem
- ✅ Certifique-se de clicar em "Salvar"
- ✅ Recarregue a página demo (F5)
- ✅ Limpe o cache do navegador

## 📱 Responsividade

A página demo é totalmente responsiva e funciona em:
- 📱 Mobile (smartphones)
- 📱 Tablet
- 💻 Desktop
- 🖥️ Telas grandes

## 🚀 Próximos Passos

Possíveis melhorias futuras:
- [ ] Upload direto de imagens (sem precisar de URL)
- [ ] Seletor de cores para temas
- [ ] Preview em tempo real no editor
- [ ] Exportar/importar configurações
- [ ] Múltiplos templates de demo
- [ ] Integração com API do Unsplash

## 📞 Suporte

Se encontrar problemas ou tiver sugestões, documente no projeto ou entre em contato com a equipe de desenvolvimento.

---

**Criado para Paper Bloom Digital** 🌸
