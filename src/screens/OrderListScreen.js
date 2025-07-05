import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { getOrders } from "../utils/orderUtils";
import { COLORS } from "../constants/colors.js";
import { FONTS } from "../constants/fonts.js";
import CustomInput from "../components/common/CustomInput";
import OrderFilterModal from "../components/OrderFilterModal";
import {
  FunnelIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";
import moment from "moment";

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    minHeight: "100vh",
    position: "relative",
  },
  headerContainer: {
    padding: "0 24px 16px",
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
  filterButton: {
    padding: 8,
    cursor: "pointer",
  },
  logoutButton: {
    padding: 8,
    cursor: "pointer",
  },
  resultCount: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 8,
    fontFamily: FONTS.regularInter,
  },
  orderItem: {
    margin: "0 24px 12px",
    borderRadius: 12,
    background: "white",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    cursor: "pointer",
  },
  statusLine: {
    height: 4,
  },
  orderContent: {
    display: "flex",
    padding: 16,
  },
  orderDetails: {
    flex: 1,
  },
  orderText: {
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
  statusContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  statusText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    marginBottom: 8,
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
    zIndex: 1000,
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
  },
};

const OrderListScreen = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const refresh = params.get("refresh") === "true";

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    equipmentId: "",
    startDateFrom: null,
    startDateTo: null,
    endDateFrom: null,
    endDateTo: null,
    priceMin: "",
    priceMax: "",
  });

  const handleSignOut = async () => {
    try {
      const success = await signOut();
      if (success) {
        navigate("/");
      } else {
        alert("Failed to sign out. Please try again.");
      }
    } catch (error) {
      console.error("Sign out error:", error.message, error.stack);
      alert("Failed to sign out: " + error.message);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const orderList = await getOrders(user.uid);
        const validOrders = orderList.filter((order) => order.id);
        if (validOrders.length !== orderList.length) {
          console.warn("Some orders missing IDs:", orderList);
        }
        setOrders(validOrders);
        setFilteredOrders(validOrders);
      } catch (error) {
        console.error("Failed to fetch orders:", error.message, error.stack);
        alert("Failed to fetch orders: " + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
    if (refresh) {
      params.delete("refresh");
      navigate({ search: params.toString() }, { replace: true });
    }
  }, [user.uid, refresh, navigate]);

  useEffect(() => {
    let result = orders;

    if (searchQuery) {
      result = result.filter((order) =>
        order.clientName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.equipmentId) {
      result = result.filter(
        (order) => order.equipmentId === filters.equipmentId
      );
    }
    if (filters.startDateFrom) {
      result = result.filter(
        (order) => order.startDate >= filters.startDateFrom.toISOString()
      );
    }
    if (filters.startDateTo) {
      result = result.filter(
        (order) => order.startDate <= filters.startDateTo.toISOString()
      );
    }
    if (filters.endDateFrom) {
      result = result.filter(
        (order) =>
          order.approximateEndDate &&
          order.approximateEndDate >= filters.endDateFrom.toISOString()
      );
    }
    if (filters.endDateTo) {
      result = result.filter(
        (order) =>
          order.approximateEndDate &&
          order.approximateEndDate <= filters.endDateTo.toISOString()
      );
    }
    if (filters.priceMin) {
      result = result.filter(
        (order) => order.price >= parseFloat(filters.priceMin)
      );
    }
    if (filters.priceMax) {
      result = result.filter(
        (order) => order.price <= parseFloat(filters.priceMax)
      );
    }

    setFilteredOrders(result);
  }, [orders, searchQuery, filters]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#FFA500";
      case "Active":
        return "#0000FF";
      case "Completed":
        return "#008000";
      case "Cancelled":
        return "#FF0000";
      default:
        return COLORS.text;
    }
  };

  const handleNavigateToCreate = () => {
    console.log("Navigating to create order");
    navigate("/create-order/new");
  };

  const renderOrderItem = (item) => {
    if (!item.id) {
      console.warn("Order missing ID:", item);
      return null;
    }
    return (
      <div
        style={styles.orderItem}
        key={item.id}
        onClick={() => {
          console.log("Navigating to edit order:", item.id);
          navigate("/create-order/edit", { state: { order: item } });
        }}
      >
        <div
          style={{
            ...styles.statusLine,
            backgroundColor: getStatusColor(item.status),
          }}
        />
        <div style={styles.orderContent}>
          <div style={styles.orderDetails}>
            <span style={styles.orderText}>
              <span style={styles.label}>Client:</span> {item.clientName}
            </span>
            <hr style={styles.divider} />
            <span style={styles.orderText}>
              <span style={styles.label}>Equipment:</span> {item.equipmentName}
            </span>
            <hr style={styles.divider} />
            <span style={styles.orderText}>
              <span style={styles.label}>Job:</span> {item.jobName || "N/A"}
            </span>
            <hr style={styles.divider} />
            <span style={styles.orderText}>
              <span style={styles.label}>Start Date:</span>{" "}
              {moment(item.startDate).format("MM/DD/YYYY")}
            </span>
            <hr style={styles.divider} />
            <span style={styles.orderText}>
              <span style={styles.label}>Price:</span> ${item.price}
            </span>
          </div>
          <div style={styles.statusContainer}>
            <span
              style={{
                ...styles.statusText,
                color: getStatusColor(item.status),
              }}
            >
              {item.status}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerContainer}>
        <div style={styles.titleContainer}>
          <h1 style={styles.title}>Orders</h1>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              style={styles.filterButton}
              onClick={() => setFilterModalVisible(true)}
            >
              <FunnelIcon width={24} height={24} stroke={COLORS.secondary} />
            </button>
            <button style={styles.logoutButton} onClick={handleSignOut}>
              <ArrowLeftOnRectangleIcon
                width={24}
                height={24}
                stroke={COLORS.error}
              />
            </button>
          </div>
        </div>
        <CustomInput
          placeholder="Search by client name"
          value={searchQuery}
          onChangeText={setSearchQuery}
          icon={
            <MagnifyingGlassIcon width={24} height={24} stroke={COLORS.text} />
          }
        />
        <span style={styles.resultCount}>
          Showing {filteredOrders.length} order
          {filteredOrders.length !== 1 ? "s" : ""}
        </span>
      </div>
      {loading ? (
        <div style={styles.loader}>
          <span style={styles.emptyText}>Loading orders...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div style={styles.loader}>
          <span style={styles.emptyText}>No orders found</span>
        </div>
      ) : (
        <div>{filteredOrders.map(renderOrderItem)}</div>
      )}
      <button style={styles.addButton} onClick={handleNavigateToCreate}>
        <PlusIcon width={30} height={30} stroke={COLORS.white} />
      </button>
      <OrderFilterModal
        isVisible={isFilterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={setFilters}
        currentFilters={filters}
        userId={user.uid}
      />
    </div>
  );
};

export default OrderListScreen;
