"use client";

import { useState, useMemo } from "react";
import {
  MessageCircle,
  Copy,
  Check,
  Search,
  ChevronDown,
  Heart,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  Phone,
  Clock,
} from "lucide-react";

// ============================================================
// CONTEÚDO DO ROTEIRO — hardcoded por enquanto.
// Quando for editar, vem aqui direto e deploya.
// ============================================================

type ScriptMessage = {
  label: string;
  body: string;
  context?: string;
  followUp?: {
    when: string;
    body: string;
  };
};

type ScriptStep = {
  id: string;
  number: number;
  title: string;
  goal: string;
  timing: string;
  messages: ScriptMessage[];
};

const SCRIPT_STEPS: ScriptStep[] = [
  {
    id: "recepcao",
    number: 1,
    title: "Recepção + apresentação (primeiros 2 min)",
    goal: "Saudar + explicar produto + preço + convidar pro editor — tudo numa mensagem",
    timing: "Responder em até 2 minutos",
    messages: [
      {
        label: "Mensagem padrão (assume DN, vai direto pro editor)",
        body: `Oiii, [nome]! 💕

Que bom que você chegou nas 12 Cartas pro Dia dos Namorados 🥹

São 12 cartinhas digitais com foto, música e mensagem suas. Cada uma tem um tema, tipo "abra quando estiver triste" 🥹

O melhor: **você consegue acompanhar pelo seu painel quando ele/ela abrir cada carta.** Aí quando você ver que abriu a "abra quando estiver triste", você já sabe e pode mandar uma mensagem, ligar, fazer algo. A cartinha cuida + você cuida 💛

🔗 Link/QR funciona pra sempre
💌 Cada carta abre só 1 vez (pra ser único)
👀 Você vê tudo antes de enviar

🎁 Promo DN: R$ 19,90 (de R$ 29,90) até 12/06

Bora? Te mando o link pra criar e te acompanho passo a passo 🌸`,
        context: "Mensagem completa que substitui as antigas Etapas 1+2. Assume que cliente vem do anúncio de DN, então não pergunta ocasião. Já explica o killer feature (acompanhar pelo painel) + antecipa as 3 dúvidas + dá o preço. Convida direto pro editor (não pra demo).",
        followUp: {
          when: "Após 30 min sem resposta",
          body: `Oi, [nome]! 🌸
Sem pressa! Quando você quiser, é só me dizer "manda" que envio o link pra você começar a criar 💛`
        }
      },
      {
        label: "Resposta após cliente dizer 'manda' / 'sim' / 'bora'",
        body: `Aqui ó, [nome] 🌸

👉 https://paperbloom.com.br/12-cartas

É só clicar em "Criar minhas 12 cartas" e seguir os passos. Conforme você for criando, já vai vendo um preview de como ficará pra ele/ela 💛

Pode salvar e voltar quando quiser — nada se perde. Qualquer dúvida me chama AQUI mesmo 🥹`,
        context: "Substitua [nome] no link e mensagem. Cliente já decidiu — entrega o link sem floreio.",
        followUp: {
          when: "Após 10 min sem resposta",
          body: `Conseguiu abrir o editor, [nome]? Tá fluindo? 🌸
Se travou em qualquer coisa, manda print pra mim que te ajudo na hora 💛`
        }
      },
    ],
  },
  {
    id: "duvidas-comuns",
    number: 2,
    title: "Dúvidas comuns durante o atendimento",
    goal: "Respostas prontas pras perguntas que aparecem após a mensagem inicial",
    timing: "Quando cliente fizer pergunta específica antes de pedir o link",
    messages: [
      {
        label: "Cliente quer ver a demo ANTES de criar",
        body: `Claro! Aqui a demonstração rapidinha 👇

https://paperbloom.com.br/demo/card-collection

Toca em qualquer carta pra abrir e sentir como fica ❤️

Quando terminar, é só me chamar aqui que te mando o link pra criar a sua 🌸`,
        context: "Use SÓ se cliente pedir demo explicitamente. O fluxo padrão é mandar direto pro editor (que já tem preview embutido).",
        followUp: {
          when: "Após 15 min sem resposta",
          body: `Conseguiu sentir a demo, [nome]? 🥹
Bora criar a sua? É só me dar um sinal que mando o link 💛`
        }
      },
      {
        label: "Cliente perguntou em detalhes sobre 'abre 1 vez'",
        body: `Tranquila, vou te explicar direitinho 💛

✅ **O QR Code/link funciona pra sempre** — não trava, não expira.

✅ **Cada cartinha abre só 1 vez por ele/ela.** Quando abre, vê foto + escuta música + lê a mensagem, e aquela carta vira lembrança selada.

✅ **Você pode ver tudo antes!** Depois de montar, você recebe um painel privado pra revisar. Tem botão de **RESETAR** que zera tudo, aí você envia zerado pra ele/ela 🥰

A ideia é cada carta ser um momento especial — "abra quando estiver triste", "abra no nosso aniversário". E você acompanha pelo painel quando cada uma é aberta ✨`,
        context: "Apareceu em ~40% das conversas reais (jun/2026). A mensagem inicial já antecipa isso, mas se o cliente aprofundar, use essa."
      },
      {
        label: "Cliente perguntou só o preço",
        body: `É R$ 19,90 (promo de DN, era R$ 29,90 — vai até 12/06) 🎁

E o melhor: ele/ela não vai abrir todas de uma vez. Cada cartinha vai ser um momento ao longo de meses. E você acompanha pelo painel quando cada uma abre 🥹

Bora montar a sua? Te mando o link e te ajudo passo a passo 💛`,
        context: "Não responder só com 'R$ 19,90' — sempre seguir com o valor emocional + CTA. Aprendizado de conversa real onde só o preço foi enviado e cliente sumiu."
      },
    ],
  },
  {
    id: "suporte-criacao",
    number: 3,
    title: "Suporte ativo durante a criação (15-30 min)",
    goal: "Reduzir drop-off no editor, coletar gargalos AO VIVO",
    timing: "Enquanto cliente está no editor",
    messages: [
      {
        label: "Check-in proativo (após ~5 min sem resposta)",
        body: `Oi, [nome]! Conseguiu abrir o editor? Tá fluindo? Se travar em algo, manda print pra mim 🥰`,
        followUp: {
          when: "Após mais 15 min sem resposta",
          body: `[Nome], vou ficar aqui mais um tempo de plantão pra você 💛
Se precisar parar e voltar amanhã, tudo bem também — o rascunho fica salvo.`
        }
      },
      {
        label: "Cliente sumiu por 10+ min",
        body: `Oi, [nome]! Tudo bem? Como tá indo?
Se quiser, posso ficar aqui mais um tempo te ajudando 💛`,
        followUp: {
          when: "Após 1h sem resposta",
          body: `Sem problemas, [nome]! Vou pausar por aqui.
Quando voltar a montar, é só me chamar que continuo te ajudando 🌸`
        }
      },
      {
        label: "Cliente envia print de tela travada",
        body: `Recebi! Tenta dar refresh — geralmente resolve.

Se continuar, me conta em qual passo travou que eu te oriento 💛`,
        context: "REGISTRE NA PLANILHA: em qual step travou, qual o erro. Esse é o ouro do aprendizado.",
        followUp: {
          when: "Após 10 min sem resposta",
          body: `Resolveu, [nome]? Se ainda tiver travado, me chama por voz/áudio que fica mais rápido 🥰`
        }
      },
    ],
  },
  {
    id: "checkout",
    number: 4,
    title: "Acompanhamento no checkout",
    goal: "Cliente conclui pagamento sem ansiedade",
    timing: "Após cliente terminar a criação",
    messages: [
      {
        label: "Orientação pré-pagamento",
        body: `Que legal, [nome]! 🌸

No pagamento, escolhe PIX — é instantâneo. Sua coleção fica pronta na hora.

Quando pagar, me manda print pra confirmar 💛`,
        followUp: {
          when: "Após 15 min sem confirmação",
          body: `[Nome], conseguiu finalizar o pagamento?
Se travou em algo, me manda print do erro que te ajudo 💛`
        }
      },
      {
        label: "Pagamento confirmado",
        body: `PERFEITO! 🎉
Sua coleção tá ativa.

Quando revelar pra [destinatário], se ela permitir, me manda a reação? Adoro esses momentos ❤️`,
        followUp: {
          when: "Não precisa de follow-up imediato",
          body: `[essa mensagem já encerra o ciclo de venda — o próximo contato é a Etapa 6 (Pós-venda)]`
        }
      },
    ],
  },
  {
    id: "pos-venda",
    number: 5,
    title: "Pós-venda e indicação",
    goal: "Gerar reciprocidade + base pra indicações futuras",
    timing: "Mesmo dia à noite + dia seguinte",
    messages: [
      {
        label: "Check-in noturno (mesmo dia)",
        body: `Oi, [nome]! 🌙 Conseguiu começar a montar? Qualquer dúvida me chama!`,
        followUp: {
          when: "Manhã do dia seguinte, se não respondeu",
          body: `Bom dia, [nome]! ☀️ Esquece a pergunta de ontem hehe.
Se precisar de qualquer ajuda hoje, tô por aqui 💛`
        }
      },
      {
        label: "Dia seguinte",
        body: `Bom dia, [nome] 💛
Como tá indo com as cartas? Se quiser, posso te sugerir uma ordem que cria narrativa emocional crescente 🥰`,
        followUp: {
          when: "2 dias antes da data da revelação, se ainda não finalizou",
          body: `Oi, [nome]! Faltam 2 dias pro [evento].
Se precisar de uma força pra terminar, me chama que paro tudo pra te ajudar ✨`
        }
      },
      {
        label: "Após cliente revelar e mandar reação",
        body: `Que reação LINDA 🥹❤️
Obrigada por compartilhar!

Se alguma amiga quiser algo parecido, manda meu contato 💛`,
        followUp: {
          when: "1 semana depois",
          body: `Oi, [nome]! 🌸 Passando pra te dizer que ainda penso na reação que você mandou.
Se aniversário/data especial de alguém aparecer no radar, lembra de mim ❤️`
        }
      },
    ],
  },
];

// ============================================================
// OBJEÇÕES COMUNS
// ============================================================

type Objection = {
  id: string;
  question: string;
  answer: string;
  category: "preco" | "confianca" | "tempo" | "tecnico";
};

const OBJECTIONS: Objection[] = [
  {
    id: "obj-desconto",
    category: "preco",
    question: "Posso pagar mais barato? / Dá desconto?",
    answer: `[Nome], R$ 19,90 já é o preço promocional de Dia dos Namorados (de R$ 29,90)!

E olha o detalhe: ele/ela não vai abrir todas de uma vez. Cada cartinha vai ser um momento ao longo de meses — e você acompanha pelo painel quando cada uma é aberta. Vira tipo um "diário do amor de vocês" 🥹

Por R$ 19,90, é caro? 💛`,
  },
  {
    id: "obj-comparacao",
    category: "preco",
    question: "Por que esse preço?",
    answer: `R$ 19,90 (promo DN, de R$ 29,90) pra um presente que se renova ao longo do tempo.

Um buquê custa R$ 80 e dura 1 semana. As 12 Cartas duram **pra sempre** — cada abertura é um novo momento, e você acompanha tudo pelo painel 💛`,
  },
  {
    id: "obj-fisico",
    category: "confianca",
    question: "Mas é só digital? Não recebe nada físico?",
    answer: `Recebe um QR code que pode imprimir, colar num quadrinho ou mandar fazer uma arte.

Mas a magia tá no digital — foto + música + mensagem juntos. Físico não entrega isso 💛`,
  },
  {
    id: "obj-nao-gostar",
    category: "confianca",
    question: "E se ele/ela não gostar?",
    answer: `Ninguém nunca ficou indiferente. É emoção pura.

E se rolar qualquer problema técnico, eu te dou suporte pra ajustar 💛`,
  },
  {
    id: "obj-abre-uma-vez",
    category: "confianca",
    question: "Se eu abrir pra ver antes, ele/ela não vai conseguir abrir? / O QR só funciona 1 vez?",
    answer: `Boa pergunta! Funciona assim:

🔗 **O link/QR fica disponível pra sempre** — não trava, não some.

💌 **Cada cartinha abre só 1 vez por destinatário.** Quando ele/ela abre, aquela carta é selada — vira lembrança única.

👀 **E você pode ver tudo antes!** Depois de montar, te enviamos um painel pra você revisar. Se quiser, tem botão de RESETAR pra zerar e depois enviar zerado pra ele/ela ✨

Tranquila? 💛`,
  },
  {
    id: "obj-momento-certo",
    category: "confianca",
    question: "Quando ele/ela deve abrir as cartas?",
    answer: `As cartas são feitas pra momentos especiais! Você define o tema de cada uma.

Exemplos:
✨ "Abra quando estiver triste"
✨ "Abra quando estiver com saudade"
✨ "Abra no nosso aniversário"
✨ "Abra quando precisar de força"

Aí ela escolhe quando vive cada uma 🥹`,
  },
  {
    id: "obj-internet",
    category: "tecnico",
    question: "E se a internet dele/dela cair?",
    answer: `As cartas ficam salvas pra sempre na nossa plataforma. Ele/ela pode abrir quando tiver internet, quantas vezes quiser (depois da primeira).`,
  },
  {
    id: "obj-ver-antes",
    category: "confianca",
    question: "Posso ver antes de pagar?",
    answer: `A demo mostra exatamente a experiência. A diferença é que a sua vai ter SUAS fotos, MÚSICAS e mensagens — a magia é essa ✨`,
  },
  {
    id: "obj-pensar",
    category: "tempo",
    question: "Vou pensar",
    answer: `Claro! Pensa com calma 🌸

Só uma coisa que talvez não tenha pensado: as 12 Cartas não acabam quando ele/ela abre o presente. Cada cartinha vai sendo aberta aos pouquinhos — e você acompanha pelo painel quando cada uma é aberta. Aí sabe o momento exato pra mandar uma mensagem, fazer algo a mais.

É presente que se renova. Por isso vale R$ 19,90 🥹

Se decidir até dia 12, te ajudo a montar passo a passo ✨`,
  },
  {
    id: "obj-criar-depois",
    category: "tempo",
    question: "Vou criar depois",
    answer: `Aqui no chat eu te ajudo AO VIVO. Depois pode demorar mais pra responder.

Topa criar agora comigo? Te juro que é rápido 🥰`,
  },
  {
    id: "obj-errar",
    category: "tecnico",
    question: "E se eu errar?",
    answer: `Pode editar quantas vezes quiser ANTES de finalizar! Salva como rascunho, mexe, salva de novo. Só fica definitivo depois que você decide publicar.`,
  },
  {
    id: "obj-pagamento",
    category: "tecnico",
    question: "Não consegui pagar",
    answer: `Me manda print do erro? Geralmente é cartão recusado ou conexão.

Se for cartão, tenta de novo — o banco às vezes bloqueia a 1ª tentativa por segurança.`,
  },
];

// ============================================================
// FAQ DURANTE A CRIAÇÃO (perguntas técnicas)
// ============================================================

const CREATION_FAQ: Array<{ q: string; a: string }> = [
  {
    q: "Quantas fotos eu preciso?",
    a: "12 no total — uma pra cada carta. Pode subir aos poucos, salvar e voltar.",
  },
  {
    q: "Posso usar foto do celular?",
    a: "Pode! Aceita JPG, PNG, qualquer formato comum. Tira do rolo da câmera mesmo.",
  },
  {
    q: "E se eu não souber qual música?",
    a: "Pensa em alguma que toca e lembra dele/dela — do casamento, do primeiro encontro, de um filme. Se quiser, me manda opções que te ajudo a escolher.",
  },
  {
    q: "Quanto custa?",
    a: "R$ 19,90 (promo Dia dos Namorados — de R$ 29,90). Pagamento único, sem frete — recebe na hora do pagamento.",
  },
  {
    q: "Tá pedindo cartão de crédito",
    a: "Tem PIX também! No checkout, escolhe a opção PIX. Cai na hora, mais prático.",
  },
  {
    q: "As fotos ficam armazenadas?",
    a: "Sim! Ficam armazenadas na nossa plataforma com segurança. Só você e o destinatário têm acesso via link único.",
  },
  {
    q: "Posso mudar a ordem das cartas depois?",
    a: "Pode editar a ordem ANTES de finalizar. Depois que publicar, a sequência fica fixa pra criar a experiência narrativa.",
  },
  {
    q: "Como funciona o QR Code?",
    a: "Depois de montar, você recebe o QR Code por e-mail. O QR fica disponível pra sempre — não trava, não expira. Você imprime, manda no WhatsApp, faz como quiser.",
  },
  {
    q: "Posso ver as cartas antes de enviar?",
    a: "Pode! Depois de montar, você tem acesso a um painel pra revisar todas. Se quiser ver como abre, tem botão de RESETAR pra zerar tudo antes de enviar pro destinatário.",
  },
];

// ============================================================
// CHECKLIST DO ATENDENTE
// ============================================================

const ATTENDANT_CHECKLIST = [
  "Respondi em menos de 2 minutos?",
  "Personalizei com o nome do cliente?",
  "Descobri pra quem é e qual a ocasião?",
  "Mandei o link da demo antes do editor?",
  "Mandei o link do editor com ?ref= rastreável?",
  "Fiz check-in proativo durante a criação?",
  "Orientei sobre PIX como pagamento preferencial?",
  "Confirmei pagamento e ativação da coleção?",
  "Registrei dados na planilha (canal, ocasião, gargalos)?",
  "Agendei follow-up pós-venda?",
];

// ============================================================
// COMPONENTES
// ============================================================

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback silencioso
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        copied
          ? "bg-green-100 text-green-700"
          : "bg-pink-100 text-pink-700 hover:bg-pink-200"
      }`}
    >
      {copied ? (
        <>
          <Check size={14} />
          Copiado!
        </>
      ) : (
        <>
          <Copy size={14} />
          Copiar
        </>
      )}
    </button>
  );
}

function ScriptStepCard({ step }: { step: ScriptStep }) {
  const [open, setOpen] = useState(step.number === 1);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-5 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center font-bold text-pink-600 flex-shrink-0">
          {step.number}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900">{step.title}</h3>
          <p className="text-sm text-gray-500 truncate">{step.goal}</p>
        </div>
        <span className="text-xs text-gray-400 hidden sm:block">{step.timing}</span>
        <ChevronDown
          size={20}
          className={`text-gray-400 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="border-t bg-gray-50 p-5 space-y-4">
          {step.messages.map((msg, idx) => (
            <div key={idx} className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Mensagem original (esquerda) */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3 gap-2">
                  <p className="text-xs font-semibold text-pink-600 uppercase tracking-wide">
                    {msg.label}
                  </p>
                  <CopyButton text={msg.body} />
                </div>
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                  {msg.body}
                </pre>
                {msg.context && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-start gap-2">
                    <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 leading-relaxed">{msg.context}</p>
                  </div>
                )}
              </div>

              {/* Follow-up (direita) */}
              {msg.followUp ? (
                <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-200/60 border-dashed">
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Clock size={14} className="text-blue-500 flex-shrink-0" />
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide truncate">
                        Follow-up
                      </p>
                    </div>
                    <CopyButton text={msg.followUp.body} />
                  </div>
                  <p className="text-[11px] text-blue-700/80 italic mb-2">
                    {msg.followUp.when}
                  </p>
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                    {msg.followUp.body}
                  </pre>
                </div>
              ) : (
                <div className="hidden lg:flex bg-gray-100/50 rounded-lg p-4 border border-gray-200/60 border-dashed items-center justify-center">
                  <p className="text-xs text-gray-400 italic">Sem follow-up necessário</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ObjectionCard({ obj }: { obj: Objection }) {
  const [open, setOpen] = useState(false);

  const categoryColors: Record<Objection["category"], string> = {
    preco: "bg-amber-100 text-amber-700",
    confianca: "bg-blue-100 text-blue-700",
    tempo: "bg-purple-100 text-purple-700",
    tecnico: "bg-gray-100 text-gray-700",
  };

  const categoryLabels: Record<Objection["category"], string> = {
    preco: "Preço",
    confianca: "Confiança",
    tempo: "Tempo",
    tecnico: "Técnico",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left"
      >
        <HelpCircle size={20} className="text-pink-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900">{obj.question}</p>
          <span
            className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[obj.category]}`}
          >
            {categoryLabels[obj.category]}
          </span>
        </div>
        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform flex-shrink-0 mt-1 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="border-t bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-pink-600 uppercase tracking-wide">
              Resposta sugerida
            </p>
            <CopyButton text={obj.answer} />
          </div>
          <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
            {obj.answer}
          </pre>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PÁGINA PRINCIPAL
// ============================================================

export default function AtendimentoPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"roteiro" | "objecoes" | "faq" | "checklist">("roteiro");

  const filteredObjections = useMemo(() => {
    if (!search.trim()) return OBJECTIONS;
    const q = search.toLowerCase();
    return OBJECTIONS.filter(
      (o) => o.question.toLowerCase().includes(q) || o.answer.toLowerCase().includes(q)
    );
  }, [search]);

  const filteredFaq = useMemo(() => {
    if (!search.trim()) return CREATION_FAQ;
    const q = search.toLowerCase();
    return CREATION_FAQ.filter(
      (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Atendimento — 12 Cartas</h1>
          <p className="text-gray-500">Roteiro, objeções e respostas prontas pra copiar</p>
        </div>
        <div className="flex items-center gap-2 bg-pink-50 text-pink-700 px-3 py-2 rounded-lg">
          <Phone size={16} />
          <span className="text-sm font-medium">Campanha Mensagens — DN 2026</span>
        </div>
      </div>

      {/* Aviso estratégico */}
      <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4 flex items-start gap-3">
        <Heart className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-amber-900">
          <p className="font-semibold mb-1">Lembre-se: você é GUIA, não vendedora.</p>
          <p>
            Estratégia atual: <strong>ir direto pro editor</strong> (que já tem preview embutido).
            Só manda demo se cliente pedir explicitamente. Killer feature do produto:
            <strong> ele/ela acompanha pelo painel quando cada carta é aberta</strong> — use esse argumento
            sempre que possível.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-1 inline-flex flex-wrap gap-1">
        {[
          { id: "roteiro", label: "Roteiro por etapa", icon: MessageCircle },
          { id: "objecoes", label: "Objeções", icon: HelpCircle },
          { id: "faq", label: "FAQ durante criação", icon: AlertCircle },
          { id: "checklist", label: "Checklist", icon: CheckCircle2 },
        ].map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                active ? "bg-pink-500 text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Busca (só em objeções/FAQ) */}
      {(tab === "objecoes" || tab === "faq") && (
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por palavra-chave (ex: preço, demora, cartão)..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>
      )}

      {/* Conteúdo por tab */}
      {tab === "roteiro" && (
        <div className="space-y-3">
          {SCRIPT_STEPS.map((step) => (
            <ScriptStepCard key={step.id} step={step} />
          ))}
        </div>
      )}

      {tab === "objecoes" && (
        <div className="space-y-3">
          {filteredObjections.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center text-gray-500">
              Nenhuma objeção encontrada para "{search}"
            </div>
          ) : (
            filteredObjections.map((obj) => <ObjectionCard key={obj.id} obj={obj} />)
          )}
        </div>
      )}

      {tab === "faq" && (
        <div className="space-y-3">
          {filteredFaq.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center text-gray-500">
              Nenhuma pergunta encontrada para "{search}"
            </div>
          ) : (
            filteredFaq.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="font-medium text-gray-900">{item.q}</p>
                  <CopyButton text={item.a} />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{item.a}</p>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "checklist" && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Confira a cada atendimento concluído
          </h3>
          <ul className="space-y-3">
            {ATTENDANT_CHECKLIST.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded border-2 border-gray-300 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500">
            💡 Imprima ou deixe essa aba aberta durante o atendimento. Cada item ignorado é uma chance de perda.
          </div>
        </div>
      )}
    </div>
  );
}
