
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { createInitialUsers } from "@/utils/createInitialUsers";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function RegisterPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateInitialUsers = async () => {
    try {
      setIsCreating(true);
      setError(null);
      
      const result = await createInitialUsers();
      
      if (result.success) {
        toast({
          title: "Users Created",
          description: "Admin and client users have been created successfully.",
        });
      } else {
        setError(result.message);
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(errorMessage);
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
        <div className="mt-8 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900 w-full max-w-md">
          <h3 className="text-sm font-medium mb-2">Admin Tools</h3>
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle className="text-sm font-medium">Error creating users</AlertTitle>
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCreateInitialUsers}
            disabled={isCreating}
            className="w-full"
          >
            {isCreating ? "Creating Users..." : "Create Default Users"}
          </Button>
          
          <div className="flex items-start gap-2 text-xs text-muted-foreground mt-3 bg-slate-100 dark:bg-slate-800 p-2 rounded">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Default accounts:</p>
              <p>admin@example.com (admin123)</p>
              <p>client@example.com (client123)</p>
              <p className="mt-1 text-xs italic">
                If you're getting email rate limit errors, go to the Supabase dashboard and disable email confirmation in Auth settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
