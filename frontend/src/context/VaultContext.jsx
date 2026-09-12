import React, { createContext, useContext, useState } from "react";

const VaultContext = createContext(null);

export const VaultProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, library, notes, core, resources, ai, revision, quiz
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null); // Document object for PDF viewer & AI study
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  
  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const openDocumentViewer = (doc) => {
    setViewingDoc(doc);
  };

  const closeDocumentViewer = () => {
    setViewingDoc(null);
  };

  const navigateToSubject = (semesterNumber, subject) => {
    setSelectedSemester(semesterNumber);
    setSelectedSubject(subject);
    setActiveTab("library");
  };

  return (
    <VaultContext.Provider value={{
      activeTab,
      setActiveTab,
      selectedSemester,
      setSelectedSemester,
      selectedSubject,
      setSelectedSubject,
      viewingDoc,
      openDocumentViewer,
      closeDocumentViewer,
      uploadModalOpen,
      setUploadModalOpen,
      searchQuery,
      setSearchQuery,
      searchModalOpen,
      setSearchModalOpen,
      toast,
      showToast,
      navigateToSubject
    }}>
      {children}
    </VaultContext.Provider>
  );
};

export const useVault = () => useContext(VaultContext);
