
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
  const { userDetails, signOut } = useAuth();

  const userInitials = userDetails?.fullName
    ? userDetails.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : userDetails?.email?.charAt(0).toUpperCase() || "U";

  return (
    <Layout>
      <div className="container mx-auto max-w-3xl">
        <div className="glass-card p-8 rounded-xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-24 w-24 border border-white/20">
              <AvatarImage src={userDetails?.avatarUrl || ""} alt={userDetails?.fullName || ""} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold">
                {userDetails?.fullName || userDetails?.email?.split("@")[0]}
              </h1>
              <p className="text-muted-foreground">{userDetails?.email}</p>
              <p className="mt-2 capitalize">{userDetails?.role}</p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/20">
            <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
            <p className="text-muted-foreground mb-6">
              Manage your account settings and preferences
            </p>

            <div className="mt-6">
              <Button variant="destructive" onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
