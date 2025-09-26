'use client';

import React from 'react';
import { UserRole, getRoleDisplayName, getRoleColor } from '@/lib/rbac';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface RoleSelectorProps {
  value: UserRole;
  onValueChange: (role: UserRole) => void;
  availableRoles?: UserRole[];
  disabled?: boolean;
  placeholder?: string;
}

export function RoleSelector({
  value,
  onValueChange,
  availableRoles = Object.values(UserRole),
  disabled = false,
  placeholder = "Select a role"
}: RoleSelectorProps) {
  return (
    <Select
      value={value}
      onValueChange={(newValue) => onValueChange(newValue as UserRole)}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder}>
          {value && (
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={`bg-${getRoleColor(value)}-100 text-${getRoleColor(value)}-800`}
              >
                {getRoleDisplayName(value)}
              </Badge>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {availableRoles.map((role) => (
          <SelectItem key={role} value={role}>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={`bg-${getRoleColor(role)}-100 text-${getRoleColor(role)}-800`}
              >
                {getRoleDisplayName(role)}
              </Badge>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface RoleBadgeProps {
  role: UserRole;
  showTooltip?: boolean;
}

export function RoleBadge({ role, showTooltip = false }: RoleBadgeProps) {
  const displayName = getRoleDisplayName(role);
  const color = getRoleColor(role);

  return (
    <Badge
      variant="secondary"
      className={`bg-${color}-100 text-${color}-800 border-${color}-200`}
      title={showTooltip ? displayName : undefined}
    >
      {displayName}
    </Badge>
  );
}

interface RoleHierarchyProps {
  roles: UserRole[];
  currentRole?: UserRole;
}

export function RoleHierarchy({ roles, currentRole }: RoleHierarchyProps) {
  const sortedRoles = roles.sort((a, b) => {
    const hierarchy = {
      [UserRole.ADMIN]: 7,
      [UserRole.MANAGER]: 6,
      [UserRole.HR]: 5,
      [UserRole.SECURITY_OFFICER]: 4,
      [UserRole.TEACHER]: 3,
      [UserRole.EMPLOYEE]: 2,
      [UserRole.STUDENT]: 1
    };
    return hierarchy[b] - hierarchy[a];
  });

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Role Hierarchy</h4>
      <div className="space-y-1">
        {sortedRoles.map((role) => (
          <div
            key={role}
            className={`flex items-center gap-2 p-2 rounded ${currentRole === role ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
              }`}
          >
            <RoleBadge role={role} />
            {currentRole === role && (
              <Badge variant="outline" className="text-xs">
                Current
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}