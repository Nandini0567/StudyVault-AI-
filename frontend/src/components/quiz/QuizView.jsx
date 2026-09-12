import React, { useState, useEffect } from "react";
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  BookOpen
} from "lucide-react";
import { useVault } from "../../context/VaultContext";
import { aiApi, libraryApi } from "../../api/client";

export const QuizView = () => {
  const { showToast, openDocumentViewer } = useVault();
  const [semesters, setSemesters] = useState([]);
  const [selectedSubjId, setSelectedSubjId] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState(3);
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Quiz interactive state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    loadSemesters();
  }, []);

  const loadSemesters = async () => {
    try {
      const res = await libraryApi.getSemesters();
      setSemesters(res.data);
      const allSubjs = res.data.flatMap((s) => s.subjects || []);
      if (allSubjs.length > 0) {
        setSelectedSubjId(allSubjs[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartQuiz = async () => {
    setLoading(true);
    setQuizCompleted(false);
    setSelectedAnswers({});
    setCurrentIndex(0);

    try {
      const res = await aiApi.generateQuiz({
        subject_id: selectedSubjId ? Number(selectedSubjId) : null,
        difficulty: difficulty,
        num_questions: numQuestions
      });
      setQuizData(res.data);
      showToast("Quiz generated from your stored coursework!");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qId, optionIdx) => {
    if (selectedAnswers[qId] !== undefined) return;
    setSelectedAnswers({ ...selectedAnswers, [qId]: optionIdx });
  };

  const currentQ = quizData?.questions?.[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQ = quizData?.questions?.length || 0;

  const correctCount = quizData?.questions?.reduce((acc, q) => {
    return acc + (selectedAnswers[q.id] === q.correct_index ? 1 : 0);
  }, 0) || 0;

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Award className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">AI Quiz Arena</h1>
          </div>
          <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
            Test your concept mastery with interactive multiple-choice questions generated
            directly from your uploaded documents and notes.
          </p>
        </div>

        {quizData && (
          <button
            onClick={() => setQuizData(null)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Quiz Config</span>
          </button>
        )}
      </div>

      {!quizData ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Configure Practice Test</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Subject</label>
              <select
                value={selectedSubjId}
                onChange={(e) => setSelectedSubjId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-semibold text-slate-800"
              >
                {semesters.map((sem) => (
                  <optgroup key={sem.id} label={`Semester ${sem.number}`}>
                    {sem.subjects?.map((subj) => (
                      <option key={subj.id} value={subj.id}>
                        {subj.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-semibold text-slate-800"
              >
                <option value="easy">Easy (Fundamentals)</option>
                <option value="medium">Medium (Standard Exam)</option>
                <option value="hard">Hard (Interview / Gate)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Number of Questions</label>
              <select
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-semibold text-slate-800"
              >
                <option value={3}>3 Questions (Quick Drill)</option>
                <option value={5}>5 Questions (Standard)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleStartQuiz}
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold shadow-md shadow-amber-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Crafting Questions from Your Documents...</span>
            ) : (
              <>
                <Award className="w-4 h-4" />
                <span>Start Practice Quiz</span>
              </>
            )}
          </button>
        </div>
      ) : !quizCompleted ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Question {currentIndex + 1} of {totalQ}</span>
            <span>Score: {correctCount} / {answeredCount}</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / totalQ) * 100}%` }}
            ></div>
          </div>

          <div className="pt-2">
            <h3 className="text-base font-extrabold text-slate-900 leading-snug">
              {currentQ?.question}
            </h3>
            {currentQ?.source_document && (
              <span className="inline-block mt-2 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                📄 Source: {currentQ.source_document} {currentQ.page_number ? `(Page ${currentQ.page_number})` : ""}
              </span>
            )}
          </div>

          <div className="space-y-2.5">
            {currentQ?.options?.map((opt, optIdx) => {
              const hasAnswered = selectedAnswers[currentQ.id] !== undefined;
              const isSelected = selectedAnswers[currentQ.id] === optIdx;
              const isCorrect = optIdx === currentQ.correct_index;

              let btnStyle = "bg-slate-50 border-slate-200 text-slate-800 hover:bg-amber-50 hover:border-amber-200";

              if (hasAnswered) {
                if (isCorrect) {
                  btnStyle = "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold";
                } else if (isSelected && !isCorrect) {
                  btnStyle = "bg-rose-50 border-rose-400 text-rose-950 font-bold";
                } else {
                  btnStyle = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                }
              }

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(currentQ.id, optIdx)}
                  disabled={hasAnswered}
                  className={`w-full p-3.5 rounded-2xl border text-xs font-semibold text-left transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-white border border-inherit flex items-center justify-center font-bold text-slate-600 text-xs shrink-0">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span>{opt}</span>
                  </div>
                  {hasAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  {hasAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          {selectedAnswers[currentQ?.id] !== undefined && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 space-y-1 animate-in fade-in duration-150">
              <div className="flex items-center gap-1.5 font-extrabold text-indigo-900">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                <span>Concept Explanation</span>
              </div>
              <p className="leading-relaxed text-[11px]">{currentQ.explanation}</p>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold disabled:opacity-30"
            >
              Previous
            </button>

            {currentIndex < totalQ - 1 ? (
              <button
                onClick={() => setCurrentIndex(currentIndex + 1)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => setQuizCompleted(true)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                Complete & Review Test
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs text-center space-y-5 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center shadow-lg shadow-amber-100">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Quiz Completed!</h2>
            <p className="text-xs text-slate-400 mt-0.5">Performance Report from Your Stored Materials</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 inline-block max-w-sm w-full">
            <div className="text-3xl font-black text-slate-900">
              {correctCount} / {totalQ}
            </div>
            <p className="text-xs font-bold text-slate-500 mt-1">
              Score: {((correctCount / totalQ) * 100).toFixed(0)}% Accuracy
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setSelectedAnswers({});
                setCurrentIndex(0);
                setQuizCompleted(false);
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              Retry Same Quiz
            </button>
            <button
              onClick={() => setQuizData(null)}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
            >
              Configure New Subject Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
