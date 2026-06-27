import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { UserDoc, ToolType } from "./types";
import { getOrCreateUserDoc } from "./utils/authAndUsage";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ToolsGrid from "./components/ToolsGrid";
import ToolWorkspace from "./components/ToolWorkspace";
import AuthPage from "./components/AuthPage";
import Pricing from "./components/Pricing";
import Dashboard from "./components/Dashboard";
import AdminPanel from "./components/AdminPanel";
import LucideIcon from "./components/LucideIcon";

export default function App() {
  // SaaS States
  const [activeScreen, setActiveScreen] = useState<"home" | "dashboard" | "admin" | "pricing">("home");
  const [activeToolId, setActiveToolId] = useState<ToolType | null>(null);
  
  const [user, setUser] = useState<UserDoc | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Synchronize Auth changes and user database snap
  useEffect(() => {
    let unsubscribeUserSnap: () => void = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        // Authenticated user
        try {
          const userDoc = await getOrCreateUserDoc(
            authUser.uid,
            authUser.email || "",
            authUser.displayName || ""
          );
          setUser(userDoc);

          // Listen to real-time updates for usage limits reset and status changes
          unsubscribeUserSnap = onSnapshot(doc(db, "users", authUser.uid), (snapshot) => {
            if (snapshot.exists()) {
              setUser(snapshot.data() as UserDoc);
            }
          });
        } catch (e) {
          console.error("Auth snapshot error", e);
        }
      } else {
        // Logged Out
        setUser(null);
        unsubscribeUserSnap();
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeUserSnap();
    };
  }, []);

  // Helper: manual trigger to refresh user details
  const refreshUser = () => {
    // Rely on Firestore onSnapshot listener to update user state dynamically
  };

  const handleNavigate = (screen: "home" | "dashboard" | "admin" | "pricing") => {
    setActiveScreen(screen);
    setActiveToolId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectTool = (id: ToolType) => {
    setActiveToolId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans select-none overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* SaaS Top Header */}
      <Navbar
        user={user}
        onNavigate={handleNavigate}
        activeScreen={activeScreen}
        onOpenAuth={() => setAuthOpen(true)}
        freeUsesToday={user ? user.freeUsesToday : 0}
      />

      {/* Main Container Wrapper */}
      <main className="flex-grow flex flex-col">
        {loading ? (
          /* Loading Core State */
          <div className="flex-grow flex flex-col items-center justify-center py-24 space-y-3">
            <LucideIcon name="Loader2" className="animate-spin text-indigo-600" size={32} />
            <p className="text-xs font-semibold text-slate-400">Booting DocuCraft SaaS Workspace...</p>
          </div>
        ) : activeToolId ? (
          /* ACTIVE UTILITY CONVERTING WORKSPACE */
          <div className="animate-fade-in flex-grow py-8">
            <ToolWorkspace
              toolId={activeToolId}
              user={user}
              onRefreshUser={refreshUser}
              onOpenPricing={() => handleNavigate("pricing")}
              onOpenAuth={() => setAuthOpen(true)}
              onBack={() => setActiveToolId(null)}
            />
          </div>
        ) : activeScreen === "dashboard" && user ? (
          /* USER USAGE STATISTICS AND LOGS DASHBOARD */
          <div className="animate-fade-in flex-grow">
            <Dashboard
              user={user}
              onRefreshUser={refreshUser}
              onNavigateToPricing={() => handleNavigate("pricing")}
              onBackToTools={() => handleNavigate("home")}
            />
          </div>
        ) : activeScreen === "admin" && user && user.subscriptionStatus === "admin" ? (
          /* ADMINISTRATOR PRIVILEGE SAAS CONSOLE */
          <div className="animate-fade-in flex-grow">
            <AdminPanel
              user={user}
              onRefreshUser={refreshUser}
              onBackToTools={() => handleNavigate("home")}
            />
          </div>
        ) : activeScreen === "pricing" ? (
          /* SaaS PLAN MEMBERSHIP PRICING SCALES */
          <div className="animate-fade-in flex-grow">
            <Pricing
              user={user}
              onRefreshUser={refreshUser}
              onOpenAuth={() => setAuthOpen(true)}
            />
          </div>
        ) : (
          /* ALL UTILITIES DIRECTORY AND LANDING */
          <div className="animate-fade-in flex-grow pb-16">
            
            {/* HERO PROMOTIONAL BANNER */}
            <section id="saas-hero-section" className="relative pt-24 pb-16 sm:pt-32 sm:pb-20 bg-gradient-to-b from-white via-indigo-50/20 to-transparent">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
                
                {/* Micro announcement badge */}
                <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-100 text-emerald-700 animate-float">
                  <LucideIcon name="Lock" size={13} className="text-emerald-500" />
                  <span>100% Client-Side Local Conversion Processing</span>
                </span>

                {/* Primary headliner */}
                <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight leading-none max-w-4xl mx-auto">
                  The premium workflow engine for <span className="text-indigo-600">PDFs</span> and <span className="text-violet-500">images</span>
                </h1>

                {/* Subtitle description */}
                <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
                  Merge, split, compress, or convert documents instantly with zero upload delays. Experience high-speed conversions occurring completely in your browser. All files remain private on your machine.
                </p>

                {/* Visual statistics labels */}
                <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 pt-4 text-[11px] font-semibold text-slate-400">
                  <div className="flex items-center space-x-1.5">
                    <LucideIcon name="Check" size={14} className="text-indigo-500" />
                    <span>3 Free Conversions Daily</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <LucideIcon name="Check" size={14} className="text-indigo-500" />
                    <span>Zero Uploads to Cloud Server</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <LucideIcon name="Check" size={14} className="text-indigo-500" />
                    <span>Instant Local PDF Generation</span>
                  </div>
                </div>
              </div>
            </section>

            {/* MAIN INTERACTIVE TOOLS DIRECTORY GRID */}
            <div className="border-t border-slate-100/75 bg-white/40 pt-10">
              <ToolsGrid onSelectTool={handleSelectTool} />
            </div>

          </div>
        )}
      </main>

      {/* Auth register popup screen */}
      {authOpen && (
        <AuthPage
          onClose={() => setAuthOpen(false)}
          onSuccess={() => {
            setAuthOpen(false);
            refreshUser();
          }}
        />
      )}

      {/* SaaS Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
