# 🖼️ Testar Upload de Imagens - Guia Rápido

## ⚡ Teste Rápido (2 minutos)

### 1. Executar teste automatizado
```bash
node testar-upload-imagem.js
```

**Resultado esperado**: 🎉 TODOS OS TESTES PASSARAM!

---

## 🖥️ Teste Manual Completo (5 minutos)

### 1. Iniciar servidor de desenvolvimento
```bash
npm run dev
```

### 2. Abrir o editor
```
http://localhost:3000/editor/12-cartas
```

### 3. Preencher Step 1 - Mensagem Inicial

**De**: João  
**Para**: Maria  

Clicar em "Próximo"

### 4. Adicionar foto em uma carta

1. **Clicar** no botão "Adicionar Foto" em qualquer carta
2. **Selecionar** uma imagem do seu computador
   - Formatos aceitos: JPEG, PNG, WebP
   - Tamanho máximo: 5MB
3. **Verificar** prévia da imagem no modal
4. **Clicar** em "Salvar"

### 5. Verificar se a foto foi salva

A carta deve mostrar:
- ✅ Miniatura da foto
- ✅ Botão "Editar Foto" (ao invés de "Adicionar Foto")

### 6. Verificar console do navegador

Deve mostrar:
```javascript
[Context] updateCard called with: {
  cardId: "...",
  data: {
    imageUrl: "https://imagem.paperbloom.com.br/images/uuid.jpg"
  }
}
```

### 7. Verificar banco de dados (opcional)

```bash
node testar-upload-imagem.js
```

Ou consultar diretamente:
```sql
SELECT id, title, image_url 
FROM cards 
WHERE collection_id = 'uuid-da-colecao'
ORDER BY "order";
```

### 8. Completar o fluxo (opcional)

1. Preencher as 12 cartas
2. Preencher dados de envio no Step 5
3. Clicar em "Ir para Pagamento"
4. Usar cartão de teste do Stripe:
   - Número: `4242 4242 4242 4242`
   - Data: qualquer data futura
   - CVC: qualquer 3 dígitos
5. Após pagamento, abrir o link recebido por email
6. **Verificar**: As fotos devem aparecer nas cartas! 🖼️

---

## 🔍 Verificações Importantes

### ✅ Checklist de Sucesso

- [ ] Modal de upload abre corretamente
- [ ] Imagem pode ser selecionada (clique ou drag-and-drop)
- [ ] Prévia da imagem aparece no modal
- [ ] Botão "Salvar" funciona
- [ ] Miniatura aparece na carta após salvar
- [ ] Console mostra logs de atualização
- [ ] Banco de dados tem `image_url` preenchido
- [ ] Página de visualização mostra a foto

### ❌ Se algo não funcionar

1. **Modal não abre**:
   - Verificar se o botão "Adicionar Foto" está visível
   - Verificar console por erros JavaScript

2. **Imagem não é aceita**:
   - Verificar formato (JPEG, PNG ou WebP)
   - Verificar tamanho (máximo 5MB)
   - Verificar mensagem de erro no modal

3. **Upload falha**:
   - Verificar console do navegador
   - Verificar console do servidor (terminal)
   - Verificar se a rota `/api/upload/card-image` está respondendo

4. **Imagem não salva**:
   - Executar: `node testar-upload-imagem.js`
   - Verificar se o campo `image_url` existe na tabela `cards`
   - Verificar logs no console

5. **Imagem não aparece na visualização**:
   - Verificar se a URL está correta no banco
   - Verificar se a URL é acessível: abrir no navegador
   - Verificar console por erros de CORS

---

## 🎯 Imagens de Teste Recomendadas

### Tamanhos Variados
- **Pequena**: 500x500 pixels (~100KB)
- **Média**: 1000x1000 pixels (~500KB)
- **Grande**: 2000x2000 pixels (~2MB)

### Formatos
- ✅ JPEG: Fotos, imagens com muitas cores
- ✅ PNG: Imagens com transparência, logos
- ✅ WebP: Formato moderno, boa compressão

### Onde Encontrar
- Unsplash: https://unsplash.com (fotos gratuitas)
- Pexels: https://pexels.com (fotos gratuitas)
- Suas próprias fotos

---

## 📊 Comandos Úteis

### Verificar última carta com imagem
```bash
node testar-upload-imagem.js
```

### Verificar todas as cartas de uma coleção
```sql
SELECT 
  "order",
  title,
  CASE 
    WHEN image_url IS NOT NULL THEN '✅ Tem foto'
    ELSE '❌ Sem foto'
  END as status_foto
FROM cards
WHERE collection_id = 'uuid-da-colecao'
ORDER BY "order";
```

### Remover todas as fotos de uma coleção (teste)
```sql
UPDATE cards
SET image_url = NULL
WHERE collection_id = 'uuid-da-colecao';
```

---

## 🎨 Funcionalidades do Upload

### Validações Automáticas
- ✅ Tipo de arquivo (JPEG, PNG, WebP)
- ✅ Tamanho máximo (5MB)
- ✅ Redimensionamento automático (máx 1920x1920)

### Interface
- ✅ Drag and drop
- ✅ Prévia da imagem
- ✅ Indicador de progresso
- ✅ Mensagens de erro claras
- ✅ Confirmação ao cancelar

### Gerenciamento
- ✅ Adicionar foto
- ✅ Editar foto (trocar)
- ✅ Remover foto
- ✅ Prévia antes de salvar

---

## 🎉 Resultado Esperado

Após seguir todos os passos, você deve ter:

1. ✅ Fotos adicionadas em uma ou mais cartas
2. ✅ Miniaturas visíveis no editor
3. ✅ URLs salvas no banco de dados
4. ✅ Fotos aparecendo na página de visualização

**Tudo funcionando?** 🖼️ Parabéns! O upload de imagens está perfeito! 🎉

---

## 💡 Dicas

1. **Use fotos de alta qualidade**: Elas serão redimensionadas automaticamente
2. **Teste diferentes formatos**: JPEG para fotos, PNG para logos
3. **Verifique o tamanho**: Máximo 5MB por imagem
4. **Use drag-and-drop**: É mais rápido que clicar
5. **Prévia antes de salvar**: Sempre verifique se é a foto certa

**Aproveite para criar cartas ainda mais especiais com fotos!** 📸✨
