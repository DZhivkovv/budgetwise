import { useEffect } from "react";
import "./modal.css";

/**
 * Reusable Modal component
 * 
 * Props:
 * - children: content rendered inside the modal
 * - onClose: function triggered when modal should close
 */
export default function Modal({ children, onClose }) {

  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEsc);

    // Cleanup event listener on unmount
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";

    // Restore scrolling when modal unmounts
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div
      className="g_modal-overlay"
      onClick={onClose}
    >
      {/* Modal content container */}
      <div
        className="g_modal-content"
        onClick={(e) => e.stopPropagation()} // Prevents closing modal when clicking inside content area
        role="dialog"
        aria-modal="true"
      >
        {/* Modal close button */}
        <button
          onClick={onClose}
          className="g_modal-close-button"
          aria-label="Close modal"
        >
          ×
        </button>

        {/* Modal content */}
        {children}
      </div>
    </div>
  );
}