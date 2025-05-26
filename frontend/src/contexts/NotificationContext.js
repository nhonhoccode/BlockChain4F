import React, { createContext, useContext, useState } from 'react';

// Create notification context
const NotificationContext = createContext();

/**
 * NotificationProvider Component - Provides notification context to the app
 */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  /**
   * Add a new notification
   * @param {Object} notification - Notification object
   */
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      read: false,
      timestamp: new Date().toISOString(),
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Log notification for debug
    console.log('New notification:', newNotification);
    
    return newNotification.id;
  };
  
  /**
   * Mark a notification as read
   * @param {string} id - Notification ID
   */
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    
    // Update unread count
    const updatedUnreadCount = notifications.filter(n => !n.read).length - 1;
    setUnreadCount(Math.max(0, updatedUnreadCount));
  };
  
  /**
   * Mark all notifications as read
   */
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };
  
  /**
   * Remove a notification
   * @param {string} id - Notification ID
   */
  const removeNotification = (id) => {
    const notification = notifications.find(n => n.id === id);
    
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    // Update unread count if necessary
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };
  
  // Context value
  const contextValue = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification
  };
  
  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * useNotification hook - Custom hook to use notification context
 * @returns {Object} Notification context
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
