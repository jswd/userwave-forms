
import { Layout } from "@/components/layout/Layout";
import { SupabaseWarning } from "@/lib/supabaseStatus";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Index() {
  return (
    <Layout>
      <div className="container mx-auto py-12 px-4 text-center">
        <SupabaseWarning />
        
        <h1 className="text-4xl font-bold mb-6">Welcome to the Real-Time Form Monitoring System</h1>
        <p className="text-xl mb-8">
          This application allows administrators to monitor user form activities in real-time.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg">
            <Link to="/login">Sign In</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/register">Create Account</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}
