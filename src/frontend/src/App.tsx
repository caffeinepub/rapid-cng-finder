import { Toaster } from "@/components/ui/sonner";
import { AlertTriangle } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import AdminDashboard from "./components/AdminDashboard";
import Footer from "./components/Footer";
import Header from "./components/Header";
import InstallPrompt from "./components/InstallPrompt";
import SearchPage from "./components/SearchPage";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useIsCallerAdmin } from "./hooks/useQueries";

type View = "search" | "admin";

export default function App() {
  const [view, setView] = useState<View>("search");
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();

  const handleAdminClick = () => {
    if (identity) {
      setView("admin");
    }
  };

  const handleLogoClick = () => {
    setView("search");
  };

  const renderAdminContent = () => {
    if (!identity) return null;
    if (adminLoading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground font-body">
              Checking permissions…
            </p>
          </div>
        </div>
      );
    }
    if (!isAdmin) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center min-h-[60vh]"
        >
          <div className="text-center space-y-4 max-w-md mx-auto p-8">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Access Denied
            </h2>
            <p className="text-muted-foreground font-body">
              You don't have admin access. Please contact your administrator to
              request access.
            </p>
            <button
              type="button"
              onClick={() => setView("search")}
              className="text-primary underline underline-offset-4 font-body text-sm hover:opacity-80 transition-opacity"
            >
              ← Back to station finder
            </button>
          </div>
        </motion.div>
      );
    }
    return <AdminDashboard />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        currentView={view}
        onAdminClick={handleAdminClick}
        onLogoClick={handleLogoClick}
      />
      <main className="flex-1">
        {view === "search" && <SearchPage />}
        {view === "admin" && identity && renderAdminContent()}
        {view === "admin" && !identity && <SearchPage />}
      </main>
      <Footer />
      <Toaster position="bottom-right" richColors />
      <InstallPrompt />
    </div>
  );
}
