import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  DateRange as DateRangeIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import officerService from '../../../services/api/officerService';

// Import chart components - you'll need to install these dependencies
// npm install recharts
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const StatisticsPage = () => {
  const { t } = useTranslation();
  
  // State
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [activeTab, setActiveTab] = useState(0);
  
  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching statistics with timeRange:', timeRange);
      const response = await officerService.getStatistics({ timeRange });
      console.log('Statistics response:', response);
      
      setStatistics(response);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchStatistics();
  }, [timeRange]);
  
  // Handle time range change
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle refresh
  const handleRefresh = () => {
    fetchStatistics();
  };
  
  // Format number with thousand separators
  const formatNumber = (num) => {
    return num?.toLocaleString('vi-VN') || '0';
  };
  
  // Render loading state
  if (loading) {
    return (
      <Box sx={{ py: 3, px: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Safe statistics data
  const safeStats = statistics || {
    overview: {
      approvedRequests: 0,
      rejectedRequests: 0,
      pendingRequests: 0,
      averageProcessingDays: 0,
      totalCitizens: 0,
      totalDocuments: 0
    },
    requestsByType: [],
    processingTimeByType: [],
    monthlyStats: []
  };
  
  return (
    <Box sx={{ py: 3, px: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('officer.statistics.title', 'Thống kê')}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Khoảng thời gian</InputLabel>
            <Select
              value={timeRange}
              onChange={handleTimeRangeChange}
              label="Khoảng thời gian"
            >
              <MenuItem value="week">{t('officer.statistics.week', '7 ngày qua')}</MenuItem>
              <MenuItem value="month">{t('officer.statistics.month', '30 ngày qua')}</MenuItem>
              <MenuItem value="quarter">{t('officer.statistics.quarter', '90 ngày qua')}</MenuItem>
              <MenuItem value="year">{t('officer.statistics.year', '365 ngày qua')}</MenuItem>
              <MenuItem value="all">{t('officer.statistics.all', 'Tất cả')}</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            {t('common.refresh', 'Làm mới')}
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={fetchStatistics}
            >
              Thử lại
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      
      {/* Overview Statistics */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Tổng quan
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={2}>
            <Card variant="outlined" sx={{ height: '100%', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <CardContent>
                <Typography variant="h3" align="center">
                  {formatNumber(safeStats.overview.approvedRequests)}
                </Typography>
                <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                  {t('officer.statistics.approvedRequests', 'Yêu cầu đã duyệt')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Card variant="outlined" sx={{ height: '100%', bgcolor: 'error.light', color: 'error.contrastText' }}>
              <CardContent>
                <Typography variant="h3" align="center">
                  {formatNumber(safeStats.overview.rejectedRequests)}
                </Typography>
                <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                  {t('officer.statistics.rejectedRequests', 'Yêu cầu từ chối')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Card variant="outlined" sx={{ height: '100%', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
              <CardContent>
                <Typography variant="h3" align="center">
                  {formatNumber(safeStats.overview.pendingRequests)}
                </Typography>
                <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                  {t('officer.statistics.pendingRequests', 'Yêu cầu chờ xử lý')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Card variant="outlined" sx={{ height: '100%', bgcolor: 'success.light', color: 'success.contrastText' }}>
              <CardContent>
                <Typography variant="h3" align="center">
                  {formatNumber(safeStats.overview.averageProcessingDays)}
                </Typography>
                <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                  {t('officer.statistics.averageProcessingDays', 'Thời gian xử lý TB')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Card variant="outlined" sx={{ height: '100%', bgcolor: 'info.light', color: 'info.contrastText' }}>
              <CardContent>
                <Typography variant="h3" align="center">
                  {formatNumber(safeStats.overview.totalCitizens)}
                </Typography>
                <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                  {t('officer.statistics.totalCitizens', 'Tổng số công dân')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Card variant="outlined" sx={{ height: '100%', bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
              <CardContent>
                <Typography variant="h3" align="center">
                  {formatNumber(safeStats.overview.totalDocuments)}
                </Typography>
                <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                  {t('officer.statistics.totalDocuments', 'Tổng số giấy tờ')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Detailed Statistics */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="statistics tabs">
            <Tab icon={<BarChartIcon />} label={t('officer.statistics.requestsByType', 'Theo loại yêu cầu')} />
            <Tab icon={<TimelineIcon />} label={t('officer.statistics.processingTime', 'Thời gian xử lý')} />
            <Tab icon={<DateRangeIcon />} label={t('officer.statistics.monthlyStats', 'Thống kê theo tháng')} />
            <Tab icon={<PieChartIcon />} label={t('officer.statistics.approvalRate', 'Tỷ lệ phê duyệt')} />
          </Tabs>
        </Box>
        
        {/* Tab 1: Requests by Type */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('officer.statistics.requestsByType', 'Thống kê yêu cầu theo loại')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Loại yêu cầu</TableCell>
                    <TableCell align="right">Số lượng</TableCell>
                    <TableCell align="right">Phê duyệt</TableCell>
                    <TableCell align="right">Từ chối</TableCell>
                    <TableCell align="right">Đang chờ</TableCell>
                    <TableCell align="right">Tỷ lệ phê duyệt</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {safeStats.requestsByType.length > 0 ? (
                    safeStats.requestsByType.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.type}</TableCell>
                        <TableCell align="right">{item.total}</TableCell>
                        <TableCell align="right">{item.approved}</TableCell>
                        <TableCell align="right">{item.rejected}</TableCell>
                        <TableCell align="right">{item.pending}</TableCell>
                        <TableCell align="right">{item.approvalRate}%</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        {t('common.noData', 'Không có dữ liệu')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ 
              mt: 4,
              p: 3, 
              backgroundColor: 'rgba(0,0,0,0.02)',
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 300
            }}>
              <Typography color="textSecondary">
                {t('officer.statistics.requestsByTypeChart', 'Biểu đồ thống kê theo loại yêu cầu sẽ được hiển thị tại đây')}
              </Typography>
            </Box>
          </Box>
        )}
        
        {/* Tab 2: Processing Time by Type */}
        {activeTab === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('officer.statistics.processingTimeByType', 'Thời gian xử lý theo loại yêu cầu')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Loại yêu cầu</TableCell>
                    <TableCell align="right">Thời gian trung bình (ngày)</TableCell>
                    <TableCell align="right">Thời gian nhanh nhất (ngày)</TableCell>
                    <TableCell align="right">Thời gian lâu nhất (ngày)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {safeStats.processingTimeByType.length > 0 ? (
                    safeStats.processingTimeByType.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.type}</TableCell>
                        <TableCell align="right">{item.average}</TableCell>
                        <TableCell align="right">{item.min}</TableCell>
                        <TableCell align="right">{item.max}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        {t('common.noData', 'Không có dữ liệu')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ 
              mt: 4,
              p: 3, 
              backgroundColor: 'rgba(0,0,0,0.02)',
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 300
            }}>
              <Typography color="textSecondary">
                {t('officer.statistics.processingTimeByTypeChart', 'Biểu đồ thời gian xử lý sẽ được hiển thị tại đây')}
              </Typography>
            </Box>
          </Box>
        )}
        
        {/* Tab 3: Monthly Statistics */}
        {activeTab === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('officer.statistics.monthlyStats', 'Thống kê theo tháng')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tháng</TableCell>
                    <TableCell align="right">Tổng số yêu cầu</TableCell>
                    <TableCell align="right">Đã phê duyệt</TableCell>
                    <TableCell align="right">Từ chối</TableCell>
                    <TableCell align="right">Thời gian trung bình (ngày)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {safeStats.monthlyStats.length > 0 ? (
                    safeStats.monthlyStats.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.month}</TableCell>
                        <TableCell align="right">{item.total}</TableCell>
                        <TableCell align="right">{item.approved}</TableCell>
                        <TableCell align="right">{item.rejected}</TableCell>
                        <TableCell align="right">{item.averageTime}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        {t('common.noData', 'Không có dữ liệu')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ 
              mt: 4,
              p: 3, 
              backgroundColor: 'rgba(0,0,0,0.02)',
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 300
            }}>
              <Typography color="textSecondary">
                {t('officer.statistics.monthlyStatsChart', 'Biểu đồ thống kê theo tháng sẽ được hiển thị tại đây')}
              </Typography>
            </Box>
          </Box>
        )}
        
        {/* Tab 4: Approval Rates */}
        {activeTab === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('officer.statistics.approvalRate', 'Tỷ lệ phê duyệt')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ 
              p: 3, 
              backgroundColor: 'rgba(0,0,0,0.02)',
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 400
            }}>
              <Typography color="textSecondary">
                {t('officer.statistics.approvalRateChart', 'Biểu đồ tỷ lệ phê duyệt sẽ được hiển thị tại đây')}
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default StatisticsPage;
