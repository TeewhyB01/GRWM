import { MetricCard } from "../../../components/MetricCard";
import { PageHeader } from "../../../components/PageHeader";
import { SectionCard } from "../../../components/SectionCard";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        description="A privacy-first operational overview for the Phase 1 platform shell."
        title="Dashboard"
      />
      <div className="metric-grid">
        <MetricCard detail="Placeholder account count until Firestore is connected." label="Users" value="0" />
        <MetricCard detail="Wardrobe uploads are not enabled yet." label="Wardrobe items" value="0" />
        <MetricCard detail="Recommendation jobs are intentionally disabled." label="Outfit jobs" value="0" />
      </div>
      <div className="content-grid">
        <SectionCard title="Phase 1 focus">
          <ul className="placeholder-list">
            <li>Firebase Authentication integration.</li>
            <li>Privacy consent and user profile models.</li>
            <li>Wardrobe upload foundations.</li>
          </ul>
        </SectionCard>
        <SectionCard title="Deferred systems">
          <p>AI, avatar, payment, and shopping workflows are represented as placeholders only.</p>
        </SectionCard>
      </div>
    </>
  );
}
