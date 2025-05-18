// Get status chip color and icon
const getStatusInfo = (status: string): StatusInfo => {
  switch (status) {
    case 'completed':
    case 'approved':
    case 'issued':
      return { 
        color: 'success', 
        label: 'Hoàn thành', 
        icon: <VerifiedIcon fontSize="small" /> 
      };
    case 'pending':
    case 'submitted':
    case 'draft':
      return { 
        color: 'warning', 
        label: 'Đang chờ', 
        icon: <PendingIcon fontSize="small" /> 
      };
    case 'processing':
    case 'in_review':
    case 'additional_info_requested':
      return { 
        color: 'info', 
        label: 'Đang xử lý', 
        icon: <TrendingUpIcon fontSize="small" /> 
      };
    case 'rejected':
      return { 
        color: 'error', 
        label: 'Từ chối', 
        icon: <RejectedIcon fontSize="small" /> 
      };
    default:
      return { 
        color: 'default', 
        label: status, 
        icon: <InfoIcon fontSize="small" />
      };
  }
};

<Chip
  size="small"
  icon={statusInfo.icon || <InfoIcon fontSize="small" />}
  label={statusInfo.label}
  color={statusInfo.color}
/> 