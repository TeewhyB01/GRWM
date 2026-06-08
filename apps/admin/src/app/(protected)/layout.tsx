import type { ReactNode } from "react";

import { AdminShell } from "../../components/AdminShell";
import { ProtectedRoute } from "../../components/ProtectedRoute";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <ProtectedRoute>
      <AdminShell>{children}</AdminShell>
    </ProtectedRoute>
  );
}
