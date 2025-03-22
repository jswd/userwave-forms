import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/lib/socket";
import { supabase } from "@/lib/supabase";
import { Form } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, FormInput, User2 } from "lucide-react";

interface UserFormData extends Form {
  fieldUpdates?: Record<string, string>;
}

interface UserDetails {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

export function UserFormMonitor({ userId }: { userId: string }) {
  const { userDetails: adminDetails } = useAuth();
  const [userData, setUserData] = useState<UserDetails | null>(null);
  const [formData, setFormData] = useState<UserFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("live-changes");
  const { socket, on } = useSocket(adminDetails?.id, adminDetails?.role);

  const loadUserAndFormData = async () => {
    try {
      setLoading(true);
      // Fetch user details
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, email, full_name, avatar_url")
        .eq("id", userId)
        .single();

      if (userError) throw userError;
      
      setUserData(userData);

      // Fetch saved form data
      const { data: formData, error: formError } = await supabase
        .from("forms")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (formError && formError.code !== "PGRST116") {
        throw formError;
      }

      if (formData) {
        setFormData({
          ...formData,
          fieldUpdates: {},
        });
      } else {
        setFormData({
          id: "",
          user_id: userId,
          fieldUpdates: {},
        } as UserFormData);
      }
    } catch (error) {
      console.error("Error loading user or form data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadUserAndFormData();
    }
  }, [userId]);

  useEffect(() => {
    if (!socket || !userId) return;

    // Listen for typing updates
    const handleTypingStart = (data: { userId: string; field: string; value: string }) => {
      if (data.userId === userId) {
        setFormData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            fieldUpdates: {
              ...prev.fieldUpdates,
              [data.field]: data.value,
            },
          };
        });
      }
    };

    const handleTypingUpdate = (data: { userId: string; field: string; value: string }) => {
      if (data.userId === userId) {
        setFormData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            fieldUpdates: {
              ...prev.fieldUpdates,
              [data.field]: data.value,
            },
          };
        });
      }
    };

    const handleTypingEnd = (data: { userId: string; field: string }) => {
      if (data.userId === userId) {
        setFormData((prev) => {
          if (!prev || !prev.fieldUpdates) return prev;
          
          // Keep the last value but mark it as no longer actively typing
          const updatedFieldUpdates = { ...prev.fieldUpdates };
          
          return {
            ...prev,
            fieldUpdates: updatedFieldUpdates,
          };
        });
      }
    };

    const handleFormSaved = async (data: { userId: string }) => {
      if (data.userId === userId) {
        // Refresh form data when user saves their form
        await loadUserAndFormData();
      }
    };

    const unsubscribeTypingStart = on("typing:start", handleTypingStart);
    const unsubscribeTypingUpdate = on("typing:update", handleTypingUpdate);
    const unsubscribeTypingEnd = on("typing:end", handleTypingEnd);
    const unsubscribeFormSaved = on("form:saved", handleFormSaved);

    // Request current form state
    socket.emit("admin:requestUserFormState", { userId });

    return () => {
      unsubscribeTypingStart();
      unsubscribeTypingUpdate();
      unsubscribeTypingEnd();
      unsubscribeFormSaved();
    };
  }, [userId, socket, on]);

  // Check if field has live update
  const hasLiveUpdate = (fieldName: string): boolean => {
    return !!(formData?.fieldUpdates && fieldName in formData.fieldUpdates);
  };

  // Get field value considering live updates
  const getFieldValue = (fieldName: string): string => {
    if (formData?.fieldUpdates && fieldName in formData.fieldUpdates) {
      return formData.fieldUpdates[fieldName] || "";
    }
    return formData?.[fieldName as keyof UserFormData] as string || "";
  };

  const renderFormField = (label: string, fieldName: string) => {
    const value = getFieldValue(fieldName);
    const isUpdating = hasLiveUpdate(fieldName);

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-muted-foreground">
          {label}
        </label>
        <div 
          className={`mt-1 p-2 rounded-md border ${
            isUpdating 
              ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 animate-pulse" 
              : "bg-white/50 dark:bg-black/20 border-white/30 dark:border-white/10"
          }`}
        >
          {value || "-"}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="h-full flex justify-center items-center glass-card">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </Card>
    );
  }

  if (!userData) {
    return (
      <Card className="h-full flex justify-center items-center glass-card">
        <div className="text-center p-6">
          <p className="text-muted-foreground">User not found</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col glass-card">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <User2 className="h-5 w-5" />
              {userData.full_name || userData.email.split("@")[0]}
            </CardTitle>
            <CardDescription>{userData.email}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
        <div className="px-6">
          <TabsList className="w-full">
            <TabsTrigger value="live-changes" className="flex-1">
              Live Changes
            </TabsTrigger>
            <TabsTrigger value="saved-data" className="flex-1">
              Saved Data
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="live-changes" className="flex-grow m-0 overflow-auto">
          <CardContent className="p-6 pt-4">
            <ScrollArea className="h-[calc(100vh-320px)] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                  {renderFormField("First Name", "first_name")}
                  {renderFormField("Last Name", "last_name")}
                  {renderFormField("Email", "email")}
                  {renderFormField("Phone", "phone")}
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Address</h3>
                  {renderFormField("Address", "address")}
                  {renderFormField("City", "city")}
                  {renderFormField("State", "state")}
                  {renderFormField("ZIP Code", "zip")}
                  {renderFormField("Country", "country")}
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Professional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderFormField("Company", "company")}
                  {renderFormField("Position", "position")}
                  {renderFormField("Department", "department")}
                  {renderFormField("Start Date", "start_date")}
                  {renderFormField("Salary", "salary")}
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Skills & Education</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderFormField("Education", "education")}
                  {renderFormField("Skills", "skills")}
                  {renderFormField("Languages", "languages")}
                  {renderFormField("Certifications", "certifications")}
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Biography & Social</h3>
                {renderFormField("Bio", "bio")}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {renderFormField("Website", "website")}
                  {renderFormField("LinkedIn", "linkedin")}
                  {renderFormField("Twitter", "twitter")}
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </TabsContent>
        <TabsContent value="saved-data" className="flex-grow m-0 overflow-auto">
          <CardContent className="p-6 pt-4">
            <ScrollArea className="h-[calc(100vh-320px)] pr-4">
              {!formData || Object.keys(formData).filter(key => 
                key !== 'id' && 
                key !== 'user_id' && 
                key !== 'fieldUpdates' && 
                key !== 'created_at' && 
                key !== 'updated_at' && 
                formData[key as keyof Form] !== null
              ).length === 0 ? (
                <div className="text-center py-12">
                  <FormInput className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">No saved form data yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    The user has not saved any form data yet.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                      {renderFormField("First Name", "first_name")}
                      {renderFormField("Last Name", "last_name")}
                      {renderFormField("Email", "email")}
                      {renderFormField("Phone", "phone")}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-4">Address</h3>
                      {renderFormField("Address", "address")}
                      {renderFormField("City", "city")}
                      {renderFormField("State", "state")}
                      {renderFormField("ZIP Code", "zip")}
                      {renderFormField("Country", "country")}
                    </div>
                  </div>
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4">Professional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {renderFormField("Company", "company")}
                      {renderFormField("Position", "position")}
                      {renderFormField("Department", "department")}
                      {renderFormField("Start Date", "start_date")}
                      {renderFormField("Salary", "salary")}
                    </div>
                  </div>
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4">Skills & Education</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {renderFormField("Education", "education")}
                      {renderFormField("Skills", "skills")}
                      {renderFormField("Languages", "languages")}
                      {renderFormField("Certifications", "certifications")}
                    </div>
                  </div>
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4">Biography & Social</h3>
                    {renderFormField("Bio", "bio")}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {renderFormField("Website", "website")}
                      {renderFormField("LinkedIn", "linkedin")}
                      {renderFormField("Twitter", "twitter")}
                    </div>
                  </div>
                </>
              )}
            </ScrollArea>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
