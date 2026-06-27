import { useState, useEffect } from "react";
import { UserDoc, UsageLogDoc } from "../types";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";
import LucideIcon from "./LucideIcon";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface DashboardProps {
  user: UserDoc;
  onRefreshUser: () => void;
  onNavigateToPricing: () => void;
  onBackToTools: () => void;
}

export default function Dashboard({
  user,
  onRefreshUser,
  onNavigateToPricing,
  onBackToTools,
}: DashboardProps) {
  const [logs, setLogs] = useState<UsageLogDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const logsRef = collection(db, "users", user.uid, "usageLogs");
        const q = query(logsRef, orderBy("timestamp", "desc"), limit(50));
        const snap = await getDocs(q);
        const fetchedLogs: UsageLogDoc[] = [];
        snap.forEach((doc) => {
          fetchedLogs.push(doc.data() as UsageLogDoc);
        });
        setLogs(fetchedLogs);
      } catch (e) {
        console.error("Failed to load usage logs", e);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, [user.uid]);

  // Aggregate stats for chart: Usage counts per Tool Type
  const chartData = [
    { name: "Merge", count: logs.filter((l) => l.toolType === "merge").length },
    { name: "Split", count: logs.filter((l) => l.toolType === "split").length },
    { name: "Compress", count: logs.filter((l) => l.toolType === "compress").length },
    { name: "ImgToPDF", count: logs.filter((l) => l.toolType === "img-to-pdf").length },
    { name: "PDFToImg", count: logs.filter((l) => l.toolType === "pdf-to-img").length },
    { name: "Convert", count: logs.filter((l) => l.toolType === "convert-img").length },
    { name: "WordToPDF", count: logs.filter((l) => l.toolType === "word-to-pdf").length },
    { name: "PDFToWord", count: logs.filter((l) => l.toolType === "pdf-to-word").length },
  ];

  const totalProcessed = logs.length;
  const totalSizeKB = logs.reduce((acc, curr) => acc + curr.fileSize, 0) / 1024;
  const totalSizeMB = (totalSizeKB / 1024).toFixed(2);

  return (
    <div id="saas-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-16 space-y-10">
      
      {/* Header and Back navigation button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
            Personal SaaS Analytics
          </span>
          <h1 className="font-sans font-bold text-2xl text-slate-900 mt-2.5">
            Welcome Back, {user.displayName || user.email}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor your document bandwidth, processing history, and subscription access status.
          </p>
        </div>

        <button
          onClick={onBackToTools}
          className="inline-flex items-center space-x-1.5 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer active:scale-95 shadow-sm self-start"
        >
          <LucideIcon name="Layers" size={14} />
          <span>Launch PDF Tools</span>
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Subscription status */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center space-x-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
            <LucideIcon name="CreditCard" size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Account Tier</span>
            <p className="font-sans font-bold text-base text-slate-800 capitalize mt-0.5 flex items-center gap-1.5">
              {user.subscriptionStatus} Plan
              {user.subscriptionStatus === "pro" && (
                <LucideIcon name="Sparkles" size={13} className="text-amber-500" />
              )}
            </p>
            {user.subscriptionStatus === "free" ? (
              <button
                onClick={onNavigateToPricing}
                className="text-[10px] font-semibold text-indigo-600 hover:underline mt-1 block"
              >
                Upgrade for unlimited operations
              </button>
            ) : (
              <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <LucideIcon name="Check" size={10} /> Active & Unlimited
              </p>
            )}
          </div>
        </div>

        {/* Card 2: Free Uses left today */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center space-x-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-bold shrink-0">
            <LucideIcon name="Activity" size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Daily Limit Tracker</span>
            <p className="font-sans font-bold text-base text-slate-800 mt-0.5">
              {user.subscriptionStatus === "pro" || user.subscriptionStatus === "admin"
                ? "Infinite Uses"
                : `${Math.max(0, 3 - user.freeUsesToday)} remaining`}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Resets daily at midnight local</p>
          </div>
        </div>

        {/* Card 3: Total processed documents */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center space-x-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold shrink-0">
            <LucideIcon name="Layers" size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Processed Files</span>
            <p className="font-sans font-bold text-base text-slate-800 mt-0.5">
              {totalProcessed} conversions
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Cumulative SaaS interactions</p>
          </div>
        </div>

        {/* Card 4: Bandwidth processed */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center space-x-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 font-bold shrink-0">
            <LucideIcon name="Download" size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Bandwidth Usage</span>
            <p className="font-sans font-bold text-base text-slate-800 mt-0.5">
              {totalSizeMB} MB
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Browser download payload</p>
          </div>
        </div>
      </div>

      {/* Analytical charts and list logs side layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recharts Usage patterns chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-sans font-bold text-slate-900 text-sm">Convert Activity Patterns</h3>
            <p className="text-[11px] text-slate-400">Total processed files broken down by specific toolkit.</p>
          </div>

          <div className="w-full h-64 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    background: "#0f172a",
                    border: "none",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontSize: "11px",
                  }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plan status & Quick billing settings */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-sans font-bold text-slate-900 text-sm pb-2 border-b border-slate-200">
              Subscription Status
            </h3>

            <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                <LucideIcon name="CreditCard" size={18} />
              </div>
              <div>
                <p className="font-sans font-bold text-xs text-slate-800 uppercase tracking-wide">
                  {user.subscriptionStatus === "free" ? "Free Tier Account" : "Premium Pro License"}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {user.subscriptionStatus === "free" ? "Limited capabilities" : "Unlimited browser assets"}
                </p>
              </div>
            </div>

            <ul className="space-y-3.5 text-xs text-slate-600 pt-2">
              <li className="flex items-center justify-between">
                <span className="text-slate-400">Monthly Cost:</span>
                <span className="font-semibold text-slate-800">{user.subscriptionStatus === "pro" ? "$12.99" : "$0.00"}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-400">Current Period End:</span>
                <span className="font-semibold text-slate-700">
                  {user.currentPeriodEnd
                    ? new Date(user.currentPeriodEnd).toLocaleDateString()
                    : "Never"}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-400">Payment Gateway:</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <LucideIcon name="Lock" size={11} /> Sandbox Auth
                </span>
              </li>
            </ul>
          </div>

          <div className="pt-6 border-t border-slate-100">
            {user.subscriptionStatus === "free" ? (
              <button
                onClick={onNavigateToPricing}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg text-center shadow-sm transition-all cursor-pointer"
              >
                Upgrade Account Plan
              </button>
            ) : (
              <button
                onClick={onNavigateToPricing}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg text-center transition-all cursor-pointer"
              >
                Manage subscription details
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Detail history logs table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-sans font-bold text-slate-900 text-sm">Detailed Conversions History</h3>
          <p className="text-[11px] text-slate-400">Full audit log of active conversions processed under this user account.</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <LucideIcon name="Loader2" className="animate-spin text-indigo-600 mx-auto" size={24} />
            <span className="text-xs text-slate-400 block mt-2 font-medium">Reading past conversion trails...</span>
          </div>
        ) : logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">File Name</th>
                  <th className="py-3 px-4">Tool Used</th>
                  <th className="py-3 px-4">File Size</th>
                  <th className="py-3 px-4">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="text-slate-700 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800 max-w-xs truncate" title={log.fileName}>
                      {log.fileName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold capitalize border border-indigo-100">
                        {log.toolType.replace("-", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {(log.fileSize / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <LucideIcon name="FileText" className="mx-auto text-slate-300 mb-3" size={32} />
            <h4 className="font-bold text-slate-700 text-xs">No conversions run yet</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Select a tool and start processing files natively.</p>
          </div>
        )}
      </div>

    </div>
  );
}
