import pool from '../lib/db';
import { PRODUCTS } from '../config/products';

export interface ProductStats {
  productId: string;
  productName: string;
  totalSales: number;
  totalRevenue: number;
  totalViews: number;
  priceInCents: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalViews: number;
  productStats: ProductStats[];
  recentOrders: RecentOrder[];
  salesByPeriod: SalesByPeriod[];
}

export interface RecentOrder {
  id: string;
  productType: string;
  productName: string;
  customerEmail: string;
  amountCents: number;
  status: string;
  createdAt: Date;
  slug: string | null;
}

export interface SalesByPeriod {
  date: string;
  totalSales: number;
  totalRevenue: number;
}

/**
 * AnalyticsService
 * Aggregates data for admin dashboard
 */
export class AnalyticsService {
  /**
   * Get complete dashboard statistics
   */
  async getDashboardStats(days: number = 30): Promise<DashboardStats> {
    const [productStats, recentOrders, salesByPeriod, totalViews] = await Promise.all([
      this.getProductStats(),
      this.getRecentOrders(10),
      this.getSalesByPeriod(days),
      this.getTotalViews(),
    ]);

    const totalRevenue = productStats.reduce((sum, p) => sum + p.totalRevenue, 0);
    const totalOrders = productStats.reduce((sum, p) => sum + p.totalSales, 0);

    return {
      totalRevenue,
      totalOrders,
      totalViews,
      productStats,
      recentOrders,
      salesByPeriod,
    };
  }


  /**
   * Get statistics per product
   */
  async getProductStats(): Promise<ProductStats[]> {
    const stats: ProductStats[] = [];

    // Stats for 'message' product
    const messageQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'paid') as total_sales,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) * $1, 0) as total_revenue,
        COALESCE(SUM(view_count), 0) as total_views
      FROM messages
    `;
    const messageResult = await pool.query(messageQuery, [PRODUCTS.message.priceInCents]);
    stats.push({
      productId: 'message',
      productName: PRODUCTS.message.name,
      totalSales: parseInt(messageResult.rows[0].total_sales) || 0,
      totalRevenue: parseInt(messageResult.rows[0].total_revenue) || 0,
      totalViews: parseInt(messageResult.rows[0].total_views) || 0,
      priceInCents: PRODUCTS.message.priceInCents,
    });

    // Stats for 'card-collection' product
    const cardQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'paid') as total_sales,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) * $1, 0) as total_revenue,
        0 as total_views
      FROM card_collections
    `;
    const cardResult = await pool.query(cardQuery, [PRODUCTS['card-collection'].priceInCents]);
    stats.push({
      productId: 'card-collection',
      productName: PRODUCTS['card-collection'].name,
      totalSales: parseInt(cardResult.rows[0].total_sales) || 0,
      totalRevenue: parseInt(cardResult.rows[0].total_revenue) || 0,
      totalViews: parseInt(cardResult.rows[0].total_views) || 0,
      priceInCents: PRODUCTS['card-collection'].priceInCents,
    });

    // Stats for 'gender-reveal' product
    const revealQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'paid') as total_sales,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) * $1, 0) as total_revenue,
        COALESCE(SUM(view_count), 0) as total_views
      FROM gender_reveals
    `;
    const revealResult = await pool.query(revealQuery, [PRODUCTS['gender-reveal'].priceInCents]);
    stats.push({
      productId: 'gender-reveal',
      productName: PRODUCTS['gender-reveal'].name,
      totalSales: parseInt(revealResult.rows[0].total_sales) || 0,
      totalRevenue: parseInt(revealResult.rows[0].total_revenue) || 0,
      totalViews: parseInt(revealResult.rows[0].total_views) || 0,
      priceInCents: PRODUCTS['gender-reveal'].priceInCents,
    });

    return stats;
  }

  /**
   * Get recent orders across all products
   */
  async getRecentOrders(limit: number = 10): Promise<RecentOrder[]> {
    const orders: RecentOrder[] = [];

    // Messages
    const msgQuery = `
      SELECT id, 'message' as product_type, contact_email, status, created_at, slug
      FROM messages WHERE status = 'paid'
      ORDER BY created_at DESC LIMIT $1
    `;
    const msgResult = await pool.query(msgQuery, [limit]);
    for (const row of msgResult.rows) {
      orders.push({
        id: row.id,
        productType: 'message',
        productName: PRODUCTS.message.name,
        customerEmail: row.contact_email || 'N/A',
        amountCents: PRODUCTS.message.priceInCents,
        status: row.status,
        createdAt: row.created_at,
        slug: row.slug || null,
      });
    }

    // Card Collections
    const cardQuery = `
      SELECT id, 'card-collection' as product_type, contact_email, status, created_at, slug
      FROM card_collections WHERE status = 'paid'
      ORDER BY created_at DESC LIMIT $1
    `;
    const cardResult = await pool.query(cardQuery, [limit]);
    for (const row of cardResult.rows) {
      orders.push({
        id: row.id,
        productType: 'card-collection',
        productName: PRODUCTS['card-collection'].name,
        customerEmail: row.contact_email || 'N/A',
        amountCents: PRODUCTS['card-collection'].priceInCents,
        status: row.status,
        createdAt: row.created_at,
        slug: row.slug || null,
      });
    }

    // Gender Reveals
    const revealQuery = `
      SELECT id, 'gender-reveal' as product_type, contact_email, status, created_at, slug
      FROM gender_reveals WHERE status = 'paid'
      ORDER BY created_at DESC LIMIT $1
    `;
    const revealResult = await pool.query(revealQuery, [limit]);
    for (const row of revealResult.rows) {
      orders.push({
        id: row.id,
        productType: 'gender-reveal',
        productName: PRODUCTS['gender-reveal'].name,
        customerEmail: row.contact_email || 'N/A',
        amountCents: PRODUCTS['gender-reveal'].priceInCents,
        status: row.status,
        createdAt: row.created_at,
        slug: row.slug || null,
      });
    }

    // Sort by date and limit
    return orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  /**
   * Get sales aggregated by day
   */
  async getSalesByPeriod(days: number = 30): Promise<SalesByPeriod[]> {
    const salesMap = new Map<string, SalesByPeriod>();

    // Initialize all days with zero
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      salesMap.set(dateStr, { date: dateStr, totalSales: 0, totalRevenue: 0 });
    }

    // Messages
    const msgQuery = `
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM messages 
      WHERE status = 'paid' AND created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
    `;
    const msgResult = await pool.query(msgQuery);
    for (const row of msgResult.rows) {
      const dateStr = new Date(row.date).toISOString().split('T')[0];
      const existing = salesMap.get(dateStr);
      if (existing) {
        existing.totalSales += parseInt(row.count);
        existing.totalRevenue += parseInt(row.count) * PRODUCTS.message.priceInCents;
      }
    }

    // Card Collections
    const cardQuery = `
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM card_collections 
      WHERE status = 'paid' AND created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
    `;
    const cardResult = await pool.query(cardQuery);
    for (const row of cardResult.rows) {
      const dateStr = new Date(row.date).toISOString().split('T')[0];
      const existing = salesMap.get(dateStr);
      if (existing) {
        existing.totalSales += parseInt(row.count);
        existing.totalRevenue += parseInt(row.count) * PRODUCTS['card-collection'].priceInCents;
      }
    }

    // Gender Reveals
    const revealQuery = `
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM gender_reveals 
      WHERE status = 'paid' AND created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
    `;
    const revealResult = await pool.query(revealQuery);
    for (const row of revealResult.rows) {
      const dateStr = new Date(row.date).toISOString().split('T')[0];
      const existing = salesMap.get(dateStr);
      if (existing) {
        existing.totalSales += parseInt(row.count);
        existing.totalRevenue += parseInt(row.count) * PRODUCTS['gender-reveal'].priceInCents;
      }
    }

    // Convert to array and sort by date
    return Array.from(salesMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get total views across all products
   */
  async getTotalViews(): Promise<number> {
    let total = 0;

    const msgResult = await pool.query('SELECT COALESCE(SUM(view_count), 0) as total FROM messages');
    total += parseInt(msgResult.rows[0].total) || 0;

    const revealResult = await pool.query('SELECT COALESCE(SUM(view_count), 0) as total FROM gender_reveals');
    total += parseInt(revealResult.rows[0].total) || 0;

    return total;
  }

  /**
   * Get all orders with pagination and filters
   */
  async getAllOrders(options: {
    page?: number;
    limit?: number;
    productType?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{ orders: RecentOrder[]; total: number }> {
    const { page = 1, limit = 20, productType, status, startDate, endDate } = options;
    const offset = (page - 1) * limit;
    const orders: RecentOrder[] = [];
    let total = 0;

    const tables = productType 
      ? [productType] 
      : ['message', 'card-collection', 'gender-reveal'];

    for (const table of tables) {
      const tableName = table === 'message' ? 'messages' 
        : table === 'card-collection' ? 'card_collections' 
        : 'gender_reveals';
      
      let whereClause = '1=1';
      const params: any[] = [];
      let paramIndex = 1;

      if (status) {
        whereClause += ` AND status = $${paramIndex++}`;
        params.push(status);
      }
      if (startDate) {
        whereClause += ` AND created_at >= $${paramIndex++}`;
        params.push(startDate);
      }
      if (endDate) {
        whereClause += ` AND created_at <= $${paramIndex++}`;
        params.push(endDate);
      }

      const countQuery = `SELECT COUNT(*) FROM ${tableName} WHERE ${whereClause}`;
      const countResult = await pool.query(countQuery, params);
      total += parseInt(countResult.rows[0].count) || 0;

      const query = `
        SELECT id, '${table}' as product_type, contact_email, status, created_at, slug
        FROM ${tableName}
        WHERE ${whereClause}
        ORDER BY created_at DESC
      `;
      const result = await pool.query(query, params);
      
      for (const row of result.rows) {
        const product = PRODUCTS[table as keyof typeof PRODUCTS];
        orders.push({
          id: row.id,
          productType: table,
          productName: product?.name || table,
          customerEmail: row.contact_email || 'N/A',
          amountCents: product?.priceInCents || 0,
          status: row.status,
          createdAt: row.created_at,
          slug: row.slug || null,
        });
      }
    }

    // Sort and paginate
    const sorted = orders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return {
      orders: sorted.slice(offset, offset + limit),
      total,
    };
  }
}

export const analyticsService = new AnalyticsService();
