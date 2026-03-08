import { Button } from "@/components/ui/button";
import { Download, Share, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "cng-install-prompt-dismissed";

function isIOS() {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream
  );
}

function isInStandaloneMode() {
  return (
    ("standalone" in window.navigator &&
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true) ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIOS, setShowIOS] = useState(false);

  useEffect(() => {
    // Don't show if already installed or previously dismissed
    if (isInStandaloneMode()) return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    if (isIOS()) {
      // Small delay so user has time to see the page first
      const timer = setTimeout(() => setShowIOS(true), 3000);
      return () => clearTimeout(timer);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowAndroid(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setShowAndroid(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setShowAndroid(false);
    setShowIOS(false);
  };

  return (
    <AnimatePresence>
      {showAndroid && (
        <motion.div
          key="android-prompt"
          data-ocid="install_prompt.panel"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4"
        >
          <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-2xl border border-green-100 overflow-hidden">
            <div className="flex items-center gap-3 p-4">
              <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0">
                <img
                  src="/assets/generated/cng-icon-192.dim_192x192.png"
                  alt="CNG Finder"
                  className="w-10 h-10 rounded-lg object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm leading-tight">
                  Install Rapid CNG Finder
                </p>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                  Add to your home screen for quick access to CNG stations
                </p>
              </div>
              <button
                type="button"
                data-ocid="install_prompt.cancel_button"
                onClick={handleDismiss}
                className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
                aria-label="Dismiss install prompt"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="px-4 pb-4">
              <Button
                data-ocid="install_prompt.button"
                onClick={handleInstall}
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 text-sm font-medium gap-2"
              >
                <Download className="w-4 h-4" />
                Install App
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {showIOS && (
        <motion.div
          key="ios-prompt"
          data-ocid="install_prompt.panel"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4"
        >
          <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-2xl border border-green-100 overflow-hidden">
            <div className="flex items-start gap-3 p-4">
              <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <img
                  src="/assets/generated/cng-icon-192.dim_192x192.png"
                  alt="CNG Finder"
                  className="w-10 h-10 rounded-lg object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm leading-tight">
                  Install Rapid CNG Finder
                </p>
                <div className="mt-1.5 flex items-start gap-1.5 text-xs text-gray-600 leading-snug">
                  <span className="mt-0.5 flex-shrink-0">Tap</span>
                  <span className="inline-flex items-center gap-0.5 bg-gray-100 rounded px-1.5 py-0.5 font-medium flex-shrink-0">
                    <Share className="w-3 h-3" />
                    Share
                  </span>
                  <span className="mt-0.5 flex-shrink-0">then</span>
                  <span className="font-semibold text-green-700 flex-shrink-0 mt-0.5">
                    Add to Home Screen
                  </span>
                </div>
              </div>
              <button
                type="button"
                data-ocid="install_prompt.cancel_button"
                onClick={handleDismiss}
                className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
                aria-label="Dismiss install prompt"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {/* iOS arrow pointing down toward Safari toolbar */}
            <div className="flex justify-center pb-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <div className="w-1 h-1 rounded-full bg-gray-300" />
                <div className="w-1 h-1 rounded-full bg-gray-300" />
                <div className="w-1 h-1 rounded-full bg-green-500" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
