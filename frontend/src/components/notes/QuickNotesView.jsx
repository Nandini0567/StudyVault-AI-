import React, { useState, useEffect } from "react";
import {
  Zap,
  Plus,
  Copy,
  Check,
  Search,
  Star,
  Trash2,
  Tag,
  Code2,
  Terminal,
  FileCode2
} from "lucide-react";
import { useVault } from "../../context/VaultContext";
import { notesApi } from "../../api/client";

export const QuickNotesView = () => {
  const { showToast } = useVault();
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  // Add Note Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Java");
  const [newCodeSnippet, setNewCodeSnippet] = useState("");
  const [newExplanation, setNewExplanation] = useState("");
  const [newTags, setNewTags] = useState("");

  useEffect(() => {
    loadNotes();
    loadCategories();
  }, [selectedCategory]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== "All") params.category = selectedCategory;
      const res = await notesApi.getNotes(params);
      setNotes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await notesApi.getCategories();
      setCategories(["All", ...res.data]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyCode = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    showToast("Code copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newExplanation.trim()) return;

    try {
      await notesApi.createNote({
        title: newTitle,
        category: newCategory,
        code_snippet: newCodeSnippet,
        explanation: newExplanation,
        tags: newTags
      });
      showToast("Quick Note saved to your vault!");
      setNewTitle("");
      setNewCodeSnippet("");
      setNewExplanation("");
      setNewTags("");
      setAddModalOpen(false);
      loadNotes();
      loadCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this quick note?")) {
      try {
        await notesApi.deleteNote(id);
        showToast("Quick note removed.");
        loadNotes();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleToggleFavorite = async (note) => {
    try {
      await notesApi.updateNote(note.id, { is_favorite: !note.is_favorite });
      loadNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotes = notes.filter((n) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.explanation.toLowerCase().includes(q) ||
      (n.code_snippet && n.code_snippet.toLowerCase().includes(q)) ||
      (n.tags && n.tags.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Zap className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">My Quick Notes</h1>
          </div>
          <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
            Essential formulas, commands, and syntax you'd normally jot in a notebook.
            Categorized for rapid lookup during coding, lab exams, and interviews.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm shadow-amber-200 flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Quick Note</span>
        </button>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search syntax, commands, tips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading quick notes...</div>
      ) : filteredNotes.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 text-slate-400 text-xs space-y-2">
          <Zap className="w-8 h-8 mx-auto text-amber-300" />
          <p className="font-semibold text-slate-700">No notes found for category "{selectedCategory}"</p>
          <p>Click "+ New Quick Note" to save syntax or commands.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60">
                    {note.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleFavorite(note)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        note.is_favorite ? "text-amber-500 bg-amber-50" : "text-slate-300 hover:text-amber-500"
                      }`}
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-extrabold text-slate-900 mb-2">{note.title}</h3>

                {/* Code Snippet block if present */}
                {note.code_snippet && (
                  <div className="relative my-3 rounded-2xl bg-slate-900 text-slate-100 p-3.5 font-mono text-[11px] overflow-x-auto shadow-inner group">
                    <button
                      onClick={() => handleCopyCode(note.id, note.code_snippet)}
                      className="absolute right-2 top-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all"
                      title="Copy Code"
                    >
                      {copiedId === note.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <pre className="whitespace-pre">{note.code_snippet}</pre>
                  </div>
                )}

                <p className="text-xs text-slate-600 leading-relaxed font-sans">{note.explanation}</p>
              </div>

              {/* Tags */}
              {note.tags && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1">
                  {note.tags.split(",").map((t, idx) => (
                    <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      #{t.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">Add Personal Quick Note</h3>
            <p className="text-xs text-slate-400 mb-4">Store syntax, command lines, or quick formulas</p>

            <form onSubmit={handleCreateNote} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Java ArrayList Initialization & Sorting"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-semibold text-slate-800"
                  >
                    {["Java", "SQL", "Linux", "DSA", "OOP", "Python", "Web", "General"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="Collections, Syntax"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Code / Command Snippet (Optional)</label>
                <textarea
                  rows={4}
                  placeholder="List<String> list = new ArrayList<>();&#10;Collections.sort(list);"
                  value={newCodeSnippet}
                  onChange={(e) => setNewCodeSnippet(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Explanation / Key Notes</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Key time complexity, usage rule, or pitfall to remember..."
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none"
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
                  className="px-4 py-2 text-xs font-bold bg-amber-500 text-white rounded-xl hover:bg-amber-600"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
