import React, { useState, useEffect, useRef } from "react";
import CustomButton from "../components/common/CustomButton";
import CustomInput from "../components/common/CustomInput";
import CustomModal from "../components/common/CustomModal";
import SignatureModal from "../components/common/SignatureModal";
import { COLORS } from "../constants/colors.js";
import { FONTS } from "../constants/fonts.js";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { getContacts } from "../utils/contactUtils";
import { getActions } from "../utils/actionUtils";
import { getJobs } from "../utils/jobUtils";
import {
  saveLog,
  startTimer,
  endTimer,
  getTimer,
  editLog,
} from "../utils/logUtils";
import {
  ArrowLeftOnRectangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const styles = {
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 24,
    overflowY: "auto",
  },
  titleContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
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
    color: COLORS.text,
    marginBottom: 4,
    fontFamily: FONTS.regularInter,
  },
  pickerWrapper: {
    display: "flex",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 8,
    border: `1px solid ${COLORS.gray}`,
  },
  picker: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: COLORS.text,
    border: "none",
    padding: 12,
    fontFamily: FONTS.regularInter,
    width: "100%",
  },
  infoIcon: {
    padding: 12,
    cursor: "pointer",
  },
  signatureContainer: {
    marginBottom: 16,
  },
  signatureButton: {
    marginBottom: 8,
  },
  signaturePreview: {
    width: "100%",
    height: 100,
    border: `1px solid ${COLORS.gray}`,
    borderRadius: 8,
    objectFit: "contain",
  },
  timeToggle: {
    display: "flex",
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    textAlign: "center",
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.gray}`,
    cursor: "pointer",
  },
  activeToggle: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    color: COLORS.white,
  },
  toggleText: {
    fontSize: 16,
    color: COLORS.text,
    fontFamily: FONTS.regularInter,
  },
  timerContainer: {
    marginBottom: 16,
  },
  timerButton: {
    marginBottom: 16,
  },
  manualTimeContainer: {
    marginBottom: 16,
  },
  timeInput: {
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: 8,
    border: `1px solid ${COLORS.gray}`,
  },
  saveButton: {
    marginTop: 16,
    marginBottom: 32,
  },
  infoText: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 16,
    fontFamily: FONTS.regularInter,
  },
  loader: {
    marginVertical: 24,
    textAlign: "center",
  },
  totalPrice: {
    fontSize: 16,
    color: COLORS.text,
    fontFamily: FONTS.boldInter,
    marginBottom: 16,
  },
};

const DriverLogScreen = () => {
  const { user, userType, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [contacts, setContacts] = useState([]);
  const [actions, setActions] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState("");
  const [selectedActionId, setSelectedActionId] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [signature, setSignature] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isManualTime, setIsManualTime] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoContent, setInfoContent] = useState("");
  const [signatureModalVisible, setSignatureModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [editingLogId, setEditingLogId] = useState(null);
  const signatureRef = useRef(null);

  const handleSignOut = async () => {
    const success = await signOut();
    if (success) {
      navigate("/");
    } else {
      alert("Failed to sign out. Please try again.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contactList, actionList, jobList] = await Promise.all([
          getContacts(),
          getActions(),
          getJobs(),
        ]);
        const isDriver = userType === "driver" || userType === "both";
        const isEquipmentMan =
          userType === "equipmentMan" || userType === "both";
        setContacts(contactList);
        setActions(
          actionList.filter(
            (action) =>
              (isDriver && action.roles.isDriver) ||
              (isEquipmentMan && action.roles.isEquipmentMan)
          )
        );
        setJobs(
          jobList.filter(
            (job) =>
              (isDriver && job.roles.isDriver) ||
              (isEquipmentMan && job.roles.isEquipmentMan)
          )
        );
        const timerData = await getTimer(user.uid);
        if (timerData) {
          setIsTimerRunning(true);
          setStartTime(new Date(timerData.startTime));
        }
      } catch (error) {
        alert("Failed to fetch data");
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [user.uid, userType]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const log = params.get("log")
      ? JSON.parse(decodeURIComponent(params.get("log")))
      : null;
    if (log) {
      setEditingLogId(log.id);
      setSelectedContactId(
        contacts.find((c) => c.name === log.contactName)?.id || ""
      );
      setSelectedActionId(
        actions.find((a) => a.name === log.actionName)?.id || ""
      );
      setSelectedJobId(jobs.find((j) => j.name === log.jobName)?.id || "");
      setSelectedUnit(log.unit || "");
      setQuantity(log.quantity?.toString() || "");
      setDescription(log.description);
      setSignature(log.signature || "");
      setStartTime(log.startTime ? new Date(log.startTime) : null);
      setEndTime(log.endTime ? new Date(log.endTime) : null);
      setIsManualTime(!!log.startTime && !!log.endTime);
    }
  }, [location.search, contacts, actions, jobs]);

  const handleStartTimer = async () => {
    const now = new Date();
    setStartTime(now);
    setIsTimerRunning(true);
    try {
      await startTimer(user.uid, now);
    } catch (error) {
      alert("Failed to start timer");
    }
  };

  const handleEndTimer = async () => {
    const now = new Date();
    setEndTime(now);
    setIsTimerRunning(false);
    try {
      await endTimer(user.uid);
    } catch (error) {
      alert("Failed to end timer");
    }
  };

  const handleShowInfo = (content) => {
    setInfoContent(content);
    setInfoModalVisible(true);
  };

  const handleSignature = (signatureData) => {
    if (signatureData) {
      setSignature(signatureData);
    }
  };

  const handleClearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setSignature("");
    }
  };

  const handleSaveSignature = () => {
    if (signatureRef.current) {
      const signatureData = signatureRef.current.toDataURL();
      handleSignature(signatureData);
      setSignatureModalVisible(false);
    } else {
      alert("Signature canvas not ready");
    }
  };

  const openSignatureModal = () => {
    setSignature("");
    handleClearSignature();
    setSignatureModalVisible(true);
  };

  const calculateTotalPrice = () => {
    if (!selectedActionId || !selectedUnit) return 0;
    const action = actions.find((a) => a.id === selectedActionId);
    if (!action || !action.prices[selectedUnit]) return 0;
    const adminPrice = action.prices[selectedUnit];

    if (selectedUnit === "bag" || selectedUnit === "gallon") {
      const qty = parseFloat(quantity) || 0;
      return adminPrice * qty;
    } else if (selectedUnit === "trip") {
      return adminPrice;
    } else if (selectedUnit === "hour" || selectedUnit === "day") {
      if (!startTime || !endTime) return 0;
      const durationMs = endTime - startTime;
      const duration =
        selectedUnit === "hour"
          ? durationMs / (1000 * 60 * 60)
          : durationMs / (1000 * 60 * 60 * 24);
      return adminPrice * duration;
    }
    return 0;
  };

  const handleSaveLog = async () => {
    if (
      !selectedContactId ||
      !selectedActionId ||
      !selectedJobId ||
      !selectedUnit ||
      !description ||
      !signature ||
      (selectedUnit === "bag" && !quantity) ||
      (selectedUnit === "gallon" && !quantity) ||
      ((selectedUnit === "hour" || selectedUnit === "day") &&
        (!startTime || (!endTime && !isTimerRunning)))
    ) {
      alert(
        "Please fill in all required fields, times, and provide a signature"
      );
      return;
    }
    setLoading(true);
    try {
      const selectedContact = contacts.find((c) => c.id === selectedContactId);
      const selectedAction = actions.find((a) => a.id === selectedActionId);
      const selectedJob = jobs.find((j) => j.id === selectedJobId);
      const totalPrice = calculateTotalPrice();
      const logData = {
        driverId: user.uid,
        contactName: selectedContact.name,
        actionName: selectedAction.name,
        jobName: selectedJob.name,
        unit: selectedUnit,
        quantity:
          selectedUnit === "bag" || selectedUnit === "gallon"
            ? parseFloat(quantity)
            : null,
        description,
        totalPrice,
        signature,
        startTime: startTime ? startTime.toISOString() : null,
        endTime: endTime ? endTime.toISOString() : null,
        duration:
          startTime && endTime
            ? selectedUnit === "hour"
              ? (endTime - startTime) / (1000 * 60 * 60)
              : (endTime - startTime) / (1000 * 60 * 60 * 24)
            : 0,
        createdAt: new Date().toISOString(),
      };
      if (editingLogId) {
        await editLog(editingLogId, logData);
        alert("Log updated successfully");
      } else {
        await saveLog(logData);
        alert("Log saved successfully");
      }
      setEditingLogId(null);
      setSelectedContactId("");
      setSelectedActionId("");
      setSelectedJobId("");
      setSelectedUnit("");
      setQuantity("");
      setDescription("");
      setSignature("");
      setStartTime(null);
      setEndTime(null);
      setIsManualTime(false);
      setIsTimerRunning(false);
      handleClearSignature();
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderPicker = (label, value, onChange, items, type) => (
    <div style={styles.pickerContainer}>
      <span style={styles.pickerLabel}>{label}</span>
      <div style={styles.pickerWrapper}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={styles.picker}
        >
          <option value="">Select {label}</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        {type !== "contact" && value && (
          <button
            style={styles.infoIcon}
            onClick={() =>
              handleShowInfo(
                type === "action"
                  ? actions.find((a) => a.id === value).description
                  : jobs.find((j) => j.id === value).description
              )
            }
          >
            <InformationCircleIcon
              width={20}
              height={20}
              stroke={COLORS.secondary}
            />
          </button>
        )}
      </div>
    </div>
  );

  const renderUnitPicker = () => {
    if (!selectedActionId) return null;
    const action = actions.find((a) => a.id === selectedActionId);
    if (!action || !action.prices) return null;
    const availableUnits = Object.keys(action.prices).filter(
      (unit) => action.prices[unit] !== "" && action.prices[unit] !== undefined
    );
    if (availableUnits.length === 0) return null;

    return (
      <div style={styles.pickerContainer}>
        <span style={styles.pickerLabel}>Unit</span>
        <div style={styles.pickerWrapper}>
          <select
            value={selectedUnit}
            onChange={(e) => {
              setSelectedUnit(e.target.value);
              setQuantity("");
            }}
            style={styles.picker}
          >
            <option value="">Select Unit</option>
            {availableUnits.map((unit) => (
              <option key={unit} value={unit}>
                {unit.charAt(0).toUpperCase() + unit.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.safeArea}>
      <div style={styles.container}>
        <div style={styles.titleContainer}>
          <h1 style={styles.title}>
            {editingLogId ? "Edit Log" : "Driver Log"}
          </h1>
          <button onClick={handleSignOut}>
            <ArrowLeftOnRectangleIcon
              width={24}
              height={24}
              stroke={COLORS.error}
            />
          </button>
        </div>
        {fetching ? (
          <div style={styles.loader}>Loading...</div>
        ) : (
          <>
            {renderPicker(
              "Contact",
              selectedContactId,
              setSelectedContactId,
              contacts,
              "contact"
            )}
            <hr style={styles.divider} />
            {renderPicker(
              "Action",
              selectedActionId,
              setSelectedActionId,
              actions,
              "action"
            )}
            <hr style={styles.divider} />
            {renderUnitPicker()}
            {(selectedUnit === "bag" || selectedUnit === "gallon") && (
              <CustomInput
                label="Quantity"
                value={quantity}
                onChangeText={setQuantity}
                icon="hashtag"
                type="number"
                placeholder="Enter quantity"
              />
            )}
            {selectedUnit && (
              <span style={styles.totalPrice}>
                Total Price: ${calculateTotalPrice().toFixed(2)}
              </span>
            )}
            <hr style={styles.divider} />
            {renderPicker("Job", selectedJobId, setSelectedJobId, jobs, "job")}
            <hr style={styles.divider} />
            <span style={styles.sectionTitle}>Details</span>
            <CustomInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              icon="description"
              multiline
            />
            <hr style={styles.divider} />
            <span style={styles.sectionTitle}>Signature</span>
            <div style={styles.signatureContainer}>
              <CustomButton
                title={signature ? "Sign Again" : "Add Signature"}
                onPress={openSignatureModal}
                style={styles.signatureButton}
              />
              {signature && (
                <img
                  src={signature}
                  alt="Signature"
                  style={styles.signaturePreview}
                />
              )}
            </div>
            <hr style={styles.divider} />
            <span style={styles.sectionTitle}>Time</span>
            <div style={styles.timeToggle}>
              <button
                style={{
                  ...styles.toggleButton,
                  ...(isManualTime ? {} : styles.activeToggle),
                }}
                onClick={() => setIsManualTime(false)}
              >
                <span style={styles.toggleText}>Timer</span>
              </button>
              <button
                style={{
                  ...styles.toggleButton,
                  ...(isManualTime ? styles.activeToggle : {}),
                }}
                onClick={() => setIsManualTime(true)}
              >
                <span style={styles.toggleText}>Manual</span>
              </button>
            </div>
            {!isManualTime ? (
              <div style={styles.timerContainer}>
                <CustomButton
                  title={isTimerRunning ? "End Timer" : "Start Timer"}
                  onPress={isTimerRunning ? handleEndTimer : handleStartTimer}
                  style={styles.timerButton}
                  disabled={loading}
                />
                {startTime && (
                  <span style={styles.timeText}>
                    Started: {startTime.toLocaleString()}
                  </span>
                )}
                {endTime && (
                  <span style={styles.timeText}>
                    Ended: {endTime.toLocaleString()}
                  </span>
                )}
              </div>
            ) : (
              <div style={styles.manualTimeContainer}>
                <div style={styles.timeInput}>
                  <span style={styles.pickerLabel}>Start Date and Time</span>
                  <DatePicker
                    selected={startTime}
                    onChange={(date) => setStartTime(date)}
                    showDateSelect
                    showTimeSelect
                    dateFormat="MM/dd/yyyy h:mm aa"
                    className="time-picker"
                    placeholderText="Select start date and time"
                  />
                </div>
                <div style={styles.timeInput}>
                  <span style={styles.pickerLabel}>End Date and Time</span>
                  <DatePicker
                    selected={endTime}
                    onChange={(date) => setEndTime(date)}
                    showDateSelect
                    showTimeSelect
                    dateFormat="MM/dd/yyyy h:mm aa"
                    className="time-picker"
                    placeholderText="Select end date and time"
                  />
                </div>
              </div>
            )}
            <CustomButton
              title={
                loading ? "Saving..." : editingLogId ? "Update Log" : "Save Log"
              }
              onPress={handleSaveLog}
              style={styles.saveButton}
              disabled={loading}
            />
          </>
        )}
        <CustomModal
          isVisible={infoModalVisible}
          onClose={() => setInfoModalVisible(false)}
          title="Description"
        >
          <span style={styles.infoText}>{infoContent}</span>
        </CustomModal>
        <SignatureModal
          isVisible={signatureModalVisible}
          onClose={() => setSignatureModalVisible(false)}
          onSave={handleSaveSignature}
          onClear={handleClearSignature}
          signatureRef={signatureRef}
          onSignature={handleSignature}
        />
      </div>
    </div>
  );
};

export default DriverLogScreen;
