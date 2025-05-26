import React, { useState, useEffect } from 'react';
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
  Snackbar,
  Alert,
  Grid,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import Chip from '../../../components/common/Chip';
import {
  Send as SendIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon
} from '@mui/icons-material';
import citizenService from '../../../services/api/citizenService';

const CATEGORIES = [
  { value: 'service', label: 'Chất lượng dịch vụ' },
  { value: 'website', label: 'Trải nghiệm website' },
  { value: 'system', label: 'Hệ thống blockchain' },
  { value: 'officers', label: 'Cán bộ phục vụ' },
  { value: 'process', label: 'Quy trình xử lý' },
  { value: 'other', label: 'Khác' }
];

const FeedbackPage = () => {  const [feedbackData, setFeedbackData] = useState({
    category: '',
    type: 'neutral',
    content: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [previousFeedback, setPreviousFeedback] = useState([]);

  // Load feedback history from API
  const loadFeedbackHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await citizenService.getFeedbacks();
      console.log('Feedback history response:', response);
      
      // Handle different response formats
      let feedbackList = [];
      if (response.data && response.data.results) {
        // Standard paginated response
        feedbackList = response.data.results;
      } else if (Array.isArray(response.data)) {
        // Direct array response
        feedbackList = response.data;
      } else if (response.results) {
        // Response without data wrapper
        feedbackList = response.results;
      } else if (Array.isArray(response)) {
        // Direct array on response object
        feedbackList = response;
      } else {
        console.error('Unexpected response format:', response);
        throw new Error('Invalid response format');
      }
      
      console.log('Extracted feedback list:', feedbackList);
      setPreviousFeedback(feedbackList);
    } catch (err) {
      console.error('Error loading feedback history:', err);
      setError('Không thể tải lịch sử phản hồi. Vui lòng thử lại sau.');
      setPreviousFeedback([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbackHistory();
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFeedbackData({
      ...feedbackData,
      [name]: value
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
      // Submit feedback via API
      await citizenService.submitFeedback(feedbackData);
      
      // Reset form
      setFeedbackData({
        category: '',
        type: 'neutral',
        content: ''
      });
      
      setSuccess(true);
      
      // Reload feedback history to show the new feedback
      await loadFeedbackHistory();
      
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
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : previousFeedback.length > 0 ? (
              <Box>
                {previousFeedback.map((feedback) => (
                  <Card key={feedback.id || feedback.feedback_id} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" color="textSecondary">
                          {feedback.category ? getCategoryLabel(feedback.category) : (feedback.feedback_type_display || feedback.feedback_type || 'Phản hồi')}
                        </Typography>
                        {(feedback.type || feedback.feedback_type) && (
                          <Box>
                            {feedback.type === 'positive' || feedback.feedback_type === 'suggestion' ? (
                              <Chip 
                                icon={<ThumbUpIcon fontSize="small" />} 
                                label="Tích cực" 
                                size="small" 
                                color="success" 
                                variant="outlined" 
                              />
                            ) : feedback.type === 'negative' || feedback.feedback_type === 'complaint' || feedback.feedback_type === 'bug_report' ? (
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
                        )}
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
                          {formatDate(feedback.created_at || feedback.date)}
                        </Typography>
                        
                        {(feedback.response || feedback.response_date) && (
                          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Phản hồi từ quản trị viên:
                            </Typography>
                            <Typography variant="body2">
                              {typeof feedback.response === 'object' ? feedback.response.content : feedback.response}
                            </Typography>
                            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                              {feedback.response_date ? formatDate(feedback.response_date) : 
                               (feedback.response && feedback.response.created_at) ? formatDate(feedback.response.created_at) : 
                               (feedback.response && feedback.response.date) ? formatDate(feedback.response.date) : ''}
                              {feedback.handler_name && ` - ${feedback.handler_name}`}
                              {feedback.response && feedback.response.respondent && ` - ${feedback.response.respondent}`}
                            </Typography>
                          </Box>
                        )}
                      </Box>
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