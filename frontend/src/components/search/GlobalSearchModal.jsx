import React, { useState, useEffect } from "react";
import {
  X,
  Search,
  FileText,
  Zap,
  BrainCircuit,
  Eye,
  FileSearch
} from "lucide-react";
import { useVault } from "../../context/VaultContext";
import { searchApi } from "../../api/client";

export const GlobalSearchModal = () => {
  const {
    searchQuery,
    setSearchQuery,
    searchModalOpen,
    setSearchModalOpen,
    openDocumentViewer,
    setActiveTab
  } = useVault();

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchModalOpen && searchQuery.trim()) {
      executeSearch(searchQuery);
    }
  }, [searchModalOpen, searchQuery]);

  const executeSearch = async (q) => {
    setLoading(true);
    try {
      const res = await searchApi.globalSearch(q);
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!searchModalOpen) return null;

  const totalHits =
    (results?.documents?.length || 0) +
    (results?.chunks?.length || 0) +
    (results?.quick_notes?.length || 0) +
    (results?.core_knowledge?.length || 0) +
    (results?.resources?.length || 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 pt-16 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
          <Search className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search across all 8 semesters, PDF pages, quick notes & core concepts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            onClick={() => setSearchModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Searching entire academic knowledge vault...
            </div>
          ) : !results || totalHits === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs space-y-2">
              <FileSearch className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-600">No matching materials found</p>
              <p>Try keywords like "HashMap", "ACID", "Complexity", "Calculus", or "Linux".</p>
            </div>
          ) : (
            <>
              {results.chunks?.length > 0 && (
                <div>
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Exact Document Page Matches ({results.chunks.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {results.chunks.map((chunk, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100/80 hover:border-indigo-300 transition-all text-xs"
                      >
                        <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                          <span className="truncate">{chunk.document_title}</span>
                          <span className="text-indigo-600 shrink-0 text-[11px]">
                            Sem {chunk.semester_number} • Page {chunk.page_number}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 italic leading-relaxed">
                          "{chunk.snippet}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.documents?.length > 0 && (
                <div>
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Stored Documents ({results.documents.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {results.documents.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => {
                          setSearchModalOpen(false);
                          openDocumentViewer(doc);
                        }}
                        className="p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between text-xs group"
                      >
                        <div>
                          <div className="font-bold text-slate-800 group-hover:text-indigo-600">
                            {doc.title}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Semester {doc.semester_number} • {doc.subject_name} • {doc.page_count} pages
                          </div>
                        </div>
                        <Eye className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.quick_notes?.length > 0 && (
                <div>
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>My Quick Notes ({results.quick_notes.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {results.quick_notes.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          setSearchModalOpen(false);
                          setActiveTab("notes");
                        }}
                        className="p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-300 transition-all cursor-pointer text-xs"
                      >
                        <div className="flex items-center justify-between font-bold text-slate-800 mb-0.5">
                          <span>{n.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800">
                            {n.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{n.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.core_knowledge?.length > 0 && (
                <div>
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BrainCircuit className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Core Knowledge ({results.core_knowledge.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {results.core_knowledge.map((k) => (
                      <div
                        key={k.id}
                        onClick={() => {
                          setSearchModalOpen(false);
                          setActiveTab("core");
                        }}
                        className="p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 transition-all cursor-pointer text-xs"
                      >
                        <div className="flex items-center justify-between font-bold text-slate-800 mb-0.5">
                          <span>{k.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">
                            {k.topic}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2">{k.key_points}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
