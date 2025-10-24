import React from "react";
import "./TermsModel.css";

function TermsModel({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Terms and Conditions</h2>
        <div className="modal-body">
          <p>
            By registering, you agree to abide by all rules and policies of EngJobHub.
            Please read carefully before proceeding.
          </p>
          <p>

Your personal information is protected under our Privacy Policy.

By using the website, you consent to the collection, storage, and processing of your data as described in our Privacy Policy.          </p>
        </div>
        <div className="modal-actions">
          <button className="accept-btn" onClick={onClose}>I Accept</button>
        </div>
      </div>
    </div>
  );
}

export default TermsModel;
