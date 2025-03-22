
import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { emitTypingStart, emitTypingUpdate, emitTypingEnd } from "@/lib/socket";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Save } from "lucide-react";
import { useSocket } from "@/lib/socket";
import debounce from "lodash.debounce";

const formSchema = z.object({
  first_name: z.string().min(2, { message: "First name is required." }),
  last_name: z.string().min(2, { message: "Last name is required." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  phone: z.string().min(5, { message: "Phone number is required." }),
  address: z.string().min(5, { message: "Address is required." }),
  city: z.string().min(2, { message: "City is required." }),
  state: z.string().min(2, { message: "State is required." }),
  zip: z.string().min(2, { message: "ZIP code is required." }),
  country: z.string().min(2, { message: "Country is required." }),
  company: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  start_date: z.string().optional(),
  salary: z.coerce.number().optional(),
  education: z.string().optional(),
  skills: z.string().optional(),
  languages: z.string().optional(),
  certifications: z.string().optional(),
  bio: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
  twitter: z.string().url().optional().or(z.literal("")),
});

export function UserForm() {
  const { userDetails } = useAuth();
  const userId = userDetails?.id || "";
  const [isSaving, setIsSaving] = useState(false);
  const [loadingForm, setLoadingForm] = useState(true);
  const { socket, emit } = useSocket(userId, userDetails?.role);
  const typingTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  // Debounce the typing update emission
  const debouncedEmitTypingUpdate = useRef(
    debounce((field: string, value: string) => {
      if (userId) {
        emitTypingUpdate(userId, field, value);
      }
    }, 200)
  ).current;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      country: "",
      company: "",
      position: "",
      department: "",
      start_date: "",
      salary: undefined,
      education: "",
      skills: "",
      languages: "",
      certifications: "",
      bio: "",
      website: "",
      linkedin: "",
      twitter: "",
    },
  });

  // Load existing form data
  useEffect(() => {
    const loadFormData = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from("forms")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        if (data) {
          // Convert null values to empty strings to avoid controlled/uncontrolled input warnings
          const formattedData = Object.keys(data).reduce<Record<string, any>>(
            (acc, key) => {
              acc[key] = data[key] === null ? "" : data[key];
              return acc;
            },
            {}
          );
          
          form.reset(formattedData);
        }
      } catch (error) {
        console.error("Error loading form data:", error);
        toast({
          variant: "destructive",
          title: "Failed to load form data",
          description: "Please try refreshing the page.",
        });
      } finally {
        setLoadingForm(false);
      }
    };

    loadFormData();
  }, [userId, form]);

  // Setup field change handlers with typing events
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name && type === "change" && userId) {
        const fieldValue = value[name as keyof typeof value];
        
        // Handle typing events
        if (typeof fieldValue === "string") {
          // Clear previous timeout for this field
          if (typingTimeouts.current[name]) {
            clearTimeout(typingTimeouts.current[name]);
          }

          // Emit typing start
          emitTypingStart(userId, name, fieldValue);
          
          // Emit typing update (debounced)
          debouncedEmitTypingUpdate(name, fieldValue);
          
          // Set timeout to emit typing end
          typingTimeouts.current[name] = setTimeout(() => {
            emitTypingEnd(userId, name);
            delete typingTimeouts.current[name];
          }, 1500);
        }
      }
    });

    // Cleanup typing timers on unmount
    return () => {
      subscription.unsubscribe();
      Object.keys(typingTimeouts.current).forEach(key => {
        clearTimeout(typingTimeouts.current[key]);
      });
    };
  }, [form, userId, debouncedEmitTypingUpdate]);

  // Emit user online status when form component mounts/unmounts
  useEffect(() => {
    if (socket && userId) {
      socket.emit("user:status", { userId, status: "online" });
      
      return () => {
        socket.emit("user:status", { userId, status: "offline" });
      };
    }
  }, [socket, userId]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!userId) return;
    
    try {
      setIsSaving(true);
      
      const formData = {
        ...values,
        user_id: userId,
        updated_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from("forms")
        .upsert(formData, { onConflict: "user_id" })
        .select();
        
      if (error) throw error;
      
      toast({
        title: "Form saved successfully",
        description: "Your information has been updated.",
      });
      
      // Emit form saved event
      socket?.emit("form:saved", { userId, formId: data?.[0]?.id });
      
    } catch (error) {
      console.error("Error saving form:", error);
      toast({
        variant: "destructive",
        title: "Failed to save form",
        description: "Please try again later.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (loadingForm) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto">
      <div className="glass-card p-8 rounded-xl">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Your Information</h2>
            <p className="text-muted-foreground">
              Please fill out all the required fields below
            </p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Personal Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your first name" 
                            className="bg-white/50 dark:bg-black/20 border-white/30 dark:border-white/10" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your last name" 
                            className="bg-white/50 dark:bg-black/20 border-white/30 dark:border-white/10" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your email" 
                            type="email" 
                            className="bg-white/50 dark:bg-black/20 border-white/30 dark:border-white/10" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your phone number" 
                            className="bg-white/50 dark:bg-black/20 border-white/30 dark:border-white/10" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Address */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Address</h3>
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your street address" 
                            className="bg-white/50 dark:bg-black/20 border-white/30 dark:border-white/10" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your city" 
                            className="bg-white/50 dark:bg-black/20 border-white/30 dark:border-white/10" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your state" 
                              className="bg-white/50 dark:bg-black/20 border-white/30 dark:border-white/10" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="zip"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your ZIP code" 
                              className="bg-white/50 dark:bg-black/20 border-white/30 dark:border-white/10" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your country" 
                            className="bg-white/50 dark:bg-black/20 border-white/30 dark:border-white/10" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Professional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your company name" 
                            className="bg-white/50 dark:bg-black/20 border-white/30 dark:border-white/10" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your position" 
                            className="bg-white/50 dark:bg-black/20 border-white/30 dark:border-white/10" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your department" 
                            className="bg-white/50 dark:bg-black/20 border-white/30 dark:border-white/10" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            className="bg-white/50 dark:bg-black/20 border-white/30 dark:border-white/10" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="salary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salary</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Enter your salary" 
                            className="bg-white/50 dark:bg-black/20 border-white/30 dark:border-white/10" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Skills & Education */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Skills & Education</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="education"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Education</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your education background" 
                            className="min-h-[100px] bg-white/50 dark:bg-black/20 border-white/30 dark:border-white/10" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skills</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="List your key skills (separated by commas)" 
                            className="min-h-[100px] bg-white/50 dark:bg-black/20 border-white/30 dark:border-white/10" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="languages"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Languages</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Languages you speak (separated by commas)" 
                            className="bg-white/50 dark:bg-black/20 border-white/30 dark:border-white/10" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="certifications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Certifications</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your professional certifications" 
                            className="bg-white/50 dark:bg-black/20 border-white/30 dark:border-white/10" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Biography & Social */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Biography & Social</h3>
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Write a short bio about yourself" 
                          className="min-h-[120px] bg-white/50 dark:bg-black/20 border-white/30 dark:border-white/10" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://yourwebsite.com" 
                            className="bg-white/50 dark:bg-black/20 border-white/30 dark:border-white/10" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://linkedin.com/in/username" 
                            className="bg-white/50 dark:bg-black/20 border-white/30 dark:border-white/10" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twitter</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://twitter.com/username" 
                            className="bg-white/50 dark:bg-black/20 border-white/30 dark:border-white/10" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full md:w-auto" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Information
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
