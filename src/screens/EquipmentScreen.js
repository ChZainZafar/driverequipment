import React, { useState, useEffect } from "react";
import { COLORS } from "../constants/colors.js";
import { FONTS } from "../constants/fonts.js";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getEquipment, deleteEquipment } from "../utils/equipmentUtils";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    minHeight: "100vh",
    position: "relative",
    // maxWidth: 600,
    margin: "0 auto",
    padding: "0 24px",
    width: "100%",
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
  equipmentItem: {
    display: "flex",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    marginRight: 48,
  },
  equipmentImageContainer: {
    marginRight: 16,
    flexShrink: 0,
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
  },
  equipmentDetails: {
    flex: 1,
  },
  equipmentText: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 4,
    fontFamily: FONTS.regularInter,
  },
  label: {
    fontFamily: FONTS.bold,
  },
  divider: {
    borderTop: "1px solid #e0e0e0",
    margin: "8px 0",
  },
  actionButtons: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    alignItems: "flex-end",
  },
  actionButton: {
    padding: 8,
    cursor: "pointer",
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
  emptyText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: "center",
    marginTop: 24,
    fontFamily: FONTS.regularInter,
  },
  loader: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: "center",
    marginTop: 24,
    fontFamily: FONTS.regularInter,
  },
};

const EquipmentScreen = () => {
  const { user, userType } = useAuth();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || userType !== "admin") return;
    const fetchEquipment = async () => {
      try {
        setLoading(true);
        const equipmentList = await getEquipment();
        setEquipment(equipmentList || []);
        setError(null);
      } catch (error) {
        console.error("Fetch equipment error:", error);
        setError("Failed to load equipment. Please try again.");
        setEquipment([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, [user, userType]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this equipment?")) {
      try {
        await deleteEquipment(id);
        setEquipment(equipment.filter((item) => item.id !== id));
        alert("Equipment deleted successfully");
      } catch (error) {
        alert("Failed to delete equipment");
      }
    }
  };

  const renderEquipmentItem = (item) => (
    <div style={styles.equipmentItem} key={item.id}>
      <div style={styles.equipmentImageContainer}>
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
      <div style={styles.equipmentDetails}>
        <span style={styles.equipmentText}>
          <span style={styles.label}>Name:</span> {item.name}
        </span>
        <hr style={styles.divider} />
        <span style={styles.equipmentText}>
          <span style={styles.label}>Description:</span>{" "}
          {item.description || "N/A"}
        </span>
        <hr style={styles.divider} />
        <span style={styles.equipmentText}>
          <span style={styles.label}>Price:</span> ${item.price || "N/A"}
        </span>
      </div>
      <div style={styles.actionButtons}>
        <button
          style={styles.actionButton}
          onClick={() =>
            navigate(
              `/admin/equipment/add?equipment=${encodeURIComponent(
                JSON.stringify(item)
              )}`
            )
          }
        >
          <PencilIcon width={20} height={20} stroke={COLORS.secondary} />
        </button>
        <button
          style={styles.actionButton}
          onClick={() => handleDelete(item.id)}
        >
          <TrashIcon width={20} height={20} stroke={COLORS.error} />
        </button>
      </div>
    </div>
  );

  if (!user || userType !== "admin") {
    return (
      <div style={styles.loader}>
        <span style={styles.emptyText}>Unauthorized access</span>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.titleContainer}>
        <h1 style={styles.title}>Equipment</h1>
      </div>
      {loading ? (
        <div style={styles.loader}>
          <span style={styles.emptyText}>Loading equipment...</span>
        </div>
      ) : error ? (
        <div style={styles.loader}>
          <span style={styles.errorText}>{error}</span>
        </div>
      ) : equipment.length === 0 ? (
        <div style={styles.loader}>
          <span style={styles.emptyText}>No equipment found</span>
        </div>
      ) : (
        <div>{equipment.map(renderEquipmentItem)}</div>
      )}
      <button
        style={styles.addButton}
        onClick={() => navigate("/admin/equipment/add")}
      >
        <PlusIcon width={30} height={30} stroke={COLORS.white} />
      </button>
    </div>
  );
};

export default EquipmentScreen;
