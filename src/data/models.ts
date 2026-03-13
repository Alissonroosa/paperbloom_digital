/**
 * Message Models
 * 
 * Models are complete message examples that users can use as starting points.
 * Each model provides a fully populated message with all fields filled.
 */

import { TemplateCategory } from './templates';

export interface MessageModel {
  id: string;
  templateId: string;
  category: TemplateCategory;
  name: string;
  description: string;
  preview: string;
  completeData: {
    title: string;
    specialDate?: Date;
    message: string;
    closing: string;
    signature: string;
    from: string;
    to: string;
    youtubeLink?: string;
  };
}

export const MESSAGE_MODELS: MessageModel[] = [
  // Aniversário Models
  {
    id: 'model-aniversario-namorada',
    templateId: 'aniversario-romantico',
    category: 'aniversario',
    name: 'Aniversário da Namorada',
    description: 'Mensagem romântica completa para o aniversário da namorada',
    preview: '/models/aniversario-namorada.jpg',
    completeData: {
      title: 'Feliz Aniversário, Meu Amor!',
      message: 'Hoje é o dia mais especial do ano, porque é o dia em que você nasceu. Não consigo imaginar minha vida sem você. Cada momento ao seu lado é mágico, cada sorriso seu ilumina meu dia. Obrigado por existir e por me fazer tão feliz. Te amo mais do que as palavras podem expressar.',
      closing: 'Que este novo ano da sua vida seja repleto de amor, saúde, realizações e muita felicidade. Estarei ao seu lado em cada passo!',
      signature: 'Com todo meu amor, hoje e sempre',
      from: 'Seu namorado apaixonado',
      to: 'Minha princesa',
      youtubeLink: '',
    },
  },
  {
    id: 'model-aniversario-melhor-amiga',
    templateId: 'aniversario-amigo',
    category: 'aniversario',
    name: 'Aniversário da Melhor Amiga',
    description: 'Celebre o aniversário da sua melhor amiga',
    preview: '/models/aniversario-melhor-amiga.jpg',
    completeData: {
      title: 'Feliz Aniversário, Amiga!',
      message: 'Hoje é dia de celebrar a pessoa mais incrível que conheço! Você é aquela amiga que está presente em todos os momentos, que me faz rir até doer a barriga, que me ouve sem julgar e que torna minha vida muito melhor. Obrigada por ser essa pessoa maravilhosa!',
      closing: 'Que seu dia seja tão especial quanto você é para mim. Muitas felicidades, risadas e conquistas neste novo ano!',
      signature: 'Sua amiga para sempre',
      from: 'Sua BFF',
      to: 'Minha melhor amiga',
    },
  },
  {
    id: 'model-aniversario-pai',
    templateId: 'aniversario-amigo',
    category: 'aniversario',
    name: 'Aniversário do Pai',
    description: 'Homenagem especial para o aniversário do pai',
    preview: '/models/aniversario-pai.jpg',
    completeData: {
      title: 'Feliz Aniversário, Pai!',
      message: 'Pai, hoje é seu dia! Quero agradecer por tudo que você fez e continua fazendo por mim. Você é meu exemplo de força, caráter e amor. Obrigado por cada conselho, cada abraço, cada momento que passamos juntos. Você é meu herói!',
      closing: 'Que Deus te abençoe com muita saúde, paz e felicidade. Te amo muito!',
      signature: 'Com amor e admiração',
      from: 'Seu filho que te ama',
      to: 'Meu pai querido',
    },
  },

  // Amor Models
  {
    id: 'model-amor-aniversario-namoro',
    templateId: 'amor-declaracao',
    category: 'amor',
    name: 'Aniversário de Namoro',
    description: 'Celebre mais um ano de amor',
    preview: '/models/amor-aniversario-namoro.jpg',
    completeData: {
      title: 'Feliz Aniversário de Namoro!',
      message: 'Mais um ano ao seu lado, e cada dia me apaixono mais por você. Lembro do dia em que nos conhecemos como se fosse ontem, e desde então minha vida mudou completamente. Você me faz querer ser uma pessoa melhor, me inspira, me completa. Obrigado por cada momento, cada risada, cada abraço.',
      closing: 'Que venham muitos e muitos anos juntos. Te amo infinitamente!',
      signature: 'Seu amor eterno',
      from: 'Seu namorado apaixonado',
      to: 'Meu amor',
    },
  },
  {
    id: 'model-amor-pedido-namoro',
    templateId: 'amor-declaracao',
    category: 'amor',
    name: 'Pedido de Namoro',
    description: 'Declare seu amor e faça o pedido especial',
    preview: '/models/amor-pedido-namoro.jpg',
    completeData: {
      title: 'Quer Namorar Comigo?',
      message: 'Desde que te conheci, minha vida ganhou um novo significado. Você me faz sorrir sem esforço, me entende como ninguém, e estar ao seu lado é onde me sinto em casa. Não quero mais viver sem você, não quero mais chamar isso de "ficada" ou "algo casual". Quero você oficialmente na minha vida.',
      closing: 'Então, o que você me diz? Quer namorar comigo?',
      signature: 'Esperançoso e apaixonado',
      from: 'Alguém que te ama muito',
      to: 'A pessoa mais especial',
    },
  },
  {
    id: 'model-amor-reconciliacao',
    templateId: 'amor-saudade',
    category: 'amor',
    name: 'Mensagem de Reconciliação',
    description: 'Peça desculpas e reconquiste',
    preview: '/models/amor-reconciliacao.jpg',
    completeData: {
      title: 'Me Perdoa?',
      message: 'Eu errei, e sei disso. Machuquei você, e isso me dói profundamente. Não consigo parar de pensar em você, em nós, em tudo que construímos juntos. Você é importante demais para mim, e não quero te perder. Me dá uma chance de consertar as coisas, de mostrar que posso ser melhor?',
      closing: 'Prometo fazer tudo diferente desta vez. Você merece o melhor, e quero ser essa pessoa para você.',
      signature: 'Com arrependimento e amor',
      from: 'Quem te ama e errou',
      to: 'Meu amor',
    },
  },

  // Amizade Models
  {
    id: 'model-amizade-aniversario-amizade',
    templateId: 'amizade-agradecimento',
    category: 'amizade',
    name: 'Aniversário de Amizade',
    description: 'Celebre anos de amizade verdadeira',
    preview: '/models/amizade-aniversario.jpg',
    completeData: {
      title: 'Celebrando Nossa Amizade!',
      message: 'Já são tantos anos de amizade, tantas histórias vividas juntos! Você é aquele amigo que conhece meus defeitos e me ama mesmo assim, que está presente nos momentos bons e ruins, que me faz rir até nos dias mais difíceis. Nossa amizade é um dos meus maiores tesouros.',
      closing: 'Que nossa amizade dure para sempre. Você é família que eu escolhi!',
      signature: 'Seu amigo de todas as horas',
      from: 'Seu brother',
      to: 'Meu parceiro de vida',
    },
  },
  {
    id: 'model-amizade-mudanca-cidade',
    templateId: 'amizade-apoio',
    category: 'amizade',
    name: 'Amigo que Mudou de Cidade',
    description: 'Mensagem para amigo que está longe',
    preview: '/models/amizade-distancia.jpg',
    completeData: {
      title: 'Saudades, Amigo!',
      message: 'A distância física não muda nada entre nós. Você pode estar em outra cidade, mas está sempre no meu coração. Lembro de todas as nossas aventuras, risadas e conversas até tarde. Mal posso esperar para nos vermos novamente e criarmos novas memórias!',
      closing: 'Não importa onde você esteja, nossa amizade permanece forte. Conte sempre comigo!',
      signature: 'Seu amigo de sempre',
      from: 'Seu parceiro de aventuras',
      to: 'Meu amigo distante',
    },
  },
  {
    id: 'model-amizade-apoio-dificuldade',
    templateId: 'amizade-apoio',
    category: 'amizade',
    name: 'Apoio em Momento Difícil',
    description: 'Apoie um amigo que precisa',
    preview: '/models/amizade-apoio.jpg',
    completeData: {
      title: 'Estou Aqui Por Você',
      message: 'Sei que você está passando por um momento muito difícil, e quero que saiba que não está sozinho nessa. Estou aqui para o que você precisar - para conversar, para desabafar, para chorar junto, ou apenas para ficar em silêncio ao seu lado. Você é forte e vai superar isso.',
      closing: 'Dias melhores virão, tenho certeza. E eu estarei ao seu lado em cada passo do caminho.',
      signature: 'Seu amigo sempre',
      from: 'Quem se importa com você',
      to: 'Meu amigo querido',
    },
  },

  // Gratidão Models
  {
    id: 'model-gratidao-professor',
    templateId: 'gratidao-geral',
    category: 'gratidao',
    name: 'Agradecimento ao Professor',
    description: 'Agradeça a um professor especial',
    preview: '/models/gratidao-professor.jpg',
    completeData: {
      title: 'Obrigado, Professor!',
      message: 'Quero expressar minha profunda gratidão por tudo que você fez por mim. Você não foi apenas um professor, foi um mentor, um inspirador. Seus ensinamentos vão muito além da sala de aula e levarei comigo para sempre. Obrigado por acreditar em mim e por me ajudar a crescer.',
      closing: 'Você faz diferença na vida de tantas pessoas. Continue sendo essa luz!',
      signature: 'Com admiração e gratidão',
      from: 'Seu aluno grato',
      to: 'Professor(a) [Nome]',
    },
  },
  {
    id: 'model-gratidao-mae',
    templateId: 'gratidao-geral',
    category: 'gratidao',
    name: 'Agradecimento à Mãe',
    description: 'Agradeça à pessoa mais importante',
    preview: '/models/gratidao-mae.jpg',
    completeData: {
      title: 'Obrigado, Mãe!',
      message: 'Mãe, não existem palavras suficientes para agradecer tudo que você fez e faz por mim. Seu amor incondicional, sua dedicação, seus sacrifícios - tudo isso me moldou na pessoa que sou hoje. Você é minha heroína, meu porto seguro, meu exemplo de força e amor.',
      closing: 'Te amo mais do que tudo neste mundo. Obrigado por ser a melhor mãe que alguém poderia ter!',
      signature: 'Com amor infinito',
      from: 'Seu filho que te ama',
      to: 'Minha mãe querida',
    },
  },
  {
    id: 'model-gratidao-ajuda',
    templateId: 'gratidao-geral',
    category: 'gratidao',
    name: 'Agradecimento por Ajuda',
    description: 'Agradeça quem te ajudou em momento difícil',
    preview: '/models/gratidao-ajuda.jpg',
    completeData: {
      title: 'Muito Obrigado!',
      message: 'Quero agradecer do fundo do coração por toda ajuda que você me deu. Estava passando por um momento muito difícil, e você apareceu como um anjo na minha vida. Sua generosidade, bondade e apoio fizeram toda a diferença. Nunca vou esquecer o que você fez por mim.',
      closing: 'Serei eternamente grato. Se um dia você precisar de mim, pode contar comigo!',
      signature: 'Com gratidão eterna',
      from: 'Alguém muito grato',
      to: 'Meu anjo da guarda',
    },
  },

  // Parabéns Models
  {
    id: 'model-parabens-novo-emprego',
    templateId: 'parabens-conquista',
    category: 'parabens',
    name: 'Parabéns pelo Novo Emprego',
    description: 'Celebre a conquista profissional',
    preview: '/models/parabens-emprego.jpg',
    completeData: {
      title: 'Parabéns pelo Novo Emprego!',
      message: 'Você conseguiu! Sua dedicação, esforço e competência finalmente foram reconhecidos. Esta conquista é mais do que merecida. Tenho certeza de que você vai brilhar nesta nova etapa da sua carreira. Estou muito orgulhoso de você!',
      closing: 'Que este seja o início de uma jornada profissional incrível. Sucesso sempre!',
      signature: 'Com admiração',
      from: 'Seu amigo orgulhoso',
      to: 'Novo profissional de sucesso',
    },
  },
  {
    id: 'model-parabens-casamento',
    templateId: 'parabens-conquista',
    category: 'parabens',
    name: 'Parabéns pelo Casamento',
    description: 'Celebre a união do casal',
    preview: '/models/parabens-casamento.jpg',
    completeData: {
      title: 'Feliz Casamento!',
      message: 'Hoje vocês iniciam uma nova jornada juntos, e não poderia estar mais feliz por vocês! Que este casamento seja repleto de amor, cumplicidade, respeito e muita felicidade. Vocês são um casal lindo e merecem todo o amor do mundo.',
      closing: 'Que vocês construam uma vida maravilhosa juntos. Parabéns aos noivos!',
      signature: 'Com carinho e felicidade',
      from: 'Amigo do casal',
      to: 'Os noivos',
    },
  },
  {
    id: 'model-parabens-bebe',
    templateId: 'parabens-conquista',
    category: 'parabens',
    name: 'Parabéns pelo Bebê',
    description: 'Celebre a chegada do novo membro da família',
    preview: '/models/parabens-bebe.jpg',
    completeData: {
      title: 'Bem-vindo ao Mundo!',
      message: 'Parabéns pela chegada do novo membro da família! Que alegria imensa saber que vocês agora são pais. Este pequeno ser veio para trazer ainda mais amor, alegria e propósito para suas vidas. Desejo que esta nova jornada seja repleta de momentos mágicos e inesquecíveis.',
      closing: 'Que Deus abençoe e proteja este bebê lindo. Parabéns aos papais!',
      signature: 'Com muito carinho',
      from: 'Amigo da família',
      to: 'Os novos papais',
    },
  },
];

/**
 * Get models by category
 */
export function getModelsByCategory(category: TemplateCategory): MessageModel[] {
  return MESSAGE_MODELS.filter(model => model.category === category);
}

/**
 * Get models by template ID
 */
export function getModelsByTemplateId(templateId: string): MessageModel[] {
  return MESSAGE_MODELS.filter(model => model.templateId === templateId);
}

/**
 * Get model by ID
 */
export function getModelById(id: string): MessageModel | undefined {
  return MESSAGE_MODELS.find(model => model.id === id);
}
