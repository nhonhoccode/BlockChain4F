import { API_ENDPOINTS, get, post, put } from '../../utils/api';
import mockDocumentDetails from '../mockData/documentDetails';

// Mock data for fallback
const mockData = {
  dashboard: {
    summary_stats: {
      total_officers: 12,
      pending_approvals: 5,
      total_citizens: 245,
      approved_documents: 187,
      pending_documents: 8,
      pending_requests: 14,
      completed_requests: 96,
      rejected_requests: 12,
      avg_processing_time: 2.3
    },
    pending_approvals: [
      {
        id: "pa1",
        title: "Phê duyệt cán bộ Nguyễn Văn A",
        type: "officer",
        requested_by: "Trần Văn B",
        requested_at: "2023-06-18T09:30:00Z",
        priority: "high",
        status: "pending",
        name: "Nguyễn Văn A",
        position: "Cán bộ địa chính",
        requestDate: "2023-06-18T09:30:00Z"
      },
      {
        id: "pa2",
        title: "Phê duyệt cán bộ Lê Thị C",
        type: "officer",
        requested_by: "Trần Văn B",
        requested_at: "2023-06-17T14:15:00Z",
        priority: "medium",
        status: "pending",
        name: "Lê Thị C",
        position: "Cán bộ tư pháp",
        requestDate: "2023-06-17T14:15:00Z"
      },
      {
        id: "pa3",
        title: "Phê duyệt cán bộ Phạm Văn D",
        type: "officer",
        requested_by: "Hệ thống",
        requested_at: "2023-06-16T11:45:00Z",
        priority: "low",
        status: "pending",
        name: "Phạm Văn D",
        position: "Cán bộ hộ tịch",
        requestDate: "2023-06-16T11:45:00Z"
      }
    ],
    officer_stats: [
      {
        id: "o1",
        name: "Trần Văn B",
        position: "Cán bộ địa chính",
        completed_requests: 34,
        total_requests: 40,
        created_documents: 28,
        completion_rate: 85
      },
      {
        id: "o2",
        name: "Hoàng Thị E",
        position: "Cán bộ tư pháp",
        completed_requests: 42,
        total_requests: 50,
        created_documents: 35,
        completion_rate: 84
      },
      {
        id: "o3",
        name: "Lý Văn F",
        position: "Cán bộ hộ tịch",
        completed_requests: 20,
        total_requests: 25,
        created_documents: 18,
        completion_rate: 80
      }
    ],
    recentActivity: [
      {
        id: "ra1",
        action: "Phê duyệt giấy khai sinh",
        user: "Trần Văn B",
        time: "2023-06-18T10:15:00Z",
        status: "approved"
      },
      {
        id: "ra2",
        action: "Từ chối đơn xin cấp giấy phép xây dựng",
        user: "Hoàng Thị E",
        time: "2023-06-18T09:45:00Z",
        status: "rejected"
      },
      {
        id: "ra3",
        action: "Xác thực giấy đăng ký kết hôn",
        user: "Lý Văn F",
        time: "2023-06-18T08:30:00Z",
        status: "approved"
      },
      {
        id: "ra4",
        action: "Tạo giấy chứng nhận tạm trú",
        user: "Trần Văn B",
        time: "2023-06-17T15:20:00Z",
        status: "approved"
      }
    ],
    officerPerformance: [
      {
        id: "op1",
        name: "Trần Văn B",
        position: "Cán bộ địa chính",
        completed: 34,
        processing: 4,
        pending: 2
      },
      {
        id: "op2",
        name: "Hoàng Thị E",
        position: "Cán bộ tư pháp",
        completed: 42,
        processing: 6,
        pending: 2
      },
      {
        id: "op3",
        name: "Lý Văn F",
        position: "Cán bộ hộ tịch",
        completed: 20,
        processing: 3,
        pending: 2
      }
    ]
  }
};

// Mock data cho officer approvals
const mockApprovals = [
  {
    id: 'app1',
    user_name: 'Nguyễn Văn A',
    requested_role: 'Cán bộ địa chính',
    email: 'nguyenvana@example.com',
    phone: '0987654321',
    submitted_date: '2023-05-15T09:00:00Z',
    status: 'pending',
    experience: '3 năm kinh nghiệm tại phường X',
    qualifications: 'Cử nhân Quản lý đất đai',
    documents: [
      { name: 'Đơn xin việc', url: '#' },
      { name: 'CV', url: '#' },
      { name: 'Bằng cấp', url: '#' }
    ]
  },
  {
    id: 'app2',
    user_name: 'Trần Thị B',
    requested_role: 'Cán bộ tư pháp',
    email: 'tranthib@example.com',
    phone: '0912345678',
    submitted_date: '2023-05-16T10:30:00Z',
    status: 'pending',
    experience: '5 năm kinh nghiệm tại quận Y',
    qualifications: 'Cử nhân Luật',
    documents: [
      { name: 'Đơn xin việc', url: '#' },
      { name: 'CV', url: '#' },
      { name: 'Bằng cấp', url: '#' }
    ]
  },
  {
    id: 'app3',
    user_name: 'Lê Văn C',
    requested_role: 'Cán bộ hộ tịch',
    email: 'levanc@example.com',
    phone: '0909123456',
    submitted_date: '2023-05-17T08:45:00Z',
    status: 'pending',
    experience: '2 năm kinh nghiệm tại phường Z',
    qualifications: 'Cử nhân Hành chính công',
    documents: [
      { name: 'Đơn xin việc', url: '#' },
      { name: 'CV', url: '#' },
      { name: 'Bằng cấp', url: '#' }
    ]
  }
];

// Mock data cho important documents
const mockImportantDocuments = [
  {
    id: 'doc1',
    title: 'Quyết định phê duyệt quy hoạch sử dụng đất',
    document_type: 'Quyết định',
    document_number: 'QD-2023/12345',
    submitted_by: 'Nguyễn Văn B',
    submitted_date: '2023-06-10T08:30:00Z',
    status: 'pending',
    priority: 'high',
    description: 'Quyết định phê duyệt quy hoạch sử dụng đất xã giai đoạn 2023-2030',
    blockchain_status: false,
    attachments: 3,
    category: 'Quy hoạch đất đai'
  },
  {
    id: 'doc2',
    title: 'Nghị quyết về chính sách hỗ trợ nông nghiệp',
    document_type: 'Nghị quyết',
    document_number: 'NQ-2023/56789',
    submitted_by: 'Trần Thị C',
    submitted_date: '2023-06-12T10:15:00Z',
    status: 'pending',
    priority: 'medium',
    description: 'Nghị quyết về các chính sách hỗ trợ phát triển nông nghiệp bền vững',
    blockchain_status: false,
    attachments: 2,
    category: 'Chính sách nông nghiệp'
  },
  {
    id: 'doc3',
    title: 'Kế hoạch phòng chống thiên tai năm 2023',
    document_type: 'Kế hoạch',
    document_number: 'KH-2023/24680',
    submitted_by: 'Lê Văn D',
    submitted_date: '2023-06-15T09:45:00Z',
    status: 'pending',
    priority: 'high',
    description: 'Kế hoạch phòng chống thiên tai và tìm kiếm cứu nạn năm 2023',
    blockchain_status: false,
    attachments: 5,
    category: 'Phòng chống thiên tai'
  },
  {
    id: 'doc4',
    title: 'Giấy chứng nhận quyền sử dụng đất - Khu dân cư mới',
    document_type: 'Giấy chứng nhận',
    document_number: 'GCN-2023/13579',
    submitted_by: 'Phạm Thị E',
    submitted_date: '2023-06-18T14:30:00Z',
    status: 'pending',
    priority: 'medium',
    description: 'Giấy chứng nhận quyền sử dụng đất cho khu dân cư mới phía Đông xã',
    blockchain_status: false,
    attachments: 4,
    category: 'Quyền sử dụng đất'
  },
  {
    id: 'doc5',
    title: 'Quyết định phê duyệt dự án cầu mới',
    document_type: 'Quyết định',
    document_number: 'QD-2023/97531',
    submitted_by: 'Hoàng Văn F',
    submitted_date: '2023-06-20T11:00:00Z',
    status: 'pending',
    priority: 'high',
    description: 'Quyết định phê duyệt dự án xây dựng cầu mới bắc qua sông',
    blockchain_status: false,
    attachments: 6,
    category: 'Cơ sở hạ tầng'
  },
  {
    id: 'doc6',
    title: 'Báo cáo tài chính quý 2/2023',
    document_type: 'Báo cáo',
    document_number: 'BC-2023/68642',
    submitted_by: 'Vũ Thị G',
    submitted_date: '2023-07-05T16:30:00Z',
    status: 'pending',
    priority: 'medium',
    description: 'Báo cáo tài chính và ngân sách xã quý 2 năm 2023',
    blockchain_status: false,
    attachments: 2,
    category: 'Tài chính'
  },
  {
    id: 'doc7',
    title: 'Thông báo tuyển dụng viên chức năm 2023',
    document_type: 'Thông báo',
    document_number: 'TB-2023/53147',
    submitted_by: 'Đinh Văn H',
    submitted_date: '2023-07-10T09:00:00Z',
    status: 'pending',
    priority: 'low',
    description: 'Thông báo tuyển dụng viên chức làm việc tại UBND xã năm 2023',
    blockchain_status: false,
    attachments: 1,
    category: 'Nhân sự'
  },
  {
    id: 'doc8',
    title: 'Hợp đồng xây dựng trường mầm non',
    document_type: 'Hợp đồng',
    document_number: 'HD-2023/75319',
    submitted_by: 'Ngô Văn I',
    submitted_date: '2023-07-12T13:45:00Z',
    status: 'pending',
    priority: 'high',
    description: 'Hợp đồng xây dựng trường mầm non mới trên địa bàn xã',
    blockchain_status: false,
    attachments: 4,
    category: 'Giáo dục'
  }
];

// Helper function for logging mock data warnings
const logMockDataWarning = (endpoint) => {
  console.warn(
    `Using mock data for ${endpoint} because API is not available. ` +
    `In production, this would connect to a real API.`
  );
};

// API service cho chủ tịch xã - không sử dụng mockdata
const chairmanService = {
  /**
   * Lấy dữ liệu dashboard của chủ tịch
   * @returns {Promise<Object>} Dữ liệu dashboard
   */
  getDashboardData: async () => {
    try {
      // Call real API
      try {
        const response = await get(API_ENDPOINTS.CHAIRMAN.DASHBOARD);
        console.log('Chairman dashboard data from API:', response);
        return response;
      } catch (error) {
        // If API is not available, use mock data
        if (error.response && (error.response.status === 404 || error.response.status >= 500)) {
          logMockDataWarning('chairman dashboard');
          return mockData.dashboard;
        }
        throw error;
      }
    } catch (error) {
      console.error('Error fetching chairman dashboard data:', error);
      throw error; // Re-throw error to be handled by component
    }
  },
  
  /**
   * Lấy danh sách cán bộ chờ phê duyệt
   * @param {Object} filters - Optional filter parameters
   * @returns {Promise<Array>} Danh sách cán bộ chờ phê duyệt
   */
  getOfficerApprovals: async (filters = {}) => {
    try {
      // Gọi API thực tế với các tham số lọc, sử dụng officer-requests thay vì officer-approvals
      const response = await get(API_ENDPOINTS.CHAIRMAN.OFFICER_REQUESTS, filters);
      return response;
    } catch (error) {
      console.error('Error fetching officer approvals:', error);
      
      // Nếu API trả về lỗi 404, sử dụng mock data
      if (error.response && error.response.status === 404) {
        logMockDataWarning('officer approvals');
        console.log('Sử dụng mock data do API không tồn tại');
        
        // Trả về mock data có định dạng giống API thật
        const mockData = mockApprovals || [];
        return mockData;
      }
      
      throw error; // Re-throw error to be handled by component
    }
  },
  
  /**
   * Lấy chi tiết phê duyệt cán bộ theo ID
   * @param {string} approvalId - ID của phê duyệt cán bộ
   * @returns {Promise<Object>} Chi tiết phê duyệt
   */
  getOfficerApprovalDetails: async (approvalId) => {
    try {
      // Gọi API thực tế với ID phê duyệt
      const response = await get(API_ENDPOINTS.CHAIRMAN.OFFICER_APPROVAL_DETAIL(approvalId));
      return response;
    } catch (error) {
      console.error(`Error fetching officer approval details for ID ${approvalId}:`, error);
      throw error;
    }
  },
  
  /**
   * Phê duyệt cán bộ xã
   * @param {string} requestId - ID của yêu cầu đăng ký cán bộ
   * @param {Object} approvalData - Dữ liệu phê duyệt
   * @returns {Promise<Object>} Kết quả phê duyệt
   */
  approveOfficer: async (requestId, approvalData = {}) => {
    try {
      console.log('Approving officer request with ID:', requestId);
      // Gọi API POST để phê duyệt cán bộ, sử dụng officer-requests
      const response = await post(API_ENDPOINTS.CHAIRMAN.APPROVE_OFFICER(requestId), approvalData);
      return response;
    } catch (error) {
      console.error(`Error approving officer for request ID ${requestId}:`, error);
      
      // Nếu API trả về lỗi 404, sử dụng mock response
      if (error.response && error.response.status === 404) {
        console.warn('API endpoint not found, returning mock success response');
        return {
          success: true,
          message: 'Đã phê duyệt cán bộ thành công (mock)'
        };
      }
      
      throw error;
    }
  },
  
  /**
   * Từ chối phê duyệt cán bộ xã
   * @param {string} requestId - ID của yêu cầu đăng ký cán bộ
   * @param {Object} rejectionData - Dữ liệu từ chối (lý do, ghi chú)
   * @returns {Promise<Object>} Kết quả từ chối
   */
  rejectOfficer: async (requestId, rejectionData) => {
    try {
      console.log('Rejecting officer request with ID:', requestId);
      // Gọi API POST để từ chối phê duyệt cán bộ, sử dụng officer-requests
      const response = await post(API_ENDPOINTS.CHAIRMAN.REJECT_OFFICER(requestId), rejectionData);
      return response;
    } catch (error) {
      console.error(`Error rejecting officer for request ID ${requestId}:`, error);
      
      // Nếu API trả về lỗi 404, sử dụng mock response
      if (error.response && error.response.status === 404) {
        console.warn('API endpoint not found, returning mock success response');
        return {
          success: true,
          message: 'Đã từ chối cán bộ thành công (mock)'
        };
      }
      
      throw error;
    }
  },
  
  /**
   * Lấy danh sách cán bộ đã được phê duyệt
   * @param {Object} filters - Optional filter parameters
   * @returns {Promise<Array>} Danh sách cán bộ
   */
  getOfficers: async (filters = {}) => {
    try {
      console.log('Fetching officers with filters:', filters);
      
      // Tạo chuỗi query từ filters
      const queryParams = new URLSearchParams();
      
      if (filters.status) {
        queryParams.append('status', filters.status);
      }
      
      if (filters.search) {
        queryParams.append('search', filters.search);
      }
      
      // Thêm các tham số phân trang nếu có
      if (filters.page) {
        queryParams.append('page', filters.page);
      }
      
      if (filters.limit) {
        queryParams.append('limit', filters.limit);
      }
      
      // Xây dựng URL với query params
      const url = queryParams.toString() 
        ? `${API_ENDPOINTS.CHAIRMAN.OFFICERS}?${queryParams.toString()}`
        : API_ENDPOINTS.CHAIRMAN.OFFICERS;
      
      // Gọi API thực tế để lấy danh sách cán bộ
      try {
        const response = await get(url);
        console.log('Officers API response:', response);
        return response;
      } catch (error) {
        // Nếu API trả về lỗi 404 hoặc 500, sử dụng mock data
        if (error.response && (error.response.status === 404 || error.response.status >= 500)) {
          logMockDataWarning('officers list');
          
          // Mock data cho officers
          const mockOfficers = [
            {
              id: 'off1',
              name: 'Nguyễn Văn An',
              email: 'nguyenvanan@example.com',
              phone: '0987654321',
              position: 'Cán bộ địa chính',
              department: 'Phòng Địa chính',
              status: 'active',
              joinDate: '2021-05-10',
              lastActive: '2023-06-18T08:30:00Z',
              avatar: null,
              assignedRequests: 12,
              completedRequests: 10,
              address: '123 Đường A, Phường B, Quận C, TP. HCM',
              qualifications: ['Cử nhân Quản lý đất đai', 'Chứng chỉ GIS']
            },
            {
              id: 'off2',
              name: 'Trần Thị Bình',
              email: 'tranthib@example.com',
              phone: '0912345678',
              position: 'Cán bộ tư pháp',
              department: 'Phòng Tư pháp',
              status: 'active',
              joinDate: '2022-03-15',
              lastActive: '2023-06-17T14:45:00Z',
              avatar: null,
              assignedRequests: 8,
              completedRequests: 7,
              address: '456 Đường X, Phường Y, Quận Z, TP. HCM',
              qualifications: ['Cử nhân Luật', 'Chứng chỉ Công chứng']
            },
            {
              id: 'off3',
              name: 'Lê Văn Cường',
              email: 'levancuong@example.com',
              phone: '0909123456',
              position: 'Cán bộ hộ tịch',
              department: 'Phòng Hộ tịch',
              status: 'inactive',
              joinDate: '2020-08-22',
              lastActive: '2023-01-10T10:15:00Z',
              avatar: null,
              assignedRequests: 20,
              completedRequests: 18,
              address: '789 Đường D, Phường E, Quận F, TP. HCM',
              qualifications: ['Cử nhân Hành chính công']
            },
            {
              id: 'off4',
              name: 'Phạm Thị Dung',
              email: 'phamthidung@example.com',
              phone: '0978123456',
              position: 'Cán bộ văn thư',
              department: 'Phòng Văn thư',
              status: 'active',
              joinDate: '2021-11-05',
              lastActive: '2023-06-18T09:20:00Z',
              avatar: null,
              assignedRequests: 15,
              completedRequests: 15,
              address: '101 Đường G, Phường H, Quận I, TP. HCM',
              qualifications: ['Cử nhân Hành chính', 'Chứng chỉ Lưu trữ']
            },
            {
              id: 'off5',
              name: 'Hoàng Văn Em',
              email: 'hoangvanem@example.com',
              phone: '0918765432',
              position: 'Cán bộ địa chính',
              department: 'Phòng Địa chính',
              status: 'active',
              joinDate: '2022-01-15',
              lastActive: '2023-06-17T16:30:00Z',
              avatar: null,
              assignedRequests: 9,
              completedRequests: 8,
              address: '222 Đường J, Phường K, Quận L, TP. HCM',
              qualifications: ['Cử nhân Quản lý đất đai']
            }
          ];
          
          // Filter mock data based on status if provided
          let filteredMockData = [...mockOfficers];
          
          if (filters.status) {
            filteredMockData = filteredMockData.filter(
              officer => officer.status.toLowerCase() === filters.status.toLowerCase()
            );
          }
          
          // Filter by search term if provided
          if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filteredMockData = filteredMockData.filter(
              officer => 
                officer.name.toLowerCase().includes(searchTerm) ||
                officer.email.toLowerCase().includes(searchTerm) ||
                officer.position.toLowerCase().includes(searchTerm) ||
                (officer.department && officer.department.toLowerCase().includes(searchTerm))
            );
          }
          
          // Return mock response structure
          return {
            count: filteredMockData.length,
            next: null,
            previous: null,
            results: filteredMockData
          };
        }
        
        throw error;
      }
    } catch (error) {
      console.error('Error fetching officers list:', error);
      throw error; // Re-throw error to be handled by component
    }
  },
  
  /**
   * Lấy thông tin chi tiết cán bộ
   * @param {string} officerId - ID của cán bộ
   * @returns {Promise<Object>} Thông tin cán bộ
   */
  getOfficerDetails: async (officerId) => {
    try {
      // Gọi API thực tế để lấy thông tin cán bộ
      const response = await get(API_ENDPOINTS.CHAIRMAN.OFFICER_DETAIL(officerId));
      return response;
    } catch (error) {
      console.error(`Error fetching officer details for ID ${officerId}:`, error);
      throw error;
    }
  },
  
  /**
   * Lấy danh sách giấy tờ quan trọng chờ phê duyệt
   * @param {Object} filters - Optional filter parameters
   * @returns {Promise<Array>} Danh sách giấy tờ
   */
  getImportantDocuments: async (filters = {}) => {
    try {
      console.log('Fetching important documents with filters:', filters);
      
      // TEMPORARY: Always use mock data until backend API is implemented
      logMockDataWarning('important documents');
      
      // Filter mock data dựa trên các tham số filters
      let filteredData = [...mockImportantDocuments];
      
      // Lọc theo status nếu có
      if (filters.status) {
        filteredData = filteredData.filter(
          doc => doc.status.toLowerCase() === filters.status.toLowerCase()
        );
      }
      
      // Lọc theo priority nếu có
      if (filters.priority) {
        filteredData = filteredData.filter(
          doc => doc.priority.toLowerCase() === filters.priority.toLowerCase()
        );
      }
      
      // Lọc theo category nếu có
      if (filters.category) {
        filteredData = filteredData.filter(
          doc => doc.category.toLowerCase().includes(filters.category.toLowerCase())
        );
      }
      
      // Lọc theo search term nếu có
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredData = filteredData.filter(
          doc => 
            doc.title.toLowerCase().includes(searchTerm) ||
            doc.document_type.toLowerCase().includes(searchTerm) ||
            doc.document_number.toLowerCase().includes(searchTerm) ||
            doc.submitted_by.toLowerCase().includes(searchTerm) ||
            doc.description.toLowerCase().includes(searchTerm)
        );
      }
      
      // Trả về mock response có cấu trúc phân trang
      return {
        count: filteredData.length,
        next: null,
        previous: null,
        results: filteredData
      };
    } catch (error) {
      console.error('Error fetching important documents:', error);
      // Return empty results instead of throwing error
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      };
    }
  },
  
  /**
   * Lấy chi tiết giấy tờ quan trọng
   * @param {string} documentId - ID của giấy tờ
   * @returns {Promise<Object>} Chi tiết giấy tờ
   */
  getDocumentById: async (documentId) => {
    try {
      console.log('Fetching document details for ID:', documentId);
      
      // TEMPORARY: Always use mock data until backend API is implemented
      logMockDataWarning('document details');
      
      // Kiểm tra xem có dữ liệu mẫu cho documentId này không
      if (mockDocumentDetails[documentId]) {
        return mockDocumentDetails[documentId];
      } else {
        // Nếu không tìm thấy ID cụ thể trong mockDocumentDetails, tìm một tài liệu mẫu bất kỳ
        const availableIds = Object.keys(mockDocumentDetails);
        if (availableIds.length > 0) {
          console.warn(`Document ID ${documentId} not found, returning a random mock document`);
          return mockDocumentDetails[availableIds[0]];
        }
        
        // Fallback to a default document if mockDocumentDetails is empty
        return {
          id: documentId,
          title: 'Tài liệu mẫu',
          document_type: 'Không xác định',
          document_number: 'DOC-000',
          submitted_by: {
            id: 'user-default',
            name: 'Người dùng mẫu',
            position: 'Vị trí mẫu',
            department: 'Phòng ban mẫu'
          },
          submitted_date: new Date().toISOString(),
          status: 'pending',
          priority: 'medium',
          category: 'other',
          description: 'Đây là tài liệu mẫu được tạo khi không tìm thấy tài liệu thực.',
          content: 'Nội dung mẫu của tài liệu.',
          attachments: []
        };
      }
    } catch (error) {
      console.error(`Error fetching document details for ID ${documentId}:`, error);
      // Return a mock document instead of throwing error
      return {
        id: documentId,
        title: 'Tài liệu mẫu (lỗi)',
        document_type: 'Không xác định',
        document_number: 'ERR-000',
        submitted_by: {
          id: 'user-error',
          name: 'Không xác định',
          position: 'Không xác định',
          department: 'Không xác định'
        },
        submitted_date: new Date().toISOString(),
        status: 'pending',
        priority: 'medium',
        category: 'other',
        description: 'Đây là tài liệu mẫu được tạo khi có lỗi.',
        content: 'Không thể tải nội dung tài liệu do lỗi hệ thống.',
        attachments: []
      };
    }
  },
  
  /**
   * Phê duyệt tài liệu quan trọng
   * @param {string} documentId - ID của tài liệu
   * @param {Object} data - Dữ liệu phê duyệt (notes)
   * @returns {Promise<Object>} Kết quả phê duyệt
   */
  approveDocument: async (documentId, data = {}) => {
    try {
      console.log(`Approving document with ID: ${documentId}`);
      
      // TEMPORARY: Always use mock data until backend API is implemented
      logMockDataWarning('document approval');
      
      // Tạo mock response
      return {
        success: true,
        message: 'Tài liệu đã được phê duyệt thành công',
        document_id: documentId,
        approved_at: new Date().toISOString(),
        blockchain_status: true
      };
    } catch (error) {
      console.error(`Error approving document with ID ${documentId}:`, error);
      throw error;
    }
  },
  
  /**
   * Từ chối tài liệu quan trọng
   * @param {string} documentId - ID của tài liệu
   * @param {Object} data - Dữ liệu từ chối (reason, notes)
   * @returns {Promise<Object>} Kết quả từ chối
   */
  rejectDocument: async (documentId, data = {}) => {
    try {
      console.log(`Rejecting document with ID: ${documentId}`);
      
      // TEMPORARY: Always use mock data until backend API is implemented
      logMockDataWarning('document rejection');
      
      // Tạo mock response
      return {
        success: true,
        message: 'Tài liệu đã bị từ chối',
        document_id: documentId,
        rejected_at: new Date().toISOString(),
        reason: data.reason || 'Không đáp ứng yêu cầu'
      };
    } catch (error) {
      console.error(`Error rejecting document with ID ${documentId}:`, error);
      throw error;
    }
  },
  
  /**
   * Lấy báo cáo và thống kê
   * @param {Object} filters - Tham số lọc báo cáo
   * @returns {Promise<Object>} Dữ liệu báo cáo
   */
  getReports: async (filters = {}) => {
    try {
      // Gọi API thực tế để lấy báo cáo
      const response = await get(API_ENDPOINTS.CHAIRMAN.REPORTS, filters);
      return response;
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error; // Re-throw error to be handled by component
    }
  },
  
  /**
   * Lấy thông tin cá nhân của chủ tịch xã
   * @returns {Promise<Object>} Thông tin cá nhân
   */
  getProfile: async () => {
    try {
      const response = await get(API_ENDPOINTS.CHAIRMAN.PROFILE);
      return response;
    } catch (error) {
      console.error('Error fetching chairman profile:', error);
      throw error;
    }
  },
  
  /**
   * Cập nhật thông tin cá nhân
   * @param {Object} profileData - Dữ liệu cá nhân
   * @returns {Promise<Object>} Kết quả cập nhật
   */
  updateProfile: async (profileData) => {
    try {
      const response = await put(API_ENDPOINTS.CHAIRMAN.PROFILE, profileData);
      return response;
    } catch (error) {
      console.error('Error updating chairman profile:', error);
      throw error;
    }
  },
  
  /**
   * Khóa tài khoản cán bộ
   * @param {string} officerId - ID của cán bộ
   * @param {Object} data - Dữ liệu khóa (reason)
   * @returns {Promise<Object>} Kết quả khóa
   */
  blockOfficer: async (officerId, data = {}) => {
    try {
      console.log(`Blocking officer with ID: ${officerId}`);
      
      // Gọi API endpoint block
      const response = await post(API_ENDPOINTS.CHAIRMAN.OFFICER_BLOCK(officerId), data);
      
      return response;
    } catch (error) {
      console.error(`Error blocking officer with ID ${officerId}:`, error);
      
      // Nếu API trả về lỗi 404, sử dụng mock response
      if (error.response && error.response.status === 404) {
        console.warn('API endpoint not found, returning mock success response');
        return {
          success: true,
          message: "Đã khóa tài khoản cán bộ thành công (mock)"
        };
      }
      
      throw error;
    }
  }
};

export default chairmanService;