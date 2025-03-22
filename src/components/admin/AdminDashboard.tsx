
import { useState } from "react";
import { UserList } from "./UserList";
import { UserFormMonitor } from "./UserFormMonitor";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

export function AdminDashboard() {
  const { userDetails } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  if (userDetails?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-230px)]">
        <div className="lg:col-span-1">
          <UserList onSelectUser={(userId) => setSelectedUserId(userId)} />
        </div>
        <div className="lg:col-span-2">
          {selectedUserId ? (
            <UserFormMonitor userId={selectedUserId} />
          ) : (
            <div className="h-full flex items-center justify-center glass-card rounded-xl">
              <div className="text-center p-8">
                <h2 className="text-xl font-semibold mb-2">User Monitoring</h2>
                <p className="text-muted-foreground">
                  Select a user from the list to monitor their form activity in real-time.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
