
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { Layout } from "@/components/layout/Layout";
import { SupabaseWarning } from "@/lib/supabaseStatus";

export default function AdminPage() {
  return (
    <Layout>
      <SupabaseWarning />
      <AdminDashboard />
    </Layout>
  );
}
