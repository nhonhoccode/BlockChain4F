import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Badge,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { selectUser } from '../../../store/slices/authSlice';

// Dummy notification data - in a real app this would come from an API
const dummyNotifications = [
  {
    id: 1,
    title: 'Yêu cầu mới đã được chấp nhận',
    description: 'Yêu cầu cấp Giấy khai sinh của bạn đã được chấp nhận.',
    type: 'request',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    link: '/citizen/requests/1',
  },
  {
    id: 2,
    title: 'Giấy tờ đã được phát hành',
    description: 'Giấy khai sinh của bạn đã được phát hành thành công.',
    type: 'document',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    link: '/citizen/documents/1',
  },
  {
    id: 3,
    title: 'Yêu cầu cần bổ sung',
    description: 'Yêu cầu cấp Giấy chứng nhận kết hôn cần bổ sung thông tin.',
    type: 'request',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    link: '/citizen/requests/2',
  },
  {
    id: 4,
    title: 'Đăng ký thành công',
    description: 'Bạn đã đăng ký tài khoản thành công.',
    type: 'system',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    link: '/citizen/profile',
  },
];

const getIconByType = (type) => {
  switch (type) {
    case 'request':
      return <AssignmentIcon color="primary" />;
    case 'document':
      return <DescriptionIcon color="success" />;
    case 'user':
      return <PersonIcon color="info" />;
    case 'system':
      return <InfoIcon color="secondary" />;
    case 'error':
      return <ErrorIcon color="error" />;
    default:
      return <InfoIcon />;
  }
};

const Notifications = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const open = Boolean(anchorEl);
  const unreadCount = notifications.filter(n => !n.read).length;
  
  useEffect(() => {
    // In a real app, we would fetch notifications from an API
    // For now, we'll use the dummy data
    setNotifications(dummyNotifications);
    setLoading(false);
  }, [user]);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationClick = (notification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );
    
    // Navigate to the linked page
    if (notification.link) {
      navigate(notification.link);
    }
    
    handleClose();
  };
  
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };
  
  const formatTime = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
  };

  return (
    <>
      <Tooltip title="Thông báo">
        <IconButton
          color="inherit"
          onClick={handleClick}
          aria-controls={open ? 'notifications-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <Badge badgeContent={unreadCount} color="error">
            {unreadCount > 0 ? <NotificationsActiveIcon /> : <NotificationsIcon />}
          </Badge>
        </IconButton>
      </Tooltip>
      
      <Menu
        id="notifications-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 320,
            maxWidth: 360,
            maxHeight: 480,
            overflow: 'auto',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
            mt: 1.5,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Thông báo</Typography>
          {unreadCount > 0 && (
            <Tooltip title="Đánh dấu tất cả đã đọc">
              <IconButton size="small" onClick={handleMarkAllAsRead}>
                <CheckIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        
        <Divider />
        
        {loading ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2">Đang tải thông báo...</Typography>
          </Box>
        ) : notifications.length > 0 ? (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  alignItems="flex-start"
                  button
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    bgcolor: notification.read ? 'inherit' : 'action.hover',
                    '&:hover': {
                      bgcolor: 'action.selected',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'background.paper' }}>
                      {getIconByType(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle2"
                        color="text.primary"
                        sx={{ fontWeight: notification.read ? 400 : 600 }}
                      >
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ display: 'block' }}
                        >
                          {notification.description}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mt: 0.5 }}
                        >
                          {formatTime(notification.createdAt)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2">Không có thông báo mới</Typography>
          </Box>
        )}
        
        <Box sx={{ p: 1, textAlign: 'center' }}>
          <Typography
            variant="body2"
            color="primary"
            sx={{ cursor: 'pointer' }}
            onClick={() => {
              navigate('/notifications');
              handleClose();
            }}
          >
            Xem tất cả thông báo
          </Typography>
        </Box>
      </Menu>
    </>
  );
};

export default Notifications;
