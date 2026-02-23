import React from 'react';

const SuccessModal = ({ showSuccessModal, successMessage, closeModals }) => {
  if (!showSuccessModal) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Success</h3>
          <button className="modal-close" onClick={closeModals}>×</button>
        </div>
        <div className="modal-body">
          <p>{successMessage}</p>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
