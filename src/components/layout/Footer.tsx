
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="w-full border-t py-6 bg-background/80 backdrop-blur-sm mt-auto">
      <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
        <p className="text-center text-sm leading-loose text-muted-foreground">
          ©{new Date().getFullYear()} Monitoring System. All rights reserved.
        </p>
        <div className="flex gap-4">
          <Link
            to="/terms"
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Terms
          </Link>
          <Link
            to="/privacy"
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
