import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="login-page">
      <section className="login-panel">
        <span className="status-pill">Protected admin placeholder</span>
        <h1>Admin login</h1>
        <p>Firebase Authentication and admin role checks will replace this placeholder form.</p>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" placeholder="admin@grwm.local" type="email" />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" placeholder="Not connected yet" type="password" />
        </div>
        <Link className="button-link" href="/dashboard">
          Continue to dashboard
        </Link>
      </section>
    </main>
  );
}
