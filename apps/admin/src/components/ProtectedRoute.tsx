import type { ReactNode } from "react";

import { getAdminSessionPlaceholder } from "../lib/auth";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const session = getAdminSessionPlaceholder();

  return (
    <section aria-label="Protected admin area" data-placeholder-auth={session.isPlaceholder}>
      {children}
    </section>
  );
}
