import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Divider,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Card,
  CardContent,
  Breadcrumbs,
  Link as MuiLink,
  IconButton,
  useTheme,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@mui/material';
import {
  Description as DocumentIcon,
  AccessTime as TimeIcon,
  AttachMoney as FeeIcon,
  Assignment as AssignmentIcon,
  ArrowBack as ArrowBackIcon,
  VerifiedUser as VerifiedIcon,
  CheckCircle as CheckCircleIcon,
  NoteAdd as NoteAddIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  ExpandMore as ExpandMoreIcon,
  Gavel as GavelIcon,
  HelpOutline as HelpIcon,
  LocationOn as LocationIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { procedureCategories, procedures } from './procedureData';
import { procedureDetails } from './procedureDetails';

/**
 * ProcedureDetailPage - Trang hiển thị chi tiết thủ tục hành chính
 */
const ProcedureDetailPage = () => {
  const { procedureId } = useParams();
  const [procedure, setProcedure] = useState(null);
  const [category, setCategory] = useState(null);
  const [details, setDetails] = useState(null);
  const [openGuideDialog, setOpenGuideDialog] = useState(false);
  const [currentFormGuide, setCurrentFormGuide] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Lấy thông tin thủ tục từ ID
  useEffect(() => {
    if (procedureId) {
      // Tìm thủ tục trong tất cả các danh mục
      let foundProcedure = null;
      let foundCategory = null;
      
      Object.keys(procedures).forEach(categoryId => {
        const found = procedures[categoryId].find(p => p.id === procedureId);
        if (found) {
          foundProcedure = found;
          foundCategory = procedureCategories[categoryId];
        }
      });
      
      if (foundProcedure && foundCategory) {
        setProcedure(foundProcedure);
        setCategory(foundCategory);
        
        // Lấy thông tin chi tiết bổ sung từ procedureDetails
        if (procedureDetails[procedureId]) {
          setDetails(procedureDetails[procedureId]);
        } else {
          // Tạo dữ liệu mẫu nếu không có thông tin chi tiết
          setDetails({
            steps: [
              { label: 'Chuẩn bị hồ sơ', description: 'Chuẩn bị đầy đủ các giấy tờ theo yêu cầu.' },
              { label: 'Nộp hồ sơ trực tuyến', description: 'Điền thông tin và tải lên các giấy tờ cần thiết.' },
              { label: 'Xác thực thông tin', description: 'Hệ thống blockchain xác thực tính hợp lệ của hồ sơ.' },
              { label: 'Thanh toán lệ phí (nếu có)', description: 'Thanh toán lệ phí trực tuyến.' },
              { label: 'Nhận kết quả', description: 'Nhận kết quả sau khi hồ sơ được xử lý.' }
            ],
            legalBasis: ['Các quy định pháp luật hiện hành liên quan đến thủ tục này'],
            forms: [{ name: 'Đơn đăng ký', code: 'Form-01', downloadUrl: '#' }],
            locations: ['Cơ quan có thẩm quyền theo quy định'],
            results: 'Kết quả xử lý thủ tục',
            notes: 'Lưu ý: Vui lòng chuẩn bị đầy đủ hồ sơ theo yêu cầu để đảm bảo thủ tục được xử lý nhanh chóng.',
            faq: [
              {
                question: 'Tôi có thể tra cứu tiến độ xử lý hồ sơ ở đâu?',
                answer: 'Bạn có thể đăng nhập vào tài khoản và kiểm tra tại mục "Theo dõi hồ sơ" hoặc "Yêu cầu của tôi".'
              }
            ]
          });
        }
      } else {
        // Không tìm thấy thủ tục, chuyển hướng đến trang lỗi
        navigate('/not-found');
      }
    }
  }, [procedureId, navigate]);
  
  // Xử lý chuyển hướng đến trang tạo yêu cầu
  const handleCreateRequest = () => {
    if (isAuthenticated) {
      navigate('/citizen/requests/new', { 
        state: { procedureType: procedure.id, procedureName: procedure.name } 
      });
    } else {
      navigate('/auth/login', { 
        state: { 
          redirectTo: '/citizen/requests/new',
          procedureType: procedure.id,
          procedureName: procedure.name
        } 
      });
    }
  };
  
  // Hàm xử lý hiển thị hướng dẫn
  const handleOpenGuide = (form) => {
    setCurrentFormGuide(form);
    setOpenGuideDialog(true);
  };

  const handleCloseGuide = () => {
    setOpenGuideDialog(false);
  };
  
  if (!procedure || !category || !details) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Typography variant="h6">Đang tải thông tin thủ tục...</Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ py: 6, bgcolor: '#f9fafb', minHeight: '80vh' }}>
      <Container maxWidth="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 3 }}
        >
          <MuiLink 
            component={Link} 
            to="/"
            underline="hover" 
            color="inherit"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            Trang chủ
          </MuiLink>
          <MuiLink 
            component={Link} 
            to="/procedures"
            underline="hover" 
            color="inherit"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <AssignmentIcon sx={{ mr: 0.5 }} fontSize="small" />
            Thủ tục hành chính
          </MuiLink>
          <MuiLink 
            component={Link} 
            to={`/procedures?category=${category.id}`}
            underline="hover" 
            color="inherit"
          >
            {category.name}
          </MuiLink>
          <Typography color="text.primary">{procedure.name}</Typography>
        </Breadcrumbs>
        
        {/* Back button */}
        <Button 
          component={Link} 
          to="/procedures" 
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Quay lại danh sách thủ tục
        </Button>
        
        {/* Header */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 3,
            border: '1px solid #e0e0e0'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AssignmentIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              {procedure.name}
            </Typography>
            {procedure.blockchainVerified && (
              <Chip
                icon={<VerifiedIcon />}
                label="Xác thực blockchain"
                color="primary"
                size="small"
                sx={{ ml: 2 }}
              />
            )}
          </Box>
          <Typography variant="body1" sx={{ mb: 2 }} color="text.secondary">
            {procedure.detailedDescription || procedure.description}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Chip
              icon={<TimeIcon />}
              label={`Thời gian xử lý: ${procedure.processingTime}`}
              variant="outlined"
              color="primary"
            />
            <Chip
              icon={<FeeIcon />}
              label={`Phí: ${procedure.fee}`}
              variant="outlined"
              color="primary"
            />
          </Box>
        </Paper>
        
        {/* Dialog hướng dẫn điền biểu mẫu */}
        <Dialog
          open={openGuideDialog}
          onClose={handleCloseGuide}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">
                Hướng dẫn điền {currentFormGuide?.name}
              </Typography>
              <IconButton onClick={handleCloseGuide} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body1" paragraph>
              <strong>Bước 1:</strong> Tải biểu mẫu bằng cách nhấp vào biểu tượng tải xuống.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Bước 2:</strong> Biểu mẫu sẽ mở trong tab mới và tự động hiển thị hộp thoại in.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Bước 3:</strong> Nếu muốn điền thông tin trực tiếp vào biểu mẫu:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="primary" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Hủy hộp thoại in" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="primary" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Sử dụng các nút 'Điền mẫu' và 'Xóa dữ liệu' ở góc trên bên trái để kiểm tra hoặc điền mẫu nhanh" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="primary" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Nhấp vào các ô trống để điền thông tin của bạn" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="primary" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Sau khi điền xong, nhấp nút 'In biểu mẫu' ở góc trên bên phải" />
              </ListItem>
            </List>
            <Typography variant="body1" paragraph>
              <strong>Bước 4:</strong> Nếu muốn in ngay và điền thông tin thủ công:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="primary" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Tiếp tục trong hộp thoại in" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="primary" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Điền thông tin vào biểu mẫu đã in" />
              </ListItem>
            </List>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body1" paragraph>
              <strong>Lưu ý:</strong> Điền đầy đủ thông tin theo yêu cầu, ký và ghi rõ họ tên tại phần dành cho người khai. Một số biểu mẫu yêu cầu đính kèm thêm giấy tờ khác, vui lòng kiểm tra kỹ phần "Giấy tờ cần chuẩn bị".
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseGuide} color="primary">
              Đã hiểu
            </Button>
          </DialogActions>
        </Dialog>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {/* Quy trình thực hiện chi tiết */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                mb: 4, 
                borderRadius: 3,
                border: '1px solid #e0e0e0'
              }}
            >
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Quy trình thực hiện
              </Typography>
              
              <Stepper orientation="vertical" sx={{ mb: 4 }}>
                {details.steps.map((step, index) => (
                  <Step key={index} active={true}>
                    <StepLabel>
                      <Typography variant="subtitle1" fontWeight="medium">{step.label}</Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        {step.description}
                      </Typography>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Giấy tờ cần chuẩn bị
              </Typography>
              <List>
                {procedure.requiredDocuments.map((doc, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary={doc} />
                  </ListItem>
                ))}
              </List>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Biểu mẫu
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Bấm vào biểu tượng tải xuống để mở biểu mẫu. Hệ thống sẽ tự động hiển thị hộp thoại in sau khi biểu mẫu được tải. Bạn có thể <strong>điền thông tin trực tiếp</strong> vào biểu mẫu trước khi in bằng cách nhập vào các ô trống, hoặc in ra và điền thủ công. Nhấn vào biểu tượng <HelpIcon fontSize="small" sx={{ verticalAlign: 'middle' }} /> để xem hướng dẫn chi tiết.
              </Alert>
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell>Tên biểu mẫu</TableCell>
                      <TableCell>Mã hiệu</TableCell>
                      <TableCell align="center">Tác vụ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {details.forms.map((form, index) => (
                      <TableRow key={index}>
                        <TableCell>{form.name}</TableCell>
                        <TableCell>{form.code}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Tooltip title="Tải xuống">
                              <IconButton 
                                color="primary" 
                                onClick={() => {
                                  const baseUrl = window.location.origin;
                                  const fullUrl = `${baseUrl}${form.downloadUrl}`;
                                  
                                  // Kiểm tra xem form có URL hợp lệ không
                                  if (form.downloadUrl && form.downloadUrl !== '#') {
                                    // Mở URL trong tab mới
                                    const newWindow = window.open(fullUrl, '_blank');
                                    
                                    // Thêm script để tự động hiển thị hộp thoại in khi trang HTML được tải
                                    if (form.downloadUrl.endsWith('.html')) {
                                      // Đợi trang HTML tải xong và hiển thị hộp thoại in
                                      newWindow.onload = function() {
                                        // Đảm bảo font chữ được tải đầy đủ trước khi in
                                        setTimeout(() => {
                                          newWindow.print();
                                        }, 1000);
                                      };
                                    }
                                  } else {
                                    // Hiển thị thông báo nếu chưa có biểu mẫu
                                    alert('Biểu mẫu này hiện chưa có sẵn để tải xuống. Vui lòng thử lại sau.');
                                  }
                                }}
                                size="small"
                              >
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xem hướng dẫn">
                              <IconButton 
                                color="info" 
                                onClick={() => handleOpenGuide(form)}
                                size="small"
                                sx={{ ml: 1 }}
                              >
                                <HelpIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Kết quả thực hiện
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {details.results}
              </Typography>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Lưu ý quan trọng
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                {details.notes}
              </Alert>
              
              {/* Thông tin bổ sung nếu có */}
              {details.additionalInfo && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    Thông tin bổ sung
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableBody>
                        {details.additionalInfo.validityPeriod && (
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'medium', width: '40%' }}>
                              Thời hạn sử dụng
                            </TableCell>
                            <TableCell>{details.additionalInfo.validityPeriod}</TableCell>
                          </TableRow>
                        )}
                        {details.additionalInfo.replacementConditions && (
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'medium' }}>
                              Điều kiện cấp đổi/cấp lại
                            </TableCell>
                            <TableCell>{details.additionalInfo.replacementConditions}</TableCell>
                          </TableRow>
                        )}
                        {details.additionalInfo.replacementFee && (
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'medium' }}>
                              Phí cấp đổi/cấp lại
                            </TableCell>
                            <TableCell>{details.additionalInfo.replacementFee}</TableCell>
                          </TableRow>
                        )}
                        {details.additionalInfo.importantNotes && (
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'medium' }}>
                              Ghi chú quan trọng
                            </TableCell>
                            <TableCell>{details.additionalInfo.importantNotes}</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </Paper>
            
            {/* Câu hỏi thường gặp */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                mb: 4, 
                borderRadius: 3,
                border: '1px solid #e0e0e0'
              }}
            >
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                <HelpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Câu hỏi thường gặp
              </Typography>
              
              {details.faq.map((item, index) => (
                <Accordion key={index} elevation={0} sx={{ border: '1px solid #e0e0e0', mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography fontWeight="medium">{item.question}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary">
                      {item.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            {/* Sidebar */}
            <Box sx={{ position: 'sticky', top: 100 }}>
              {/* Nút đăng ký thủ tục */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  mb: 4, 
                  borderRadius: 3,
                  border: '1px solid #e0e0e0',
                  textAlign: 'center'
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  startIcon={<NoteAddIcon />}
                  onClick={handleCreateRequest}
                  sx={{ py: 1.5, mb: 2 }}
                >
                  Đăng ký thủ tục này
                </Button>
                <Typography variant="body2" color="text.secondary">
                  {isAuthenticated ? 
                    'Bạn sẽ được chuyển đến trang đăng ký thủ tục.' : 
                    'Bạn cần đăng nhập để đăng ký thủ tục này.'}
                </Typography>
              </Paper>
              
              {/* Cơ quan thực hiện */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  mb: 4, 
                  borderRadius: 3,
                  border: '1px solid #e0e0e0'
                }}
              >
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  <LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Nơi thực hiện
                </Typography>
                <List dense disablePadding>
                  {details.locations.map((location, index) => (
                    <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={location} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
              
              {/* Căn cứ pháp lý */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  mb: 4, 
                  borderRadius: 3,
                  border: '1px solid #e0e0e0'
                }}
              >
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  <GavelIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Căn cứ pháp lý
                </Typography>
                <List dense disablePadding>
                  {details.legalBasis.map((basis, index) => (
                    <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <DocumentIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={basis} 
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
              
              {/* Hỗ trợ */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  border: '1px solid #e0e0e0',
                  bgcolor: '#f5f9ff'
                }}
              >
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Hỗ trợ
                </Typography>
                <Typography variant="body2" paragraph>
                  Nếu bạn cần trợ giúp về thủ tục này, vui lòng liên hệ:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  Hotline: <Box component="span" sx={{ color: 'primary.main' }}>1900 1234</Box>
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  Email: <Box component="span" sx={{ color: 'primary.main' }}>hotro@dichvucong.gov.vn</Box>
                </Typography>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ProcedureDetailPage; 