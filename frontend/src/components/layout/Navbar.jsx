import React, { useState } from "react";
import { Search, Upload, Bot, CheckCircle2, AlertCircle, Sparkles, GraduationCap, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useVault } from "../../context/VaultContext";

const BRANCHES = [
  "Computer Science & Engineering",
  "Information Technology",
  "Artificial Intelligence & Data Science",
  "Electronics & Communication Engineering",
  "Electrical & Electronics Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Biotechnology"
];

export const Navbar = () => {
  const { user, updateBranch } = useAuth();
  const {
    setActiveTab,
    setUploadModalOpen,
    searchQuery,
    setSearchQuery,
    setSearchModalOpen,
    toast,
    showToast
  } = useVault();

  const [branchOpen, setBranchOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchModalOpen(true);
    }
  };

  const handleBranchSelect = async (branchName) => {
    setBranchOpen(false);
    const ok = await updateBranch(branchName);
    if (ok) {
      showToast(`Branch updated to ${branchName}!`);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-lg">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Global Search across all 8 semesters, notes, and citations... (e.g. 'HashMap', 'ACID')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchQuery.trim()) setSearchModalOpen(true);
            }}
            className="w-full bg-slate-100/80 border border-slate-200/80 rounded-xl pl-10 pr-24 py-2 text-xs font-medium focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            className="absolute right-2 px-2 py-1 text-[10px] font-semibold bg-white border border-slate-200 text-slate-500 rounded-md shadow-2xs hover:bg-slate-50"
          >
            ⌘K Search
          </button>
        </div>
      </form>

      {/* Right Quick Actions */}
      <div className="flex items-center gap-3">
        {/* Branch Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setBranchOpen(!branchOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 text-slate-700 text-xs font-bold transition-all shadow-2xs group"
          >
            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
            <span className="max-w-[150px] truncate">{user?.branch || "Select Branch"}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-700" />
          </button>

          {branchOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
              <p className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">Select Your Branch</p>
              {BRANCHES.map((b) => (
                <button
                  key={b}
                  onClick={() => handleBranchSelect(b)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all truncate ${
                    user?.branch === b
                      ? "bg-indigo-600 text-white font-bold"
                      : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Upload Button */}
        <button
          onClick={() => setUploadModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-200 transition-all active:scale-95"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload PDF</span>
        </button>

        {/* Quick Ask AI Button */}
        <button
          onClick={() => setActiveTab("ai")}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-indigo-200/70 hover:border-indigo-300 text-indigo-700 text-xs font-bold transition-all active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Ask AI Doubt</span>
        </button>
      </div>

      {/* Dynamic Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-xs font-semibold text-white ${
            toast.type === "error" ? "bg-rose-600" : "bg-slate-900"
          }`}>
            {toast.type === "error" ? (
              <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </header>
  );
};
