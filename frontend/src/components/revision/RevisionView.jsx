import React, { useState, useEffect } from "react";
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  Code2,
  FileCheck,
  BookmarkPlus,
  RefreshCw,
  Printer
} from "lucide-react";
import { useVault } from "../../context/VaultContext";
import { libraryApi, aiApi } from "../../api/client";

export const RevisionView = () => {
  const { showToast } = useVault();
  const [semesters, setSemesters] = useState([]);
  const [selectedSem, setSelectedSem] = useState(2);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjId, setSelectedSubjId] = useState("");
  const [revisionData, setRevisionData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSemesters();
  }, []);

  const loadSemesters = async () => {
    try {
      const res = await libraryApi.getSemesters();
      setSemesters(res.data);
      const sem2 = res.data.find((s) => s.number === 2) || res.data[0];
      if (sem2) {
        setSelectedSem(sem2.number);
        setSubjects(sem2.subjects || []);
        if (sem2.subjects?.length > 0) {
          setSelectedSubjId(sem2.subjects[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSemesterChange = (semNum) => {
    setSelectedSem(semNum);
    const sem = semesters.find((s) => s.number === Number(semNum));
    if (sem && sem.subjects) {
      setSubjects(sem.subjects);
      if (sem.subjects.length > 0) {
        setSelectedSubjId(sem.subjects[0].id);
      } else {
        setSelectedSubjId("");
      }
    }
  };

  const handleGenerateRevision = async () => {
    if (!selectedSubjId) return;
    setLoading(true);
    try {
      const res = await aiApi.generateRevision({
        semester_id: selectedSem,
        subject_id: Number(selectedSubjId)
      });
      setRevisionData(res.data);
      showToast("High-yield revision sheet synthesized from your stored materials!");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedSubjObj = subjects.find((s) => s.id === Number(selectedSubjId));

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">AI Revision Mode</h1>
          </div>
          <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
            Synthesize key definitions, formulas, syntax, and high-frequency exam questions
            grounded in your stored course documents.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Export Sheet</span>
        </button>
      </div>

      {/* Selector Controls */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Configure Revision Target</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Semester</label>
            <select
              value={selectedSem}
              onChange={(e) => handleSemesterChange(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-semibold text-slate-800"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Subject</label>
            <select
              value={selectedSubjId}
              onChange={(e) => setSelectedSubjId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-semibold text-slate-800"
            >
              {subjects.map((subj) => (
                <option key={subj.id} value={subj.id}>
                  {subj.name} ({subj.code || "Subject"})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerateRevision}
          disabled={loading || !selectedSubjId}
          className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Synthesizing Course Materials...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate High-Yield Revision Sheet</span>
            </>
          )}
        </button>
      </div>

      {/* Revision Sheet Display */}
      {revisionData && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-7 space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                Semester {selectedSem} • Verified Vault Synthesis
              </span>
              <h2 className="text-lg font-extrabold text-slate-900 mt-1">{revisionData.title}</h2>
            </div>
            <span className="text-xs font-bold text-slate-400">Exam Ready 🎯</span>
          </div>

          {/* Key Theoretical Concepts */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>1. Key Theoretical Concepts & Definitions</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {revisionData.key_concepts.map((concept, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed font-medium">
                  • {concept}
                </div>
              ))}
            </div>
          </div>

          {/* Formulas & Syntax Reference */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              <Code2 className="w-4 h-4 text-amber-600" />
              <span>2. Formulas, Syntax & Invariants</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs space-y-2 shadow-inner">
              {revisionData.formulas_or_syntax.map((formula, idx) => (
                <div key={idx} className="leading-relaxed">
                  {formula}
                </div>
              ))}
            </div>
          </div>

          {/* High-Frequency Exam Questions */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              <HelpCircle className="w-4 h-4 text-rose-600" />
              <span>3. High-Frequency Exam & Viva Questions</span>
            </div>
            <div className="space-y-2">
              {revisionData.exam_questions.map((q, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 text-xs text-rose-950 font-semibold flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center text-[10px] shrink-0 font-bold">
                    {idx + 1}
                  </span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Summary */}
          <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl">
            <div className="whitespace-pre-line text-xs text-indigo-950 leading-relaxed font-sans">
              {revisionData.detailed_summary}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
