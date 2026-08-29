export type Permission =
  | "factory:manage"
  | "order:create"
  | "order:approve"
  | "order:read"
  | "production:manage"
  | "production:execute"
  | "inventory:write"
  | "financials:read"
  | "copilot:access";

export type SystemRole = "OWNER_ADMIN" | "SUPERVISOR" | "WORKER_OPERATOR" | "CUSTOMER";

export const ROLE_PERMISSIONS: Record<SystemRole, Permission[]> = {
  OWNER_ADMIN: [
    "factory:manage",
    "order:create",
    "order:approve",
    "order:read",
    "production:manage",
    "production:execute",
    "inventory:write",
    "financials:read",
    "copilot:access",
  ],
  SUPERVISOR: [
    "order:create",
    "order:read",
    "production:manage",
    "production:execute",
    "inventory:write",
    "copilot:access",
  ],
  WORKER_OPERATOR: [
    "order:read",
    "production:execute",
  ],
  CUSTOMER: [
    "order:read",
  ],
};

export function hasPermission(role: SystemRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
