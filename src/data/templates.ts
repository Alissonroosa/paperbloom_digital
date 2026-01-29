/**
 * Message Templates
 * 
 * Templates provide pre-defined structures for different message occasions.
 * Each template includes default content for title, message, closing, and signature.
 */

export type TemplateCategory = 
  | 'aniversario' 
  | 'amor' 
  | 'amizade' 
  | 'gratidao' 
  | 'parabens';

export interface MessageTemplate {
  id: string;
  category: TemplateCategory;
  name: string;
  description: string;
  thumbnail: string;
  fields: {
    title: string;
    message: string;
    closing: string;
    signature: string;
  };
}

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  // Aniversário Templates
  {
    id: 'aniversario-romantico',
    category: 'aniversario',
    name: 'Aniversário Romântico',
    description: 'Perfeito para celebrar o aniversário de alguém especial com amor',
    thumbnail: '/templates/aniversario-romantico.jpg',
    fields: {
      title: 'Feliz Aniversário, Meu Amor!',
      message: 'Hoje é um dia especial, o dia em que a pessoa mais incrível que conheço veio ao mundo. Cada momento ao seu lado é um presente, e quero celebrar não apenas este dia, mas todos os dias que temos juntos.',
      closing: 'Que este novo ano seja repleto de alegrias, realizações e muito amor. Você merece tudo de melhor!',
      signature: 'Com todo meu amor',
    },
  },
  {
    id: 'aniversario-amigo',
    category: 'aniversario',
    name: 'Aniversário de Amigo',
    description: 'Celebre o aniversário de um grande amigo',
    thumbnail: '/templates/aniversario-amigo.jpg',
    fields: {
      title: 'Feliz Aniversário, Amigão!',
      message: 'Hoje é dia de celebrar você! Obrigado por ser esse amigo incrível, sempre presente nos momentos bons e nos desafiadores. Nossa amizade é um dos meus maiores tesouros.',
      closing: 'Que seu novo ano seja cheio de conquistas, risadas e momentos inesquecíveis!',
      signature: 'Seu amigo para sempre',
    },
  },

  // Amor Templates
  {
    id: 'amor-declaracao',
    category: 'amor',
    name: 'Declaração de Amor',
    description: 'Expresse seus sentimentos mais profundos',
    thumbnail: '/templates/amor-declaracao.jpg',
    fields: {
      title: 'Para o Amor da Minha Vida',
      message: 'Não existem palavras suficientes para descrever o que sinto por você. Você transformou minha vida de uma forma que eu nunca imaginei ser possível. Cada dia ao seu lado é uma nova descoberta, um novo motivo para sorrir.',
      closing: 'Te amo mais do que ontem, menos do que amanhã. Para sempre.',
      signature: 'Eternamente seu',
    },
  },
  {
    id: 'amor-saudade',
    category: 'amor',
    name: 'Mensagem de Saudade',
    description: 'Para quando a distância aperta o coração',
    thumbnail: '/templates/amor-saudade.jpg',
    fields: {
      title: 'Morrendo de Saudades',
      message: 'A distância pode nos separar fisicamente, mas meu coração está sempre com você. Cada momento longe é uma lembrança de como você é especial e importante na minha vida. Conto os dias para te ver novamente.',
      closing: 'Logo estaremos juntos novamente. Até lá, você está em cada pensamento meu.',
      signature: 'Com amor e saudade',
    },
  },

  // Amizade Templates
  {
    id: 'amizade-agradecimento',
    category: 'amizade',
    name: 'Agradecimento ao Amigo',
    description: 'Agradeça por ter um amigo especial',
    thumbnail: '/templates/amizade-agradecimento.jpg',
    fields: {
      title: 'Obrigado por Ser Meu Amigo',
      message: 'Amizade verdadeira é um tesouro raro, e eu tenho a sorte de ter você na minha vida. Obrigado por estar sempre presente, por me ouvir, me apoiar e me fazer rir mesmo nos dias mais difíceis.',
      closing: 'Nossa amizade é para sempre. Conte sempre comigo!',
      signature: 'Seu amigo de coração',
    },
  },
  {
    id: 'amizade-apoio',
    category: 'amizade',
    name: 'Mensagem de Apoio',
    description: 'Apoie um amigo em momento difícil',
    thumbnail: '/templates/amizade-apoio.jpg',
    fields: {
      title: 'Estou Aqui Por Você',
      message: 'Sei que você está passando por um momento difícil, e quero que saiba que não está sozinho. Estou aqui para o que você precisar, seja para conversar, para um abraço, ou apenas para estar ao seu lado em silêncio.',
      closing: 'Dias melhores virão. Até lá, conte comigo sempre.',
      signature: 'Com carinho e amizade',
    },
  },

  // Gratidão Templates
  {
    id: 'gratidao-geral',
    category: 'gratidao',
    name: 'Gratidão Sincera',
    description: 'Expresse sua gratidão de coração',
    thumbnail: '/templates/gratidao-geral.jpg',
    fields: {
      title: 'Muito Obrigado!',
      message: 'Quero expressar minha profunda gratidão por tudo que você fez por mim. Sua generosidade, bondade e apoio fizeram toda a diferença. Pessoas como você tornam o mundo um lugar melhor.',
      closing: 'Serei eternamente grato por ter você na minha vida.',
      signature: 'Com gratidão',
    },
  },
  {
    id: 'gratidao-profissional',
    category: 'gratidao',
    name: 'Agradecimento Profissional',
    description: 'Agradeça de forma profissional e calorosa',
    thumbnail: '/templates/gratidao-profissional.jpg',
    fields: {
      title: 'Obrigado pela Parceria',
      message: 'Gostaria de expressar meu sincero agradecimento pela excelente parceria e colaboração. Seu profissionalismo, dedicação e comprometimento foram fundamentais para o sucesso que alcançamos juntos.',
      closing: 'Espero que possamos continuar trabalhando juntos em futuros projetos.',
      signature: 'Com apreço e respeito',
    },
  },

  // Parabéns Templates
  {
    id: 'parabens-conquista',
    category: 'parabens',
    name: 'Parabéns por Conquista',
    description: 'Celebre uma conquista importante',
    thumbnail: '/templates/parabens-conquista.jpg',
    fields: {
      title: 'Parabéns pela Conquista!',
      message: 'Você conseguiu! Sua dedicação, esforço e perseverança finalmente foram recompensados. Esta conquista é mais do que merecida, e estou muito orgulhoso de você. Continue brilhando!',
      closing: 'Este é apenas o começo de muitas outras conquistas. Você é capaz de tudo!',
      signature: 'Com admiração',
    },
  },
  {
    id: 'parabens-formatura',
    category: 'parabens',
    name: 'Parabéns pela Formatura',
    description: 'Celebre a conclusão de uma etapa importante',
    thumbnail: '/templates/parabens-formatura.jpg',
    fields: {
      title: 'Parabéns, Formando!',
      message: 'Hoje você encerra um ciclo importante e inicia uma nova jornada. Foram anos de dedicação, noites em claro, desafios superados. E você chegou até aqui! Parabéns por esta conquista incrível.',
      closing: 'O futuro é brilhante e cheio de possibilidades. Vá em frente e realize seus sonhos!',
      signature: 'Com orgulho e carinho',
    },
  },
];

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: TemplateCategory): MessageTemplate[] {
  return MESSAGE_TEMPLATES.filter(template => template.category === category);
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): MessageTemplate | undefined {
  return MESSAGE_TEMPLATES.find(template => template.id === id);
}

/**
 * Get all template categories
 */
export function getAllCategories(): TemplateCategory[] {
  return ['aniversario', 'amor', 'amizade', 'gratidao', 'parabens'];
}
