import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { digitalArtOrderService } from '@/services/DigitalArtOrderService';
import { catalogService } from '@/services/CatalogService';
import { emailService } from '@/services/EmailService';

/**
 * POST /api/loja/recuperar
 * Reenvia os links de arte para um email — resposta sempre 200 (anti-enumeration).
 * Rate limit duplo: por email (1 req/60s) e por IP (10 reqs/10min).
 */

// In-memory rate limiter maps (server restart limpa — aceitável sem Redis)
const emailRateLimit = new Map<string, number>(); // email → timestamp da última req
const ipRateLimit = new Map<string, number[]>(); // ip → array de timestamps

const EMAIL_COOLDOWN_MS = 60 * 1000; // 1 req por email por 60s
const IP_WINDOW_MS = 10 * 60 * 1000; // janela de 10 minutos
const IP_MAX_REQS = 10; // máximo de reqs por IP nessa janela

const GENERIC_RESPONSE = {
  message: 'Se houver compras com esse email, você receberá um email em alguns minutos. Verifique também o spam.',
};

function getIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}

function checkEmailRateLimit(email: string): boolean {
  const last = emailRateLimit.get(email);
  const now = Date.now();
  if (last && now - last < EMAIL_COOLDOWN_MS) return false; // bloqueado
  emailRateLimit.set(email, now);
  return true;
}

function checkIpRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = (ipRateLimit.get(ip) ?? []).filter((t) => now - t < IP_WINDOW_MS);
  if (timestamps.length >= IP_MAX_REQS) return false; // bloqueado
  timestamps.push(now);
  ipRateLimit.set(ip, timestamps);
  return true;
}

const requestSchema = z.object({
  email: z.string().email('Email inválido'),
});

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(GENERIC_RESPONSE, { status: 200 });
    }

    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      // Retorna genérico mesmo com body inválido — não revela detalhes
      return NextResponse.json(GENERIC_RESPONSE, { status: 200 });
    }

    const { email } = validation.data;
    const ip = getIp(request);

    // Rate limit por IP (verificar antes do email para bloquear abuso em escala)
    if (!checkIpRateLimit(ip)) {
      console.warn(`[recuperar] IP rate limit atingido: ${ip}`);
      return NextResponse.json(GENERIC_RESPONSE, { status: 200 }); // genérico — não revela bloqueio
    }

    // Rate limit por email
    if (!checkEmailRateLimit(email)) {
      console.warn(`[recuperar] Email rate limit atingido: ${email}`);
      return NextResponse.json(GENERIC_RESPONSE, { status: 200 }); // genérico — não revela bloqueio
    }

    // Busca pedidos paid do email
    const orders = await digitalArtOrderService.findByEmail(email);

    if (orders.length === 0) {
      console.log(`[recuperar] Nenhum pedido paid encontrado para: ${email}`);
      return NextResponse.json(GENERIC_RESPONSE, { status: 200 });
    }

    // Para cada pedido, busca o canvaTemplateUrl no catálogo
    const ordersWithCanva = orders.flatMap((order) => {
      const product = catalogService.getProductBySlug(order.product_slug);
      if (!product?.art?.canvaTemplateUrl) {
        console.warn(`[recuperar] Produto ${order.product_slug} sem canvaTemplateUrl — ignorando`);
        return [];
      }
      return [{ productTitle: order.product_title, canvaUrl: product.art.canvaTemplateUrl }];
    });

    if (ordersWithCanva.length > 0) {
      const emailResult = await emailService.sendArtRecoveryEmail({
        recipientEmail: email,
        orders: ordersWithCanva,
      });

      if (emailResult.success) {
        console.log(`[recuperar] Recovery email enviado para: ${email} (${ordersWithCanva.length} artes)`);
      } else {
        console.error(`[recuperar] Falha ao enviar recovery email para: ${email}`, emailResult.error);
      }
    }

    // Sempre retorna 200 genérico
    return NextResponse.json(GENERIC_RESPONSE, { status: 200 });
  } catch (error) {
    console.error('[recuperar] Erro interno:', error);
    // Mesmo em erro, retorna 200 genérico para não vazar informações
    return NextResponse.json(GENERIC_RESPONSE, { status: 200 });
  }
}
