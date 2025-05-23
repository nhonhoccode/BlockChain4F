import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  TextField,
  InputAdornment,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Stack,
  Avatar,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  ArrowForward as ArrowIcon,
  AccessTime as TimeIcon,
  Description as DocumentIcon,
  Assignment as AssignmentIcon,
  Info as InfoIcon,
  Notifications as NotificationIcon,
  VerifiedUser as VerifiedIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  FilterList as FilterIcon,
  People as PeopleIcon,
  Home as HomeIcon,
  AssignmentInd as IdentityIcon,
  Business as BusinessIcon,
  Apartment as ApartmentIcon,
  School as SchoolIcon,
  DirectionsCar as CarIcon,
  HealthAndSafety as HealthIcon,
  AccountBalance as GovernmentIcon
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { procedureCategories, procedures } from './procedureData';

// Định nghĩa các nhóm thủ tục với icon phù hợp
const procedureGroups = [
  { id: 'civil', name: 'Hộ tịch - Dân sự', icon: <PeopleIcon sx={{ fontSize: 40 }} />, color: '#2196f3', bgColor: '#e3f2fd' },
  { id: 'residence', name: 'Cư trú', icon: <HomeIcon sx={{ fontSize: 40 }} />, color: '#4caf50', bgColor: '#e8f5e9' },
  { id: 'identity', name: 'CCCD - CMND', icon: <IdentityIcon sx={{ fontSize: 40 }} />, color: '#f44336', bgColor: '#ffebee' },
  { id: 'land', name: 'Đất đai - Nhà ở', icon: <ApartmentIcon sx={{ fontSize: 40 }} />, color: '#ff9800', bgColor: '#fff3e0' },
  { id: 'business', name: 'Kinh doanh', icon: <BusinessIcon sx={{ fontSize: 40 }} />, color: '#9c27b0', bgColor: '#f3e5f5' },
  { id: 'education', name: 'Giáo dục', icon: <SchoolIcon sx={{ fontSize: 40 }} />, color: '#009688', bgColor: '#e0f2f1' },
  { id: 'transportation', name: 'Giao thông', icon: <CarIcon sx={{ fontSize: 40 }} />, color: '#795548', bgColor: '#efebe9' },
  { id: 'health', name: 'Y tế - Bảo hiểm', icon: <HealthIcon sx={{ fontSize: 40 }} />, color: '#3f51b5', bgColor: '#e8eaf6' },
  { id: 'other', name: 'Thủ tục khác', icon: <GovernmentIcon sx={{ fontSize: 40 }} />, color: '#607d8b', bgColor: '#eceff1' }
];

// Định nghĩa các thủ tục phổ biến
const popularProcedures = [
  { id: 'birth_registration', name: 'Đăng ký khai sinh', category: 'civil', icon: '👶' },
  { id: 'new_id_card', name: 'Cấp mới CCCD', category: 'identity', icon: '🪪' },
  { id: 'marriage_registration', name: 'Đăng ký kết hôn', category: 'civil', icon: '💍' },
  { id: 'land_certificate', name: 'Cấp GCN quyền sử dụng đất', category: 'land', icon: '🏞️' },
  { id: 'business_registration', name: 'Đăng ký kinh doanh hộ cá thể', category: 'business', icon: '🏪' },
  { id: 'permanent_residence', name: 'Đăng ký thường trú', category: 'residence', icon: '🏠' }
];

/**
 * PublicProceduresPage - Trang hiển thị tất cả các thủ tục hành chính cho người dân
 */
const PublicProceduresPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProcedures, setFilteredProcedures] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Đọc tham số danh mục từ URL khi tải trang
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    if (categoryParam && procedureGroups.some(group => group.id === categoryParam)) {
      setSelectedCategory(categoryParam);
      setTimeout(() => {
        document.getElementById('all-procedures')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [location.search]);

  // Xử lý tìm kiếm
  useEffect(() => {
    if (searchQuery) {
      const results = [];
      Object.keys(procedures).forEach(category => {
        procedures[category].forEach(procedure => {
          if (
            procedure.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            procedure.description.toLowerCase().includes(searchQuery.toLowerCase())
          ) {
            results.push({ ...procedure, category });
          }
        });
      });
      setFilteredProcedures(results);
      setSelectedCategory(null);
    } else {
      setFilteredProcedures([]);
    }
  }, [searchQuery]);

  // Xử lý chuyển hướng đến danh mục
  const handleCategoryClick = (categoryId) => {
    setSearchQuery('');
    
    if (selectedCategory === categoryId) {
      // Nếu nhấp vào danh mục đang được chọn, hủy chọn
      setSelectedCategory(null);
      navigate('/procedures');
    } else {
      // Chọn danh mục mới
      setSelectedCategory(categoryId);
      navigate(`/procedures?category=${categoryId}`);
      
      // Cuộn trang xuống phần danh sách thủ tục
      setTimeout(() => {
        document.getElementById('all-procedures')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // Xử lý chuyển hướng đến chi tiết thủ tục
  const handleProcedureClick = (categoryId, procedureId) => {
    navigate(`/procedures/${procedureId}`);
  };

  // Xử lý tạo yêu cầu
  const handleCreateRequest = (procedureInfo) => {
    if (isAuthenticated) {
      navigate('/citizen/requests/new', { 
        state: { procedureType: procedureInfo.id, procedureName: procedureInfo.name } 
      });
    } else {
      navigate('/auth/login', { 
        state: { 
          redirectTo: '/citizen/requests/new',
          procedureType: procedureInfo.id,
          procedureName: procedureInfo.name
        } 
      });
    }
  };

  // Lấy tất cả thủ tục từ tất cả các danh mục
  const getAllProcedures = () => {
    const allProcedures = [];
    Object.keys(procedures).forEach(category => {
      // Nếu đã chọn danh mục, chỉ hiển thị thủ tục trong danh mục đó
      if (selectedCategory && category !== selectedCategory) {
        return;
      }
      
      procedures[category].forEach(procedure => {
        allProcedures.push({
          ...procedure,
          category
        });
      });
    });
    return allProcedures;
  };

  return (
    <Box sx={{ py: 6, bgcolor: '#f9fafb' }}>
      <Container maxWidth="lg">
        {/* Banner thông báo */}
        <Paper 
          elevation={0} 
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#e8f5e9',
            border: '1px solid #a5d6a7'
          }}
        >
          <VerifiedIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Thông báo về dịch vụ công
            </Typography>
            <Typography variant="body1">
              Từ ngày 01/06/2023, người dân có thể đăng ký tất cả thủ tục hành chính trên hệ thống blockchain, 
              giúp giảm thời gian đi lại và đảm bảo tính xác thực.
            </Typography>
          </Box>
        </Paper>

        {/* Header */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography 
            variant={isMobile ? "h4" : "h3"} 
            component="h1" 
            fontWeight="bold" 
            gutterBottom
            sx={{ 
              background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Thủ tục hành chính công
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
            Tất cả các thủ tục hành chính được xác thực bằng công nghệ Blockchain,
            giúp người dân thực hiện nhanh chóng, minh bạch và an toàn
          </Typography>
          
          {/* Search Box */}
          <Paper
            component="form"
            sx={{
              p: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              maxWidth: 700,
              mx: 'auto',
              borderRadius: 3,
              boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
            }}
          >
            <TextField
              fullWidth
              placeholder="Tìm kiếm thủ tục hành chính..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="standard"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
                disableUnderline: true,
              }}
              sx={{ ml: 1 }}
            />
          </Paper>

          {/* Kết quả tìm kiếm */}
          {searchQuery && (
            <Paper sx={{ mt: 2, p: 2, maxWidth: 700, mx: 'auto', maxHeight: 400, overflow: 'auto' }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Kết quả tìm kiếm: {filteredProcedures.length} thủ tục
              </Typography>
              {filteredProcedures.length > 0 ? (
                <List>
                  {filteredProcedures.map((procedure) => (
                    <ListItem 
                      key={procedure.id}
                      button
                      divider
                      onClick={() => handleProcedureClick(procedure.category, procedure.id)}
                    >
                      <ListItemIcon>
                        <DocumentIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={procedure.name}
                        secondary={procedure.description}
                      />
                      <IconButton edge="end">
                        <ArrowIcon fontSize="small" />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  Không tìm thấy thủ tục nào phù hợp với "{searchQuery}"
                </Typography>
              )}
            </Paper>
          )}
        </Box>

        {/* Các nhóm thủ tục hành chính */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: 3 }}>
            Nhóm thủ tục hành chính
          </Typography>
          <Grid container spacing={3}>
            {procedureGroups.map((group) => (
              <Grid item xs={6} sm={4} md={4} key={group.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    borderRadius: 4,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                    },
                    ...(selectedCategory === group.id && {
                      boxShadow: `0 0 0 2px ${group.color}, 0 10px 20px rgba(0,0,0,0.1)`,
                      transform: 'translateY(-5px)',
                    })
                  }}
                  onClick={() => handleCategoryClick(group.id)}
                >
                  <CardContent sx={{ p: 3, bgcolor: group.bgColor }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: group.color,
                          color: 'white',
                          width: 60,
                          height: 60,
                          mr: 2
                        }}
                      >
                        {group.icon}
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold">
                        {group.name}
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button 
                        endIcon={<ArrowIcon />}
                        sx={{ 
                          color: group.color,
                          '&:hover': {
                            backgroundColor: `${group.color}10`
                          }
                        }}
                      >
                        {selectedCategory === group.id ? 'Đang xem' : 'Xem tất cả'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Thủ tục phổ biến */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: 3 }}>
            Thủ tục phổ biến
          </Typography>
          <Grid container spacing={3}>
            {popularProcedures.map((procedure) => (
              <Grid item xs={12} sm={6} md={4} key={procedure.id}>
                <Paper 
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: procedureGroups.find(g => g.id === procedure.category)?.bgColor || '#f5f5f5',
                        width: 48,
                        height: 48,
                        mr: 2,
                        fontSize: '1.5rem'
                      }}
                    >
                      {procedure.icon}
                    </Avatar>
                    <Typography variant="h6" fontWeight="medium">
                      {procedure.name}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      variant="text"
                      color="primary"
                      startIcon={<InfoIcon />}
                      onClick={() => handleProcedureClick(procedure.category, procedure.id)}
                    >
                      Chi tiết
                    </Button>
                    
                    <Button
                      variant="contained"
                      color="primary"
                      endIcon={<ArrowIcon />}
                      onClick={() => {
                        const proc = procedures[procedure.category].find(p => p.id === procedure.id);
                        if (proc) handleCreateRequest(proc);
                      }}
                      sx={{ borderRadius: 2 }}
                    >
                      Tạo yêu cầu
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
        
        {/* Danh sách tất cả thủ tục */}
        <Box sx={{ mb: 6 }} id="all-procedures">
          <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <AssignmentIcon sx={{ mr: 1 }} />
            {selectedCategory 
              ? `Thủ tục hành chính: ${procedureGroups.find(g => g.id === selectedCategory)?.name || 'Tất cả'}`
              : 'Tất cả thủ tục hành chính'}
            {selectedCategory && (
              <Button 
                variant="text" 
                size="small" 
                onClick={() => setSelectedCategory(null)}
                sx={{ ml: 2 }}
              >
                Xem tất cả
              </Button>
            )}
          </Typography>
          
          <Grid container spacing={3}>
            {getAllProcedures().map((procedure) => (
              <Grid item xs={12} sm={6} md={4} key={`${procedure.category}-${procedure.id}`}>
                <Card 
                  sx={{ 
                    height: '100%',
                    borderRadius: 4,
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ marginRight: '8px' }}>{procedure.name}</span>
                      {procedure.blockchainVerified && (
                        <Chip 
                          icon={<VerifiedIcon />}
                          label="Blockchain"
                          size="small"
                          color="primary"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {procedure.description}
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <List dense>
                      <ListItem>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <TimeIcon fontSize="small" color="action" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Thời gian xử lý" 
                          secondary={procedure.processingTime}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                  
                  <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                    <Button
                      size="small"
                      color="primary"
                      startIcon={<InfoIcon />}
                      onClick={() => handleProcedureClick(procedure.category, procedure.id)}
                    >
                      Chi tiết
                    </Button>
                    
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      endIcon={<ArrowIcon />}
                      onClick={() => handleCreateRequest(procedure)}
                      sx={{ borderRadius: 2 }}
                    >
                      Tạo yêu cầu
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
            
            {getAllProcedures().length === 0 && selectedCategory && (
              <Box sx={{ width: '100%', textAlign: 'center', py: 5 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Không có thủ tục nào trong danh mục này
                </Typography>
                <Button 
                  variant="contained"
                  color="primary"
                  onClick={() => setSelectedCategory(null)}
                  sx={{ mt: 2 }}
                >
                  Xem tất cả thủ tục
                </Button>
              </Box>
            )}
          </Grid>
        </Box>
        
        {/* CTA Section */}
        {!isAuthenticated && (
          <Box 
            sx={{ 
              mt: 8, 
              mb: 4, 
              p: 4,
              borderRadius: 4,
              background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
              color: 'white',
              textAlign: 'center'
            }}
          >
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Bắt đầu sử dụng dịch vụ hành chính số
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: 800, mx: 'auto', mb: 4, opacity: 0.9 }}>
              Đăng ký tài khoản để trải nghiệm dịch vụ hành chính hiện đại, tiết kiệm thời gian và chi phí đi lại. 
              Mọi thủ tục đều được xác thực bằng công nghệ Blockchain đảm bảo tính minh bạch và an toàn.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                color="secondary"
                size="large"
                component={Link}
                to="/auth/register"
                sx={{ 
                  px: 4, 
                  py: 1.5, 
                  borderRadius: 2,
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  backgroundColor: 'white',
                  color: '#1976d2',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  }
                }}
              >
                Đăng ký ngay
              </Button>
              <Button 
                variant="outlined"
                color="inherit"
                size="large"
                component={Link}
                to="/auth/login"
                sx={{ 
                  px: 4, 
                  py: 1.5, 
                  borderRadius: 2,
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                Đăng nhập
              </Button>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default PublicProceduresPage; 