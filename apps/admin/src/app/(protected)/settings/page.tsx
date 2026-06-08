import { PageHeader } from "../../../components/PageHeader";
import { SectionCard } from "../../../components/SectionCard";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        description="Admin configuration placeholders for roles, privacy controls, and audit behavior."
        title="Settings"
      />
      <div className="content-grid">
        <SectionCard title="Access">
          <p>Firebase custom claims and role-based access control will replace the placeholder session.</p>
        </SectionCard>
        <SectionCard title="Privacy">
          <p>Consent versioning and user data deletion settings will be finalized before production data collection.</p>
        </SectionCard>
      </div>
    </>
  );
}
