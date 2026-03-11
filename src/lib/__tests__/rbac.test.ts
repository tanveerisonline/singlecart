import { hasPermission } from '../rbac';

describe('RBAC Utility', () => {
  it('should allow SUPER_ADMIN to MANAGE_SETTINGS', () => {
    expect(hasPermission('SUPER_ADMIN', 'MANAGE_SETTINGS')).toBe(true);
  });

  it('should allow ADMIN to MANAGE_SETTINGS', () => {
    expect(hasPermission('ADMIN', 'MANAGE_SETTINGS')).toBe(true);
  });

  it('should not allow MANAGER to MANAGE_SETTINGS', () => {
    expect(hasPermission('MANAGER', 'MANAGE_SETTINGS')).toBe(false);
  });

  it('should allow SUPPORT to VIEW_ANALYTICS', () => {
    expect(hasPermission('SUPPORT', 'VIEW_ANALYTICS')).toBe(true);
  });

  it('should not allow USER to MANAGE_ORDERS', () => {
    expect(hasPermission('USER', 'MANAGE_ORDERS')).toBe(false);
  });

  it('should handle lowercase roles', () => {
    expect(hasPermission('super_admin', 'MANAGE_USERS')).toBe(true);
  });

  it('should return false for unknown roles', () => {
    expect(hasPermission('UNKNOWN_ROLE', 'VIEW_ANALYTICS')).toBe(false);
  });
});
