import { PageHeader } from "../../../components/PageHeader";
import { SectionCard } from "../../../components/SectionCard";

export default function UsersPage() {
  return (
    <>
      <PageHeader
        description="User profile and privacy support workflows will appear here after Firebase Auth and Firestore are connected."
        title="Users"
      />
      <SectionCard title="User records">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Locale</th>
              <th>Plan</th>
              <th>Privacy status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Placeholder</td>
              <td>en</td>
              <td>Free</td>
              <td>Pending model</td>
            </tr>
          </tbody>
        </table>
      </SectionCard>
    </>
  );
}
