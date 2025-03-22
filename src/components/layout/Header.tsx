
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "react-router-dom";
import { LogOut, Menu, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export function Header() {
  const { user, userDetails, signOut } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const userInitials = userDetails?.fullName
    ? userDetails.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : userDetails?.email?.charAt(0).toUpperCase() || "U";

  const isAdmin = userDetails?.role === "admin";
  const isAuthenticated = !!user;

  const renderAuthButtons = () => {
    if (isAuthenticated) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={userDetails?.avatarUrl || ""}
                  alt={userDetails?.fullName || ""}
                />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={isAdmin ? "/admin/profile" : "/profile"} className="cursor-pointer flex w-full items-center">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => signOut()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" className="hidden sm:flex">
          <Link to="/login">Login</Link>
        </Button>
        <Button asChild className="hidden sm:flex">
          <Link to="/register">Register</Link>
        </Button>
      </div>
    );
  };

  const renderMobileNav = () => {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Toggle mobile navigation"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] sm:w-[350px]">
          <div className="flex flex-col gap-6 mt-8">
            <Link
              to="/"
              className="text-2xl font-semibold text-primary"
              onClick={() => setOpen(false)}
            >
              Monitoring System
            </Link>
            <div className="flex flex-col gap-2">
              {!isAuthenticated && (
                <>
                  <Button asChild variant="outline" onClick={() => setOpen(false)}>
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild onClick={() => setOpen(false)}>
                    <Link to="/register">Register</Link>
                  </Button>
                </>
              )}
              {isAuthenticated && (
                <>
                  <Button
                    asChild
                    variant={
                      location.pathname === (isAdmin ? "/admin" : "/dashboard")
                        ? "default"
                        : "ghost"
                    }
                    onClick={() => setOpen(false)}
                  >
                    <Link to={isAdmin ? "/admin" : "/dashboard"}>
                      Dashboard
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant={
                      location.pathname === (isAdmin ? "/admin/profile" : "/profile")
                        ? "default"
                        : "ghost"
                    }
                    onClick={() => setOpen(false)}
                  >
                    <Link to={isAdmin ? "/admin/profile" : "/profile"}>
                      Profile
                    </Link>
                  </Button>
                  {!isAdmin && (
                    <Button
                      asChild
                      variant={
                        location.pathname === "/form" ? "default" : "ghost"
                      }
                      onClick={() => setOpen(false)}
                    >
                      <Link to="/form">My Form</Link>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      signOut();
                      setOpen(false);
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Button>
                </>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          {renderMobileNav()}
          <Link to="/" className="text-xl font-semibold flex items-center">
            Monitoring System
          </Link>
        </div>
        <nav className="hidden md:flex gap-4 items-center">
          {isAuthenticated && (
            <>
              <Button asChild variant="ghost">
                <Link
                  to={isAdmin ? "/admin" : "/dashboard"}
                  className={
                    location.pathname === (isAdmin ? "/admin" : "/dashboard")
                      ? "text-primary font-medium"
                      : ""
                  }
                >
                  Dashboard
                </Link>
              </Button>
              {!isAdmin && (
                <Button asChild variant="ghost">
                  <Link
                    to="/form"
                    className={
                      location.pathname === "/form"
                        ? "text-primary font-medium"
                        : ""
                    }
                  >
                    My Form
                  </Link>
                </Button>
              )}
            </>
          )}
        </nav>
        {renderAuthButtons()}
      </div>
    </header>
  );
}
