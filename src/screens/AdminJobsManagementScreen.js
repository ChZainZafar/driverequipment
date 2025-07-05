import React, { useState, useEffect } from "react";
import CustomInput from "../components/common/CustomInput";
import CustomModal from "../components/common/CustomModal";
import CustomButton from "../components/common/CustomButton";
import { COLORS } from "../constants/colors.js";
import { FONTS } from "../constants/fonts.js";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { addJob, updateJob, deleteJob, getJobs } from "../utils/jobUtils";
import {
  TruckIcon,
  WrenchIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftOnRectangleIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

const styles = {
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 24,
    minHeight: "100vh",
  },
  titleContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  jobItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  jobInfo: {
    flex: 1,
  },
  jobName: {
    fontSize: 18,
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  jobDescription: {
    fontSize: 14,
    color: COLORS.text,
    fontFamily: FONTS.regularInter,
  },
  divider: {
    borderTop: "1px solid #e0e0e0",
    margin: "8px 0",
  },
  jobRoles: {
    fontSize: 14,
    color: COLORS.gray,
    fontFamily: FONTS.regularInter,
  },
  actionsContainer: {
    display: "flex",
    alignItems: "center",
  },
  iconContainer: {
    display: "flex",
    marginRight: 12,
  },
  deleteButton: {
    marginLeft: 12,
  },
  addButton: {
    position: "fixed",
    bottom: 24,
    right: 24,
    border: "none",
    borderRadius: 30,
    width: 60,
    height: 60,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundImage: `linear-gradient(to right, ${COLORS.gradientStart}, ${COLORS.gradientEnd})`,
    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
    cursor: "pointer",
    color: COLORS.white,
    padding: 0,
  },
  addButtonGradient: {
    borderRadius: 30,
    width: 60,
    height: 60,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundImage: `linear-gradient(to right, ${COLORS.gradientStart}, ${COLORS.gradientEnd})`,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: "center",
    marginTop: 24,
    fontFamily: FONTS.regularInter,
  },
  switchContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: COLORS.text,
    fontFamily: FONTS.boldInter,
  },
  loader: {
    marginVertical: 24,
    textAlign: "center",
  },
};

const AdminJobsManagementScreen = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [roles, setRoles] = useState({
    isDriver: false,
    isEquipmentMan: false,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const handleSignOut = async () => {
    const success = await signOut();
    if (success) {
      navigate("/");
    } else {
      alert("Failed to sign out. Please try again.");
    }
  };

  const fetchJobs = async () => {
    try {
      const jobList = await getJobs();
      setJobs(jobList);
    } catch (error) {
      alert("Failed to fetch jobs");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSaveJob = async () => {
    if (!name || !description) {
      alert("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      if (editingJob) {
        await updateJob(editingJob.id, { name, description, roles });
        alert("Job updated successfully");
      } else {
        await addJob({ name, description, roles });
        alert("Job added successfully");
      }
      setName("");
      setDescription("");
      setRoles({ isDriver: false, isEquipmentMan: false });
      setEditingJob(null);
      setModalVisible(false);
      await fetchJobs(); // Refresh job list
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setName(job.name);
    setDescription(job.description);
    setRoles(job.roles);
    setModalVisible(true);
  };

  const handleDeleteJob = async (id) => {
    try {
      await deleteJob(id);
      alert("Job deleted successfully");
      await fetchJobs(); // Refresh job list
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const renderJobItem = (item) => (
    <div style={styles.jobItem} key={item.id}>
      <div style={styles.jobInfo}>
        <span style={styles.jobName}>{item.name}</span>
        <hr style={styles.divider} />
        <span style={styles.jobDescription}>{item.description}</span>
        <hr style={styles.divider} />
        <span style={styles.jobRoles}>
          {item.roles.isDriver && item.roles.isEquipmentMan
            ? "Driver & Equipment Man"
            : item.roles.isDriver
            ? "Driver"
            : item.roles.isEquipmentMan
            ? "Equipment Man"
            : "No roles assigned"}
        </span>
      </div>
      <div style={styles.actionsContainer}>
        <div style={styles.iconContainer}>
          {item.roles.isDriver && (
            <TruckIcon width={24} height={24} stroke={COLORS.secondary} />
          )}
          {item.roles.isEquipmentMan && (
            <WrenchIcon width={24} height={24} stroke={COLORS.secondary} />
          )}
        </div>
        <button onClick={() => handleEditJob(item)}>
          <PencilIcon width={24} height={24} stroke={COLORS.secondary} />
        </button>
        <button
          onClick={() => handleDeleteJob(item.id)}
          style={styles.deleteButton}
        >
          <TrashIcon width={24} height={24} stroke={COLORS.error} />
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.safeArea}>
      <div style={styles.container}>
        <div style={styles.titleContainer}>
          <h1 style={styles.title}>Job Management</h1>
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
          <div>
            {jobs.length === 0 ? (
              <span style={styles.emptyText}>No jobs available</span>
            ) : (
              jobs.map(renderJobItem)
            )}
          </div>
        )}
        <button
          style={styles.addButton}
          onClick={() => {
            setEditingJob(null);
            setName("");
            setDescription("");
            setRoles({ isDriver: false, isEquipmentMan: false });
            setModalVisible(true);
          }}
          disabled={loading}
        >
          <PlusIcon width={30} height={30} stroke={COLORS.white} />
        </button>
        <CustomModal
          isVisible={isModalVisible}
          onClose={() => setModalVisible(false)}
          title={editingJob ? "Edit Job" : "Add Job"}
        >
          <CustomInput
            label="Job Name"
            value={name}
            onChangeText={setName}
            icon="label"
          />
          <CustomInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            icon="description"
          />
          <div style={styles.switchContainer}>
            <span style={styles.switchLabel}>Driver</span>
            <input
              type="checkbox"
              checked={roles.isDriver}
              onChange={(e) =>
                setRoles({ ...roles, isDriver: e.target.checked })
              }
              style={{ cursor: "pointer" }}
            />
          </div>
          <div style={styles.switchContainer}>
            <span style={styles.switchLabel}>Equipment Man</span>
            <input
              type="checkbox"
              checked={roles.isEquipmentMan}
              onChange={(e) =>
                setRoles({ ...roles, isEquipmentMan: e.target.checked })
              }
              style={{ cursor: "pointer" }}
            />
          </div>
          <CustomButton
            title={
              loading ? "Saving..." : editingJob ? "Update Job" : "Create Job"
            }
            onPress={handleSaveJob}
            style={styles.button}
            disabled={loading}
          />
        </CustomModal>
      </div>
    </div>
  );
};

export default AdminJobsManagementScreen;
