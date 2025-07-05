import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { createOrder, updateOrder } from "../utils/orderUtils";
import { getEquipment } from "../utils/equipmentUtils";
import { getJobs } from "../utils/jobUtils";
import CustomButton from "../components/common/CustomButton";
import CustomInput from "../components/common/CustomInput";
import { COLORS } from "../constants/colors.js";
import { FONTS } from "../constants/fonts.js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import {
  XMarkIcon,
  CalendarIcon,
  UserIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    minHeight: "100vh",
  },
  headerContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  closeButton: {
    padding: 8,
    cursor: "pointer",
  },
  content: {
    padding: "0 24px 24px",
    maxWidth: 600,
    margin: "0 auto",
  },
  sectionLabel: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 16,
  },
  divider: {
    borderTop: "1px solid #e0e0e0",
    margin: "16px 0",
  },
  equipmentList: {
    display: "flex",
    overflowX: "auto",
    padding: "8px 0",
  },
  equipmentItem: {
    width: 100,
    marginRight: 12,
    alignItems: "center",
    cursor: "pointer",
  },
  selectedEquipment: {
    border: `2px solid ${COLORS.primary}`,
    borderRadius: 8,
  },
  equipmentImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    objectFit: "cover",
  },
  noImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    fontSize: 12,
    color: COLORS.text,
    textAlign: "center",
    fontFamily: FONTS.regularInter,
  },
  descriptionInput: {
    height: 120,
  },
  datePickerContainer: {
    display: "flex",
    alignItems: "center",
    backgroundColor: COLORS.white,
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
  saveButton: {
    marginTop: 16,
    marginBottom: 32,
  },
  priceText: {
    fontSize: 16,
    color: COLORS.text,
    fontFamily: FONTS.regularInter,
    marginBottom: 16,
  },
  statusContainer: {
    margin: "16px 0",
    position: "relative",
    width: "100%",
  },
  statusLine: {
    position: "relative",
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    marginBottom: 24,
    width: "100%",
  },
  statusPoint: {
    position: "absolute",
    top: -6,
    width: 12,
    height: 12,
    borderRadius: "50%",
    transform: "translateX(-50%)",
    cursor: "pointer",
    zIndex: 2,
  },
  statusArrow: {
    position: "absolute",
    top: -16,
    width: 32,
    height: 32,
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    transition: "left 0.25s ease",
  },
  statusLabels: {
    display: "flex",
    justifyContent: "space-between",
    padding: "0 2px",
  },
  statusLabelText: {
    fontSize: 14,
    fontFamily: "Inter, sans-serif",
    color: "#333",
  },
  alert: {
    padding: 16,
    backgroundColor: COLORS.error,
    color: COLORS.white,
    borderRadius: 8,
    marginBottom: 16,
    fontFamily: FONTS.regularInter,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  alertCloseButton: {
    cursor: "pointer",
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
};

const CreateOrderScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = location.pathname.includes("/edit");
  const order = location.state?.order;

  const [clientName, setClientName] = useState("");
  const [equipmentId, setEquipmentId] = useState("");
  const [jobId, setJobId] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [approximateEndDate, setApproximateEndDate] = useState(null);
  const [status, setStatus] = useState("Pending");
  const [pendingDate, setPendingDate] = useState(null);
  const [completedDate, setCompletedDate] = useState(null);
  const [equipmentList, setEquipmentList] = useState([]);
  const [jobList, setJobList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);

  const statusPositions = ["Pending", "Active", "Completed", "Cancelled"];
  const statusColors = {
    Pending: "#FFA500",
    Active: "#0000FF",
    Completed: "#008000",
    Cancelled: "#FF0000",
  };

  // Clear alert on navigation
  useEffect(() => {
    return () => setAlertMessage(null);
  }, []);

  // Initialize order data
  useEffect(() => {
    if (order && isEditMode) {
      if (!order.id) {
        setAlertMessage("Invalid order data: No order ID provided.");
        return;
      }
      setClientName(order.clientName || "");
      setEquipmentId(order.equipmentId || "");
      setJobId(order.jobId || "");
      setDescription(order.description || "");
      setStartDate(order.startDate ? new Date(order.startDate) : null);
      setApproximateEndDate(
        order.approximateEndDate ? new Date(order.approximateEndDate) : null
      );
      setStatus(order.status || "Pending");
      setPendingDate(order.pendingDate ? new Date(order.pendingDate) : null);
      setCompletedDate(
        order.completedDate ? new Date(order.completedDate) : null
      );
    } else if (isEditMode && !order) {
      setAlertMessage(
        "No order data provided for editing. Please select an order from the list."
      );
      navigate("/create-order", { replace: true });
    }
  }, [order, isEditMode, navigate]);

  // Fetch equipment and jobs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [equipment, jobs] = await Promise.all([
          getEquipment(user.uid),
          getJobs(),
        ]);
        setEquipmentList(equipment);
        // Filter jobs for "equipment man" or "equipment man and driver"
        setJobList(jobs.filter((job) => job.roles?.isEquipmentMan));
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setAlertMessage("Failed to fetch equipment or jobs");
      }
    };
    fetchData();
  }, [user.uid]);

  // Handle status dates
  useEffect(() => {
    if (status === "Pending" && !pendingDate) {
      setPendingDate(new Date());
    } else if (status === "Completed" && !completedDate) {
      setCompletedDate(new Date());
    } else if (status !== "Pending") {
      setPendingDate(null);
    } else if (status !== "Completed") {
      setCompletedDate(null);
    }
  }, [status, pendingDate, completedDate]);

  const calculatePrice = () => {
    if (!equipmentId || !pendingDate || !completedDate || !jobId) return 0;
    const equipment = equipmentList.find((item) => item.id === equipmentId);
    const job = jobList.find((item) => item.id === jobId);
    if (!equipment || !equipment.prices || !job) return 0;

    const { totalCost, daily, weekly, monthly } = equipment.prices;
    const durationMs = completedDate - pendingDate;
    const durationDays = durationMs / (1000 * 60 * 60 * 24);

    let basePrice = 0;
    if (durationDays <= 2.5) {
      basePrice = daily * durationDays;
    } else if (durationDays <= 17.5) {
      basePrice = weekly * (durationDays / 7);
    } else {
      const durationMonths = durationDays / 30;
      basePrice = monthly
        ? monthly * durationMonths
        : weekly * (durationDays / 7);
    }

    // Adjust price based on job type (20% more if requires driver)
    const priceMultiplier = job.roles?.isDriver ? 1.2 : 1;
    return Math.min(basePrice * priceMultiplier, totalCost || Infinity).toFixed(
      2
    );
  };

  const handleSave = async () => {
    if (!clientName || !equipmentId || !jobId || !description || !startDate) {
      setAlertMessage(
        "Please fill in all required fields, including job selection"
      );
      return;
    }

    const today = moment().startOf("day");
    const selectedStartDate = moment(startDate).startOf("day");
    if (selectedStartDate.isBefore(today)) {
      setAlertMessage("Start date cannot be in the past");
      return;
    }

    if (status === "Completed" && (!pendingDate || !completedDate)) {
      setAlertMessage(
        "Pending and Completed dates are required for Completed status"
      );
      return;
    }

    setLoading(true);
    try {
      const equipment = equipmentList.find((item) => item.id === equipmentId);
      const job = jobList.find((item) => item.id === jobId);
      const orderData = {
        userId: user.uid,
        equipmentId,
        equipmentName: equipment?.name || "",
        jobId,
        jobName: job?.name || "",
        clientName,
        description,
        price: status === "Completed" ? parseFloat(calculatePrice()) : 0,
        startDate: startDate.toISOString(),
        approximateEndDate: approximateEndDate
          ? approximateEndDate.toISOString()
          : null,
        status,
        pendingDate: pendingDate ? pendingDate.toISOString() : null,
        completedDate: completedDate ? completedDate.toISOString() : null,
        createdAt: order ? order.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log("Saving order with data:", orderData);

      if (isEditMode) {
        if (!order?.id) {
          throw new Error("Order ID is missing for update");
        }
        await updateOrder(order.id, orderData);
        setAlertMessage("Order updated successfully");
      } else {
        await createOrder(orderData);
        setAlertMessage("Order created successfully");
      }
      navigate("/create-order?refresh=true");
    } catch (error) {
      console.error("Failed to save order:", error.message, error.stack);
      setAlertMessage(`Failed to save order: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderEquipmentItem = (item) => (
    <div
      style={{
        ...styles.equipmentItem,
        ...(equipmentId === item.id ? styles.selectedEquipment : {}),
      }}
      key={item.id}
      onClick={() => setEquipmentId(item.id)}
    >
      {item.images && item.images.length > 0 ? (
        <img
          src={item.images[0]}
          alt="Equipment"
          style={styles.equipmentImage}
        />
      ) : (
        <div style={styles.noImagePlaceholder}>
          <span style={styles.noImageText}>No Image</span>
        </div>
      )}
    </div>
  );

  const renderJobPicker = () => (
    <div style={styles.pickerContainer}>
      <span style={styles.pickerLabel}>Job</span>
      <div style={styles.pickerWrapper}>
        <select
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
          style={styles.picker}
        >
          <option value="">Select Job</option>
          {jobList.map((job) => (
            <option key={job.id} value={job.id}>
              {job.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      {alertMessage && (
        <div style={styles.alert}>
          <span>{alertMessage}</span>
          <button
            style={styles.alertCloseButton}
            onClick={() => setAlertMessage(null)}
          >
            <XMarkIcon width={20} height={20} stroke={COLORS.white} />
          </button>
        </div>
      )}
      <div style={styles.headerContainer}>
        <h1 style={styles.title}>
          {isEditMode ? "Edit Order" : "Create Order"}
        </h1>
        <button
          style={styles.closeButton}
          onClick={() => navigate("/create-order")}
        >
          <XMarkIcon width={24} height={24} stroke={COLORS.text} />
        </button>
      </div>
      <div style={styles.content}>
        <CustomInput
          label="Client Name"
          value={clientName}
          onChangeText={setClientName}
          icon={<UserIcon width={24} height={24} stroke={COLORS.text} />}
          placeholder="Enter client name"
        />
        <hr style={styles.divider} />
        <span style={styles.sectionLabel}>Equipment</span>
        <div style={styles.equipmentList}>
          {equipmentList.map(renderEquipmentItem)}
        </div>
        <hr style={styles.divider} />
        {renderJobPicker()}
        <hr style={styles.divider} />
        <CustomInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          icon={
            <DocumentTextIcon width={24} height={24} stroke={COLORS.text} />
          }
          placeholder="Enter order description"
          multiline
          style={styles.descriptionInput}
        />
        <hr style={styles.divider} />
        {status === "Completed" && equipmentId && jobId && (
          <span style={styles.priceText}>
            Calculated Price: ${calculatePrice()}
          </span>
        )}
        <hr style={styles.divider} />
        <div style={styles.datePickerContainer}>
          <CalendarIcon width={24} height={24} stroke={COLORS.text} />
          <span style={styles.datePickerText}>Start Date:</span>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="MM/dd/yyyy"
            placeholderText="Select date"
            minDate={new Date()}
            className="date-picker"
          />
        </div>
        <div style={styles.datePickerContainer}>
          <CalendarIcon width={24} height={24} stroke={COLORS.text} />
          <span style={styles.datePickerText}>Approx. End Date:</span>
          <DatePicker
            selected={approximateEndDate}
            onChange={(date) => setApproximateEndDate(date)}
            dateFormat="MM/dd/yyyy"
            placeholderText="Select date (optional)"
            className="date-picker"
          />
        </div>
        <hr style={styles.divider} />
        <span style={styles.sectionLabel}>Status</span>
        <div style={styles.statusContainer}>
          <div style={styles.statusLine}>
            {statusPositions.map((s, index) => (
              <div
                key={s}
                style={{
                  ...styles.statusPoint,
                  backgroundColor: statusColors[s],
                  left: `${(index * 100) / (statusPositions.length - 1)}%`,
                }}
                onClick={() => setStatus(statusPositions[index])}
              />
            ))}
            <div
              style={{
                ...styles.statusArrow,
                backgroundColor: statusColors[status],
                left: `${
                  (statusPositions.indexOf(status) * 100) /
                  (statusPositions.length - 1)
                }%`,
                transform: "translateX(-50%)",
              }}
            >
              <ArrowRightIcon width={20} height={20} stroke={COLORS.white} />
            </div>
          </div>
          <div style={styles.statusLabels}>
            {statusPositions.map((label) => (
              <span key={label} style={styles.statusLabelText}>
                {label}
              </span>
            ))}
          </div>
        </div>
        <CustomButton
          title={loading ? "Saving..." : isEditMode ? "Update" : "Save"}
          onPress={handleSave}
          style={styles.saveButton}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default CreateOrderScreen;
