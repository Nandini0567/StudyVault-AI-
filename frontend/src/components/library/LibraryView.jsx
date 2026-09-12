import React, { useState, useEffect } from "react";
import {
  FolderKanban,
  Plus,
  FileText,
  Eye,
  Star,
  Bookmark,
  Sparkles,
  Trash2,
  Tag,
  Search,
  Filter,
  ArrowLeft,
  CalendarCheck,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useVault } from "../../context/VaultContext";
import { libraryApi } from "../../api/client";

export const LibraryView = () => {
  const { user } = useAuth();
  const {
    selectedSemester,
    setSelectedSemester,
    selectedSubject,
    setSelectedSubject,
    openDocumentViewer,
    setUploadModalOpen,
    showToast
  } = useVault();

  const [semesters, setSemesters] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [docLoading, setDocLoading] = useState(false);

  // Filters
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedFilterType, setSelectedFilterType] = useState(""); // favorite, important, exam, revision, interview
  const [searchDocQuery, setSearchDocQuery] = useState("");

  // Add Subject Modal
  const [addSubjectOpen, setAddSubjectOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectCode, setNewSubjectCode] = useState("");
  const [newSubjectColor, setNewSubjectColor] = useState("indigo");

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    try {
      setLoading(true);
      const res = await libraryApi.getSemesters();
      setSemesters(res.data);
    } catch (err) {
      console.error("Failed to load semesters:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSubject) {
      fetchSubjectDocuments(selectedSubject.id);
    } else {
      setDocuments([]);
    }
  }, [selectedSubject, selectedTag, selectedFilterType]);

  const fetchSubjectDocuments = async (subjectId) => {
    try {
      setDocLoading(true);
      const params = {};
      if (selectedTag) params.tag = selectedTag;
      if (selectedFilterType) params.filter_type = selectedFilterType;
      const res = await libraryApi.getSubjectDocuments(subjectId, params);
      setDocuments(res.data);
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setDocLoading(false);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    try {
      const activeSemObj = semesters.find((s) => s.number === selectedSemester);
      if (!activeSemObj) return;

      await libraryApi.createSubject({
        semester_id: activeSemObj.id,
        name: newSubjectName,
        code: newSubjectCode,
        color: newSubjectColor
      });
      showToast(`Subject "${newSubjectName}" added to Semester ${selectedSemester}!`);
      setNewSubjectName("");
      setNewSubjectCode("");
      setAddSubjectOpen(false);
      fetchSemesters();
    } catch (err) {
      console.error("Error creating subject:", err);
    }
  };

  const handleDeleteDocument = async (docId, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await libraryApi.deleteDocument(docId);
        showToast("Document removed from library.");
        fetchSubjectDocuments(selectedSubject.id);
        fetchSemesters();
      } catch (err) {
        console.error("Error deleting doc:", err);
      }
    }
  };

  const handleToggleFavorite = async (doc) => {
    try {
      await libraryApi.updateDocument(doc.id, { is_favorite: !doc.is_favorite });
      fetchSubjectDocuments(selectedSubject.id);
    } catch (err) {
      console.error(err);
    }
  };

  const currentSemesterObj = semesters.find((s) => s.number === selectedSemester);

  const filteredDocs = documents.filter((doc) => {
    if (!searchDocQuery) return true;
    return (
      doc.title.toLowerCase().includes(searchDocQuery.toLowerCase()) ||
      doc.tags.toLowerCase().includes(searchDocQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Permanent Academic Library Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <FolderKanban className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Academic Library (Semesters 1 – 8)</h1>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Permanent multi-semester knowledge repository. Materials stored in previous semesters remain
              intact for revision, exams, campus placements, and technical interviews.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setUploadModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-200 flex items-center gap-2 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Upload PDF</span>
            </button>
          </div>
        </div>

        {/* 8-Semester Navigation Tabs */}
        <div className="mt-6 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((semNum) => {
              const semData = semesters.find((s) => s.number === semNum);
              const isSelected = selectedSemester === semNum;
              const isCurrent = user?.current_semester === semNum;
              const docCount = semData?.total_documents || 0;

              return (
                <button
                  key={semNum}
                  onClick={() => {
                    setSelectedSemester(semNum);
                    setSelectedSubject(null);
                  }}
                  className={`flex flex-col items-center px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 border ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100"
                      : "bg-slate-50/80 hover:bg-indigo-50/50 text-slate-700 border-slate-200/80"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Semester {semNum}</span>
                    {isCurrent && (
                      <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-emerald-300" : "bg-emerald-500"}`}></span>
                    )}
                  </div>
                  <span className={`text-[10px] font-semibold mt-0.5 ${isSelected ? "text-indigo-100" : "text-slate-400"}`}>
                    {docCount} docs
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {!selectedSubject ? (
        /* SUBJECTS OVERVIEW FOR SELECTED SEMESTER */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-800">
                Subjects in Semester {selectedSemester}
              </h2>
              <p className="text-xs text-slate-400">Select a subject to view stored PDFs, notes, and question papers</p>
            </div>
            <button
              onClick={() => setAddSubjectOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Subject</span>
            </button>
          </div>

          {currentSemesterObj?.subjects?.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 text-slate-400 text-xs">
              No subjects registered yet for Semester {selectedSemester}. Click "+ Add Subject" to create one.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {currentSemesterObj?.subjects?.map((subj) => (
                <div
                  key={subj.id}
                  onClick={() => setSelectedSubject(subj)}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {subj.code || "CORE"}
                      </span>
                      <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">
                        {subj.document_count || 0} files →
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {subj.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {subj.description || "Course materials & notes"}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>Stored Materials</span>
                    <span className="font-bold text-indigo-600">{subj.document_count || 0} PDFs</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* SUBJECT DOCUMENT EXPLORER VIEW */
        <div className="space-y-4">
          {/* Header & Back Button */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedSubject(null)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                  title="Back to Semester Subjects"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                      Semester {selectedSemester} • {selectedSubject.code || "Subject"}
                    </span>
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900">{selectedSubject.name}</h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload PDF into Subject</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {[
                  { id: "", label: "All Documents" },
                  { id: "favorite", label: "Favorites ⭐" },
                  { id: "important", label: "Important 📌" },
                  { id: "exam", label: "Exam Prep 🎯" },
                  { id: "revision", label: "Revision ⚡" },
                  { id: "interview", label: "Interview 💼" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFilterType(f.id)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      selectedFilterType === f.id
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* In-Subject Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter documents in this subject..."
                  value={searchDocQuery}
                  onChange={(e) => setSearchDocQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Document Cards Grid */}
          {docLoading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Loading subject materials...</div>
          ) : filteredDocs.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 text-slate-400 text-xs space-y-2">
              <FileText className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-600">No documents found with selected filter</p>
              <p>Click "Upload PDF into Subject" to store your lecture notes, syllabus, or previous papers.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleFavorite(doc)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            doc.is_favorite ? "text-amber-500 bg-amber-50" : "text-slate-300 hover:text-amber-500"
                          }`}
                          title="Toggle Favorite"
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(doc.id, doc.title)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {doc.title}
                    </h4>

                    {doc.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {doc.description}
                      </p>
                    )}

                    {/* Tags */}
                    {doc.tags && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {doc.tags.split(",").map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                          >
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-medium text-slate-400">
                      {doc.page_count} pages • {(doc.file_size / 1024).toFixed(0)} KB
                    </span>
                    <button
                      onClick={() => openDocumentViewer(doc)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Preview & Ask AI</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Subject Modal */}
      {addSubjectOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">Add Subject to Semester {selectedSemester}</h3>
            <p className="text-xs text-slate-400 mb-4">Organize documents under this subject course</p>

            <form onSubmit={handleCreateSubject} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Database Management Systems"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. CS301"
                  value={newSubjectCode}
                  onChange={(e) => setNewSubjectCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddSubjectOpen(false)}
                  className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                >
                  Create Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
