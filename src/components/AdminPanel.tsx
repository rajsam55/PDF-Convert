import { useState, useEffect } from "react";
import { UserDoc, TxDoc } from "../types";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";
import LucideIcon from "./LucideIcon";

interface AdminPanelProps {
  user: UserDoc;
  onRefreshUser: () => void;
  onBackToTools: () => void;
}

export default function AdminPanel({ user, onRefreshUser, onBackToTools }: AdminPanelProps) {
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [transactions, setTransactions] = useState<TxDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"users" | "transactions">("users");

  // Fetch admin databases info
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Users
      const usersSnap = await getDocs(collection(db, "users"));
      const fetchedUsers: UserDoc[] = [];
      usersSnap.forEach((doc) => {
        fetchedUsers.push(doc.data() as UserDoc);
      });
      setUsers(fetchedUsers);

      // 2. Fetch Global Transactions
      const txSnap = await getDocs(query(collection(db, "transactions"), orderBy("timestamp", "desc")));
      const fetchedTx: TxDoc[] = [];
      txSnap.forEach((doc) => {
        fetchedTx.push(doc.data() as TxDoc);
      });
      setTransactions(fetchedTx);
    } catch (e) {
      console.error("Admin permission error or fetching failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.subscriptionStatus === "admin") {
      fetchAdminData();
    }
  }, [user.subscriptionStatus]);

  // Actions: Toggle subscription role for a user
  const handleToggleStatus = async (targetUid: string, currentStatus: "free" | "pro" | "admin") => {
    let nextStatus: "free" | "pro" | "admin" = "pro";
    if (currentStatus === "free") nextStatus = "pro";
    else if (currentStatus === "pro") nextStatus = "admin";
    else if (currentStatus === "admin") nextStatus = "free";

    try {
      const userRef = doc(db, "users", targetUid);
      await updateDoc(userRef, { subscriptionStatus: nextStatus });
      
      // Update local state to show instantly
      setUsers((prev) =>
        prev.map((u) => (u.uid === targetUid ? { ...u, subscriptionStatus: nextStatus } : u))
      );
      
      if (targetUid === user.uid) {
        onRefreshUser();
      }
    } catch (e) {
      alert("Error upgrading role: " + e);
    }
  };

  // Action: Reset free daily usages for a user
  const handleResetUsage = async (targetUid: string) => {
    try {
      const userRef = doc(db, "users", targetUid);
      await updateDoc(userRef, { freeUsesToday: 0 });
      setUsers((prev) =>
        prev.map((u) => (u.uid === targetUid ? { ...u, freeUsesToday: 0 } : u))
      );
      alert("Usage counts reset successfully.");
    } catch (e) {
      alert("Reset failed: " + e);
    }
  };

  // Statistics summaries
  const totalUsersCount = users.length;
  const activeProCount = users.filter((u) => u.subscriptionStatus === "pro").length;
  const activeAdminCount = users.filter((u) => u.subscriptionStatus === "admin").length;
  const totalRevenue = transactions.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2);

  if (user.subscriptionStatus !== "admin") {
    return (
      <div className="max-w-md mx-auto py-16 mt-16 text-center space-y-4">
        <LucideIcon name="ShieldAlert" className="text-red-500 mx-auto" size={40} />
        <h2 className="font-sans font-bold text-slate-900 text-lg">Unpermitted Resource</h2>
        <p className="text-xs text-slate-500">
          Only registered SaaS administrators are allowed to access billing logs and users settings.
        </p>
        <button
          onClick={onBackToTools}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-xs cursor-pointer"
        >
          Return to Tools
        </button>
      </div>
    );
  }

  return (
    <div id="saas-admin-panel" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-16 space-y-10">
      
      {/* Header and Sync controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-lg border border-amber-100 flex items-center space-x-1 w-max">
            <LucideIcon name="ShieldAlert" size={12} />
            <span>SaaS Control Center</span>
          </span>
          <h1 className="font-sans font-bold text-2xl text-slate-900 mt-2.5">
            Administrator Console
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor SaaS registrations, transaction summaries, user access roles, and clear thresholds.
          </p>
        </div>

        <div className="flex gap-2 self-start">
          <button
            onClick={fetchAdminData}
            className="inline-flex items-center space-x-1.5 px-4.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer border border-slate-200"
          >
            <LucideIcon name="RefreshCw" size={13} />
            <span>Refresh State</span>
          </button>
          <button
            onClick={onBackToTools}
            className="inline-flex items-center space-x-1.5 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm"
          >
            <span>Conversions Workspace</span>
          </button>
        </div>
      </div>

      {/* Global SaaS Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat 1: Total Users */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center space-x-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 font-bold">
            <LucideIcon name="Users" size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total Registrations</span>
            <p className="font-sans font-bold text-lg text-slate-800 mt-0.5">{totalUsersCount} Profiles</p>
            <p className="text-[10px] text-slate-400 mt-1">Full database accounts</p>
          </div>
        </div>

        {/* Stat 2: Active Pro plans */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center space-x-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0 font-bold">
            <LucideIcon name="Sparkles" size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Active SaaS Pro Members</span>
            <p className="font-sans font-bold text-lg text-slate-800 mt-0.5">{activeProCount} Members</p>
            <p className="text-[10px] text-slate-400 mt-1">Subscribed recurring plans</p>
          </div>
        </div>

        {/* Stat 3: Total Transactions */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center space-x-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0 font-bold">
            <LucideIcon name="CreditCard" size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Gateway Transactions</span>
            <p className="font-sans font-bold text-lg text-slate-800 mt-0.5">{transactions.length} Purchases</p>
            <p className="text-[10px] text-slate-400 mt-1">Successful SaaS charges</p>
          </div>
        </div>

        {/* Stat 4: Cumulative Revenue */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center space-x-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 font-bold">
            <LucideIcon name="DollarSign" size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">SaaS Revenue (Simulated)</span>
            <p className="font-sans font-bold text-lg text-slate-800 mt-0.5">${totalRevenue}</p>
            <p className="text-[10px] text-slate-400 mt-1">Mock gross revenue</p>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-4 text-sm font-semibold cursor-pointer transition-all ${
            activeTab === "users"
              ? "border-b-2 border-indigo-600 text-slate-900"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Registered Accounts ({totalUsersCount})
        </button>
        <button
          onClick={() => setActiveTab("transactions")}
          className={`pb-4 text-sm font-semibold cursor-pointer transition-all ${
            activeTab === "transactions"
              ? "border-b-2 border-indigo-600 text-slate-900"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Global Billing Logs ({transactions.length})
        </button>
      </div>

      {/* Primary Display panels */}
      {loading ? (
        <div className="text-center py-16">
          <LucideIcon name="Loader2" className="animate-spin text-indigo-600 mx-auto" size={30} />
          <span className="text-xs text-slate-400 block mt-3">Syncing SaaS database logs...</span>
        </div>
      ) : activeTab === "users" ? (
        /* Users Database Table */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase text-[9px] tracking-wider">
                  <th className="py-4 px-6">User Email</th>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Access Tier</th>
                  <th className="py-4 px-6">Free Uses Used Today</th>
                  <th className="py-4 px-6 text-center">Admin Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.uid} className="text-slate-700 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-950">{u.email}</td>
                    <td className="py-4 px-6 text-slate-500">{u.displayName || "No Name Specified"}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          u.subscriptionStatus === "admin"
                            ? "bg-amber-50 text-amber-700 border border-amber-100"
                            : u.subscriptionStatus === "pro"
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-150"
                            : "bg-slate-50 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {u.subscriptionStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-500 text-center">{u.freeUsesToday} of 3</td>
                    <td className="py-4 px-6 text-center space-x-2">
                      <button
                        onClick={() => handleToggleStatus(u.uid, u.subscriptionStatus)}
                        className="px-3 py-1.5 border border-slate-200 rounded-lg hover:border-indigo-400 hover:text-indigo-600 transition-colors font-semibold cursor-pointer"
                        title="Toggle status role tier: Free -> Pro -> Admin"
                      >
                        Toggle Tier
                      </button>
                      <button
                        onClick={() => handleResetUsage(u.uid)}
                        className="px-3 py-1.5 border border-slate-200 rounded-lg hover:border-amber-400 hover:text-amber-700 transition-colors font-semibold cursor-pointer"
                        title="Reset daily usage counter back to 0"
                      >
                        Reset Limit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Transactions Database Table */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase text-[9px] tracking-wider">
                    <th className="py-4 px-6">Transaction ID</th>
                    <th className="py-4 px-6">Billing Email</th>
                    <th className="py-4 px-6">Product / Plan</th>
                    <th className="py-4 px-6">Amount Charged</th>
                    <th className="py-4 px-6">Payment Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-mono font-semibold text-slate-500">{tx.id}</td>
                      <td className="py-4 px-6 font-semibold text-slate-950">{tx.userEmail}</td>
                      <td className="py-4 px-6 text-slate-600">{tx.plan}</td>
                      <td className="py-4 px-6 font-bold text-emerald-600">${tx.amount.toFixed(2)}</td>
                      <td className="py-4 px-6 text-slate-400">{new Date(tx.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <LucideIcon name="CreditCard" className="mx-auto text-slate-300 mb-3" size={32} />
              <h4 className="font-semibold text-slate-700 text-xs">No billing events captured yet</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">As users upgrade to the Pro plan, sandbox transactions will stream here.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
