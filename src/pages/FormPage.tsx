
import { Layout } from "@/components/layout/Layout";
import { UserForm } from "@/components/user/UserForm";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

export default function FormPage() {
  const { userDetails } = useAuth();

  if (userDetails?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return (
    <Layout>
      <UserForm />
    </Layout>
  );
}
