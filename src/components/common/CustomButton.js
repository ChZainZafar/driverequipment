import React from "react";
import { COLORS } from "../../constants/colors.js";

const styles = {
  button: {
    border: "none",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    textAlign: "center",
    backgroundImage: `linear-gradient(to right, ${COLORS.gradientStart}, ${COLORS.gradientEnd})`,
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 18,
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  disabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
};

const CustomButton = ({ title, onPress, style, textStyle, disabled }) => {
  return (
    <button
      onClick={onPress}
      disabled={disabled}
      style={{
        ...styles.button,
        ...(disabled ? styles.disabled : {}),
        ...style,
      }}
    >
      <span style={textStyle}>{title}</span>
    </button>
  );
};

export default CustomButton;
