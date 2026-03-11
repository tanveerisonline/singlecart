export type Role = "USER" | "ADMIN" | "SUPPORT" | "MANAGER" | "SUPER_ADMIN";

export type Permission = 
  | "MANAGE_PRODUCTS"
  | "MANAGE_ORDERS"
  | "MANAGE_USERS"
  | "MANAGE_SETTINGS"
  | "VIEW_ANALYTICS";

const rolePermissions: Record<Role, Permission[]> = {
  USER: [],
  ADMIN: ["MANAGE_PRODUCTS", "MANAGE_ORDERS", "MANAGE_USERS", "MANAGE_SETTINGS", "VIEW_ANALYTICS"],
  SUPPORT: ["MANAGE_ORDERS", "VIEW_ANALYTICS"],
  MANAGER: ["MANAGE_PRODUCTS", "MANAGE_ORDERS", "VIEW_ANALYTICS"],
  SUPER_ADMIN: ["MANAGE_PRODUCTS", "MANAGE_ORDERS", "MANAGE_USERS", "MANAGE_SETTINGS", "VIEW_ANALYTICS"],
};

export function hasPermission(userRole: string | undefined | null, requiredPermission: Permission): boolean {
  console.log("[RBAC_DEBUG] Checking permission:", { userRole, requiredPermission });
  if (!userRole) {
    console.log("[RBAC_DEBUG] No role provided");
    return false;
  }
  const role = userRole.toUpperCase() as Role;
  const permissions = rolePermissions[role];
  if (!permissions) {
    console.log("[RBAC_DEBUG] No permissions found for role:", role);
    return false;
  }
  const hasIt = permissions.includes(requiredPermission);
  console.log("[RBAC_DEBUG] Result:", hasIt);
  return hasIt;
}
