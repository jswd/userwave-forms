
import { LoginForm } from "@/components/auth/LoginForm";
import { Layout } from "@/components/layout/Layout";

export default function LoginPage() {
  return (
    <Layout>
      <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-230px)]">
        <LoginForm />
      </div>
    </Layout>
  );
}
