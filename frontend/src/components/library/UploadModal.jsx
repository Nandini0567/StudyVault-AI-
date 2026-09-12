import React, { useState, useEffect } from "react";
import { X, Upload, FileText, Check, AlertCircle } from "lucide-react";
import { useVault } from "../../context/VaultContext";
import { libraryApi } from "../../api/client";

export const UploadModal = () => {
  const {
    uploadModalOpen,
    setUploadModalOpen,
    selectedSemester,
    selectedSubject,
    showToast
  } = useVault();

  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [targetSemester, setTargetSemester] = useState(selectedSemester || 1);
  const [targetSubjectId, setTargetSubjectId] = useState(selectedSubject?.id || "");
  const [docTitle, setDocTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [tags, setTags] = useState(["Notes"]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [flagExam, setFlagExam] = useState(false);
  const [flagRevision, setFlagRevision] = useState(false);
  const [flagInterview, setFlagInterview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (uploadModalOpen) {
      fetchSemestersAndSubjects();
    }
  }, [uploadModalOpen]);

  useEffect(() => {
    const sem = semesters.find((s) => s.number === Number(targetSemester));
    if (sem && sem.subjects) {
      setSubjects(sem.subjects);
      if (sem.subjects.length > 0) {
        setTargetSubjectId(sem.subjects[0].id);
      } else {
        setTargetSubjectId("");
      }
    }
  }, [targetSemester, semesters]);

  const fetchSemestersAndSubjects = async () => {
    try {
      const res = await libraryApi.getSemesters();
      setSemesters(res.data);
      const sem = res.data.find((s) => s.number === Number(selectedSemester || 1));
      if (sem && sem.subjects) {
        setSubjects(sem.subjects);
        setTargetSubjectId(selectedSubject?.id || (sem.subjects[0]?.id || ""));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (!docTitle) {
        setDocTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const toggleTag = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select a PDF document to upload.");
      return;
    }
    if (!targetSubjectId) {
      setError("Please choose a valid subject.");
      return;
    }

    setUploading(true);
    setError(null);

    const semObj = semesters.find((s) => s.number === Number(targetSemester));

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("semester_id", semObj.id);
    formData.append("subject_id", targetSubjectId);
    formData.append("title", docTitle || selectedFile.name);
    formData.append("tags", tags.join(","));
    formData.append("description", description);
    formData.append("is_favorite", isFavorite);
    formData.append("is_important", isImportant);
    formData.append("flag_exam", flagExam);
    formData.append("flag_revision", flagRevision);
    formData.append("flag_interview", flagInterview);

    try {
      await libraryApi.uploadDocument(formData);
      showToast(`"${docTitle || selectedFile.name}" uploaded & permanently indexed into Semester ${targetSemester}!`);
      setUploadModalOpen(false);
      // Reset
      setSelectedFile(null);
      setDocTitle("");
      setDescription("");
      window.location.reload(); // Quick refresh to update library
    } catch (err) {
      console.error(err);
      setError("Failed to upload document. Please ensure the file is a readable PDF.");
    } finally {
      setUploading(false);
    }
  };

  if (!uploadModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Upload to Academic Vault</h3>
              <p className="text-[11px] text-slate-400">Semester → Subject → Permanent Storage</p>
            </div>
          </div>
          <button
            onClick={() => setUploadModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* File Drop / Select Area */}
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center hover:border-indigo-400 transition-colors bg-slate-50/50">
            <input
              type="file"
              accept=".pdf"
              id="pdf-upload"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="pdf-upload" className="cursor-pointer block">
              <FileText className="w-8 h-8 mx-auto text-indigo-600 mb-2" />
              {selectedFile ? (
                <div>
                  <p className="text-xs font-bold text-slate-800">{selectedFile.name}</p>
                  <p className="text-[10px] text-slate-400">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to Index</p>
                </div>
              ) : (
                <div>
                  <span className="text-xs font-bold text-indigo-600 hover:underline">Click to browse PDF</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Supports textbook chapters, lecture notes, syllabus, PYQs</p>
                </div>
              )}
            </label>
          </div>

          {/* Semester & Subject Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Semester</label>
              <select
                value={targetSemester}
                onChange={(e) => setTargetSemester(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none bg-white font-semibold text-slate-800"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Subject</label>
              <select
                value={targetSubjectId}
                onChange={(e) => setTargetSubjectId(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none bg-white font-semibold text-slate-800"
              >
                {subjects.map((subj) => (
                  <option key={subj.id} value={subj.id}>
                    {subj.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Document Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Document Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Unit 3 Normalization & BCNF Notes.pdf"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Academic Tags</label>
            <div className="flex flex-wrap gap-1.5">
              {["Notes", "Syllabus", "PYQ", "Formula", "Lab", "Book", "CheatSheet"].map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    tags.includes(tag)
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Study Flags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Priority & Study Badges</label>
            <div className="grid grid-cols-3 gap-2">
              <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Favorite ⭐</span>
              </label>

              <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flagExam}
                  onChange={(e) => setFlagExam(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Exam Prep 🎯</span>
              </label>

              <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flagInterview}
                  onChange={(e) => setFlagInterview(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Interview 💼</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Brief Description (Optional)</label>
            <textarea
              rows={2}
              placeholder="Key topics covered in this PDF..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-100 disabled:opacity-50"
            >
              {uploading ? "Extracting & Chunking..." : "Store Permanently"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
