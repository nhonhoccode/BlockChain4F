import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Chip,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Breadcrumbs,
  Link
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import viLocale from 'date-fns/locale/vi';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Assignment as AssignmentIcon,
  Check as CheckIcon,
  Save as SaveIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarIcon,
  Flag as FlagIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import PrimaryButton from '../../../../components/common/Buttons/PrimaryButton';
import SecondaryButton from '../../../../components/common/Buttons/SecondaryButton';
import officerService from '../../../../services/api/officerService';
import styles from './OfficerManagement.module.scss';

// Danh sách ưu tiên nhiệm vụ
const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Thấp', color: '#4caf50' },
  { value: 'medium', label: 'Trung bình', color: '#ff9800' },
  { value: 'high', label: 'Cao', color: '#f44336' }
];

// Danh sách loại nhiệm vụ
const TASK_TYPES = [
  { value: 'document_processing', label: 'Xử lý hồ sơ' },
  { value: 'citizen_support', label: 'Hỗ trợ công dân' },
  { value: 'field_work', label: 'Công tác thực địa' },
  { value: 'administrative', label: 'Hành chính nội bộ' },
  { value: 'meeting', label: 'Họp/Hội nghị' },
  { value: 'training', label: 'Đào tạo/Tập huấn' },
  { value: 'reporting', label: 'Báo cáo/Thống kê' },
  { value: 'other', label: 'Khác' }
];

const AssignTasksPage = () => {
  const { officerId } = useParams();
  const navigate = useNavigate();
  
  // State cho thông tin cán bộ
  const [officer, setOfficer] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State cho form thêm nhiệm vụ
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: null,
    priority: 'medium',
    type: 'document_processing'
  });
  
  // State cho danh sách nhiệm vụ
  const [tasks, setTasks] = useState([]);
  const [taskLoading, setTaskLoading] = useState(false);
  
  // State cho lỗi
  const [errors, setErrors] = useState({});
  
  // State cho dialog chỉnh sửa
  const [editingTask, setEditingTask] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  
  // State cho thông báo
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // State cho trạng thái đang xử lý
  const [submitting, setSubmitting] = useState(false);
  
  // Lấy thông tin cán bộ và danh sách nhiệm vụ hiện tại
  useEffect(() => {
    const fetchOfficerAndTasks = async () => {
      setLoading(true);
      try {
        // Lấy thông tin cán bộ
        const officerData = await officerService.getOfficerDetail(officerId);
        setOfficer(officerData);
        
        // Lấy danh sách nhiệm vụ
        const tasksData = await officerService.getOfficerTasks(officerId);
        setTasks(tasksData.results || []);
      } catch (error) {
        console.error('Lỗi khi tải thông tin:', error);
        showNotification('Không thể tải thông tin cán bộ và nhiệm vụ', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOfficerAndTasks();
  }, [officerId]);
  
  // Hiển thị thông báo
  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };
  
  // Xử lý đóng thông báo
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };
  
  // Thay đổi giá trị form thêm nhiệm vụ
  const handleNewTaskChange = (e) => {
    const { name, value } = e.target;
    setNewTask({
      ...newTask,
      [name]: value
    });
    
    // Xóa lỗi khi người dùng sửa
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Thay đổi ngày hạn
  const handleDueDateChange = (date) => {
    setNewTask({
      ...newTask,
      dueDate: date
    });
    
    // Xóa lỗi ngày
    if (errors.dueDate) {
      setErrors({
        ...errors,
        dueDate: ''
      });
    }
  };
  
  // Kiểm tra form hợp lệ
  const validateForm = () => {
    const newErrors = {};
    
    if (!newTask.title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề nhiệm vụ';
    }
    
    if (!newTask.description.trim()) {
      newErrors.description = 'Vui lòng nhập mô tả nhiệm vụ';
    }
    
    if (!newTask.dueDate) {
      newErrors.dueDate = 'Vui lòng chọn ngày hạn';
    } else if (new Date(newTask.dueDate) < new Date()) {
      newErrors.dueDate = 'Ngày hạn phải lớn hơn ngày hiện tại';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Xử lý thêm nhiệm vụ mới
  const handleAddTask = async () => {
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    try {
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        due_date: newTask.dueDate.toISOString(),
        priority: newTask.priority,
        type: newTask.type
      };
      
      const response = await officerService.assignTasks(officerId, taskData);
      
      // Thêm nhiệm vụ mới vào danh sách
      setTasks([response, ...tasks]);
      
      // Reset form
      setNewTask({
        title: '',
        description: '',
        dueDate: null,
        priority: 'medium',
        type: 'document_processing'
      });
      
      showNotification('Thêm nhiệm vụ mới thành công', 'success');
    } catch (error) {
      console.error('Lỗi khi thêm nhiệm vụ mới:', error);
      showNotification('Không thể thêm nhiệm vụ mới', 'error');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Mở dialog chỉnh sửa
  const handleOpenEditDialog = (task) => {
    setEditingTask({
      ...task,
      dueDate: new Date(task.due_date)
    });
    setOpenEditDialog(true);
  };
  
  // Đóng dialog chỉnh sửa
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditingTask(null);
  };
  
  // Thay đổi giá trị trong dialog chỉnh sửa
  const handleEditingTaskChange = (e) => {
    const { name, value } = e.target;
    setEditingTask({
      ...editingTask,
      [name]: value
    });
  };
  
  // Thay đổi ngày hạn trong dialog chỉnh sửa
  const handleEditingDueDateChange = (date) => {
    setEditingTask({
      ...editingTask,
      dueDate: date
    });
  };
  
  // Lưu thay đổi nhiệm vụ
  const handleSaveTask = async () => {
    // Kiểm tra dữ liệu
    if (!editingTask.title.trim() || !editingTask.description.trim() || !editingTask.dueDate) {
      showNotification('Vui lòng điền đầy đủ thông tin nhiệm vụ', 'warning');
      return;
    }
    
    setSubmitting(true);
    try {
      const taskData = {
        id: editingTask.id,
        title: editingTask.title,
        description: editingTask.description,
        due_date: editingTask.dueDate.toISOString(),
        priority: editingTask.priority,
        type: editingTask.type
      };
      
      // API cập nhật nhiệm vụ
      await officerService.updateTask(officerId, editingTask.id, taskData);
      
      // Cập nhật danh sách nhiệm vụ
      setTasks(tasks.map(task => 
        task.id === editingTask.id ? { 
          ...task,
          title: editingTask.title,
          description: editingTask.description,
          due_date: editingTask.dueDate.toISOString(),
          priority: editingTask.priority,
          type: editingTask.type
        } : task
      ));
      
      handleCloseEditDialog();
      showNotification('Cập nhật nhiệm vụ thành công', 'success');
    } catch (error) {
      console.error('Lỗi khi cập nhật nhiệm vụ:', error);
      showNotification('Không thể cập nhật nhiệm vụ', 'error');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Hiển thị chip ưu tiên
  const renderPriorityChip = (priority) => {
    const priorityOption = PRIORITY_OPTIONS.find(option => option.value === priority);
    if (!priorityOption) return null;
    
    return (
      <Chip 
        label={priorityOption.label} 
        sx={{ 
          backgroundColor: priorityOption.color, 
          color: '#fff', 
          fontWeight: 'medium' 
        }} 
        size="small" 
      />
    );
  };
  
  // Quay lại trang danh sách
  const handleBack = () => {
    navigate('/admin/chairman/officer-approval/approved');
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Đang tải thông tin cán bộ...
        </Typography>
      </Box>
    );
  }
  
  if (!officer) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <WarningIcon color="warning" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Không tìm thấy thông tin cán bộ
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
          Không thể tìm thấy thông tin cán bộ với ID: {officerId}
        </Typography>
        <SecondaryButton
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Quay lại danh sách
        </SecondaryButton>
      </Paper>
    );
  }
  
  return (
    <Box className={styles.assignTasksPage}>
      <Box sx={{ mb: 2 }}>
        <Breadcrumbs>
          <Link
            underline="hover"
            color="inherit"
            onClick={handleBack}
            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <ArrowBackIcon fontSize="small" sx={{ mr: 0.5 }} />
            Danh sách cán bộ
          </Link>
          <Typography color="text.primary">Gán nhiệm vụ cho cán bộ</Typography>
        </Breadcrumbs>
      </Box>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={officer.avatar || undefined}
            alt={`${officer.user_details?.last_name} ${officer.user_details?.first_name}`}
            sx={{ width: 56, height: 56, mr: 2 }}
          >
            {officer.user_details?.first_name?.charAt(0) || <PersonIcon />}
          </Avatar>
          <Box>
            <Typography variant="h5" gutterBottom>
              {officer.user_details?.last_name} {officer.user_details?.first_name}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {officer.position || 'Cán bộ xã'} - {officer.department || 'Chưa phân công phòng ban'}
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <AssignmentIcon sx={{ mr: 1 }} /> Thêm nhiệm vụ mới
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tiêu đề nhiệm vụ"
                  name="title"
                  value={newTask.title}
                  onChange={handleNewTaskChange}
                  error={!!errors.title}
                  helperText={errors.title}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
                  <DatePicker
                    label="Ngày hạn"
                    value={newTask.dueDate}
                    onChange={handleDueDateChange}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        error={!!errors.dueDate}
                        helperText={errors.dueDate}
                        required
                      />
                    )}
                    minDate={new Date()}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Loại nhiệm vụ</InputLabel>
                  <Select
                    name="type"
                    value={newTask.type}
                    onChange={handleNewTaskChange}
                    label="Loại nhiệm vụ"
                  >
                    {TASK_TYPES.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Mức độ ưu tiên</InputLabel>
                  <Select
                    name="priority"
                    value={newTask.priority}
                    onChange={handleNewTaskChange}
                    label="Mức độ ưu tiên"
                  >
                    {PRIORITY_OPTIONS.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: option.color, mr: 1 }} />
                          {option.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mô tả nhiệm vụ"
                  name="description"
                  value={newTask.description}
                  onChange={handleNewTaskChange}
                  multiline
                  rows={3}
                  error={!!errors.description}
                  helperText={errors.description}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <PrimaryButton
                  startIcon={<AddIcon />}
                  onClick={handleAddTask}
                  disabled={submitting}
                >
                  {submitting ? 'Đang xử lý...' : 'Thêm nhiệm vụ'}
                </PrimaryButton>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <AssignmentIcon sx={{ mr: 1 }} /> Danh sách nhiệm vụ hiện tại
        </Typography>
        
        {taskLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={30} />
          </Box>
        ) : tasks.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="textSecondary">
              Cán bộ này chưa được gán nhiệm vụ nào.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tiêu đề</TableCell>
                  <TableCell>Mô tả</TableCell>
                  <TableCell>Loại</TableCell>
                  <TableCell>Ngày hạn</TableCell>
                  <TableCell>Ưu tiên</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {task.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {TASK_TYPES.find(t => t.value === task.type)?.label || task.type}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                        {new Date(task.due_date).toLocaleDateString('vi-VN')}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {renderPriorityChip(task.priority)}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={task.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'} 
                        color={task.status === 'completed' ? 'success' : 'primary'} 
                        size="small" 
                        icon={task.status === 'completed' ? <CheckIcon /> : <FlagIcon />}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenEditDialog(task)}
                        disabled={task.status === 'completed'}
                        title="Chỉnh sửa"
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      
      {/* Dialog chỉnh sửa nhiệm vụ */}
      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Chỉnh sửa nhiệm vụ
        </DialogTitle>
        <DialogContent dividers>
          {editingTask && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tiêu đề nhiệm vụ"
                  name="title"
                  value={editingTask.title}
                  onChange={handleEditingTaskChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
                  <DatePicker
                    label="Ngày hạn"
                    value={editingTask.dueDate}
                    onChange={handleEditingDueDateChange}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        required
                      />
                    )}
                    minDate={new Date()}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Loại nhiệm vụ</InputLabel>
                  <Select
                    name="type"
                    value={editingTask.type}
                    onChange={handleEditingTaskChange}
                    label="Loại nhiệm vụ"
                  >
                    {TASK_TYPES.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Mức độ ưu tiên</InputLabel>
                  <Select
                    name="priority"
                    value={editingTask.priority}
                    onChange={handleEditingTaskChange}
                    label="Mức độ ưu tiên"
                  >
                    {PRIORITY_OPTIONS.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: option.color, mr: 1 }} />
                          {option.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mô tả nhiệm vụ"
                  name="description"
                  value={editingTask.description}
                  onChange={handleEditingTaskChange}
                  multiline
                  rows={3}
                  required
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <SecondaryButton onClick={handleCloseEditDialog} disabled={submitting}>
            Hủy bỏ
          </SecondaryButton>
          <PrimaryButton
            onClick={handleSaveTask}
            startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={submitting}
          >
            Lưu thay đổi
          </PrimaryButton>
        </DialogActions>
      </Dialog>
      
      {/* Hiển thị thông báo */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AssignTasksPage;
