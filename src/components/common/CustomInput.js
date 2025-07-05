import React from "react";
import { COLORS } from "../../constants/colors.js";
import { FONTS } from "../../constants/fonts.js";
import {
  DocumentTextIcon,
  TagIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

const styles = {
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 4,
    fontFamily: FONTS.regularInter,
  },
  inputContainer: {
    display: "flex",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 8,
    border: `1px solid ${COLORS.gray}`,
    overflow: "hidden",
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: COLORS.text,
    border: "none",
    padding: "0 12px",
    fontFamily: FONTS.regularInter,
    outline: "none",
    width: "100%",
  },
  textarea: {
    flex: 1,
    minHeight: 120,
    fontSize: 16,
    color: COLORS.text,
    border: "none",
    padding: 12,
    fontFamily: FONTS.regularInter,
    outline: "none",
    width: "100%",
    resize: "vertical",
  },
  iconContainer: {
    padding: 12,
  },
};

const CustomInput = ({
  label,
  value,
  onChangeText,
  icon,
  placeholder,
  type = "text",
  multiline = false,
  style = {},
}) => {
  const getIcon = () => {
    switch (icon) {
      case "description":
        return <DocumentTextIcon width={20} height={20} stroke={COLORS.gray} />;
      case "label":
        return <TagIcon width={20} height={20} stroke={COLORS.gray} />;
      case "attach-money":
        return (
          <CurrencyDollarIcon width={20} height={20} stroke={COLORS.gray} />
        );
      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      {label && <span style={styles.label}>{label}</span>}
      <div style={styles.inputContainer}>
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChangeText(e.target.value)}
            placeholder={placeholder}
            style={{ ...styles.textarea, ...style }}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChangeText(e.target.value)}
            placeholder={placeholder}
            style={styles.input}
          />
        )}
        {icon && <div style={styles.iconContainer}>{getIcon()}</div>}
      </div>
    </div>
  );
};

export default CustomInput;
