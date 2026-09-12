import React, { useState, useEffect } from "react";
import {
  BotMessageSquare,
  Sparkles,
  Send,
  BookmarkPlus,
  ShieldCheck,
  Globe,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  FolderSearch,
  ExternalLink,
  UploadCloud,
  Settings2,
  Cpu,
  Key
} from "lucide-react";
import { useVault } from "../../context/VaultContext";
import { aiApi } from "../../api/client";

export const AIDoubtSolverView = () => {
  const { showToast, setActiveTab, openDocumentViewer, setUploadModalOpen, navigateToSubject } = useVault();
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "👋 Hello! I am **StudyVault AI – Universal Academic Doubt Solver**.\n\n• **General Doubt Solver**: Ask any academic, engineering, coding, mathematics, or science question—even if you haven't uploaded a PDF for it yet!\n• **Vault Auto-Linking**: If you have uploaded notes or PDFs related to your question, I will automatically cross-reference them with exact page citations.\n• **Check Stored PDFs**: Ask *'Did I upload Java notes?'* or *'Is OS unit 1 uploaded?'* to verify files in your library.\n\n⚡ *Powered by StudyVault Academic Intelligence Engine with zero-cost offline & cloud LLM support.*",
      mode: "general",
      citations: []
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState("");
  const [mode, setMode] = useState("general"); // Default is "general" (Universal Academic Doubt Solver)
  const [loading, setLoading] = useState(false);

  // Engine configuration modal
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [engineStatus, setEngineStatus] = useState(null);
  const [geminiKeyInput, setGeminiKeyInput] = useState("");
  const [groqKeyInput, setGroqKeyInput] = useState("");
  const [openaiKeyInput, setOpenaiKeyInput] = useState("");
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    fetchEngineStatus();
  }, []);

  const fetchEngineStatus = async () => {
    try {
      const res = await aiApi.getEngineStatus();
      setEngineStatus(res.data);
      if (res.data) {
        setGeminiKeyInput(res.data.gemini_masked ? "" : "");
      }
    } catch (err) {
      console.error("Failed to load engine status", err);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const payload = {};
      if (geminiKeyInput.trim()) payload.gemini_api_key = geminiKeyInput.trim();
      if (groqKeyInput.trim()) payload.groq_api_key = groqKeyInput.trim();
      if (openaiKeyInput.trim()) payload.openai_api_key = openaiKeyInput.trim();
      await aiApi.updateEngineConfig(payload);
      showToast("AI Engine configuration updated!");
      await fetchEngineStatus();
      setConfigModalOpen(false);
      setGeminiKeyInput("");
      setGroqKeyInput("");
      setOpenaiKeyInput("");
    } catch (err) {
      console.error(err);
      showToast("Failed to update AI configuration", "error");
    } finally {
      setSavingConfig(false);
    }
  };

  // Save to knowledge modal
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [saveTarget, setSaveTarget] = useState("quick_note");
  const [saveTitle, setSaveTitle] = useState("");
  const [saveCategory, setSaveCategory] = useState("General");
  const [saveContent, setSaveContent] = useState("");

  const handleAsk = async (customQ = null, actionType = null) => {
    const q = customQ || inputQuestion;
    if (!q.trim()) return;

    const userMsg = { role: "user", text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion("");
    setLoading(true);

    try {
      const res = await aiApi.askQuestion({
        question: q,
        mode: mode,
        action: actionType
      });

      const aiMsg = {
        role: "ai",
        text: res.data.answer,
        mode: res.data.mode,
        isGrounded: res.data.is_grounded,
        citations: res.data.citations || [],
        matchedDocuments: res.data.matched_documents || [],
        suggestedTitle: res.data.suggested_title || q.slice(0, 40),
        suggestedCategory: res.data.suggested_category || "Academic"
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Error communicating with AI service. Please check your backend connection.",
          citations: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const openSaveModal = (msg) => {
    setSelectedMsg(msg);
    setSaveTitle(msg.suggestedTitle || "Academic Insight");
    setSaveCategory(msg.suggestedCategory || "DSA");
    setSaveContent(msg.text);
    setSaveModalOpen(true);
  };

  const handleConfirmSave = async () => {
    try {
      await aiApi.saveToKnowledge({
        target: saveTarget,
        title: saveTitle,
        category_or_topic: saveCategory,
        content: saveContent,
        tags: "AI-Verified"
      });
      showToast(`Saved to ${saveTarget.replace("_", " ").toUpperCase()}!`);
      setSaveModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header & Mode Switcher */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <BotMessageSquare className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">AI Doubt Solver Studio</h1>
          </div>
          <p className="text-xs text-slate-500 max-w-md leading-relaxed">
            Trusted academic assistant. Search, query, and understand your course notes with exact page citations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* AI Engine Status & Configuration Trigger */}
          <button
            onClick={() => setConfigModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 border border-slate-200 transition-all shadow-2xs"
            title="Configure AI Engine & API Keys"
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span className="truncate max-w-[150px]">
              {engineStatus?.active_engine ? engineStatus.active_engine.split("(")[0] : "AI Engine"}
            </span>
            <Settings2 className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Dual Mode Switcher */}
          <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200/80">
            <button
              onClick={() => setMode("general")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mode === "general"
                  ? "bg-white text-indigo-700 shadow-xs border border-indigo-100"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Universal Doubt Solver</span>
            </button>

            <button
              onClick={() => setMode("documents")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mode === "documents"
                  ? "bg-white text-emerald-700 shadow-xs border border-emerald-100"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Vault PDFs Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mode Status Banner */}
      <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
        mode === "general"
          ? "bg-indigo-50/80 border-indigo-200 text-indigo-900"
          : "bg-emerald-50/80 border-emerald-200 text-emerald-900"
      }`}>
        <div className="flex items-center gap-2.5">
          {mode === "general" ? (
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <div>
            <span className="font-bold">
              {mode === "general"
                ? "Universal Academic Doubt Solver Active: "
                : "Vault PDFs Only Mode Active: "}
            </span>
            <span>
              {mode === "general"
                ? "Solves any general academic, coding, or engineering doubt. If you uploaded relevant notes, it automatically cites the exact pages!"
                : "Searches strictly inside your uploaded course notes and lecture PDFs."}
            </span>
          </div>
        </div>

        {mode === "documents" && (
          <button
            onClick={() => setActiveTab("library")}
            className="text-[11px] font-bold text-emerald-700 hover:underline shrink-0"
          >
            Browse Vault PDFs →
          </button>
        )}
      </div>

      {/* Action Chips */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-1.5 overflow-x-auto pb-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Study Presets:</span>
        {[
          { label: "📁 Check If PDF Exists", action: "check_pdf_exists", prompt: "Did I upload any notes or PDFs on this topic before? Does the file exist in my vault?" },
          { label: "💡 Explain simply", action: "explain_simple", prompt: "Provide a simple explanation on the main topics in my saved notes" },
          { label: "🔍 Explain in detail", action: "explain_detailed", prompt: "Provide a detailed explanation on the main topics in my saved notes" },
          { label: "💻 Give an example", action: "give_example", prompt: "Give a practical code or real-world example from my notes" },
          { label: "📋 Summarize", action: "summarize", prompt: "Summarize the key takeaways from my notes" },
          { label: "📝 Make short notes", action: "short_notes", prompt: "Make high-yield revision bullet points from my notes" },
          { label: "🎯 3 Practice MCQs", action: "generate_mcqs", prompt: "Generate 3 exam practice MCQs with explanations from my notes" },
          { label: "❓ Exam Questions", action: "generate_questions", prompt: "List the top likely university exam questions from my notes" },
        ].map((chip, idx) => (
          <button
            key={idx}
            onClick={() => {
              const query = inputQuestion.trim()
                ? (chip.action === "check_pdf_exists" ? `Did I upload any notes or PDF about ${inputQuestion}? Does it exist?` : `${chip.label} for ${inputQuestion}`)
                : chip.prompt;
              handleAsk(query, chip.action);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all shrink-0 flex items-center gap-1.5 ${
              chip.action === "check_pdf_exists"
                ? "bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100 font-bold"
                : "bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border-slate-200/80"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4 min-h-[420px] flex flex-col justify-between">
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white ml-12 font-medium"
                  : "bg-slate-50 border border-slate-200/80 text-slate-800 mr-8"
              }`}
            >
              <div className="whitespace-pre-wrap font-sans text-xs md:text-sm">{msg.text}</div>

              {/* Citations Box */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-200/80">
                  <div className="flex items-center gap-1.5 text-indigo-900 font-extrabold text-[11px] mb-2 uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Verified Citations from Your Academic Library</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.citations.map((c, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-2.5 bg-white border border-indigo-100 rounded-xl shadow-2xs text-[11px]"
                      >
                        <div className="flex items-center justify-between font-bold text-slate-800">
                          <span className="truncate">{c.document_title}</span>
                          <span className="text-indigo-600 shrink-0 ml-1">Page {c.page_number}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 italic line-clamp-2">
                          "{c.snippet}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Documents Card (Document Existence Search) */}
              {msg.matchedDocuments && msg.matchedDocuments.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-200/80">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold text-[11px] mb-2 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Verified Documents in Your StudyVault ({msg.matchedDocuments.length} found)</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5">
                    {msg.matchedDocuments.map((doc, dIdx) => (
                      <div
                        key={dIdx}
                        className="p-3 bg-white border border-emerald-200 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-slate-900 text-xs md:text-sm truncate">
                                {doc.title}
                              </h4>
                              {(doc.exists_on_disk || doc.verified_on_disk) && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Disk Verified
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 flex-wrap">
                              <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
                                Semester {doc.semester_number || doc.semester}
                              </span>
                              {(doc.subject_name || doc.subject) && (
                                <span className="bg-slate-100 px-2 py-0.5 rounded-lg text-slate-700 font-medium">
                                  {doc.subject_name || doc.subject}
                                </span>
                              )}
                              <span>{doc.page_count} pages</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() =>
                              openDocumentViewer({
                                ...doc,
                                id: doc.id,
                                title: doc.title,
                                semester_number: doc.semester_number || doc.semester,
                                subject_name: doc.subject_name || doc.subject,
                                page_count: doc.page_count
                              })
                            }
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Open & Preview PDF</span>
                          </button>
                          {(doc.subject_name || doc.subject) && (
                            <button
                              onClick={() =>
                                navigateToSubject(doc.semester_number || doc.semester, { name: doc.subject_name || doc.subject })
                              }
                              className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all"
                              title="Go to Subject Library"
                            >
                              Library →
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Document Prompt */}
              {msg.role === "ai" &&
                msg.text &&
                (msg.text.includes("No matching documents found") ||
                  msg.text.includes("No document found") ||
                  msg.text.includes("You can upload it")) && (
                  <div className="mt-3 p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-900">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Missing this PDF in your vault? Add it now to preserve it forever.</span>
                    </div>
                    <button
                      onClick={() => setUploadModalOpen(true)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0 flex items-center gap-1"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload PDF Now</span>
                    </button>
                  </div>
                )}

              {/* 1-Click Save Verified Answer to My Knowledge */}
              {msg.role === "ai" && idx > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span>Grounding:</span>
                    <span className="font-bold text-slate-600">
                      {msg.citations?.length ? `${msg.citations.length} document citations` : "Academic Knowledge"}
                    </span>
                  </div>

                  <button
                    onClick={() => openSaveModal(msg)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-indigo-200 hover:border-indigo-400 text-indigo-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 active:scale-95"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Save to My Knowledge</span>
                  </button>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500 animate-pulse flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>StudyVault AI is retrieving relevant chunks and synthesizing grounded answer...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3"
        >
          <input
            type="text"
            placeholder={
              mode === "documents"
                ? "Search & query specifically inside your saved PDFs (e.g. 'What is asymptotic notation?', 'Explain ACID')"
                : "Ask any academic doubt (e.g. 'What is Dynamic Programming?', 'Difference between TCP and UDP', 'Explain Dijkstra algorithm')..."
            }
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            className="flex-1 px-4 py-3 text-xs md:text-sm border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 shadow-2xs"
          />
          <button
            type="submit"
            disabled={loading || !inputQuestion.trim()}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-2xl transition-all shadow-md shadow-indigo-100 flex items-center gap-2"
          >
            <span>Ask AI</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Save to My Knowledge Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Save Verified AI Answer to My Knowledge</h3>
            <p className="text-xs text-slate-400">Review and store this explanation permanently in your vault.</p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Vault Section</label>
                <select
                  value={saveTarget}
                  onChange={(e) => setSaveTarget(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-semibold text-slate-800"
                >
                  <option value="quick_note">My Quick Notes (Syntax, Commands, Fast Formulas)</option>
                  <option value="core_knowledge">Core Knowledge (Permanent Concepts & Interview Tips)</option>
                  <option value="important_resource">Important Resources (Verified Material)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category / Topic</label>
                <input
                  type="text"
                  value={saveCategory}
                  onChange={(e) => setSaveCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Content</label>
                <textarea
                  rows={4}
                  value={saveContent}
                  onChange={(e) => setSaveContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSaveModalOpen(false)}
                  className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSave}
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                >
                  Confirm & Store in Vault
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Engine & API Key Settings Modal */}
      {configModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Cpu className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">AI Engine & Model Setup</h3>
                  <p className="text-xs text-slate-400">Zero-cost intelligence & free cloud AI providers.</p>
                </div>
              </div>
              <button
                onClick={() => setConfigModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Current Engine Status */}
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-900 font-extrabold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Active Engine: {engineStatus?.active_engine || "StudyVault Academic Engine"}</span>
              </div>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                ✅ **100% Free & Unlimited**: StudyVault AI's built-in Academic Intelligence Engine works continuously with zero credits required.
              </p>
            </div>

            {/* Notice about OpenAI Credit Balance */}
            {engineStatus?.has_openai && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>OpenAI Key Status: Balance Exhausted</span>
                </div>
                <p className="text-amber-800">
                  Your registered key (<code className="font-mono bg-amber-100 px-1 py-0.5 rounded">{engineStatus.openai_masked}</code>) has 0 credit quota. All queries automatically route through our built-in Academic Engine or free providers below.
                </p>
              </div>
            )}

            <form onSubmit={handleSaveConfig} className="space-y-3 pt-1">
              {/* Google Gemini Free Tier */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Google Gemini API Key (100% Free Forever)</span>
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
                  >
                    <span>Get Free Key (No card)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="password"
                  placeholder={engineStatus?.has_gemini ? `Current: ${engineStatus.gemini_masked}` : "Paste AIzaSy... (Gemini 1.5 Flash Free Key)"}
                  value={geminiKeyInput}
                  onChange={(e) => setGeminiKeyInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Recommended: 15 free requests/min from Google AI Studio.
                </p>
              </div>

              {/* Groq Free Tier */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Groq API Key (Free LLaMA 3.3 70B)</span>
                  </label>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-0.5"
                  >
                    <span>Get Free Groq Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="password"
                  placeholder={engineStatus?.has_groq ? `Current: ${engineStatus.groq_masked}` : "Paste gsk_... (Groq Key)"}
                  value={groqKeyInput}
                  onChange={(e) => setGroqKeyInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none font-mono"
                />
              </div>

              {/* OpenAI Key */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  OpenAI API Key (Paid)
                </label>
                <input
                  type="password"
                  placeholder={engineStatus?.has_openai ? `Current: ${engineStatus.openai_masked}` : "sk-proj-..."}
                  value={openaiKeyInput}
                  onChange={(e) => setOpenaiKeyInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setConfigModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xs"
                >
                  {savingConfig ? "Applying..." : "Save & Activate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
