import React from "react";
import SignatureCanvas from "react-signature-canvas";
import CustomButton from "./CustomButton";
import { COLORS } from "../../constants/colors.js";
import { FONTS } from "../../constants/fonts.js";

const styles = {
  modalContainer: {
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
  },
  modal: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    minHeight: 400,
    maxHeight: "90%",
    width: "90%",
    maxWidth: 600,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  close: {
    fontSize: 18,
    color: COLORS.error,
    padding: 8,
    cursor: "pointer",
  },
  content: {
    flex: 1,
    alignItems: "center",
  },
  signatureCanvas: {
    height: 300,
    width: "100%",
    border: `1px solid ${COLORS.gray}`,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    marginBottom: 16,
  },
  buttons: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    flex: "0.48",
    paddingVertical: 12,
    borderRadius: 8,
  },
};

const SignatureModal = ({
  isVisible,
  onClose,
  onSave,
  onClear,
  signatureRef,
  onSignature,
}) => {
  if (!isVisible) return null;

  return (
    <div style={styles.modalContainer}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <span style={styles.title}>Sign Here</span>
          <button onClick={onClose} style={styles.close}>
            X
          </button>
        </div>
        <div style={styles.content}>
          <SignatureCanvas
            ref={signatureRef}
            penColor={COLORS.text}
            backgroundColor={COLORS.white}
            canvasProps={{ style: styles.signatureCanvas }}
            onEnd={() => {
              if (signatureRef.current && !signatureRef.current.isEmpty()) {
                onSignature(signatureRef.current.toDataURL());
              }
            }}
            onBegin={() => {
              if (signatureRef.current && signatureRef.current.isEmpty()) {
                onSignature("");
              }
            }}
          />
          <div style={styles.buttons}>
            <CustomButton
              title="Clear"
              onPress={onClear}
              style={styles.button}
            />
            <CustomButton title="Save" onPress={onSave} style={styles.button} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignatureModal;
