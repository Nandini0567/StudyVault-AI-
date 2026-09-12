import React, { useState, useEffect } from "react";
import {
  BrainCircuit,
  Plus,
  Search,
  Award,
  Sparkles,
  HelpCircle,
  Code2,
  Trash2,
  BookmarkCheck
} from "lucide-react";
import { useVault } from "../../context/VaultContext";
import { coreApi } from "../../api/client";

export const CoreKnowledgeView = () => {
  const { showToast } = useVault();
  const [concepts, setConcepts] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Add Concept Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTopic, setNewTopic] = useState("OOP");
  const [newImportance, setNewImportance] = useState("Critical");
  const [newKeyPoints, setNewKeyPoints] = useState("");
  const [newCodeExample, setNewCodeExample] = useState("");
  const [newInterviewNotes, setNewInterviewNotes] = useState("");

  useEffect(() => {
    loadConcepts();
    loadTopics();
  }, [selectedTopic]);

  const loadConcepts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedTopic !== "All") params.topic = selectedTopic;
      const res = await coreApi.getCoreKnowledge(params);
      setConcepts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadTopics = async () => {
    try {
      const res = await coreApi.getTopics();
      setTopics(["All", ...res.data]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newKeyPoints.trim()) return;

    try {
      await coreApi.createCoreKnowledge({
        topic: newTopic,
        title: newTitle,
        importance: newImportance,
        key_points: newKeyPoints,
        code_example: newCodeExample,
        interview_notes: newInterviewNotes
      });
      showToast("Permanent Core Knowledge added!");
      setNewTitle("");
      setNewKeyPoints("");
      setNewCodeExample("");
      setNewInterviewNotes("");
      setAddModalOpen(false);
      loadConcepts();
      loadTopics();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this core concept?")) {
      try {
        await coreApi.deleteCoreKnowledge(id);
        showToast("Core knowledge removed.");
        loadConcepts();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredConcepts = concepts.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.key_points.toLowerCase().includes(q) ||
      (c.interview_notes && c.interview_notes.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <BrainCircuit className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Core Knowledge Hub</h1>
          </div>
          <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
            Non-semester-bound foundational concepts. Retained for your entire college journey
            and invaluable for campus placements, system design rounds, and technical interviews.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-200 flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Core Concept</span>
        </button>
      </div>

      {/* Topics & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTopic(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedTopic === t
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search core concepts, interview tips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Concepts Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading core concepts...</div>
      ) : filteredConcepts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 text-slate-400 text-xs space-y-2">
          <BrainCircuit className="w-8 h-8 mx-auto text-emerald-300" />
          <p className="font-semibold text-slate-700">No concepts found for topic "{selectedTopic}"</p>
          <p>Click "+ Add Core Concept" to store evergreen fundamentals.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredConcepts.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                      {item.topic}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      item.importance === "Critical"
                        ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                        : "bg-indigo-50 text-indigo-700 border border-indigo-200/60"
                    }`}>
                      {item.importance}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 mb-3">{item.title}</h3>

                {/* Key Points */}
                <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed mb-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  {item.key_points}
                </div>

                {/* Code Example if present */}
                {item.code_example && (
                  <div className="my-3 rounded-2xl bg-slate-900 text-slate-100 p-3.5 font-mono text-[11px] overflow-x-auto shadow-inner">
                    <pre className="whitespace-pre">{item.code_example}</pre>
                  </div>
                )}

                {/* Interview Notes Box */}
                {item.interview_notes && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl">
                    <div className="flex items-center gap-1.5 text-amber-900 text-[11px] font-bold mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Interview & Placement Insights</span>
                    </div>
                    <p className="text-[11px] text-amber-800/90 leading-relaxed font-sans">
                      {item.interview_notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 max-h-[85vh] overflow-y-auto">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">Add Permanent Core Knowledge</h3>
            <p className="text-xs text-slate-400 mb-4">Concepts that remain vital throughout college and technical interviews</p>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Concept Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ACID Properties & Database Normalization"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Topic</label>
                  <select
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-semibold text-slate-800"
                  >
                    {["OOP", "DBMS", "Operating Systems", "DSA", "Computer Networks", "SQL", "System Design"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Importance</label>
                  <select
                    value={newImportance}
                    onChange={(e) => setNewImportance(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-semibold text-slate-800"
                  >
                    <option value="Critical">Critical (High Placement Yield)</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Key Principles & Explanations</label>
                <textarea
                  rows={4}
                  required
                  placeholder="1. Atomicity: All or nothing&#10;2. Consistency...&#10;1NF, 2NF, 3NF differences"
                  value={newKeyPoints}
                  onChange={(e) => setNewKeyPoints(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Code / Query Example (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="// Code illustration"
                  value={newCodeExample}
                  onChange={(e) => setNewCodeExample(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Technical Interview Viva Notes</label>
                <textarea
                  rows={2}
                  placeholder="Common questions asked in interviews, edge cases to mention..."
                  value={newInterviewNotes}
                  onChange={(e) => setNewInterviewNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
                >
                  Save to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
