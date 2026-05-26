"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Sparkles, Globe } from "lucide-react";
import type { ComponentType } from "react";
import { catalogService } from "@/services/CatalogService";
import { RosePetals } from "@/components/effects/RosePetals";

const WHATSAPP_PHONE =
  process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER || "5551992698003";
const WHATSAPP_MESSAGE =
  "Olá! Vim pelo Instagram e gostaria de fazer uma encomenda 💝";

const UTM = "utm_source=instagram&utm_medium=bio&utm_campaign=linktree";

function withUtm(href: string, content: string): string {
  const sep = href.includes("?") ? "&" : "?";
  return `${href}${sep}${UTM}&utm_content=${content}`;
}

function buildWhatsAppUrl(): string {
  const text = encodeURIComponent(WHATSAPP_MESSAGE);
  return `https://wa.me/${WHATSAPP_PHONE}?text=${text}`;
}

type IconComponent = ComponentType<{ size?: number | string; className?: string }>;

type BioLink = {
  label: string;
  description: string;
  href: string;
  icon: IconComponent;
  external?: boolean;
  highlight?: boolean;
  iconBgClass?: string;
  iconColorClass?: string;
};

// Glifo oficial do WhatsApp (telefone). Fonte: brand guidelines da Meta.
// Renderizado em branco sobre fundo #25D366 para reproduzir o logo oficial.
function WhatsAppGlyph({ size = 20, className }: { size?: number | string; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

export default function LinksPage() {
  const active = catalogService.getActiveCollection();
  const colecaoHref = active
    ? `/loja/colecao/${active.slug}`
    : "/loja";

  const links: BioLink[] = [
    {
      label: "Coleção Dia dos Namorados",
      description: "Edição limitada — quadros, jogos e mais",
      href: withUtm(colecaoHref, "colecao-namorados"),
      icon: Heart,
      highlight: true,
    },
    {
      label: "Experiências Digitais",
      description: "Mensagem Digital, 12 Cartas e Revelação Virtual",
      href: withUtm("/experiencias", "experiencias"),
      icon: Sparkles,
    },
    {
      label: "Encomendas pelo WhatsApp",
      description: "Fale direto com a gente",
      href: buildWhatsAppUrl(),
      icon: WhatsAppGlyph,
      external: true,
      iconBgClass: "bg-[#25D366]",
      iconColorClass: "text-white",
    },
    {
      label: "Site completo",
      description: "Explore tudo o que a Paper Bloom oferece",
      href: withUtm("/", "site"),
      icon: Globe,
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FFFAFA]">
      <RosePetals />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="w-[500px] h-[500px] md:w-[700px] md:h-[700px] bg-gradient-to-br from-primary/30 to-secondary/20 rounded-full blur-[100px]"
        />
      </div>

      <main className="relative z-10 flex min-h-screen flex-col items-center px-5 py-10 md:py-16">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center text-center"
        >
          <Link href="/" aria-label="Paper Bloom — Início">
            <Image
              src="/logo-icon.png"
              alt="Paper Bloom"
              width={88}
              height={88}
              priority
              className="rounded-full shadow-lg ring-4 ring-white"
            />
          </Link>

          <span className="mt-5 font-script text-4xl md:text-5xl text-primary">
            Paper Bloom
          </span>

          <p className="mt-1 max-w-xs text-sm md:text-base text-text-main/70 font-sans">
            Presentes que emocionam — escolha por onde começar
          </p>
        </motion.div>

        <ul className="mt-10 w-full max-w-md space-y-4">
          {links.map((link, index) => (
            <motion.li
              key={link.label}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <LinkButton link={link} />
            </motion.li>
          ))}
        </ul>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-auto pt-10 text-center text-xs text-text-main/50"
        >
          <p>© {new Date().getFullYear()} Paper Bloom</p>
        </motion.footer>
      </main>
    </div>
  );
}

function LinkButton({ link }: { link: BioLink }) {
  const Icon = link.icon;
  const baseClass =
    "group flex w-full items-center gap-4 rounded-2xl border bg-white/80 px-5 py-4 backdrop-blur-sm shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]";
  const highlightClass = link.highlight
    ? "border-primary/40 bg-gradient-to-r from-primary/20 to-primary/10 hover:from-primary/25 hover:to-primary/15"
    : "border-primary/15 hover:border-primary/30";

  const content = (
    <>
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors ${
          link.iconBgClass ??
          (link.highlight
            ? "bg-primary"
            : "bg-primary/15 group-hover:bg-primary/25")
        } ${
          link.iconColorClass ??
          (link.highlight ? "text-white" : "text-primary")
        }`}
      >
        <Icon size={20} />
      </span>
      <span className="flex-1 text-left">
        <span className="block font-serif text-base md:text-lg font-semibold text-text-main">
          {link.label}
        </span>
        <span className="block text-xs md:text-sm text-text-main/60">
          {link.description}
        </span>
      </span>
    </>
  );

  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClass} ${highlightClass}`}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={link.href} className={`${baseClass} ${highlightClass}`}>
      {content}
    </Link>
  );
}
