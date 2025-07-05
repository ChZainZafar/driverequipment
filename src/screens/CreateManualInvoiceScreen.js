import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getJobs } from "../utils/jobUtils";
import { getEquipment } from "../utils/equipmentUtils";
import { db, storage } from "../firebase/config";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import CustomButton from "../components/common/CustomButton";
import CustomInput from "../components/common/CustomInput";
import { COLORS } from "../constants/colors.js";
import { FONTS } from "../constants/fonts.js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import {
  XMarkIcon,
  UserIcon,
  DocumentTextIcon,
  CalendarIcon,
  NumberedListIcon,
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
  descriptionInput: {
    height: 120,
  },
  datePickerContainer: {
    display: "flex",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
    border: `1px solid ${COLORS.gray}`,
    marginBottom: 16,
    width: "100%",
    boxSizing: "border-box",
  },
  datePickerText: {
    fontSize: 16,
    color: COLORS.text,
    fontFamily: FONTS.regularInter,
    marginLeft: 12,
    width: 100,
  },
  datePickerInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: COLORS.text,
    border: "none",
    padding: 12,
    fontFamily: FONTS.regularInter,
    width: "100%",
    boxSizing: "border-box",
  },
  saveButton: {
    marginTop: 16,
    marginBottom: 32,
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
};

// Helper function to escape LaTeX special characters
const escapeLatex = (str) => {
  if (!str) return str;
  return str
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/{/g, "\\{")
    .replace(/}/g, "\\}")
    .replace(/~/g, "\\textasciitilde")
    .replace(/\^/g, "\\textasciicircum")
    .replace(/\\/g, "\\textbackslash");
};

const CreateManualInvoiceScreen = () => {
  const { user, userType } = useAuth();
  const navigate = useNavigate();
  const [clientName, setClientName] = useState("");
  const [jobId, setJobId] = useState("");
  const [equipmentId, setEquipmentId] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [jobList, setJobList] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  async function generateInvoicePDF(invoiceData) {
    try {
      const response = await fetch(
        "https://generateinvoicepdf-qm2xue4t5a-uc.a.run.app",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(invoiceData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to generate PDF: ${response.status} - ${errorText}`
        );
      }

      // Get the PDF as a blob
      const pdfBlob = await response.blob();

      // Create a download link for the PDF
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${invoiceData.clientName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("PDF downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate invoice PDF. Please try again.");
    }
  }
  // Log component mount
  useEffect(() => {
    console.log(
      "CreateManualInvoiceScreen mounted, userType:",
      userType,
      "user:",
      user
    );
  }, [userType, user]);

  // Restrict access to equipmentMan or both
  useEffect(() => {
    if (!userType) {
      console.log("No userType, redirecting to /create-order");
      setAlertMessage("User type not loaded. Please log in again.");
      navigate("/create-order");
    } else if (userType !== "equipmentMan" && userType !== "both") {
      console.log("Invalid userType, redirecting:", userType);
      setAlertMessage("Access restricted to equipment men.");
      navigate("/create-order");
    }
  }, [userType, navigate]);

  // Fetch jobs and equipment
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobs, equipment] = await Promise.all([
          getJobs(),
          getEquipment(user?.uid || ""),
        ]);
        console.log("Jobs fetched:", jobs);
        console.log("Equipment fetched:", equipment);
        setJobList(jobs.filter((job) => job.roles?.isEquipmentMan));
        setEquipmentList(equipment);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setAlertMessage("Failed to fetch jobs or equipment");
      }
    };
    if (user?.uid) {
      fetchData();
    } else {
      console.log("No user.uid, skipping fetch");
    }
  }, [user?.uid]);

  // Log invoiceDate changes
  useEffect(() => {
    console.log(
      "invoiceDate:",
      invoiceDate,
      "Formatted:",
      moment(invoiceDate).format("MM/dd/yyyy")
    );
  }, [invoiceDate]);

  const handleSaveInvoice = async () => {
    if (
      !clientName ||
      !jobId ||
      !equipmentId ||
      !description ||
      !price ||
      !invoiceDate
    ) {
      setAlertMessage("Please fill in all required fields");
      return;
    }
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      setAlertMessage("Please enter a valid positive price");
      return;
    }
    const today = moment().startOf("day");
    const selectedInvoiceDate = moment(invoiceDate).startOf("day");
    if (selectedInvoiceDate.isBefore(today)) {
      setAlertMessage("Invoice date cannot be in the past");
      return;
    }

    setLoading(true);
    try {
      const job = jobList.find((j) => j.id === jobId);
      const equip = equipmentList.find((e) => e.id === equipmentId);
      if (!job || !equip) {
        setAlertMessage("Please select a valid job and equipment");
        return;
      }

      const invoiceData = {
        userId: user.uid,
        type: "manual",
        clientName,
        jobId,
        jobName: job.name,
        equipmentId,
        equipmentName: equip.name,
        description,
        price: parseFloat(price),
        invoiceDate: moment(invoiceDate).toISOString(),
        notes: notes || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      generateInvoicePDF(invoiceData);
      // console.log("Sending invoice data:", invoiceData);

      // const response = await fetch(
      //   "https://generateinvoicepdf-qm2xue4t5a-uc.a.run.app",
      //   {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify(invoiceData),
      //   }
      // );

      // console.log(
      //   "Response status:",
      //   response.status,
      //   "Headers:",
      //   response.headers.get("Content-Type")
      // );
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   console.error("Response error:", errorData);
      //   throw new Error(
      //     `HTTP error! Status: ${response.status}, ${errorData.error}`
      //   );
      // }

      // const arrayBuffer = await response.arrayBuffer();
      // const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      // console.log("Blob size:", blob.size, "Type:", blob.type);
      // if (blob.type !== "application/pdf") {
      //   const text = await blob.text();
      //   console.error("Non-PDF response:", text);
      //   throw new Error(`Server did not return a PDF: ${text}`);
      // }

      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement("a");
      // a.href = url;
      // a.download = `invoice-manual-${Date.now()}.pdf`;
      // document.body.appendChild(a);
      // a.click();
      // a.remove();
      // window.URL.revokeObjectURL(url);

      // const docRef = await addDoc(collection(db, "invoices"), invoiceData);
      // const storageRef = ref(storage, `invoices/manual/${docRef.id}.pdf`);
      // await uploadBytes(storageRef, blob);

      // alert("Invoice created and downloaded successfully");
    } catch (error) {
      console.error("Failed to save invoice:", error);
      setAlertMessage(`Error creating invoice: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

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

  const renderEquipmentPicker = () => (
    <div style={styles.pickerContainer}>
      <span style={styles.pickerLabel}>Equipment</span>
      <div style={styles.pickerWrapper}>
        <select
          value={equipmentId}
          onChange={(e) => setEquipmentId(e.target.value)}
          style={styles.picker}
        >
          <option value="">Select Equipment</option>
          {equipmentList.map((equipment) => (
            <option key={equipment.id} value={equipment.id}>
              {equipment.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  // Custom input for DatePicker to match CustomInput styling
  const CustomDateInput = ({ value, onClick }) => (
    <div style={styles.pickerWrapper} onClick={onClick}>
      <input
        type="text"
        value={value}
        readOnly
        style={styles.datePickerInput}
        placeholder="Select date"
      />
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
        <h1 style={styles.title}>Create Manual Invoice</h1>
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
        {renderJobPicker()}
        <hr style={styles.divider} />
        {renderEquipmentPicker()}
        <hr style={styles.divider} />
        <CustomInput
          label="Invoice Description"
          value={description}
          onChangeText={setDescription}
          icon={
            <DocumentTextIcon width={24} height={24} stroke={COLORS.text} />
          }
          placeholder="Enter invoice description"
          multiline
          style={styles.descriptionInput}
        />
        <hr style={styles.divider} />
        <CustomInput
          label="Price"
          value={price}
          onChangeText={setPrice}
          icon={
            <NumberedListIcon width={24} height={24} stroke={COLORS.text} />
          }
          placeholder="Enter price"
          type="number"
        />
        <hr style={styles.divider} />
        <div style={styles.datePickerContainer}>
          <CalendarIcon width={24} height={24} stroke={COLORS.text} />
          <span style={styles.datePickerText}>Invoice Date:</span>
          <DatePicker
            selected={invoiceDate}
            onChange={(date) => setInvoiceDate(date)}
            dateFormat="MM/dd/yyyy"
            placeholderText="Select date"
            minDate={new Date()}
            customInput={<CustomDateInput />}
            withPortal={false}
          />
        </div>
        <hr style={styles.divider} />
        <CustomInput
          label="Notes (Optional)"
          value={notes}
          onChangeText={setNotes}
          icon={
            <DocumentTextIcon width={24} height={24} stroke={COLORS.text} />
          }
          placeholder="Enter any additional notes"
          multiline
          style={styles.descriptionInput}
        />
        <hr style={styles.divider} />
        <CustomButton
          title={loading ? "Saving..." : "Generate Invoice"}
          onPress={handleSaveInvoice}
          style={styles.saveButton}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default CreateManualInvoiceScreen;
