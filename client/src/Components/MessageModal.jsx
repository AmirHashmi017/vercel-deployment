import React from "react";

const MessageModal = ({ message, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p className="modal-message">{message}</p>
        <button className="close-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
};

export default MessageModal;
