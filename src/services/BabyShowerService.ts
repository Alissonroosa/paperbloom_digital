import pool from '../lib/db';
import { randomUUID } from 'crypto';
import type { PoolClient } from 'pg';
import { qrCodeService } from './QRCodeService';
import {
  BabyShower,
  BabyShowerRow,
  BabyShowerGift,
  BabyShowerGiftRow,
  BabyShowerRsvp,
  BabyShowerRsvpRow,
  BabyShowerStats,
  BabyShowerGiftPublic,
  CreateBabyShowerInput,
  CreateRsvpInput,
  RsvpGift,
  RsvpGiftRow,
  GiftCategory,
  DiaperSize,
  rowToBabyShower,
  rowToGift,
  rowToRsvp,
  rowToRsvpGift,
  validateCreateBabyShower,
  validateCreateRsvp,
  generateBabyShowerSlug,
} from '../types/baby-shower';

/**
 * BabyShowerService
 * Handles all database operations for the "Chá de Fralda" product:
 * events, gift list items and guest RSVPs.
 */
export class BabyShowerService {
  /**
   * Create a baby shower event together with its gift list items (one transaction).
   */
  async create(data: CreateBabyShowerInput): Promise<BabyShower> {
    const validation = validateCreateBabyShower(data);
    if (!validation.success) {
      throw new Error(`Validation failed: ${JSON.stringify(validation.error.issues)}`);
    }

    const v = validation.data;
    const id = randomUUID();

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const insertEvent = `
        INSERT INTO baby_showers (
          id, baby_name, baby_gender, host_name, partner_name, welcome_message,
          event_date, location_name, location_address, location_maps_url, guest_count,
          photos, primary_color, theme, contact_name, contact_email, contact_phone,
          status, created_at, updated_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,NOW(),NOW())
        RETURNING *
      `;
      const eventValues = [
        id,
        v.babyName ?? null,
        v.babyGender,
        v.hostName,
        v.partnerName ?? null,
        v.welcomeMessage ?? null,
        v.eventDate ?? null,
        v.locationName ?? null,
        v.locationAddress ?? null,
        v.locationMapsUrl ?? null,
        v.guestCount ?? 0,
        v.photos ?? [],
        v.primaryColor ?? '#E6C2C2',
        v.theme ?? 'safari',
        v.contactName ?? null,
        v.contactEmail ?? null,
        v.contactPhone ?? null,
        'pending',
      ];
      const eventResult = await client.query<BabyShowerRow>(insertEvent, eventValues);

      if (v.gifts && v.gifts.length > 0) {
        await this.insertGifts(client, id, v.gifts);
      }

      await client.query('COMMIT');
      return rowToBabyShower(eventResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating baby shower:', error);
      throw new Error(`Failed to create baby shower: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      client.release();
    }
  }

  /** Insert gift rows for an event using an existing client. */
  private async insertGifts(
    client: PoolClient,
    babyShowerId: string,
    gifts: CreateBabyShowerInput['gifts']
  ): Promise<void> {
    let sortOrder = 0;
    for (const g of gifts) {
      await client.query(
        `INSERT INTO baby_shower_gifts
           (id, baby_shower_id, name, category, diaper_size, qty_desired, price_cents, is_custom, sort_order, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),NOW())`,
        [
          randomUUID(),
          babyShowerId,
          g.name,
          g.category,
          g.diaperSize ?? null,
          g.qtyDesired,
          g.priceCents ?? null,
          g.isCustom ?? false,
          sortOrder++,
        ]
      );
    }
  }

  async findById(id: string): Promise<BabyShower | null> {
    const result = await pool.query<BabyShowerRow>(`SELECT * FROM baby_showers WHERE id = $1`, [id]);
    return result.rows.length ? rowToBabyShower(result.rows[0]) : null;
  }

  async findBySlug(slug: string): Promise<BabyShower | null> {
    const result = await pool.query<BabyShowerRow>(`SELECT * FROM baby_showers WHERE slug = $1`, [slug]);
    return result.rows.length ? rowToBabyShower(result.rows[0]) : null;
  }

  async findByDashboardSlug(dashboardSlug: string): Promise<BabyShower | null> {
    const result = await pool.query<BabyShowerRow>(`SELECT * FROM baby_showers WHERE dashboard_slug = $1`, [dashboardSlug]);
    return result.rows.length ? rowToBabyShower(result.rows[0]) : null;
  }

  async findByPaymentId(paymentId: string): Promise<BabyShower | null> {
    const result = await pool.query<BabyShowerRow>(`SELECT * FROM baby_showers WHERE payment_id = $1`, [paymentId]);
    return result.rows.length ? rowToBabyShower(result.rows[0]) : null;
  }

  /**
   * Generic field update. Mirrors GenderRevealService.update.
   */
  async update(id: string, data: Partial<BabyShower>): Promise<BabyShower> {
    const fieldMap: Record<string, string> = {
      babyName: 'baby_name',
      babyGender: 'baby_gender',
      hostName: 'host_name',
      partnerName: 'partner_name',
      welcomeMessage: 'welcome_message',
      eventDate: 'event_date',
      locationName: 'location_name',
      locationAddress: 'location_address',
      locationMapsUrl: 'location_maps_url',
      guestCount: 'guest_count',
      photos: 'photos',
      primaryColor: 'primary_color',
      theme: 'theme',
      contactName: 'contact_name',
      contactEmail: 'contact_email',
      contactPhone: 'contact_phone',
      slug: 'slug',
      dashboardSlug: 'dashboard_slug',
      qrCodeUrl: 'qr_code_url',
      status: 'status',
      paymentId: 'payment_id',
      viewCount: 'view_count',
    };

    const updates: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    for (const [key, dbField] of Object.entries(fieldMap)) {
      if (data[key as keyof BabyShower] !== undefined) {
        updates.push(`${dbField} = $${i++}`);
        values.push(data[key as keyof BabyShower]);
      }
    }
    if (updates.length === 0) throw new Error('No fields to update');

    updates.push('updated_at = NOW()');
    values.push(id);

    const result = await pool.query<BabyShowerRow>(
      `UPDATE baby_showers SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    if (result.rows.length === 0) throw new Error(`Baby shower with ID ${id} not found`);
    return rowToBabyShower(result.rows[0]);
  }

  async updatePaymentId(id: string, paymentId: string): Promise<BabyShower> {
    return this.update(id, { paymentId });
  }

  /**
   * Finalize an event: generate public/dashboard slugs, the QR code and mark it
   * as paid. Idempotent — if the event already has a slug, returns it unchanged.
   *
   * Shared by the free-launch flow (POST /api/baby-shower/[id]/finalize) and,
   * when paid checkout is re-enabled, by the Mercado Pago webhook. The QR code is
   * best-effort: if R2 is unavailable the event is still finalized without it.
   *
   * @returns the finalized event plus the computed public/dashboard URLs.
   */
  async finalizeFree(
    id: string,
    opts: { paymentId?: string } = {}
  ): Promise<{ event: BabyShower; publicUrl: string; dashboardUrl: string; alreadyFinalized: boolean }> {
    const event = await this.findById(id);
    if (!event) throw new Error(`Baby shower with ID ${id} not found`);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Idempotency: already finalized — return existing links, don't regenerate.
    if (event.status === 'paid' && event.slug && event.dashboardSlug) {
      return {
        event,
        publicUrl: `${baseUrl}/cha-de-fralda/${event.slug}`,
        dashboardUrl: `${baseUrl}/cha-de-fralda/dashboard/${event.dashboardSlug}`,
        alreadyFinalized: true,
      };
    }

    const slug = generateBabyShowerSlug(event.hostName, event.babyName, id);
    const dashboardSlug = `dashboard-${slug}`;
    const publicUrl = `${baseUrl}/cha-de-fralda/${slug}`;
    const dashboardUrl = `${baseUrl}/cha-de-fralda/dashboard/${dashboardSlug}`;

    // QR is best-effort (R2 may be unavailable locally).
    let qrCodeUrl: string | null = null;
    try {
      qrCodeUrl = await qrCodeService.generate(publicUrl, id);
    } catch (qrError) {
      console.warn('[BabyShowerService] QR generation skipped:', qrError instanceof Error ? qrError.message : qrError);
    }

    const updated = await this.update(id, {
      status: 'paid',
      slug,
      dashboardSlug,
      paymentId: opts.paymentId ?? `free-${Date.now()}`,
      ...(qrCodeUrl ? { qrCodeUrl } : {}),
    });

    return { event: updated, publicUrl, dashboardUrl, alreadyFinalized: false };
  }

  async incrementViewCount(id: string): Promise<void> {
    try {
      await pool.query(`UPDATE baby_showers SET view_count = view_count + 1, updated_at = NOW() WHERE id = $1`, [id]);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  }

  /* ---------------------------------------------------------------- */
  /* Gifts                                                            */
  /* ---------------------------------------------------------------- */

  async getGifts(babyShowerId: string): Promise<BabyShowerGift[]> {
    const result = await pool.query<BabyShowerGiftRow>(
      `SELECT * FROM baby_shower_gifts WHERE baby_shower_id = $1 ORDER BY sort_order ASC, created_at ASC`,
      [babyShowerId]
    );
    return result.rows.map(rowToGift);
  }

  /** Public gift list with derived availability. */
  async getPublicGifts(babyShowerId: string): Promise<BabyShowerGiftPublic[]> {
    const gifts = await this.getGifts(babyShowerId);
    return gifts.map((g) => ({ ...g, qtyAvailable: Math.max(0, g.qtyDesired - g.qtyReserved) }));
  }

  /* ---------------------------------------------------------------- */
  /* RSVPs                                                            */
  /* ---------------------------------------------------------------- */

  /**
   * Create a guest RSVP. Reserves one or more gifts (e.g. a fralda + an optional
   * mimo) atomically: each gift row is locked and its qty_reserved is incremented
   * only while it stays <= qty_desired. The DB CHECK is the final guard.
   * Legacy single-gift fields (giftId/giftQty) are folded into giftSelections.
   */
  async createRsvp(data: CreateRsvpInput): Promise<BabyShowerRsvp> {
    const validation = validateCreateRsvp(data);
    if (!validation.success) {
      throw new Error(`Validation failed: ${JSON.stringify(validation.error.issues)}`);
    }
    const v = validation.data;

    // Normalize: merge legacy giftId/giftQty into the selections list, de-duped by giftId.
    const selectionMap = new Map<string, number>();
    for (const s of v.giftSelections ?? []) {
      selectionMap.set(s.giftId, (selectionMap.get(s.giftId) ?? 0) + s.qty);
    }
    if (v.giftId && (v.giftQty ?? 0) >= 1) {
      selectionMap.set(v.giftId, (selectionMap.get(v.giftId) ?? 0) + (v.giftQty as number));
    }
    const selections = Array.from(selectionMap.entries()).map(([giftId, qty]) => ({ giftId, qty }));

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Lock and reserve each selected gift (sorted for deterministic lock order).
      for (const sel of selections.sort((a, b) => a.giftId.localeCompare(b.giftId))) {
        const giftRes = await client.query<BabyShowerGiftRow>(
          `SELECT * FROM baby_shower_gifts WHERE id = $1 AND baby_shower_id = $2 FOR UPDATE`,
          [sel.giftId, v.babyShowerId]
        );
        if (giftRes.rows.length === 0) throw new Error('GIFT_NOT_FOUND');
        const gift = giftRes.rows[0];
        const available = gift.qty_desired - gift.qty_reserved;
        if (sel.qty > available) throw new Error('GIFT_UNAVAILABLE');
        await client.query(
          `UPDATE baby_shower_gifts SET qty_reserved = qty_reserved + $1, updated_at = NOW() WHERE id = $2`,
          [sel.qty, sel.giftId]
        );
      }

      // Primary gift (the fralda) kept in the legacy columns for compatibility.
      const primary = selections[0] ?? null;

      const id = randomUUID();
      const rsvpRes = await client.query<BabyShowerRsvpRow>(
        `INSERT INTO baby_shower_rsvps
           (id, baby_shower_id, guest_name, attendance, message, gift_id, gift_qty, gift_payment_status, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'none',NOW(),NOW())
         RETURNING *`,
        [
          id,
          v.babyShowerId,
          v.guestName,
          v.attendance,
          v.message ?? null,
          primary?.giftId ?? null,
          primary?.qty ?? 0,
        ]
      );

      for (const sel of selections) {
        await client.query(
          `INSERT INTO baby_shower_rsvp_gifts (id, rsvp_id, gift_id, qty, created_at)
           VALUES ($1,$2,$3,$4,NOW())`,
          [randomUUID(), id, sel.giftId, sel.qty]
        );
      }

      await client.query('COMMIT');
      return rowToRsvp(rsvpRes.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      const msg = error instanceof Error ? error.message : 'Unknown error';
      if (msg === 'GIFT_UNAVAILABLE' || msg === 'GIFT_NOT_FOUND') {
        throw new Error(msg);
      }
      console.error('Error creating RSVP:', error);
      throw new Error(`Failed to create RSVP: ${msg}`);
    } finally {
      client.release();
    }
  }

  async getRsvps(babyShowerId: string): Promise<BabyShowerRsvp[]> {
    const result = await pool.query<BabyShowerRsvpRow>(
      `SELECT * FROM baby_shower_rsvps WHERE baby_shower_id = $1 ORDER BY created_at DESC`,
      [babyShowerId]
    );
    if (result.rows.length === 0) return [];

    // Fetch all reserved gifts for these RSVPs in one query, with gift display info.
    const rsvpIds = result.rows.map((r) => r.id);
    const giftRes = await pool.query<RsvpGiftRow & { name: string; category: GiftCategory; diaper_size: DiaperSize | null }>(
      `SELECT rg.*, g.name, g.category, g.diaper_size
         FROM baby_shower_rsvp_gifts rg
         JOIN baby_shower_gifts g ON g.id = rg.gift_id
        WHERE rg.rsvp_id = ANY($1::uuid[])`,
      [rsvpIds]
    );

    const byRsvp = new Map<string, RsvpGift[]>();
    for (const row of giftRes.rows) {
      const list = byRsvp.get(row.rsvp_id) ?? [];
      list.push({
        ...rowToRsvpGift(row),
        giftName: row.name,
        giftCategory: row.category,
        diaperSize: row.diaper_size,
      });
      byRsvp.set(row.rsvp_id, list);
    }

    return result.rows.map((r) => rowToRsvp(r, byRsvp.get(r.id) ?? []));
  }

  /* ---------------------------------------------------------------- */
  /* Dashboard stats                                                 */
  /* ---------------------------------------------------------------- */

  async getStats(babyShowerId: string): Promise<BabyShowerStats> {
    const event = await this.findById(babyShowerId);
    if (!event) throw new Error(`Baby shower with ID ${babyShowerId} not found`);

    const [rsvps, gifts] = await Promise.all([
      this.getRsvps(babyShowerId),
      this.getGifts(babyShowerId),
    ]);

    return {
      totalRsvps: rsvps.length,
      confirmedYes: rsvps.filter((r) => r.attendance === 'sim').length,
      confirmedNo: rsvps.filter((r) => r.attendance === 'nao').length,
      confirmedMaybe: rsvps.filter((r) => r.attendance === 'talvez').length,
      viewCount: event.viewCount,
      rsvps,
      gifts,
    };
  }
}

// Export singleton instance
export const babyShowerService = new BabyShowerService();

export { generateBabyShowerSlug };
