import { PageHeader } from "../../../components/PageHeader";
import { SectionCard } from "../../../components/SectionCard";

export default function AiMonitoringPage() {
  return (
    <>
      <PageHeader
        description="Recommendation safety, quality, and audit signals will be monitored here in a later phase."
        title="AI Monitoring"
      />
      <SectionCard title="Placeholder scope">
        <p>No AI recommendations are implemented yet. This page reserves the operational surface.</p>
      </SectionCard>
    </>
  );
}
