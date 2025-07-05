import React, { useState, useEffect } from "react";
import CustomInput from "../components/common/CustomInput";
import CustomModal from "../components/common/CustomModal";
import CustomButton from "../components/common/CustomButton";
import { COLORS } from "../constants/colors.js";
import { FONTS } from "../constants/fonts.js";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  addContact,
  updateContact,
  deleteContact,
  getContacts,
} from "../utils/contactUtils";
import {
  UserIcon,
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
  contactItem: {
    display: "flex",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  iconContainer: {
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  contactButtons: {
    display: "flex",
    alignItems: "center",
  },
  deleteButton: {
    marginLeft: 16,
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
  loader: {
    marginVertical: 24,
    textAlign: "center",
  },
  button: {
    marginTop: 16,
  },
};

const AdminContactsManagementScreen = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [name, setName] = useState("");
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

  const fetchContacts = async () => {
    try {
      const contactList = await getContacts();
      setContacts(contactList);
    } catch (error) {
      alert("Failed to fetch contacts");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleSaveContact = async () => {
    if (!name) {
      alert("Please enter a contact name");
      return;
    }
    setLoading(true);
    try {
      if (editingContact) {
        await updateContact(editingContact.id, { name });
        alert("Contact updated successfully");
      } else {
        await addContact({ name });
        alert("Contact added successfully");
      }
      setName("");
      setEditingContact(null);
      setModalVisible(false);
      await fetchContacts(); // Refresh contact list
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setName(contact.name);
    setModalVisible(true);
  };

  const handleDeleteContact = async (id) => {
    try {
      await deleteContact(id);
      alert("Contact deleted successfully");
      await fetchContacts(); // Refresh contact list
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const renderContactItem = (item) => (
    <div style={styles.contactItem} key={item.id}>
      <div style={styles.iconContainer}>
        <UserIcon width={24} height={24} stroke={COLORS.secondary} />
      </div>
      <div style={styles.contactInfo}>
        <span style={styles.contactName}>{item.name}</span>
      </div>
      <div style={styles.contactButtons}>
        <button onClick={() => handleEditContact(item)}>
          <PencilIcon width={24} height={24} stroke={COLORS.secondary} />
        </button>
        <button
          onClick={() => handleDeleteContact(item.id)}
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
          <h1 style={styles.title}>Contact Management</h1>
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
            {contacts.length === 0 ? (
              <span style={styles.emptyText}>No contacts available</span>
            ) : (
              contacts.map(renderContactItem)
            )}
          </div>
        )}
        <button
          style={styles.addButton}
          onClick={() => {
            setEditingContact(null);
            setName("");
            setModalVisible(true);
          }}
          disabled={loading}
        >
          <PlusIcon width={30} height={30} stroke={COLORS.white} />
        </button>
        <CustomModal
          isVisible={isModalVisible}
          onClose={() => setModalVisible(false)}
          title={editingContact ? "Edit Contact" : "Add Contact"}
        >
          <CustomInput
            label="Contact Name"
            value={name}
            onChangeText={setName}
            icon="person"
          />
          <CustomButton
            title={
              loading
                ? "Saving..."
                : editingContact
                ? "Update Contact"
                : "Create Contact"
            }
            onPress={handleSaveContact}
            style={styles.button}
            disabled={loading}
          />
        </CustomModal>
      </div>
    </div>
  );
};

export default AdminContactsManagementScreen;
