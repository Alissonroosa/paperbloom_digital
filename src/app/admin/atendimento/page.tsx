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
    title: "Recepção (primeiros 2 min)",
    goal: "Personalizar, qualificar, criar intimidade antes de vender",
    timing: "Responder em até 2 minutos",
    messages: [
      {
        label: "Mensagem padrão",
        body: `Oiii, [nome]! 💕

Que bom que você se interessou pelas 12 Cartas!

Me conta rapidinho:
🥰 Pra quem é o presente?
🌸 E qual a ocasião?`,
        context: "Tira o nome do perfil do WhatsApp.",
        followUp: {
          when: "Após 30 min sem resposta",
          body: `Oi, [nome]! 🌸
Vi que você passou por aqui. Se quiser, posso te explicar como funcionam as 12 Cartas mesmo sem você me contar o contexto. Sem pressa 💛`
        }
      },
    ],
  },
  {
    id: "qualificacao",
    number: 2,
    title: "Qualificação + apresentação (próximos 3 min)",
    goal: "Espelhar sentimento + explicar produto + transição pra demo",
    timing: "Após cliente responder pra quem é/ocasião",
    messages: [
      {
        label: "Resposta após cliente contar a ocasião",
        body: `[Nome], que linda intenção 🥹
[Reação curta à ocasião]

E olha, as 12 Cartas combinam demais com esse momento. Deixa eu te explicar rapidinho:

São 12 cartas digitais. Cada uma tem foto, música e mensagem sua.

O mágico: **cada carta só pode ser aberta UMA vez.** Aí vira lembrança pra sempre 💛

Quer ver como fica? Te mando uma demonstração rapidinha 👇`,
        context: "Reação personalizada curta + ponte. Ex: '5 anos? Bodas de madeira, algo que dura.'",
        followUp: {
          when: "Após 1h sem resposta ao convite da demo",
          body: `Oi, [nome]! Sem stress se você tiver ocupada agora.
Quando puder, é só me dizer "manda" que te envio a demo rapidinho ✨`
        }
      },
    ],
  },
  {
    id: "demo",
    number: 3,
    title: "Demo (que já leva pro editor)",
    goal: "Cliente experimenta o produto e segue direto pra criar",
    timing: "Após cliente dizer que quer ver",
    messages: [
      {
        label: "Envio da demo + aviso do caminho",
        body: `https://paperbloom.com.br/demo/card-collection

Toca numa das cartas pra abrir e sentir como fica ❤️

Quando você terminar a demo, ela mesma vai te levar pra criar a sua. Já te aviso: vou ficar aqui o tempo todo pra te ajudar a montar 💛`,
        context: "A demo direciona automaticamente pro editor após o cliente abrir a primeira carta. Não precisa mandar link do editor depois.",
        followUp: {
          when: "Após 20 min sem resposta",
          body: `Conseguiu abrir a demo? 🌸
Se não tiver rolado, me avisa que te mando outro caminho 💛`
        }
      },
      {
        label: "Check-in após cliente abrir a demo",
        body: `E aí, conseguiu sentir? 🥹
Quando você for criar a sua, qualquer dúvida me chama AQUI mesmo 💛`,
        context: "Use se cliente sumir após receber a demo. Reforça que você fica disponível durante a criação.",
        followUp: {
          when: "Após 2h sem resposta",
          body: `[Nome], se quiser pensar com calma, tudo bem 💛
Só fica o lembrete: dia 12 é DN. Se decidir até lá, te ajudo a montar com calma ✨`
        }
      },
    ],
  },
  {
    id: "suporte-criacao",
    number: 4,
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
    number: 5,
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
    number: 6,
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
    answer: `[Nome], R$ 29,90 já é o preço mais justo — cada coleção é única, com escolha foto por foto, música por música.

O que posso fazer é te ajudar PESSOALMENTE em cada passo. Esse acompanhamento normalmente não está incluído 🥰`,
  },
  {
    id: "obj-comparacao",
    category: "preco",
    question: "Por que esse preço?",
    answer: `R$ 29,90 pra um presente que dura pra sempre.

Um buquê custa R$ 80 e dura 1 semana. As 12 Cartas duram **pra sempre** — ela pode reabrir as memórias quando quiser 💛`,
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
    answer: `Claro! Pensa com calma. Aqui o link pra quando decidir: [link]

Se for pra Dia dos Namorados, recomendo começar até dia 10 pra escolher com tempo ✨`,
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
    a: "R$ 29,90, pagamento único. Sem frete — recebe na hora do pagamento.",
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
            Seu papel é levar o cliente até concluir a compra <strong>no site</strong>, ajudando em cada passo.
            Não venda manualmente — eduque, oriente e fique disponível. Cada gargalo que o cliente reportar
            vira aprendizado pra melhorar o produto.
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
