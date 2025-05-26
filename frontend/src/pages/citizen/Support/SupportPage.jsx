import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Container,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link,
  Chip,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import { 
  Help as HelpIcon,
  CheckCircle as CheckCircleIcon,
  Security as SecurityIcon,
  Verified as VerifiedIcon,
  Article as ArticleIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Lightbulb as LightbulbIcon,
  ContactSupport as ContactSupportIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

// Simple error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error in SupportPage:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Đã xảy ra lỗi khi tải trang Hỗ trợ: {this.state.error?.message || 'Lỗi không xác định'}
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => window.location.href = '/citizen/dashboard'}
          >
            Quay lại Trang chủ
          </Button>
        </Container>
      );
    }

    return this.props.children;
  }
}

// Fallback component if React Router context is missing
const FallbackSupport = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        <HelpIcon sx={{ mr: 2, color: 'primary.main' }} />
        Trung tâm Hỗ trợ (Chế độ dự phòng)
      </Typography>

      <Alert severity="warning" sx={{ mb: 4 }}>
        Trang này đang chạy ở chế độ dự phòng do thiếu React Router context.
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CheckCircleIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="h6" color="success.main">
                Trang Hỗ trợ đã được tải thành công!
              </Typography>
            </Box>
            <Typography paragraph>
              Đây là phiên bản dự phòng của trang Hỗ trợ.
            </Typography>
            <Typography paragraph>
              Đường dẫn hiện tại: <strong>{window.location.pathname}</strong>
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => {
                alert('SupportPage fallback is working!');
              }}
            >
              Kiểm tra hoạt động
            </Button>
            <Button 
              variant="outlined" 
              sx={{ ml: 2 }}
              onClick={() => {
                window.history.back();
              }}
            >
              Quay lại
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

// Main support page component with proper hooks usage
const SupportPage = () => {
  console.log('SupportPage component rendered');
  
  // Always call hooks at the top level, not conditionally
  const location = useLocation();
  const navigate = useNavigate();
  
  // Then check if we can use them based on the environment
  const [hasRouterContext, setHasRouterContext] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chat support state
  const [showChatSupport, setShowChatSupport] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'support',
      text: 'Xin chào! Tôi là trợ lý hỗ trợ. Bạn cần giúp đỡ gì?',
      time: new Date().toLocaleTimeString('vi-VN')
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Support ticket system state
  const [ticketForm, setTicketForm] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });
  const [supportTickets, setSupportTickets] = useState([
    {
      id: 'ST-001',
      title: 'Không thể xác thực giấy tờ trên blockchain',
      description: 'Tôi gặp vấn đề khi xác thực CCCD trên hệ thống blockchain.',
      status: 'in_progress',
      created_at: '2023-05-15T08:30:00Z',
      updated_at: '2023-05-15T10:45:00Z'
    },
    {
      id: 'ST-002',
      title: 'Yêu cầu hướng dẫn quy trình đăng ký hộ khẩu mới',
      description: 'Tôi cần thông tin chi tiết về các bước đăng ký hộ khẩu mới trên hệ thống.',
      status: 'resolved',
      created_at: '2023-04-28T14:20:00Z',
      updated_at: '2023-04-30T09:15:00Z'
    }
  ]);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);

  useEffect(() => {
    // Verify that we have router context
    try {
      console.log('Checking router context, location:', location);
      setHasRouterContext(true);
    } catch (err) {
      console.warn('React Router context not available:', err);
      setHasRouterContext(false);
    }
    
    console.log('SupportPage component mounted');
    document.title = 'Hỗ trợ | Blockchain Administrative';
    
    // Log to ensure the component is being loaded
    console.log('Current URL:', window.location.href);
    console.log('Current pathname:', window.location.pathname);
    
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
      // Flag to verify the component is loaded
      window.supportPageLoaded = true;
    }, 500);
    
    return () => {
      console.log('SupportPage component unmounted');
      window.supportPageLoaded = false;
      clearTimeout(timer);
    };
  }, [location]);

  // This effect is just for debugging
  useEffect(() => {
    console.log('Location changed:', location.pathname);
  }, [location]);

  // If no React Router context, use the fallback
  if (!hasRouterContext) {
    return <FallbackSupport />;
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={40} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Đang tải trang hỗ trợ...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/citizen/dashboard')}
        >
          Quay lại Trang chủ
        </Button>
      </Container>
    );
  }

  // FAQ items about blockchain
  const faqItems = [
    {
      question: "Blockchain là gì và làm thế nào nó được áp dụng trong hệ thống này?",
      answer: "Blockchain là công nghệ sổ cái phân tán, lưu trữ thông tin trong các khối liên kết với nhau. Trong hệ thống của chúng tôi, blockchain đảm bảo tính minh bạch và không thể thay đổi của hồ sơ hành chính, giúp ngăn chặn gian lận và giả mạo giấy tờ."
    },
    {
      question: "Làm thế nào để xác minh giấy tờ của tôi đã được lưu trữ trên blockchain?",
      answer: "Mỗi giấy tờ được xác thực trên blockchain sẽ có một mã hash duy nhất. Bạn có thể kiểm tra trạng thái xác thực bằng cách nhìn vào biểu tượng Blockchain Badge trên trang chi tiết giấy tờ."
    },
    {
      question: "Hệ thống blockchain này có an toàn không?",
      answer: "Có, hệ thống của chúng tôi sử dụng công nghệ blockchain tiên tiến với mã hóa mạnh mẽ. Dữ liệu một khi đã được xác thực và lưu trữ trên blockchain sẽ không thể bị thay đổi hoặc xóa bỏ."
    },
    {
      question: "Ai có thể truy cập thông tin của tôi trên blockchain?",
      answer: "Chỉ những người được ủy quyền như cán bộ hành chính và bạn (chủ sở hữu) mới có thể truy cập thông tin đầy đủ. Hệ thống sử dụng blockchain riêng (private blockchain) để đảm bảo quyền riêng tư."
    }
  ];

  // Chat message handler
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    // Add user message
    const userMessage = {
      sender: 'user',
      text: chatInput,
      time: new Date().toLocaleTimeString('vi-VN')
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);
    
    // Simulate response after a short delay
    setTimeout(() => {
      let responseText = '';
      
      // Simple response logic based on keywords
      const input = chatInput.toLowerCase();
      if (input.includes('xin chào') || input.includes('chào') || input.includes('hi')) {
        responseText = 'Chào bạn! Tôi có thể giúp gì cho bạn?';
      } else if (input.includes('blockchain') || input.includes('xác thực')) {
        responseText = 'Hệ thống blockchain của chúng tôi đảm bảo tính xác thực và an toàn cho giấy tờ của bạn. Bạn có thể xem trạng thái xác thực trong phần chi tiết giấy tờ.';
      } else if (input.includes('yêu cầu') || input.includes('hồ sơ')) {
        responseText = 'Để gửi yêu cầu mới, bạn có thể truy cập trang Yêu cầu và chọn loại giấy tờ cần xử lý. Hệ thống sẽ hướng dẫn bạn qua các bước cần thiết.';
      } else if (input.includes('liên hệ') || input.includes('số điện thoại') || input.includes('email')) {
        responseText = 'Bạn có thể liên hệ với chúng tôi qua email support@blockchain-admin.vn hoặc số điện thoại 1900-8686.';
      } else {
        responseText = 'Cảm ơn câu hỏi của bạn. Tôi sẽ chuyển thông tin này đến đội ngũ hỗ trợ và họ sẽ liên hệ với bạn trong thời gian sớm nhất.';
      }
      
      const botResponse = {
        sender: 'support',
        text: responseText,
        time: new Date().toLocaleTimeString('vi-VN')
      };
      
      setChatMessages(prev => [...prev, botResponse]);
      setIsChatLoading(false);
    }, 1500);
  };

  // Support ticket handlers
  const handleSubmitTicket = () => {
    if (!ticketForm.title || !ticketForm.description) {
      alert('Vui lòng điền đầy đủ thông tin yêu cầu hỗ trợ');
      return;
    }
    
    setIsSubmittingTicket(true);
    
    // Simulate API call
    setTimeout(() => {
      const newTicket = {
        id: `ST-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        title: ticketForm.title,
        description: ticketForm.description,
        priority: ticketForm.priority,
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setSupportTickets(prev => [newTicket, ...prev]);
      setTicketForm({
        title: '',
        description: '',
        priority: 'medium'
      });
      
      setIsSubmittingTicket(false);
      
      // Show success message
      alert('Yêu cầu hỗ trợ đã được gửi thành công!');
    }, 1500);
  };

  const handleResolveTicket = (ticketId) => {
    setSupportTickets(prev => 
      prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, status: 'resolved', updated_at: new Date().toISOString() } 
          : ticket
      )
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        <HelpIcon sx={{ mr: 2, color: 'primary.main' }} />
        Trung tâm Hỗ trợ
      </Typography>

      <Grid container spacing={3}>
        {/* Blockchain Information Section */}
        <Grid item xs={12}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              borderTop: '4px solid #1976d2',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ 
              position: 'absolute', 
              top: 10, 
              right: 10, 
              zIndex: 1 
            }}>
              <Chip 
                icon={<VerifiedIcon />} 
                label="BLOCKCHAIN" 
                color="primary" 
                size="small"
                sx={{ 
                  fontWeight: 'bold',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': { boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.4)' },
                    '70%': { boxShadow: '0 0 0 10px rgba(25, 118, 210, 0)' },
                    '100%': { boxShadow: '0 0 0 0 rgba(25, 118, 210, 0)' }
                  }
                }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SecurityIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
              <Typography variant="h5" color="primary.main" fontWeight="500">
                Công nghệ Blockchain trong Quản lý Hành chính
              </Typography>
            </Box>
            
            <Typography paragraph>
              Hệ thống Quản lý Hành chính của chúng tôi tích hợp công nghệ blockchain để đảm bảo tính minh bạch, 
              an toàn và không thể giả mạo cho các giấy tờ hành chính của người dân.
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <VerifiedIcon color="success" sx={{ mr: 1 }} />
                      <Typography variant="h6">Tính xác thực</Typography>
                    </Box>
                    <Typography variant="body2">
                      Mỗi giấy tờ được xác thực trên blockchain có một mã hash duy nhất, 
                      đảm bảo tính toàn vẹn và chống giả mạo.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <SecurityIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">Bảo mật</Typography>
                    </Box>
                    <Typography variant="body2">
                      Dữ liệu được mã hóa và phân tán trên nhiều nút, 
                      giúp bảo vệ thông tin cá nhân và ngăn chặn truy cập trái phép.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <ArticleIcon color="secondary" sx={{ mr: 1 }} />
                      <Typography variant="h6">Minh bạch</Typography>
                    </Box>
                    <Typography variant="body2">
                      Lịch sử thay đổi trạng thái giấy tờ được ghi lại đầy đủ, 
                      giúp theo dõi quá trình xử lý và nâng cao tính minh bạch.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* FAQ Section */}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <QuestionAnswerIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
              <Typography variant="h5" color="primary.main" fontWeight="500">
                Câu hỏi thường gặp về Blockchain
              </Typography>
            </Box>
            
            <List>
              {faqItems.map((item, index) => (
                <React.Fragment key={index}>
                  <ListItem alignItems="flex-start" sx={{ flexDirection: 'column', py: 2 }}>
                    <Box sx={{ display: 'flex', width: '100%' }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <LightbulbIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          <Typography variant="subtitle1" fontWeight="500">
                            {item.question}
                          </Typography>
                        } 
                      />
                    </Box>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ pl: 4.5, pt: 1 }}
                    >
                      {item.answer}
                    </Typography>
                  </ListItem>
                  {index < faqItems.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
        
        {/* Contact Support Section */}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Paper elevation={2} sx={{ p: 3, backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ContactSupportIcon sx={{ mr: 1, fontSize: 28 }} />
              <Typography variant="h5" fontWeight="500">
                Cần thêm hỗ trợ?
              </Typography>
            </Box>
            
            <Typography paragraph>
              Nếu bạn có thắc mắc về việc sử dụng hệ thống hoặc gặp vấn đề kỹ thuật, 
              vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<ContactSupportIcon />}
                onClick={() => navigate('/citizen/feedback')}
                sx={{ 
                  backgroundColor: 'white', 
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  }
                }}
              >
                Gửi phản hồi
              </Button>
              
              <Button 
                variant="outlined" 
                color="inherit"
                component={Link}
                href="mailto:support@blockchain-admin.vn"
                sx={{ 
                  borderColor: 'white', 
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'white'
                  }
                }}
              >
                Email hỗ trợ
              </Button>

              <Button 
                variant="outlined" 
                color="inherit"
                onClick={() => setShowChatSupport(prev => !prev)}
                sx={{ 
                  borderColor: 'white', 
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'white'
                  }
                }}
              >
                {showChatSupport ? 'Đóng chat hỗ trợ' : 'Mở chat hỗ trợ'}
              </Button>
            </Box>

            {showChatSupport && (
              <Box sx={{ mt: 3, p: 2, backgroundColor: 'white', borderRadius: 1, color: 'text.primary' }}>
                <Typography variant="h6" gutterBottom>
                  Chat với đội ngũ hỗ trợ
                </Typography>
                <Box sx={{ 
                  height: 300, 
                  bgcolor: '#f5f5f5', 
                  p: 2, 
                  borderRadius: 1, 
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  mb: 2
                }}>
                  {chatMessages.map((msg, idx) => (
                    <Box 
                      key={idx} 
                      sx={{ 
                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                        backgroundColor: msg.sender === 'user' ? 'primary.main' : 'grey.300',
                        color: msg.sender === 'user' ? 'white' : 'text.primary',
                        p: 1.5,
                        borderRadius: 2,
                        maxWidth: '80%',
                        mb: 1,
                        position: 'relative'
                      }}
                    >
                      <Typography variant="body2">
                        {msg.text}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        display: 'block', 
                        textAlign: msg.sender === 'user' ? 'right' : 'left',
                        opacity: 0.7,
                        mt: 0.5
                      }}>
                        {msg.time}
                      </Typography>
                    </Box>
                  ))}
                  {isChatLoading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', alignSelf: 'flex-start' }}>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      <Typography variant="body2">Đang trả lời...</Typography>
                    </Box>
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField 
                    fullWidth 
                    placeholder="Nhập tin nhắn..." 
                    size="small"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim() || isChatLoading}
                  >
                    Gửi
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Support Ticket System */}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <AssignmentIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
              <Typography variant="h5" color="primary.main" fontWeight="500">
                Hệ thống yêu cầu hỗ trợ
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Tạo yêu cầu hỗ trợ mới
                    </Typography>
                    <TextField
                      fullWidth
                      label="Tiêu đề"
                      margin="normal"
                      value={ticketForm.title}
                      onChange={(e) => setTicketForm({...ticketForm, title: e.target.value})}
                    />
                    <TextField
                      fullWidth
                      label="Mô tả vấn đề"
                      multiline
                      rows={4}
                      margin="normal"
                      value={ticketForm.description}
                      onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
                    />
                    <FormControl fullWidth margin="normal">
                      <FormLabel>Mức độ ưu tiên</FormLabel>
                      <RadioGroup
                        row
                        name="priority"
                        value={ticketForm.priority}
                        onChange={(e) => setTicketForm({...ticketForm, priority: e.target.value})}
                      >
                        <FormControlLabel value="low" control={<Radio />} label="Thấp" />
                        <FormControlLabel value="medium" control={<Radio />} label="Trung bình" />
                        <FormControlLabel value="high" control={<Radio />} label="Cao" />
                      </RadioGroup>
                    </FormControl>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmitTicket}
                        disabled={isSubmittingTicket}
                        startIcon={isSubmittingTicket ? <CircularProgress size={20} /> : null}
                      >
                        Gửi yêu cầu
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Yêu cầu hỗ trợ của bạn
                </Typography>
                
                {isLoadingTickets ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : supportTickets.length > 0 ? (
                  <List sx={{ width: '100%' }}>
                    {supportTickets.map((ticket) => (
                      <Paper key={ticket.id} sx={{ mb: 2, p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {ticket.title}
                          </Typography>
                          <Chip 
                            label={ticket.status} 
                            color={
                              ticket.status === 'open' ? 'warning' : 
                              ticket.status === 'in_progress' ? 'info' : 
                              ticket.status === 'resolved' ? 'success' : 'default'
                            } 
                            size="small" 
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {ticket.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Gửi ngày: {new Date(ticket.created_at).toLocaleDateString('vi-VN')}
                        </Typography>
                        {ticket.status !== 'resolved' && (
                          <Box sx={{ mt: 1 }}>
                            <Button 
                              size="small" 
                              variant="outlined" 
                              color="success"
                              onClick={() => handleResolveTicket(ticket.id)}
                            >
                              Đánh dấu đã giải quyết
                            </Button>
                          </Box>
                        )}
                      </Paper>
                    ))}
                  </List>
                ) : (
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      Bạn chưa có yêu cầu hỗ trợ nào.
                    </Typography>
                  </Paper>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

// Export wrapped in the error boundary
export default function WrappedSupportPage() {
  return (
    <ErrorBoundary>
      <SupportPage />
    </ErrorBoundary>
  );
} 