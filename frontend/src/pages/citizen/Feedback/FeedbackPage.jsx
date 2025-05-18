import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Rating,
  Snackbar,
  Alert,
  Grid,
  Divider,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import Chip from '../../../components/common/Chip';
import {
  Send as SendIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Star as StarIcon
} from '@mui/icons-material';

const CATEGORIES = [
  { value: 'service', label: 'Chất lượng dịch vụ' },
  { value: 'website', label: 'Trải nghiệm website' },
  { value: 'system', label: 'Hệ thống blockchain' },
  { value: 'officers', label: 'Cán bộ phục vụ' },
  { value: 'process', label: 'Quy trình xử lý' },
  { value: 'other', label: 'Khác' }
];

// Mock feedback data
const MOCK_PREVIOUS_FEEDBACK = [
  {
    id: 1,
    category: 'service',
    rating: 4,
    type: 'positive',
    content: 'Tôi rất hài lòng với tốc độ xử lý yêu cầu của tôi. Chỉ mất 2 ngày để hoàn thành.',
    date: '2023-05-15T09:30:00Z',
    response: {
      content: 'Cảm ơn bạn đã gửi phản hồi tích cực. Chúng tôi luôn cố gắng để mang lại trải nghiệm tốt nhất cho người dùng.',
      date: '2023-05-16T14:20:00Z',
      respondent: 'Nguyễn Văn X, Trưởng phòng Dịch vụ Công dân'
    }
  },
  {
    id: 2,
    category: 'website',
    rating: 3,
    type: 'neutral',
    content: 'Website hoạt động tốt nhưng đôi khi hơi chậm khi tải các trang có nhiều dữ liệu.',
    date: '2023-04-10T15:45:00Z',
    response: {
      content: 'Cảm ơn ý kiến đóng góp của bạn. Chúng tôi đang trong quá trình nâng cấp hệ thống để cải thiện tốc độ tải trang.',
      date: '2023-04-11T11:05:00Z',
      respondent: 'Trần Văn Y, Kỹ thuật viên IT'
    }
  },
  {
    id: 3,
    category: 'officers',
    rating: 2,
    type: 'negative',
    content: 'Cán bộ tại quầy số 3 phục vụ không nhiệt tình, thái độ không tốt.',
    date: '2023-03-22T10:15:00Z',
    response: null
  }
];

const FeedbackPage = () => {
  const [feedbackData, setFeedbackData] = useState({
    category: '',
    type: 'neutral',
    rating: 3,
    content: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [previousFeedback, setPreviousFeedback] = useState(MOCK_PREVIOUS_FEEDBACK);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFeedbackData({
      ...feedbackData,
      [name]: value
    });
  };
  
  const handleRatingChange = (event, newValue) => {
    setFeedbackData({
      ...feedbackData,
      rating: newValue
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!feedbackData.category) {
      setError('Vui lòng chọn danh mục phản hồi');
      return;
    }
    
    if (!feedbackData.content.trim()) {
      setError('Vui lòng nhập nội dung phản hồi');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would send the data to an API
      console.log('Submitting feedback:', feedbackData);
      
      // Add the new feedback to the list (this would normally come from the API response)
      const newFeedback = {
        id: previousFeedback.length + 1,
        ...feedbackData,
        date: new Date().toISOString(),
        response: null
      };
      
      setPreviousFeedback([newFeedback, ...previousFeedback]);
      
      // Reset form
      setFeedbackData({
        category: '',
        type: 'neutral',
        rating: 3,
        content: ''
      });
      
      setSuccess(true);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Đã xảy ra lỗi khi gửi phản hồi. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const getCategoryLabel = (categoryValue) => {
    const category = CATEGORIES.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };
  
  return (
    <Box sx={{ py: 3, px: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Góp ý phản hồi
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3, mb: { xs: 3, md: 0 } }}>
            <Typography variant="h6" gutterBottom>
              Gửi phản hồi mới
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <FormControl fullWidth margin="normal">
                <FormLabel>Danh mục phản hồi</FormLabel>
                <RadioGroup
                  row
                  name="category"
                  value={feedbackData.category}
                  onChange={handleInputChange}
                >
                  {CATEGORIES.map((category) => (
                    <FormControlLabel
                      key={category.value}
                      value={category.value}
                      control={<Radio />}
                      label={category.label}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
              
              <FormControl fullWidth margin="normal">
                <FormLabel>Đánh giá của bạn</FormLabel>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Rating
                    name="rating"
                    value={feedbackData.rating}
                    onChange={handleRatingChange}
                    precision={1}
                  />
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    {feedbackData.rating}/5
                  </Typography>
                </Box>
              </FormControl>
              
              <FormControl fullWidth margin="normal">
                <FormLabel>Loại phản hồi</FormLabel>
                <RadioGroup
                  row
                  name="type"
                  value={feedbackData.type}
                  onChange={handleInputChange}
                >
                  <FormControlLabel
                    value="positive"
                    control={<Radio color="success" />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ThumbUpIcon color="success" sx={{ mr: 0.5 }} fontSize="small" />
                        Tích cực
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="neutral"
                    control={<Radio color="info" />}
                    label="Trung lập"
                  />
                  <FormControlLabel
                    value="negative"
                    control={<Radio color="error" />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ThumbDownIcon color="error" sx={{ mr: 0.5 }} fontSize="small" />
                        Tiêu cực
                      </Box>
                    }
                  />
                </RadioGroup>
              </FormControl>
              
              <TextField
                fullWidth
                multiline
                rows={4}
                margin="normal"
                name="content"
                label="Nội dung phản hồi"
                value={feedbackData.content}
                onChange={handleInputChange}
                placeholder="Hãy chia sẻ ý kiến của bạn về dịch vụ của chúng tôi..."
              />
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  disabled={submitting}
                >
                  {submitting ? 'Đang gửi...' : 'Gửi phản hồi'}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Phản hồi trước đây
            </Typography>
            
            {previousFeedback.length > 0 ? (
              <Box>
                {previousFeedback.map((feedback) => (
                  <Card key={feedback.id} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" color="textSecondary">
                          {getCategoryLabel(feedback.category)}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Rating
                            value={feedback.rating}
                            readOnly
                            size="small"
                            icon={<StarIcon fontSize="inherit" />}
                          />
                        </Box>
                      </Box>
                      
                      <Typography variant="body1">
                        {feedback.content}
                      </Typography>
                      
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          mt: 1 
                        }}
                      >
                        <Typography variant="caption" color="textSecondary">
                          {formatDate(feedback.date)}
                        </Typography>
                        
                        {feedback.type === 'positive' ? (
                          <Chip 
                            icon={<ThumbUpIcon fontSize="small" />} 
                            label="Tích cực" 
                            size="small" 
                            color="success" 
                            variant="outlined" 
                          />
                        ) : feedback.type === 'negative' ? (
                          <Chip 
                            icon={<ThumbDownIcon fontSize="small" />} 
                            label="Tiêu cực" 
                            size="small" 
                            color="error" 
                            variant="outlined" 
                          />
                        ) : (
                          <Chip 
                            label="Trung lập" 
                            size="small" 
                            color="info" 
                            variant="outlined" 
                          />
                        )}
                      </Box>
                      
                      {feedback.response && (
                        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Phản hồi từ quản trị viên:
                          </Typography>
                          <Typography variant="body2">
                            {feedback.response.content}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                            {formatDate(feedback.response.date)} - {feedback.response.respondent}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ py: 3, textAlign: 'center' }}>
                Bạn chưa gửi phản hồi nào trước đây.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      <Snackbar 
        open={success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Cảm ơn bạn đã gửi phản hồi! Chúng tôi sẽ xem xét và phản hồi sớm nhất có thể.
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FeedbackPage; 