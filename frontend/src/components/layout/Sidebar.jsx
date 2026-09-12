import React, { useState } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Zap,
  BrainCircuit,
  BookmarkCheck,
  BotMessageSquare,
  Sparkles,
  Award,
  GraduationCap,
  LogOut,
  ChevronRight,
  BookOpenCheck,
  CalendarCheck
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useVault } from "../../context/VaultContext";

export const Sidebar = () => {
  const { user, logout, updateSemester } = useAuth();
  const { activeTab, setActiveTab, showToast } = useVault();
  const [semesterDropdownOpen, setSemesterDropdownOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Home Dashboard", icon: LayoutDashboard },
    { id: "library", label: "Academic Library", icon: FolderKanban, badge: "Sem 1-8" },
    { id: "notes", label: "My Quick Notes", icon: Zap, badge: "Syntax & Tips" },
    { id: "core", label: "Core Knowledge", icon: BrainCircuit, badge: "Permanent" },
    { id: "resources", label: "Important Resources", icon: BookmarkCheck, badge: "Verified" },
    { id: "ai", label: "AI Doubt Solver", icon: BotMessageSquare, highlight: true },
    { id: "revision", label: "Revision Mode", icon: Sparkles },
    { id: "quiz", label: "Quiz Arena", icon: Award },
  ];

  const handleSemesterChange = async (semNum) => {
    const success = await updateSemester(semNum);
    if (success) {
      showToast(`Current semester set to Semester ${semNum}! Old semester documents remain 100% accessible.`);
    }
    setSemesterDropdownOpen(false);
  };

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 select-none z-30 shadow-sm">
      {/* Brand Logo */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-vault-400 flex items-center justify-center text-white shadow-md shadow-indigo-100">
          <BookOpenCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-lg tracking-tight text-slate-900">StudyVault</span>
            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-200/60 uppercase tracking-wider">AI</span>
          </div>
          <p className="text-[11px] font-medium text-slate-400 tracking-tight">Academic Knowledge Vault</p>
        </div>
      </div>

      {/* Current Semester Badge & Switcher */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <div
            onClick={() => setSemesterDropdownOpen(!semesterDropdownOpen)}
            className="p-3 bg-gradient-to-r from-indigo-50/80 via-white to-blue-50/50 border border-indigo-100/80 rounded-xl cursor-pointer hover:border-indigo-300 transition-all flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                {user?.current_semester || 1}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-indigo-500">Current Semester</p>
                <p className="text-xs font-bold text-slate-800">Semester {user?.current_semester || 1}</p>
              </div>
            </div>
            <CalendarCheck className="w-4 h-4 text-indigo-400" />
          </div>

          {/* Semester Selector Dropdown */}
          {semesterDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 grid grid-cols-4 gap-1 animate-in fade-in zoom-in-95 duration-150">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <button
                  key={sem}
                  onClick={() => handleSemesterChange(sem)}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    user?.current_semester === sem
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600"
                  }`}
                >
                  Sem {sem}
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5 px-1 leading-tight flex items-center gap-1">
          <span>🔒</span> All 8 semesters preserved permanently
        </p>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                  : item.highlight
                  ? "bg-indigo-50/70 text-indigo-700 hover:bg-indigo-100/70"
                  : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  isActive ? "text-white" : item.highlight ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-600"
                }`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Student Profile Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
              {user?.full_name ? user.full_name[0] : "S"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.full_name || "Student"}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.branch || "Computer Science"}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
