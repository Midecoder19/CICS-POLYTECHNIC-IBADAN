import React, { createContext, useContext, useState, useCallback } from 'react';

const FormContext = createContext();

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};

export const FormProvider = ({ children }) => {
  const [unsavedForms, setUnsavedForms] = useState(new Set());

  const markFormAsUnsaved = useCallback((formId) => {
    setUnsavedForms(prev => new Set([...prev, formId]));
  }, []);

  const markFormAsSaved = useCallback((formId) => {
    setUnsavedForms(prev => {
      const newSet = new Set(prev);
      newSet.delete(formId);
      return newSet;
    });
  }, []);

  const hasUnsavedChanges = useCallback(() => {
    return unsavedForms.size > 0;
  }, [unsavedForms]);

  const clearAllUnsaved = useCallback(() => {
    setUnsavedForms(new Set());
  }, []);

  const value = {
    unsavedForms,
    markFormAsUnsaved,
    markFormAsSaved,
    hasUnsavedChanges,
    clearAllUnsaved,
  };

  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
};
