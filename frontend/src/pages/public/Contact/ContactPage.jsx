import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Divider,
  Card,
  CardContent,
  MenuItem,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
  Avatar,
  IconButton,
  Stack,
  Tooltip,
  Link,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  ContactSupport as SupportIcon,
  Send as SendIcon,
  AccessTime as TimeIcon,
  Map as MapIcon,
  ExpandMore as ExpandMoreIcon,
  QuestionAnswer as QuestionIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon
} from '@mui/icons-material';
import styles from './ContactPage.module.scss';

const ContactPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'general',
    message: ''
  });
  
  // Alert state
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.name || !formData.email || !formData.message) {
      setAlert({
        open: true,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc.',
        severity: 'error'
      });
      return;
    }
    
    // Mock API call would go here
    console.log('Form data submitted:', formData);
    
    // Show success message
    setAlert({
      open: true,
      message: 'Thông tin của bạn đã được gửi thành công! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.',
      severity: 'success'
    });
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: 'general',
      message: ''
    });
  };
  
  // Handle alert close
  const handleCloseAlert = () => {
    setAlert(prev => ({
      ...prev,
      open: false
    }));
  };
  
  // Contact info data
  const contactInfo = [
    {
      icon: <PhoneIcon />,
      title: 'Điện thoại',
      content: [
        '(+84) 28 1234 5678',
        '(+84) 28 8765 4321'
      ]
    },
    {
      icon: <EmailIcon />,
      title: 'Email',
      content: [
        'support@blockchain-admin.gov.vn',
        'info@blockchain-admin.gov.vn'
      ]
    },
    {
      icon: <LocationIcon />,
      title: 'Địa chỉ',
      content: [
        'Số 231 Lê Thánh Tôn,',
        'Phường Bến Thành, Quận 1,',
        'TP. Hồ Chí Minh, Việt Nam'
      ]
    }
  ];
  
  // Subject options
  const subjectOptions = [
    { value: 'general', label: 'Thông tin chung' },
    { value: 'technical', label: 'Hỗ trợ kỹ thuật' },
    { value: 'document', label: 'Vấn đề về giấy tờ' },
    { value: 'account', label: 'Vấn đề tài khoản' },
    { value: 'feedback', label: 'Góp ý, phản hồi' }
  ];
  
  // FAQ data
  const faqData = [
    {
      question: 'Làm thế nào để đăng ký tài khoản?',
      answer: 'Bạn có thể đăng ký tài khoản bằng cách truy cập trang đăng ký, nhập thông tin cá nhân và xác thực qua email hoặc số điện thoại. Sau khi xác thực, tài khoản của bạn sẽ được kích hoạt và bạn có thể sử dụng đầy đủ các tính năng của hệ thống.'
    },
    {
      question: 'Blockchain có an toàn không?',
      answer: 'Công nghệ blockchain cung cấp mức độ an toàn cao nhờ tính chất phi tập trung và mã hóa. Hệ thống của chúng tôi tuân thủ các tiêu chuẩn bảo mật nghiêm ngặt, đảm bảo dữ liệu của bạn được bảo vệ và không thể bị sửa đổi trái phép.'
    },
    {
      question: 'Tôi nộp đơn xin giấy tờ bao lâu thì được phản hồi?',
      answer: 'Thông thường, các yêu cầu sẽ được xử lý trong vòng 3-5 ngày làm việc, tùy thuộc vào loại giấy tờ và khối lượng công việc hiện tại. Bạn có thể theo dõi trạng thái xử lý yêu cầu của mình trực tiếp trên hệ thống.'
    },
    {
      question: 'Tôi cần những giấy tờ gì khi đến làm việc trực tiếp?',
      answer: 'Khi đến làm việc trực tiếp, bạn cần mang theo CCCD/CMND, các giấy tờ liên quan đến yêu cầu của bạn, và mã hồ sơ nếu đã đăng ký trực tuyến. Điều này sẽ giúp quá trình xử lý diễn ra nhanh chóng và thuận tiện hơn.'
    },
    {
      question: 'Làm thế nào để xác thực một giấy tờ trên blockchain?',
      answer: 'Để xác thực giấy tờ, bạn có thể sử dụng công cụ xác thực trên trang web của chúng tôi bằng cách nhập mã xác thực được cung cấp trên giấy tờ. Hệ thống sẽ kiểm tra thông tin trên blockchain và xác nhận tính xác thực của giấy tờ.'
    }
  ];
  
  return (
    <Box>
      {/* Enhanced Hero Section with Pattern Background */}
      <Box
        sx={{
          position: 'relative',
          background: `linear-gradient(145deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          color: 'white',
          overflow: 'hidden',
          pt: { xs: 8, md: 12 },
          pb: { xs: 10, md: 14 }
        }}
      >
        {/* Decorative pattern background */}
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
            backgroundSize: '20px 20px',
            zIndex: 0
          }}
        />
        
        {/* SVG wave shape at the bottom */}
        <Box
          component="svg"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          sx={{
            position: 'absolute',
            bottom: -1,
            left: 0,
            width: '100%',
            height: '4rem',
            zIndex: 1,
            [theme.breakpoints.up('md')]: {
              height: '6rem'
            }
          }}
        >
          <path 
            fill="#fff" 
            fillOpacity="1" 
            d="M0,128L48,138.7C96,149,192,171,288,170.7C384,171,480,149,576,149.3C672,149,768,171,864,165.3C960,160,1056,128,1152,106.7C1248,85,1344,75,1392,69.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </Box>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography 
                variant="h2" 
                component="h1" 
                sx={{ 
                  fontWeight: 800,
                  mb: 2,
                  fontSize: { xs: '2.5rem', md: '3.5rem' }
                }}
              >
                Liên hệ với chúng tôi
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  opacity: 0.9, 
                  maxWidth: '700px',
                  mb: 4,
                  fontWeight: 400,
                  lineHeight: 1.6
                }}
              >
                Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn với mọi thắc mắc về 
                hệ thống quản lý hành chính blockchain. Hãy liên hệ ngay để được tư vấn!
              </Typography>
              
              {/* Social media links */}
              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Tooltip title="Facebook">
                  <IconButton 
                    aria-label="Facebook" 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.1)', 
                      color: 'white',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.2)',
                        transform: 'translateY(-3px)'
                      }
                    }}
                  >
                    <FacebookIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Twitter">
                  <IconButton 
                    aria-label="Twitter" 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.1)', 
                      color: 'white',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.2)',
                        transform: 'translateY(-3px)'
                      }
                    }}
                  >
                    <TwitterIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="LinkedIn">
                  <IconButton 
                    aria-label="LinkedIn" 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.1)', 
                      color: 'white',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.2)',
                        transform: 'translateY(-3px)'
                      }
                    }}
                  >
                    <LinkedInIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
              <Box
                component="img"
                src="https://cdn-icons-png.flaticon.com/512/2449/2449158.png"
                alt="Contact illustration"
                sx={{
                  width: '80%',
                  maxWidth: 380,
                  filter: 'drop-shadow(0 10px 8px rgba(0,0,0,0.2))',
                  transform: 'translateY(-20px)'
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Contact Info Cards */}
      <Container maxWidth="lg" sx={{ mt: -6, position: 'relative', zIndex: 3 }}>
        <Grid container spacing={3}>
          {contactInfo.map((info, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card 
                elevation={4}
                sx={{
                  borderRadius: 4,
                  p: 3,
                  height: '100%',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 16px 30px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Avatar
                    sx={{
                      bgcolor: `${theme.palette.primary.main}20`,
                      color: theme.palette.primary.main,
                      width: 56,
                      height: 56,
                      mr: 2
                    }}
                  >
                    {info.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {info.title}
                    </Typography>
                    {info.content.map((line, idx) => (
                      <Typography 
                        key={idx} 
                        variant="body1" 
                        color="text.secondary" 
                        sx={{ mb: 0.5 }}
                      >
                        {line}
                      </Typography>
                    ))}
                    {info.title === 'Địa chỉ' && (
                      <Button 
                        variant="text" 
                        size="small" 
                        startIcon={<MapIcon />}
                        href="https://maps.google.com/?q=231+Lê+Thánh+Tôn,+Phường+Bến+Thành,+Quận+1,+TP.+Hồ+Chí+Minh"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ mt: 1, pl: 0 }}
                      >
                        Xem trên bản đồ
                      </Button>
                    )}
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      
      {/* Map Section */}
      <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card 
              elevation={0}
              sx={{ 
                p: 3, 
                height: '100%',
                backgroundColor: 'primary.50',
                borderRadius: 4,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Decorative dots pattern */}
              <Box 
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '150px',
                  height: '150px',
                  opacity: 0.5,
                  backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)',
                  backgroundSize: '10px 10px',
                  zIndex: 0
                }}
              />
              
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Giờ làm việc
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 4 }}>
                  <Box 
                    sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      bgcolor: 'success.main',
                      mr: 2 
                    }} 
                  />
                  <Typography fontWeight={500}>Thứ Hai - Thứ Sáu</Typography>
                  <Typography variant="body1" sx={{ ml: 'auto' }}>8:00 - 17:00</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box 
                    sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      bgcolor: 'warning.main',
                      mr: 2 
                    }} 
                  />
                  <Typography fontWeight={500}>Thứ Bảy</Typography>
                  <Typography variant="body1" sx={{ ml: 'auto' }}>8:00 - 12:00</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      bgcolor: 'error.main',
                      mr: 2 
                    }} 
                  />
                  <Typography fontWeight={500}>Chủ Nhật</Typography>
                  <Typography variant="body1" sx={{ ml: 'auto' }}>Nghỉ</Typography>
                </Box>
                
                <Box sx={{ mt: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Vui lòng lưu ý rằng thời gian làm việc có thể thay đổi trong các ngày lễ. 
                    Kiểm tra lại trước khi đến.
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
          
          {/* Map */}
          <Grid item xs={12} md={8}>
            <Card 
              elevation={4}
              sx={{ 
                borderRadius: 4, 
                overflow: 'hidden',
                height: '100%',
                minHeight: 400
              }}
            >
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.3955955268064!2d106.7000973738688!3d10.778807089387627!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4670702e31%3A0xa5777fb3a5bb9972!2s231%20L%C3%AA%20Th%C3%A1nh%20T%C3%B4n%2C%20B%E1%BA%BFn%20Th%C3%A0nh%2C%20Qu%E1%BA%ADn%201%2C%20Th%C3%A0nh%20ph%E1%BB%91%20H%E1%BB%93%20Ch%C3%AD%20Minh%2C%20Vietnam!5e0!3m2!1sen!2s!4v1718529380772!5m2!1sen!2s" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps - Trụ sở TP.HCM"
                aria-label="Bản đồ địa chỉ trụ sở TP.HCM"
              />
            </Card>
          </Grid>
        </Grid>
      </Container>
        
      {/* Contact Form Section with Wave Background */}
      <Box 
        sx={{ 
          bgcolor: 'primary.50',
          pt: 8,
          pb: 10,
          position: 'relative',
          mt: 10,
          mb: { xs: 0, md: 4 }
        }}
      >
        {/* Top wave */}
        <Box
          component="svg"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          sx={{
            position: 'absolute',
            bottom: 0, // đặt ở đáy
            left: 0,
            width: '100%',
            height: '120px',
            zIndex: 1,
          }}
        >
          <path 
            fill={theme.palette.primary[50]} 
            fillOpacity="1" 
            d="M0,64L48,74.7C96,85,192,107,288,122.7C384,139,480,149,576,144C672,139,768,117,864,117.3C960,117,1056,139,1152,154.7C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </Box>

        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container justifyContent="center">
            <Grid item xs={12} md={10} lg={8}>
              <Paper 
                elevation={6} 
                sx={{ 
                  p: { xs: 3, md: 6 },
                  borderRadius: 4,
                  transform: 'translateY(-20px)',
                  boxShadow: '0 16px 70px rgba(0, 0, 0, 0.1)'
                }}
              >
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography 
                    variant="h4" 
                    component="h2" 
                    fontWeight="bold" 
                    gutterBottom
                    sx={{ color: theme.palette.primary.main }}
                  >
                    Gửi yêu cầu hỗ trợ
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                    Vui lòng điền đầy đủ thông tin dưới đây, chúng tôi sẽ phản hồi trong thời gian sớm nhất
                  </Typography>
                </Box>
                
                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Họ và tên"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        variant="outlined"
                        placeholder="Nguyễn Văn A"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        variant="outlined"
                        placeholder="example@gmail.com"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Số điện thoại"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        variant="outlined"
                        placeholder="(+84) 123 456 789"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        select
                        label="Chủ đề"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        variant="outlined"
                      >
                        {subjectOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Nội dung"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        multiline
                        rows={6}
                        variant="outlined"
                        placeholder="Nội dung yêu cầu của bạn..."
                      />
                    </Grid>
                    
                    <Grid item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        endIcon={<SendIcon />}
                        sx={{ 
                          px: 6,
                          py: 1.5,
                          borderRadius: 8,
                          fontSize: '1rem',
                          textTransform: 'none',
                          boxShadow: '0 8px 25px rgba(2, 119, 189, 0.25)',
                          transition: 'all 0.3s',
                          '&:hover': {
                            transform: 'translateY(-3px)',
                            boxShadow: '0 12px 30px rgba(2, 119, 189, 0.3)'
                          }
                        }}
                      >
                        Gửi yêu cầu
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h4" 
            component="h2" 
            fontWeight="bold" 
            color="primary"
            gutterBottom
          >
            Câu hỏi thường gặp
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            Các câu hỏi thường gặp về hệ thống quản lý hành chính blockchain của chúng tôi
          </Typography>
        </Box>
        
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={10} lg={8}>
            {faqData.map((faq, index) => (
              <Accordion 
                key={index}
                elevation={0}
                disableGutters
                sx={{ 
                  mb: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '16px !important',
                  overflow: 'hidden',
                  '&::before': {
                    display: 'none',
                  },
                  '&.Mui-expanded': {
                    margin: 0,
                    mb: 2,
                  }
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon color="primary" />}
                  sx={{ 
                    px: 3, 
                    '& .MuiAccordionSummary-content': {
                      my: 2
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <QuestionIcon color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6" fontWeight="medium">
                      {faq.question}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                  <Typography 
                    sx={{ 
                      pl: 5,
                      borderLeft: '3px solid',
                      borderColor: 'primary.light',
                      py: 1
                    }}
                  >
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Grid>
        </Grid>
      </Container>
      
      {/* Alert notifications */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity} variant="filled">
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContactPage; 