export const mockDocumentDetails = {
  doc1: {
    id: 'doc1',
    title: 'Quyết định phê duyệt quy hoạch sử dụng đất',
    document_type: 'Quyết định',
    document_number: 'QD-2023/12345',
    submitted_by: {
      id: 'user1',
      name: 'Nguyễn Văn B',
      position: 'Cán bộ địa chính',
      department: 'Phòng Địa chính'
    },
    submitted_date: '2023-06-10T08:30:00Z',
    status: 'pending',
    priority: 'high',
    description: 'Quyết định phê duyệt quy hoạch sử dụng đất xã giai đoạn 2023-2030',
    blockchain_status: false,
    category: 'land',
    content: 'Nội dung chi tiết của quyết định phê duyệt quy hoạch sử dụng đất',
    attachments: [
      { name: 'QD-2023-12345.pdf', type: 'pdf', size: '2.5 MB', url: '#' },
      { name: 'Ban-do-quy-hoach.pdf', type: 'pdf', size: '5.8 MB', url: '#' }
    ]
  },
  doc2: {
    id: 'doc2',
    title: 'Quy trình xử lý hồ sơ hộ tịch',
    document_type: 'Quy trình',
    document_number: 'QT-2023/54321',
    submitted_by: {
      id: 'user2',
      name: 'Trần Thị B',
      position: 'Cán bộ tư pháp',
      department: 'Phòng Tư pháp'
    },
    submitted_date: '2023-04-15T10:30:00Z',
    status: 'active',
    priority: 'medium',
    category: 'civil',
    description: 'Tài liệu hướng dẫn quy trình xử lý các hồ sơ hộ tịch',
    content: 'Nội dung chi tiết của quy trình xử lý hồ sơ hộ tịch, các bước thực hiện và biểu mẫu kèm theo.',
    attachments: [
      { name: 'QT-2023-54321.docx', type: 'docx', size: '850 KB', url: '#' },
      { name: 'Bieu-mau-ho-tich.docx', type: 'docx', size: '650 KB', url: '#' }
    ]
  },
  doc3: {
    id: 'doc3',
    title: 'Hướng dẫn thực hiện công tác văn thư lưu trữ',
    document_type: 'Hướng dẫn',
    document_number: 'HD-2023/67890',
    submitted_by: {
      id: 'user3',
      name: 'Lê Văn C',
      position: 'Cán bộ văn thư',
      department: 'Phòng Văn thư'
    },
    submitted_date: '2023-03-20T08:45:00Z',
    status: 'active',
    priority: 'medium',
    category: 'archive',
    description: 'Tài liệu hướng dẫn thực hiện công tác văn thư lưu trữ',
    content: 'Nội dung chi tiết về quy trình văn thư lưu trữ, bao gồm việc soạn thảo, ban hành, quản lý văn bản và tài liệu.',
    attachments: [
      { name: 'HD-2023-67890.pdf', type: 'pdf', size: '1.5 MB', url: '#' }
    ]
  },
  doc4: {
    id: 'doc4',
    title: 'Quy định về cấp phép xây dựng',
    document_type: 'Quy định',
    document_number: 'QD-2023/13579',
    submitted_by: {
      id: 'user4',
      name: 'Phạm Thị D',
      position: 'Cán bộ địa chính',
      department: 'Phòng Địa chính'
    },
    submitted_date: '2023-05-02T11:15:00Z',
    status: 'active',
    priority: 'high',
    category: 'construction',
    description: 'Quy định về việc cấp phép xây dựng',
    content: 'Nội dung chi tiết về quy định cấp phép xây dựng, thủ tục và các điều kiện cần đáp ứng.',
    attachments: [
      { name: 'QD-2023-13579.pdf', type: 'pdf', size: '2.1 MB', url: '#' }
    ]
  },
  doc5: {
    id: 'doc5',
    title: 'Hướng dẫn thực hiện dịch vụ công trực tuyến',
    document_type: 'Hướng dẫn',
    document_number: 'HD-2023/24680',
    submitted_by: {
      id: 'user5',
      name: 'Hoàng Văn E',
      position: 'Cán bộ CNTT',
      department: 'Phòng Công nghệ thông tin'
    },
    submitted_date: '2023-04-25T09:30:00Z',
    status: 'active',
    priority: 'medium',
    category: 'service',
    description: 'Tài liệu hướng dẫn thực hiện các dịch vụ công trực tuyến',
    content: 'Nội dung chi tiết hướng dẫn quy trình thực hiện dịch vụ công trực tuyến và cách sử dụng.',
    attachments: [
      { name: 'HD-2023-24680.pptx', type: 'pptx', size: '3.2 MB', url: '#' }
    ]
  }
};

export default mockDocumentDetails; 