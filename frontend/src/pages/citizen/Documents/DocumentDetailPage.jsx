import React, { useState, useEffect } from 'react';
import { 
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Divider,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Description as DocumentIcon,
  History as HistoryIcon,
  Lock as LockIcon,
  Download as DownloadIcon,
  VerifiedUser as VerifiedUserIcon,
  ContentCopy as CopyIcon,
  QrCode as QrCodeIcon,
  Check as CheckIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Print as PrintIcon,
  Info as InfoIcon,
  Comment as CommentIcon,
  AttachFile as AttachFileIcon,
  InsertDriveFile as InsertDriveFileIcon,
  Gavel as GavelIcon
} from '@mui/icons-material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import QRCode from 'qrcode.react';

// Import service để gọi API thực tế
import citizenService from '../../../services/api/citizenService';

// Helper function to format document type
export const formatDocumentType = (type) => {
  const typeMap = {
    'GIẤY_KHAI_SINH': 'Giấy khai sinh',
    'CHỨNG_MINH_NHÂN_DÂN': 'Chứng minh nhân dân',
    'SỔ_HỘ_KHẨU': 'Sổ hộ khẩu',
    'XÁC_NHẬN_THƯỜNG_TRÚ': 'Xác nhận thường trú',
    'CHỨNG_NHẬN_HÔN_NHÂN': 'Chứng nhận hôn nhân',
    'GIẤY_CHỨNG_TỬ': 'Giấy chứng tử',
    'CMND': 'Chứng minh nhân dân',
    'CCCD': 'Căn cước công dân',
    'PASSPORT': 'Hộ chiếu',
    'DRIVING_LICENSE': 'Giấy phép lái xe',
    'BIRTH_CERTIFICATE': 'Giấy khai sinh',
    'MARRIAGE_CERTIFICATE': 'Giấy chứng nhận kết hôn',
    'DEATH_CERTIFICATE': 'Giấy chứng tử',
    'BUSINESS_LICENSE': 'Giấy phép kinh doanh',
    'LAND_CERTIFICATE': 'Giấy chứng nhận quyền sử dụng đất',
    'UNIVERSITY_DEGREE': 'Bằng đại học',
    'unknown': 'Giấy tờ không xác định',
    'Giấy tờ': 'Giấy tờ'
  };
  
  // Nếu type là object và có thuộc tính name, sử dụng name
  if (type && typeof type === 'object' && type.name) {
    return type.name;
  }
  
  // Nếu type là object và có thuộc tính title, sử dụng title
  if (type && typeof type === 'object' && type.title) {
    return type.title;
  }
  
  return typeMap[type] || (typeof type === 'string' ? type : 'Giấy tờ');
};

// Mock document details cho nhiều loại giấy tờ khác nhau
export const mockDocuments = {
  // Giấy khai sinh
  birthCertificate: {
    documentId: 'DKKH-20250525-001',
    documentType: 'BIRTH_CERTIFICATE',
    status: 'VALID',
    issuedAt: '2023-06-16T14:20:00Z',
    expiresAt: null,
    issuedBy: 'Ủy ban Nhân dân Xã ABC',
    officerId: 'OFF001',
    officerName: 'Nguyễn Văn B',
    verificationCode: 'BC-123456',
    contentHash: '7a8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p',
    transactionId: 'TX123456789',
    blockchainTimestamp: '2023-06-16T14:25:00Z',
    details: {
      fullName: 'Nguyễn Văn A',
      dateOfBirth: '2023-05-10',
      gender: 'Nam',
      placeOfBirth: 'Thành phố Hồ Chí Minh',
      fatherName: 'Nguyễn Văn C',
      motherName: 'Trần Thị D',
      permanentAddress: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
      nationality: 'Việt Nam'
    },
    notes: 'Đã xác minh thông tin từ bệnh viện',
    additionalInfo: {
      'Người làm chứng': 'Lê Thị E',
      'Quan hệ với trẻ': 'Bà ngoại',
      'Số đăng ký khai sinh': 'KS12345/2023',
      'Quyển số': '01/2023-ĐKKS'
    },
    attachments: [
      {
        id: 'att001',
        name: 'Giấy chứng sinh từ bệnh viện',
        description: 'Bản sao có công chứng',
        uploadDate: '2023-06-15T10:30:00Z'
      },
      {
        id: 'att002',
        name: 'CMND/CCCD của cha mẹ',
        description: 'Bản sao có công chứng',
        uploadDate: '2023-06-15T10:35:00Z'
      }
    ],
    transactionHistory: [
      {
        action: 'CREATE',
        timestamp: '2023-06-16T14:20:00Z',
        userId: 'OFF001',
        userName: 'Nguyễn Văn B',
        role: 'officer'
      },
      {
        action: 'APPROVE',
        timestamp: '2023-06-16T14:22:00Z',
        userId: 'OFF001',
        userName: 'Nguyễn Văn B',
        role: 'officer'
      },
      {
        action: 'RECORD_ON_BLOCKCHAIN',
        timestamp: '2023-06-16T14:25:00Z',
        userId: 'SYSTEM',
        userName: 'Hệ thống',
        role: 'system'
      }
    ]
  },
  
  // CMND/CCCD
  idCard: {
    documentId: 'CCCD-20250525-002',
    documentType: 'CMND',
    status: 'VALID',
    issuedAt: '2022-01-10T09:15:00Z',
    expiresAt: '2032-01-10T09:15:00Z',
    issuedBy: 'Cục Cảnh sát Quản lý Hành chính về Trật tự Xã hội',
    officerId: 'OFF002',
    officerName: 'Trần Thị H',
    verificationCode: 'ID-789012',
    contentHash: '7d8f9g0h1i2j3k4l5m6n7o8p9q0r1s2t',
    transactionId: 'TX987654321',
    blockchainTimestamp: '2022-01-10T09:20:00Z',
    details: {
      fullName: 'Nguyễn Văn A',
      dateOfBirth: '1990-07-15',
      gender: 'Nam',
      placeOfBirth: 'Hà Nội',
      permanentAddress: '456 Đường DEF, Phường UVW, Quận 2, TP.HCM',
      idNumber: '079090123456',
      nationality: 'Việt Nam',
      religion: 'Không',
      ethnicity: 'Kinh',
      phoneNumber: '0901234567',
      email: 'nguyenvana@email.com'
    },
    additionalInfo: {
      'Đặc điểm nhận dạng': 'Sẹo nhỏ ở trán',
      'Nhóm máu': 'O',
      'Nơi đăng ký khai sinh': 'Quận Đống Đa, Hà Nội'
    },
    attachments: [
      {
        id: 'att003',
        name: 'Ảnh chân dung',
        description: 'Ảnh 4x6 nền xanh',
        uploadDate: '2022-01-05T15:20:00Z'
      },
      {
        id: 'att004',
        name: 'Giấy khai sinh',
        description: 'Bản sao có công chứng',
        uploadDate: '2022-01-05T15:25:00Z'
      }
    ],
    transactionHistory: [
      {
        action: 'CREATE',
        timestamp: '2022-01-10T09:15:00Z',
        userId: 'OFF002',
        userName: 'Trần Thị H',
        role: 'officer'
      },
      {
        action: 'APPROVE',
        timestamp: '2022-01-10T09:18:00Z',
        userId: 'CHM001',
        userName: 'Lê Văn K',
        role: 'chairman'
      },
      {
        action: 'RECORD_ON_BLOCKCHAIN',
        timestamp: '2022-01-10T09:20:00Z',
        userId: 'SYSTEM',
        userName: 'Hệ thống',
        role: 'system'
      }
    ]
  },
  
  // Giấy chứng tử
  deathCertificate: {
    documentId: 'GCT-20250525-001',
    documentType: 'DEATH_CERTIFICATE',
    status: 'VALID',
    issuedAt: '2023-08-20T11:30:00Z',
    expiresAt: null,
    issuedBy: 'Ủy ban Nhân dân Phường XYZ',
    officerId: 'OFF003',
    officerName: 'Phạm Văn L',
    verificationCode: 'DC-456789',
    contentHash: '1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p',
    transactionId: 'TX543216789',
    blockchainTimestamp: '2023-08-20T11:40:00Z',
    details: {
      deceasedName: 'Trần Văn M',
      dateOfBirth: '1945-03-12',
      dateOfDeath: '2023-08-15',
      placeOfDeath: 'Bệnh viện Đa khoa Tỉnh ABC',
      causeOfDeath: 'Suy đa cơ quan do tuổi già',
      gender: 'Nam',
      permanentAddress: '789 Đường GHI, Phường RST, Quận 3, TP.HCM',
      idNumber: '079045678901',
      declarerName: 'Trần Thị N',
      relationship: 'Con gái'
    },
    notes: 'Giấy báo tử từ bệnh viện đã được xác thực',
    additionalInfo: {
      'Số đăng ký khai tử': 'KT5678/2023',
      'Quyển số': '02/2023-ĐKKT',
      'Nơi an táng': 'Nghĩa trang Thành phố'
    },
    attachments: [
      {
        id: 'att005',
        name: 'Giấy báo tử',
        description: 'Từ Bệnh viện Đa khoa Tỉnh ABC',
        uploadDate: '2023-08-18T09:15:00Z'
      },
      {
        id: 'att006',
        name: 'CMND/CCCD của người mất',
        description: 'Bản gốc',
        uploadDate: '2023-08-18T09:20:00Z'
      },
      {
        id: 'att007',
        name: 'Biên bản xác nhận tử vong',
        description: 'Có chữ ký của bác sĩ',
        uploadDate: '2023-08-18T09:25:00Z'
      }
    ],
    transactionHistory: [
      {
        action: 'CREATE',
        timestamp: '2023-08-20T11:30:00Z',
        userId: 'OFF003',
        userName: 'Phạm Văn L',
        role: 'officer'
      },
      {
        action: 'APPROVE',
        timestamp: '2023-08-20T11:35:00Z',
        userId: 'CHM002',
        userName: 'Ngô Thị P',
        role: 'chairman'
      },
      {
        action: 'RECORD_ON_BLOCKCHAIN',
        timestamp: '2023-08-20T11:40:00Z',
        userId: 'SYSTEM',
        userName: 'Hệ thống',
        role: 'system'
      }
    ]
  },
  
  // Giấy chứng nhận kết hôn
  marriageCertificate: {
    documentId: 'GCT-20250525-002',
    documentType: 'MARRIAGE_CERTIFICATE',
    status: 'VALID',
    issuedAt: '2023-02-14T10:00:00Z',
    expiresAt: null,
    issuedBy: 'Ủy ban Nhân dân Quận 1',
    officerId: 'OFF004',
    officerName: 'Hoàng Thị Q',
    verificationCode: 'MC-234567',
    contentHash: '2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q',
    transactionId: 'TX876543210',
    blockchainTimestamp: '2023-02-14T10:10:00Z',
    details: {
      husbandName: 'Lê Văn R',
      husbandDob: '1988-09-25',
      husbandId: '079088123456',
      husbandNationality: 'Việt Nam',
      wifeName: 'Vũ Thị S',
      wifeDob: '1990-11-20',
      wifeId: '079090654321',
      wifeNationality: 'Việt Nam',
      registrationPlace: 'Phòng Tư pháp Quận 1, TP.HCM',
      registrationDate: '2023-02-14'
    },
    notes: 'Đăng ký kết hôn vào ngày Lễ Tình nhân',
    additionalInfo: {
      'Số đăng ký kết hôn': 'KH1234/2023',
      'Quyển số': '01/2023-ĐKKH',
      'Người làm chứng 1': 'Trần Văn T',
      'Người làm chứng 2': 'Nguyễn Thị U'
    },
    attachments: [
      {
        id: 'att008',
        name: 'CMND/CCCD của chồng',
        description: 'Bản sao có công chứng',
        uploadDate: '2023-02-10T14:20:00Z'
      },
      {
        id: 'att009',
        name: 'CMND/CCCD của vợ',
        description: 'Bản sao có công chứng',
        uploadDate: '2023-02-10T14:25:00Z'
      },
      {
        id: 'att010',
        name: 'Giấy xác nhận tình trạng hôn nhân',
        description: 'Của cả hai người',
        uploadDate: '2023-02-10T14:30:00Z'
      }
    ],
    transactionHistory: [
      {
        action: 'CREATE',
        timestamp: '2023-02-14T10:00:00Z',
        userId: 'OFF004',
        userName: 'Hoàng Thị Q',
        role: 'officer'
      },
      {
        action: 'APPROVE',
        timestamp: '2023-02-14T10:05:00Z',
        userId: 'CHM003',
        userName: 'Đỗ Văn V',
        role: 'chairman'
      },
      {
        action: 'RECORD_ON_BLOCKCHAIN',
        timestamp: '2023-02-14T10:10:00Z',
        userId: 'SYSTEM',
        userName: 'Hệ thống',
        role: 'system'
      }
    ]
  }
};

// Mock fetch document details
const mockFetchDocumentDetails = (documentId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Fetching mock data for ID:', documentId);
      // Kiểm tra documentId để trả về mock data phù hợp
      if (documentId.includes('DKKH') || documentId.includes('BC')) {
        resolve(mockDocuments.birthCertificate);
      } else if (documentId.includes('CCCD') || documentId.includes('CMND') || documentId.includes('ID')) {
        resolve(mockDocuments.idCard);
      } else if (documentId.includes('GCT-') && documentId.includes('001')) {
        resolve(mockDocuments.deathCertificate);
      } else if (documentId.includes('GCT-') && documentId.includes('002')) {
        resolve(mockDocuments.marriageCertificate);
      } else if (documentId === 'DOC001') {
        // Cho trường hợp mockDocumentDetails cũ
        resolve(mockDocuments.birthCertificate);
      } else {
        // Chọn ngẫu nhiên một loại giấy tờ làm mặc định
        const mockTypes = Object.keys(mockDocuments);
        const randomType = mockTypes[Math.floor(Math.random() * mockTypes.length)];
        console.log(`No specific mock data for ID: ${documentId}, using random type: ${randomType}`);
        resolve(mockDocuments[randomType]);
      }
    }, 1000);
  });
};

// Helper function to get status label
const getStatusLabel = (status) => {
  if (!status) return 'Không xác định';
  
  const statusMap = {
    'VALID': 'Hợp lệ',
    'EXPIRED': 'Hết hạn',
    'REVOKED': 'Đã thu hồi',
    'PENDING': 'Chờ xử lý',
    'PROCESSING': 'Đang xử lý',
    'REJECTED': 'Bị từ chối',
    'ACTIVE': 'Hợp lệ',
    'INACTIVE': 'Không hoạt động',
    'DRAFT': 'Bản nháp'
  };
  
  // Chuyển đổi status về chữ hoa để so sánh không phân biệt chữ hoa/thường
  const upperStatus = status.toUpperCase();
  return statusMap[upperStatus] || status;
};

// Helper function to get status color
const getStatusColor = (status) => {
  if (!status) return 'default';
  
  const statusColorMap = {
    'VALID': 'success',
    'EXPIRED': 'error',
    'REVOKED': 'error',
    'PENDING': 'warning',
    'PROCESSING': 'info',
    'REJECTED': 'error',
    'ACTIVE': 'success',
    'INACTIVE': 'error',
    'DRAFT': 'default'
  };
  
  // Chuyển đổi status về chữ hoa để so sánh không phân biệt chữ hoa/thường
  const upperStatus = status.toUpperCase();
  return statusColorMap[upperStatus] || 'default';
};

const DocumentDetailPage = () => {
  // Đảm bảo chúng ta lấy thông tin tham số URL một cách đúng đắn
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Chiến lược lấy ID theo thứ tự ưu tiên:
  // 1. Từ useParams() - params.id
  // 2. Từ state truyền qua navigate
  // 3. Từ phân tích URL trực tiếp
  
  // 1. Lấy id từ params
  const idFromParams = params?.id;
  
  // 2. Lấy document data từ state khi chuyển trang
  const documentDataFromState = location.state?.documentData;
  
  // 3. Phân tích path nếu không có các phương án trên
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const idFromPath = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : null;
  
  // Xác định document ID cuối cùng theo thứ tự ưu tiên
  const documentId = idFromParams || (documentDataFromState ? documentDataFromState.id : null) || idFromPath;
  
  // Logging chi tiết để debug
  console.log('-------- DocumentDetailPage Debug Info --------');
  console.log('useParams():', params);
  console.log('location.pathname:', location.pathname);
  console.log('pathSegments:', pathSegments);
  console.log('idFromParams:', idFromParams);
  console.log('idFromPath:', idFromPath);
  console.log('documentDataFromState:', documentDataFromState);
  console.log('Final documentId used:', documentId);
  console.log('-----------------------------------------------');
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [document, setDocument] = useState(documentDataFromState || null);
  const [printLoading, setPrintLoading] = useState(false);
  
  // Dialog states
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [printData, setPrintData] = useState(null);
  
  // Copy state
  const [verificationCodeCopied, setVerificationCodeCopied] = useState(false);
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchDocumentDetails = async () => {
      try {
        // Nếu đã có dữ liệu từ state, không cần gọi API
        if (documentDataFromState && isMounted) {
          console.log('Using document data from state:', documentDataFromState);
          setDocument(documentDataFromState);
          setLoading(false);
          return;
        }
        
        // Kiểm tra document ID có hợp lệ không
        if (!documentId || documentId === 'undefined' || documentId === 'null' || documentId === '') {
          console.error('Invalid document ID:', documentId);
          if (isMounted) {
            setError('ID giấy tờ không hợp lệ. Vui lòng quay lại trang danh sách giấy tờ.');
            setLoading(false);
          }
          return;
        }
        
        console.log(`Fetching document details with ID: ${documentId}`);
        
        let data;
        try {
          // Thử gọi API thực
          data = await citizenService.getDocumentDetails(documentId);
          console.log('Document details received from API:', data);
        } catch (apiError) {
          console.warn('Error fetching from real API, falling back to mock data:', apiError);
          // Nếu API thất bại, sử dụng mock data
          data = await mockFetchDocumentDetails(documentId);
          console.log('Using mock data instead:', data);
        }
        
        if (!data || Object.keys(data).length === 0) {
          console.error('Empty document data received');
          if (isMounted) {
            setError('Không tìm thấy thông tin giấy tờ. Giấy tờ có thể đã bị xóa hoặc không tồn tại.');
            setLoading(false);
          }
          return;
        }
        
        if (isMounted) {
          setDocument(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching document details:', err);
        if (isMounted) {
          setError(err.message || 'Có lỗi xảy ra khi tải thông tin giấy tờ. Vui lòng thử lại sau.');
          setLoading(false);
        }
      }
    };
    
    fetchDocumentDetails();
    
    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [documentId, documentDataFromState]);
  
  // Handle copy verification code
  const handleCopyVerificationCode = () => {
    const verificationCode = document?.verificationCode || document?.documentId;
    if (verificationCode) {
      navigator.clipboard.writeText(verificationCode);
      setVerificationCodeCopied(true);
      
      // Reset copy status after 2 seconds
      setTimeout(() => {
        setVerificationCodeCopied(false);
      }, 2000);
    } else {
      alert('Không có mã xác thực để sao chép');
    }
  };
  
  // Handle open QR dialog
  const handleOpenQrDialog = () => {
    setQrDialogOpen(true);
  };
  
  // Handle close QR dialog
  const handleCloseQrDialog = () => {
    setQrDialogOpen(false);
  };
  
  // Handle open history dialog
  const handleOpenHistoryDialog = () => {
    setHistoryDialogOpen(true);
  };
  
  // Handle close history dialog
  const handleCloseHistoryDialog = () => {
    setHistoryDialogOpen(false);
  };
  
  // Handle document download
  const handleDownload = async () => {
    try {
      console.log('Download requested for document ID:', documentId);
      
      if (!documentId || documentId === 'undefined' || documentId === 'null' || documentId === '') {
        console.error('Cannot download document: Invalid document ID', documentId);
        alert('ID giấy tờ không hợp lệ. Không thể tải xuống.');
        return;
      }
      
      console.log('Calling downloadDocument API with ID:', documentId);
      await citizenService.downloadDocument(documentId);
      console.log('Download document successful');
    } catch (err) {
      console.error('Error downloading document:', err);
      alert('Có lỗi xảy ra khi tải xuống giấy tờ. Vui lòng thử lại sau.');
    }
  };
  
  // Handle document print
  const handlePrint = async () => {
    try {
      console.log('Print requested for document ID:', documentId);
      
      if (!documentId || documentId === 'undefined' || documentId === 'null' || documentId === '') {
        console.error('Cannot print document: Invalid document ID', documentId);
        alert('ID giấy tờ không hợp lệ. Không thể in.');
        return;
      }
      
      setPrintLoading(true);
      // Gọi API để lấy dữ liệu in
      console.log('Calling printDocument API with ID:', documentId);
      const printData = await citizenService.printDocument(documentId);
      console.log('Print data received:', printData);
      
      // Lưu dữ liệu in và mở dialog
      setPrintData(printData);
      setPrintDialogOpen(true);
      
      // Tự động in sau khi dialog mở
      setTimeout(() => {
        renderPrintContent(printData);
        window.print();
      }, 500);
    } catch (err) {
      console.error('Error preparing document for print:', err);
      alert('Có lỗi xảy ra khi chuẩn bị in giấy tờ. Vui lòng thử lại sau.');
    } finally {
      setPrintLoading(false);
    }
  };
  
  // Render print content
  const renderPrintContent = (data) => {
    if (!data) return null;
    
    // Tạo một trang in tạm thời
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Trình duyệt đã chặn cửa sổ popup. Vui lòng cho phép popup và thử lại.');
      return;
    }
    
    // Tạo nội dung HTML cho trang in
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>In giấy tờ: ${data.title || data.document_id}</title>
        <meta charset="utf-8" />
        <style>
          body {
            font-family: 'Times New Roman', serif;
            margin: 0;
            padding: 20px;
            color: #000;
          }
          .print-container {
            max-width: 21cm;
            margin: 0 auto;
            padding: 2cm;
            border: 1px solid #ddd;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .header h1 {
            font-size: 16pt;
            font-weight: bold;
            margin: 5px 0;
            text-transform: uppercase;
          }
          .header h2 {
            font-size: 14pt;
            font-weight: bold;
            margin: 5px 0;
            text-transform: uppercase;
          }
          .header .separator {
            margin: 10px auto;
            width: 30%;
            border-top: 2px solid #000;
          }
          .document-title {
            text-align: center;
            font-size: 18pt;
            font-weight: bold;
            margin: 30px 0;
            text-transform: uppercase;
          }
          .content {
            margin: 20px 0;
          }
          .content-row {
            margin: 10px 0;
          }
          .content-row .label {
            font-weight: bold;
          }
          .footer {
            margin-top: 40px;
            text-align: right;
          }
          .signature-area {
            margin-top: 10px;
            height: 120px;
          }
          .verification {
            margin-top: 30px;
            padding: 10px;
            border: 1px dashed #999;
            font-size: 9pt;
          }
          .verification-code {
            font-weight: bold;
            font-family: monospace;
            font-size: 10pt;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          td {
            padding: 5px;
            vertical-align: top;
          }
          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            .print-container {
              border: none;
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <!-- Tiêu đề trang -->
          <div class="header">
            <h1>${data.document_header.title}</h1>
            <h2>${data.document_header.subtitle}</h2>
            <div class="separator"></div>
          </div>
          
          <!-- Tiêu đề giấy tờ -->
          <div class="document-title">
            ${data.title || formatDocumentType(data.document_type)}
          </div>
          
          <!-- Nội dung chính -->
          <div class="content">
            <table>
              <tr>
                <td width="30%" class="label">Mã giấy tờ:</td>
                <td>${data.document_id}</td>
              </tr>
              <tr>
                <td class="label">Loại giấy tờ:</td>
                <td>${typeof data.document_type === 'string' ? formatDocumentType(data.document_type) : data.document_type}</td>
              </tr>
              <tr>
                <td class="label">Người được cấp:</td>
                <td>${data.citizen ? data.citizen.full_name : 'Không xác định'}</td>
              </tr>
              ${data.citizen && data.citizen.profile ? `
              <tr>
                <td class="label">Số CMND/CCCD:</td>
                <td>${data.citizen.profile.id_number || 'Không có'}</td>
              </tr>
              <tr>
                <td class="label">Địa chỉ:</td>
                <td>${data.citizen.profile.address || 'Không có'}</td>
              </tr>
              ` : ''}
              <tr>
                <td class="label">Ngày cấp:</td>
                <td>${data.issue_date || 'Không xác định'}</td>
              </tr>
              <tr>
                <td class="label">Ngày có hiệu lực:</td>
                <td>${data.valid_from || 'Không xác định'}</td>
              </tr>
              ${data.valid_until ? `
              <tr>
                <td class="label">Ngày hết hạn:</td>
                <td>${data.valid_until}</td>
              </tr>
              ` : ''}
              <tr>
                <td class="label">Trạng thái:</td>
                <td>${data.status || 'Không xác định'}</td>
              </tr>
              <tr>
                <td class="label">Cơ quan cấp:</td>
                <td>${data.print_info.issuing_authority}</td>
              </tr>
            </table>
            
            ${data.content ? `
            <div style="margin-top: 20px;">
              <div class="label">Thông tin chi tiết:</div>
              <div style="margin-top: 10px;">
                ${Object.entries(data.content).map(([key, value]) => `
                  <div style="margin: 5px 0;">
                    <span style="font-weight: bold;">${key}:</span> ${value}
                  </div>
                `).join('')}
              </div>
            </div>
            ` : ''}
            
            <div class="verification">
              <div><strong>Thông tin xác thực:</strong></div>
              <div>Mã xác thực: <span class="verification-code">${data.verification.verification_code}</span></div>
              <div>${data.verification.instructions}</div>
              ${data.blockchain_status ? `
              <div>Đã được xác thực trên blockchain. Mã giao dịch: ${data.blockchain_tx_id}</div>
              ` : ''}
            </div>
          </div>
          
          <!-- Phần chữ ký -->
          <div class="footer">
            <div>${data.document_footer.place_and_date}</div>
            <div>${data.document_footer.position}</div>
            <div class="signature-area">${data.document_footer.signature_placeholder}</div>
            <div><strong>${data.document_footer.officer_name}</strong></div>
          </div>
          
          <!-- Thông tin in -->
          <div style="margin-top: 30px; font-size: 8pt; text-align: center; color: #666;">
            ${data.print_info.footer_text}<br>
            In lúc: ${data.print_info.generated_at} | Mã in: ${data.print_info.print_id}
          </div>
          
          <!-- Nút in (chỉ hiển thị trên màn hình) -->
          <div class="no-print" style="margin-top: 20px; text-align: center;">
            <button onclick="window.print();" style="padding: 10px 20px; cursor: pointer;">In giấy tờ</button>
            <button onclick="window.close();" style="padding: 10px 20px; margin-left: 10px; cursor: pointer;">Đóng</button>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Ghi nội dung vào cửa sổ in
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
  };
  
  // Đóng print dialog
  const handleClosePrintDialog = () => {
    setPrintDialogOpen(false);
  };
  
  // Handle download attachment
  const handleDownloadAttachment = async (attachmentId) => {
    try {
      console.log('Download requested for attachment ID:', attachmentId);
      
      if (!attachmentId) {
        console.error('Cannot download attachment: Invalid attachment ID');
        alert('ID tài liệu đính kèm không hợp lệ. Không thể tải xuống.');
        return;
      }
      
      console.log('Calling downloadAttachment API with ID:', attachmentId);
      await citizenService.downloadAttachment(documentId, attachmentId);
      console.log('Download attachment successful');
    } catch (err) {
      console.error('Error downloading attachment:', err);
      alert('Có lỗi xảy ra khi tải xuống tài liệu đính kèm. Vui lòng thử lại sau.');
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Đang tải thông tin giấy tờ...
        </Typography>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/citizen/documents')}
          >
            Quay lại danh sách giấy tờ
          </Button>
        </Box>
      </Container>
    );
  }
  
  if (!document) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning">
          Không tìm thấy thông tin giấy tờ với mã {documentId}
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/citizen/documents')}
          >
            Quay lại danh sách giấy tờ
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/citizen/documents')}
        >
          Quay lại danh sách giấy tờ
        </Button>
      </Box>
      
      {/* Document Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <DocumentIcon color="primary" sx={{ fontSize: 40 }} />
          </Grid>
          <Grid item xs>
            <Typography variant="h4" component="h1">
              {formatDocumentType(document?.documentType || 'Giấy tờ')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Chip 
                icon={<VerifiedUserIcon />} 
                label={getStatusLabel(document?.status)}
                color={getStatusColor(document?.status)}
                sx={{ mr: 1 }} 
              />
              <Typography variant="body2" color="text.secondary">
                Mã giấy tờ: {document?.documentId || 'Không có mã'}
              </Typography>
            </Box>
          </Grid>
          <Grid item>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<QrCodeIcon />}
                onClick={handleOpenQrDialog}
              >
                Mã QR
              </Button>
              <Button
                variant="outlined"
                startIcon={<HistoryIcon />}
                onClick={handleOpenHistoryDialog}
              >
                Lịch sử
              </Button>
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
              >
                In
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
              >
                Tải xuống
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Document Content */}
      <Grid container spacing={3}>
        {/* Document Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <DocumentIcon sx={{ mr: 1 }} />
              Thông tin giấy tờ
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {document.details && Object.keys(document.details).length > 0 ? (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                    <InfoIcon sx={{ fontSize: 20, mr: 1 }} />
                    Thông tin chính
                  </Typography>
                  <Grid container spacing={2}>
                    {document.details && Object.entries(document.details).map(([key, value]) => (
                      <Grid item xs={12} sm={6} key={key}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {/* Format the key for display */}
                          {key === 'fullName' && 'Họ và tên'}
                          {key === 'dateOfBirth' && 'Ngày sinh'}
                          {key === 'gender' && 'Giới tính'}
                          {key === 'placeOfBirth' && 'Nơi sinh'}
                          {key === 'fatherName' && 'Họ tên cha'}
                          {key === 'motherName' && 'Họ tên mẹ'}
                          {key === 'permanentAddress' && 'Địa chỉ thường trú'}
                          {key === 'currentAddress' && 'Địa chỉ hiện tại'}
                          {key === 'idNumber' && 'Số CMND/CCCD'}
                          {key === 'nationality' && 'Quốc tịch'}
                          {key === 'religion' && 'Tôn giáo'}
                          {key === 'ethnicity' && 'Dân tộc'}
                          {key === 'phoneNumber' && 'Số điện thoại'}
                          {key === 'email' && 'Email'}
                          {key === 'bloodType' && 'Nhóm máu'}
                          {key === 'education' && 'Trình độ học vấn'}
                          {key === 'occupation' && 'Nghề nghiệp'}
                          {key === 'husbandName' && 'Họ tên chồng'}
                          {key === 'husbandDob' && 'Ngày sinh chồng'}
                          {key === 'husbandId' && 'Số CMND/CCCD chồng'}
                          {key === 'husbandNationality' && 'Quốc tịch chồng'}
                          {key === 'wifeName' && 'Họ tên vợ'}
                          {key === 'wifeDob' && 'Ngày sinh vợ'}
                          {key === 'wifeId' && 'Số CMND/CCCD vợ'}
                          {key === 'wifeNationality' && 'Quốc tịch vợ'}
                          {key === 'registrationPlace' && 'Nơi đăng ký'}
                          {key === 'registrationDate' && 'Ngày đăng ký'}
                          {key === 'deceasedName' && 'Người mất'}
                          {key === 'dateOfDeath' && 'Ngày mất'}
                          {key === 'placeOfDeath' && 'Nơi mất'}
                          {key === 'causeOfDeath' && 'Nguyên nhân'}
                          {key === 'declarerName' && 'Người khai báo'}
                          {key === 'relationship' && 'Mối quan hệ với người khai báo'}
                          {key === 'landAddress' && 'Địa chỉ thửa đất'}
                          {key === 'landArea' && 'Diện tích đất'}
                          {key === 'landPurpose' && 'Mục đích sử dụng đất'}
                          {key === 'landTimeOfUse' && 'Thời hạn sử dụng đất'}
                          {key === 'landMap' && 'Số hiệu thửa đất trên bản đồ'}
                          {key === 'businessName' && 'Tên doanh nghiệp'}
                          {key === 'businessType' && 'Loại hình doanh nghiệp'}
                          {key === 'businessAddress' && 'Địa chỉ trụ sở chính'}
                          {key === 'businessField' && 'Ngành nghề kinh doanh'}
                          {key === 'businessCapital' && 'Vốn điều lệ'}
                          {key === 'drivingLicenseClass' && 'Hạng giấy phép lái xe'}
                          {key === 'vehicleType' && 'Loại phương tiện'}
                          {key === 'degreeType' && 'Loại bằng cấp'}
                          {key === 'major' && 'Ngành học'}
                          {key === 'graduationYear' && 'Năm tốt nghiệp'}
                          {key === 'classification' && 'Xếp loại'}
                          {key === 'universityName' && 'Trường đại học'}
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          mb: 2, 
                          fontWeight: key === 'fullName' || key === 'businessName' || key === 'deceasedName' ? 'bold' : 'normal',
                          color: key === 'dateOfDeath' || key === 'causeOfDeath' ? 'error.main' : 'text.primary'
                        }}>
                          {key === 'dateOfBirth' || key === 'husbandDob' || key === 'wifeDob' || key === 'registrationDate' || key === 'dateOfDeath' || key === 'graduationYear'
                            ? (value ? format(new Date(value), 'dd/MM/yyyy', { locale: vi }) : 'Không có')
                            : key === 'landArea'
                              ? `${value} m²`
                              : key === 'businessCapital'
                                ? `${value?.toLocaleString()} VNĐ`
                                : (value || 'Không có')}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
                
                {document.additionalInfo && Object.keys(document.additionalInfo).length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1, color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                        <InfoIcon sx={{ fontSize: 20, mr: 1 }} />
                        Thông tin bổ sung
                      </Typography>
                      <Grid container spacing={2}>
                        {Object.entries(document.additionalInfo).map(([key, value]) => (
                          <Grid item xs={12} sm={6} key={key}>
                            <Typography variant="subtitle2" color="text.secondary">
                              {key}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              {value || 'Không có'}
                            </Typography>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </>
                )}
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                    <GavelIcon sx={{ fontSize: 20, mr: 1 }} />
                    Thông tin pháp lý
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Ngày cấp
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {document?.issuedAt ? format(new Date(document.issuedAt), 'dd/MM/yyyy', { locale: vi }) : 'Không có thông tin'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Trạng thái
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        <Chip 
                          label={getStatusLabel(document?.status)}
                          color={getStatusColor(document?.status)}
                          size="small"
                        />
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Đơn vị cấp
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {document?.issuedBy || 'Không có thông tin'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Cán bộ xác nhận
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {document?.officerName || 'Không có thông tin'}
                      </Typography>
                    </Grid>
                    
                    {document?.expiresAt && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Ngày hết hạn
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {format(new Date(document.expiresAt), 'dd/MM/yyyy', { locale: vi })}
                        </Typography>
                      </Grid>
                    )}
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Mã xác thực
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1" sx={{ mr: 1 }}>
                          {document?.verificationCode || document?.documentId || 'Không có mã xác thực'}
                        </Typography>
                        <Tooltip title="Sao chép mã">
                          <IconButton 
                            size="small" 
                            onClick={handleCopyVerificationCode}
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
                
                {document.notes && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1, color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                        <CommentIcon sx={{ fontSize: 20, mr: 1 }} />
                        Ghi chú
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'background.default' }}>
                        <Typography variant="body2">
                          {document.notes || 'Không có ghi chú'}
                        </Typography>
                      </Paper>
                    </Box>
                  </>
                )}
                
                {document.attachments && document.attachments.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    
                    <Box>
                      <Typography variant="subtitle1" sx={{ mb: 1, color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                        <AttachFileIcon sx={{ fontSize: 20, mr: 1 }} />
                        Tài liệu đính kèm
                      </Typography>
                      <List dense>
                        {document.attachments.map((attachment, index) => (
                          <ListItem key={index} 
                            secondaryAction={
                              <IconButton edge="end" onClick={() => handleDownloadAttachment(attachment.id)}>
                                <DownloadIcon />
                              </IconButton>
                            }
                          >
                            <ListItemIcon>
                              <InsertDriveFileIcon />
                            </ListItemIcon>
                            <ListItemText 
                              primary={attachment.name || `Tài liệu ${index + 1}`}
                              secondary={attachment.description || 'Không có mô tả'}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </>
                )}
              </>
            ) : (
              <Alert severity="info" sx={{ mb: 2 }}>
                Không có thông tin chi tiết về giấy tờ này.
              </Alert>
            )}
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                startIcon={<HistoryIcon />}
                onClick={handleOpenHistoryDialog}
              >
                Xem lịch sử
              </Button>
              
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
              >
                Tải xuống
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Document Metadata */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin xác thực
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Mã xác thực
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ mr: 1 }}>
                  {document?.verificationCode || document?.documentId || 'Không có mã xác thực'}
                </Typography>
                <Tooltip title={verificationCodeCopied ? "Đã sao chép!" : "Sao chép mã"}>
                  <IconButton 
                    size="small" 
                    onClick={handleCopyVerificationCode}
                    color={verificationCodeCopied ? "success" : "default"}
                  >
                    {verificationCodeCopied ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Ngày cấp
              </Typography>
              <Typography variant="body1">
                {document?.issuedAt ? format(new Date(document.issuedAt), 'dd/MM/yyyy', { locale: vi }) : 'Không có thông tin'}
              </Typography>
            </Box>
            
            {document?.expiresAt && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Ngày hết hạn
                </Typography>
                <Typography variant="body1">
                  {format(new Date(document.expiresAt), 'dd/MM/yyyy', { locale: vi })}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Đơn vị cấp
              </Typography>
              <Typography variant="body1">
                {document?.issuedBy || 'Không có thông tin'}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Cán bộ thực hiện
              </Typography>
              <Typography variant="body1">
                {document?.officerName || 'Không có thông tin'}
              </Typography>
            </Box>
          </Paper>
          
          <Card variant="outlined" sx={{ p: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LockIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">
                  Thông tin Blockchain
                </Typography>
              </Box>
              
              <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
                Giấy tờ này đã được xác thực và bảo mật trên blockchain, đảm bảo tính toàn vẹn và không thể thay đổi.
              </Alert>
              
              <Box sx={{ backgroundColor: 'action.hover', p: 2, borderRadius: 1, mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
                  Thông tin giao dịch blockchain
                </Typography>
                
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">
                      Mã giao dịch:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                      {document?.transactionId || 'Không có thông tin'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">
                      Thời gian:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="caption">
                      {document?.blockchainTimestamp ? format(new Date(document.blockchainTimestamp), 'dd/MM/yyyy HH:mm:ss', { locale: vi }) : 'Không có thông tin'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">
                      Hash nội dung:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                      {document?.contentHash || 'Không có thông tin'}
                    </Typography>
                    <Tooltip title="Sao chép hash">
                      <IconButton size="small" onClick={() => {
                        if (document?.contentHash) {
                          navigator.clipboard.writeText(document.contentHash);
                          alert('Đã sao chép hash vào clipboard');
                        }
                      }}>
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button 
                  size="small" 
                  startIcon={<QrCodeIcon />}
                  onClick={handleOpenQrDialog}
                >
                  Xem mã QR
                </Button>
                
                <Button 
                  size="small"
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                >
                  In giấy tờ
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onClose={handleCloseQrDialog}>
        <DialogTitle>Mã QR xác thực giấy tờ</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
            <QRCode 
              value={`https://verify.example.com?code=${document?.verificationCode || document?.documentId || 'unknown'}`} 
              size={200}
              level="H"
              includeMargin={true}
            />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Sử dụng mã QR này để xác thực giấy tờ
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Mã xác thực: {document?.verificationCode || document?.documentId || 'Không có mã xác thực'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseQrDialog}>Đóng</Button>
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />}
            onClick={() => alert('Tính năng tải xuống mã QR sẽ được phát triển trong phiên bản tiếp theo.')}
          >
            Tải xuống
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* History Dialog */}
      <Dialog 
        open={historyDialogOpen} 
        onClose={handleCloseHistoryDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Lịch sử hoạt động</DialogTitle>
        <DialogContent>
          <List>
            {document?.transactionHistory && document.transactionHistory.length > 0 ? (
              document.transactionHistory.map((item, index) => (
                <ListItem key={index} divider={index < document.transactionHistory.length - 1}>
                  <ListItemIcon>
                    {item.action === 'CREATE' && <DocumentIcon color="primary" />}
                    {item.action === 'APPROVE' && <CheckIcon color="success" />}
                    {item.action === 'RECORD_ON_BLOCKCHAIN' && <LockIcon color="info" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      item.action === 'CREATE' ? 'Tạo giấy tờ' :
                      item.action === 'APPROVE' ? 'Phê duyệt giấy tờ' :
                      item.action === 'RECORD_ON_BLOCKCHAIN' ? 'Lưu trữ trên blockchain' :
                      item.action
                    }
                    secondary={
                      <React.Fragment>
                        <Typography variant="body2" component="span" color="text.primary">
                          {item.userName || 'Không xác định'} ({item.role || 'user'})
                        </Typography>
                        <Typography variant="body2" component="div" color="text.secondary">
                          {item.timestamp ? format(new Date(item.timestamp), 'HH:mm dd/MM/yyyy', { locale: vi }) : 'Không có thông tin thời gian'}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="Không có lịch sử hoạt động" />
              </ListItem>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHistoryDialog}>Đóng</Button>
        </DialogActions>
      </Dialog>
      
      {/* Print Dialog */}
      <Dialog
        open={printDialogOpen}
        onClose={handleClosePrintDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chuẩn bị in giấy tờ</DialogTitle>
        <DialogContent>
          {printLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
              <CircularProgress />
              <Typography variant="body1" sx={{ ml: 2 }}>
                Đang chuẩn bị bản in...
              </Typography>
            </Box>
          ) : printData ? (
            <Box sx={{ p: 2 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                Đã chuẩn bị bản in thành công. Một cửa sổ in mới đã được mở.
              </Alert>
              
              <Typography variant="subtitle1">Thông tin bản in:</Typography>
              <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">Mã giấy tờ:</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">{printData.document_id}</Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">Tên giấy tờ:</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">{printData.title}</Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">Người được cấp:</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {printData.citizen ? printData.citizen.full_name : 'Không xác định'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">Ngày cấp:</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">{printData.issue_date}</Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">Mã in:</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">{printData.print_info.print_id}</Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">Thời gian tạo:</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">{printData.print_info.generated_at}</Typography>
                  </Grid>
                </Grid>
              </Paper>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Nếu cửa sổ in không tự động mở, hãy nhấn nút bên dưới.
              </Typography>
            </Box>
          ) : (
            <Alert severity="error">
              Không thể tải dữ liệu in. Vui lòng thử lại sau.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePrintDialog}>Đóng</Button>
          {printData && (
            <Button 
              variant="contained" 
              startIcon={<PrintIcon />}
              onClick={() => renderPrintContent(printData)}
            >
              In lại
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DocumentDetailPage;
