# 12 Cartas - Jornada Emocional

## Visão Geral

"12 Cartas" é um produto digital único que permite criar um conjunto de 12 mensagens personalizadas que só podem ser abertas uma única vez cada. É perfeito para presentear alguém especial com uma jornada emocional ao longo do ano.

## Características Principais

- ✨ **12 Cartas Únicas**: Cada carta só pode ser aberta uma vez, criando momentos especiais
- 📝 **Templates Pré-Preenchidos**: Sugestões de conteúdo para facilitar a criação
- 🖼️ **Fotos Personalizadas**: Adicione uma foto em cada carta
- 🎵 **Músicas do YouTube**: Inclua uma música especial em cada carta
- 📱 **Acesso via QR Code**: Compartilhe facilmente via QR code ou link
- 💳 **Pagamento Seguro**: Integração com Stripe
- 📧 **Entrega por Email**: Receba o link e QR code por email após o pagamento

## Como Funciona

### Para o Criador

1. **Selecione o Produto**: Na página inicial, escolha "12 Cartas"
2. **Personalize as Cartas**: Edite cada uma das 12 cartas com:
   - Título personalizado
   - Mensagem (até 500 caracteres)
   - Foto opcional
   - Música do YouTube opcional
3. **Complete o Pagamento**: Finalize via Stripe
4. **Receba o Link**: Você receberá por email o link e QR code para compartilhar

### Para o Destinatário

1. **Acesse o Link**: Use o link ou QR code recebido
2. **Visualize as Cartas**: Veja todas as 12 cartas disponíveis
3. **Abra uma Carta**: Clique em uma carta para abri-la (apenas uma vez!)
4. **Experimente**: Veja a foto, leia a mensagem e ouça a música

## Templates Disponíveis

As 12 cartas vêm com templates pré-preenchidos:

1. "Abra quando... estiver tendo um dia difícil"
2. "Abra quando... estiver se sentindo inseguro(a)"
3. "Abra quando... estivermos longe um do outro"
4. "Abra quando... estiver estressado(a) com o trabalho"
5. "Abra quando... quiser saber o quanto eu te amo"
6. "Abra quando... completarmos mais um ano juntos"
7. "Abra quando... estivermos celebrando uma conquista sua"
8. "Abra quando... for uma noite de chuva e tédio"
9. "Abra quando... tivermos nossa primeira briga boba"
10. "Abra quando... você precisar dar uma risada"
11. "Abra quando... eu tiver feito algo que te irritou"
12. "Abra quando... você não conseguir dormir"

## Estrutura do Projeto

```
src/
├── app/
│   ├── (marketing)/
│   │   └── editor/
│   │       └── 12-cartas/          # Página do editor
│   ├── (fullscreen)/
│   │   └── cartas/
│   │       └── [slug]/             # Página de visualização
│   └── api/
│       ├── card-collections/       # API de conjuntos
│       ├── cards/                  # API de cartas
│       └── checkout/
│           └── card-collection/    # Checkout específico
├── components/
│   ├── card-editor/                # Componentes de edição
│   │   ├── CardCollectionEditor.tsx
│   │   └── CardEditorStep.tsx
│   ├── card-viewer/                # Componentes de visualização
│   │   ├── CardCollectionViewer.tsx
│   │   └── CardModal.tsx
│   └── products/
│       └── ProductSelector.tsx     # Seleção de produtos
├── contexts/
│   └── CardCollectionEditorContext.tsx  # Estado do editor
├── services/
│   ├── CardCollectionService.ts    # Lógica de conjuntos
│   └── CardService.ts              # Lógica de cartas
└── types/
    └── card.ts                     # Tipos TypeScript
```

## Tecnologias Utilizadas

- **Frontend**: React 18, Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **Storage**: Cloudflare R2
- **Payment**: Stripe
- **Email**: Resend
- **Validation**: Zod

## Diferenças entre Produtos

### Mensagem Digital vs 12 Cartas

| Característica | Mensagem Digital | 12 Cartas |
|----------------|------------------|-----------|
| Quantidade | 1 mensagem | 12 cartas |
| Abertura | Ilimitada | Uma vez por carta |
| Templates | Temas visuais | Conteúdo pré-preenchido |
| Galeria de Fotos | Até 7 fotos | 1 foto por carta |
| Música | 1 música | 1 música por carta |
| Experiência | Mensagem única | Jornada ao longo do tempo |
| Preço | R$ 29,90 | R$ 49,90 |

## Documentação Adicional

- [API Routes](./API_ROUTES.md) - Documentação completa das APIs
- [Componentes](./COMPONENTS.md) - Guia dos componentes React
- [Guia do Usuário](./USER_GUIDE.md) - Manual completo para usuários
- [Requirements](./requirements.md) - Requisitos do sistema
- [Design](./design.md) - Documento de design técnico
- [Tasks](./tasks.md) - Plano de implementação

## Desenvolvimento

### Executar Localmente

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local

# Executar migrations
npm run migrate

# Iniciar servidor de desenvolvimento
npm run dev
```

### Executar Testes

```bash
# Testes unitários
npm test

# Testes com coverage
npm run test:coverage

# Testes específicos do produto
npm test -- card
```

## Suporte

Para dúvidas ou problemas:
- Consulte a [documentação completa](./USER_GUIDE.md)
- Verifique os [exemplos de uso](./EXAMPLES.md)
- Entre em contato com o suporte

## Licença

© 2025 Paper Bloom Digital. Todos os direitos reservados.
