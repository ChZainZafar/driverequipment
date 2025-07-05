import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { getEquipment } from "../utils/equipmentUtils";
import CustomButton from "./common/CustomButton";
import CustomInput from "./common/CustomInput";
import { COLORS } from "../constants/colors.js";
import { FONTS } from "../constants/fonts.js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { CalendarIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";

Modal.setAppElement("#root");

const styles = {
  modal: {
    content: {
      top: "auto",
      left: "50%",
      right: "auto",
      bottom: "0",
      transform: "translateX(-50%)",
      width: "90%",
      maxWidth: 600,
      maxHeight: "80%",
      borderRadius: "16px 16px 0 0",
      padding: 24,
      backgroundColor: COLORS.white,
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 16,
  },
  divider: {
    borderTop: "1px solid #e0e0e0",
    margin: "16px 0",
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 8,
  },
  picker: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    border: `1px solid ${COLORS.gray}`,
    fontSize: 16,
    fontFamily: FONTS.regularInter,
    backgroundColor: COLORS.background,
  },
  datePickerContainer: {
    display: "flex",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  datePickerText: {
    fontSize: 16,
    color: COLORS.text,
    fontFamily: FONTS.regularInter,
    marginLeft: 12,
    flex: 1,
  },
  priceRangeContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  priceInput: {
    flex: 1,
    margin: "0 8px",
  },
  applyButton: {
    marginBottom: 16,
  },
  clearButton: {
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.gray}`,
    marginBottom: 16,
  },
  clearButtonText: {
    color: COLORS.text,
  },
  cancelButton: {
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.gray}`,
  },
  cancelButtonText: {
    color: COLORS.text,
  },
};

const OrderFilterModal = ({
  isVisible,
  onClose,
  onApply,
  currentFilters,
  userId,
}) => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [filters, setFilters] = useState({
    equipmentId: currentFilters.equipmentId || "",
    startDateFrom: currentFilters.startDateFrom || null,
    startDateTo: currentFilters.startDateTo || null,
    endDateFrom: currentFilters.endDateFrom || null,
    endDateTo: currentFilters.endDateTo || null,
    priceMin: currentFilters.priceMin || "",
    priceMax: currentFilters.priceMax || "",
  });

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const list = await getEquipment(userId);
        setEquipmentList(list);
      } catch (error) {
        console.error("Fetch equipment error:", error);
      }
    };
    fetchEquipment();
  }, [userId]);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters = {
      equipmentId: "",
      startDateFrom: null,
      startDateTo: null,
      endDateFrom: null,
      endDateTo: null,
      priceMin: "",
      priceMax: "",
    };
    setFilters(clearedFilters);
    onApply(clearedFilters);
    onClose();
  };

  return (
    <Modal isOpen={isVisible} onRequestClose={onClose} style={styles.modal}>
      <div>
        <h2 style={styles.title}>Filter Orders</h2>
        <div style={styles.pickerContainer}>
          <span style={styles.pickerLabel}>Equipment</span>
          <select
            value={filters.equipmentId}
            onChange={(e) =>
              setFilters({ ...filters, equipmentId: e.target.value })
            }
            style={styles.picker}
          >
            <option value="">All equipment</option>
            {equipmentList.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <hr style={styles.divider} />
        <div style={styles.datePickerContainer}>
          <CalendarIcon width={24} height={24} stroke={COLORS.text} />
          <span style={styles.datePickerText}>
            Start Date From:{" "}
            {filters.startDateFrom
              ? moment(filters.startDateFrom).format("MM/DD/YYYY")
              : "Select date"}
          </span>
          <DatePicker
            selected={filters.startDateFrom}
            onChange={(date) => setFilters({ ...filters, startDateFrom: date })}
            dateFormat="MM/dd/yyyy"
            placeholderText="Select date"
            className="date-picker"
          />
        </div>
        <hr style={styles.divider} />
        <div style={styles.datePickerContainer}>
          <CalendarIcon width={24} height={24} stroke={COLORS.text} />
          <span style={styles.datePickerText}>
            Start Date To:{" "}
            {filters.startDateTo
              ? moment(filters.startDateTo).format("MM/DD/YYYY")
              : "Select date"}
          </span>
          <DatePicker
            selected={filters.startDateTo}
            onChange={(date) => setFilters({ ...filters, startDateTo: date })}
            dateFormat="MM/dd/yyyy"
            placeholderText="Select date"
            className="date-picker"
          />
        </div>
        <hr style={styles.divider} />
        <div style={styles.datePickerContainer}>
          <CalendarIcon width={24} height={24} stroke={COLORS.text} />
          <span style={styles.datePickerText}>
            End Date From:{" "}
            {filters.endDateFrom
              ? moment(filters.endDateFrom).format("MM/DD/YYYY")
              : "Select date"}
          </span>
          <DatePicker
            selected={filters.endDateFrom}
            onChange={(date) => setFilters({ ...filters, endDateFrom: date })}
            dateFormat="MM/dd/yyyy"
            placeholderText="Select date"
            className="date-picker"
          />
        </div>
        <hr style={styles.divider} />
        <div style={styles.datePickerContainer}>
          <CalendarIcon width={24} height={24} stroke={COLORS.text} />
          <span style={styles.datePickerText}>
            End Date To:{" "}
            {filters.endDateTo
              ? moment(filters.endDateTo).format("MM/DD/YYYY")
              : "Select date"}
          </span>
          <DatePicker
            selected={filters.endDateTo}
            onChange={(date) => setFilters({ ...filters, endDateTo: date })}
            dateFormat="MM/dd/yyyy"
            placeholderText="Select date"
            className="date-picker"
          />
        </div>
        <hr style={styles.divider} />
        <div style={styles.priceRangeContainer}>
          <CustomInput
            label="Min Price"
            value={filters.priceMin}
            onChangeText={(value) =>
              setFilters({ ...filters, priceMin: value })
            }
            icon={
              <CurrencyDollarIcon width={24} height={24} stroke={COLORS.text} />
            }
            placeholder="Min price"
            type="number"
            style={styles.priceInput}
          />
          <CustomInput
            label="Max Price"
            value={filters.priceMax}
            onChangeText={(value) =>
              setFilters({ ...filters, priceMax: value })
            }
            icon={
              <CurrencyDollarIcon width={24} height={24} stroke={COLORS.text} />
            }
            placeholder="Max price"
            type="number"
            style={styles.priceInput}
          />
        </div>
        <CustomButton
          title="Apply Filters"
          onPress={handleApply}
          style={styles.applyButton}
        />
        <CustomButton
          title="Clear Filters"
          onPress={handleClear}
          style={styles.clearButton}
          textStyle={styles.clearButtonText}
        />
        <CustomButton
          title="Cancel"
          onPress={onClose}
          style={styles.cancelButton}
          textStyle={styles.cancelButtonText}
        />
      </div>
    </Modal>
  );
};

export default OrderFilterModal;
