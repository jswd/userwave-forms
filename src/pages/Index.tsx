
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  const { user, userDetails } = useAuth();
  
  const isAuthenticated = !!user;
  const isAdmin = userDetails?.role === "admin";

  return (
    <Layout>
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center space-y-8 py-12 md:py-20">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-fade-in">
            Real-Time User Monitoring System
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl animate-fade-in" style={{ animationDelay: "200ms" }}>
            A sophisticated platform that allows administrators to monitor user activity and form interactions in real-time.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center mt-8 animate-fade-in" style={{ animationDelay: "400ms" }}>
            {isAuthenticated ? (
              <Button asChild size="lg" className="px-8">
                <Link to={isAdmin ? "/admin" : "/dashboard"}>
                  Go to {isAdmin ? "Admin Dashboard" : "Dashboard"}
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="px-8">
                  <Link to="/register">Create Account</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="px-8">
                  <Link to="/login">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-12 animate-fade-in" style={{ animationDelay: "600ms" }}>
          <div className="glass-card p-8 rounded-xl text-center space-y-4">
            <div className="bg-primary/10 rounded-full p-3 inline-block mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary h-8 w-8"><circle cx="12" cy="12" r="10" /><path d="M9 12h6" /><path d="M12 9v6" /></svg>
            </div>
            <h2 className="text-xl font-semibold">User Authentication</h2>
            <p className="text-muted-foreground">
              Secure authentication system with user and admin roles for complete access control.
            </p>
          </div>

          <div className="glass-card p-8 rounded-xl text-center space-y-4">
            <div className="bg-primary/10 rounded-full p-3 inline-block mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary h-8 w-8"><circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" /></svg>
            </div>
            <h2 className="text-xl font-semibold">Real-Time Monitoring</h2>
            <p className="text-muted-foreground">
              Instantly see when users are online and actively filling out forms with WebSocket technology.
            </p>
          </div>

          <div className="glass-card p-8 rounded-xl text-center space-y-4">
            <div className="bg-primary/10 rounded-full p-3 inline-block mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary h-8 w-8"><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" /><path d="M9 9h1" /><path d="M9 13h6" /><path d="M9 17h6" /></svg>
            </div>
            <h2 className="text-xl font-semibold">Comprehensive Forms</h2>
            <p className="text-muted-foreground">
              Detailed user form with 20+ fields that administrators can monitor in real-time.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
