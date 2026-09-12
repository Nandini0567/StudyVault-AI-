import React, { useState, useEffect } from "react";
import {
  FileText,
  Zap,
  BrainCircuit,
  BookmarkCheck,
  Upload,
  Bot,
  Sparkles,
  Award,
  ArrowRight,
  Eye,
  Star,
  Clock,
  BookOpen,
  Calendar
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useVault } from "../../context/VaultContext";
import { libraryApi, notesApi } from "../../api/client";

export const DashboardView = () => {
  const { user } = useAuth();
  const {
    setActiveTab,
    setSelectedSemester,
    setSelectedSubject,
    openDocumentViewer,
    setUploadModalOpen
  } = useVault();

  const [stats, setStats] = useState({
    current_semester: user?.current_semester || 1,
    total_documents: 0,
    total_quick_notes: 0,
    total_core_knowledge: 0,
    total_important_resources: 0,
    recent_uploads: [],
    pinned_resources: [],
  });
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, notesRes] = await Promise.all([
          libraryApi.getStats(),
          notesApi.getNotes({ limit: 3 })
        ]);
        setStats(statsRes.data);
        setRecentNotes(notesRes.data.slice(0, 3));
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-vault-600 p-7 text-white shadow-lg shadow-indigo-200">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[11px] font-bold backdrop-blur-xs mb-3 border border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>{user?.branch || "Engineering"} • Academic Year 2026</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.full_name?.split(" ")[0] || "Scholar"} 👋
            </h1>
            <p className="text-indigo-100 text-xs md:text-sm mt-1 max-w-xl leading-relaxed">
              Your academic library preserves your materials from Semester 1 through Semester 8.
              Never lose formulas, PDF notes, or past concepts again.
            </p>
          </div>

          {/* Current Semester Action Pill */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shrink-0 text-center md:text-right">
            <p className="text-xs uppercase font-bold text-indigo-200 tracking-wider">Active Academic Term</p>
            <div className="text-2xl font-black mt-0.5">Semester {stats.current_semester}</div>
            <button
              onClick={() => {
                setSelectedSemester(stats.current_semester);
                setActiveTab("library");
              }}
              className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-indigo-700 text-xs font-extrabold hover:bg-indigo-50 transition-all shadow-xs"
            >
              <span>Explore Term Materials</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Ambient decorative circle */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Documents */}
        <div
          onClick={() => setActiveTab("library")}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">Stored Documents</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.total_documents}</div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="font-semibold text-indigo-600">Across 8 Semesters</span>
          </p>
        </div>

        {/* Quick Notes */}
        <div
          onClick={() => setActiveTab("notes")}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">My Quick Notes</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.total_quick_notes}</div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="font-semibold text-amber-600">Syntax & Formulas</span>
          </p>
        </div>

        {/* Core Knowledge */}
        <div
          onClick={() => setActiveTab("core")}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">Core Knowledge</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BrainCircuit className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.total_core_knowledge}</div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="font-semibold text-emerald-600">Lifetime Concepts</span>
          </p>
        </div>

        {/* Important Resources */}
        <div
          onClick={() => setActiveTab("resources")}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">Important Resources</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookmarkCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.total_important_resources}</div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="font-semibold text-purple-600">Books & Handouts</span>
          </p>
        </div>
      </div>

      {/* Quick Launchpad Action Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">StudyVault AI Tools</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50/70 hover:bg-indigo-100/70 text-indigo-900 transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold">Upload PDF</p>
              <p className="text-[10px] text-slate-500">Add to Semester/Subject</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("ai")}
            className="flex items-center gap-3 p-3 rounded-xl bg-purple-50/70 hover:bg-purple-100/70 text-purple-900 transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold">AI Doubt Solver</p>
              <p className="text-[10px] text-slate-500">My Docs vs General AI</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("revision")}
            className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-900 transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold">Revision Mode</p>
              <p className="text-[10px] text-slate-500">High-Yield Study Sheets</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("quiz")}
            className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/70 hover:bg-amber-100/70 text-amber-900 transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold">Quiz Arena</p>
              <p className="text-[10px] text-slate-500">MCQs & Scored Tests</p>
            </div>
          </button>
        </div>
      </div>

      {/* Split Section: Recent Uploads & Quick Notes Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Uploads Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Document Uploads</h3>
              <p className="text-[11px] text-slate-400">Your permanently preserved course materials</p>
            </div>
            <button
              onClick={() => setActiveTab("library")}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View Library</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {stats.recent_uploads.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No documents uploaded yet. Upload your first PDF to get started!
            </div>
          ) : (
            <div className="space-y-2.5">
              {stats.recent_uploads.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-indigo-200 bg-slate-50/50 hover:bg-indigo-50/30 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{doc.title}</h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                        <span className="font-semibold text-indigo-600">Sem {doc.semester_number}</span>
                        <span>•</span>
                        <span className="truncate">{doc.subject_name}</span>
                        <span>•</span>
                        <span>{doc.page_count} pages</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openDocumentViewer(doc)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-1 shadow-2xs"
                    >
                      <Eye className="w-3 h-3 text-slate-400" />
                      <span>Preview & Study</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Quick Notes Preview Widget (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Personal Quick Notes</h3>
                <p className="text-[11px] text-slate-400">Formulas, commands & syntax</p>
              </div>
              <button
                onClick={() => setActiveTab("notes")}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>All Notes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {recentNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => setActiveTab("notes")}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-amber-50/40 hover:border-amber-200 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800">{note.title}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                      {note.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {note.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => setActiveTab("notes")}
              className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all text-center"
            >
              + Create New Quick Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
