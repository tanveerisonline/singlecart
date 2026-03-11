/**
 * @jest-environment node
 */
import { POST } from '../route';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import Razorpay from 'razorpay';

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

jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => ({
    orders: {
      create: jest.fn().mockResolvedValue({ id: 'rzp_test_order', currency: 'INR', amount: 10500 }),
    },
  }));
});

describe('Razorpay Checkout API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a razorpay order id on success', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } });
    (db.order.findUnique as jest.Mock).mockResolvedValue({
      id: 'test-order-id',
      userId: 'user-1',
      totalAmount: 105,
    });

    const req = new Request('http://localhost/api/checkout/razorpay', {
      method: 'POST',
      body: JSON.stringify({ orderId: 'test-order-id' }),
    });

    const response = await POST(req);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.id).toBe('rzp_test_order');
    expect(data.amount).toBe(10500); // in paise
  });
});
