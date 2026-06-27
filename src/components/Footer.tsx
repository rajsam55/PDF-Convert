import LucideIcon from "./LucideIcon";

interface FooterProps {
  onNavigate: (screen: "home" | "dashboard" | "admin" | "pricing") => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer id="saas-footer" className="bg-white text-slate-500 py-12 mt-auto border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <span className="font-bold text-xs text-white">P</span>
              </div>
              <span className="font-sans font-bold text-lg text-slate-800">DOCUCRAFT.io</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              Secure, premium, and lightning-fast client-side document utilities. All file conversions are processed 100% locally in your web browser for absolute privacy and zero server storage.
            </p>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-slate-800 font-bold text-xs uppercase tracking-widest mb-4">SaaS Platform</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => onNavigate("home")} className="hover:text-indigo-600 transition-colors cursor-pointer text-left font-medium">
                  All PDF & Image Tools
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("pricing")} className="hover:text-indigo-600 transition-colors cursor-pointer text-left font-medium">
                  Pro Pricing Plans
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("dashboard")} className="hover:text-indigo-600 transition-colors cursor-pointer text-left font-medium">
                  User Usage Logs
                </button>
              </li>
            </ul>
          </div>

          {/* Security Column */}
          <div>
            <h4 className="text-slate-800 font-bold text-xs uppercase tracking-widest mb-4">Enterprise Trust</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li className="flex items-center space-x-2">
                <LucideIcon name="Lock" size={12} className="text-emerald-500" />
                <span>Zero File Uploads to Server</span>
              </li>
              <li className="flex items-center space-x-2">
                <LucideIcon name="ShieldAlert" size={12} className="text-indigo-500" />
                <span>Fully Secure Sandbox</span>
              </li>
              <li className="flex items-center space-x-2">
                <LucideIcon name="Zap" size={12} className="text-amber-500" />
                <span>Immediate Local Download</span>
              </li>
            </ul>
          </div>

          {/* Support / Contact */}
          <div>
            <h4 className="text-slate-800 font-bold text-xs uppercase tracking-widest mb-4">Contact & Support</h4>
            <p className="text-xs text-slate-500 mb-2 leading-relaxed">
              Have questions, feedback, or feature requests? Contact our helpdesk.
            </p>
            <a
              href="mailto:support@docucraft.saas"
              className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              support@docucraft.saas
              <LucideIcon name="ChevronRight" size={12} className="ml-0.5" />
            </a>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="border-t border-slate-200 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 font-medium">
          <p>© 2026 DOCUCRAFT.io. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0 items-center">
            <span className="hover:text-slate-600 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <div className="flex items-center space-x-1.5 ml-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <span className="text-slate-400">All Systems Operational</span>
              <span className="text-slate-300 mx-1">|</span>
              <span className="text-slate-600 uppercase font-bold tracking-tighter">PRO ADMIN</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
