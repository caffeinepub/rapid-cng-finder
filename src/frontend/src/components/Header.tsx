import { Button } from "@/components/ui/button";
import { ChevronLeft, Fuel, LogIn, LogOut, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsCallerAdmin } from "../hooks/useQueries";

interface HeaderProps {
  currentView: "search" | "admin";
  onAdminClick: () => void;
  onLogoClick: () => void;
}

export default function Header({
  currentView,
  onAdminClick,
  onLogoClick,
}: HeaderProps) {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const isLoggedIn = !!identity;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <motion.button
            onClick={onLogoClick}
            className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <Fuel className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-bold text-lg text-foreground leading-tight tracking-tight">
                Rapid CNG Finder
              </span>
              <span className="block text-xs text-muted-foreground font-body leading-tight">
                Find stations near you
              </span>
            </div>
            <span className="sm:hidden font-display font-bold text-base text-foreground">
              Rapid CNG
            </span>
          </motion.button>

          {/* Nav Actions */}
          <div className="flex items-center gap-2">
            {/* Admin breadcrumb */}
            {currentView === "admin" && isLoggedIn && (
              <button
                type="button"
                onClick={onLogoClick}
                className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors font-body mr-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Search
              </button>
            )}

            {/* Admin Dashboard button (only for logged-in admins) */}
            {isLoggedIn && isAdmin && currentView === "search" && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAdminClick}
                className="hidden sm:flex items-center gap-1.5 font-body text-sm border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin
              </Button>
            )}

            {/* Login / Logout */}
            {!isLoggedIn ? (
              <Button
                variant="default"
                size="sm"
                onClick={login}
                disabled={isLoggingIn}
                data-ocid="header.login_button"
                className="flex items-center gap-1.5 font-body text-sm"
              >
                {isLoggingIn ? (
                  <span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogIn className="w-3.5 h-3.5" />
                )}
                {isLoggingIn ? "Signing in…" : "Login"}
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                {isAdmin && currentView === "search" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAdminClick}
                    className="sm:hidden flex items-center gap-1.5 font-body text-sm border-primary/30 hover:bg-primary hover:text-primary-foreground"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Admin
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clear}
                  data-ocid="header.logout_button"
                  className="flex items-center gap-1.5 font-body text-sm text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
