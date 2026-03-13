import pool from '../lib/db';
import { randomUUID } from 'crypto';
import {
  GenderReveal,
  GenderRevealRow,
  GenderRevealVote,
  GenderRevealVoteRow,
  GenderRevealStats,
  CreateGenderRevealInput,
  CreateVoteInput,
  rowToGenderReveal,
  rowToVote,
  validateCreateGenderReveal,
  validateCreateVote,
  generateRevealSlug,
} from '../types/gender-reveal';

/**
 * GenderRevealService
 * Handles all database operations for gender reveals
 */
export class GenderRevealService {
  /**
   * Create a new gender reveal
   */
  async create(data: CreateGenderRevealInput): Promise<GenderReveal> {
    const validation = validateCreateGenderReveal(data);
    if (!validation.success) {
      throw new Error(`Validation failed: ${JSON.stringify(validation.error.issues)}`);
    }

    const validatedData = validation.data;
    const id = randomUUID();

    const query = `
      INSERT INTO gender_reveals (
        id, boy_name, girl_name, actual_gender,
        dad_name, mom_name, story_message, photos,
        boy_color, girl_color,
        contact_name, contact_email, contact_phone,
        status, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
      RETURNING *
    `;

    const values = [
      id,
      validatedData.boyName,
      validatedData.girlName,
      validatedData.actualGender,
      validatedData.dadName,
      validatedData.momName,
      validatedData.storyMessage || null,
      validatedData.photos || [],
      validatedData.boyColor || '#5B9BD5',
      validatedData.girlColor || '#E6A0B8',
      validatedData.contactName || null,
      validatedData.contactEmail || null,
      validatedData.contactPhone || null,
      'pending',
    ];

    try {
      const result = await pool.query<GenderRevealRow>(query, values);
      if (result.rows.length === 0) {
        throw new Error('Failed to create gender reveal');
      }
      return rowToGenderReveal(result.rows[0]);
    } catch (error) {
      console.error('Error creating gender reveal:', error);
      throw new Error(`Failed to create gender reveal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find by ID
   */
  async findById(id: string): Promise<GenderReveal | null> {
    const query = `SELECT * FROM gender_reveals WHERE id = $1`;
    try {
      const result = await pool.query<GenderRevealRow>(query, [id]);
      if (result.rows.length === 0) return null;
      return rowToGenderReveal(result.rows[0]);
    } catch (error) {
      console.error('Error finding gender reveal by ID:', error);
      throw new Error(`Failed to find gender reveal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find by public slug
   */
  async findBySlug(slug: string): Promise<GenderReveal | null> {
    const query = `SELECT * FROM gender_reveals WHERE slug = $1`;
    try {
      const result = await pool.query<GenderRevealRow>(query, [slug]);
      if (result.rows.length === 0) return null;
      return rowToGenderReveal(result.rows[0]);
    } catch (error) {
      console.error('Error finding gender reveal by slug:', error);
      throw new Error(`Failed to find gender reveal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find by dashboard slug
   */
  async findByDashboardSlug(dashboardSlug: string): Promise<GenderReveal | null> {
    const query = `SELECT * FROM gender_reveals WHERE dashboard_slug = $1`;
    try {
      const result = await pool.query<GenderRevealRow>(query, [dashboardSlug]);
      if (result.rows.length === 0) return null;
      return rowToGenderReveal(result.rows[0]);
    } catch (error) {
      console.error('Error finding gender reveal by dashboard slug:', error);
      throw new Error(`Failed to find gender reveal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find by payment ID
   */
  async findByPaymentId(paymentId: string): Promise<GenderReveal | null> {
    const query = `SELECT * FROM gender_reveals WHERE payment_id = $1`;
    try {
      const result = await pool.query<GenderRevealRow>(query, [paymentId]);
      if (result.rows.length === 0) return null;
      return rowToGenderReveal(result.rows[0]);
    } catch (error) {
      console.error('Error finding gender reveal by payment ID:', error);
      throw new Error(`Failed to find gender reveal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update gender reveal
   */
  async update(id: string, data: Partial<GenderReveal>): Promise<GenderReveal> {
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    const fieldMap: Record<string, string> = {
      boyName: 'boy_name',
      girlName: 'girl_name',
      actualGender: 'actual_gender',
      dadName: 'dad_name',
      momName: 'mom_name',
      storyMessage: 'story_message',
      photos: 'photos',
      boyColor: 'boy_color',
      girlColor: 'girl_color',
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

    for (const [key, dbField] of Object.entries(fieldMap)) {
      if (data[key as keyof GenderReveal] !== undefined) {
        updates.push(`${dbField} = $${paramIndex++}`);
        values.push(data[key as keyof GenderReveal]);
      }
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    updates.push('updated_at = NOW()');
    values.push(id);

    const query = `
      UPDATE gender_reveals
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    try {
      const result = await pool.query<GenderRevealRow>(query, values);
      if (result.rows.length === 0) {
        throw new Error(`Gender reveal with ID ${id} not found`);
      }
      return rowToGenderReveal(result.rows[0]);
    } catch (error) {
      console.error('Error updating gender reveal:', error);
      throw new Error(`Failed to update gender reveal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update status to paid and generate slugs
   */
  async markAsPaid(id: string, qrCodeUrl: string): Promise<GenderReveal> {
    const reveal = await this.findById(id);
    if (!reveal) {
      throw new Error(`Gender reveal with ID ${id} not found`);
    }

    const slug = generateRevealSlug(reveal.boyName, reveal.girlName, id);
    const dashboardSlug = `dashboard-${slug}`;

    return this.update(id, {
      status: 'paid',
      slug,
      dashboardSlug,
      qrCodeUrl,
    });
  }

  /**
   * Update payment ID
   */
  async updatePaymentId(id: string, paymentId: string): Promise<GenderReveal> {
    return this.update(id, { paymentId });
  }

  /**
   * Increment view count
   */
  async incrementViewCount(id: string): Promise<void> {
    const query = `
      UPDATE gender_reveals
      SET view_count = view_count + 1, updated_at = NOW()
      WHERE id = $1
    `;
    try {
      await pool.query(query, [id]);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  }

  /**
   * Add a vote
   */
  async addVote(data: CreateVoteInput): Promise<GenderRevealVote> {
    const validation = validateCreateVote(data);
    if (!validation.success) {
      throw new Error(`Validation failed: ${JSON.stringify(validation.error.issues)}`);
    }

    const validatedData = validation.data;
    const id = randomUUID();

    const query = `
      INSERT INTO gender_reveal_votes (id, reveal_id, voter_name, vote, message, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `;

    const values = [
      id,
      validatedData.revealId,
      validatedData.voterName,
      validatedData.vote,
      validatedData.message || null,
    ];

    try {
      const result = await pool.query<GenderRevealVoteRow>(query, values);
      if (result.rows.length === 0) {
        throw new Error('Failed to create vote');
      }
      return rowToVote(result.rows[0]);
    } catch (error) {
      console.error('Error creating vote:', error);
      throw new Error(`Failed to create vote: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get votes for a reveal
   */
  async getVotes(revealId: string): Promise<GenderRevealVote[]> {
    const query = `
      SELECT * FROM gender_reveal_votes
      WHERE reveal_id = $1
      ORDER BY created_at DESC
    `;
    try {
      const result = await pool.query<GenderRevealVoteRow>(query, [revealId]);
      return result.rows.map(rowToVote);
    } catch (error) {
      console.error('Error getting votes:', error);
      throw new Error(`Failed to get votes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get stats for dashboard
   */
  async getStats(revealId: string): Promise<GenderRevealStats> {
    const reveal = await this.findById(revealId);
    if (!reveal) {
      throw new Error(`Gender reveal with ID ${revealId} not found`);
    }

    const votes = await this.getVotes(revealId);
    const boyVotes = votes.filter(v => v.vote === 'menino').length;
    const girlVotes = votes.filter(v => v.vote === 'menina').length;

    return {
      totalVotes: votes.length,
      boyVotes,
      girlVotes,
      viewCount: reveal.viewCount,
      votes,
    };
  }
}

// Export singleton instance
export const genderRevealService = new GenderRevealService();
