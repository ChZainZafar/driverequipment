import React, { useState, useEffect } from "react";
import { COLORS } from "../constants/colors.js";
import { FONTS } from "../constants/fonts.js";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getLogs } from "../utils/logUtils";
import moment from "moment";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const styles = {
  safeArea: {
    flex: 1,
  },
  container: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: COLORS.background,
    padding: 24,
    minHeight: "100vh",
    gap: 24,
  },
  calendarContainer: {
    flex: 0,
    minWidth: 350,
    maxWidth: 400,
    height: "100%",
  },
  calendar: {
    borderRadius: 8,
    border: `1px solid ${COLORS.gray}`,
    width: "100%",
    height: "100%",
  },
  logsContainer: {
    flex: 1,
    overflowY: "auto",
    maxHeight: "calc(100vh - 120px)", // Adjust for nav and padding
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 16,
  },
  logItem: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    cursor: "pointer",
  },
  logInfo: {
    flex: 1,
  },
  logContact: {
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 4,
    fontFamily: FONTS.regularInter,
  },
  logDuration: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginTop: 2,
  },
  logDetail: {
    fontSize: 14,
    color: COLORS.text,
    marginTop: 2,
    fontFamily: FONTS.regularInter,
  },
  divider: {
    borderTop: "1px solid #e0e0e0",
    margin: "8px 0",
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
  "@media (max-width: 768px)": {
    container: {
      flexDirection: "column",
    },
    calendarContainer: {
      minWidth: "100%",
      maxWidth: "100%",
      height: "auto",
    },
    logsContainer: {
      maxHeight: "none",
    },
  },
};

const DriverLogHistoryScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const logList = await getLogs(user.uid);
        setLogs(logList);
      } catch (error) {
        setLogs([]);
      } finally {
        setFetching(false);
      }
    };
    fetchLogs();
  }, [user.uid]);

  const handleDateSelect = async (date) => {
    const dateString = moment(date).format("YYYY-MM-DD");
    setSelectedDate(dateString);
    setLoading(true);
    try {
      const logList = await getLogs(user.uid, dateString);
      setLogs(logList);
    } catch (error) {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditLog = (log) => {
    navigate(`/user/log?log=${encodeURIComponent(JSON.stringify(log))}`);
  };

  const renderLogItem = (item) => (
    <div
      style={styles.logItem}
      key={item.id}
      onClick={() => handleEditLog(item)}
    >
      <div style={styles.logInfo}>
        <span style={styles.logContact}>{item.contactName}</span>
        <hr style={styles.divider} />
        <span style={styles.logDetail}>Action: {item.actionName}</span>
        <hr style={styles.divider} />
        <span style={styles.logDetail}>Job: {item.jobName}</span>
        <hr style={styles.divider} />
        <span style={styles.logDetail}>Price: ${item.pricePerHour}/hr</span>
        <hr style={styles.divider} />
        <span style={styles.logDuration}>
          Duration: {item.duration.toFixed(2)} hrs
        </span>
        <hr style={styles.divider} />
        <span style={styles.logDetail}>
          Date: {moment(item.createdAt).format("MM/DD/YYYY")}
        </span>
      </div>
    </div>
  );

  return (
    <div style={styles.safeArea}>
      <div style={styles.container}>
        <div style={styles.calendarContainer}>
          <h1 style={styles.title}>Log History</h1>
          <Calendar
            onChange={handleDateSelect}
            value={selectedDate ? new Date(selectedDate) : null}
            style={styles.calendar}
            tileClassName={({ date }) =>
              selectedDate === moment(date).format("YYYY-MM-DD")
                ? "selected"
                : ""
            }
          />
        </div>
        <div style={styles.logsContainer}>
          {fetching || loading ? (
            <div style={styles.loader}>Loading...</div>
          ) : (
            <div>
              {logs.length === 0 ? (
                <span style={styles.emptyText}>
                  {selectedDate
                    ? `No logs available for ${moment(selectedDate).format(
                        "MM/DD/YYYY"
                      )}`
                    : "No logs available"}
                </span>
              ) : (
                logs.map(renderLogItem)
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverLogHistoryScreen;
