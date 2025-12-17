// src/pages/employeesPage/EmployeeChips.tsx
import React from "react";
import { Chip } from "@mui/material";
import { roleConfig, departmentConfig, positionConfig } from "./makeData";

export const RoleChip: React.FC<{ role: string }> = ({ role }) => {
  const config = roleConfig[role];

  return (
    <Chip
      label={config?.label ?? role}
      size="small"
      sx={{
        backgroundColor: config?.bgColor ?? "#eee",
        color: config?.color ?? "#555",
        fontWeight: 500,
      }}
    />
  );
};

export const DepartmentChip: React.FC<{ department: string }> = ({ department }) => {
  const config = departmentConfig[department];

  return (
    <Chip
      label={config?.label ?? department}
      size="small"
      sx={{
        backgroundColor: config?.bgColor ?? "#eee",
        color: config?.color ?? "#555",
        fontWeight: 500,
      }}
    />
  );
};

export const PositionChip: React.FC<{ position: string }> = ({ position }) => {
  const config = positionConfig[position];

  return (
    <Chip
      label={config?.label ?? position}
      size="small"
      sx={{
        backgroundColor: config?.bgColor ?? "#eee",
        color: config?.color ?? "#555",
        fontWeight: 500,
      }}
    />
  );
};