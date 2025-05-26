import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationService from '../../services/api/notificationService';

// Define the initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

// Async thunks for notification operations
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.getNotifications();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Không thể tải thông báo' });
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      await notificationService.markAsRead(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Không thể đánh dấu thông báo đã đọc' });
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead();
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Không thể đánh dấu tất cả thông báo đã đọc' });
    }
  }
);

// Create the notification slice
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setNotifications: (state, action) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(notification => !notification.is_read).length;
    },
    addNotification: (state, action) => {
      state.notifications = [action.payload, ...state.notifications];
      if (!action.payload.is_read) {
        state.unreadCount += 1;
      }
    },
    updateNotification: (state, action) => {
      // Xử lý đánh dấu tất cả đã đọc
      if (action.payload.type === 'MARK_ALL_AS_READ') {
        state.notifications = state.notifications.map(notification => ({
          ...notification,
          is_read: true
        }));
        state.unreadCount = 0;
        return;
      }
      
      // Xử lý đánh dấu một thông báo đã đọc
      const { id, changes } = action.payload;
      const notification = state.notifications.find(n => n.id === id);
      if (notification) {
        // Nếu thông báo chưa đọc và đang được đánh dấu đã đọc
        if (!notification.is_read && changes.is_read) {
          state.unreadCount -= 1;
        }
        Object.assign(notification, changes);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(notification => !notification.is_read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Không thể tải thông báo';
      })
      
      // Mark as read
      .addCase(markAsRead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.isLoading = false;
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification && !notification.is_read) {
          notification.is_read = true;
          state.unreadCount -= 1;
        }
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Không thể đánh dấu thông báo đã đọc';
      })
      
      // Mark all as read
      .addCase(markAllAsRead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.isLoading = false;
        state.notifications = state.notifications.map(notification => ({
          ...notification,
          is_read: true
        }));
        state.unreadCount = 0;
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Không thể đánh dấu tất cả thông báo đã đọc';
      });
  }
});

// Export actions and reducer
export const { clearError, setNotifications, addNotification, updateNotification } = notificationSlice.actions;
export default notificationSlice.reducer;

// Selectors
export const selectNotifications = (state) => state.notifications.notifications;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectNotificationLoading = (state) => state.notifications.isLoading;
export const selectNotificationError = (state) => state.notifications.error;
