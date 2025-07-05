import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CustomButton from "../components/common/CustomButton";
import { deleteOrder } from "../utils/orderUtils";
import { COLORS } from "../constants/colors.js";
import { FONTS } from "../constants/fonts.js";
import moment from "moment";

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
  detailContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  value: {
    fontSize: 16,
    color: COLORS.text,
    marginTop: 4,
    fontFamily: FONTS.regularInter,
  },
  divider: {
    borderTop: "1px solid #e0e0e0",
    margin: "12px 0",
  },
  editButton: {
    marginTop: 16,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
    marginTop: 8,
    marginBottom: 32,
  },
  deleteButtonText: {
    color: COLORS.white,
  },
};

const OrderDetailScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const order = params.get("order")
    ? JSON.parse(decodeURIComponent(params.get("order")))
    : null;

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await deleteOrder(order.id);
        alert("Order deleted successfully");
        navigate("/create-order?refresh=true");
      } catch (error) {
        alert("Failed to delete order");
      }
    }
  };

  const statusColor =
    {
      Pending: COLORS.orangeColor,
      Active: COLORS.greenColor,
      Completed: COLORS.blueColor,
      Cancelled: COLORS.errorColor,
    }[order?.status] || COLORS.grayColor;

  if (!order) return <div style={styles.container}>No order selected</div>;

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>Order Details</h1>
        <div style={styles.detailContainer}>
          <span style={styles.label}>Client Name:</span>
          <span style={styles.value}>{order.clientName}</span>
        </div>
        <hr style={styles.divider} />
        <div style={styles.detailContainer}>
          <span style={styles.label}>Equipment:</span>
          <span style={styles.value}>{order.equipmentName}</span>
        </div>
        <hr style={styles.divider} />
        <div style={styles.detailContainer}>
          <span style={styles.label}>Description:</span>
          <span style={styles.value}>{order.description}</span>
        </div>
        <hr style={styles.divider} />
        <div style={styles.detailContainer}>
          <span style={styles.label}>Price:</span>
          <span style={styles.value}>${order.price}</span>
        </div>
        <hr style={styles.divider} />
        <div style={styles.detailContainer}>
          <span style={styles.label}>Start Date:</span>
          <span style={styles.value}>
            {moment(order.startDate).format("YYYY-MM-DD")}
          </span>
        </div>
        <hr style={styles.divider} />
        <div style={styles.detailContainer}>
          <span style={styles.label}>Approx. End Date:</span>
          <span style={styles.value}>
            {order.approximateEndDate
              ? moment(order.approximateEndDate).format("YYYY-MM-DD")
              : "N/A"}
          </span>
        </div>
        <hr style={styles.divider} />
        <div style={styles.detailContainer}>
          <span style={styles.label}>Status:</span>
          <span style={{ ...styles.value, color: statusColor }}>
            {order.status}
          </span>
        </div>
        <CustomButton
          title="Edit Order"
          onPress={() =>
            navigate(
              `/create-order/edit?order=${encodeURIComponent(
                JSON.stringify(order)
              )}`
            )
          }
          style={styles.editButton}
        />
        <CustomButton
          title="Delete Order"
          onPress={handleDelete}
          style={styles.deleteButton}
          textStyle={styles.deleteButtonText}
        />
      </div>
    </div>
  );
};

export default OrderDetailScreen;
