"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Megaphone,
  Download,
  Heart,
  Calendar,
  Baby,
  Image as ImageIcon,
  Layers,
  Smartphone,
  FileText,
  Copy,
  Users,
  Target,
  Type,
  Upload,
  X,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type ProductId = "mensagem-digital" | "12-cartas" | "revelacao-virtual";
type CreativeFormat = "post" | "stories" | "carousel" | "flyer";

const BRAND = {
  primary: "#E6C2C2",
  secondary: "#D4A5A5",
  background: "#FFFAFA",
  textMain: "#4A4A4A",
  textAccent: "#8B5F5F",
  white: "#FFFFFF",
};

interface ProductConfig {
  id: ProductId;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: string | number }>;
  colors: {
    gradientStart: string; gradientEnd: string;
    accent: string; accentDark: string; text: string; phoneBorder: string;
  };
  tagline: string;
  heroTitle: string;
  description: string;
  price: string;
  features: string[];
  emoji: string;
  secondaryEmoji: string;
  screenshotHint: string;
  desktopHint: string;
  /** Gatilhos mentais específicos do produto */
  triggers: string[];
  /** Highlights curtos para preencher espaço no post */
  highlights: string[];
  /** Frase sobre forma de entrega */
  deliveryText: string;
  copyOptions: { title: string; primaryText: string; headline: string }[];
  audiences: { name: string; description: string }[];
}

const PRODUCTS: Record<ProductId, ProductConfig> = {
  "mensagem-digital": {
    id: "mensagem-digital",
    label: "Mensagem Digital",
    icon: Heart,
    colors: {
      gradientStart: "#FFFAFA", gradientEnd: "#F5E0E0",
      accent: "#E6C2C2", accentDark: "#8B5F5F", text: "#4A4A4A", phoneBorder: "#2C2C2E",
    },
    tagline: "Surpreenda quem você ama",
    heroTitle: "Uma mensagem que\ntoca o coração",
    description: "Página exclusiva com foto, música e mensagem personalizada.",
    price: "R$ 19,90",
    features: ["Foto personalizada", "Música do YouTube", "QR Code exclusivo", "Acesso ilimitado"],
    emoji: "💌",
    secondaryEmoji: "💕",
    screenshotHint: "Print da página de mensagem aberta no celular",
    desktopHint: "Print da landing page ou da mensagem aberta no desktop",
    triggers: [
      "⏰ Pronto em 5 minutos",
      "💕 +1.600 pessoas já emocionaram",
      "🔒 Acesso vitalício garantido",
      "🎁 Teste grátis antes de pagar",
    ],
    highlights: [
      "✦ 100% Personalizado",
      "✦ Sua foto e sua música",
      "✦ Página exclusiva",
      "✦ Acesso vitalício",
      "✦ QR Code para imprimir",
    ],
    deliveryText: "📲 Imprima ou envie o QR Code para alguém especial",
    copyOptions: [
      { title: "Emocional — Surpresa", primaryText: "Imagine a pessoa que você ama abrindo o celular e encontrando uma página feita só pra ela. Com foto, música e uma mensagem que vai fazer o coração acelerar. Crie agora em paperbloom.com.br", headline: "Uma surpresa digital que emociona de verdade" },
      { title: "Urgência — Data Especial", primaryText: "O aniversário tá chegando e você ainda não sabe o que dar? Uma Mensagem Digital Paper Bloom é o presente perfeito: personalizado, emocionante e pronto em minutos.", headline: "O presente perfeito tá a um clique de distância" },
      { title: "Social Proof", primaryText: "Mais de mil pessoas já emocionaram quem amam com a Paper Bloom. Uma página exclusiva com foto, música e mensagem personalizada. Crie a sua agora.", headline: "Já fez alguém chorar de emoção hoje?" },
    ],
    audiences: [
      { name: "Casais 18-35", description: "Interesse: relacionamento, presentes criativos, datas comemorativas" },
      { name: "Amigos próximos", description: "Interesse: amizade, presentes personalizados, surpresas" },
      { name: "Filhos para pais", description: "Interesse: dia das mães, dia dos pais, família" },
    ],
  },
  "12-cartas": {
    id: "12-cartas",
    label: "12 Cartas",
    icon: Calendar,
    colors: {
      gradientStart: "#FFFAFA", gradientEnd: "#EDE0F5",
      accent: "#D4A5A5", accentDark: "#6B4F4F", text: "#4A4A4A", phoneBorder: "#2C2C2E",
    },
    tagline: "12 momentos, 12 emoções",
    heroTitle: "12 cartas que vão\nmarcar o ano",
    description: "12 mensagens exclusivas com foto e música. Cada carta só abre uma vez.",
    price: "R$ 29,90",
    features: ["12 mensagens únicas", "Foto e música em cada", "Abertura única", "QR Code exclusivo"],
    emoji: "✉️",
    secondaryEmoji: "🔒",
    screenshotHint: "Print da tela com as 12 cartas ou de uma carta aberta",
    desktopHint: "Print da landing page ou da tela de cartas no desktop",
    triggers: [
      "🔒 Cada carta só abre UMA vez",
      "🎁 O presente mais criativo do ano",
      "⏰ Pronto em minutos",
      "💕 Surpreenda por 12 meses seguidos",
    ],
    highlights: [
      "✦ 12 mensagens personalizadas",
      "✦ Foto e música em cada carta",
      "✦ Abertura única por carta",
      "✦ Experiência ao longo do ano",
      "✦ QR Code exclusivo",
    ],
    deliveryText: "📲 Envie o QR Code e surpreenda por 12 meses",
    copyOptions: [
      { title: "Emocional — Jornada", primaryText: "12 cartas. 12 momentos. Cada uma só pode ser aberta uma vez, criando uma experiência inesquecível ao longo do ano. Surpreenda com algo que nenhum presente material pode oferecer.", headline: "12 cartas que vão marcar o ano de quem você ama" },
      { title: "Premium — Exclusividade", primaryText: "Não é só um presente. É uma experiência premium: 12 mensagens personalizadas com foto e música, cada uma revelada em um momento especial.", headline: "O presente mais criativo que você já deu" },
      { title: "Curiosidade", primaryText: "\"Abra quando estiver triste\", \"Abra quando sentir saudade\"... Imagine receber 12 cartas assim, cada uma com uma mensagem feita com amor. Crie agora na Paper Bloom.", headline: "Abra quando... precisar de um motivo pra sorrir" },
    ],
    audiences: [
      { name: "Casais apaixonados", description: "Interesse: presentes criativos, romance, experiências únicas" },
      { name: "Namorados à distância", description: "Interesse: relacionamento à distância, saudade, conexão" },
      { name: "Melhores amigos", description: "Interesse: amizade verdadeira, presentes significativos" },
    ],
  },
  "revelacao-virtual": {
    id: "revelacao-virtual",
    label: "Revelação Virtual",
    icon: Baby,
    colors: {
      gradientStart: "#E8F4FD", gradientEnd: "#FDE8F0",
      accent: "#B8D4E8", accentDark: "#5A7A8A", text: "#4A4A4A", phoneBorder: "#2C2C2E",
    },
    tagline: "Menino ou menina?",
    heroTitle: "A revelação mais\nemocionante começa aqui",
    description: "Revelação interativa com votação ao vivo e contagem regressiva.",
    price: "R$ 19,90",
    features: ["Votação interativa", "Dashboard em tempo real", "Galeria de fotos", "QR Code exclusivo"],
    emoji: "👶",
    secondaryEmoji: "🧸",
    screenshotHint: "Print da tela de votação ou da revelação do sexo",
    desktopHint: "Print da landing page ou do dashboard de votos no desktop",
    triggers: [
      "🌍 Todo mundo participa, mesmo de longe",
      "📊 Votação ao vivo com contagem regressiva",
      "⏰ Pronta em minutos, sem complicação",
      "💕 Momento inesquecível pra toda família",
    ],
    highlights: [
      "✦ Votação interativa ao vivo",
      "✦ Contagem regressiva",
      "✦ Galeria com até 5 fotos",
      "✦ Mensagens dos convidados",
      "✦ Compartilhe por link ou QR Code",
    ],
    deliveryText: "📲 Compartilhe o link e todos participam ao vivo",
    copyOptions: [
      { title: "Emocional — Família", primaryText: "A revelação do sexo do bebê é um dos momentos mais especiais da vida. Agora seus convidados podem participar de qualquer lugar, votar e descobrir junto com vocês!", headline: "A revelação mais emocionante começa aqui" },
      { title: "Praticidade", primaryText: "Sem precisar de festa, sem balão, sem bagunça. Uma revelação virtual interativa onde todos votam e descobrem juntos. Pronta em minutos.", headline: "Revelação do sexo do bebê sem complicação" },
      { title: "Inclusão — Distância", primaryText: "Tem família longe? Amigos em outra cidade? Com a Revelação Virtual Paper Bloom, todo mundo participa. Votação ao vivo, contagem regressiva e a emoção de descobrir juntos.", headline: "Todo mundo junto, mesmo de longe" },
    ],
    audiences: [
      { name: "Grávidas 25-40", description: "Interesse: gravidez, chá de bebê, revelação, maternidade" },
      { name: "Casais esperando bebê", description: "Interesse: paternidade, família, bebê a caminho" },
      { name: "Familiares e amigos", description: "Lookalike de quem já comprou revelação virtual" },
    ],
  },
};

const FORMATS: { id: CreativeFormat; label: string; icon: React.ComponentType<{ size?: string | number }>; width: number; height: number; desc: string }[] = [
  { id: "post", label: "Post Feed", icon: ImageIcon, width: 1080, height: 1080, desc: "1080×1080px" },
  { id: "stories", label: "Stories", icon: Smartphone, width: 1080, height: 1920, desc: "1080×1920px" },
  { id: "carousel", label: "Carrossel", icon: Layers, width: 1080, height: 1080, desc: "1080×1080px (3 slides)" },
  { id: "flyer", label: "Flyer", icon: FileText, width: 1080, height: 1350, desc: "1080×1350px" },
];

// ─── Canvas Helpers ──────────────────────────────────────────────────────────

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function drawPetals(ctx: CanvasRenderingContext2D, W: number, H: number, color: string, count = 40) {
  for (let i = 0; i < count; i++) {
    const cx = seededRandom(i * 3) * W, cy = seededRandom(i * 3 + 1) * H;
    const size = 8 + seededRandom(i * 3 + 2) * 20;
    const angle = seededRandom(i * 5) * Math.PI * 2;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle);
    ctx.globalAlpha = 0.08 + seededRandom(i * 11) * 0.12;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(0, 0, size, size * 0.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

function drawSoftBlobs(ctx: CanvasRenderingContext2D, W: number, H: number, c1: string, c2: string) {
  ctx.globalAlpha = 0.18;
  const g1 = ctx.createRadialGradient(W * 0.15, H * 0.2, 0, W * 0.15, H * 0.2, W * 0.3);
  g1.addColorStop(0, c1); g1.addColorStop(1, c1 + "00");
  ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);
  const g2 = ctx.createRadialGradient(W * 0.85, H * 0.75, 0, W * 0.85, H * 0.75, W * 0.35);
  g2.addColorStop(0, c2); g2.addColorStop(1, c2 + "00");
  ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;
}

function drawGradientBg(ctx: CanvasRenderingContext2D, W: number, H: number, start: string, end: string) {
  const grad = ctx.createLinearGradient(0, 0, W * 0.3, H);
  grad.addColorStop(0, start); grad.addColorStop(1, end);
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
}

function centerText(ctx: CanvasRenderingContext2D, text: string, y: number, font: string, color: string, W: number) {
  ctx.font = font; ctx.fillStyle = color; ctx.textAlign = "center"; ctx.fillText(text, W / 2, y);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number, font: string, color: string): number {
  ctx.font = font; ctx.fillStyle = color; ctx.textAlign = "center";
  const words = text.split(" "); let line = "", cy = y;
  for (const w of words) {
    const test = line + w + " ";
    if (ctx.measureText(test).width > maxW && line !== "") { ctx.fillText(line.trim(), x, cy); line = w + " "; cy += lh; }
    else { line = test; }
  }
  ctx.fillText(line.trim(), x, cy); return cy;
}

function drawMultilineTitle(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, font: string, color: string, lh: number): number {
  ctx.font = font; ctx.fillStyle = color; ctx.textAlign = "center";
  let cy = y; for (const l of text.split("\n")) { ctx.fillText(l, x, cy); cy += lh; } return cy;
}

function drawPill(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, bg: string, fg: string, fs = 28) {
  ctx.save(); ctx.font = `bold ${fs}px sans-serif`;
  const tw = ctx.measureText(text).width, px = 36, py = 16, w = tw + px * 2, h = fs + py * 2, r = h / 2;
  drawRoundedRect(ctx, x - w / 2, y - h / 2, w, h, r);
  ctx.fillStyle = bg; ctx.fill(); ctx.fillStyle = fg; ctx.textAlign = "center";
  ctx.fillText(text, x, y + fs * 0.35); ctx.restore();
}

function drawScript(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, color: string) {
  ctx.save(); ctx.font = `italic ${size}px serif`; ctx.fillStyle = color; ctx.textAlign = "center";
  ctx.fillText(text, x, y); ctx.restore();
}

function drawDivider(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, color: string) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.3;
  ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x + w / 2, y); ctx.stroke();
  ctx.globalAlpha = 1; ctx.restore();
}

function drawBranding(ctx: CanvasRenderingContext2D, W: number, y: number, color: string) {
  ctx.save(); ctx.globalAlpha = 0.35; ctx.font = "italic 22px serif";
  ctx.fillStyle = color; ctx.textAlign = "center";
  ctx.fillText("paperbloom.com.br", W / 2, y); ctx.globalAlpha = 1; ctx.restore();
}

/** Draw a trigger/mental hook text line */
function drawTrigger(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = "left") {
  ctx.save(); ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align;
  ctx.fillText(text, x, y); ctx.restore();
}

/** Draw the logo image at a given position and size */
function drawLogo(ctx: CanvasRenderingContext2D, logo: HTMLImageElement | null, x: number, y: number, size: number) {
  if (!logo) return;
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.drawImage(logo, x, y, size, size);
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ─── iPhone 16 Pro Mockup ────────────────────────────────────────────────────
// Ultra-thin bezels, Dynamic Island, titanium frame, rounded corners ~55px ratio

function drawIPhoneMockup(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  phoneX: number, phoneY: number,
  phoneW: number, phoneH: number,
  tilt = 0,
) {
  ctx.save();
  if (tilt !== 0) {
    ctx.translate(phoneX + phoneW / 2, phoneY + phoneH / 2);
    ctx.rotate((tilt * Math.PI) / 180);
    ctx.translate(-(phoneX + phoneW / 2), -(phoneY + phoneH / 2));
  }

  // iPhone 16 Pro proportions: ultra-thin bezels (~2.5%), large corner radius
  const bezel = phoneW * 0.025;
  const cornerR = phoneW * 0.14;
  const frameColor = "#2C2C2E"; // Space Black titanium
  const frameHighlight = "#48484A";

  // Drop shadow
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 18;

  // Outer frame (titanium body)
  drawRoundedRect(ctx, phoneX, phoneY, phoneW, phoneH, cornerR);
  ctx.fillStyle = frameColor;
  ctx.fill();

  // Subtle titanium edge highlight
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = frameHighlight;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Screen area
  const sx = phoneX + bezel, sy = phoneY + bezel;
  const sw = phoneW - bezel * 2, sh = phoneH - bezel * 2;
  const screenR = cornerR - bezel;

  ctx.save();
  drawRoundedRect(ctx, sx, sy, sw, sh, screenR);
  ctx.clip();

  // Draw screenshot covering screen
  const imgAspect = img.width / img.height;
  const screenAspect = sw / sh;
  let dw: number, dh: number, dx: number, dy: number;
  if (imgAspect > screenAspect) {
    dh = sh; dw = sh * imgAspect; dx = sx + (sw - dw) / 2; dy = sy;
  } else {
    dw = sw; dh = sw / imgAspect; dx = sx; dy = sy;
  }
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();

  // Dynamic Island (pill shape at top center)
  const diW = phoneW * 0.28;
  const diH = phoneH * 0.022;
  const diX = phoneX + (phoneW - diW) / 2;
  const diY = phoneY + bezel + phoneH * 0.012;
  drawRoundedRect(ctx, diX, diY, diW, diH, diH / 2);
  ctx.fillStyle = "#000000";
  ctx.fill();

  // Side button (right) — Action button style
  const btnW = bezel * 0.7;
  ctx.fillStyle = frameColor;
  ctx.fillRect(phoneX + phoneW, phoneY + phoneH * 0.22, btnW, phoneH * 0.04); // silent switch
  ctx.fillRect(phoneX + phoneW, phoneY + phoneH * 0.30, btnW, phoneH * 0.10); // power

  // Volume buttons (left)
  ctx.fillRect(phoneX - btnW, phoneY + phoneH * 0.22, btnW, phoneH * 0.06);
  ctx.fillRect(phoneX - btnW, phoneY + phoneH * 0.32, btnW, phoneH * 0.06);

  // Bottom bar indicator (home indicator)
  const barW = phoneW * 0.35;
  const barH = 4;
  const barY = phoneY + phoneH - bezel - 12;
  drawRoundedRect(ctx, phoneX + (phoneW - barW) / 2, barY, barW, barH, 2);
  ctx.fillStyle = "#FFFFFF44";
  ctx.fill();

  ctx.restore();
}

function drawIPhonePlaceholder(
  ctx: CanvasRenderingContext2D,
  phoneX: number, phoneY: number,
  phoneW: number, phoneH: number,
  accentColor: string, productId: ProductId,
  tilt = 0,
) {
  ctx.save();
  if (tilt !== 0) {
    ctx.translate(phoneX + phoneW / 2, phoneY + phoneH / 2);
    ctx.rotate((tilt * Math.PI) / 180);
    ctx.translate(-(phoneX + phoneW / 2), -(phoneY + phoneH / 2));
  }

  const bezel = phoneW * 0.025;
  const cornerR = phoneW * 0.14;
  const frameColor = "#2C2C2E";
  const frameHighlight = "#48484A";

  ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 45; ctx.shadowOffsetY = 15;
  drawRoundedRect(ctx, phoneX, phoneY, phoneW, phoneH, cornerR);
  ctx.fillStyle = frameColor; ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = frameHighlight; ctx.lineWidth = 1; ctx.stroke();

  // Screen
  const sx = phoneX + bezel, sy = phoneY + bezel;
  const sw = phoneW - bezel * 2, sh = phoneH - bezel * 2;
  const screenR = cornerR - bezel;
  drawRoundedRect(ctx, sx, sy, sw, sh, screenR);
  const sg = ctx.createLinearGradient(sx, sy, sx, sy + sh);
  sg.addColorStop(0, "#FFFAFA"); sg.addColorStop(1, accentColor + "22");
  ctx.fillStyle = sg; ctx.fill();

  // Clip to screen for illustration
  ctx.save();
  drawRoundedRect(ctx, sx, sy, sw, sh, screenR);
  ctx.clip();

  const cx = sx + sw / 2;
  const scale = phoneW / 380; // normalize to reference size

  if (productId === "mensagem-digital") {
    // ── Mensagem Digital: envelope, heart, text lines, music note ──
    // Header area
    ctx.fillStyle = accentColor + "22";
    ctx.fillRect(sx, sy, sw, sh * 0.12);

    // "Para: Amor ❤️" header text
    ctx.font = `${14 * scale}px serif`; ctx.fillStyle = "#4A4A4A"; ctx.textAlign = "center";
    ctx.fillText("Para: Amor ❤️", cx, sy + sh * 0.07);

    // Big heart emoji
    ctx.font = `${60 * scale}px serif`; ctx.textAlign = "center";
    ctx.fillText("💌", cx, sy + sh * 0.28);

    // Message text lines
    ctx.globalAlpha = 0.6;
    const lineColors = ["#8B5F5F", "#8B5F5F", "#8B5F5F"];
    const lineWidths = [0.7, 0.55, 0.4];
    for (let i = 0; i < 3; i++) {
      const lw = sw * lineWidths[i];
      drawRoundedRect(ctx, cx - lw / 2, sy + sh * 0.36 + i * (20 * scale), lw, 8 * scale, 4 * scale);
      ctx.fillStyle = lineColors[i % lineColors.length]; ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Photo placeholder
    const photoW = sw * 0.6, photoH = photoW * 0.7;
    const photoX = cx - photoW / 2, photoY = sy + sh * 0.50;
    drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 10 * scale);
    ctx.fillStyle = accentColor + "33"; ctx.fill();
    ctx.font = `${30 * scale}px serif`; ctx.textAlign = "center";
    ctx.fillText("📷", cx, photoY + photoH / 2 + 10 * scale);

    // Music bar at bottom
    ctx.fillStyle = accentColor + "18";
    ctx.fillRect(sx, sy + sh * 0.85, sw, sh * 0.08);
    ctx.font = `${12 * scale}px sans-serif`; ctx.fillStyle = "#8B5F5F88"; ctx.textAlign = "center";
    ctx.fillText("♪ Música tocando...", cx, sy + sh * 0.90);

    // Signature
    ctx.font = `italic ${14 * scale}px serif`; ctx.fillStyle = "#8B5F5F"; ctx.textAlign = "center";
    ctx.fillText("Com amor, de mim pra você", cx, sy + sh * 0.78);

  } else if (productId === "12-cartas") {
    // ── 12 Cartas: grid of mini cards with locks ──
    // Header
    ctx.fillStyle = accentColor + "22";
    ctx.fillRect(sx, sy, sw, sh * 0.10);
    ctx.font = `${13 * scale}px serif`; ctx.fillStyle = "#4A4A4A"; ctx.textAlign = "center";
    ctx.fillText("Para: Amor ❤️", cx, sy + sh * 0.065);

    // Card grid (3x4)
    const gridPad = sw * 0.08;
    const cols = 3, rows = 4;
    const gap = 8 * scale;
    const cardW = (sw - gridPad * 2 - gap * (cols - 1)) / cols;
    const cardH = cardW * 1.2;
    const gridStartY = sy + sh * 0.14;

    const cardColors = ["#E8B4B8", "#B4D4E8", "#E8D4B4", "#D4E8B4", "#E8B4D4", "#B4E8D4",
                        "#D4B4E8", "#E8E4B4", "#B4B8E8", "#E8B4B4", "#B4E8B8", "#D4D4E8"];
    const cardEmojis = ["💪", "🌟", "🌍", "🧘", "💕", "🎉", "🏆", "☕", "🤝", "😂", "🙏", "🌙"];

    for (let r = 0; r < rows; r++) {
      for (let c2 = 0; c2 < cols; c2++) {
        const i = r * cols + c2;
        const cx2 = sx + gridPad + c2 * (cardW + gap);
        const cy2 = gridStartY + r * (cardH + gap);

        // Card bg
        drawRoundedRect(ctx, cx2, cy2, cardW, cardH, 6 * scale);
        ctx.fillStyle = cardColors[i] + "33"; ctx.fill();
        ctx.strokeStyle = accentColor + "44"; ctx.lineWidth = 1; ctx.stroke();

        // Emoji
        ctx.font = `${16 * scale}px serif`; ctx.textAlign = "center";
        ctx.fillText(cardEmojis[i], cx2 + cardW / 2, cy2 + cardH * 0.45);

        // Lock icon
        ctx.font = `${10 * scale}px serif`; ctx.textAlign = "right";
        ctx.fillText("🔒", cx2 + cardW - 4 * scale, cy2 + 14 * scale);
      }
    }

    // Counter at bottom
    ctx.font = `${11 * scale}px sans-serif`; ctx.fillStyle = "#4A4A4A88"; ctx.textAlign = "center";
    ctx.fillText("0/12 cartas abertas", cx, sy + sh * 0.95);

  } else {
    // ── Revelação Virtual: vote buttons, baby emoji, countdown feel ──
    // Gradient bg blue→pink
    const revGrad = ctx.createLinearGradient(sx, sy, sx + sw, sy + sh);
    revGrad.addColorStop(0, "#E8F4FD"); revGrad.addColorStop(1, "#FDE8F0");
    ctx.fillStyle = revGrad;
    ctx.fillRect(sx, sy, sw, sh);

    // Baby emoji
    ctx.font = `${50 * scale}px serif`; ctx.textAlign = "center";
    ctx.fillText("🧸", cx, sy + sh * 0.22);

    // Title
    ctx.font = `bold ${16 * scale}px serif`; ctx.fillStyle = "#4A4A4A"; ctx.textAlign = "center";
    ctx.fillText("Menino ou menina?", cx, sy + sh * 0.33);

    // Vote buttons
    const btnW = sw * 0.35, btnH = btnW * 0.9, btnGap = sw * 0.06;
    const btnY = sy + sh * 0.40;

    // Boy button
    const boyX = cx - btnW - btnGap / 2;
    drawRoundedRect(ctx, boyX, btnY, btnW, btnH, 10 * scale);
    ctx.fillStyle = "#E8F4FD"; ctx.fill();
    ctx.strokeStyle = "#5B9BD544"; ctx.lineWidth = 2; ctx.stroke();
    ctx.font = `${28 * scale}px serif`; ctx.textAlign = "center";
    ctx.fillText("💙", boyX + btnW / 2, btnY + btnH * 0.50);
    ctx.font = `${12 * scale}px sans-serif`; ctx.fillStyle = "#4A4A4A";
    ctx.fillText("Menino", boyX + btnW / 2, btnY + btnH * 0.80);

    // Girl button
    const girlX = cx + btnGap / 2;
    drawRoundedRect(ctx, girlX, btnY, btnW, btnH, 10 * scale);
    ctx.fillStyle = "#FDE8F0"; ctx.fill();
    ctx.strokeStyle = "#E6A0B844"; ctx.lineWidth = 2; ctx.stroke();
    ctx.font = `${28 * scale}px serif`; ctx.textAlign = "center";
    ctx.fillText("💖", girlX + btnW / 2, btnY + btnH * 0.50);
    ctx.font = `${12 * scale}px sans-serif`; ctx.fillStyle = "#4A4A4A";
    ctx.fillText("Menina", girlX + btnW / 2, btnY + btnH * 0.80);

    // Vote bar
    const barY = btnY + btnH + 25 * scale;
    ctx.font = `${11 * scale}px sans-serif`; ctx.fillStyle = "#4A4A4A88"; ctx.textAlign = "center";
    ctx.fillText("47 votos", cx, barY);

    // Progress bars
    const pBarY = barY + 15 * scale;
    const pBarW = sw * 0.7, pBarH = 10 * scale;
    const pBarX = cx - pBarW / 2;
    drawRoundedRect(ctx, pBarX, pBarY, pBarW, pBarH, pBarH / 2);
    ctx.fillStyle = "#E0E0E0"; ctx.fill();
    drawRoundedRect(ctx, pBarX, pBarY, pBarW * 0.38, pBarH, pBarH / 2);
    ctx.fillStyle = "#5B9BD5"; ctx.fill();

    const pBarY2 = pBarY + pBarH + 8 * scale;
    drawRoundedRect(ctx, pBarX, pBarY2, pBarW, pBarH, pBarH / 2);
    ctx.fillStyle = "#E0E0E0"; ctx.fill();
    drawRoundedRect(ctx, pBarX, pBarY2, pBarW * 0.62, pBarH, pBarH / 2);
    ctx.fillStyle = "#E6A0B8"; ctx.fill();

    // Labels
    ctx.font = `${10 * scale}px sans-serif`; ctx.textAlign = "left";
    ctx.fillStyle = "#5B9BD5"; ctx.fillText("38%", pBarX, pBarY - 3 * scale);
    ctx.fillStyle = "#E6A0B8"; ctx.fillText("62%", pBarX, pBarY2 - 3 * scale);
  }

  ctx.restore(); // unclip

  // Dynamic Island
  const diW = phoneW * 0.28, diH = phoneH * 0.022;
  drawRoundedRect(ctx, phoneX + (phoneW - diW) / 2, phoneY + bezel + phoneH * 0.012, diW, diH, diH / 2);
  ctx.fillStyle = "#000"; ctx.fill();

  // Home indicator
  const barW = phoneW * 0.35;
  drawRoundedRect(ctx, phoneX + (phoneW - barW) / 2, phoneY + phoneH - bezel - 12, barW, 4, 2);
  ctx.fillStyle = accentColor + "55"; ctx.fill();

  ctx.restore();
}

// ─── MacBook Mockup ──────────────────────────────────────────────────────────

function drawMacBookMockup(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  mbX: number, mbY: number,
  mbW: number,
) {
  // MacBook proportions: screen ~16:10, bezel thin, base/hinge below
  const screenRatio = 10 / 16;
  const bezel = mbW * 0.02;
  const screenOuterH = mbW * screenRatio;
  const cornerR = mbW * 0.03;
  const baseH = mbW * 0.025;
  const hingeH = mbW * 0.012;

  ctx.save();

  // Shadow
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = 35;
  ctx.shadowOffsetY = 12;

  // Screen lid (dark frame)
  drawRoundedRect(ctx, mbX, mbY, mbW, screenOuterH, cornerR);
  ctx.fillStyle = "#2C2C2E";
  ctx.fill();
  ctx.shadowColor = "transparent";

  // Subtle edge
  ctx.strokeStyle = "#48484A";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Screen inner (image area)
  const sx = mbX + bezel, sy = mbY + bezel;
  const sw = mbW - bezel * 2, sh = screenOuterH - bezel * 2;
  const screenR = cornerR - bezel * 0.5;

  ctx.save();
  drawRoundedRect(ctx, sx, sy, sw, sh, screenR);
  ctx.clip();

  // Draw image covering screen
  const imgAspect = img.width / img.height;
  const screenAspect = sw / sh;
  let dw: number, dh: number, dx: number, dy: number;
  if (imgAspect > screenAspect) {
    dh = sh; dw = sh * imgAspect; dx = sx + (sw - dw) / 2; dy = sy;
  } else {
    dw = sw; dh = sw / imgAspect; dx = sx; dy = sy;
  }
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();

  // Camera notch (tiny)
  const camR = mbW * 0.006;
  ctx.beginPath();
  ctx.arc(mbX + mbW / 2, mbY + bezel * 0.5, camR, 0, Math.PI * 2);
  ctx.fillStyle = "#1A1A1C";
  ctx.fill();

  // Hinge
  const hingeY = mbY + screenOuterH;
  ctx.fillStyle = "#3A3A3C";
  ctx.fillRect(mbX + mbW * 0.05, hingeY, mbW * 0.9, hingeH);

  // Base
  const baseY = hingeY + hingeH;
  const baseW = mbW * 1.06;
  const baseX = mbX - (baseW - mbW) / 2;
  drawRoundedRect(ctx, baseX, baseY, baseW, baseH, baseH * 0.4);
  ctx.fillStyle = "#2C2C2E";
  ctx.fill();
  ctx.strokeStyle = "#48484A";
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Trackpad indent (subtle line)
  const tpW = baseW * 0.25;
  ctx.strokeStyle = "#48484A";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(baseX + (baseW - tpW) / 2, baseY + baseH * 0.5);
  ctx.lineTo(baseX + (baseW + tpW) / 2, baseY + baseH * 0.5);
  ctx.stroke();

  ctx.restore();
}

function drawMacBookPlaceholder(
  ctx: CanvasRenderingContext2D,
  mbX: number, mbY: number,
  mbW: number,
  accentColor: string, emoji: string,
) {
  const screenRatio = 10 / 16;
  const bezel = mbW * 0.02;
  const screenOuterH = mbW * screenRatio;
  const cornerR = mbW * 0.03;
  const baseH = mbW * 0.025;
  const hingeH = mbW * 0.012;

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.2)"; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
  drawRoundedRect(ctx, mbX, mbY, mbW, screenOuterH, cornerR);
  ctx.fillStyle = "#2C2C2E"; ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "#48484A"; ctx.lineWidth = 1; ctx.stroke();

  // Screen placeholder
  const sx = mbX + bezel, sy = mbY + bezel;
  const sw = mbW - bezel * 2, sh = screenOuterH - bezel * 2;
  const screenR = cornerR - bezel * 0.5;
  drawRoundedRect(ctx, sx, sy, sw, sh, screenR);
  const sg = ctx.createLinearGradient(sx, sy, sx, sy + sh);
  sg.addColorStop(0, "#FFFAFA"); sg.addColorStop(1, accentColor + "33");
  ctx.fillStyle = sg; ctx.fill();

  // Emoji
  ctx.font = `${mbW * 0.1}px serif`; ctx.textAlign = "center";
  ctx.fillText(emoji, mbX + mbW / 2, mbY + screenOuterH * 0.45);

  // Placeholder lines
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < 3; i++) {
    const lw = sw * (0.4 + seededRandom(i * 13) * 0.4);
    drawRoundedRect(ctx, mbX + (mbW - lw) / 2, mbY + screenOuterH * 0.55 + i * 18, lw, 8, 4);
    ctx.fillStyle = accentColor; ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Camera
  ctx.beginPath();
  ctx.arc(mbX + mbW / 2, mbY + bezel * 0.5, mbW * 0.006, 0, Math.PI * 2);
  ctx.fillStyle = "#1A1A1C"; ctx.fill();

  // Hinge + base
  const hingeY = mbY + screenOuterH;
  ctx.fillStyle = "#3A3A3C";
  ctx.fillRect(mbX + mbW * 0.05, hingeY, mbW * 0.9, hingeH);
  const baseW = mbW * 1.06, baseX = mbX - (baseW - mbW) / 2;
  drawRoundedRect(ctx, baseX, hingeY + hingeH, baseW, baseH, baseH * 0.4);
  ctx.fillStyle = "#2C2C2E"; ctx.fill();

  ctx.restore();
}

// ─── Custom Content Types ─────────────────────────────────────────────────────

interface PostContent {
  title: string;        // max 50 chars (excl. \n)
  highlights: string[]; // each max 40 chars
}

interface StoriesContent {
  title: string;        // max 60 chars
  tagline: string;      // max 40 chars
  triggers: string[];   // 2 items, each max 50 chars
  deliveryText: string; // max 60 chars
}

interface CarouselContent {
  slide1Title: string;   // max 50 chars
  slide1Tagline: string; // max 40 chars
  slide1Triggers: string[]; // 2 items
  slide3Triggers: string[]; // all triggers
  deliveryText: string;
}

interface FlyerContent {
  label: string;       // max 30 chars
  tagline: string;     // max 40 chars
  triggers: string[];  // 2 items
  deliveryText: string;
}

function defaultPostContent(p: ProductConfig): PostContent {
  return { title: p.heroTitle, highlights: [...p.highlights] };
}
function defaultStoriesContent(p: ProductConfig): StoriesContent {
  return { title: p.heroTitle, tagline: p.tagline, triggers: p.triggers.slice(0, 2), deliveryText: p.deliveryText };
}
function defaultCarouselContent(p: ProductConfig): CarouselContent {
  return { slide1Title: p.heroTitle, slide1Tagline: p.tagline, slide1Triggers: p.triggers.slice(0, 2), slide3Triggers: [...p.triggers], deliveryText: p.deliveryText };
}
function defaultFlyerContent(p: ProductConfig): FlyerContent {
  return { label: p.label, tagline: p.tagline, triggers: p.triggers.slice(0, 2), deliveryText: p.deliveryText };
}


// Consistent margin
const M = 60;

function generatePost(p: ProductConfig, screenshot: HTMLImageElement | null, desktopImg: HTMLImageElement | null, logo: HTMLImageElement | null, content: PostContent): HTMLCanvasElement {
  const W = 1080, H = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const c = p.colors;

  drawGradientBg(ctx, W, H, c.gradientStart, c.gradientEnd);
  drawSoftBlobs(ctx, W, H, c.accent, BRAND.primary);
  drawPetals(ctx, W, H, c.accent, 30);

  // ── Layout zones ──
  // Left col: text top + MacBook bottom | Right col: iPhone full height
  const leftColW = W * 0.50 - M;  // ~480px of text space
  const rightColX = W * 0.54;
  const rightColW = W - M - rightColX;

  // ── iPhone (right column, full height centered) ──
  const phoneW = rightColW;
  const phoneH = phoneW * 2.03;
  const phoneX = rightColX;
  const phoneY = (H - phoneH) / 2;
  if (screenshot) {
    drawIPhoneMockup(ctx, screenshot, phoneX, phoneY, phoneW, phoneH, 3);
  } else {
    drawIPhonePlaceholder(ctx, phoneX, phoneY, phoneW, phoneH, c.accent, p.id, 3);
  }

  // ── Left column: top section (text) ──
  // Logo
  drawLogo(ctx, logo, M, M - 10, 65);

  // Title — word-wrap within left column
  const titleText = content.title;
  ctx.font = "bold italic 64px serif"; ctx.fillStyle = c.accentDark; ctx.textAlign = "left";
  let ty = M + 105;
  for (const rawLine of titleText.split("\n")) {
    const words = rawLine.split(" ");
    let line = "";
    for (const word of words) {
      const test = line + word + " ";
      if (ctx.measureText(test).width > leftColW && line !== "") {
        ctx.fillText(line.trim(), M, ty); line = word + " "; ty += 78;
      } else { line = test; }
    }
    if (line.trim()) { ctx.fillText(line.trim(), M, ty); ty += 78; }
  }

  // Divider
  ctx.save(); ctx.strokeStyle = c.accent; ctx.lineWidth = 2; ctx.globalAlpha = 0.4;
  ctx.beginPath(); ctx.moveTo(M, ty + 5); ctx.lineTo(M + 140, ty + 5); ctx.stroke();
  ctx.globalAlpha = 1; ctx.restore();

  // Highlights — clipped to left column
  ty += 35;
  ctx.font = "24px sans-serif"; ctx.fillStyle = c.accentDark; ctx.textAlign = "left";
  for (const hl of content.highlights) {
    let hlText = hl;
    while (hlText.length > 0 && ctx.measureText(hlText).width > leftColW) hlText = hlText.slice(0, -1);
    ctx.fillText(hlText, M, ty);
    ty += 34;
  }

  // Delivery — wrap within left column
  ty += 14;
  ctx.font = "24px sans-serif"; ctx.fillStyle = c.accentDark; ctx.textAlign = "left";
  const delWords = p.deliveryText.split(" ");
  let delLine = "";
  for (const w of delWords) {
    const test = delLine + w + " ";
    if (ctx.measureText(test).width > leftColW && delLine !== "") {
      ctx.fillText(delLine.trim(), M, ty); delLine = w + " "; ty += 32;
    } else { delLine = test; }
  }
  ctx.fillText(delLine.trim(), M, ty);

  // MacBook bottom-left — only if desktop screenshot provided
  if (desktopImg) {
    const mbW = Math.min(leftColW + 40, 420);
    const mbScreenH = mbW * (10 / 16);
    const mbTotalH = mbScreenH + mbW * 0.037;
    const mbX = M;
    const mbY = H - M - mbTotalH;
    drawMacBookMockup(ctx, desktopImg, mbX, mbY, mbW);
  }

  // Branding bottom-right
  drawScript(ctx, "paperbloom.com.br", W - M - 100, H - M + 10, 22, c.accentDark + "44");

  return canvas;
}

function generateStories(p: ProductConfig, screenshot: HTMLImageElement | null, logo: HTMLImageElement | null, content: StoriesContent): HTMLCanvasElement {
  const W = 1080, H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const c = p.colors;

  drawGradientBg(ctx, W, H, c.gradientStart, c.gradientEnd);
  drawSoftBlobs(ctx, W, H, c.accent, BRAND.primary);
  drawPetals(ctx, W, H, c.accent, 50);

  // Logo top-center
  drawLogo(ctx, logo, (W - 80) / 2, M, 80);

  let y = M + 120;
  centerText(ctx, p.emoji, y, "90px serif", "#000", W);
  y += 90;
  drawScript(ctx, content.tagline, W / 2, y, 48, c.accentDark);
  y += 35;
  drawDivider(ctx, W / 2, y, 180, c.accent);
  y += 55;

  // Title
  const titleEnd = drawMultilineTitle(ctx, content.title, W / 2, y, "bold italic 66px serif", c.accentDark, 80);
  y = titleEnd + 50;

  // iPhone mockup
  const phoneW = 440, phoneH = phoneW * 2.03;
  const phoneX = (W - phoneW) / 2;
  if (screenshot) {
    drawIPhoneMockup(ctx, screenshot, phoneX, y, phoneW, phoneH);
  } else {
    drawIPhonePlaceholder(ctx, phoneX, y, phoneW, phoneH, c.accent, p.id);
  }
  y += phoneH + 50;

  // Triggers
  for (const trigger of content.triggers.slice(0, 2)) {
    centerText(ctx, trigger, y, "32px sans-serif", c.accentDark, W);
    y += 48;
  }
  y += 10;
  centerText(ctx, content.deliveryText, y, "30px sans-serif", c.accentDark, W);

  // Bottom
  drawScript(ctx, "paperbloom.com.br", W / 2, H - M, 26, c.accentDark + "55");

  return canvas;
}

function generateCarousel(p: ProductConfig, screenshot: HTMLImageElement | null, desktopImg: HTMLImageElement | null, logo: HTMLImageElement | null, content: CarouselContent): HTMLCanvasElement[] {
  const W = 1080, H = 1080;
  const c = p.colors;
  const slides: HTMLCanvasElement[] = [];
  const dotY = H - M + 10;
  const drawDots = (ctx: CanvasRenderingContext2D, active: number) => {
    [0, 1, 2].forEach((_, i) => {
      ctx.beginPath(); ctx.arc(W / 2 + (i - 1) * 28, dotY, 6, 0, Math.PI * 2);
      ctx.fillStyle = i === active ? c.accentDark : c.accent + "55"; ctx.fill();
    });
  };

  // ── Slide 1: Hook — text left, phone right ──
  {
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d")!;
    drawGradientBg(ctx, W, H, c.gradientStart, c.gradientEnd);
    drawSoftBlobs(ctx, W, H, c.accent, BRAND.primary);
    drawPetals(ctx, W, H, c.accent, 25);

    const leftColW = W * 0.50 - M;
    const rightColX = W * 0.54;
    const rightColW = W - M - rightColX;

    // Logo top-left
    drawLogo(ctx, logo, M, M - 10, 60);

    // Title — wrap within left column
    ctx.font = "bold italic 58px serif"; ctx.fillStyle = c.accentDark; ctx.textAlign = "left";
    let ty = M + 100;
    for (const rawLine of content.slide1Title.split("\n")) {
      const words = rawLine.split(" ");
      let line = "";
      for (const word of words) {
        const test = line + word + " ";
        if (ctx.measureText(test).width > leftColW && line !== "") {
          ctx.fillText(line.trim(), M, ty); line = word + " "; ty += 70;
        } else { line = test; }
      }
      if (line.trim()) { ctx.fillText(line.trim(), M, ty); ty += 70; }
    }

    // Tagline — wrap within left column
    ctx.font = "italic 32px serif"; ctx.fillStyle = c.accentDark; ctx.textAlign = "left";
    const tagWords = content.slide1Tagline.split(" ");
    let tagLine = ""; ty += 15;
    for (const w of tagWords) {
      const test = tagLine + w + " ";
      if (ctx.measureText(test).width > leftColW && tagLine !== "") {
        ctx.fillText(tagLine.trim(), M, ty); tagLine = w + " "; ty += 38;
      } else { tagLine = test; }
    }
    ctx.fillText(tagLine.trim(), M, ty);

    // Triggers
    ty += 50;
    drawTrigger(ctx, content.slide1Triggers[0] ?? "", M, ty, "26px sans-serif", c.accentDark);
    ty += 40;
    drawTrigger(ctx, content.slide1Triggers[1] ?? "", M, ty, "26px sans-serif", c.accentDark);

    // Phone right
    const phoneW = rightColW;
    const phoneH = phoneW * 2.03;
    const phoneX = rightColX;
    const phoneY = (H - phoneH) / 2;
    if (screenshot) {
      drawIPhoneMockup(ctx, screenshot, phoneX, phoneY, phoneW, phoneH, 4);
    } else {
      drawIPhonePlaceholder(ctx, phoneX, phoneY, phoneW, phoneH, c.accent, p.id, 4);
    }

    centerText(ctx, "Deslize →", H - M - 30, "bold 30px sans-serif", c.accentDark + "66", W);
    drawDots(ctx, 0);
    slides.push(cv);
  }

  // ── Slide 2: Features ──
  {
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d")!;
    drawGradientBg(ctx, W, H, c.gradientStart, c.gradientEnd);
    drawSoftBlobs(ctx, W, H, c.accent, BRAND.primary);

    drawLogo(ctx, logo, (W - 60) / 2, M - 10, 60);

    let y = M + 80;
    centerText(ctx, "O que você recebe:", y, "bold italic 50px serif", c.accentDark, W);
    y += 42;
    drawDivider(ctx, W / 2, y, 160, c.accent);
    y += 50;

    for (const feat of p.features) {
      ctx.save();
      drawRoundedRect(ctx, M + 40, y - 30, W - M * 2 - 80, 60, 16);
      ctx.fillStyle = BRAND.white + "BB"; ctx.fill();
      ctx.font = "30px sans-serif"; ctx.fillStyle = c.accentDark; ctx.textAlign = "center";
      ctx.fillText(`✓  ${feat}`, W / 2, y + 10); ctx.restore();
      y += 80;
    }

    y += 20;
    drawDivider(ctx, W / 2, y, 130, c.accent);
    y += 40;
    for (const trigger of p.triggers.slice(0, 2)) {
      centerText(ctx, trigger, y, "28px sans-serif", c.accentDark, W);
      y += 44;
    }

    // Small phone
    if (screenshot) {
      const maxH = H - y - M - 30;
      const pw = Math.min(180, maxH / 2.03);
      const ph = pw * 2.03;
      drawIPhoneMockup(ctx, screenshot, (W - pw) / 2, y + 15, pw, ph);
    }

    drawDots(ctx, 1);
    slides.push(cv);
  }

  // ── Slide 3: Social proof — MacBook + phone ──
  {
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d")!;
    drawGradientBg(ctx, W, H, c.gradientStart, c.gradientEnd);
    drawSoftBlobs(ctx, W, H, c.accent, BRAND.primary);
    drawPetals(ctx, W, H, c.accent, 40);

    drawLogo(ctx, logo, (W - 60) / 2, M - 10, 60);

    let y = M + 80;
    centerText(ctx, p.emoji, y + 30, "90px serif", "#000", W);
    y += 120;
    drawScript(ctx, "Presente perfeito", W / 2, y, 54, c.accentDark);
    y += 35;
    drawDivider(ctx, W / 2, y, 160, c.accent);
    y += 45;

    for (const trigger of content.slide3Triggers) {
      centerText(ctx, trigger, y, "30px sans-serif", c.accentDark, W);
      y += 48;
    }
    y += 10;
    centerText(ctx, content.deliveryText, y, "28px sans-serif", c.accentDark, W);
    y += 45;

    // Mockups row — MacBook only if desktop image provided
    const mockupH = H - y - M - 20;

    if (desktopImg) {
      const mbW = (W - M * 2 - 40) * 0.56;
      const mbScreenH = mbW * (10 / 16);
      const mbX = M;
      const mbY = y + (mockupH - mbScreenH) / 2 - 10;
      drawMacBookMockup(ctx, desktopImg, mbX, mbY, mbW);
    }

    const phoneW = (W - M * 2 - 40) * 0.26;
    const phoneH = phoneW * 2.03;
    const phoneX = W - M - phoneW;
    const phoneY = y + (mockupH - phoneH) / 2;
    if (screenshot) {
      drawIPhoneMockup(ctx, screenshot, phoneX, phoneY, phoneW, phoneH, 5);
    } else {
      drawIPhonePlaceholder(ctx, phoneX, phoneY, phoneW, phoneH, c.accent, p.id, 5);
    }

    drawDots(ctx, 2);
    slides.push(cv);
  }

  return slides;
}

function generateFlyer(p: ProductConfig, screenshot: HTMLImageElement | null, desktopImg: HTMLImageElement | null, logo: HTMLImageElement | null, content: FlyerContent): HTMLCanvasElement {
  const W = 1080, H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const c = p.colors;

  drawGradientBg(ctx, W, H, c.gradientStart, c.gradientEnd);
  drawSoftBlobs(ctx, W, H, c.accent, BRAND.primary);
  drawPetals(ctx, W, H, c.accent, 45);

  // Logo top-center
  drawLogo(ctx, logo, (W - 70) / 2, M - 5, 70);

  let y = M + 85;
  centerText(ctx, p.emoji, y, "80px serif", "#000", W);
  y += 75;
  centerText(ctx, content.label, y, "bold italic 60px serif", c.accentDark, W);
  y += 60;
  drawScript(ctx, content.tagline, W / 2, y, 40, c.accentDark);
  y += 35;
  drawDivider(ctx, W / 2, y, 180, c.accent);
  y += 40;

  // Mockups area — MacBook only if desktop image provided
  const bottomH = 170;
  const mockupAreaH = H - y - bottomH;
  const contentW = W - M * 2;

  if (desktopImg) {
    const mbW = contentW * 0.55;
    const mbScreenH = mbW * (10 / 16);
    const mbTotalH = mbScreenH + mbW * 0.037;
    const mbX = M;
    const mbY = y + (mockupAreaH - mbTotalH) / 2;
    drawMacBookMockup(ctx, desktopImg, mbX, mbY, mbW);
  }

  // iPhone — if no MacBook, center it; if MacBook, put it on the right
  const phoneW = desktopImg ? contentW * 0.30 : contentW * 0.38;
  const phoneH = phoneW * 2.03;
  const phoneX = desktopImg ? W - M - phoneW : (W - phoneW) / 2;
  const phoneY = y + (mockupAreaH - phoneH) / 2;
  if (screenshot) {
    drawIPhoneMockup(ctx, screenshot, phoneX, phoneY, phoneW, phoneH, 3);
  } else {
    drawIPhonePlaceholder(ctx, phoneX, phoneY, phoneW, phoneH, c.accent, p.id, 3);
  }

  // Bottom
  let belowY = H - bottomH + 10;
  for (const trigger of content.triggers.slice(0, 2)) {
    centerText(ctx, trigger, belowY, "28px sans-serif", c.accentDark, W);
    belowY += 42;
  }
  belowY += 10;
  centerText(ctx, content.deliveryText, belowY, "26px sans-serif", c.accentDark, W);

  drawScript(ctx, "paperbloom.com.br", W / 2, H - M + 5, 24, c.accentDark + "55");

  return canvas;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}

function copyToClipboard(text: string) { navigator.clipboard.writeText(text); }

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AdminMarketingPage() {
  const [selectedProduct, setSelectedProduct] = useState<ProductId>("mensagem-digital");
  const [selectedFormat, setSelectedFormat] = useState<CreativeFormat>("post");
  const [previews, setPreviews] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const canvasesRef = useRef<HTMLCanvasElement[]>([]);
  const logoRef = useRef<HTMLImageElement | null>(null);

  // Preload logo
  useEffect(() => {
    const img = new Image();
    img.onload = () => { logoRef.current = img; };
    img.src = "/logo-icon.png";
  }, []);
  const [screenshots, setScreenshots] = useState<Record<ProductId, { file: File; img: HTMLImageElement; preview: string } | null>>({
    "mensagem-digital": null, "12-cartas": null, "revelacao-virtual": null,
  });
  const [desktopScreenshots, setDesktopScreenshots] = useState<Record<ProductId, { file: File; img: HTMLImageElement; preview: string } | null>>({
    "mensagem-digital": null, "12-cartas": null, "revelacao-virtual": null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const desktopFileInputRef = useRef<HTMLInputElement>(null);
  const product = PRODUCTS[selectedProduct];
  const format = FORMATS.find((f) => f.id === selectedFormat)!;
  const currentScreenshot = screenshots[selectedProduct];
  const currentDesktopScreenshot = desktopScreenshots[selectedProduct];

  // Editable content per format — reset when product changes
  const [postContent, setPostContent] = useState<PostContent>(() => defaultPostContent(PRODUCTS["mensagem-digital"]));
  const [storiesContent, setStoriesContent] = useState<StoriesContent>(() => defaultStoriesContent(PRODUCTS["mensagem-digital"]));
  const [carouselContent, setCarouselContent] = useState<CarouselContent>(() => defaultCarouselContent(PRODUCTS["mensagem-digital"]));
  const [flyerContent, setFlyerContent] = useState<FlyerContent>(() => defaultFlyerContent(PRODUCTS["mensagem-digital"]));

  useEffect(() => {
    const p = PRODUCTS[selectedProduct];
    setPostContent(defaultPostContent(p));
    setStoriesContent(defaultStoriesContent(p));
    setCarouselContent(defaultCarouselContent(p));
    setFlyerContent(defaultFlyerContent(p));
    setPreviews([]);
  }, [selectedProduct]);

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = await loadImage(file);
    const preview = URL.createObjectURL(file);
    setScreenshots((prev) => ({ ...prev, [selectedProduct]: { file, img, preview } }));
    setPreviews([]);
  };

  const handleDesktopUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = await loadImage(file);
    const preview = URL.createObjectURL(file);
    setDesktopScreenshots((prev) => ({ ...prev, [selectedProduct]: { file, img, preview } }));
    setPreviews([]);
  };

  const removeScreenshot = () => {
    if (currentScreenshot) URL.revokeObjectURL(currentScreenshot.preview);
    setScreenshots((prev) => ({ ...prev, [selectedProduct]: null }));
    setPreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeDesktopScreenshot = () => {
    if (currentDesktopScreenshot) URL.revokeObjectURL(currentDesktopScreenshot.preview);
    setDesktopScreenshots((prev) => ({ ...prev, [selectedProduct]: null }));
    setPreviews([]);
    if (desktopFileInputRef.current) desktopFileInputRef.current.value = "";
  };

  const generatePreviews = useCallback(() => {
    const img = screenshots[selectedProduct]?.img ?? null;
    const dImg = desktopScreenshots[selectedProduct]?.img ?? null;
    const logo = logoRef.current;
    let canvases: HTMLCanvasElement[];
    if (selectedFormat === "post") canvases = [generatePost(product, img, dImg, logo, postContent)];
    else if (selectedFormat === "stories") canvases = [generateStories(product, img, logo, storiesContent)];
    else if (selectedFormat === "carousel") canvases = generateCarousel(product, img, dImg, logo, carouselContent);
    else canvases = [generateFlyer(product, img, dImg, logo, flyerContent)];
    canvasesRef.current = canvases;
    setPreviews(canvases.map((c) => c.toDataURL("image/png")));
  }, [selectedProduct, selectedFormat, product, screenshots, desktopScreenshots, postContent, storiesContent, carouselContent, flyerContent]);

  const handleDownload = (index: number) => {
    const canvas = canvasesRef.current[index];
    if (!canvas) return;
    const suffix = canvasesRef.current.length > 1 ? `-${index + 1}` : "";
    downloadCanvas(canvas, `paperbloom-${selectedProduct}-${selectedFormat}${suffix}.png`);
  };

  const handleDownloadAll = () => {
    canvasesRef.current.forEach((canvas, i) => {
      setTimeout(() => {
        const suffix = canvasesRef.current.length > 1 ? `-${i + 1}` : "";
        downloadCanvas(canvas, `paperbloom-${selectedProduct}-${selectedFormat}${suffix}.png`);
      }, i * 300);
    });
  };

  const handleCopy = (text: string, index: number) => {
    copyToClipboard(text); setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Megaphone className="text-[#D4A5A5]" size={28} />
          Marketing — Criativos Meta Ads
        </h1>
        <p className="text-gray-500 mt-1">Gere criativos com a identidade Paper Bloom para campanhas no Instagram e Facebook</p>
      </div>

      {/* Product Selector */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Selecione o Produto</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.values(PRODUCTS).map((p) => {
            const isActive = selectedProduct === p.id;
            const hasScreenshot = !!screenshots[p.id];
            const hasDesktop = !!desktopScreenshots[p.id];
            return (
              <button key={p.id} onClick={() => { setSelectedProduct(p.id); setPreviews([]); }}
                className={`p-5 rounded-xl border-2 transition-all text-left relative ${isActive ? "border-[#E6C2C2] bg-[#FFFAFA] shadow-md" : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{p.emoji}</span>
                  <div>
                    <p className={`font-semibold ${isActive ? "text-[#8B5F5F]" : "text-gray-900"}`}>{p.label}</p>
                    <p className="text-sm text-gray-500">{p.price}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 italic">{p.tagline}</p>
                {hasScreenshot && <span className="absolute top-3 right-3 w-3 h-3 bg-green-400 rounded-full" title="Mobile carregado" />}
                {hasDesktop && <span className="absolute top-3 right-8 w-3 h-3 bg-blue-400 rounded-full" title="Desktop carregado" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Screenshot Uploads */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Screenshots — {product.label}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mobile screenshot */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Smartphone size={16} className="text-[#D4A5A5]" />
              <p className="text-sm font-medium text-gray-700">Print Mobile (iPhone)</p>
            </div>
            <p className="text-xs text-gray-400 mb-3">{product.screenshotHint}</p>
            {currentScreenshot ? (
              <div className="flex items-start gap-3">
                <div className="relative w-24 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                  <img src={currentScreenshot.preview} alt="Mobile" className="w-full" />
                  <button onClick={removeScreenshot} className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors" title="Remover"><X size={12} /></button>
                </div>
                <div>
                  <p className="text-xs text-green-600 font-medium">✓ Carregado</p>
                  <p className="text-xs text-gray-400">{currentScreenshot.img.width}×{currentScreenshot.img.height}px</p>
                  <button onClick={() => fileInputRef.current?.click()} className="mt-1 text-xs text-[#8B5F5F] hover:underline">Trocar</button>
                </div>
              </div>
            ) : (
              <button onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-gray-300 hover:border-[#E6C2C2] rounded-xl p-6 text-center transition-colors group">
                <Upload size={24} className="mx-auto text-gray-300 group-hover:text-[#D4A5A5] transition-colors" />
                <p className="text-xs text-gray-500 mt-2">Upload do print mobile</p>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleScreenshotUpload} className="hidden" />
          </div>

          {/* Desktop screenshot */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} className="text-[#D4A5A5]" />
              <p className="text-sm font-medium text-gray-700">Print Desktop (MacBook)</p>
            </div>
            <p className="text-xs text-gray-400 mb-3">{product.desktopHint}</p>
            {currentDesktopScreenshot ? (
              <div className="flex items-start gap-3">
                <div className="relative w-32 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                  <img src={currentDesktopScreenshot.preview} alt="Desktop" className="w-full" />
                  <button onClick={removeDesktopScreenshot} className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors" title="Remover"><X size={12} /></button>
                </div>
                <div>
                  <p className="text-xs text-green-600 font-medium">✓ Carregado</p>
                  <p className="text-xs text-gray-400">{currentDesktopScreenshot.img.width}×{currentDesktopScreenshot.img.height}px</p>
                  <button onClick={() => desktopFileInputRef.current?.click()} className="mt-1 text-xs text-[#8B5F5F] hover:underline">Trocar</button>
                </div>
              </div>
            ) : (
              <button onClick={() => desktopFileInputRef.current?.click()} className="w-full border-2 border-dashed border-gray-300 hover:border-[#E6C2C2] rounded-xl p-6 text-center transition-colors group">
                <Upload size={24} className="mx-auto text-gray-300 group-hover:text-[#D4A5A5] transition-colors" />
                <p className="text-xs text-gray-500 mt-2">Upload do print desktop</p>
              </button>
            )}
            <input ref={desktopFileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleDesktopUpload} className="hidden" />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4 italic">O print mobile aparece no iPhone e o desktop no MacBook. Sem prints, usam placeholders estilizados.</p>
      </div>

      {/* Content Editor — dynamic per format */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-2">
          <Type size={16} />
          Editar Conteúdo — {format.label}
        </h2>
        <p className="text-xs text-gray-400 mb-5">Personalize os textos do criativo. Use Enter para quebrar linha no título.</p>

        {/* ── POST ── */}
        {selectedFormat === "post" && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">Título</label>
                <span className={`text-xs ${postContent.title.replace(/\n/g, "").length > 50 ? "text-red-400" : "text-gray-400"}`}>
                  {postContent.title.replace(/\n/g, "").length}/50
                </span>
              </div>
              <textarea rows={2} value={postContent.title}
                onChange={(e) => { if (e.target.value.replace(/\n/g, "").length <= 50) { setPostContent(c => ({ ...c, title: e.target.value })); setPreviews([]); } }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#E6C2C2] resize-none font-serif italic"
              />
              <p className="text-xs text-gray-400 mt-1">Use Enter para quebrar em duas linhas</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Destaques</label>
                <span className="text-xs text-gray-400">{postContent.highlights.length} linha{postContent.highlights.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="space-y-2">
                {postContent.highlights.map((hl, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-4 shrink-0">{i + 1}</span>
                    <div className="flex-1 relative">
                      <input type="text" value={hl} maxLength={40}
                        onChange={(e) => { const next = [...postContent.highlights]; next[i] = e.target.value; setPostContent(c => ({ ...c, highlights: next })); setPreviews([]); }}
                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:border-[#E6C2C2] pr-10"
                      />
                      <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs ${hl.length > 35 ? "text-orange-400" : "text-gray-300"}`}>{hl.length}/40</span>
                    </div>
                    <button onClick={() => { setPostContent(c => ({ ...c, highlights: c.highlights.filter((_, idx) => idx !== i) })); setPreviews([]); }} className="shrink-0 p-1 text-gray-300 hover:text-red-400 transition-colors"><X size={16} /></button>
                  </div>
                ))}
              </div>
              <button onClick={() => { setPostContent(c => ({ ...c, highlights: [...c.highlights, "✦ "] })); setPreviews([]); }} className="mt-3 flex items-center gap-1.5 text-xs text-[#8B5F5F] hover:text-[#6B4040] transition-colors">
                <span className="w-5 h-5 rounded-full border border-[#D4A5A5] flex items-center justify-center text-[#D4A5A5] font-bold">+</span>
                Adicionar destaque
              </button>
            </div>
            <button onClick={() => { setPostContent(defaultPostContent(product)); setPreviews([]); }} className="text-xs text-[#8B5F5F] hover:underline">Restaurar padrão</button>
          </div>
        )}

        {/* ── STORIES ── */}
        {selectedFormat === "stories" && (
          <div className="space-y-4">
            {[
              { label: "Título", key: "title" as const, max: 60, rows: 2, hint: "Use Enter para quebrar linha" },
              { label: "Tagline", key: "tagline" as const, max: 40, rows: 1 },
              { label: "Frase de entrega", key: "deliveryText" as const, max: 60, rows: 1 },
            ].map(({ label, key, max, rows, hint }) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">{label}</label>
                  <span className={`text-xs ${storiesContent[key].length > max * 0.9 ? "text-orange-400" : "text-gray-400"}`}>{storiesContent[key].length}/{max}</span>
                </div>
                <textarea rows={rows} value={storiesContent[key]} maxLength={max}
                  onChange={(e) => { setStoriesContent(c => ({ ...c, [key]: e.target.value })); setPreviews([]); }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#E6C2C2] resize-none"
                />
                {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
              </div>
            ))}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Gatilhos (2)</label>
              <div className="space-y-2">
                {storiesContent.triggers.map((t, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-4 shrink-0">{i + 1}</span>
                    <input type="text" value={t} maxLength={50}
                      onChange={(e) => { const next = [...storiesContent.triggers]; next[i] = e.target.value; setStoriesContent(c => ({ ...c, triggers: next })); setPreviews([]); }}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:border-[#E6C2C2]"
                    />
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => { setStoriesContent(defaultStoriesContent(product)); setPreviews([]); }} className="text-xs text-[#8B5F5F] hover:underline">Restaurar padrão</button>
          </div>
        )}

        {/* ── CAROUSEL ── */}
        {selectedFormat === "carousel" && (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold text-[#D4A5A5] uppercase mb-3">Slide 1 — Hook</p>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700">Título</label>
                    <span className={`text-xs ${carouselContent.slide1Title.replace(/\n/g, "").length > 50 ? "text-red-400" : "text-gray-400"}`}>{carouselContent.slide1Title.replace(/\n/g, "").length}/50</span>
                  </div>
                  <textarea rows={2} value={carouselContent.slide1Title}
                    onChange={(e) => { if (e.target.value.replace(/\n/g, "").length <= 50) { setCarouselContent(c => ({ ...c, slide1Title: e.target.value })); setPreviews([]); } }}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#E6C2C2] resize-none font-serif italic"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700">Tagline</label>
                    <span className={`text-xs ${carouselContent.slide1Tagline.length > 36 ? "text-orange-400" : "text-gray-400"}`}>{carouselContent.slide1Tagline.length}/40</span>
                  </div>
                  <input type="text" value={carouselContent.slide1Tagline} maxLength={40}
                    onChange={(e) => { setCarouselContent(c => ({ ...c, slide1Tagline: e.target.value })); setPreviews([]); }}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:border-[#E6C2C2]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Gatilhos (2)</label>
                  <div className="space-y-2">
                    {carouselContent.slide1Triggers.map((t, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-4 shrink-0">{i + 1}</span>
                        <input type="text" value={t} maxLength={50}
                          onChange={(e) => { const next = [...carouselContent.slide1Triggers]; next[i] = e.target.value; setCarouselContent(c => ({ ...c, slide1Triggers: next })); setPreviews([]); }}
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:border-[#E6C2C2]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-[#D4A5A5] uppercase mb-3">Slide 3 — Social Proof</p>
              <div className="space-y-2">
                {carouselContent.slide3Triggers.map((t, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-4 shrink-0">{i + 1}</span>
                    <input type="text" value={t} maxLength={50}
                      onChange={(e) => { const next = [...carouselContent.slide3Triggers]; next[i] = e.target.value; setCarouselContent(c => ({ ...c, slide3Triggers: next })); setPreviews([]); }}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:border-[#E6C2C2]"
                    />
                    <button onClick={() => { setCarouselContent(c => ({ ...c, slide3Triggers: c.slide3Triggers.filter((_, idx) => idx !== i) })); setPreviews([]); }} className="shrink-0 p-1 text-gray-300 hover:text-red-400 transition-colors"><X size={16} /></button>
                  </div>
                ))}
                <button onClick={() => { setCarouselContent(c => ({ ...c, slide3Triggers: [...c.slide3Triggers, ""] })); setPreviews([]); }} className="mt-1 flex items-center gap-1.5 text-xs text-[#8B5F5F] hover:text-[#6B4040] transition-colors">
                  <span className="w-5 h-5 rounded-full border border-[#D4A5A5] flex items-center justify-center text-[#D4A5A5] font-bold">+</span>
                  Adicionar gatilho
                </button>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">Frase de entrega</label>
                  <span className={`text-xs ${carouselContent.deliveryText.length > 54 ? "text-orange-400" : "text-gray-400"}`}>{carouselContent.deliveryText.length}/60</span>
                </div>
                <input type="text" value={carouselContent.deliveryText} maxLength={60}
                  onChange={(e) => { setCarouselContent(c => ({ ...c, deliveryText: e.target.value })); setPreviews([]); }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:border-[#E6C2C2]"
                />
              </div>
            </div>
            <button onClick={() => { setCarouselContent(defaultCarouselContent(product)); setPreviews([]); }} className="text-xs text-[#8B5F5F] hover:underline">Restaurar padrão</button>
          </div>
        )}

        {/* ── FLYER ── */}
        {selectedFormat === "flyer" && (
          <div className="space-y-4">
            {[
              { label: "Nome do produto", key: "label" as const, max: 30 },
              { label: "Tagline", key: "tagline" as const, max: 40 },
              { label: "Frase de entrega", key: "deliveryText" as const, max: 60 },
            ].map(({ label, key, max }) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">{label}</label>
                  <span className={`text-xs ${flyerContent[key].length > max * 0.9 ? "text-orange-400" : "text-gray-400"}`}>{flyerContent[key].length}/{max}</span>
                </div>
                <input type="text" value={flyerContent[key]} maxLength={max}
                  onChange={(e) => { setFlyerContent(c => ({ ...c, [key]: e.target.value })); setPreviews([]); }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:border-[#E6C2C2]"
                />
              </div>
            ))}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Gatilhos (2)</label>
              <div className="space-y-2">
                {flyerContent.triggers.map((t, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-4 shrink-0">{i + 1}</span>
                    <input type="text" value={t} maxLength={50}
                      onChange={(e) => { const next = [...flyerContent.triggers]; next[i] = e.target.value; setFlyerContent(c => ({ ...c, triggers: next })); setPreviews([]); }}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:border-[#E6C2C2]"
                    />
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => { setFlyerContent(defaultFlyerContent(product)); setPreviews([]); }} className="text-xs text-[#8B5F5F] hover:underline">Restaurar padrão</button>
          </div>
        )}
      </div>

      {/* Format Selector */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Formato do Criativo</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {FORMATS.map((f) => {
            const Icon = f.icon;
            const isActive = selectedFormat === f.id;
            return (
              <button key={f.id} onClick={() => { setSelectedFormat(f.id); setPreviews([]); }}
                className={`p-4 rounded-xl border-2 transition-all text-center ${isActive ? "border-[#E6C2C2] bg-[#FFFAFA] shadow-md" : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                <Icon size={24} />
                <p className={`font-medium mt-2 ${isActive ? "text-[#8B5F5F]" : "text-gray-700"}`}>{f.label}</p>
                <p className="text-xs text-gray-400 mt-1">{f.desc}</p>
              </button>
            );
          })}
        </div>
        <button onClick={generatePreviews}
          className="mt-6 w-full md:w-auto px-8 py-3 bg-[#D4A5A5] hover:bg-[#C49494] text-white font-semibold rounded-full transition-colors flex items-center gap-2 justify-center shadow-lg shadow-[#D4A5A5]/20">
          <ImageIcon size={20} /> Gerar Criativos
        </button>
      </div>

      {/* Preview */}
      {previews.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Preview — {product.label} ({format.label})</h2>
            <button onClick={handleDownloadAll} className="px-4 py-2 bg-[#8B5F5F] hover:bg-[#7A5050] text-white text-sm font-medium rounded-full flex items-center gap-2 transition-colors">
              <Download size={16} /> Baixar {previews.length > 1 ? "Todas" : "Imagem"}
            </button>
          </div>
          <div className={`grid gap-6 ${previews.length > 1 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 max-w-lg mx-auto"}`}>
            {previews.map((src, i) => (
              <div key={i} className="relative group">
                <img src={src} alt={`Criativo ${i + 1}`} className="w-full rounded-lg shadow-md border border-gray-100" />
                <button onClick={() => handleDownload(i)} className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity" title="Baixar">
                  <Download size={18} className="text-gray-700" />
                </button>
                {previews.length > 1 && <p className="text-center text-xs text-gray-400 mt-2">Slide {i + 1} de {previews.length}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Copy Suggestions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
          <Type size={18} /> Sugestões de Copy — {product.label}
        </h2>
        <div className="space-y-4">
          {product.copyOptions.map((copy, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-5 hover:border-[#E6C2C2] transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-[#D4A5A5] uppercase mb-2">{copy.title}</p>
                  <p className="text-sm font-semibold text-gray-800 mb-1">Título: <span className="font-normal text-gray-600">{copy.headline}</span></p>
                  <p className="text-sm text-gray-600 leading-relaxed">{copy.primaryText}</p>
                </div>
                <button onClick={() => handleCopy(`Título: ${copy.headline}\n\n${copy.primaryText}`, i)} className="shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Copiar">
                  {copiedIndex === i ? <span className="text-green-500 text-xs font-medium">Copiado!</span> : <Copy size={18} className="text-gray-400" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audience Suggestions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
          <Users size={18} /> Sugestões de Público — {product.label}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {product.audiences.map((aud, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-5 hover:border-[#E6C2C2] transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Target size={16} className="text-[#D4A5A5]" />
                <p className="font-semibold text-gray-800 text-sm">{aud.name}</p>
              </div>
              <p className="text-xs text-gray-500">{aud.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
