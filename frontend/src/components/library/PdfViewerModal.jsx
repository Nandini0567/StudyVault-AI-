import React, { useState } from "react";
import {
  X,
  Bot,
  Sparkles,
  Send,
  BookmarkPlus,
  FileText,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  Award
} from "lucide-react";
import { useVault } from "../../context/VaultContext";
import { aiApi, libraryApi } from "../../api/client";

export const PdfViewerModal = () => {
  const { viewingDoc, closeDocumentViewer, showToast, setActiveTab } = useVault();
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [answerToSave, setAnswerToSave] = useState(null);
  const [saveTarget, setSaveTarget] = useState("quick_note");

  if (!viewingDoc) return null;

  const pdfUrl = libraryApi.getPdfUrl(viewingDoc.id);

  const handleAsk = async (customPrompt = null, actionType = null) => {
    const q = customPrompt || question;
    if (!q.trim()) return;

    const userMsg = { role: "user", text: q };
    setChatHistory((prev) => [...prev, userMsg]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await aiApi.askQuestion({
        question: q,
        mode: "documents", // In-doc viewer always grounds on student documents
        document_id: viewingDoc.id,
        action: actionType
      });

      const aiMsg = {
        role: "ai",
        text: res.data.answer,
        citations: res.data.citations,
        suggestedTitle: res.data.suggested_title,
        suggestedCategory: res.data.suggested_category
      };
      setChatHistory((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setChatHistory((prev) => [
        ...prev,
        { role: "ai", text: "Error connecting to StudyVault AI assistant. Please check your connection.", citations: [] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToKnowledge = async (msg) => {
    try {
      await aiApi.saveToKnowledge({
        target: saveTarget,
        title: msg.suggestedTitle || `${viewingDoc.title} Key Concept`,
        category_or_topic: msg.suggestedCategory || viewingDoc.subject_name || "Academic Notes",
        content: msg.text,
        code_snippet: "",
        tags: "AI-Verified,StudyVault"
      });
      showToast(`Saved to ${saveTarget === "quick_note" ? "My Quick Notes" : "Core Knowledge"}!`);
      setSaveModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-6xl h-[90vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        {/* Top Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-extrabold text-slate-900 truncate">{viewingDoc.title}</h2>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="font-semibold text-indigo-600">Semester {viewingDoc.semester_number}</span>
                <span>•</span>
                <span className="truncate">{viewingDoc.subject_name}</span>
                <span>•</span>
                <span>{viewingDoc.page_count} pages</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                closeDocumentViewer();
                setActiveTab("quiz");
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Quiz Me on This PDF</span>
            </button>

            <button
              onClick={closeDocumentViewer}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Split View */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left: PDF Document Viewer */}
          <div className="flex-1 bg-slate-100/70 p-4 flex flex-col overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-200">
            <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
              {/* PDF Preview Frame or Document Info */}
              <iframe
                src={pdfUrl}
                title={viewingDoc.title}
                className="w-full h-full border-0"
              />
            </div>
          </div>

          {/* Right: In-Document AI Study Assistant Drawer */}
          <div className="w-full lg:w-96 bg-white flex flex-col overflow-hidden">
            {/* AI Assistant Header */}
            <div className="p-4 border-b border-slate-100 bg-indigo-50/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-extrabold text-slate-900">In-Document AI Assistant</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Grounded Mode
              </span>
            </div>

            {/* Quick Action Buttons */}
            <div className="p-3 border-b border-slate-100 bg-slate-50/50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Study Shortcuts</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "💡 Explain simply", action: "explain_simple" },
                  { label: "📋 Summarize", action: "summarize" },
                  { label: "📝 Short notes", action: "short_notes" },
                  { label: "🎯 3 MCQs", action: "generate_mcqs" },
                  { label: "❓ Key Exam Qs", action: "generate_questions" },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAsk(`Generate ${item.label} for ${viewingDoc.title}`, item.action)}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-200 rounded-lg hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-2xs"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                  <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
                  <p className="text-xs font-bold text-slate-700">Ask anything from this document</p>
                  <p className="text-[11px] leading-relaxed">
                    Click a study shortcut above or type questions like "Explain the formula on page 2" or "What are the main definitions?"
                  </p>
                </div>
              ) : (
                chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl text-xs ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white ml-6 font-medium"
                        : "bg-slate-50 border border-slate-200/80 text-slate-800 mr-2"
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed font-sans">{msg.text}</div>

                    {/* Citations if available */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-slate-200/60">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Verified Citations
                        </p>
                        {msg.citations.map((c, cIdx) => (
                          <div key={cIdx} className="text-[10px] text-indigo-700 bg-indigo-50/80 p-1.5 rounded-lg mb-1 font-semibold">
                            📄 Page {c.page_number}: "{c.snippet.slice(0, 100)}..."
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 1-Click Save to Knowledge Button */}
                    {msg.role === "ai" && (
                      <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        <button
                          onClick={() => {
                            setAnswerToSave(msg);
                            setSaveModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-[10px] font-bold transition-all flex items-center gap-1 shadow-2xs"
                        >
                          <BookmarkPlus className="w-3 h-3" />
                          <span>Save to My Knowledge</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
              {loading && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500 animate-pulse flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>StudyVault AI is analyzing document pages...</span>
                </div>
              )}
            </div>

            {/* In-Doc Chat Input */}
            <div className="p-3 border-t border-slate-100 bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAsk();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask a doubt about this PDF..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={loading || !question.trim()}
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Save to Knowledge Mini-Modal */}
      {saveModalOpen && answerToSave && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-2xl border border-slate-100">
            <h4 className="text-sm font-extrabold text-slate-900 mb-1">Save Verified AI Answer</h4>
            <p className="text-xs text-slate-400 mb-3">Store this insight permanently for revision or interview prep</p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Destination</label>
                <select
                  value={saveTarget}
                  onChange={(e) => setSaveTarget(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-semibold text-slate-800"
                >
                  <option value="quick_note">My Quick Notes (Formulas / Syntax)</option>
                  <option value="core_knowledge">Core Knowledge (Permanent Concepts)</option>
                  <option value="important_resource">Important Resources (Verified Material)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSaveModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveToKnowledge(answerToSave)}
                  className="px-4 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                >
                  Confirm Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
