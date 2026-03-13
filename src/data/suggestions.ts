/**
 * Text Suggestions
 * 
 * Suggestions provide pre-written text options that users can select and customize.
 * Organized by category and field type to help users overcome creative blocks.
 */

export type SuggestionCategory = 
  | 'romantico' 
  | 'amigavel' 
  | 'formal' 
  | 'casual';

export type SuggestionField = 'title' | 'message' | 'closing';

export interface TextSuggestion {
  id: string;
  category: SuggestionCategory;
  field: SuggestionField;
  text: string;
  tags: string[];
}

export const TEXT_SUGGESTIONS: TextSuggestion[] = [
  // Title Suggestions - Romântico
  {
    id: 'title-romantico-1',
    category: 'romantico',
    field: 'title',
    text: 'Para o Amor da Minha Vida',
    tags: ['amor', 'romântico', 'declaração'],
  },
  {
    id: 'title-romantico-2',
    category: 'romantico',
    field: 'title',
    text: 'Meu Coração é Seu',
    tags: ['amor', 'romântico', 'declaração'],
  },
  {
    id: 'title-romantico-3',
    category: 'romantico',
    field: 'title',
    text: 'Te Amo Infinitamente',
    tags: ['amor', 'romântico', 'declaração'],
  },
  {
    id: 'title-romantico-4',
    category: 'romantico',
    field: 'title',
    text: 'Você é Meu Tudo',
    tags: ['amor', 'romântico', 'declaração'],
  },
  {
    id: 'title-romantico-5',
    category: 'romantico',
    field: 'title',
    text: 'Eternamente Seu',
    tags: ['amor', 'romântico', 'compromisso'],
  },

  // Title Suggestions - Amigável
  {
    id: 'title-amigavel-1',
    category: 'amigavel',
    field: 'title',
    text: 'Para Meu Melhor Amigo',
    tags: ['amizade', 'carinho'],
  },
  {
    id: 'title-amigavel-2',
    category: 'amigavel',
    field: 'title',
    text: 'Obrigado por Tudo',
    tags: ['amizade', 'gratidão'],
  },
  {
    id: 'title-amigavel-3',
    category: 'amigavel',
    field: 'title',
    text: 'Você é Especial',
    tags: ['amizade', 'carinho', 'reconhecimento'],
  },
  {
    id: 'title-amigavel-4',
    category: 'amigavel',
    field: 'title',
    text: 'Amigos Para Sempre',
    tags: ['amizade', 'compromisso'],
  },
  {
    id: 'title-amigavel-5',
    category: 'amigavel',
    field: 'title',
    text: 'Celebrando Nossa Amizade',
    tags: ['amizade', 'celebração'],
  },

  // Title Suggestions - Formal
  {
    id: 'title-formal-1',
    category: 'formal',
    field: 'title',
    text: 'Com Gratidão e Respeito',
    tags: ['formal', 'gratidão', 'profissional'],
  },
  {
    id: 'title-formal-2',
    category: 'formal',
    field: 'title',
    text: 'Agradecimento Sincero',
    tags: ['formal', 'gratidão'],
  },
  {
    id: 'title-formal-3',
    category: 'formal',
    field: 'title',
    text: 'Parabéns pela Conquista',
    tags: ['formal', 'reconhecimento', 'profissional'],
  },
  {
    id: 'title-formal-4',
    category: 'formal',
    field: 'title',
    text: 'Em Reconhecimento',
    tags: ['formal', 'reconhecimento'],
  },
  {
    id: 'title-formal-5',
    category: 'formal',
    field: 'title',
    text: 'Com Apreço',
    tags: ['formal', 'gratidão'],
  },

  // Title Suggestions - Casual
  {
    id: 'title-casual-1',
    category: 'casual',
    field: 'title',
    text: 'Oi, Você!',
    tags: ['casual', 'descontraído'],
  },
  {
    id: 'title-casual-2',
    category: 'casual',
    field: 'title',
    text: 'Pensando em Você',
    tags: ['casual', 'carinho'],
  },
  {
    id: 'title-casual-3',
    category: 'casual',
    field: 'title',
    text: 'Só Passando Pra Dizer...',
    tags: ['casual', 'descontraído'],
  },
  {
    id: 'title-casual-4',
    category: 'casual',
    field: 'title',
    text: 'Você Merece!',
    tags: ['casual', 'reconhecimento'],
  },
  {
    id: 'title-casual-5',
    category: 'casual',
    field: 'title',
    text: 'Um Recado Especial',
    tags: ['casual', 'carinho'],
  },

  // Message Suggestions - Romântico
  {
    id: 'message-romantico-1',
    category: 'romantico',
    field: 'message',
    text: 'Desde que você entrou na minha vida, tudo mudou. Você me faz querer ser uma pessoa melhor a cada dia. Obrigado por existir e por me fazer tão feliz.',
    tags: ['amor', 'romântico', 'declaração'],
  },
  {
    id: 'message-romantico-2',
    category: 'romantico',
    field: 'message',
    text: 'Não existem palavras suficientes para descrever o que sinto por você. Cada momento ao seu lado é um presente, cada sorriso seu ilumina meu dia. Te amo mais do que tudo.',
    tags: ['amor', 'romântico', 'declaração'],
  },
  {
    id: 'message-romantico-3',
    category: 'romantico',
    field: 'message',
    text: 'Você é a razão do meu sorriso, a paz nos meus dias difíceis, a alegria nos momentos felizes. Não consigo imaginar minha vida sem você.',
    tags: ['amor', 'romântico', 'declaração'],
  },
  {
    id: 'message-romantico-4',
    category: 'romantico',
    field: 'message',
    text: 'A distância pode nos separar fisicamente, mas meu coração está sempre com você. Cada dia longe é uma lembrança de como você é especial na minha vida.',
    tags: ['amor', 'romântico', 'saudade', 'distância'],
  },
  {
    id: 'message-romantico-5',
    category: 'romantico',
    field: 'message',
    text: 'Com você aprendi o verdadeiro significado do amor. Você me completa de uma forma que eu nunca imaginei ser possível. Obrigado por me amar como sou.',
    tags: ['amor', 'romântico', 'gratidão'],
  },

  // Message Suggestions - Amigável
  {
    id: 'message-amigavel-1',
    category: 'amigavel',
    field: 'message',
    text: 'Amizade verdadeira é um tesouro raro, e eu tenho a sorte de ter você na minha vida. Obrigado por estar sempre presente, por me ouvir e me apoiar em todos os momentos.',
    tags: ['amizade', 'gratidão'],
  },
  {
    id: 'message-amigavel-2',
    category: 'amigavel',
    field: 'message',
    text: 'Você é aquele amigo que conhece meus defeitos e me ama mesmo assim. Que está presente nos momentos bons e ruins. Nossa amizade é um dos meus maiores tesouros.',
    tags: ['amizade', 'carinho'],
  },
  {
    id: 'message-amigavel-3',
    category: 'amigavel',
    field: 'message',
    text: 'Obrigado por todas as risadas, todas as conversas até tarde, todos os conselhos. Você faz minha vida muito melhor só por estar nela.',
    tags: ['amizade', 'gratidão'],
  },
  {
    id: 'message-amigavel-4',
    category: 'amigavel',
    field: 'message',
    text: 'Sei que você está passando por um momento difícil, e quero que saiba que não está sozinho. Estou aqui para o que você precisar, sempre.',
    tags: ['amizade', 'apoio', 'solidariedade'],
  },
  {
    id: 'message-amigavel-5',
    category: 'amigavel',
    field: 'message',
    text: 'A distância física não muda nada entre nós. Você pode estar longe, mas está sempre no meu coração. Mal posso esperar para nos vermos novamente!',
    tags: ['amizade', 'saudade', 'distância'],
  },

  // Message Suggestions - Formal
  {
    id: 'message-formal-1',
    category: 'formal',
    field: 'message',
    text: 'Gostaria de expressar meu sincero agradecimento pela excelente parceria e colaboração. Seu profissionalismo e dedicação foram fundamentais para o sucesso que alcançamos.',
    tags: ['formal', 'gratidão', 'profissional'],
  },
  {
    id: 'message-formal-2',
    category: 'formal',
    field: 'message',
    text: 'Quero expressar minha profunda gratidão por tudo que você fez. Sua generosidade e apoio fizeram toda a diferença. Pessoas como você tornam o mundo um lugar melhor.',
    tags: ['formal', 'gratidão'],
  },
  {
    id: 'message-formal-3',
    category: 'formal',
    field: 'message',
    text: 'Parabéns por esta conquista tão merecida. Sua dedicação, esforço e competência são admiráveis. Tenho certeza de que este é apenas o começo de muitas outras realizações.',
    tags: ['formal', 'reconhecimento', 'parabéns'],
  },
  {
    id: 'message-formal-4',
    category: 'formal',
    field: 'message',
    text: 'É com grande satisfação que reconheço seu excelente trabalho e contribuição. Seu comprometimento e qualidade são exemplares e dignos de reconhecimento.',
    tags: ['formal', 'reconhecimento', 'profissional'],
  },
  {
    id: 'message-formal-5',
    category: 'formal',
    field: 'message',
    text: 'Agradeço imensamente pela oportunidade de trabalhar ao seu lado. Aprendi muito com você e levarei esses ensinamentos para sempre.',
    tags: ['formal', 'gratidão', 'profissional'],
  },

  // Message Suggestions - Casual
  {
    id: 'message-casual-1',
    category: 'casual',
    field: 'message',
    text: 'Só queria te dizer que você é incrível! Continue sendo essa pessoa maravilhosa que ilumina a vida de todo mundo ao redor.',
    tags: ['casual', 'carinho', 'reconhecimento'],
  },
  {
    id: 'message-casual-2',
    category: 'casual',
    field: 'message',
    text: 'Estava pensando em você e resolvi mandar essa mensagem. Você faz falta! Vamos marcar algo em breve?',
    tags: ['casual', 'saudade', 'amizade'],
  },
  {
    id: 'message-casual-3',
    category: 'casual',
    field: 'message',
    text: 'Você merece tudo de bom que está acontecendo na sua vida! Fico muito feliz por você. Bora comemorar?',
    tags: ['casual', 'celebração', 'felicidade'],
  },
  {
    id: 'message-casual-4',
    category: 'casual',
    field: 'message',
    text: 'Obrigado por ser essa pessoa incrível! Você sempre sabe como me fazer rir e me animar. Você é demais!',
    tags: ['casual', 'gratidão', 'amizade'],
  },
  {
    id: 'message-casual-5',
    category: 'casual',
    field: 'message',
    text: 'Ei, só passando pra dizer que você é muito importante pra mim. Valeu por tudo, de verdade!',
    tags: ['casual', 'carinho', 'gratidão'],
  },

  // Closing Suggestions - Romântico
  {
    id: 'closing-romantico-1',
    category: 'romantico',
    field: 'closing',
    text: 'Te amo hoje, amanhã e sempre. Para todo o sempre.',
    tags: ['amor', 'romântico', 'compromisso'],
  },
  {
    id: 'closing-romantico-2',
    category: 'romantico',
    field: 'closing',
    text: 'Você é e sempre será o amor da minha vida.',
    tags: ['amor', 'romântico', 'declaração'],
  },
  {
    id: 'closing-romantico-3',
    category: 'romantico',
    field: 'closing',
    text: 'Meu coração é seu, hoje e para sempre.',
    tags: ['amor', 'romântico', 'compromisso'],
  },
  {
    id: 'closing-romantico-4',
    category: 'romantico',
    field: 'closing',
    text: 'Te amo mais do que ontem, menos do que amanhã.',
    tags: ['amor', 'romântico', 'declaração'],
  },
  {
    id: 'closing-romantico-5',
    category: 'romantico',
    field: 'closing',
    text: 'Obrigado por me fazer tão feliz. Te amo infinitamente.',
    tags: ['amor', 'romântico', 'gratidão'],
  },

  // Closing Suggestions - Amigável
  {
    id: 'closing-amigavel-1',
    category: 'amigavel',
    field: 'closing',
    text: 'Conte sempre comigo. Amigos para sempre!',
    tags: ['amizade', 'apoio'],
  },
  {
    id: 'closing-amigavel-2',
    category: 'amigavel',
    field: 'closing',
    text: 'Nossa amizade é para sempre. Você é família que eu escolhi!',
    tags: ['amizade', 'carinho'],
  },
  {
    id: 'closing-amigavel-3',
    category: 'amigavel',
    field: 'closing',
    text: 'Obrigado por ser esse amigo incrível. Você é demais!',
    tags: ['amizade', 'gratidão'],
  },
  {
    id: 'closing-amigavel-4',
    category: 'amigavel',
    field: 'closing',
    text: 'Que nossa amizade dure para sempre. Te adoro!',
    tags: ['amizade', 'carinho'],
  },
  {
    id: 'closing-amigavel-5',
    category: 'amigavel',
    field: 'closing',
    text: 'Você faz minha vida melhor. Obrigado por existir!',
    tags: ['amizade', 'gratidão'],
  },

  // Closing Suggestions - Formal
  {
    id: 'closing-formal-1',
    category: 'formal',
    field: 'closing',
    text: 'Com gratidão e os melhores votos de sucesso.',
    tags: ['formal', 'gratidão'],
  },
  {
    id: 'closing-formal-2',
    category: 'formal',
    field: 'closing',
    text: 'Atenciosamente, com apreço e respeito.',
    tags: ['formal', 'respeito'],
  },
  {
    id: 'closing-formal-3',
    category: 'formal',
    field: 'closing',
    text: 'Espero que possamos continuar esta parceria de sucesso.',
    tags: ['formal', 'profissional'],
  },
  {
    id: 'closing-formal-4',
    category: 'formal',
    field: 'closing',
    text: 'Serei eternamente grato por sua contribuição.',
    tags: ['formal', 'gratidão'],
  },
  {
    id: 'closing-formal-5',
    category: 'formal',
    field: 'closing',
    text: 'Com reconhecimento e admiração pelo seu trabalho.',
    tags: ['formal', 'reconhecimento'],
  },

  // Closing Suggestions - Casual
  {
    id: 'closing-casual-1',
    category: 'casual',
    field: 'closing',
    text: 'Valeu por tudo! Você é incrível!',
    tags: ['casual', 'gratidão'],
  },
  {
    id: 'closing-casual-2',
    category: 'casual',
    field: 'closing',
    text: 'Bora marcar algo em breve? Saudades!',
    tags: ['casual', 'amizade'],
  },
  {
    id: 'closing-casual-3',
    category: 'casual',
    field: 'closing',
    text: 'Você é demais! Continue sendo assim!',
    tags: ['casual', 'reconhecimento'],
  },
  {
    id: 'closing-casual-4',
    category: 'casual',
    field: 'closing',
    text: 'Obrigado por tudo! Você faz diferença!',
    tags: ['casual', 'gratidão'],
  },
  {
    id: 'closing-casual-5',
    category: 'casual',
    field: 'closing',
    text: 'Te adoro! Até logo!',
    tags: ['casual', 'carinho'],
  },
];

/**
 * Get suggestions by field
 */
export function getSuggestionsByField(field: SuggestionField): TextSuggestion[] {
  return TEXT_SUGGESTIONS.filter(suggestion => suggestion.field === field);
}

/**
 * Get suggestions by category
 */
export function getSuggestionsByCategory(category: SuggestionCategory): TextSuggestion[] {
  return TEXT_SUGGESTIONS.filter(suggestion => suggestion.category === category);
}

/**
 * Get suggestions by field and category
 */
export function getSuggestionsByFieldAndCategory(
  field: SuggestionField,
  category: SuggestionCategory
): TextSuggestion[] {
  return TEXT_SUGGESTIONS.filter(
    suggestion => suggestion.field === field && suggestion.category === category
  );
}

/**
 * Get suggestion by ID
 */
export function getSuggestionById(id: string): TextSuggestion | undefined {
  return TEXT_SUGGESTIONS.find(suggestion => suggestion.id === id);
}

/**
 * Get all categories
 */
export function getAllSuggestionCategories(): SuggestionCategory[] {
  return ['romantico', 'amigavel', 'formal', 'casual'];
}
