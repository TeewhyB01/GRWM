import Link from "next/link";
import type { ReactNode } from "react";

import { adminRoutes } from "../lib/admin-routes";

interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="admin-shell">
      <aside className="sidebar" aria-label="Admin navigation">
        <div className="brand">
          <span className="brand-mark">G</span>
          <div>
            <strong>GRWM</strong>
            <span>Admin</span>
          </div>
        </div>
        <nav className="nav-list">
          {adminRoutes.map((route) => (
            <Link className="nav-link" href={route.href} key={route.id}>
              <span>{route.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
