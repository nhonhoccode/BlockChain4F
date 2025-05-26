viết script tuwj dộng tạo các thư mục và file theo cây thư mục sau đầy đủ chi tiết không được thiếu


# Cấu trúc thư mục chi tiết cho Ứng dụng Web quản lý hành chính cấp xã theo mô hình Blockchain

## 🔖 Thư mục gốc

```
blockchain-administrative-management/
├── docker/                          # Docker files cho triển khai
├── kubernetes/                      # Cấu hình Kubernetes cho production
├── frontend/                        # Frontend React
├── backend/                         # Django backend
├── blockchain/                      # Smart contracts và chaincode  
├── scripts/                         # Deployment và automation scripts
├── tests/                           # Test cases
├── docs/                            # Tài liệu dự án
├── monitoring/                      # Monitoring stack
├── security/                        # Security components
├── .github/                         # CI/CD config (GitHub Actions)
├── .gitlab-ci.yml                   # GitLab CI/CD (thay thế)
├── .gitignore
└── README.md
```

## 🔖 Frontend (React)

```
frontend/
├── public/                         # Static assets
│   ├── images/                     # Hình ảnh
│   │   ├── logo.svg                # Logo ứng dụng
│   │   ├── favicon.ico             # Favicon
│   │   ├── avatars/                # Avatar mẫu
│   │   └── illustrations/          # Hình minh họa
│   ├── fonts/                      # Font chữ
│   │   ├── roboto/                 # Font Roboto
│   │   └── open-sans/              # Font Open Sans
│   ├── locales/                    # File ngôn ngữ
│   │   ├── vi.json                 # Tiếng Việt
│   │   └── en.json                 # Tiếng Anh
│   └── index.html                  # HTML entry point
├── src/                            # Source code
│   ├── assets/                     # Hình ảnh, fonts
│   │   ├── images/                 # Hình ảnh local
│   │   ├── styles/                 # Global styles
│   │   │   ├── variables.scss      # SCSS variables
│   │   │   ├── mixins.scss         # SCSS mixins
│   │   │   └── global.scss         # Global styles
│   │   └── fonts/                  # Font chữ local
│   ├── components/                 # Components UI tái sử dụng
│   │   ├── common/                 # Common components
│   │   │   ├── Header/             # Header component
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Header.module.scss
│   │   │   │   ├── UserMenu.jsx    # Menu người dùng
│   │   │   │   ├── Notifications.jsx # Thông báo
│   │   │   │   └── index.js
│   │   │   ├── Footer/             # Footer component
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Footer.module.scss
│   │   │   │   └── index.js
│   │   │   ├── Sidebar/            # Sidebar component
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Sidebar.module.scss
│   │   │   │   ├── SidebarItem.jsx
│   │   │   │   └── index.js
│   │   │   ├── Forms/              # Form components
│   │   │   │   ├── TextField/
│   │   │   │   ├── SelectField/
│   │   │   │   ├── FileUpload/
│   │   │   │   ├── DatePicker/
│   │   │   │   └── FormBuilder.jsx # Dynamic form builder
│   │   │   ├── Buttons/            # Button components
│   │   │   │   ├── PrimaryButton/
│   │   │   │   ├── SecondaryButton/
│   │   │   │   └── IconButton/
│   │   │   ├── Tables/             # Table components
│   │   │   │   ├── DataTable/      # Datatable with sort/filter
│   │   │   │   ├── TableActions/   # Action buttons
│   │   │   │   └── TableFilters/   # Filter components
│   │   │   ├── Cards/              # Card components
│   │   │   │   ├── StatCard/       # Statistic card
│   │   │   │   ├── InfoCard/       # Information card
│   │   │   │   └── DocumentCard/   # Document preview card
│   │   │   ├── Modals/             # Modal components
│   │   │   │   ├── ConfirmModal/   # Confirm modal
│   │   │   │   ├── FormModal/      # Form in modal
│   │   │   │   └── ViewModal/      # View details modal
│   │   │   ├── Loaders/            # Loading indicators
│   │   │   │   ├── Spinner/
│   │   │   │   ├── SkeletonLoader/
│   │   │   │   └── LoadingOverlay/
│   │   │   ├── Alerts/             # Alert components
│   │   │   │   ├── SuccessAlert/
│   │   │   │   ├── ErrorAlert/
│   │   │   │   └── InfoAlert/
│   │   │   └── BlockchainBadge/    # Badge hiển thị blockchain status
│   │   ├── citizen/                # Components cho người dân 
│   │   │   ├── Dashboard/          # Dashboard cho người dân
│   │   │   │   ├── CitizenDashboard.jsx
│   │   │   │   ├── RequestStatusWidget.jsx
│   │   │   │   ├── DocumentsWidget.jsx
│   │   │   │   └── NotificationsWidget.jsx
│   │   │   ├── RequestForm/        # Form yêu cầu giấy tờ
│   │   │   │   ├── RequestWizard.jsx # Form wizard theo bước
│   │   │   │   ├── DocumentTypeSelector.jsx # Chọn loại giấy tờ
│   │   │   │   ├── RequestFormFields.jsx # Các trường form
│   │   │   │   ├── AttachmentUploader.jsx # Upload tài liệu
│   │   │   │   └── RequestSummary.jsx # Tóm tắt yêu cầu
│   │   │   ├── RequestList/        # Danh sách yêu cầu
│   │   │   │   ├── RequestTable.jsx # Bảng yêu cầu
│   │   │   │   ├── RequestFilter.jsx # Lọc yêu cầu
│   │   │   │   ├── RequestDetail.jsx # Chi tiết yêu cầu
│   │   │   │   └── TrackingTimeline.jsx # Timeline theo dõi
│   │   │   ├── Documents/          # Quản lý giấy tờ đã cấp
│   │   │   │   ├── DocumentList.jsx # Danh sách giấy tờ
│   │   │   │   ├── DocumentViewer.jsx # Xem giấy tờ
│   │   │   │   ├── DocumentVerification.jsx # Xác thực giấy tờ
│   │   │   │   └── DocumentDownload.jsx # Tải giấy tờ
│   │   │   └── Feedback/           # Form góp ý, phản ánh
│   │   │       ├── FeedbackForm.jsx # Form góp ý
│   │   │       ├── FeedbackList.jsx # Danh sách góp ý
│   │   │       └── FeedbackDetail.jsx # Chi tiết góp ý
│   │   ├── officer/                # Components cho cán bộ xã
│   │   │   ├── Dashboard/          # Dashboard cho cán bộ xã
│   │   │   │   ├── OfficerDashboard.jsx
│   │   │   │   ├── PendingRequests.jsx # Widget yêu cầu chờ xử lý
│   │   │   │   ├── TasksWidget.jsx # Widget công việc được giao
│   │   │   │   └── StatsWidget.jsx # Widget thống kê
│   │   │   ├── RequestManagement/  # Quản lý yêu cầu
│   │   │   │   ├── RequestList.jsx # Danh sách yêu cầu
│   │   │   │   ├── RequestDetail.jsx # Chi tiết yêu cầu
│   │   │   │   ├── RequestAssignment.jsx # Phân công xử lý
│   │   │   │   ├── ProcessForm.jsx # Form xử lý yêu cầu
│   │   │   │   ├── DocumentGeneration.jsx # Tạo giấy tờ
│   │   │   │   └── RequestRejection.jsx # Từ chối yêu cầu
│   │   │   ├── CitizenManagement/  # Quản lý công dân
│   │   │   │   ├── CitizenList.jsx # Danh sách công dân
│   │   │   │   ├── CitizenDetail.jsx # Chi tiết công dân
│   │   │   │   ├── CitizenDocuments.jsx # Giấy tờ của công dân
│   │   │   │   └── CitizenRequests.jsx # Yêu cầu của công dân
│   │   │   ├── OfficerProfile/     # Thông tin cán bộ
│   │   │   │   ├── ProfileView.jsx # Xem thông tin
│   │   │   │   ├── ProfileEdit.jsx # Sửa thông tin
│   │   │   │   └── ApprovalStatus.jsx # Trạng thái phê duyệt
│   │   │   └── Reporting/          # Báo cáo
│   │   │       ├── DailyReport.jsx # Báo cáo ngày
│   │   │       ├── WeeklyReport.jsx # Báo cáo tuần
│   │   │       ├── MonthlyReport.jsx # Báo cáo tháng
│   │   │       └── StatisticsReport.jsx # Báo cáo thống kê
│   │   └── chairman/               # Components cho chủ tịch xã
│   │       ├── Dashboard/          # Dashboard cho chủ tịch
│   │       │   ├── ChairmanDashboard.jsx
│   │       │   ├── OfficersWidget.jsx # Widget cán bộ
│   │       │   ├── ApprovalWidget.jsx # Widget phê duyệt
│   │       │   └── OverviewStats.jsx # Thống kê tổng quan
│   │       ├── OfficerManagement/  # Quản lý cán bộ
│   │       │   ├── OfficerList.jsx # Danh sách cán bộ
│   │       │   ├── OfficerDetail.jsx # Chi tiết cán bộ
│   │       │   ├── OfficerApproval.jsx # Phê duyệt cán bộ
│   │       │   ├── OfficerApprovalList.jsx # Danh sách phê duyệt
│   │       │   ├── OfficerApprovalDetail.jsx # Chi tiết phê duyệt
│   │       │   ├── OfficerAssignment.jsx # Phân công công việc
│   │       │   └── OfficerStatistics.jsx # Thống kê cán bộ
│   │       ├── ApprovalWorkflow/   # Phê duyệt cán bộ và giấy tờ quan trọng
│   │       │   ├── ApprovalQueue.jsx # Hàng đợi phê duyệt
│   │       │   ├── ImportantDocumentApproval.jsx # Phê duyệt giấy tờ quan trọng
│   │       │   ├── OfficerApprovalWorkflow.jsx # Quy trình phê duyệt cán bộ
│   │       │   ├── ApprovalHistory.jsx # Lịch sử phê duyệt
│   │       │   └── BlockchainVerification.jsx # Xác thực blockchain
│   │       └── Analytics/          # Phân tích dữ liệu
│   │           ├── PerformanceAnalytics.jsx # Phân tích hiệu suất
│   │           ├── RequestAnalytics.jsx # Phân tích yêu cầu
│   │           ├── CitizenAnalytics.jsx # Phân tích người dân
│   │           └── DepartmentAnalytics.jsx # Phân tích theo phòng ban
│   ├── layouts/                    # Layout templates
│   │   ├── MainLayout/             # Layout chính
│   │   │   ├── MainLayout.jsx      # (header, main, footer)
│   │   │   ├── MainLayout.module.scss
│   │   │   └── index.js
│   │   ├── AuthLayout/             # Layout cho đăng nhập/đăng ký
│   │   │   ├── AuthLayout.jsx
│   │   │   ├── AuthLayout.module.scss
│   │   │   └── index.js
│   │   ├── CitizenLayout/          # Layout cho người dân
│   │   │   ├── CitizenLayout.jsx
│   │   │   ├── CitizenLayout.module.scss
│   │   │   └── index.js
│   │   ├── OfficerLayout/          # Layout cho cán bộ xã
│   │   │   ├── OfficerLayout.jsx
│   │   │   ├── OfficerLayout.module.scss
│   │   │   └── index.js
│   │   ├── ChairmanLayout/         # Layout cho chủ tịch xã
│   │   │   ├── ChairmanLayout.jsx
│   │   │   ├── ChairmanLayout.module.scss
│   │   │   └── index.js
│   │   └── PrintLayout/            # Layout cho in ấn giấy tờ
│   │       ├── PrintLayout.jsx
│   │       ├── PrintLayout.module.scss
│   │       └── index.js
│   ├── pages/                      # Trang chính
│   │   ├── public/                 # Trang công khai
│   │   │   ├── Home/               # Trang chủ
│   │   │   │   ├── HomePage.jsx
│   │   │   │   ├── HomePage.module.scss
│   │   │   │   └── index.js
│   │   │   ├── About/              # Giới thiệu
│   │   │   │   ├── AboutPage.jsx
│   │   │   │   └── index.js
│   │   │   ├── Contact/            # Liên hệ
│   │   │   │   ├── ContactPage.jsx
│   │   │   │   └── index.js
│   │   │   └── DocumentVerify/     # Xác thực giấy tờ công khai
│   │   │       ├── DocumentVerifyPage.jsx
│   │   │       └── index.js
│   │   ├── auth/                   # Trang xác thực
│   │   │   ├── Login/              # Đăng nhập
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   ├── LoginPage.module.scss
│   │   │   │   └── index.js
│   │   │   ├── Register/           # Đăng ký
│   │   │   │   ├── RegisterPage.jsx
│   │   │   │   ├── RegisterPage.module.scss
│   │   │   │   └── index.js
│   │   │   ├── OfficerRegister/    # Đăng ký cán bộ xã
│   │   │   │   ├── OfficerRegisterPage.jsx
│   │   │   │   ├── OfficerRegisterPage.module.scss
│   │   │   │   └── index.js
│   │   │   └── ResetPassword/      # Khôi phục mật khẩu
│   │   │       ├── ResetPasswordPage.jsx
│   │   │       └── index.js
│   │   ├── citizen/                # Trang cho công dân
│   │   │   ├── Dashboard/          # Trang chủ công dân
│   │   │   │   ├── CitizenDashboardPage.jsx
│   │   │   │   └── index.js
│   │   │   ├── Profile/            # Hồ sơ cá nhân
│   │   │   │   ├── CitizenProfilePage.jsx
│   │   │   │   └── index.js
│   │   │   ├── Requests/           # Yêu cầu giấy tờ
│   │   │   │   ├── NewRequestPage.jsx # Trang tạo yêu cầu mới
│   │   │   │   ├── RequestsListPage.jsx # Danh sách yêu cầu
│   │   │   │   ├── RequestDetailPage.jsx # Chi tiết yêu cầu
│   │   │   │   └── index.js
│   │   │   ├── Documents/          # Giấy tờ đã cấp
│   │   │   │   ├── DocumentsPage.jsx
│   │   │   │   ├── DocumentDetailPage.jsx
│   │   │   │   └── index.js
│   │   │   └── Feedback/           # Phản hồi, góp ý
│   │   │       ├── FeedbackPage.jsx
│   │   │       └── index.js
│   │   ├── officer/                # Trang cho cán bộ xã
│   │   │   ├── Dashboard/          # Trang chủ cán bộ
│   │   │   │   ├── OfficerDashboardPage.jsx
│   │   │   │   └── index.js
│   │   │   ├── ProcessRequest/     # Xử lý yêu cầu
│   │   │   │   ├── RequestsQueuePage.jsx # Hàng đợi yêu cầu
│   │   │   │   ├── ProcessRequestPage.jsx # Xử lý yêu cầu
│   │   │   │   ├── DocumentGenerationPage.jsx # Tạo giấy tờ
│   │   │   │   └── index.js
│   │   │   ├── CitizenManagement/  # Quản lý công dân
│   │   │   │   ├── CitizenListPage.jsx # Danh sách công dân
│   │   │   │   ├── CitizenDetailPage.jsx # Chi tiết công dân
│   │   │   │   └── index.js
│   │   │   ├── Profile/            # Thông tin cá nhân
│   │   │   │   ├── OfficerProfilePage.jsx
│   │   │   │   └── index.js 
│   │   │   ├── ApprovalStatus/     # Trạng thái phê duyệt
│   │   │   │   ├── ApprovalStatusPage.jsx
│   │   │   │   └── index.js
│   │   │   └── Statistics/         # Thống kê
│   │   │       ├── StatisticsPage.jsx
│   │   │       └── index.js
│   │   └── chairman/               # Trang cho chủ tịch xã
│   │       ├── Dashboard/          # Trang chủ chủ tịch
│   │       │   ├── ChairmanDashboardPage.jsx
│   │       │   └── index.js
│   │       ├── OfficerApproval/    # Phê duyệt cán bộ
│   │       │   ├── OfficerApprovalListPage.jsx # Danh sách chờ phê duyệt
│   │       │   ├── OfficerApprovalDetailPage.jsx # Chi tiết phê duyệt
│   │       │   ├── ApprovedOfficersPage.jsx # Danh sách đã phê duyệt
│   │       │   └── index.js
│   │       ├── OfficerManagement/  # Quản lý cán bộ
│   │       │   ├── OfficersPage.jsx # Danh sách cán bộ
│   │       │   ├── OfficerDetailPage.jsx # Chi tiết cán bộ
│   │       │   ├── AssignTasksPage.jsx # Phân công nhiệm vụ
│   │       │   └── index.js
│   │       ├── ImportantDocuments/ # Duyệt giấy tờ quan trọng
│   │       │   ├── PendingDocumentsPage.jsx # Chờ phê duyệt
│   │       │   ├── DocumentApprovalPage.jsx # Trang phê duyệt
│   │       │   └── index.js
│   │       └── Reports/            # Báo cáo tổng hợp
│   │           ├── OverviewReportPage.jsx # Báo cáo tổng quan
│   │           ├── PerformanceReportPage.jsx # Báo cáo hiệu suất
│   │           ├── ActivityReportPage.jsx # Báo cáo hoạt động
│   │           └── index.js
│   ├── services/                   # Services API, blockchain
│   │   ├── api/                    # API services
│   │   │   ├── authService.js      # Authentication service
│   │   │   ├── citizenService.js   # Service cho công dân
│   │   │   ├── officerService.js   # Service cho cán bộ
│   │   │   ├── chairmanService.js  # Service cho chủ tịch
│   │   │   ├── documentService.js  # Service cho giấy tờ
│   │   │   ├── requestService.js   # Service cho yêu cầu
│   │   │   ├── feedbackService.js  # Service cho phản hồi
│   │   │   └── notificationService.js # Service cho thông báo
│   │   └── blockchain/             # Blockchain services
│   │       ├── documentContract.js # Tương tác với smart contract giấy tờ
│   │       ├── userContract.js     # Tương tác với smart contract người dùng
│   │       ├── officerContract.js  # Tương tác với smart contract cán bộ
│   │       ├── approvalContract.js # Tương tác với smart contract phê duyệt
│   │       └── verificationService.js # Dịch vụ xác thực blockchain
│   ├── store/                      # State management
│   │   ├── slices/                 # Redux slices
│   │   │   ├── authSlice.js        # Authentication state
│   │   │   ├── documentSlice.js    # Document state
│   │   │   ├── requestSlice.js     # Request state
│   │   │   ├── userSlice.js        # User state
│   │   │   ├── officerSlice.js     # Officer state
│   │   │   ├── chairmanSlice.js    # Chairman state
│   │   │   └── notificationSlice.js # Notification state
│   │   ├── actions/                # Redux actions
│   │   │   ├── authActions.js
│   │   │   ├── documentActions.js
│   │   │   ├── requestActions.js
│   │   │   ├── officerActions.js
│   │   │   └── citizenActions.js
│   │   └── store.js                # Redux store
│   ├── hooks/                      # Custom hooks
│   │   ├── useAuth.js              # Authentication hook
│   │   ├── useBlockchain.js        # Blockchain hook
│   │   ├── useForm.js              # Form handling hook
│   │   ├── useNotification.js      # Notification hook
│   │   ├── useOfficerApproval.js   # Hook xử lý phê duyệt cán bộ
│   │   └── useDocumentRequest.js   # Hook xử lý yêu cầu giấy tờ
│   ├── utils/                      # Tiện ích
│   │   ├── api.js                  # API helper
│   │   ├── validation.js           # Form validation
│   │   ├── formatter.js            # Data formatters
│   │   ├── constants.js            # Constants
│   │   ├── blockchainUtils.js      # Blockchain utilities
│   │   ├── roleUtils.js            # Phân quyền utilities
│   │   └── dateUtils.js            # Date helpers
│   ├── contexts/                   # React contexts
│   │   ├── AuthContext.js          # Authentication context
│   │   ├── ThemeContext.js         # Theme context
│   │   ├── BlockchainContext.js    # Blockchain context
│   │   └── NotificationContext.js  # Notification context
│   ├── i18n/                       # Internationalization
│   │   ├── config.js               # i18n configuration
│   │   ├── translations/           # Translation files
│   │   │   ├── en.js               # English translations
│   │   │   └── vi.js               # Vietnamese translations
│   │   └── index.js                # i18n setup
│   ├── routes/                     # Route definitions
│   │   ├── index.js                # Route setup
│   │   ├── AppRoutes.jsx           # Main routes component
│   │   ├── RouteGuard.jsx          # Route protection component
│   │   ├── publicRoutes.js         # Public routes
│   │   ├── citizenRoutes.js        # Citizen routes
│   │   ├── officerRoutes.js        # Officer routes
│   │   └── chairmanRoutes.js       # Chairman routes
│   ├── theme/                      # Theme configuration
│   │   ├── theme.js                # Theme variables
│   │   ├── ThemeProvider.jsx       # Theme provider component
│   │   └── useTheme.js             # Theme hook
│   ├── config/                     # Configuration files
│   │   ├── api.config.js           # API configuration
│   │   ├── blockchain.config.js    # Blockchain configuration
│   │   └── app.config.js           # App configuration
│   ├── App.js                      # Root component
│   ├── index.js                    # Entry point
│   └── setupTests.js               # Test setup
├── package.json
├── .env                            # Environment variables
├── .env.development                # Development environment
├── .env.production                 # Production environment
└── README.md
```

## 🔖 Backend (Django)

```
backend/
├── core/                              # Core Django configuration
│   ├── settings/
│   │   ├── base.py                    # Cấu hình cơ bản
│   │   ├── development.py             # Cấu hình môi trường phát triển
│   │   └── production.py              # Cấu hình môi trường sản xuất
│   ├── urls.py                        # URL routing chính
│   └── wsgi.py                        # WSGI configuration
├── apps/
│   ├── accounts/                      # Quản lý tài khoản và phân quyền
│   │   ├── admin.py                   # Django admin configuration
│   │   ├── apps.py                    # App configuration
│   │   ├── migrations/                # Database migrations
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py                # Mở rộng Django User model
│   │   │   ├── role.py                # Model vai trò (Chairman, Officer, Citizen)
│   │   │   ├── profile.py             # Model thông tin chi tiết người dùng
│   │   │   └── permission.py          # Model quyền hạn chi tiết
│   │   ├── serializers/
│   │   │   ├── __init__.py
│   │   │   ├── user_serializer.py     # Serializer cho User
│   │   │   ├── role_serializer.py     # Serializer cho Role
│   │   │   └── profile_serializer.py  # Serializer cho Profile
│   │   ├── views/
│   │   │   ├── __init__.py
│   │   │   ├── auth_views.py          # Authentication views (đăng nhập/đăng ký)
│   │   │   ├── profile_views.py       # Quản lý profile người dùng
│   │   │   └── role_views.py          # Quản lý vai trò
│   │   ├── tests/
│   │   │   ├── test_models.py
│   │   │   ├── test_views.py
│   │   │   └── test_serializers.py
│   │   └── urls.py                    # URL routing cho app accounts
│   ├── administrative/                # Quản lý hồ sơ hành chính
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── migrations/
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── document_type.py       # Model loại giấy tờ/hồ sơ
│   │   │   ├── document.py            # Model giấy tờ/hồ sơ đã tạo
│   │   │   ├── request.py             # Model yêu cầu cấp giấy tờ từ công dân
│   │   │   ├── attachment.py          # Model tài liệu đính kèm
│   │   │   └── approval.py            # Model phê duyệt giấy tờ quan trọng
│   │   ├── serializers/
│   │   │   ├── __init__.py
│   │   │   ├── document_type_serializer.py
│   │   │   ├── document_serializer.py
│   │   │   ├── request_serializer.py
│   │   │   └── approval_serializer.py
│   │   ├── views/
│   │   │   ├── __init__.py
│   │   │   ├── document_views.py      # Quản lý giấy tờ
│   │   │   ├── request_views.py       # Quản lý yêu cầu
│   │   │   ├── citizen_views.py       # Views cho công dân
│   │   │   ├── officer_views.py       # Views cho cán bộ xã
│   │   │   └── chairman_views.py      # Views cho chủ tịch xã
│   │   ├── tests/
│   │   └── urls.py
│   ├── officer_management/           # Quản lý cán bộ xã (quan trọng)
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── migrations/
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── officer_request.py     # Model đăng ký làm cán bộ xã
│   │   │   ├── officer_approval.py    # Model phê duyệt cán bộ xã
│   │   │   └── officer_assignment.py  # Model phân công nhiệm vụ cho cán bộ
│   │   ├── serializers/
│   │   │   ├── __init__.py
│   │   │   ├── officer_request_serializer.py
│   │   │   ├── officer_approval_serializer.py
│   │   │   └── officer_assignment_serializer.py
│   │   ├── views/
│   │   │   ├── __init__.py
│   │   │   ├── request_views.py       # Đăng ký làm cán bộ xã
│   │   │   ├── approval_views.py      # Phê duyệt cán bộ xã (chủ tịch xã)
│   │   │   └── assignment_views.py    # Phân công nhiệm vụ
│   │   ├── tests/
│   │   └── urls.py
│   ├── blockchain/                    # Kết nối và xử lý blockchain
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── migrations/
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── blockchain_record.py   # Lưu trữ thông tin giao dịch blockchain
│   │   │   └── smart_contract.py      # Quản lý thông tin smart contract
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── hyperledger.py         # Service giao tiếp với Hyperledger Fabric
│   │   │   ├── document_contract.py   # Service cho smart contract giấy tờ
│   │   │   ├── officer_contract.py    # Service cho smart contract cán bộ
│   │   │   └── verification.py        # Service xác thực thông tin từ blockchain
│   │   ├── views/
│   │   │   ├── __init__.py
│   │   │   └── blockchain_views.py    # Views liên quan đến blockchain
│   │   ├── tests/
│   │   └── urls.py
│   ├── notifications/                 # Hệ thống thông báo
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── migrations/
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── notification.py        # Model thông báo
│   │   ├── consumers.py               # WebSocket consumers
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── tests/
│   │   └── urls.py
│   └── feedback/                      # Phản ánh từ người dân
│       ├── admin.py
│       ├── apps.py
│       ├── migrations/
│       ├── models/
│       │   ├── __init__.py
│       │   └── feedback.py            # Model phản ánh
│       ├── serializers.py
│       ├── views.py
│       ├── tests/
│       └── urls.py
├── api/                               # Django REST Framework APIs
│   ├── __init__.py
│   ├── v1/                            # API version 1
│   │   ├── __init__.py
│   │   ├── urls.py                    # URL patterns
│   │   └── views/                     # ViewSets
│   │       ├── __init__.py
│   │       ├── citizen.py             # API endpoints cho công dân
│   │       ├── officer.py             # API endpoints cho cán bộ xã
│   │       └── chairman.py            # API endpoints cho chủ tịch xã
│   └── auth/                          # Authentication API
│       ├── __init__.py
│       ├── urls.py
│       └── views.py
├── utils/                             # Tiện ích
│   ├── __init__.py
│   ├── permissions.py                 # Custom permissions
│   │   ├── is_chairman.py             # Permission kiểm tra chủ tịch xã
│   │   ├── is_officer.py              # Permission kiểm tra cán bộ xã
│   │   └── is_citizen.py              # Permission kiểm tra công dân
│   ├── validators.py                  # Custom validators
│   ├── pagination.py                  # Custom pagination
│   └── middleware.py                  # Custom middleware
├── templates/                         # Django templates
├── static/                            # Static files
├── media/                             # User uploaded files
├── requirements/
│   ├── base.txt                       # Yêu cầu cơ bản
│   ├── dev.txt                        # Yêu cầu môi trường phát triển
│   └── prod.txt                       # Yêu cầu môi trường sản xuất
└── manage.py                          # Django command-line tool
```

3. Thư mục còn lại

```
blockchain/
├── chaincode/                       # Chaincode cho Hyperledger Fabric
│   ├── admin_contract/              # Smart contract cho quản lý hành chính
│   │   ├── lib/
│   │   │   ├── models/              # Định nghĩa các model dữ liệu
│   │   │   │   ├── User.js          # Model người dùng
│   │   │   │   ├── Document.js      # Model giấy tờ
│   │   │   │   └── Request.js       # Model yêu cầu
│   │   │   ├── access-control.js    # Kiểm soát quyền truy cập theo vai trò
│   │   │   │   # Implement logic phân quyền cho 3 actor
│   │   │   ├── officer-approval.js  # Logic phê duyệt cán bộ xã
│   │   │   │   # Function: requestOfficerRole, approveOfficer, rejectOfficer
│   │   │   ├── document-process.js  # Logic xử lý giấy tờ
│   │   │   └── verification.js      # Logic xác thực giấy tờ
│   │   ├── test/                    # Test cases
│   │   │   ├── officer-approval.test.js # Test phê duyệt cán bộ
│   │   │   ├── document-flow.test.js    # Test luồng giấy tờ
│   │   │   └── access-control.test.js   # Test phân quyền
│   │   └── index.js                 # Entry point
│   ├── user_contract/               # Smart contract riêng cho quản lý người dùng
│   │   ├── lib/
│   │   │   ├── user-registry.js     # Đăng ký và quản lý người dùng
│   │   │   ├── role-assignment.js   # Gán vai trò (citizen, officer, chairman)
│   │   │   └── officer-approval.js  # Phê duyệt cán bộ xã
│   │   ├── test/
│   │   │   └── user-flows.test.js   # Test luồng người dùng
│   │   └── index.js
│   └── document_contract/           # Smart contract riêng cho giấy tờ
│       ├── lib/
│       │   ├── document-registry.js # Đăng ký và quản lý giấy tờ
│       │   ├── approval-flow.js     # Luồng phê duyệt giấy tờ
│       │   └── verification.js      # Xác thực giấy tờ
│       ├── test/
│       │   └── document-flow.test.js # Test luồng giấy tờ
│       └── index.js
├── quorum/                          # Smart contracts cho Quorum (Ethereum-based)
│   ├── contracts/
│   │   ├── AdminManagement.sol      # Contract quản lý hành chính
│   │   │   # Cấu trúc dữ liệu, events và functions cho 3 actor
│   │   ├── OfficerRegistry.sol      # Contract đăng ký và phê duyệt cán bộ
│   │   │   # Functions: requestOfficerRole, approveOfficer, rejectOfficer
│   │   │   # Modifier: onlyChairman - Chỉ chủ tịch xã mới có quyền phê duyệt
│   │   ├── DocumentRegistry.sol     # Contract quản lý giấy tờ
│   │   │   # Functions: createDocument, approveDocument, verifyDocument
│   │   │   # Modifier: onlyOfficer, onlyChairman
│   │   └── CitizenRegistry.sol      # Contract quản lý thông tin công dân
│   ├── migrations/
│   │   ├── 1_initial_migration.js
│   │   ├── 2_deploy_user_registry.js
│   │   ├── 3_deploy_officer_registry.js
│   │   └── 4_deploy_document_registry.js
│   └── test/
│       ├── officer_approval_flow.js # Test quy trình phê duyệt cán bộ
│       └── document_flow.js         # Test quy trình giấy tờ
├── networks/                        # Cấu hình mạng blockchain
│   ├── hyperledger/                 # Cấu hình mạng Hyperledger Fabric
│   │   ├── configtx.yaml           # Cấu hình giao dịch
│   │   ├── crypto-config.yaml      # Cấu hình PKI
│   │   ├── docker-compose.yaml     # Compose file cho mạng local
│   │   └── scripts/                # Scripts khởi tạo network
│   │       ├── start-network.sh
│   │       └── generate-certs.sh
│   └── quorum/                      # Cấu hình mạng Quorum
│       ├── genesis.json            # Genesis block configuration
│       ├── docker-compose.yaml     # Compose file cho mạng local
│       └── scripts/                # Scripts khởi tạo
│           └── start-quorum.sh
└── scripts/                        # Scripts utilites
    ├── deploy-contracts.js         # Deploy smart contracts
    ├── register-admin-user.js      # Đăng ký admin user (Chairman)
    └── register-officers.js        # Đăng ký cán bộ xã (chờ phê duyệt)

docker/
├── blockchain/                      # Docker files cho blockchain
│   ├── hyperledger/
│   │   ├── docker-compose.yaml     # Compose file cho Hyperledger
│   │   ├── peer/                   # Configuration cho peer nodes
│   │   ├── orderer/                # Configuration cho orderer nodes
│   │   └── ca/                     # Configuration cho CA server
│   └── quorum/
│       ├── docker-compose.yaml     # Compose file cho Quorum
│       ├── node/                   # Configuration cho quorum nodes
│       └── tx-manager/             # Configuration cho transaction manager
├── backend/                         # Docker files cho backend
│   ├── Dockerfile                  # Django application
│   ├── entrypoint.sh               # Entrypoint script
│   └── nginx/                      # Nginx configuration
├── frontend/                        # Docker files cho frontend
│   ├── Dockerfile                  # React application
│   └── nginx.conf                  # Nginx configuration
├── db/                              # Docker files cho database
│   ├── postgres/
│   │   └── init.sql                # Khởi tạo database, bảng user và roles
│   └── redis/                      # Redis cho cache và task queue
└── docker-compose.yml               # Main compose file

kubernetes/
├── blockchain/                      # K8s manifests cho blockchain
│   ├── hyperledger/
│   │   ├── namespace.yaml          # Namespace cho Hyperledger
│   │   ├── peer-deployment.yaml    # Deployment cho peer nodes
│   │   ├── orderer-deployment.yaml # Deployment cho orderer nodes
│   │   ├── ca-deployment.yaml      # Deployment cho CA server
│   │   └── network-configmap.yaml  # ConfigMap cho cấu hình network
│   └── quorum/
│       ├── namespace.yaml          # Namespace cho Quorum
│       ├── node-statefulset.yaml   # StatefulSet cho Quorum nodes
│       ├── tx-manager-deployment.yaml # Deployment cho tx manager
│       └── network-configmap.yaml  # ConfigMap cho cấu hình network
├── backend/                         # K8s manifests cho backend
│   ├── namespace.yaml              # Namespace cho backend
│   ├── deployment.yaml             # Deployment cho Django app
│   ├── service.yaml                # Service cho Django app
│   ├── ingress.yaml                # Ingress cho API endpoints
│   ├── configmap.yaml              # ConfigMap cho cấu hình
│   └── secrets.yaml                # Secrets cho credentials
├── frontend/                        # K8s manifests cho frontend
│   ├── namespace.yaml              # Namespace cho frontend
│   ├── deployment.yaml             # Deployment cho React app
│   ├── service.yaml                # Service cho React app
│   └── ingress.yaml                # Ingress cho web UI
├── db/                              # K8s manifests cho database
│   ├── postgres/
│   │   ├── statefulset.yaml        # StatefulSet cho PostgreSQL
│   │   ├── service.yaml            # Service cho PostgreSQL
│   │   ├── configmap.yaml          # ConfigMap cho cấu hình
│   │   └── pv-pvc.yaml             # PV và PVC cho persistent storage
│   └── redis/                      # Redis cho cache và task queue
│       ├── deployment.yaml
│       └── service.yaml
└── infrastructure/                  # K8s manifests cho infrastructure
    ├── namespace.yaml
    ├── monitoring/                  # Monitoring stack
    │   ├── prometheus/
    │   └── grafana/
    ├── logging/                     # Logging stack
    │   └── elasticsearch-fluentd-kibana/
    └── cert-manager/                # TLS certificates

.github/workflows/                   # GitHub Actions workflows
├── frontend.yml                     # CI/CD cho frontend
│   # Build, test, và deploy frontend
├── backend.yml                      # CI/CD cho backend
│   # Build, test, và deploy backend
└── blockchain.yml                   # CI/CD cho blockchain
    # Deploy và update smart contracts

monitoring/
├── prometheus/                      # Prometheus cho monitoring
│   ├── prometheus.yml              # Cấu hình Prometheus
│   └── rules/                      # Alert rules
│       ├── blockchain_alerts.yml   # Alerts cho blockchain
│       ├── backend_alerts.yml      # Alerts cho backend
│       └── frontend_alerts.yml     # Alerts cho frontend
├── grafana/                         # Grafana cho visualization
│   ├── dashboards/
│   │   ├── system_overview.json    # Dashboard tổng quan hệ thống
│   │   ├── blockchain_metrics.json # Dashboard metrics cho blockchain
│   │   ├── request_metrics.json    # Dashboard metrics cho requests
│   │   └── user_metrics.json       # Dashboard metrics cho users
│   └── datasources/                # Datasources configuration
└── elastic/                         # ELK stack cho logging
    ├── elasticsearch/
    ├── logstash/
    │   └── pipeline/
    │       └── logstash.conf       # Logstash pipeline configuration
    └── kibana/
        └── dashboards/             # Kibana dashboards

security/
├── ca/                              # Certificate Authority
│   ├── root-ca/                    # Root CA
│   │   ├── config/
│   │   └── scripts/
│   └── intermediate-ca/            # Intermediate CA
│       ├── config/
│       └── scripts/
├── keys/                            # Key templates và management
│   ├── templates/                  # Key templates
│   └── rotation/                   # Key rotation scripts
├── vault/                           # HashiCorp Vault configuration
│   ├── config/
│   └── policies/
│       ├── chairman-policy.hcl     # Policy cho chủ tịch xã
│       ├── officer-policy.hcl      # Policy cho cán bộ xã
│       └── citizen-policy.hcl      # Policy cho công dân
└── policies/                        # Security policies
    ├── access-control.yaml         # Chính sách kiểm soát truy cập
    ├── data-protection.yaml        # Chính sách bảo vệ dữ liệu
    └── encryption.yaml             # Chính sách mã hóa

docs/
├── architecture/                    # Tài liệu kiến trúc
│   ├── overview.md                 # Tổng quan kiến trúc
│   ├── blockchain-architecture.md  # Kiến trúc blockchain
│   ├── backend-architecture.md     # Kiến trúc backend
│   └── frontend-architecture.md    # Kiến trúc frontend
├── api/                             # API documentation
│   ├── openapi.yaml                # OpenAPI specification
│   ├── chairman-api.md             # API dành cho chủ tịch xã
│   ├── officer-api.md              # API dành cho cán bộ xã
│   └── citizen-api.md              # API dành cho công dân
├── user-guides/                     # Hướng dẫn người dùng
│   ├── chairman/                   # Hướng dẫn cho chủ tịch xã
│   │   ├── getting-started.md      # Bắt đầu
│   │   ├── officer-approval.md     # Phê duyệt cán bộ xã
│   │   │   # Chi tiết quy trình phê duyệt cán bộ xã
│   │   ├── document-approval.md    # Phê duyệt giấy tờ quan trọng
│   │   └── reports.md              # Xem báo cáo
│   ├── officer/                    # Hướng dẫn cho cán bộ xã
│   │   ├── getting-started.md      # Bắt đầu
│   │   ├── registration.md         # Đăng ký làm cán bộ
│   │   │   # Quy trình đăng ký và chờ phê duyệt
│   │   ├── processing-requests.md  # Xử lý yêu cầu từ công dân
│   │   └── statistics.md           # Xem thống kê
│   └── citizen/                    # Hướng dẫn cho công dân
│       ├── getting-started.md      # Bắt đầu
│       ├── making-requests.md      # Tạo yêu cầu giấy tờ
│       ├── tracking-requests.md    # Theo dõi tình trạng yêu cầu
│       └── feedback.md             # Gửi phản hồi
└── development/                     # Hướng dẫn phát triển
    ├── setup.md                    # Cài đặt môi trường phát triển
    ├── blockchain-development.md   # Phát triển smart contracts
    ├── backend-development.md      # Phát triển backend
    └── frontend-development.md     # Phát triển frontend

scripts/
├── deployment/                      # Scripts triển khai
│   ├── deploy-dev.sh               # Triển khai môi trường dev
│   ├── deploy-staging.sh           # Triển khai môi trường staging
│   └── deploy-prod.sh              # Triển khai môi trường production
├── blockchain/                      # Scripts cho blockchain
│   ├── setup-network.sh            # Thiết lập mạng blockchain
│   ├── deploy-contracts.sh         # Triển khai smart contracts
│   └── reset-blockchain.sh         # Reset blockchain cho testing
├── data/                            # Scripts cho dữ liệu
│   ├── seed-data.py                # Tạo dữ liệu mẫu
│   ├── import-citizens.py          # Import dữ liệu công dân
│   └── backup-restore.py           # Sao lưu và khôi phục dữ liệu
└── testing/                         # Scripts cho testing
    ├── run-tests.sh                # Chạy tất cả tests
    ├── e2e-test.sh                 # Chạy end-to-end tests
    └── load-test.py                # Chạy load tests
```