import React from 'react';

const ErrorModal = ({ showErrorModal, errorMessage, closeModals }) => {
  if (!showErrorModal) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content error-modal">
        <div className="modal-header">
          <h3>Error</h3>
          <button className="modal-close" onClick={closeModals}>×</button>
        </div>
        <div className="modal-body">
          <p>{errorMessage}</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
