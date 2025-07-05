import React from "react";
import { COLORS } from "../../constants/colors.js";

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    opacity: 0,
    transition: "opacity 0.3s ease-in",
  },
  overlayVisible: {
    opacity: 1,
  },
  modal: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
    transform: "translateY(20px)",
    transition: "transform 0.3s ease-in",
  },
  modalVisible: {
    transform: "translateY(0)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  close: {
    fontSize: 18,
    color: COLORS.error,
    cursor: "pointer",
  },
};

const CustomModal = ({ isVisible, onClose, title, children }) => {
  if (!isVisible) return null;

  return (
    <div
      style={{ ...styles.overlay, ...(isVisible ? styles.overlayVisible : {}) }}
    >
      <div
        style={{ ...styles.modal, ...(isVisible ? styles.modalVisible : {}) }}
      >
        <div style={styles.header}>
          <h2 style={styles.title}>{title}</h2>
          <button style={styles.close} onClick={onClose}>
            X
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default CustomModal;
