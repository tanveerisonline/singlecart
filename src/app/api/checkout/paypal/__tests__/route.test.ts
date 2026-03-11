/**
 * @jest-environment node
 */
import { POST } from '../route';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { Client } from '@paypal/paypal-server-sdk';

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/db', () => ({
  db: {
    order: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('@paypal/paypal-server-sdk', () => {
  return {
    Client: jest.fn().mockImplementation(() => ({
      ordersController: {
        ordersCreate: jest.fn().mockResolvedValue({ result: { id: 'paypal_test_order_id' } }),
      },
    })),
    Environment: {
      Sandbox: 'sandbox',
    },
  };
});

describe('PayPal Checkout API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a paypal order id on success', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } });
    (db.order.findUnique as jest.Mock).mockResolvedValue({
      id: 'test-order-id',
      userId: 'user-1',
      totalAmount: 105.50,
    });

    const req = new Request('http://localhost/api/checkout/paypal', {
      method: 'POST',
      body: JSON.stringify({ orderId: 'test-order-id' }),
    });

    const response = await POST(req);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.id).toBe('paypal_test_order_id');
  });
});
