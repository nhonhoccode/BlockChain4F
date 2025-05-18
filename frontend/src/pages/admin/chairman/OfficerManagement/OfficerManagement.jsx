import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Tooltip,
  CircularProgress,
  Typography,
  TablePagination
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import IconButton from '../../../../components/common/Buttons/IconButton';
import officerService from '../../../../services/api/officerService';
import styles from './OfficerManagement.module.scss';

/**
 * Component hiển thị và quản lý danh sách cán bộ xã
 */
const OfficerManagement = ({
  officers = [],
  loading = false,
  onEdit,
  onDelete,
  onView,
  onRefresh
}) => {
  // State cho phân trang
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Xử lý thay đổi trang
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Xử lý thay đổi số hàng trên trang
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Hiển thị trạng thái cán bộ
  const renderStatus = (status) => {
    let color = 'default';
    let label = 'Không xác định';
    let icon = null;

    switch (status) {
      case 'active':
        color = 'success';
        label = 'Đang hoạt động';
        icon = <CheckIcon />;
        break;
      case 'pending':
        color = 'warning';
        label = 'Chờ phê duyệt';
        icon = null;
        break;
      case 'inactive':
        color = 'error';
        label = 'Ngưng hoạt động';
        icon = <CancelIcon />;
        break;
      default:
        break;
    }

    return (
      <Chip
        icon={icon}
        label={label}
        color={color}
        size="small"
        variant="outlined"
      />
    );
  };

  // Hiển thị dữ liệu phân trang
  const displayedOfficers = officers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <div className={styles.officerManagement}>
      <Paper elevation={2} className={styles.tableContainer}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : displayedOfficers.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              Không có dữ liệu cán bộ
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    <TableCell>STT</TableCell>
                    <TableCell>Họ tên</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Số điện thoại</TableCell>
                    <TableCell>Chức vụ</TableCell>
                    <TableCell>Phòng ban</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedOfficers.map((officer, index) => (
                    <TableRow hover key={officer.id}>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>
                        {officer.last_name} {officer.first_name}
                      </TableCell>
                      <TableCell>{officer.email}</TableCell>
                      <TableCell>{officer.phone_number || 'N/A'}</TableCell>
                      <TableCell>{officer.position || 'N/A'}</TableCell>
                      <TableCell>{officer.department || 'N/A'}</TableCell>
                      <TableCell>{renderStatus(officer.status)}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <Tooltip title="Xem chi tiết">
                            <span>
                              <IconButton
                                onClick={() => onView && onView(officer)}
                                color="info"
                                size="small"
                                ariaLabel="Xem chi tiết"
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Chỉnh sửa">
                            <span>
                              <IconButton
                                onClick={() => onEdit && onEdit(officer)}
                                color="primary"
                                size="small"
                                ariaLabel="Chỉnh sửa"
                              >
                                <EditIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Xóa">
                            <span>
                              <IconButton
                                onClick={() => onDelete && onDelete(officer.id)}
                                color="error"
                                size="small"
                                ariaLabel="Xóa"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={officers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Số hàng mỗi trang:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} của ${count}`
              }
            />
          </>
        )}
      </Paper>
    </div>
  );
};

export default OfficerManagement;
