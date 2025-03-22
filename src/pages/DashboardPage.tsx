
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const { userDetails } = useAuth();

  if (userDetails?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl">
        <div className="glass-card p-8 rounded-xl text-center">
          <h1 className="text-3xl font-bold mb-4">Welcome, {userDetails?.fullName || "User"}!</h1>
          <p className="text-muted-foreground mb-8">
            This is your personal dashboard where you can manage your information.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white/50 dark:bg-black/20 p-6 rounded-lg border border-white/30 dark:border-white/10 text-left">
              <h2 className="text-xl font-semibold mb-3">Your Information</h2>
              <p className="text-muted-foreground mb-6">
                Fill out your personal and professional information in the form.
              </p>
              <Button asChild className="w-full">
                <Link to="/form">
                  Update My Information
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="bg-white/50 dark:bg-black/20 p-6 rounded-lg border border-white/30 dark:border-white/10 text-left">
              <h2 className="text-xl font-semibold mb-3">Profile Settings</h2>
              <p className="text-muted-foreground mb-6">
                View and update your account settings and preferences.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/profile">
                  Manage Profile
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              Administrators can view when you're online and monitor your form activity in real-time.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
