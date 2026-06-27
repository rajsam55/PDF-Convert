import React, { useState } from "react";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import LucideIcon from "./LucideIcon";
import { getOrCreateUserDoc } from "../utils/authAndUsage";

interface AuthPageProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthPage({ onClose, onSuccess }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please provide all required credentials.");
      return;
    }
    if (isSignUp && !fullName) {
      setErrorMsg("Please specify your full name.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      if (isSignUp) {
        // Register standard auth user
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, {
          displayName: fullName,
        });
        
        // Setup default UserDoc in Firestore
        await getOrCreateUserDoc(credential.user.uid, email, fullName);
      } else {
        // Sign In standard auth user
        const credential = await signInWithEmailAndPassword(auth, email, password);
        await getOrCreateUserDoc(
          credential.user.uid,
          credential.user.email || email,
          credential.user.displayName || ""
        );
      }
      onSuccess();
      onClose();
    } catch (e: any) {
      console.error(e);
      if (e.code === "auth/email-already-in-use") {
        setErrorMsg("Email address is already in use.");
      } else if (e.code === "auth/invalid-credential") {
        setErrorMsg("Invalid password or email address specified.");
      } else if (e.code === "auth/weak-password") {
        setErrorMsg("Password must contain at least 6 characters.");
      } else {
        setErrorMsg(e.message || "Authentication failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8 max-w-md w-full relative shadow-xl border border-slate-200 animate-scale-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
        >
          <LucideIcon name="X" size={16} />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-sm">
            <LucideIcon name="FileText" size={18} className="text-white" />
          </div>
          <h2 className="font-sans font-bold text-xl text-slate-900 leading-tight">
            {isSignUp ? "Create SaaS Account" : "Access DocuCraft Workspace"}
          </h2>
          <p className="text-xs text-slate-500">
            {isSignUp
              ? "Gain 3 free daily document actions immediately!"
              : "Sign in to track your usage limits and download pro assets."}
          </p>
        </div>

        {/* Error notification banner */}
        {errorMsg && (
          <div className="flex items-start space-x-2.5 p-3.5 rounded-lg bg-red-50 text-red-700 text-xs font-semibold mb-5 border border-red-200 animate-shake">
            <LucideIcon name="AlertTriangle" size={14} className="shrink-0 text-red-500 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 rounded-lg bg-indigo-600 text-white font-sans font-semibold text-xs hover:bg-indigo-700 transition-all active:scale-98 shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
          >
            {loading ? (
              <>
                <LucideIcon name="Loader2" className="animate-spin" size={14} />
                <span>Authenticating Workspace...</span>
              </>
            ) : (
              <span>{isSignUp ? "Register Account" : "Access Portal"}</span>
            )}
          </button>
        </form>

        {/* Mode Switcher */}
        <div className="text-center mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
          {isSignUp ? (
            <p>
              Already have an account?{" "}
              <button
                onClick={() => setIsSignUp(false)}
                className="text-indigo-600 font-semibold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              New to DocuCraft?{" "}
              <button
                onClick={() => setIsSignUp(true)}
                className="text-indigo-600 font-semibold hover:underline cursor-pointer"
              >
                Create Account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
