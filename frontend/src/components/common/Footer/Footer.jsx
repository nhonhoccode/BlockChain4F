import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Divider,
  List,
  ListItem,
  ListItemButton,
  useTheme
} from '@mui/material';
import {
  VerifiedUser as VerifiedUserIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  ContactSupport as ContactIcon,
  Description as DocumentIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();
  
  // Danh sách liên kết chính
  const mainLinks = [
    { text: 'Trang chủ', path: '/', icon: <HomeIcon fontSize="small" /> },
    { text: 'Giới thiệu', path: '/about', icon: <InfoIcon fontSize="small" /> },
    { text: 'Liên hệ', path: '/contact', icon: <ContactIcon fontSize="small" /> },
    { text: 'Xác thực giấy tờ', path: '/document-verify', icon: <VerifiedUserIcon fontSize="small" /> }
  ];
  
  // Danh sách dịch vụ
  const serviceLinks = [
    { text: 'Giấy khai sinh', path: '/auth/login?service=birth_certificate' },
    { text: 'Chứng minh nhân dân', path: '/auth/login?service=id_card' },
    { text: 'Hộ khẩu', path: '/auth/login?service=household' },
    { text: 'Đăng ký kết hôn', path: '/auth/login?service=marriage_certificate' }
  ];
  
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: theme.palette.grey[100],
        borderTop: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AccountBalanceIcon color="primary" sx={{ mr: 1, fontSize: 40 }} />
              <Typography variant="h6" fontWeight="bold">
                Quản lý Hành chính
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Hệ thống quản lý hành chính dựa trên công nghệ blockchain, 
              đảm bảo tính minh bạch, an toàn và hiệu quả trong các thủ tục hành chính công.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Liên kết
            </Typography>
            <List dense disablePadding>
              {mainLinks.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton 
                    component={RouterLink} 
                    to={item.path}
                    dense
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {item.icon && <Box sx={{ mr: 1 }}>{item.icon}</Box>}
                      {item.text}
                    </Box>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Dịch vụ
            </Typography>
            <List dense disablePadding>
              {serviceLinks.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton 
                    component={RouterLink} 
                    to={item.path}
                    dense
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DocumentIcon fontSize="small" sx={{ mr: 1 }} />
                      {item.text}
                    </Box>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Typography variant="h6" gutterBottom>
              Liên hệ
            </Typography>
            <Typography variant="body2" paragraph>
              Ủy ban Nhân dân Xã ABC
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Địa chỉ: 123 Đường XYZ, Xã ABC, Huyện DEF
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: contact@quanlyxablockchain.gov.vn
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Điện thoại: (024) 1234 5678
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()}
          </Typography>
          <Box>
            <Link component={RouterLink} to="/privacy" color="inherit" sx={{ mr: 2 }}>
              Chính sách bảo mật
            </Link>
            <Link component={RouterLink} to="/terms" color="inherit">
              Điều khoản sử dụng
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
