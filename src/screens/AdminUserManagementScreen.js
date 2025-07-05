import React, { useState, useEffect } from "react";
import CustomInput from "../components/common/CustomInput";
import CustomModal from "../components/common/CustomModal";
import CustomButton from "../components/common/CustomButton";
import { COLORS } from "../constants/colors.js";
import { FONTS } from "../constants/fonts.js";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
} from "../utils/authenticationUtils.js";
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
  userItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: 18,
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  divider: {
    borderTop: "1px solid #e0e0e0",
    margin: "8px 0",
  },
  userRoles: {
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
    fontSize: 14,
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  button: {
    marginTop: 16,
  },
  loader: {
    marginVertical: 24,
    textAlign: "center",
  },
};

const AdminUserManagementScreen = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState({
    isDriver: false,
    isEquipmentMan: false,
  });
  const [users, setUsers] = useState([]);
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

  const fetchUsers = async () => {
    try {
      const userList = await getUsers();
      setUsers(userList);
    } catch (error) {
      alert("Failed to fetch users");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSaveUser = async () => {
    if (!email || (!editingUser && !password)) {
      alert("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      if (editingUser) {
        await updateUser(editingUser.id, email, roles);
        alert("User updated successfully");
      } else {
        await createUser(email, password, roles, user.uid);
        alert("User added successfully");
      }
      setEmail("");
      setPassword("");
      setRoles({ isDriver: false, isEquipmentMan: false });
      setEditingUser(null);
      setModalVisible(false);
      await fetchUsers();
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEmail(user.email);
    setRoles(user.roles);
    setPassword("");
    setModalVisible(true);
  };

  const handleDeleteUser = async (id) => {
    try {
      await deleteUser(id);
      alert("User deleted successfully");
      await fetchUsers();
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const renderUserItem = (item) => (
    <div style={styles.userItem} key={item.id}>
      <div style={styles.userInfo}>
        <span style={styles.userEmail}>{item.email}</span>
        <hr style={styles.divider} />
        <span style={styles.userRoles}>
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
        <button onClick={() => handleEditUser(item)}>
          <PencilIcon width={24} height={24} stroke={COLORS.secondary} />
        </button>
        <button
          onClick={() => handleDeleteUser(item.id)}
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
          <h1 style={styles.title}>User Management</h1>
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
        ) : users.length === 0 ? (
          <span style={styles.emptyText}>No users available</span>
        ) : (
          users.map(renderUserItem)
        )}

        {/* Fixed floating plus button */}
        <button
          style={styles.addButton}
          onClick={() => {
            setEditingUser(null);
            setEmail("");
            setPassword("");
            setRoles({ isDriver: false, isEquipmentMan: false });
            setModalVisible(true);
          }}
          disabled={loading}
        >
          <PlusIcon width={30} height={30} stroke={COLORS.white} />
        </button>

        {/* Modal */}
        <CustomModal
          isVisible={isModalVisible}
          onClose={() => setModalVisible(false)}
          title={editingUser ? "Edit User" : "Add New User"}
        >
          <CustomInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            icon="mail"
          />
          {!editingUser && (
            <CustomInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              icon="lock"
            />
          )}
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
                : editingUser
                ? "Update User"
                : "Create User"
            }
            onPress={handleSaveUser}
            style={styles.button}
            disabled={loading}
          />
        </CustomModal>
      </div>
    </div>
  );
};

export default AdminUserManagementScreen;
