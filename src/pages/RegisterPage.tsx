
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { createInitialUsers } from "@/utils/createInitialUsers";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

export default function RegisterPage() {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateInitialUsers = async () => {
    try {
      setIsCreating(true);
      await createInitialUsers();
      toast({
        title: "Users Created",
        description: "Admin and client users have been created successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create initial users. See console for details.",
      });
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-230px)]">
        <RegisterForm />
        
        {/* Admin button to create initial users - would typically be hidden in production */}
        <div className="mt-8 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
          <h3 className="text-sm font-medium mb-2">Admin Tools</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCreateInitialUsers}
            disabled={isCreating}
          >
            {isCreating ? "Creating Users..." : "Create Default Users"}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Creates admin@example.com (admin123) and client@example.com (client123)
          </p>
        </div>
      </div>
    </Layout>
  );
}
