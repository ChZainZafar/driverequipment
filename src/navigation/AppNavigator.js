import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  useNavigate,
} from "react-router-dom";
import LoginScreen from "../screens/LoginScreen";
import AdminUserManagementScreen from "../screens/AdminUserManagementScreen";
import AdminActionManagementScreen from "../screens/AdminActionManagementScreen";
import AdminContactsManagementScreen from "../screens/AdminContactsManagementScreen";
import DriverLogScreen from "../screens/DriverLogScreen";
import DriverLogHistoryScreen from "../screens/DriverLogHistoryScreen";
import EquipmentScreen from "../screens/EquipmentScreen";
import AddEquipmentScreen from "../screens/AddEquipmentScreen";
import OrderListScreen from "../screens/OrderListScreen";
import CreateOrderScreen from "../screens/CreateOrderScreen";
import OrderDetailScreen from "../screens/OrderDetailScreen";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../constants/colors.js";
import AdminJobsManagementScreen from "../screens/AdminJobsManagementScreen.js";
import CreateManualInvoiceScreen from "../screens/CreateManualInvoiceScreen.js";

const styles = {
  nav: {
    backgroundColor: COLORS.primary,
    padding: 12,
  },
  navList: {
    display: "flex",
    gap: 16,
    justifyContent: "center",
  },
  navItem: {
    color: "black",
    textDecoration: "none",
    padding: "8px 16px",
    borderRadius: 8,
  },
  navItemActive: {
    backgroundColor: COLORS.secondary,
  },
};

const AdminRedirect = () => {
  const navigate = useNavigate();
  const { user, userType } = useAuth();

  useEffect(() => {
    if (user && userType === "admin") {
      navigate("/admin/users", { replace: true });
    }
  }, [user, userType, navigate]);

  return null;
};

const UserRedirect = () => {
  const navigate = useNavigate();
  const { user, userType } = useAuth();

  useEffect(() => {
    if (user && userType !== "admin") {
      if (userType === "driver" || userType === "both") {
        navigate("/user/log", { replace: true });
      } else if (userType === "equipmentMan") {
        navigate("/create-order", { replace: true });
      }
    }
  }, [user, userType, navigate]);

  return null;
};

const AppNavigator = () => {
  const { user, userType } = useAuth();

  return (
    <Router>
      <div style={{ minHeight: "100vh", backgroundColor: COLORS.background }}>
        {user && (
          <nav style={styles.nav}>
            <ul style={styles.navList}>
              {userType === "admin" ? (
                <>
                  <li>
                    <NavLink
                      to="/admin/users"
                      style={({ isActive }) => ({
                        ...styles.navItem,
                        ...(isActive ? styles.navItemActive : {}),
                      })}
                    >
                      User Management
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/jobs"
                      style={({ isActive }) => ({
                        ...styles.navItem,
                        ...(isActive ? styles.navItemActive : {}),
                      })}
                    >
                      Jobs Management
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/actions"
                      style={({ isActive }) => ({
                        ...styles.navItem,
                        ...(isActive ? styles.navItemActive : {}),
                      })}
                    >
                      Actions Management
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/contacts"
                      style={({ isActive }) => ({
                        ...styles.navItem,
                        ...(isActive ? styles.navItemActive : {}),
                      })}
                    >
                      Contacts Management
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/equipment"
                      style={({ isActive }) => ({
                        ...styles.navItem,
                        ...(isActive ? styles.navItemActive : {}),
                      })}
                    >
                      Equipment
                    </NavLink>
                  </li>
                </>
              ) : (
                <>
                  {(userType === "driver" || userType === "both") && (
                    <>
                      <li>
                        <NavLink
                          to="/user/log"
                          style={({ isActive }) => ({
                            ...styles.navItem,
                            ...(isActive ? styles.navItemActive : {}),
                          })}
                        >
                          Driver Log
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/user/log-history"
                          style={({ isActive }) => ({
                            ...styles.navItem,
                            ...(isActive ? styles.navItemActive : {}),
                          })}
                        >
                          Log History
                        </NavLink>
                      </li>
                    </>
                  )}
                  {(userType === "equipmentMan" || userType === "both") && (
                    <>
                      <li>
                        <NavLink
                          to="/create-order"
                          style={({ isActive }) => ({
                            ...styles.navItem,
                            ...(isActive ? styles.navItemActive : {}),
                          })}
                        >
                          Orders
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/create-manual-invoice"
                          style={({ isActive }) => ({
                            ...styles.navItem,
                            ...(isActive ? styles.navItemActive : {}),
                          })}
                        >
                          Invoice
                        </NavLink>
                      </li>
                    </>
                  )}
                </>
              )}
            </ul>
          </nav>
        )}
        <Routes>
          {!user ? (
            <Route path="/" element={<LoginScreen />} />
          ) : userType === "admin" ? (
            <>
              <Route
                path="/admin/users"
                element={<AdminUserManagementScreen />}
              />
              <Route
                path="/admin/jobs"
                element={<AdminJobsManagementScreen />}
              />
              <Route
                path="/admin/actions"
                element={<AdminActionManagementScreen />}
              />
              <Route
                path="/admin/contacts"
                element={<AdminContactsManagementScreen />}
              />
              <Route path="/admin/equipment" element={<EquipmentScreen />} />
              <Route
                path="/admin/equipment/add"
                element={<AddEquipmentScreen />}
              />
              <Route path="/admin" element={<AdminRedirect />} />
              <Route path="/" element={<AdminRedirect />} />
            </>
          ) : (
            <>
              {(userType === "driver" || userType === "both") && (
                <>
                  <Route path="/user/log" element={<DriverLogScreen />} />
                  <Route
                    path="/user/log-history"
                    element={<DriverLogHistoryScreen />}
                  />
                </>
              )}
              {(userType === "equipmentMan" || userType === "both") && (
                <>
                  <Route path="/create-order" element={<OrderListScreen />} />
                  <Route
                    path="/create-order/new"
                    element={<CreateOrderScreen />}
                  />
                  <Route
                    path="/create-order/edit"
                    element={<CreateOrderScreen />}
                  />
                  <Route
                    path="/order-detail/:id"
                    element={<OrderDetailScreen />}
                  />
                  <Route
                    path="/create-manual-invoice"
                    element={<CreateManualInvoiceScreen />}
                  />
                </>
              )}
              <Route path="/user" element={<UserRedirect />} />

              <Route path="/" element={<UserRedirect />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
};

export default AppNavigator;
