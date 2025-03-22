
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/lib/socket";
import { User } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserCog, Search, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type UserStatus = {
  userId: string;
  status: "online" | "offline" | "typing";
  typingField?: string;
};

interface EnhancedUser extends User {
  status: "online" | "offline" | "typing";
  typingField?: string;
}

export function UserList({ onSelectUser }: { onSelectUser: (userId: string) => void }) {
  const { userDetails } = useAuth();
  const [users, setUsers] = useState<EnhancedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { socket, on, isConnected } = useSocket(userDetails?.id, userDetails?.role);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("role", "user");

        if (error) throw error;

        if (data) {
          // Initialize all users as offline
          const usersWithStatus = data.map((user) => ({
            ...user,
            status: "offline" as const,
          }));
          setUsers(usersWithStatus);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  // Listen for user status updates
  useEffect(() => {
    if (!socket) return;

    const handleUserStatus = (statusData: UserStatus) => {
      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          if (user.id === statusData.userId) {
            return {
              ...user,
              status: statusData.status,
              typingField: statusData.typingField,
            };
          }
          return user;
        })
      );
    };

    const handleUserLogin = (data: { userId: string }) => {
      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          if (user.id === data.userId) {
            return {
              ...user,
              status: "online" as const,
            };
          }
          return user;
        })
      );
    };

    const unsubscribeUserStatus = on("user:status", handleUserStatus);
    const unsubscribeTypingStart = on("typing:start", (data) => {
      handleUserStatus({ 
        userId: data.userId, 
        status: "typing", 
        typingField: data.field 
      });
    });
    const unsubscribeTypingEnd = on("typing:end", (data) => {
      handleUserStatus({ 
        userId: data.userId, 
        status: "online" 
      });
    });
    const unsubscribeUserLogin = on("user:login", handleUserLogin);

    // Request current status of all users when connecting
    if (isConnected) {
      socket.emit("admin:requestAllUserStatus");
    }

    return () => {
      unsubscribeUserStatus();
      unsubscribeTypingStart();
      unsubscribeTypingEnd();
      unsubscribeUserLogin();
    };
  }, [socket, on, isConnected]);

  // Filter users based on search query
  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchLower))
    );
  });

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    onSelectUser(userId);
  };

  const getStatusIndicatorClass = (status: string) => {
    switch (status) {
      case "online":
        return "status-indicator status-online";
      case "typing":
        return "status-indicator status-typing";
      default:
        return "status-indicator status-offline";
    }
  };

  const getUserInitials = (user: EnhancedUser) => {
    if (user.full_name) {
      return user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }
    return user.email.charAt(0).toUpperCase();
  };

  const formatLastSignIn = (lastSignIn: string | null) => {
    if (!lastSignIn) return "Never";
    return new Date(lastSignIn).toLocaleString();
  };

  return (
    <Card className="h-full flex flex-col glass-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <UserCog className="h-5 w-5" />
          User Management
        </CardTitle>
        <CardDescription>
          Manage and monitor user activities
        </CardDescription>
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users by name or email..."
            className="pl-8 bg-white/50 dark:bg-black/20 border-white/30 dark:border-white/10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-9 w-9"
              onClick={() => setSearchQuery("")}
            >
              <XCircle className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-grow overflow-auto">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            {searchQuery ? "No users match your search" : "No users found"}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className={`flex items-center gap-3 p-3 rounded-md transition-colors ${
                  selectedUserId === user.id
                    ? "bg-primary/10 dark:bg-primary/20"
                    : "hover:bg-secondary/50 dark:hover:bg-secondary/30"
                } cursor-pointer`}
                onClick={() => handleSelectUser(user.id)}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10 border border-white/20">
                    <AvatarImage src={user.avatar_url || ""} alt={user.full_name || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getUserInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-0.5 -right-0.5 ${getStatusIndicatorClass(user.status)}`} />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">
                      {user.full_name || user.email.split("@")[0]}
                    </span>
                    {user.status === "typing" && (
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-200 text-xs">
                        Typing...
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {user.email}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground flex items-center whitespace-nowrap">
                  <Clock className="h-3 w-3 mr-1 inline" />
                  {formatLastSignIn(user.last_sign_in)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
