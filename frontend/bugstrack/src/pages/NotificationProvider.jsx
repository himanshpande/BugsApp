import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react";

const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

export default function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback(
    ({ type = "info", message = "", duration = 3000 }) => {
      const id = Date.now();
      setNotifications((prev) => [...prev, { id, type, message }]);
      if (duration !== 0) {
        setTimeout(() => removeNotification(id), duration);
      }
    },
    []
  );

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const value = { showNotification };

  const palette = {
    success: {
      icon: CheckCircle,
      color: "#16a34a",
      bg: "#ecfdf5",
      border: "#a7f3d0",
    },
    error: {
      icon: XCircle,
      color: "#dc2626",
      bg: "#fef2f2",
      border: "#fecaca",
    },
    warning: {
      icon: AlertTriangle,
      color: "#d97706",
      bg: "#fffbeb",
      border: "#fde68a",
    },
    info: {
      icon: Info,
      color: "#2563eb",
      bg: "#eff6ff",
      border: "#bfdbfe",
    },
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}

      {/* 🔔 Notification Container */}
      <div
        className="flex flex-col gap-2 w-80 pointer-events-none"
        style={{
          position: "fixed",
          top: "1.25rem",
          right: "1.25rem",
          zIndex: 99999,
        }}
      >
        <AnimatePresence>
          {notifications.map((note) => {
            const theme = palette[note.type] || palette.info;
            const Icon = theme.icon;

            return (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex items-center gap-3 border rounded-lg px-3 py-2 shadow-sm pointer-events-auto"
                style={{
                  backgroundColor: theme.bg,
                  borderColor: theme.border,
                }}
              >
                <Icon size={18} color={theme.color} />
                <p
                  className="text-sm font-medium leading-tight"
                  style={{ color: theme.color }}
                >
                  {note.message}
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}
