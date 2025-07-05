import React, { useState, useEffect } from "react";
import CustomInput from "../components/common/CustomInput";
import CustomModal from "../components/common/CustomModal";
import CustomButton from "../components/common/CustomButton";
import { COLORS } from "../constants/colors.js";
import { FONTS } from "../constants/fonts.js";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  addAction,
  updateAction,
  deleteAction,
  getActions,
} from "../utils/actionUtils";
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
    maxWidth: "100%",
    margin: "0 auto",
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
  actionItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    width: "100%",
  },
  actionInfo: {
    flex: 1,
  },
  actionName: {
    fontSize: 18,
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  actionDescription: {
    fontSize: 14,
    color: COLORS.text,
    fontFamily: FONTS.regularInter,
  },
  divider: {
    borderTop: "1px solid #e0e0e0",
    margin: "8px 0",
  },
  actionDetails: {
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
  priceInputContainer: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    height: 40,
  },
  selectContainer: {
    flex: 1,
    display: "flex",
    alignItems: "center",
  },
  select: {
    width: "100%",
    height: "100%",
    padding: 8,
    borderRadius: 8,
    border: `1px solid ${COLORS.gray}`,
    fontSize: 16,
    fontFamily: FONTS.regularInter,
  },
  priceInput: {
    flex: 1,
    height: "100%",
  },
  addPriceButton: {
    padding: 8,
    cursor: "pointer",
    height: "100%",
    display: "flex",
    alignItems: "center",
  },
  priceList: {
    marginBottom: 16,
  },
  priceItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 14,
    color: COLORS.text,
    fontFamily: FONTS.regularInter,
    marginBottom: 8,
  },
  editPriceButton: {
    padding: 4,
    cursor: "pointer",
  },
  modalContent: {
    maxHeight: "70vh",
    overflowY: "auto",
    paddingRight: 8,
  },
  loader: {
    marginVertical: 24,
    textAlign: "center",
  },
};

const AdminActionManagementScreen = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [actions, setActions] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isPriceModalVisible, setPriceModalVisible] = useState(false);
  const [editingAction, setEditingAction] = useState(null);
  const [editingPriceAction, setEditingPriceAction] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [prices, setPrices] = useState({
    bag: "",
    gallon: "",
    hour: "",
    trip: "",
    day: "",
  });
  const [unit, setUnit] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [editPriceUnit, setEditPriceUnit] = useState("");
  const [editPriceValue, setEditPriceValue] = useState("");
  const [roles, setRoles] = useState({
    isDriver: false,
    isEquipmentMan: false,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const units = ["bag", "gallon", "hour", "trip", "day"];

  const handleSignOut = async () => {
    const success = await signOut();
    if (success) {
      navigate("/");
    } else {
      alert("Failed to sign out. Please try again.");
    }
  };

  const fetchActions = async () => {
    try {
      const actionList = await getActions();
      setActions(actionList);
    } catch (error) {
      alert("Failed to fetch actions");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const handleAddPrice = () => {
    if (!unit || !priceInput) {
      alert("Please select a unit and enter a price");
      return;
    }
    const priceValue = parseFloat(priceInput);
    if (isNaN(priceValue) || priceValue < 0) {
      alert("Please enter a valid price");
      return;
    }
    setPrices((prev) => ({ ...prev, [unit]: priceValue }));
    setPriceInput("");
  };

  const handleEditPriceInModal = (unit) => {
    setEditPriceUnit(unit);
    setEditPriceValue(prices[unit]?.toString() || "");
    setPriceModalVisible(true);
  };

  const handleSavePrice = async () => {
    if (!editPriceUnit || !editPriceValue) {
      alert("Please select a unit and enter a price");
      return;
    }
    const priceValue = parseFloat(editPriceValue);
    if (isNaN(priceValue) || priceValue < 0) {
      alert("Please enter a valid price");
      return;
    }
    if (editingPriceAction) {
      // Editing from action list
      setLoading(true);
      try {
        const updatedPrices = {
          ...editingPriceAction.prices,
          [editPriceUnit]: priceValue,
        };
        await updateAction(editingPriceAction.id, {
          ...editingPriceAction,
          prices: updatedPrices,
        });
        alert("Price updated successfully");
        setPriceModalVisible(false);
        setEditPriceUnit("");
        setEditPriceValue("");
        setEditingPriceAction(null);
        await fetchActions();
      } catch (error) {
        alert("Error: " + error.message);
      } finally {
        setLoading(false);
      }
    } else {
      // Editing within modal
      setPrices((prev) => ({ ...prev, [editPriceUnit]: priceValue }));
      setPriceModalVisible(false);
      setEditPriceUnit("");
      setEditPriceValue("");
    }
  };

  const handleSaveAction = async () => {
    if (!name || !description || !unit) {
      alert("Please fill in name, description, and unit");
      return;
    }
    if (!prices[unit] || prices[unit] === "") {
      alert(`Please add a price for ${unit}`);
      return;
    }
    setLoading(true);
    try {
      const actionData = {
        name,
        description,
        prices,
        unit,
        roles,
      };
      if (editingAction) {
        await updateAction(editingAction.id, actionData);
        alert("Action updated successfully");
      } else {
        await addAction(actionData);
        alert("Action added successfully");
      }
      setName("");
      setDescription("");
      setPrices({ bag: "", gallon: "", hour: "", trip: "", day: "" });
      setUnit("");
      setPriceInput("");
      setRoles({ isDriver: false, isEquipmentMan: false });
      setEditingAction(null);
      setModalVisible(false);
      await fetchActions();
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAction = (action) => {
    setEditingAction(action);
    setName(action.name);
    setDescription(action.description);
    setPrices(
      action.prices || { bag: "", gallon: "", hour: "", trip: "", day: "" }
    );
    setUnit(action.unit || "");
    setRoles(action.roles);
    setPriceInput("");
    setModalVisible(true);
  };

  const handleEditPrice = (action, unit) => {
    setEditingPriceAction(action);
    setEditPriceUnit(unit);
    setEditPriceValue(action.prices[unit]?.toString() || "");
    setPriceModalVisible(true);
  };

  const handleDeleteAction = async (id) => {
    try {
      await deleteAction(id);
      alert("Action deleted successfully");
      await fetchActions();
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const renderActionItem = (item) => (
    <div style={styles.actionItem} key={item.id}>
      <div style={styles.actionInfo}>
        <span style={styles.actionName}>{item.name}</span>
        <hr style={styles.divider} />
        <span style={styles.actionDescription}>{item.description}</span>
        <hr style={styles.divider} />
        <span style={styles.actionDetails}>
          <span style={{ fontFamily: FONTS.bold }}>Selected Price:</span>{" "}
          {item.prices && item.unit && item.prices[item.unit] !== undefined
            ? `$${item.prices[item.unit]} / ${item.unit}`
            : "N/A"}
        </span>
        <hr style={styles.divider} />
        <span style={styles.actionDetails}>
          <span style={{ fontFamily: FONTS.bold }}>All Prices:</span>
          {item.prices
            ? Object.entries(item.prices)
                .filter(([_, price]) => price !== "" && price !== undefined)
                .map(([u, price]) => (
                  <div key={u} style={styles.priceItem}>
                    <span>{`${
                      u.charAt(0).toUpperCase() + u.slice(1)
                    }: $${price}`}</span>
                    <button
                      style={styles.editPriceButton}
                      onClick={() => handleEditPrice(item, u)}
                    >
                      <PencilIcon
                        width={16}
                        height={16}
                        stroke={COLORS.secondary}
                      />
                    </button>
                  </div>
                ))
            : "None"}
        </span>
        <hr style={styles.divider} />
        <span style={styles.actionDetails}>
          <span style={{ fontFamily: FONTS.bold }}>Roles:</span>{" "}
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
        <button onClick={() => handleEditAction(item)}>
          <PencilIcon width={24} height={24} stroke={COLORS.secondary} />
        </button>
        <button
          onClick={() => handleDeleteAction(item.id)}
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
          <h1 style={styles.title}>Action Management</h1>
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
            {actions.length === 0 ? (
              <span style={styles.emptyText}>No actions available</span>
            ) : (
              actions.map(renderActionItem)
            )}
          </div>
        )}
        <button
          style={styles.addButton}
          onClick={() => {
            setEditingAction(null);
            setName("");
            setDescription("");
            setPrices({ bag: "", gallon: "", hour: "", trip: "", day: "" });
            setUnit("");
            setPriceInput("");
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
          title={editingAction ? "Edit Action" : "Add Action"}
        >
          <div style={styles.modalContent}>
            <CustomInput
              label="Action Name"
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
            <hr style={styles.divider} />
            <div style={styles.priceInputContainer}>
              <div style={styles.selectContainer}>
                <select
                  style={styles.select}
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                >
                  <option value="" disabled>
                    Select unit
                  </option>
                  {units.map((u) => (
                    <option key={u} value={u}>
                      {u.charAt(0).toUpperCase() + u.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.priceInput}>
                <CustomInput
                  value={priceInput}
                  onChangeText={setPriceInput}
                  icon="attach-money"
                  type="number"
                  placeholder="Enter price"
                />
              </div>
              <button style={styles.addPriceButton} onClick={handleAddPrice}>
                <PlusIcon width={24} height={24} stroke={COLORS.secondary} />
              </button>
            </div>
            <div style={styles.priceList}>
              {Object.entries(prices)
                .filter(([_, price]) => price !== "" && price !== undefined)
                .map(([u, price]) => (
                  <div key={u} style={styles.priceItem}>
                    <span>{`${
                      u.charAt(0).toUpperCase() + u.slice(1)
                    }: $${price}`}</span>
                    <button
                      style={styles.editPriceButton}
                      onClick={() => handleEditPriceInModal(u)}
                    >
                      <PencilIcon
                        width={16}
                        height={16}
                        stroke={COLORS.secondary}
                      />
                    </button>
                  </div>
                ))}
            </div>
            <hr style={styles.divider} />
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
                loading
                  ? "Saving..."
                  : editingAction
                  ? "Update Action"
                  : "Create Action"
              }
              onPress={handleSaveAction}
              style={styles.button}
              disabled={loading}
            />
          </div>
        </CustomModal>
        <CustomModal
          isVisible={isPriceModalVisible}
          onClose={() => setPriceModalVisible(false)}
          title="Edit Price"
        >
          <div style={styles.modalContent}>
            <div style={styles.selectContainer}>
              <span style={styles.selectLabel}>Unit</span>
              <select
                style={styles.select}
                value={editPriceUnit}
                onChange={(e) => setEditPriceUnit(e.target.value)}
                disabled
              >
                <option value={editPriceUnit}>
                  {editPriceUnit.charAt(0).toUpperCase() +
                    editPriceUnit.slice(1)}
                </option>
              </select>
            </div>
            <CustomInput
              label="Price"
              value={editPriceValue}
              onChangeText={setEditPriceValue}
              icon="attach-money"
              type="number"
              placeholder="Enter price"
            />
            <CustomButton
              title={loading ? "Saving..." : "Update Price"}
              onPress={handleSavePrice}
              style={styles.button}
              disabled={loading}
            />
          </div>
        </CustomModal>
      </div>
    </div>
  );
};

export default AdminActionManagementScreen;
