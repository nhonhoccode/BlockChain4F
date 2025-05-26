import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  CardActions,
  Stack,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  useTheme
} from '@mui/material';
import { 
  DocumentScanner as DocumentIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Visibility as VisibilityIcon,
  VerifiedUser as VerifiedIcon,
  AccountBalance as GovIcon,
  ArrowForward as ArrowIcon,
  CheckCircle as CheckIcon,
  Groups as GroupsIcon,
  Apartment as ApartmentIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './HomePage.module.scss';

const HomePage = () => {
  const theme = useTheme();
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Function to handle dashboard navigation based on user role
  const handleDashboardClick = () => {
    if (!currentUser) return;

    switch(currentUser.role?.toLowerCase()) {
      case 'chairman':
        navigate('/admin/chairman');
        break;
      case 'officer':
        navigate('officer');
        break;
      case 'citizen':
      default:
        navigate('citizen');
        break;
    }
  };

  // Services data
  const services = [
    {
      title: 'Giấy khai sinh',
      icon: <DocumentIcon fontSize="large" color="primary" />,
      description: 'Đăng ký và quản lý giấy khai sinh với tính xác thực được đảm bảo bởi blockchain.'
    },
    {
      title: 'Chứng minh nhân dân',
      icon: <PersonIcon fontSize="large" color="primary" />,
      description: 'Quản lý thông tin CMND/CCCD với tính bảo mật cao và khả năng xác thực nhanh chóng.'
    },
    {
      title: 'Sổ hộ khẩu',
      icon: <GroupsIcon fontSize="large" color="primary" />,
      description: 'Đăng ký thường trú, tạm trú và quản lý thông tin hộ khẩu trên nền tảng blockchain.'
    },
    {
      title: 'Giấy chứng nhận kết hôn',
      icon: <VerifiedIcon fontSize="large" color="primary" />,
      description: 'Cấp và quản lý giấy chứng nhận kết hôn với tính minh bạch và bảo mật.'
    },
    {
      title: 'Giấy chứng nhận quyền sử dụng đất',
      icon: <ApartmentIcon fontSize="large" color="primary" />,
      description: 'Quản lý thông tin quyền sử dụng đất với tính toàn vẹn và chống giả mạo.'
    },
    {
      title: 'Các giấy tờ hành chính khác',
      icon: <DocumentIcon fontSize="large" color="primary" />,
      description: 'Đa dạng các loại giấy tờ hành chính khác được quản lý trên nền tảng blockchain.'
    }
  ];

  // Benefits data
  const benefits = [
    {
      title: 'An toàn & Bảo mật',
      description: 'Dữ liệu được mã hóa và lưu trữ trên blockchain, đảm bảo tính toàn vẹn và không thể thay đổi.',
      icon: <SecurityIcon fontSize="large" color="primary" />
    },
    {
      title: 'Minh bạch & Truy vết',
      description: 'Mọi thao tác đều được ghi lại trên blockchain, có thể kiểm tra và truy vết mọi lúc.',
      icon: <VisibilityIcon fontSize="large" color="primary" />
    },
    {
      title: 'Nhanh chóng & Hiệu quả',
      description: 'Giảm thiểu thời gian xử lý hồ sơ từ vài ngày xuống còn vài giờ hoặc vài phút.',
      icon: <SpeedIcon fontSize="large" color="primary" />
    }
  ];

  // Statistics data
  const statistics = [
    { value: '100,000+', label: 'Giấy tờ đã xác thực' },
    { value: '50+', label: 'Loại giấy tờ hỗ trợ' },
    { value: '30+', label: 'Đơn vị hành chính sử dụng' },
    { value: '95%', label: 'Tỷ lệ hài lòng của người dân' }
  ];

  // User groups
  const userGroups = [
    {
      title: 'Người dân',
      features: [
        'Đăng ký và theo dõi hồ sơ trực tuyến',
        'Xem và tải xuống giấy tờ đã cấp',
        'Xác thực giấy tờ khi cần thiết',
        'Cập nhật thông tin cá nhân'
      ],
      icon: <PersonIcon fontSize="large" />,
      color: theme.palette.primary.main
    },
    {
      title: 'Cán bộ xã',
      features: [
        'Xử lý hồ sơ yêu cầu từ người dân',
        'Kiểm tra thông tin và xác thực dữ liệu',
        'Tạo và phát hành giấy tờ mới',
        'Báo cáo thống kê hàng ngày'
      ],
      icon: <GroupsIcon fontSize="large" />,
      color: theme.palette.success.main
    },
    {
      title: 'Chủ tịch xã',
      features: [
        'Phê duyệt cán bộ mới tham gia hệ thống',
        'Giám sát toàn bộ hoạt động xử lý hồ sơ',
        'Phê duyệt giấy tờ quan trọng',
        'Quản lý và phân công công việc'
      ],
      icon: <GovIcon fontSize="large" />,
      color: theme.palette.secondary.main
    }
  ];

  return (
    <Box className={styles.homePage}>
      {/* Hero Section */}
      <Box className={styles.homePage__hero}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" component="h1" className={styles.homePage__heroTitle}>
                Quản lý hành chính hiệu quả với công nghệ Blockchain
              </Typography>
              <Typography variant="h6" className={styles.homePage__heroSubtitle}>
                Giải pháp hiện đại cho quản lý hành chính cấp xã, đảm bảo tính minh bạch, bảo mật và hiệu quả
              </Typography>
              <Box className={styles.homePage__heroCta}>
                {!isAuthenticated ? (
                  <>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      size="large" 
                      component={Link} 
                      to="/auth/register"
                      className={styles.homePage__registerButton}
                    >
                      Đăng ký tài khoản
                    </Button>
                    <Button 
                      variant="contained"
                      color="secondary"
                      size="large" 
                      component={Link} 
                      to="/procedures"
                      startIcon={<AssignmentIcon />}
                      className={styles.homePage__proceduresButton}
                      sx={{ ml: 2 }}
                    >
                      Thủ tục hành chính
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      size="large" 
                      component={Link} 
                      to="/document-verify"
                      className={styles.homePage__verifyButton}
                    >
                      Xác thực giấy tờ
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      size="large" 
                      onClick={handleDashboardClick}
                      className={styles.homePage__dashboardButton}
                      startIcon={<DashboardIcon />}
                    >
                      Đi đến Dashboard
                    </Button>
                    <Button 
                      variant="contained"
                      color="secondary"
                      size="large" 
                      component={Link} 
                      to="/procedures"
                      startIcon={<AssignmentIcon />}
                      className={styles.homePage__proceduresButton}
                      sx={{ ml: 2 }}
                    >
                      Thủ tục hành chính
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      size="large" 
                      component={Link} 
                      to="/document-verify"
                      className={styles.homePage__verifyButton}
                    >
                      Xác thực giấy tờ
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={6} className={styles.homePage__heroImageContainer}>
              <img 
                src="/assets/images/hero-blockchain.svg" 
                alt="Blockchain Administrative Management" 
                className={styles.homePage__heroImage}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Statistics */}
      <Container maxWidth="lg">
        <Box className={styles.homePage__stats}>
          <Grid container spacing={3} justifyContent="center">
            {statistics.map((stat, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <Paper elevation={0} className={styles.homePage__statCard}>
                  <Typography variant="h3" color="primary" className={styles.homePage__statValue}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" className={styles.homePage__statLabel}>
                    {stat.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      {/* Benefits Section */}
      <Box className={styles.homePage__benefits}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" className={styles.homePage__sectionTitle} align="center">
            Lợi ích nổi bật
          </Typography>
          <Typography variant="body1" align="center" className={styles.homePage__sectionSubtitle}>
            Khám phá những ưu điểm khi sử dụng hệ thống quản lý hành chính trên nền tảng blockchain
          </Typography>

          <Grid container spacing={4} className={styles.homePage__benefitsContainer}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card className={styles.homePage__benefitCard}>
                  <CardContent className={styles.homePage__benefitContent}>
                    <Box className={styles.homePage__benefitIcon}>
                      {benefit.icon}
                    </Box>
                    <Typography variant="h5" component="h3" className={styles.homePage__benefitTitle}>
                      {benefit.title}
                    </Typography>
                    <Typography variant="body1" className={styles.homePage__benefitDesc}>
                      {benefit.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Services Section */}
      <Container maxWidth="lg">
        <Box className={styles.homePage__services}>
          <Typography variant="h4" component="h2" className={styles.homePage__sectionTitle}>
            Dịch vụ của chúng tôi
          </Typography>
          <Typography variant="body1" className={styles.homePage__sectionSubtitle}>
            Các loại giấy tờ và dịch vụ hành chính được hỗ trợ trên nền tảng BlockAdmin
          </Typography>

          <Grid container spacing={3} className={styles.homePage__servicesGrid}>
            {services.map((service, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card className={styles.homePage__serviceCard}>
                  <CardContent>
                    <Box className={styles.homePage__serviceIcon}>
                      {service.icon}
                    </Box>
                    <Typography variant="h6" component="h3" className={styles.homePage__serviceTitle}>
                      {service.title}
                    </Typography>
                    <Typography variant="body2" className={styles.homePage__serviceDesc}>
                      {service.description}
                    </Typography>
                  </CardContent>
                  <CardActions className={styles.homePage__serviceActions}>
                    <Button 
                      size="small" 
                      color="primary" 
                      component={Link} 
                      to="/auth/login"
                      endIcon={<ArrowIcon />}
                    >
                      Đăng ký sử dụng
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      {/* User Groups Section */}
      <Box className={styles.homePage__userGroups}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" className={styles.homePage__sectionTitle} align="center">
            Dành cho tất cả đối tượng
          </Typography>
          <Typography variant="body1" align="center" className={styles.homePage__sectionSubtitle}>
            Hệ thống được thiết kế cho cả người dân, cán bộ xã và chủ tịch xã với các tính năng khác nhau
          </Typography>

          <Grid container spacing={4} className={styles.homePage__userGroupsContainer}>
            {userGroups.map((group, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card className={styles.homePage__userGroupCard}>
                  <Box className={styles.homePage__userGroupHeader} sx={{ backgroundColor: group.color }}>
                    <Box className={styles.homePage__userGroupIcon} sx={{ color: '#fff' }}>
                      {group.icon}
                    </Box>
                    <Typography variant="h5" component="h3" className={styles.homePage__userGroupTitle}>
                      {group.title}
                    </Typography>
                  </Box>
                  <CardContent className={styles.homePage__userGroupContent}>
                    <List>
                      {group.features.map((feature, idx) => (
                        <ListItem key={idx} disableGutters>
                          <ListItemIcon sx={{ minWidth: '30px' }}>
                            <CheckIcon color="success" />
                          </ListItemIcon>
                          <ListItemText primary={feature} />
                        </ListItem>
                      ))}
                    </List>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      fullWidth 
                      component={Link} 
                      to="/auth/login"
                      className={styles.homePage__userGroupButton}
                      sx={{ mt: 2 }}
                    >
                      Đăng nhập ngay
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Process Section */}
      <Container maxWidth="lg">
        <Box className={styles.homePage__process}>
          <Typography variant="h4" component="h2" className={styles.homePage__sectionTitle}>
            Quy trình đơn giản
          </Typography>
          <Typography variant="body1" className={styles.homePage__sectionSubtitle}>
            Quy trình xử lý giấy tờ hành chính minh bạch và hiệu quả
          </Typography>

          <Box className={styles.homePage__processSteps}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Paper elevation={2} className={styles.homePage__processStep}>
                  <Box className={styles.homePage__processStepNumber}>1</Box>
                  <Typography variant="h6" className={styles.homePage__processStepTitle}>
                    Đăng ký yêu cầu
                  </Typography>
                  <Typography variant="body2" className={styles.homePage__processStepDesc}>
                    Người dân đăng ký yêu cầu giấy tờ trực tuyến và tải lên các tài liệu cần thiết.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper elevation={2} className={styles.homePage__processStep}>
                  <Box className={styles.homePage__processStepNumber}>2</Box>
                  <Typography variant="h6" className={styles.homePage__processStepTitle}>
                    Xử lý yêu cầu
                  </Typography>
                  <Typography variant="body2" className={styles.homePage__processStepDesc}>
                    Cán bộ xã xem xét yêu cầu, kiểm tra thông tin và xử lý hồ sơ.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper elevation={2} className={styles.homePage__processStep}>
                  <Box className={styles.homePage__processStepNumber}>3</Box>
                  <Typography variant="h6" className={styles.homePage__processStepTitle}>
                    Phê duyệt & Cấp phát
                  </Typography>
                  <Typography variant="body2" className={styles.homePage__processStepDesc}>
                    Giấy tờ được phê duyệt, cấp phát và lưu trữ trên blockchain.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper elevation={2} className={styles.homePage__processStep}>
                  <Box className={styles.homePage__processStepNumber}>4</Box>
                  <Typography variant="h6" className={styles.homePage__processStepTitle}>
                    Nhận & Sử dụng
                  </Typography>
                  <Typography variant="body2" className={styles.homePage__processStepDesc}>
                    Người dân nhận giấy tờ trực tuyến hoặc trực tiếp, có thể xác thực bất cứ lúc nào.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>

      {/* CTA Section */}
      <Box className={styles.homePage__cta}>
        <Container maxWidth="md">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h4" component="h2" className={styles.homePage__ctaTitle}>
                Sẵn sàng trải nghiệm quản lý hành chính thế hệ mới?
              </Typography>
              <Typography variant="body1" className={styles.homePage__ctaSubtitle}>
                Đăng ký ngay hôm nay để sử dụng các dịch vụ hành chính trên nền tảng blockchain hiện đại
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction="column" spacing={2}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large" 
                  component={Link} 
                  to="/auth/register"
                  fullWidth
                >
                  Đăng ký tài khoản
                </Button>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size="large" 
                  component={Link} 
                  to="/about"
                  fullWidth
                >
                  Tìm hiểu thêm
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage; 