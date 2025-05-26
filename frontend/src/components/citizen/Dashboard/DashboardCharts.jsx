import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { Box, Typography, Paper, Grid, useTheme, Fade } from '@mui/material';

// Custom tooltip component for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper elevation={3} sx={{ p: 1.5, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
        <Typography variant="body2" color="textPrimary">
          <strong>{label}</strong>
        </Typography>
        {payload.map((entry, index) => (
          <Typography key={`item-${index}`} variant="body2" color={entry.color}>
            {entry.name}: {entry.value}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

const DashboardCharts = ({ dashboardData }) => {
  const theme = useTheme();
  
  // State for chart data
  const [requestStatusData, setRequestStatusData] = useState([]);
  const [documentTypeData, setDocumentTypeData] = useState([]);
  const [activityTimelineData, setActivityTimelineData] = useState([]);
  const [documentMetricsData, setDocumentMetricsData] = useState([]);
  const [isDataReady, setIsDataReady] = useState(false);

  // Effect to process data when dashboardData changes
  useEffect(() => {
    if (!dashboardData) return;
    
    // Set loading state
    setIsDataReady(false);
    
    // Color palette for charts
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      '#9c27b0', // purple
      '#ff9800', // orange
      '#607d8b', // blue grey
    ];

    // Process request status data
    const statusData = [
      { name: 'Chờ xử lý', value: dashboardData.pendingRequests || 0, color: theme.palette.warning.main },
      { name: 'Đang xử lý', value: dashboardData.processingRequests || 0, color: theme.palette.info.main },
      { name: 'Hoàn thành', value: dashboardData.completedRequests || 0, color: theme.palette.success.main },
      { name: 'Từ chối', value: dashboardData.rejectedRequests || 0, color: theme.palette.error.main },
    ].filter(item => item.value > 0);
    setRequestStatusData(statusData);

    // Process document types data
    const typesData = [];
    if (dashboardData.documentTypes) {
      Object.entries(dashboardData.documentTypes).forEach(([code, data], index) => {
        if (data.count > 0) {
          typesData.push({
            name: data.name,
            value: data.count,
            color: colors[index % colors.length]
          });
        }
      });
    }
    setDocumentTypeData(typesData);

    // Process activity timeline data
    const timelineData = [];
    if (dashboardData.recentActivity && dashboardData.recentActivity.length > 0) {
      const recentActivities = [...dashboardData.recentActivity].slice(0, 7);
      
      recentActivities.forEach((activity) => {
        let value = 1;
        
        if (activity.status === 'completed' || activity.status === 'approved') {
          value = 3;
        } else if (activity.status === 'processing') {
          value = 2;
        } else if (activity.status === 'rejected') {
          value = 0.5;
        }
        
        timelineData.push({
          name: activity.title.substring(0, 15) + (activity.title.length > 15 ? '...' : ''),
          value,
          date: new Date(activity.date).toLocaleDateString(),
          type: activity.type,
          status: activity.status
        });
      });
    }
    setActivityTimelineData(timelineData);

    // Process document metrics data
    const metricsData = [
      {
        subject: 'Yêu cầu đã gửi',
        A: dashboardData.totalRequests || 0,
        fullMark: Math.max(10, (dashboardData.totalRequests || 0) * 1.5),
      },
      {
        subject: 'Đang xử lý',
        A: dashboardData.processingRequests || 0,
        fullMark: Math.max(10, (dashboardData.processingRequests || 0) * 1.5),
      },
      {
        subject: 'Hoàn thành',
        A: dashboardData.completedRequests || 0,
        fullMark: Math.max(10, (dashboardData.completedRequests || 0) * 1.5),
      },
      {
        subject: 'Giấy tờ hiện có',
        A: dashboardData.totalDocuments || 0,
        fullMark: Math.max(10, (dashboardData.totalDocuments || 0) * 1.5),
      },
      {
        subject: 'Giấy tờ đang hiệu lực',
        A: dashboardData.activeDocuments || 0,
        fullMark: Math.max(10, (dashboardData.activeDocuments || 0) * 1.5),
      },
    ];
    setDocumentMetricsData(metricsData);
    
    // Set data as ready after processing
    setTimeout(() => {
      setIsDataReady(true);
    }, 300);
  }, [dashboardData, theme]);

  // Ensure we have data
  if (!dashboardData) {
    return null;
  }

  return (
    <Fade in={isDataReady} timeout={500}>
      <Grid container spacing={3}>
        {/* Request Status Distribution */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              height: '100%',
              minHeight: 300,
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2
            }}
          >
            <Typography variant="h6" gutterBottom>
              Phân bố trạng thái yêu cầu
            </Typography>
            {requestStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={requestStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {requestStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
                <Typography variant="body2" color="text.secondary">
                  Không có dữ liệu yêu cầu
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Document Type Distribution */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              height: '100%',
              minHeight: 300,
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2
            }}
          >
            <Typography variant="h6" gutterBottom>
              Phân bố loại giấy tờ
            </Typography>
            {documentTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={documentTypeData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end"
                    tick={{ fontSize: 12 }}
                    height={60}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Số lượng">
                    {documentTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
                <Typography variant="body2" color="text.secondary">
                  Không có dữ liệu về loại giấy tờ
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Document Metrics Radar Chart */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              height: '100%',
              minHeight: 300,
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2
            }}
          >
            <Typography variant="h6" gutterBottom>
              Tổng quan hồ sơ
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={documentMetricsData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis />
                <Radar 
                  name="Số lượng" 
                  dataKey="A" 
                  stroke={theme.palette.primary.main} 
                  fill={theme.palette.primary.main} 
                  fillOpacity={0.6} 
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Activity Timeline */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2
            }}
          >
            <Typography variant="h6" gutterBottom>
              Hoạt động gần đây
            </Typography>
            {activityTimelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={activityTimelineData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end"
                    tick={{ fontSize: 12 }}
                    height={60}
                  />
                  <YAxis 
                    label={{ value: 'Mức hoạt động', angle: -90, position: 'insideLeft' }}
                    tick={false}
                    domain={[0, 4]}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <Paper elevation={3} sx={{ p: 1.5, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                            <Typography variant="body2" color="textPrimary">
                              <strong>{data.name}</strong>
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Ngày: {data.date}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Loại: {data.type === 'request' ? 'Yêu cầu' : 'Giấy tờ'}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: data.status === 'completed' ? 'success.main' : 
                                      data.status === 'processing' ? 'info.main' :
                                      data.status === 'rejected' ? 'error.main' : 'text.primary'
                              }}
                            >
                              Trạng thái: {
                                data.status === 'completed' ? 'Hoàn thành' :
                                data.status === 'processing' ? 'Đang xử lý' :
                                data.status === 'pending' ? 'Chờ xử lý' :
                                data.status === 'rejected' ? 'Từ chối' :
                                data.status
                              }
                            </Typography>
                          </Paper>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={theme.palette.primary.main}
                    strokeWidth={2}
                    dot={{ r: 6, fill: theme.palette.primary.main }}
                    activeDot={{ r: 8, fill: theme.palette.primary.dark }}
                    name="Mức độ hoạt động"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <Typography variant="body2" color="text.secondary">
                  Không có dữ liệu hoạt động gần đây
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Fade>
  );
};

export default DashboardCharts; 