
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Layout } from "@/components/layout/Layout";

export default function RegisterPage() {
  return (
    <Layout>
      <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-230px)]">
        <RegisterForm />
      </div>
    </Layout>
  );
}
