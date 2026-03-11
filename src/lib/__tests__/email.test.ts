import { sendOrderConfirmation, sendShippingNotification } from '../email';
import nodemailer from 'nodemailer';

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  }),
}));

describe('Email Utility', () => {
  const mockEmail = 'test@example.com';
  const mockOrderNumber = 'ORD-12345';

  it('should call sendMail for order confirmation', async () => {
    const result = await sendOrderConfirmation(mockEmail, mockOrderNumber, 150.00);
    expect(result.success).toBe(true);
    expect(result.messageId).toBe('test-message-id');
  });

  it('should call sendMail for shipping notification', async () => {
    const result = await sendShippingNotification(mockEmail, mockOrderNumber, 'TRACK-999');
    expect(result.success).toBe(true);
    expect(result.messageId).toBe('test-message-id');
  });
});
