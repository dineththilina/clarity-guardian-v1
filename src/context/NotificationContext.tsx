
import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { WaterQualityData } from "@/types/water-quality";

const generateUUID = () =>
  ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );

export type NotificationType = "warning" | "danger" | "info";

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
  read: boolean;
}

type NotificationAction =
  | { type: "ADD_NOTIFICATION"; payload: Omit<Notification, "id" | "timestamp" | "read"> }
  | { type: "MARK_AS_READ"; payload: string }
  | { type: "MARK_ALL_AS_READ" }
  | { type: "REMOVE_NOTIFICATION"; payload: string }
  | { type: "CLEAR_ALL" };

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const notificationReducer = (state: Notification[], action: NotificationAction): Notification[] => {
  switch (action.type) {
    case "ADD_NOTIFICATION":
      return [
        {
          id: generateUUID(),
          timestamp: new Date(),
          read: false,
          ...action.payload,
        },
        ...state,
      ];
    case "MARK_AS_READ":
      return state.map((notification) =>
        notification.id === action.payload
          ? { ...notification, read: true }
          : notification
      );
    case "MARK_ALL_AS_READ":
      return state.map((notification) => ({ ...notification, read: true }));
    case "REMOVE_NOTIFICATION":
      return state.filter((notification) => notification.id !== action.payload);
    case "CLEAR_ALL":
      return [];
    default:
      return state;
  }
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, dispatch] = useReducer(notificationReducer, []);

  const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    dispatch({ type: "ADD_NOTIFICATION", payload: notification });
  };

  const markAsRead = (id: string) => {
    dispatch({ type: "MARK_AS_READ", payload: id });
  };

  const markAllAsRead = () => {
    dispatch({ type: "MARK_ALL_AS_READ" });
  };

  const removeNotification = (id: string) => {
    dispatch({ type: "REMOVE_NOTIFICATION", payload: id });
  };

  const clearAll = () => {
    dispatch({ type: "CLEAR_ALL" });
  };

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

export const generateWaterQualityNotification = (
  data: WaterQualityData,
  parameter: keyof Omit<WaterQualityData, "timestamp">,
  status: "warning" | "danger"
): Omit<Notification, "id" | "timestamp" | "read"> => {
  const parameterName = {
    ph: "pH",
    turbidity: "Turbidity",
    tds: "Total Dissolved Solids",
    temperature: "Temperature",
    conductivity: "Conductivity",
    dissolvedOxygen: "Dissolved Oxygen",
  }[parameter];

  const value = data[parameter];
  
  return {
    message: `${parameterName} level ${status === "danger" ? "critical" : "warning"}: ${value}`,
    type: status,
  };
};
