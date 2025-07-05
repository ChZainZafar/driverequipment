import React, { useState, useEffect } from "react";
import CustomButton from "../components/common/CustomButton";
import CustomInput from "../components/common/CustomInput";
import { COLORS } from "../constants/colors.js";
import { FONTS } from "../constants/fonts.js";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { addEquipment, updateEquipment } from "../utils/equipmentUtils.js";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

const IMAGE_SIZE = 80;
const MARGIN = 8;
const IMAGES_PER_ROW = 4;
const TOTAL_WIDTH = "calc(100% - 48px)"; // Account for 24px padding
const PLACEHOLDER_WIDTH = IMAGE_SIZE + MARGIN;

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    minHeight: "100vh",
  },
  content: {
    padding: 24,
    maxWidth: 600,
    margin: "0 auto",
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 8,
  },
  divider: {
    borderTop: "1px solid #e0e0e0",
    margin: "16px 0",
  },
  imageSection: {
    marginBottom: 16,
  },
  imageRow: {
    display: "flex",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  placeholder: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: MARGIN,
    cursor: "pointer",
  },
  imageWrapper: {
    position: "relative",
    marginRight: MARGIN,
    marginBottom: MARGIN,
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 8,
    objectFit: "cover",
  },
  deleteImageButton: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: COLORS.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
  },
  descriptionInput: {
    height: 120,
  },
  saveButton: {
    marginTop: 16,
    marginBottom: 32,
  },
};

const AddEquipmentScreen = () => {
  const { user, userType } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const equipment = params.get("equipment")
    ? JSON.parse(decodeURIComponent(params.get("equipment")))
    : null;

  const [name, setName] = useState(equipment?.name || "");
  const [description, setDescription] = useState(equipment?.description || "");
  const [prices, setPrices] = useState({
    totalCost: equipment?.prices?.totalCost?.toString() || "",
    daily: equipment?.prices?.daily?.toString() || "",
    weekly: equipment?.prices?.weekly?.toString() || "",
    monthly: equipment?.prices?.monthly?.toString() || "",
  });
  const [images, setImages] = useState(equipment?.images || []);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || userType !== "admin") {
      navigate("/admin");
    }
  }, [user, userType, navigate]);

  const handleImagePick = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      const newImageUrls = files.map((file) => URL.createObjectURL(file));
      setImages([...images, ...newImageUrls]);
      setNewImages([...newImages, ...files]);
    }
  };

  const handleDeleteImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedNewImages = newImages.filter(
      (_, i) => i !== index - images.length + newImages.length
    );
    setImages(updatedImages);
    setNewImages(updatedNewImages);
  };

  const handlePriceChange = (key, value) => {
    setPrices((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (
      !name ||
      !description ||
      !prices.totalCost ||
      !prices.daily ||
      !prices.weekly
    ) {
      alert(
        "Please fill in all required fields (Name, Description, Total Cost, Daily Price, Weekly Price)"
      );
      return;
    }
    const totalCost = parseFloat(prices.totalCost);
    const daily = parseFloat(prices.daily);
    const weekly = parseFloat(prices.weekly);
    const monthly = prices.monthly ? parseFloat(prices.monthly) : null;
    if (
      isNaN(totalCost) ||
      totalCost < 0 ||
      isNaN(daily) ||
      daily < 0 ||
      isNaN(weekly) ||
      weekly < 0 ||
      (monthly !== null && (isNaN(monthly) || monthly < 0))
    ) {
      alert("Please enter valid prices");
      return;
    }
    setLoading(true);
    try {
      const equipmentData = {
        name,
        description,
        prices: {
          totalCost,
          daily,
          weekly,
          monthly,
        },
        images: images.filter((img) =>
          img.startsWith("https://firebasestorage.googleapis.com")
        ),
        createdAt: equipment ? equipment.createdAt : new Date().toISOString(),
      };
      if (equipment) {
        await updateEquipment(equipment.id, {
          ...equipmentData,
          newImages,
        });
        alert("Equipment updated successfully");
      } else {
        await addEquipment({
          ...equipmentData,
          newImages,
        });
        alert("Equipment added successfully");
      }
      navigate("/admin/equipment");
    } catch (error) {
      alert("Failed to save equipment");
    } finally {
      setLoading(false);
    }
  };

  const renderImageRow = (rowImages, isFirstRow = false) => (
    <div style={styles.imageRow} key={rowImages[0] || "placeholder"}>
      {isFirstRow && (
        <label style={styles.placeholder}>
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImagePick}
            multiple
          />
          <PlusIcon width={30} height={30} stroke={COLORS.white} />
        </label>
      )}
      {rowImages.map((image, index) => (
        <div key={image} style={styles.imageWrapper}>
          <img src={image} alt="Equipment" style={styles.image} />
          <button
            style={styles.deleteImageButton}
            onClick={() =>
              handleDeleteImage(
                index + (isFirstRow ? 0 : images.length - rowImages.length)
              )
            }
          >
            <XMarkIcon width={20} height={20} stroke={COLORS.white} />
          </button>
        </div>
      ))}
    </div>
  );

  const renderImages = () => {
    const rows = [];
    let currentIndex = 0;

    if (images.length > 0) {
      const firstRowImages = images.slice(0, 3);
      rows.push(renderImageRow(firstRowImages, true));
      currentIndex = 3;
    } else {
      rows.push(renderImageRow([], true));
    }

    while (currentIndex < images.length) {
      const rowImages = images.slice(
        currentIndex,
        currentIndex + IMAGES_PER_ROW
      );
      rows.push(renderImageRow(rowImages));
      currentIndex += IMAGES_PER_ROW;
    }

    return rows;
  };

  if (!user || userType !== "admin") {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>
          {equipment ? "Edit Equipment" : "Add Equipment"}
        </h1>
        <div style={styles.imageSection}>
          <span style={styles.sectionTitle}>Images</span>
          {renderImages()}
        </div>
        <hr style={styles.divider} />
        <CustomInput
          label="Name"
          value={name}
          onChangeText={setName}
          icon="label"
          placeholder="Enter equipment name"
        />
        <hr style={styles.divider} />
        <CustomInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          icon="description"
          placeholder="Enter equipment description"
          multiline
          style={styles.descriptionInput}
        />
        <hr style={styles.divider} />
        <span style={styles.sectionTitle}>Pricing</span>
        <CustomInput
          label="Total Cost"
          value={prices.totalCost}
          onChangeText={(value) => handlePriceChange("totalCost", value)}
          icon="attach-money"
          placeholder="Enter total cost"
          type="number"
        />
        <CustomInput
          label="Daily Price"
          value={prices.daily}
          onChangeText={(value) => handlePriceChange("daily", value)}
          icon="attach-money"
          placeholder="Enter daily price"
          type="number"
        />
        <CustomInput
          label="Weekly Price"
          value={prices.weekly}
          onChangeText={(value) => handlePriceChange("weekly", value)}
          icon="attach-money"
          placeholder="Enter weekly price"
          type="number"
        />
        <CustomInput
          label="Monthly Price (Optional)"
          value={prices.monthly}
          onChangeText={(value) => handlePriceChange("monthly", value)}
          icon="attach-money"
          placeholder="Enter monthly price"
          type="number"
        />
        <CustomButton
          title={loading ? "Saving..." : equipment ? "Update" : "Add"}
          onPress={handleSave}
          style={styles.saveButton}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default AddEquipmentScreen;
