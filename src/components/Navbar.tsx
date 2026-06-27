import { useState, useEffect } from "react";
import LucideIcon from "./LucideIcon";
import { UserDoc } from "../types";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

interface NavbarProps {
  user: UserDoc | null;
  onNavigate: (screen: "home" | "dashboard" | "admin" | "pricing") => void;
  activeScreen: string;
  onOpenAuth: () => void;
  freeUsesToday: number;
}

export default function Navbar({
  user,
  onNavigate,
  activeScreen,
  onOpenAuth,
  freeUsesToday,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Let app refresh itself via auth state listener
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const getUsageText = () => {
    if (!user) {
      // Guest local storage fallback display
      const guestData = localStorage.getItem("docucraft_guest_usage");
      let count = 0;
      if (guestData) {
        try {
          const parsed = JSON.parse(guestData);
          if (parsed.date === new Date().toISOString().split("T")[0]) {
            count = parsed.count;
          }
        } catch {}
      }
      return `${Math.max(0, 3 - count)} free uses left`;
    }
    if (user.subscriptionStatus === "pro" || user.subscriptionStatus === "admin") {
      return "Pro Plan";
    }
    return `${Math.max(0, 3 - freeUsesToday)} free uses left`;
  };

  return (
    <header
      id="main-nav-header"
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          id="brand-logo-container"
          className="flex items-center space-x-2 cursor-pointer group"
          onClick={() => onNavigate("home")}
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white transition-all group-hover:bg-indigo-700">
            <span className="font-bold text-sm text-white">P</span>
          </div>
          <div>
            <span className="font-sans font-bold text-lg tracking-tight text-slate-800">
              DOCUCRAFT<span className="text-indigo-600">.io</span>
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav id="navbar-links" className="hidden md:flex items-center space-x-8">
          <button
            onClick={() => onNavigate("home")}
            className={`font-sans font-medium text-sm transition-colors cursor-pointer ${
              activeScreen === "home"
                ? "text-indigo-600 font-semibold"
                : "text-slate-600 hover:text-indigo-600"
            }`}
          >
            All Tools
          </button>
          <button
            onClick={() => onNavigate("pricing")}
            className={`font-sans font-medium text-sm transition-colors cursor-pointer ${
              activeScreen === "pricing"
                ? "text-indigo-600 font-semibold"
                : "text-slate-600 hover:text-indigo-600"
            }`}
          >
            Pricing & Plans
          </button>
          {user && (
            <button
              onClick={() => onNavigate("dashboard")}
              className={`font-sans font-medium text-sm transition-colors cursor-pointer ${
                activeScreen === "dashboard"
                  ? "text-indigo-600 font-semibold"
                  : "text-slate-600 hover:text-indigo-600"
              }`}
            >
              My Dashboard
            </button>
          )}
          {user?.subscriptionStatus === "admin" && (
            <button
              onClick={() => onNavigate("admin")}
              className={`flex items-center space-x-1.5 font-sans font-medium text-sm text-amber-600 hover:text-amber-700 transition-colors cursor-pointer ${
                activeScreen === "admin" ? "underline decoration-2 underline-offset-4" : ""
              }`}
            >
              <LucideIcon name="ShieldAlert" size={15} />
              <span>Admin Panel</span>
            </button>
          )}
        </nav>

        {/* Right Action Side */}
        <div id="navbar-right-actions" className="flex items-center space-x-4">
          {/* Daily Usage indicator */}
          <div className="hidden sm:flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 border border-indigo-100 text-indigo-700">
            <LucideIcon name="Activity" size={13} className="mr-1.5 text-indigo-500" />
            <span>{getUsageText()}</span>
          </div>

          {user ? (
            <div className="flex items-center space-x-3">
              {/* Profile Shortcut */}
              <button
                onClick={() => onNavigate("dashboard")}
                className="flex items-center space-x-2 focus:outline-none cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-xs transition-transform group-hover:scale-105">
                  {user.displayName ? user.displayName.slice(0, 2).toUpperCase() : "U"}
                </div>
                <span className="hidden lg:inline text-xs font-medium text-slate-700 hover:text-slate-900">
                  {user.displayName || user.email}
                </span>
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <LucideIcon name="LogOut" size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white font-sans font-semibold text-sm shadow-sm hover:bg-indigo-700 transition-all active:scale-95 cursor-pointer"
            >
              <LucideIcon name="User" size={15} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
