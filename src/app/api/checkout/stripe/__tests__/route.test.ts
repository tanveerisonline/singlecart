/**
 * @jest-environment node
 */
import { POST } from '../route';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import Stripe from 'stripe';

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

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/test' }),
      },
    },
  }));
});

describe('Stripe Checkout API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const req = new Request('http://localhost/api/checkout/stripe', {
      method: 'POST',
      body: JSON.stringify({ orderId: 'test-order-id' }),
    });

    const response = await POST(req);
    expect(response.status).toBe(401);
  });

  it('should return 404 if order is not found', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } });
    (db.order.findUnique as jest.Mock).mockResolvedValue(null);

    const req = new Request('http://localhost/api/checkout/stripe', {
      method: 'POST',
      body: JSON.stringify({ orderId: 'test-order-id' }),
    });

    const response = await POST(req);
    expect(response.status).toBe(404);
  });

  it('should return a stripe checkout session URL on success', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } });
    (db.order.findUnique as jest.Mock).mockResolvedValue({
      id: 'test-order-id',
      userId: 'user-1',
      shippingCost: 5,
      items: [
        { price: 50, quantity: 2, product: { name: 'Test Product' } }
      ],
    });

    const req = new Request('http://localhost/api/checkout/stripe', {
      method: 'POST',
      body: JSON.stringify({ orderId: 'test-order-id' }),
    });

    const response = await POST(req);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.url).toBe('https://checkout.stripe.com/test');
  });
});
