import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cardCollectionService } from '@/services/CardCollectionService';
import { emailService } from '@/services/EmailService';

/**
 * Simple in-memory rate limiter (per IP, 3 requests/hour).
 * Sufficient for MVP — no Redis/Upstash required.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    // First request or window expired — reset
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count += 1;
  return true;
}

const bodySchema = z.object({
  email: z.string().email(),
});

/**
 * POST /api/painel/recuperar-acesso
 *
 * Accepts an email address and, if any paid card collections are found,
 * sends a recover-access email with links to all buyer panels.
 * Always returns 200 with a generic message to avoid email enumeration.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Determine client IP for rate limiting
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Tente novamente em 1 hora.' },
      { status: 429 }
    );
  }

  // Parse and validate body
  let email: string;
  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Email inválido.' },
        { status: 400 }
      );
    }
    email = parsed.data.email;
  } catch {
    return NextResponse.json(
      { error: 'Requisição inválida.' },
      { status: 400 }
    );
  }

  try {
    // Find all paid collections for this email
    const collections = await cardCollectionService.findByContactEmail(email);

    if (collections.length > 0) {
      // Ensure every collection has a dashboard token
      const panels = await Promise.all(
        collections.map(async (col) => {
          const dashboardToken = await cardCollectionService.setDashboardToken(col.id);
          return {
            recipientName: col.recipientName,
            createdAt: col.createdAt,
            dashboardToken,
          };
        })
      );

      // Send recover-access email (silently skipped if panels is empty)
      await emailService.sendRecoverAccessEmail(email, panels);
    }
  } catch (error) {
    // Log but do not expose internal errors to the client
    console.error('[RecoverAccess] Error processing request:', error);
  }

  // Always return the same generic response to avoid email enumeration
  return NextResponse.json(
    {
      message:
        'Se houver compras associadas a esse email, você receberá os links em instantes.',
    },
    { status: 200 }
  );
}
