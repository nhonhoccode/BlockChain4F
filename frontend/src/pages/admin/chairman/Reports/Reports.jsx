import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Button,
  Stack,
  useTheme
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  Receipt as ReceiptIcon,
  Event as EventIcon,
  ViewList as ViewListIcon
} from '@mui/icons-material';
import chairmanService from '../../../../services/api/chairmanService';

/**
 * Reports Component - Shows statistics and reports for Chairman
 */
const Reports = () => {
  const theme = useTheme();
  
  // State for reports data
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  
  // Mock data for reports
  const mockReportData = {
    documentStats: {
      totalDocuments: 256,
      documentsByCategory: [
        { category: 'land', label: 'Đất đai', count: 78 },
        { category: 'civil', label: 'Hộ tịch', count: 93 },
        { category: 'construction', label: 'Xây dựng', count: 45 },
        { category: 'business', label: 'Kinh doanh', count: 20 },
        { category: 'other', label: 'Khác', count: 20 }
      ],
      documentsByStatus: [
        { status: 'approved', label: 'Đã phê duyệt', count: 189 },
        { status: 'pending', label: 'Chờ phê duyệt', count: 42 },
        { status: 'rejected', label: 'Từ chối', count: 25 }
      ],
      recentDocuments: [
        { id: 'doc1', title: 'Giấy khai sinh Nguyễn Văn A', category: 'civil', status: 'approved', date: '2023-06-18T09:30:00Z' },
        { id: 'doc2', title: 'Giấy phép xây dựng Nguyễn Thị B', category: 'construction', status: 'pending', date: '2023-06-17T10:15:00Z' },
        { id: 'doc3', title: 'Giấy đăng ký kết hôn Trần Văn C & Lê Thị D', category: 'civil', status: 'approved', date: '2023-06-16T14:45:00Z' },
        { id: 'doc4', title: 'Giấy chứng nhận quyền sử dụng đất', category: 'land', status: 'approved', date: '2023-06-15T11:30:00Z' }
      ]
    },
    officerStats: {
      totalOfficers: 12,
      activeOfficers: 10,
      inactiveOfficers: 2,
      officersByDepartment: [
        { department: 'Địa chính', count: 3 },
        { department: 'Tư pháp', count: 4 },
        { department: 'Văn thư', count: 2 },
        { department: 'Hộ tịch', count: 3 }
      ],
      topPerformingOfficers: [
        { id: 'off1', name: 'Nguyễn Văn A', position: 'Cán bộ địa chính', completedRequests: 45, rating: 4.8 },
        { id: 'off2', name: 'Trần Thị B', position: 'Cán bộ tư pháp', completedRequests: 38, rating: 4.7 },
        { id: 'off3', name: 'Lê Văn C', position: 'Cán bộ hộ tịch', completedRequests: 32, rating: 4.6 }
      ]
    },
    citizenStats: {
      totalCitizens: 1250,
      newCitizensLastMonth: 24,
      citizensByAge: [
        { range: '0-18', count: 320 },
        { range: '19-30', count: 280 },
        { range: '31-45', count: 305 },
        { range: '46-60', count: 210 },
        { range: '60+', count: 135 }
      ],
      citizensByGender: [
        { gender: 'male', label: 'Nam', count: 610 },
        { gender: 'female', label: 'Nữ', count: 640 }
      ]
    },
    requestStats: {
      totalRequests: 512,
      requestsByStatus: [
        { status: 'completed', label: 'Hoàn thành', count: 412 },
        { status: 'processing', label: 'Đang xử lý', count: 85 },
        { status: 'pending', label: 'Chờ xử lý', count: 15 }
      ],
      requestsByMonth: [
        { month: '01/2023', count: 38 },
        { month: '02/2023', count: 42 },
        { month: '03/2023', count: 51 },
        { month: '04/2023', count: 48 },
        { month: '05/2023', count: 55 },
        { month: '06/2023', count: 43 }
      ],
      avgProcessingTime: 2.3, // days
      requestsByType: [
        { type: 'land', label: 'Đất đai', count: 157 },
        { type: 'civil', label: 'Hộ tịch', count: 210 },
        { type: 'construction', label: 'Xây dựng', count: 95 },
        { type: 'business', label: 'Kinh doanh', count: 50 }
      ]
    }
  };
  
  // Report tab options
  const reportTabs = [
    { value: 'overview', label: 'Tổng quan', icon: <AssessmentIcon /> },
    { value: 'documents', label: 'Giấy tờ', icon: <DescriptionIcon /> },
    { value: 'officers', label: 'Cán bộ', icon: <PeopleIcon /> },
    { value: 'citizens', label: 'Công dân', icon: <PeopleIcon /> },
    { value: 'requests', label: 'Yêu cầu', icon: <ReceiptIcon /> }
  ];
  
  // Fetch report data on component mount
  useEffect(() => {
    fetchReportData();
  }, []);
  
  // Function to fetch report data
  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In production, use actual API call
      // const response = await chairmanService.getReportData();
      // setReportData(response);
      
      // Using mock data for now
      setTimeout(() => {
        setReportData(mockReportData);
        setLoading(false);
      }, 800);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Không thể tải dữ liệu báo cáo. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // If you need to render placeholders for charts
  const renderChartPlaceholder = (title, height = 300) => (
    <Box
      sx={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.paper',
        borderRadius: 1,
        border: '1px dashed',
        borderColor: 'divider',
        p: 2
      }}
    >
      <Typography color="text.secondary" align="center">
        {title}
      </Typography>
    </Box>
  );
  
  // Render loading state
  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 }, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 120px)' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchReportData}>
              Thử lại
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }
  
  // Render overview tab
  const renderOverviewTab = () => (
    <Grid container spacing={3}>
      {/* Document statistics summary */}
      <Grid item xs={12} md={6} lg={3}>
        <Card sx={{ 
          height: '100%',
          borderRadius: 2,
          boxShadow: theme.shadows[2],
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[3],
          }
        }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                bgcolor: 'primary.light', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <DescriptionIcon sx={{ color: 'primary.main' }} />
              </Box>
              <Typography variant="h6" fontWeight="medium">Giấy tờ</Typography>
            </Stack>
            <Typography variant="h3" sx={{ mb: 1, fontWeight: 'bold' }}>
              {reportData.documentStats.totalDocuments}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Đã phê duyệt:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {reportData.documentStats.documentsByStatus.find(s => s.status === 'approved').count}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Chờ phê duyệt:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {reportData.documentStats.documentsByStatus.find(s => s.status === 'pending').count}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      {/* Officer statistics summary */}
      <Grid item xs={12} md={6} lg={3}>
        <Card sx={{ 
          height: '100%',
          borderRadius: 2,
          boxShadow: theme.shadows[2],
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[3],
          }
        }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                bgcolor: 'success.light', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <PeopleIcon sx={{ color: 'success.main' }} />
              </Box>
              <Typography variant="h6" fontWeight="medium">Cán bộ</Typography>
            </Stack>
            <Typography variant="h3" sx={{ mb: 1, fontWeight: 'bold' }}>
              {reportData.officerStats.totalOfficers}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Đang hoạt động:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {reportData.officerStats.activeOfficers}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Không hoạt động:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {reportData.officerStats.inactiveOfficers}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      {/* Citizen statistics summary */}
      <Grid item xs={12} md={6} lg={3}>
        <Card sx={{ 
          height: '100%',
          borderRadius: 2,
          boxShadow: theme.shadows[2],
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[3],
          }
        }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                bgcolor: 'info.light', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <PeopleIcon sx={{ color: 'info.main' }} />
              </Box>
              <Typography variant="h6" fontWeight="medium">Công dân</Typography>
            </Stack>
            <Typography variant="h3" sx={{ mb: 1, fontWeight: 'bold' }}>
              {reportData.citizenStats.totalCitizens}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Nam:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {reportData.citizenStats.citizensByGender.find(g => g.gender === 'male').count}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Nữ:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {reportData.citizenStats.citizensByGender.find(g => g.gender === 'female').count}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      {/* Request statistics summary */}
      <Grid item xs={12} md={6} lg={3}>
        <Card sx={{ 
          height: '100%',
          borderRadius: 2,
          boxShadow: theme.shadows[2],
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[3],
          }
        }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                bgcolor: 'warning.light', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <ReceiptIcon sx={{ color: 'warning.main' }} />
              </Box>
              <Typography variant="h6" fontWeight="medium">Yêu cầu</Typography>
            </Stack>
            <Typography variant="h3" sx={{ mb: 1, fontWeight: 'bold' }}>
              {reportData.requestStats.totalRequests}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Đang xử lý:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {reportData.requestStats.requestsByStatus.find(s => s.status === 'processing').count}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Thời gian xử lý TB:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {reportData.requestStats.avgProcessingTime} ngày
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      {/* More detailed statistics would go here */}
      {/* For a real implementation, we would include actual charts using a library like recharts or chart.js */}
      <Grid item xs={12}>
        <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Yêu cầu theo tháng
            </Typography>
            <Box sx={{ 
              height: 250, 
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {renderChartPlaceholder('[Biểu đồ yêu cầu theo tháng sẽ được hiển thị ở đây]')}
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Giấy tờ theo loại
            </Typography>
            <Box sx={{ 
              height: 250, 
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {renderChartPlaceholder('[Biểu đồ giấy tờ theo loại sẽ được hiển thị ở đây]')}
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Cán bộ theo phòng ban
            </Typography>
            <Box sx={{ 
              height: 250, 
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {renderChartPlaceholder('[Biểu đồ cán bộ theo phòng ban sẽ được hiển thị ở đây]')}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
  
  return (
    <Box sx={{ pl: 0 }}>
      <Box sx={{ pt: { xs: 2, md: 3 }, pr: { xs: 2, md: 3 }, pb: { xs: 2, md: 3 } }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Báo cáo thống kê
        </Typography>
        
        {/* Main tab navigation */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ mb: 2 }}
          >
            <Tab 
              icon={<AssessmentIcon />} 
              label="Tổng quan" 
              iconPosition="start"
            />
            <Tab 
              icon={<DescriptionIcon />} 
              label="Giấy tờ" 
              iconPosition="start"
            />
            <Tab 
              icon={<PeopleIcon />} 
              label="Cán bộ" 
              iconPosition="start"
            />
            <Tab 
              icon={<PeopleIcon />} 
              label="Công dân" 
              iconPosition="start"
            />
            <Tab 
              icon={<ReceiptIcon />} 
              label="Yêu cầu" 
              iconPosition="start"
            />
          </Tabs>
        </Paper>
        
        {/* Report content based on selected tab */}
        <Box role="tabpanel" hidden={tabValue !== 0} id="tabpanel-0" aria-labelledby="tab-0">
          {tabValue === 0 && renderOverviewTab()}
        </Box>
        
        <Box role="tabpanel" hidden={tabValue !== 1} id="tabpanel-1" aria-labelledby="tab-1">
          {tabValue === 1 && (
            <Typography sx={{ p: 3, textAlign: 'center' }}>
              Chi tiết báo cáo về giấy tờ sẽ được hiển thị ở đây
            </Typography>
          )}
        </Box>
        
        <Box role="tabpanel" hidden={tabValue !== 2} id="tabpanel-2" aria-labelledby="tab-2">
          {tabValue === 2 && (
            <Typography sx={{ p: 3, textAlign: 'center' }}>
              Chi tiết báo cáo về cán bộ sẽ được hiển thị ở đây
            </Typography>
          )}
        </Box>
        
        <Box role="tabpanel" hidden={tabValue !== 3} id="tabpanel-3" aria-labelledby="tab-3">
          {tabValue === 3 && (
            <Typography sx={{ p: 3, textAlign: 'center' }}>
              Chi tiết báo cáo về công dân sẽ được hiển thị ở đây
            </Typography>
          )}
        </Box>
        
        <Box role="tabpanel" hidden={tabValue !== 4} id="tabpanel-4" aria-labelledby="tab-4">
          {tabValue === 4 && (
            <Typography sx={{ p: 3, textAlign: 'center' }}>
              Chi tiết báo cáo về yêu cầu sẽ được hiển thị ở đây
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Reports;
