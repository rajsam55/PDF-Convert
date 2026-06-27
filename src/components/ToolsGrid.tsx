import { useState } from "react";
import { TOOLS } from "../data/tools";
import { ToolConfig, ToolType } from "../types";
import LucideIcon from "./LucideIcon";

interface ToolsGridProps {
  onSelectTool: (id: ToolType) => void;
}

export default function ToolsGrid({ onSelectTool }: ToolsGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "pdf" | "image" | "convert">("all");

  const filteredTools = TOOLS.filter((tool) => {
    const matchesSearch =
      tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.shortDesc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "all" || tool.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section id="tools-catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Search and Filters bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-200">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold font-display transition-all cursor-pointer ${
              activeCategory === "all"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Utilities
          </button>
          <button
            onClick={() => setActiveCategory("pdf")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold font-display transition-all cursor-pointer ${
              activeCategory === "pdf"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            PDF Tools
          </button>
          <button
            onClick={() => setActiveCategory("image")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold font-display transition-all cursor-pointer ${
              activeCategory === "image"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Image Tools
          </button>
          <button
            onClick={() => setActiveCategory("convert")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold font-display transition-all cursor-pointer ${
              activeCategory === "convert"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Conversion
          </button>
        </div>

        {/* Real-time search bar */}
        <div className="relative w-full md:w-80">
          <LucideIcon
            name="Search"
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search documents or image tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white transition-all shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <LucideIcon name="X" size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Grid items */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTools.map((tool) => {
            // Map each tool ID to a clean, geometrically balanced theme accent background
            const getIconColorClasses = (id: string) => {
              switch (id) {
                case "merge":
                  return "bg-indigo-50 text-indigo-600";
                case "split":
                  return "bg-red-50 text-red-600";
                case "compress":
                  return "bg-blue-50 text-blue-600";
                case "word-to-pdf":
                  return "bg-indigo-50 text-indigo-600";
                case "pdf-to-img":
                  return "bg-emerald-50 text-emerald-600";
                case "img-to-pdf":
                  return "bg-emerald-50 text-emerald-600";
                case "pdf-to-word":
                  return "bg-indigo-50 text-indigo-600";
                case "convert-img":
                  return "bg-purple-50 text-purple-600";
                default:
                  return "bg-slate-100 text-slate-600";
              }
            };

            return (
              <div
                key={tool.id}
                onClick={() => onSelectTool(tool.id)}
                className="group relative bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer duration-200"
              >
                <div>
                  {/* Popular Badge */}
                  {tool.popular && (
                    <span className="absolute top-4 right-4 bg-amber-50 text-amber-700 text-[9px] font-bold px-2 py-0.5 rounded-md border border-amber-100 flex items-center space-x-1 uppercase tracking-wider">
                      <LucideIcon name="Sparkles" size={8} className="text-amber-500" />
                      <span>Popular</span>
                    </span>
                  )}

                  {/* Styled Icon Box */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 font-bold transition-all ${getIconColorClasses(tool.id)}`}>
                    <LucideIcon name={tool.icon} size={20} />
                  </div>

                  {/* Titles */}
                  <h3 className="font-sans font-bold text-slate-800 group-hover:text-indigo-600 transition-colors mb-1 text-base">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    {tool.shortDesc}
                  </p>
                </div>

                {/* Action trigger */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-indigo-600 transition-colors">
                  <span>Start processing</span>
                  <LucideIcon
                    name="ChevronRight"
                    size={14}
                    className="translate-x-0 group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <LucideIcon name="AlertTriangle" size={20} />
          </div>
          <h3 className="font-sans font-bold text-slate-700 mb-1">No matching tools found</h3>
          <p className="text-xs text-slate-500">Try adjusting your search filters or clear your text.</p>
        </div>
      )}
    </section>
  );
}
