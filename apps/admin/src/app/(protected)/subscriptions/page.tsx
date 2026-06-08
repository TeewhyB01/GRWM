import { PageHeader } from "../../../components/PageHeader";
import { SectionCard } from "../../../components/SectionCard";

export default function SubscriptionsPage() {
  return (
    <>
      <PageHeader
        description="Premium plan operations are intentionally deferred until core account and privacy models exist."
        title="Subscriptions"
      />
      <SectionCard title="Billing placeholder">
        <p>No payment provider or subscription webhook is active yet.</p>
      </SectionCard>
    </>
  );
}
