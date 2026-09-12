import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { VaultProvider, useVault } from "./context/VaultContext";
import { Sidebar } from "./components/layout/Sidebar";
import { Navbar } from "./components/layout/Navbar";
import { AuthModal } from "./components/auth/AuthModal";
import { DashboardView } from "./components/dashboard/DashboardView";
import { LibraryView } from "./components/library/LibraryView";
import { UploadModal } from "./components/library/UploadModal";
import { PdfViewerModal } from "./components/library/PdfViewerModal";
import { QuickNotesView } from "./components/notes/QuickNotesView";
import { CoreKnowledgeView } from "./components/core/CoreKnowledgeView";
import { ImportantResourcesView } from "./components/resources/ImportantResourcesView";
import { AIDoubtSolverView } from "./components/ai/AIDoubtSolverView";
import { RevisionView } from "./components/revision/RevisionView";
import { QuizView } from "./components/quiz/QuizView";
import { GlobalSearchModal } from "./components/search/GlobalSearchModal";

const AppContent = () => {
  const { user, loading } = useAuth();
  const { activeTab } = useVault();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center animate-bounce font-black text-xl">
            S
          </div>
          <p className="text-xs font-bold text-slate-400">Loading Academic Vault...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthModal />;
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Permanent Sidebar */}
      <Sidebar />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {activeTab === "dashboard" && <DashboardView />}
          {activeTab === "library" && <LibraryView />}
          {activeTab === "notes" && <QuickNotesView />}
          {activeTab === "core" && <CoreKnowledgeView />}
          {activeTab === "resources" && <ImportantResourcesView />}
          {activeTab === "ai" && <AIDoubtSolverView />}
          {activeTab === "revision" && <RevisionView />}
          {activeTab === "quiz" && <QuizView />}
        </main>
      </div>

      {/* Global Modals */}
      <UploadModal />
      <PdfViewerModal />
      <GlobalSearchModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <VaultProvider>
        <AppContent />
      </VaultProvider>
    </AuthProvider>
  );
}
