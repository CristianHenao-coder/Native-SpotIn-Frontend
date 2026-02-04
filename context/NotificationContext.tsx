import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'attendance' | 'alert' | 'info';
  isRead: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'isRead'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "¡Asistencia Marcada!",
    message: "Tu asistencia de hoy en Riwi Campus ha sido confirmada.",
    timestamp: "Hace 5 min",
    type: "attendance",
    isRead: false,
  },
  {
    id: "2",
    title: "Recordatorio de Asistencia",
    message: "No olvides marcar tu entrada antes de las 8:15 AM.",
    timestamp: "Hoy, 7:30 AM",
    type: "alert",
    isRead: true,
  },
  {
    id: "3",
    title: "Nivel Riwer - Bronce",
    message: "¡Felicidades! Has alcanzado el nivel Bronce por tu puntualidad.",
    timestamp: "Ayer",
    type: "info",
    isRead: true,
  },
];

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const addNotification = (n: Omit<Notification, 'id' | 'isRead'>) => {
    const newNotification: Notification = {
      ...n,
      id: Date.now().toString(),
      isRead: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      markAsRead, 
      markAllAsRead,
      addNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
