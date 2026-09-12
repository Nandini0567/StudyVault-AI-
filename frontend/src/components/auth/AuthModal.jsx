import React, { useState } from "react";
import {
  BookOpenCheck,
  Lock,
  Mail,
  User,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const AuthModal = () => {
  const { login, register, loginDemo, resetPassword, error, setError } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register" | "reset"
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    new_password: "",
    full_name: "",
    college: "Engineering College",
    branch: "Computer Science & Engineering",
    current_semester: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setError?.(null);

    try {
      if (mode === "register") {
        await register(formData);
      } else if (mode === "login") {
        await login(formData.email.trim(), formData.password);
      } else if (mode === "reset") {
        const ok = await resetPassword(formData.email.trim(), formData.new_password);
        if (ok) {
          setSuccessMessage("Password reset successfully! Opening your vault...");
        }
      }
    } catch (err) {
      console.error("Auth submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async () => {
    setLoading(true);
    setError?.(null);
    await loginDemo();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 py-8">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-vault-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        {/* Header Hero */}
        <div className="p-8 pb-5 bg-gradient-to-b from-indigo-50/90 to-white border-b border-slate-100 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 mb-3">
            <BookOpenCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">StudyVault AI</h1>
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mt-1">
            Personal Academic Knowledge Vault
          </p>
          <div className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/70 rounded-full text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Database Vault: All Uploads Permanently Stored</span>
          </div>
        </div>

        <div className="p-8 pt-5">
          {/* Quick Demo Button */}
          <button
            type="button"
            onClick={handleDemoClick}
            disabled={loading}
            className="w-full mb-5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100/50 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 group-hover:rotate-12 transition-transform" />
              <span>1-Click Explore as Demo Student</span>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl mb-5 text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError?.(null);
                setSuccessMessage("");
              }}
              className={`py-1.5 rounded-lg transition-all ${
                mode === "login" ? "bg-white text-indigo-700 shadow-sm" : "hover:text-slate-900"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError?.(null);
                setSuccessMessage("");
              }}
              className={`py-1.5 rounded-lg transition-all ${
                mode === "register" ? "bg-white text-indigo-700 shadow-sm" : "hover:text-slate-900"
              }`}
            >
              New Register
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("reset");
                setError?.(null);
                setSuccessMessage("");
              }}
              className={`py-1.5 rounded-lg transition-all ${
                mode === "reset" ? "bg-white text-indigo-700 shadow-sm" : "hover:text-slate-900"
              }`}
            >
              Reset Password
            </button>
          </div>

          {/* Error Message with smart action */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p>{error}</p>
                  {error.toLowerCase().includes("already exists") && (
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMode("login");
                          setError?.(null);
                        }}
                        className="px-2 py-1 bg-rose-200 text-rose-900 rounded font-bold hover:bg-rose-300 transition-colors text-[11px]"
                      >
                        Switch to Sign In
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMode("reset");
                          setError?.(null);
                        }}
                        className="px-2 py-1 bg-white border border-rose-300 text-rose-800 rounded font-bold hover:bg-rose-100 transition-colors text-[11px]"
                      >
                        Reset Password
                      </button>
                    </div>
                  )}
                  {error.toLowerCase().includes("incorrect email or password") && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMode("reset");
                          setError?.(null);
                        }}
                        className="text-indigo-700 underline font-bold hover:text-indigo-900 text-[11px]"
                      >
                        Forgot password? Click here to set a new password and log in immediately.
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* REGISTER FIELDS */}
            {mode === "register" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mouna"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">College / University</label>
                    <input
                      type="text"
                      placeholder="e.g. NIT / Engineering College"
                      value={formData.college}
                      onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Current Semester</label>
                    <select
                      value={formData.current_semester}
                      onChange={(e) => setFormData({ ...formData, current_semester: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none bg-white font-semibold text-slate-700"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Engineering Branch / Discipline</label>
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none bg-white font-semibold text-slate-800"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                    <option value="Information Technology">Information Technology (IT)</option>
                    <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science (AI & DS)</option>
                    <option value="Electronics & Communication Engineering">Electronics & Communication Engineering (ECE)</option>
                    <option value="Electrical & Electronics Engineering">Electrical & Electronics Engineering (EEE)</option>
                    <option value="Mechanical Engineering">Mechanical Engineering (MECH)</option>
                    <option value="Civil Engineering">Civil Engineering (CIVIL)</option>
                    <option value="Chemical Engineering">Chemical Engineering (CHEM)</option>
                    <option value="Biotechnology">Biotechnology (BT)</option>
                  </select>
                </div>
              </>
            )}

            {/* EMAIL (All modes) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Email Address</label>
                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  Personal (Gmail, etc.) or College
                </span>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="e.g. student@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Any personal email (Gmail, Outlook, Yahoo) or College ID is accepted.
              </p>
            </div>

            {/* PASSWORD (Login & Register modes) */}
            {(mode === "login" || mode === "register") && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => setMode("reset")}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* NEW PASSWORD (Reset mode) */}
            {mode === "reset" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Set New Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="Enter new password (e.g. Student@123)"
                    value={formData.new_password}
                    onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  You can set any password you want and immediately log straight into your saved vault.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 mt-2"
            >
              {loading
                ? "Please wait..."
                : mode === "register"
                ? "Create Academic Vault"
                : mode === "reset"
                ? "Reset Password & Open Vault"
                : "Open My Vault"}
            </button>
          </form>

          {/* Bottom switch mode links */}
          <div className="mt-4 text-center">
            {mode === "register" ? (
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError?.(null);
                }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Already have an account? <span className="font-bold underline">Sign In</span>
              </button>
            ) : mode === "login" ? (
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError?.(null);
                }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                New student? <span className="font-bold underline">Create your Academic Vault</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError?.(null);
                }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Remembered password? <span className="font-bold underline">Back to Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

