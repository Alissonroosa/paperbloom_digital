/**
 * Testes unitários para DigitalArtOrderService
 * Usa mock do pool pg — sem conexão real com banco.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock do pool pg antes de importar o service
vi.mock('@/lib/db', () => ({
  default: {
    query: vi.fn(),
  },
}));

import pool from '@/lib/db';
import { DigitalArtOrderService } from '../DigitalArtOrderService';

const mockQuery = vi.mocked(pool.query);

const mockOrder = {
  id: 'order-uuid-001',
  email: 'cliente@exemplo.com',
  product_slug: 'aquarela-rosas-carta-de-amor',
  product_title: 'Aquarela de Rosas — Carta de Amor',
  amount_cents: 1990,
  mp_payment_id: null,
  mp_preference_id: null,
  status: 'pending' as const,
  created_at: new Date('2026-06-01T12:00:00Z'),
  paid_at: null,
  refunded_at: null,
};

describe('DigitalArtOrderService', () => {
  let service: DigitalArtOrderService;

  beforeEach(() => {
    service = new DigitalArtOrderService();
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------
  // createPendingOrder
  // -----------------------------------------------------------
  describe('createPendingOrder', () => {
    it('deve criar um pedido pending e retornar o registro', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockOrder], rowCount: 1 } as never);

      const result = await service.createPendingOrder({
        email: 'cliente@exemplo.com',
        productSlug: 'aquarela-rosas-carta-de-amor',
        productTitle: 'Aquarela de Rosas — Carta de Amor',
        amountCents: 1990,
      });

      expect(result).toEqual(mockOrder);
      expect(mockQuery).toHaveBeenCalledOnce();
      // Verifica que a query contém INSERT e 'pending'
      const [sql, params] = mockQuery.mock.calls[0] as [string, unknown[]];
      expect(sql).toContain('INSERT INTO digital_art_orders');
      expect(params).toContain('cliente@exemplo.com');
      expect(params).toContain(1990);
    });

    it('deve passar mpPreferenceId quando fornecido', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ ...mockOrder, mp_preference_id: 'pref_123' }], rowCount: 1 } as never);

      await service.createPendingOrder({
        email: 'cliente@exemplo.com',
        productSlug: 'aquarela-rosas-carta-de-amor',
        productTitle: 'Aquarela de Rosas',
        amountCents: 1990,
        mpPreferenceId: 'pref_123',
      });

      const [, params] = mockQuery.mock.calls[0] as [string, unknown[]];
      expect(params).toContain('pref_123');
    });

    it('deve passar null para mpPreferenceId quando não fornecido', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockOrder], rowCount: 1 } as never);

      await service.createPendingOrder({
        email: 'cliente@exemplo.com',
        productSlug: 'slug',
        productTitle: 'Título',
        amountCents: 1990,
      });

      const [, params] = mockQuery.mock.calls[0] as [string, unknown[]];
      expect(params).toContain(null);
    });
  });

  // -----------------------------------------------------------
  // updatePreferenceId
  // -----------------------------------------------------------
  describe('updatePreferenceId', () => {
    it('deve executar UPDATE com orderId e mpPreferenceId', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 } as never);

      await service.updatePreferenceId('order-uuid-001', 'pref_abc');

      const [sql, params] = mockQuery.mock.calls[0] as [string, unknown[]];
      expect(sql).toContain('UPDATE digital_art_orders');
      expect(sql).toContain('mp_preference_id');
      expect(params).toContain('pref_abc');
      expect(params).toContain('order-uuid-001');
    });
  });

  // -----------------------------------------------------------
  // markAsPaid
  // -----------------------------------------------------------
  describe('markAsPaid', () => {
    it('deve executar UPDATE com status paid e mp_payment_id', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 } as never);

      await service.markAsPaid('order-uuid-001', 'pay_mp_123');

      const [sql, params] = mockQuery.mock.calls[0] as [string, unknown[]];
      expect(sql).toContain("status = 'paid'");
      expect(sql).toContain('paid_at');
      expect(params).toContain('pay_mp_123');
      expect(params).toContain('order-uuid-001');
    });
  });

  // -----------------------------------------------------------
  // markAsRefunded
  // -----------------------------------------------------------
  describe('markAsRefunded', () => {
    it('deve executar UPDATE por mp_payment_id com status refunded', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 } as never);

      await service.markAsRefunded('pay_mp_123');

      const [sql, params] = mockQuery.mock.calls[0] as [string, unknown[]];
      expect(sql).toContain("status = 'refunded'");
      expect(sql).toContain('refunded_at');
      expect(params).toContain('pay_mp_123');
    });
  });

  // -----------------------------------------------------------
  // findByEmail
  // -----------------------------------------------------------
  describe('findByEmail', () => {
    it('deve retornar pedidos paid do email', async () => {
      const paidOrder = { ...mockOrder, status: 'paid' as const, paid_at: new Date() };
      mockQuery.mockResolvedValueOnce({ rows: [paidOrder], rowCount: 1 } as never);

      const result = await service.findByEmail('cliente@exemplo.com');

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('paid');
      const [sql, params] = mockQuery.mock.calls[0] as [string, unknown[]];
      expect(sql).toContain("status = 'paid'");
      expect(params).toContain('cliente@exemplo.com');
    });

    it('deve retornar array vazio quando não há pedidos', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as never);

      const result = await service.findByEmail('nenhum@exemplo.com');

      expect(result).toEqual([]);
    });
  });

  // -----------------------------------------------------------
  // findById
  // -----------------------------------------------------------
  describe('findById', () => {
    it('deve retornar pedido pelo id', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockOrder], rowCount: 1 } as never);

      const result = await service.findById('order-uuid-001');

      expect(result).toEqual(mockOrder);
      const [sql, params] = mockQuery.mock.calls[0] as [string, unknown[]];
      expect(sql).toContain('WHERE id = $1');
      expect(params).toContain('order-uuid-001');
    });

    it('deve retornar null quando pedido não existe', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as never);

      const result = await service.findById('uuid-inexistente');

      expect(result).toBeNull();
    });
  });

  // -----------------------------------------------------------
  // findByMpPaymentId
  // -----------------------------------------------------------
  describe('findByMpPaymentId', () => {
    it('deve retornar pedido pelo mp_payment_id', async () => {
      const paidOrder = { ...mockOrder, mp_payment_id: 'pay_mp_999', status: 'paid' as const };
      mockQuery.mockResolvedValueOnce({ rows: [paidOrder], rowCount: 1 } as never);

      const result = await service.findByMpPaymentId('pay_mp_999');

      expect(result).toEqual(paidOrder);
      const [sql, params] = mockQuery.mock.calls[0] as [string, unknown[]];
      expect(sql).toContain('mp_payment_id = $1');
      expect(params).toContain('pay_mp_999');
    });

    it('deve retornar null quando mp_payment_id não existe', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as never);

      const result = await service.findByMpPaymentId('pay_inexistente');

      expect(result).toBeNull();
    });
  });
});
