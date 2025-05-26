// Mock data for citizen requests
export const mockRequests = [
  { 
    request_id: 'KS-20240522-001', 
    request_type: 'Giấy khai sinh', 
    description: 'Đăng ký khai sinh cho con trai',
    status: 'completed',
    citizen: {
      id: 1,
      first_name: 'Nguyễn',
      last_name: 'Văn A',
      email: 'citizen1@example.com'
    },
    assigned_to: {
      id: 3,
      first_name: 'Lê',
      last_name: 'Văn C',
      email: 'officer1@example.com'
    },
    comments: 'Đã hoàn thành và cấp giấy',
    created_at: '2024-05-01T10:30:00Z',
    updated_at: '2024-05-03T16:20:00Z',
    tracking_history: [
      {
        timestamp: '2024-05-01T10:30:00Z',
        status: 'pending',
        description: 'Yêu cầu đã được tạo',
        actor: 'Nguyễn Văn A'
      },
      {
        timestamp: '2024-05-02T09:15:00Z',
        status: 'processing',
        description: 'Yêu cầu được giao cho Lê Văn C',
        actor: 'Hệ thống'
      },
      {
        timestamp: '2024-05-03T16:20:00Z',
        status: 'completed',
        description: 'Yêu cầu đã được xử lý hoàn tất',
        actor: 'Lê Văn C'
      }
    ]
  },
  { 
    request_id: 'CMND-20240522-001', 
    request_type: 'Chứng minh nhân dân', 
    description: 'Đổi CMND mới do hết hạn',
    status: 'processing',
    citizen: {
      id: 1,
      first_name: 'Nguyễn',
      last_name: 'Văn A',
      email: 'citizen1@example.com'
    },
    assigned_to: {
      id: 3,
      first_name: 'Lê',
      last_name: 'Văn C',
      email: 'officer1@example.com'
    },
    comments: 'Đang xử lý hồ sơ',
    created_at: '2024-05-05T09:15:00Z',
    updated_at: '2024-05-06T11:30:00Z',
    tracking_history: [
      {
        timestamp: '2024-05-05T09:15:00Z',
        status: 'pending',
        description: 'Yêu cầu đã được tạo',
        actor: 'Nguyễn Văn A'
      },
      {
        timestamp: '2024-05-06T11:30:00Z',
        status: 'processing',
        description: 'Yêu cầu được giao cho Lê Văn C',
        actor: 'Hệ thống'
      }
    ]
  },
  { 
    request_id: 'TT-20240522-001', 
    request_type: 'Đăng ký thường trú', 
    description: 'Đăng ký thường trú tại địa chỉ mới',
    status: 'pending',
    citizen: {
      id: 1,
      first_name: 'Nguyễn',
      last_name: 'Văn A',
      email: 'citizen1@example.com'
    },
    assigned_to: null,
    comments: null,
    created_at: '2024-05-07T14:20:00Z',
    updated_at: '2024-05-07T14:20:00Z',
    tracking_history: [
      {
        timestamp: '2024-05-07T14:20:00Z',
        status: 'pending',
        description: 'Yêu cầu đã được tạo',
        actor: 'Nguyễn Văn A'
      }
    ]
  },
  { 
    request_id: 'KH-20240522-001', 
    request_type: 'Giấy đăng ký kết hôn', 
    description: 'Đăng ký kết hôn',
    status: 'rejected',
    citizen: {
      id: 1,
      first_name: 'Nguyễn',
      last_name: 'Văn A',
      email: 'citizen1@example.com'
    },
    assigned_to: {
      id: 3,
      first_name: 'Lê',
      last_name: 'Văn C',
      email: 'officer1@example.com'
    },
    comments: 'Thiếu giấy tờ cần thiết',
    created_at: '2024-04-25T11:00:00Z',
    updated_at: '2024-04-28T15:45:00Z',
    tracking_history: [
      {
        timestamp: '2024-04-25T11:00:00Z',
        status: 'pending',
        description: 'Yêu cầu đã được tạo',
        actor: 'Nguyễn Văn A'
      },
      {
        timestamp: '2024-04-26T09:30:00Z',
        status: 'processing',
        description: 'Yêu cầu được giao cho Lê Văn C',
        actor: 'Hệ thống'
      },
      {
        timestamp: '2024-04-28T15:45:00Z',
        status: 'rejected',
        description: 'Yêu cầu bị từ chối',
        actor: 'Lê Văn C'
      }
    ]
  },
  { 
    request_id: 'XT-20240522-001', 
    request_type: 'Xác nhận tạm trú', 
    description: 'Xác nhận tạm trú 6 tháng',
    status: 'pending',
    citizen: {
      id: 1,
      first_name: 'Nguyễn',
      last_name: 'Văn A',
      email: 'citizen1@example.com'
    },
    assigned_to: null,
    comments: null,
    created_at: '2024-05-10T08:30:00Z',
    updated_at: '2024-05-10T08:30:00Z',
    tracking_history: [
      {
        timestamp: '2024-05-10T08:30:00Z',
        status: 'pending',
        description: 'Yêu cầu đã được tạo',
        actor: 'Nguyễn Văn A'
      }
    ]
  }
];

// Mock data for citizen documents
export const mockDocuments = [
  {
    id: 1,
    document_id: 'KS-20240522-001',
    document_type: 'birth_certificate',
    title: 'Giấy khai sinh',
    description: 'Giấy khai sinh cho Nguyễn Văn A',
    status: 'active',
    citizen: {
      id: 1,
      first_name: 'Nguyễn',
      last_name: 'Văn A',
      email: 'citizen1@example.com'
    },
    issued_by: {
      id: 3,
      first_name: 'Lê',
      last_name: 'Văn C',
      email: 'officer1@example.com'
    },
    issue_date: '2024-05-03',
    valid_from: '2024-05-03',
    valid_until: null,
    created_at: '2024-05-03T16:20:00Z',
    updated_at: '2024-05-03T16:20:00Z',
    blockchain_status: true,
    blockchain_tx_id: '0x7a3d7b8c9d0e1f2a3b4c5d6e7f8a9b0c',
    blockchain_timestamp: '2024-05-03T17:30:00Z',
    file_url: '/media/documents/KS-20240522-001.pdf'
  },
  {
    id: 2,
    document_id: 'CMND-20240522-001',
    document_type: 'id_card',
    title: 'Chứng minh nhân dân',
    description: 'Chứng minh nhân dân cho Nguyễn Văn A',
    status: 'active',
    citizen: {
      id: 1,
      first_name: 'Nguyễn',
      last_name: 'Văn A',
      email: 'citizen1@example.com'
    },
    issued_by: {
      id: 3,
      first_name: 'Lê',
      last_name: 'Văn C',
      email: 'officer1@example.com'
    },
    issue_date: '2024-04-15',
    valid_from: '2024-04-15',
    valid_until: '2034-04-15',
    created_at: '2024-04-15T10:45:00Z',
    updated_at: '2024-04-15T10:45:00Z',
    blockchain_status: true,
    blockchain_tx_id: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
    blockchain_timestamp: '2024-04-15T11:30:00Z',
    file_url: '/media/documents/CMND-20240522-001.pdf'
  },
  {
    id: 3,
    document_id: 'TT-20240522-001',
    document_type: 'residence_certificate',
    title: 'Đăng ký thường trú',
    description: 'Đăng ký thường trú cho Nguyễn Văn A',
    status: 'draft',
    citizen: {
      id: 1,
      first_name: 'Nguyễn',
      last_name: 'Văn A',
      email: 'citizen1@example.com'
    },
    issued_by: null,
    issue_date: null,
    valid_from: null,
    valid_until: null,
    created_at: '2024-05-12T09:20:00Z',
    updated_at: '2024-05-12T09:20:00Z',
    blockchain_status: false,
    blockchain_tx_id: null,
    blockchain_timestamp: null,
    file_url: null
  },
  {
    id: 4,
    document_id: 'KH-20240522-001',
    document_type: 'marriage_certificate',
    title: 'Giấy đăng ký kết hôn',
    description: 'Giấy đăng ký kết hôn cho Nguyễn Văn A và Trần Thị B',
    status: 'expired',
    citizen: {
      id: 1,
      first_name: 'Nguyễn',
      last_name: 'Văn A',
      email: 'citizen1@example.com'
    },
    issued_by: {
      id: 3,
      first_name: 'Lê',
      last_name: 'Văn C',
      email: 'officer1@example.com'
    },
    issue_date: '2019-06-10',
    valid_from: '2019-06-10',
    valid_until: '2024-06-10',
    created_at: '2019-06-10T14:30:00Z',
    updated_at: '2019-06-10T14:30:00Z',
    blockchain_status: false,
    blockchain_tx_id: null,
    blockchain_timestamp: null,
    file_url: '/media/documents/KH-20240522-001.pdf'
  },
  {
    id: 5,
    document_id: 'XT-20240522-001',
    document_type: 'temporary_residence',
    title: 'Xác nhận tạm trú',
    description: 'Xác nhận tạm trú 6 tháng cho Nguyễn Văn A',
    status: 'active',
    citizen: {
      id: 1,
      first_name: 'Nguyễn',
      last_name: 'Văn A',
      email: 'citizen1@example.com'
    },
    issued_by: {
      id: 3,
      first_name: 'Lê',
      last_name: 'Văn C',
      email: 'officer1@example.com'
    },
    issue_date: '2024-03-20',
    valid_from: '2024-03-20',
    valid_until: '2024-09-20',
    created_at: '2024-03-20T11:15:00Z',
    updated_at: '2024-03-20T11:15:00Z',
    blockchain_status: true,
    blockchain_tx_id: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e',
    blockchain_timestamp: '2024-03-20T12:00:00Z',
    file_url: '/media/documents/XT-20240522-001.pdf'
  }
]; 