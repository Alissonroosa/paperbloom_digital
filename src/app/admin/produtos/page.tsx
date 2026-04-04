"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Package,
  Download,
  Image as ImageIcon,
  Smartphone,
  Upload,
  X,
  Palette,
  Type,
  Move,
} from "lucide-react";

// ─── Brand ───────────────────────────────────────────────────────────────────

const BRAND = {
  primary: "#E6C2C2",
  secondary: "#D4A5A5",
  background: "#FFFAFA",
  textMain: "#4A4A4A",
  textAccent: "#8B5F5F",
  white: "#FFFFFF",
};

// ─── Emoji list for background ───────────────────────────────────────────────

const EMOJI_OPTIONS = [
  "✨", "🌟", "⭐", "💫", "🔥", "❤️", "💖", "💕", "🎁", "🎉",
  "🛍️", "🛒", "📦", "🏷️", "💰", "🤩", "😍", "🥰", "👑", "💎",
  "🌸", "🌺", "🦋", "🍀", "☕", "🧁", "🎨", "🪄", "⚡", "🌈",
];

// ─── Color presets ───────────────────────────────────────────────────────────

const COLOR_PRESETS = [
  { name: "Paper Bloom", primary: "#E6C2C2", dark: "#8B5F5F", gradientEnd: "#F5E0E0" },
  { name: "Azul Sereno", primary: "#B8D4E8", dark: "#4A6F8A", gradientEnd: "#E0EEF8" },
  { name: "Verde Menta", primary: "#B8E8C8", dark: "#4A8A5F", gradientEnd: "#E0F8E8" },
  { name: "Roxo Suave", primary: "#D4B8E8", dark: "#6B4A8A", gradientEnd: "#EDE0F8" },
  { name: "Laranja Quente", primary: "#E8CDB8", dark: "#8A6B4A", gradientEnd: "#F8EDE0" },
  { name: "Amarelo Sol", primary: "#E8E0B8", dark: "#8A824A", gradientEnd: "#F8F4E0" },
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProductFormData {
  title: string;
  description: string;
  price: string;
  cta: string;
  emoji: string;
  colorPresetIndex: number;
  customColor: string;
  useCustomColor: boolean;
}

interface ProductPhoto {
  file: File;
  img: HTMLImageElement;
  preview: string;
}

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

function drawGradientBg(ctx: CanvasRenderingContext2D, W: number, H: number, start: string, end: string) {
  const grad = ctx.createLinearGradient(0, 0, W * 0.3, H);
  grad.addColorStop(0, start); grad.addColorStop(1, end);
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
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

function drawFloatingEmojis(ctx: CanvasRenderingContext2D, W: number, H: number, emoji: string, count: number) {
  const sizes = [
    14, 16, 18, 20,
    28, 32, 36,
    48, 56, 64, 72,
  ];

  // Place emojis with minimum distance to avoid overlap
  const placed: { x: number; y: number; r: number }[] = [];

  for (let i = 0; i < count; i++) {
    const sizeIdx = Math.floor(seededRandom(i * 7 + 3) * sizes.length);
    const size = sizes[sizeIdx];
    const minDist = size * 0.7;

    let bestX = 0, bestY = 0;
    for (let a = 0; a < 8; a++) {
      const cx = seededRandom(i * 7 + 1 + a * 31) * W;
      const cy = seededRandom(i * 7 + 2 + a * 37) * H;
      bestX = cx; bestY = cy;
      let ok = true;
      for (const p of placed) {
        const dx = cx - p.x, dy = cy - p.y;
        if (Math.sqrt(dx * dx + dy * dy) < minDist + p.r) { ok = false; break; }
      }
      if (ok) break;
    }

    placed.push({ x: bestX, y: bestY, r: minDist });

    const rotation = seededRandom(i * 7 + 4) * Math.PI * 2;
    const sizeRatio = size / 72;
    const alpha = 0.04 + sizeRatio * 0.16;

    ctx.save();
    ctx.translate(bestX, bestY);
    ctx.rotate(rotation);
    ctx.globalAlpha = alpha;
    ctx.font = `${size}px serif`;
    ctx.textAlign = "center";
    ctx.fillText(emoji, 0, 0);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

function drawLogo(ctx: CanvasRenderingContext2D, logo: HTMLImageElement | null, x: number, y: number, size: number) {
  if (!logo) return;
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.drawImage(logo, x, y, size, size);
  ctx.globalAlpha = 1;
  ctx.restore();
}

function wrapTextLines(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxW && line !== "") {
      lines.push(line.trim());
      line = word + " ";
    } else {
      line = test;
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function darkenHex(hex: string, amount: number): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function getColors(form: ProductFormData) {
  if (form.useCustomColor) {
    return {
      primary: form.customColor,
      dark: darkenHex(form.customColor, 80),
      gradientEnd: form.customColor + "33",
    };
  }
  return COLOR_PRESETS[form.colorPresetIndex];
}

// ─── Post Feed Generator (1080x1080) ────────────────────────────────────────

function generateProductPost(
  form: ProductFormData,
  photos: ProductPhoto[],
  logo: HTMLImageElement | null,
): HTMLCanvasElement {
  const W = 1080, H = 1080, M = 60;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const colors = getColors(form);

  // Background (always brand colors)
  drawGradientBg(ctx, W, H, BRAND.background, "#F5E0E0");
  drawSoftBlobs(ctx, W, H, BRAND.primary, BRAND.secondary);
  drawFloatingEmojis(ctx, W, H, form.emoji, 35);

  // ── Pre-calculate content height to center vertically ──
  ctx.font = "bold italic 54px serif";
  const titleLines = wrapTextLines(ctx, form.title, W - M * 2);
  const titleH = titleLines.length * 60;

  ctx.font = "26px sans-serif";
  const descLines = wrapTextLines(ctx, form.description, W - M * 2 - 40);
  const descH = descLines.length * 32;

  const gapTitleDesc = 4;
  const gapDescPhotos = 15;
  const photoAreaH = 500;
  const gapPhotosPrice = 20;
  const badgeH = 72;
  const gapPriceCta = 30;

  ctx.font = "italic 28px serif";
  const ctaLines = wrapTextLines(ctx, form.cta, W - M * 2);
  const ctaH = ctaLines.length * 36;

  const brandH = 50; // logo + text height at bottom

  const totalContentH = titleH + gapTitleDesc + descH + gapDescPhotos + photoAreaH + gapPhotosPrice + badgeH + gapPriceCta + ctaH;
  const availableH = H - brandH;
  let y = Math.max(M, (availableH - totalContentH) / 2);

  // ── Title ──
  ctx.font = "bold italic 54px serif";
  ctx.fillStyle = colors.dark;
  ctx.textAlign = "center";
  for (const line of titleLines) {
    ctx.fillText(line, W / 2, y);
    y += 60;
  }

  // ── Description ──
  y += gapTitleDesc;
  ctx.font = "26px sans-serif";
  ctx.fillStyle = colors.dark + "CC";
  for (const line of descLines) {
    ctx.fillText(line, W / 2, y);
    y += 32;
  }

  // ── Photos section ──
  y += gapDescPhotos;
  const photoCount = photos.length;

  if (photoCount === 1) {
    const pw = 400, ph = photoAreaH;
    const px = (W - pw) / 2;
    drawPhotoCard(ctx, photos[0].img, px, y, pw, ph, 20, colors.primary);
  } else if (photoCount === 2) {
    const pw = 360, ph = photoAreaH - 10;
    const overlap = 50;
    const totalW = pw * 2 - overlap;
    const startX = (W - totalW) / 2;
    ctx.save();
    const leftCx = startX + pw / 2, leftCy = y + ph / 2;
    ctx.translate(leftCx, leftCy);
    ctx.rotate(-0.06);
    ctx.translate(-leftCx, -leftCy);
    drawPhotoCard(ctx, photos[0].img, startX, y + 10, pw, ph - 20, 20, colors.primary);
    ctx.restore();
    ctx.save();
    const rightX = startX + pw - overlap;
    const rightCx = rightX + pw / 2, rightCy = y + ph / 2;
    ctx.translate(rightCx, rightCy);
    ctx.rotate(0.06);
    ctx.translate(-rightCx, -rightCy);
    drawPhotoCard(ctx, photos[1].img, rightX, y + 10, pw, ph - 20, 20, colors.primary);
    ctx.restore();
  } else if (photoCount === 3) {
    const centerW = 320, centerH = photoAreaH;
    const sideW = 260, sideH = photoAreaH - 30;
    const centerX = (W - centerW) / 2;
    const centerY = y;
    ctx.save();
    const leftPivotX = centerX - 40;
    const leftPivotY = centerY + centerH / 2;
    ctx.translate(leftPivotX, leftPivotY);
    ctx.rotate(-0.18);
    ctx.translate(-leftPivotX, -leftPivotY);
    drawPhotoCard(ctx, photos[1].img, centerX - sideW + 20, centerY + 15, sideW, sideH, 18, colors.primary);
    ctx.restore();
    ctx.save();
    const rightPivotX = centerX + centerW + 40;
    const rightPivotY = centerY + centerH / 2;
    ctx.translate(rightPivotX, rightPivotY);
    ctx.rotate(0.18);
    ctx.translate(-rightPivotX, -rightPivotY);
    drawPhotoCard(ctx, photos[2].img, centerX + centerW - 20, centerY + 15, sideW, sideH, 18, colors.primary);
    ctx.restore();
    drawPhotoCard(ctx, photos[0].img, centerX, centerY, centerW, centerH, 20, colors.primary);
  }

  y += photoAreaH + gapPhotosPrice;

  // ── Price badge ──
  const priceText = form.price;
  ctx.font = "bold 44px sans-serif";
  const priceMetrics = ctx.measureText(priceText).width;
  const badgeW = priceMetrics + 90;
  const badgeX = (W - badgeW) / 2;
  const badgeY = y;

  ctx.save();
  ctx.shadowColor = hexToRgba(colors.primary, 0.4);
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 4;
  drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 18);
  ctx.fillStyle = colors.dark;
  ctx.fill();
  ctx.restore();

  drawRoundedRect(ctx, badgeX + 2, badgeY + 2, badgeW - 4, badgeH - 4, 16);
  ctx.strokeStyle = colors.primary + "88";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = BRAND.white;
  ctx.textAlign = "center";
  ctx.font = "bold 42px sans-serif";
  ctx.fillText(priceText, W / 2, badgeY + 50);

  y += badgeH + gapPriceCta;

  // ── CTA ──
  ctx.font = "italic 28px serif";
  ctx.fillStyle = colors.dark + "DD";
  ctx.textAlign = "center";
  for (const line of ctaLines) {
    ctx.fillText(line, W / 2, y);
    y += 36;
  }

  // ── Branding at bottom ──
  const brandY = H - 42;
  const logoSize = 42;

  // "Paper Bloom" in brand colors, not art colors
  ctx.font = "italic 30px serif";
  const brandName = "Paper Bloom";
  const brandTextW = ctx.measureText(brandName).width;

  // Subtle line on each side
  const lineW = 60;
  const totalBrandW = lineW + 16 + logoSize + 10 + brandTextW + 16 + lineW;
  const brandStartX = (W - totalBrandW) / 2;

  ctx.save();
  ctx.strokeStyle = BRAND.primary;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.4;
  // Left line
  ctx.beginPath();
  ctx.moveTo(brandStartX, brandY);
  ctx.lineTo(brandStartX + lineW, brandY);
  ctx.stroke();
  // Right line
  ctx.beginPath();
  ctx.moveTo(brandStartX + totalBrandW - lineW, brandY);
  ctx.lineTo(brandStartX + totalBrandW, brandY);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();

  const innerX = brandStartX + lineW + 16;
  drawLogo(ctx, logo, innerX, brandY - logoSize / 2, logoSize);
  ctx.fillStyle = BRAND.textAccent;
  ctx.textAlign = "left";
  ctx.font = "italic 30px serif";
  ctx.fillText(brandName, innerX + logoSize + 10, brandY + 10);

  return canvas;
}

function drawPhotoCard(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number, y: number, w: number, h: number,
  radius: number, _accentColor: string,
) {
  ctx.save();

  // Shadow
  ctx.shadowColor = "rgba(0,0,0,0.18)";
  ctx.shadowBlur = 25;
  ctx.shadowOffsetY = 8;

  // Draw white base for shadow to cast from
  drawRoundedRect(ctx, x, y, w, h, radius);
  ctx.fillStyle = BRAND.white;
  ctx.fill();
  ctx.shadowColor = "transparent";

  // Clip and draw image edge-to-edge
  ctx.save();
  drawRoundedRect(ctx, x, y, w, h, radius);
  ctx.clip();

  const imgAspect = img.width / img.height;
  const cardAspect = w / h;
  let dw: number, dh: number, dx: number, dy: number;
  if (imgAspect > cardAspect) {
    dh = h;
    dw = dh * imgAspect;
    dx = x + (w - dw) / 2;
    dy = y;
  } else {
    dw = w;
    dh = dw / imgAspect;
    dx = x;
    dy = y + (h - dh) / 2;
  }
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();

  ctx.restore();
}

// ─── Stories Generator (1080x1920) ──────────────────────────────────────────

function generateProductStories(
  form: ProductFormData,
  photos: ProductPhoto[],
  logo: HTMLImageElement | null,
): HTMLCanvasElement {
  const W = 1080, H = 1920, M = 60;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const colors = getColors(form);

  // Background (always brand colors)
  drawGradientBg(ctx, W, H, BRAND.background, "#F5E0E0");
  drawSoftBlobs(ctx, W, H, BRAND.primary, BRAND.secondary);
  drawFloatingEmojis(ctx, W, H, form.emoji, 55);

  // ── Pre-calculate content height to center vertically ──
  const logoH = 80;
  const gapLogoTitle = 50;

  ctx.font = "bold italic 54px serif";
  const titleLines = wrapTextLines(ctx, form.title, W - M * 2);
  const titleH = titleLines.length * 66;

  const gapTitleDesc = 15;

  ctx.font = "28px sans-serif";
  const descLines = wrapTextLines(ctx, form.description, W - M * 2 - 40);
  const descH = descLines.length * 38;

  const gapDescPhotos = 30;
  const photoAreaH = 620;
  const gapPhotosPrice = 40;
  const badgeH = 80;
  const gapPriceCta = 35;

  ctx.font = "italic 34px serif";
  const ctaLines = wrapTextLines(ctx, form.cta, W - M * 2);
  const ctaH = ctaLines.length * 46;

  const brandH = 60;

  const totalContentH = logoH + gapLogoTitle + titleH + gapTitleDesc + descH + gapDescPhotos + photoAreaH + gapPhotosPrice + badgeH + gapPriceCta + ctaH;
  const availableH = H - brandH;
  let y = Math.max(M, (availableH - totalContentH) / 2);

  // Logo top center
  drawLogo(ctx, logo, (W - 80) / 2, y, 80);
  y += logoH + gapLogoTitle;

  // Title
  ctx.font = "bold italic 54px serif";
  ctx.fillStyle = colors.dark;
  ctx.textAlign = "center";
  for (const line of titleLines) {
    ctx.fillText(line, W / 2, y);
    y += 66;
  }

  // Description
  y += gapTitleDesc;
  ctx.font = "28px sans-serif";
  ctx.fillStyle = colors.dark + "CC";
  for (const line of descLines) {
    ctx.fillText(line, W / 2, y);
    y += 38;
  }

  y += gapDescPhotos;

  // Photos
  const photoCount = photos.length;

  if (photoCount === 1) {
    const pw = 480, ph = photoAreaH;
    drawPhotoCard(ctx, photos[0].img, (W - pw) / 2, y, pw, ph, 24, colors.primary);
  } else if (photoCount === 2) {
    const pw = 400, ph = photoAreaH - 20;
    const overlap = 50;
    const totalW = pw * 2 - overlap;
    const startX = (W - totalW) / 2;
    ctx.save();
    const leftCx = startX + pw / 2, leftCy = y + ph / 2;
    ctx.translate(leftCx, leftCy);
    ctx.rotate(-0.06);
    ctx.translate(-leftCx, -leftCy);
    drawPhotoCard(ctx, photos[0].img, startX, y + 10, pw, ph - 20, 22, colors.primary);
    ctx.restore();
    ctx.save();
    const rightX = startX + pw - overlap;
    const rightCx = rightX + pw / 2, rightCy = y + ph / 2;
    ctx.translate(rightCx, rightCy);
    ctx.rotate(0.06);
    ctx.translate(-rightCx, -rightCy);
    drawPhotoCard(ctx, photos[1].img, rightX, y + 10, pw, ph - 20, 22, colors.primary);
    ctx.restore();
  } else if (photoCount === 3) {
    const centerW = 380, centerH = photoAreaH;
    const sideW = 300, sideH = photoAreaH - 40;
    const centerX = (W - centerW) / 2;
    ctx.save();
    const leftPivotX = centerX - 40;
    const leftPivotY = y + centerH / 2;
    ctx.translate(leftPivotX, leftPivotY);
    ctx.rotate(-0.17);
    ctx.translate(-leftPivotX, -leftPivotY);
    drawPhotoCard(ctx, photos[1].img, centerX - sideW + 30, y + 20, sideW, sideH, 20, colors.primary);
    ctx.restore();
    ctx.save();
    const rightPivotX = centerX + centerW + 40;
    const rightPivotY = y + centerH / 2;
    ctx.translate(rightPivotX, rightPivotY);
    ctx.rotate(0.17);
    ctx.translate(-rightPivotX, -rightPivotY);
    drawPhotoCard(ctx, photos[2].img, centerX + centerW - 30, y + 20, sideW, sideH, 20, colors.primary);
    ctx.restore();
    drawPhotoCard(ctx, photos[0].img, centerX, y, centerW, centerH, 24, colors.primary);
  }

  y += photoAreaH + gapPhotosPrice;

  // Price badge
  const priceText = form.price;
  ctx.font = "bold 50px sans-serif";
  const priceMetrics = ctx.measureText(priceText).width;
  const badgeW = priceMetrics + 100;
  const badgeX = (W - badgeW) / 2;

  ctx.save();
  ctx.shadowColor = hexToRgba(colors.primary, 0.4);
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 5;
  drawRoundedRect(ctx, badgeX, y, badgeW, badgeH, 20);
  ctx.fillStyle = colors.dark;
  ctx.fill();
  ctx.restore();

  drawRoundedRect(ctx, badgeX + 2, y + 2, badgeW - 4, badgeH - 4, 18);
  ctx.strokeStyle = colors.primary + "88";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = BRAND.white;
  ctx.textAlign = "center";
  ctx.font = "bold 48px sans-serif";
  ctx.fillText(priceText, W / 2, y + 56);

  y += badgeH + gapPriceCta;

  // CTA
  ctx.font = "italic 34px serif";
  ctx.fillStyle = colors.dark + "DD";
  ctx.textAlign = "center";
  for (const line of ctaLines) {
    ctx.fillText(line, W / 2, y);
    y += 46;
  }

  // Branding bottom
  const brandY = H - 50;
  const logoSize = 46;

  ctx.font = "italic 32px serif";
  const brandName = "Paper Bloom";
  const brandTextW = ctx.measureText(brandName).width;

  const lineW = 70;
  const totalBrandW = lineW + 16 + logoSize + 12 + brandTextW + 16 + lineW;
  const brandStartX = (W - totalBrandW) / 2;

  ctx.save();
  ctx.strokeStyle = BRAND.primary;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(brandStartX, brandY);
  ctx.lineTo(brandStartX + lineW, brandY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(brandStartX + totalBrandW - lineW, brandY);
  ctx.lineTo(brandStartX + totalBrandW, brandY);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();

  const innerX = brandStartX + lineW + 16;
  drawLogo(ctx, logo, innerX, brandY - logoSize / 2, logoSize);
  ctx.fillStyle = BRAND.textAccent;
  ctx.textAlign = "left";
  ctx.font = "italic 32px serif";
  ctx.fillText(brandName, innerX + logoSize + 12, brandY + 11);

  return canvas;
}

// ─── Crop Modal ──────────────────────────────────────────────────────────────

function CropModal({
  imageSrc,
  onConfirm,
  onCancel,
}: {
  imageSrc: string;
  onConfirm: (croppedImg: HTMLImageElement, croppedPreview: string) => void;
  onCancel: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgNatural, setImgNatural] = useState({ w: 1, h: 1 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // Target aspect ratio 3:4 (portrait card)
  const ASPECT = 3 / 4;

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setImgNatural({ w: img.width, h: img.height });
      setImgLoaded(true);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Compute crop box and image display sizes
  const getLayout = useCallback(() => {
    if (!containerRef.current) return { cropW: 200, cropH: 267, dispW: 200, dispH: 200, containerW: 400, containerH: 400 };
    const rect = containerRef.current.getBoundingClientRect();
    const containerW = rect.width;
    const containerH = rect.height;
    // Crop box: 70% of container, aspect 3:4
    const maxCropW = containerW * 0.7;
    const maxCropH = containerH * 0.7;
    let cropW = maxCropW;
    let cropH = cropW / ASPECT;
    if (cropH > maxCropH) { cropH = maxCropH; cropW = cropH * ASPECT; }
    // Image display: fit so it can cover the crop box
    const imgAspect = imgNatural.w / imgNatural.h;
    let dispW: number, dispH: number;
    if (imgAspect > ASPECT) {
      dispH = cropH * scale;
      dispW = dispH * imgAspect;
    } else {
      dispW = cropW * scale;
      dispH = dispW / imgAspect;
    }
    return { cropW, cropH, dispW, dispH, containerW, containerH };
  }, [imgNatural, scale]);

  const clampOffset = useCallback((ox: number, oy: number) => {
    const { cropW, cropH, dispW, dispH } = getLayout();
    const minX = cropW - dispW;
    const minY = cropH - dispH;
    return { x: Math.min(0, Math.max(minX, ox)), y: Math.min(0, Math.max(minY, oy)) };
  }, [getLayout]);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setOffset((prev) => clampOffset(prev.x + dx, prev.y + dy));
  };
  const handlePointerUp = () => { dragging.current = false; };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newScale = Math.max(1, Math.min(3, scale - e.deltaY * 0.002));
    setScale(newScale);
    setOffset((prev) => clampOffset(prev.x, prev.y));
  };

  const handleConfirm = () => {
    if (!imgRef.current) return;
    const { cropW, cropH, dispW, dispH } = getLayout();
    // Map screen coords to source image coords
    const scaleX = imgNatural.w / dispW;
    const scaleY = imgNatural.h / dispH;
    const sx = -offset.x * scaleX;
    const sy = -offset.y * scaleY;
    const sw = cropW * scaleX;
    const sh = cropH * scaleY;

    const outW = 800, outH = Math.round(800 / ASPECT);
    const cv = document.createElement("canvas");
    cv.width = outW; cv.height = outH;
    const ctx = cv.getContext("2d")!;
    ctx.drawImage(imgRef.current, sx, sy, sw, sh, 0, 0, outW, outH);

    const dataUrl = cv.toDataURL("image/png");
    const resultImg = new Image();
    resultImg.onload = () => onConfirm(resultImg, dataUrl);
    resultImg.src = dataUrl;
  };

  const layout = getLayout();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-lg flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800 text-sm">Recortar Foto</p>
            <p className="text-xs text-gray-400">Arraste para posicionar, scroll para zoom</p>
          </div>
          <button onClick={onCancel} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"><X size={18} className="text-gray-500" /></button>
        </div>
        <div
          ref={containerRef}
          className="relative w-full h-80 bg-gray-900 overflow-hidden cursor-grab active:cursor-grabbing select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
        >
          {/* Dark overlay with transparent crop window */}
          {imgLoaded && (
            <>
              <img
                src={imageSrc}
                alt="crop"
                draggable={false}
                className="absolute pointer-events-none"
                style={{
                  width: layout.dispW,
                  height: layout.dispH,
                  left: (layout.containerW - layout.cropW) / 2 + offset.x,
                  top: (layout.containerH - layout.cropH) / 2 + offset.y,
                }}
              />
              {/* Overlay mask */}
              <div className="absolute inset-0 pointer-events-none" style={{
                boxShadow: `0 0 0 9999px rgba(0,0,0,0.55)`,
                left: (layout.containerW - layout.cropW) / 2,
                top: (layout.containerH - layout.cropH) / 2,
                width: layout.cropW,
                height: layout.cropH,
                borderRadius: 12,
              }} />
              {/* Crop border */}
              <div className="absolute border-2 border-white/70 rounded-xl pointer-events-none" style={{
                left: (layout.containerW - layout.cropW) / 2,
                top: (layout.containerH - layout.cropH) / 2,
                width: layout.cropW,
                height: layout.cropH,
              }} />
              {/* Move icon hint */}
              <div className="absolute bottom-2 right-2 bg-black/40 text-white/70 rounded-full p-1.5">
                <Move size={14} />
              </div>
            </>
          )}
        </div>
        {/* Zoom slider */}
        <div className="px-4 py-2 flex items-center gap-3">
          <span className="text-xs text-gray-400">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={scale}
            onChange={(e) => { setScale(parseFloat(e.target.value)); setOffset((prev) => clampOffset(prev.x, prev.y)); }}
            className="flex-1 accent-[#D4A5A5]"
          />
          <span className="text-xs text-gray-500 w-10 text-right">{Math.round(scale * 100)}%</span>
        </div>
        <div className="p-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
          <button onClick={handleConfirm} className="px-5 py-2 text-sm font-semibold text-white bg-[#D4A5A5] hover:bg-[#C49494] rounded-lg transition-colors">Confirmar</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AdminProdutosPage() {
  const [form, setForm] = useState<ProductFormData>({
    title: "",
    description: "",
    price: "",
    cta: "",
    emoji: "✨",
    colorPresetIndex: 0,
    customColor: "#E6C2C2",
    useCustomColor: false,
  });

  const [photos, setPhotos] = useState<ProductPhoto[]>([]);
  const [previews, setPreviews] = useState<{ post: string | null; stories: string | null }>({ post: null, stories: null });
  const canvasPostRef = useRef<HTMLCanvasElement | null>(null);
  const canvasStoriesRef = useRef<HTMLCanvasElement | null>(null);
  const logoRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Crop state
  const [cropQueue, setCropQueue] = useState<string[]>([]);
  const [cropFileQueue, setCropFileQueue] = useState<File[]>([]);

  // Preload logo
  useEffect(() => {
    const img = new Image();
    img.onload = () => { logoRef.current = img; };
    img.src = "/logo-icon.png";
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = 3 - photos.length;
    const toAdd = Array.from(files).slice(0, remaining);
    const urls = toAdd.map((f) => URL.createObjectURL(f));
    setCropFileQueue(toAdd);
    setCropQueue(urls);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCropConfirm = (croppedImg: HTMLImageElement, croppedPreview: string) => {
    const file = cropFileQueue[0];
    setPhotos((prev) => [...prev, { file, img: croppedImg, preview: croppedPreview }]);
    setPreviews({ post: null, stories: null });
    // Remove processed item from queues
    const nextUrls = cropQueue.slice(1);
    const nextFiles = cropFileQueue.slice(1);
    // Revoke the original blob URL
    URL.revokeObjectURL(cropQueue[0]);
    setCropQueue(nextUrls);
    setCropFileQueue(nextFiles);
  };

  const handleCropCancel = () => {
    // Revoke all remaining blob URLs
    cropQueue.forEach((u) => URL.revokeObjectURL(u));
    setCropQueue([]);
    setCropFileQueue([]);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].preview);
      next.splice(index, 1);
      return next;
    });
    setPreviews({ post: null, stories: null });
  };

  const updateForm = (key: keyof ProductFormData, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setPreviews({ post: null, stories: null });
  };

  const canGenerate = form.title.trim() && form.price.trim() && photos.length > 0;

  const generatePreviews = useCallback(() => {
    if (!canGenerate) return;
    const logo = logoRef.current;
    const postCanvas = generateProductPost(form, photos, logo);
    const storiesCanvas = generateProductStories(form, photos, logo);
    canvasPostRef.current = postCanvas;
    canvasStoriesRef.current = storiesCanvas;
    setPreviews({
      post: postCanvas.toDataURL("image/png"),
      stories: storiesCanvas.toDataURL("image/png"),
    });
  }, [form, photos, canGenerate]);

  const handleDownload = (type: "post" | "stories") => {
    const canvas = type === "post" ? canvasPostRef.current : canvasStoriesRef.current;
    if (!canvas) return;
    const slug = form.title.toLowerCase().replace(/\s+/g, "-").slice(0, 30);
    downloadCanvas(canvas, `paperbloom-produto-${slug}-${type}.png`);
  };

  const handleDownloadAll = () => {
    handleDownload("post");
    setTimeout(() => handleDownload("stories"), 300);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Package className="text-[#D4A5A5]" size={28} />
          Produtos — Gerador de Artes
        </h1>
        <p className="text-gray-500 mt-1">Crie artes para divulgar produtos físicos como canecas, quadros e itens personalizados</p>
      </div>

      {/* Photos Upload */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Fotos do Produto ({photos.length}/3)
        </h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          {photos.map((photo, i) => (
            <div key={i} className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm">
              <img src={photo.preview} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
              <button
                onClick={() => removePhoto(i)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors"
                title="Remover"
              >
                <X size={14} />
              </button>
              <span className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                Foto {i + 1}
              </span>
            </div>
          ))}
          {photos.length < 3 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[3/4] border-2 border-dashed border-gray-300 hover:border-[#E6C2C2] rounded-xl flex flex-col items-center justify-center transition-colors group"
            >
              <Upload size={28} className="text-gray-300 group-hover:text-[#D4A5A5] transition-colors" />
              <p className="text-xs text-gray-400 mt-2">Adicionar foto</p>
            </button>
          )}
        </div>
        <p className="text-xs text-gray-400 italic">
          Adicione de 1 a 3 fotos. Com 1 foto ela fica centralizada, com 2 ficam lado a lado, com 3 ficam em leque.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          onChange={handlePhotoUpload}
          className="hidden"
        />
      </div>

      {/* Form Fields */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-5 flex items-center gap-2">
          <Type size={16} />
          Informações do Produto
        </h2>
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Título do Produto</label>
              <span className={`text-xs ${form.title.length > 50 ? "text-red-400" : "text-gray-400"}`}>
                {form.title.length}/60
              </span>
            </div>
            <input
              type="text"
              value={form.title}
              maxLength={60}
              placeholder="Ex: Caneca Harry Potter - Azul"
              onChange={(e) => updateForm("title", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#E6C2C2]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Descrição</label>
              <span className={`text-xs ${form.description.length > 100 ? "text-orange-400" : "text-gray-400"}`}>
                {form.description.length}/120
              </span>
            </div>
            <textarea
              rows={2}
              value={form.description}
              maxLength={120}
              placeholder="Ex: Caneca do Harry Potter na cor azul com a arte da grifinória"
              onChange={(e) => updateForm("description", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#E6C2C2] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Preço</label>
              <input
                type="text"
                value={form.price}
                placeholder="Ex: R$ 35,90"
                onChange={(e) => updateForm("price", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#E6C2C2]"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">CTA (Frase de impacto)</label>
                <span className={`text-xs ${form.cta.length > 70 ? "text-orange-400" : "text-gray-400"}`}>
                  {form.cta.length}/80
                </span>
              </div>
              <input
                type="text"
                value={form.cta}
                maxLength={80}
                placeholder="Ex: Compre ainda hoje e seja o melhor bruxo de hogwarts"
                onChange={(e) => updateForm("cta", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#E6C2C2]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Color & Emoji */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-5 flex items-center gap-2">
          <Palette size={16} />
          Personalização Visual
        </h2>

        {/* Color presets */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 block mb-3">Cor da Arte</label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-3">
            {COLOR_PRESETS.map((preset, i) => (
              <button
                key={i}
                onClick={() => { updateForm("colorPresetIndex", i); updateForm("useCustomColor", false); }}
                className={`p-3 rounded-xl border-2 transition-all text-center ${
                  !form.useCustomColor && form.colorPresetIndex === i
                    ? "border-[#E6C2C2] shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full mx-auto mb-1.5"
                  style={{ backgroundColor: preset.primary }}
                />
                <p className="text-xs text-gray-600">{preset.name}</p>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={form.useCustomColor}
                onChange={(e) => updateForm("useCustomColor", e.target.checked)}
                className="rounded border-gray-300"
              />
              Cor personalizada
            </label>
            {form.useCustomColor && (
              <input
                type="color"
                value={form.customColor}
                onChange={(e) => updateForm("customColor", e.target.value)}
                className="w-10 h-8 rounded cursor-pointer border border-gray-200"
              />
            )}
          </div>
        </div>

        {/* Emoji selector */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-3">
            Emoji do Fundo — <span className="text-lg">{form.emoji}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {EMOJI_OPTIONS.map((e) => (
              <button
                key={e}
                onClick={() => updateForm("emoji", e)}
                className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                  form.emoji === e
                    ? "bg-[#FFFAFA] border-2 border-[#E6C2C2] shadow-md scale-110"
                    : "bg-gray-50 border border-gray-200 hover:border-gray-300"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <button
          onClick={generatePreviews}
          disabled={!canGenerate}
          className={`w-full md:w-auto px-8 py-3 font-semibold rounded-full transition-colors flex items-center gap-2 justify-center shadow-lg ${
            canGenerate
              ? "bg-[#D4A5A5] hover:bg-[#C49494] text-white shadow-[#D4A5A5]/20"
              : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
          }`}
        >
          <ImageIcon size={20} /> Gerar Artes (Post + Stories)
        </button>
        {!canGenerate && (
          <p className="text-xs text-gray-400 mt-2">
            Preencha pelo menos o título, preço e adicione ao menos 1 foto para gerar.
          </p>
        )}
      </div>

      {/* Preview */}
      {(previews.post || previews.stories) && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Preview — {form.title || "Produto"}
            </h2>
            <button
              onClick={handleDownloadAll}
              className="px-4 py-2 bg-[#8B5F5F] hover:bg-[#7A5050] text-white text-sm font-medium rounded-full flex items-center gap-2 transition-colors"
            >
              <Download size={16} /> Baixar Todas
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Post */}
            {previews.post && (
              <div className="relative group">
                <p className="text-xs font-semibold text-[#D4A5A5] uppercase mb-2 flex items-center gap-1">
                  <Smartphone size={14} /> Post Feed (1080×1080)
                </p>
                <img src={previews.post} alt="Post Feed" className="w-full rounded-lg shadow-md border border-gray-100" />
                <button
                  onClick={() => handleDownload("post")}
                  className="absolute top-10 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Baixar Post"
                >
                  <Download size={18} className="text-gray-700" />
                </button>
              </div>
            )}
            {/* Stories */}
            {previews.stories && (
              <div className="relative group">
                <p className="text-xs font-semibold text-[#D4A5A5] uppercase mb-2 flex items-center gap-1">
                  <Smartphone size={14} /> Stories (1080×1920)
                </p>
                <img src={previews.stories} alt="Stories" className="w-full rounded-lg shadow-md border border-gray-100 max-h-[600px] object-contain" />
                <button
                  onClick={() => handleDownload("stories")}
                  className="absolute top-10 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Baixar Stories"
                >
                  <Download size={18} className="text-gray-700" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Crop Modal */}
      {cropQueue.length > 0 && (
        <CropModal
          imageSrc={cropQueue[0]}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
