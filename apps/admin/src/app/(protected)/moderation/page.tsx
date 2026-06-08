import { PageHeader } from "../../../components/PageHeader";
import { SectionCard } from "../../../components/SectionCard";

export default function ModerationPage() {
  return (
    <>
      <PageHeader
        description="Image and content moderation queues will support wardrobe uploads after Storage rules are finalized."
        title="Moderation"
      />
      <SectionCard title="Queue status">
        <p>No moderation queue is connected yet.</p>
      </SectionCard>
    </>
  );
}
