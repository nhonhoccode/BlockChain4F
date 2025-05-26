import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  GroupWork as TeamIcon,
  History as HistoryIcon,
  Devices as TechIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  School as EducationIcon,
  Hub as BlockchainIcon,
  EmojiObjects as InnovationIcon,
  Public as GlobalIcon,
  VerifiedUser as VerifiedIcon,
  AccountBalance as GovernmentIcon
} from '@mui/icons-material';
import styles from './AboutPage.module.scss';

const AboutPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Team members data
  const teamMembers = [
    {
      name: 'Nguyễn Văn A',
      role: 'Trưởng nhóm phát triển',
      avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
      description: 'Chuyên gia về blockchain và phát triển ứng dụng phi tập trung với hơn 10 năm kinh nghiệm.'
    },
    {
      name: 'Trần Thị B',
      role: 'Kiến trúc sư hệ thống',
      avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
      description: 'Thiết kế kiến trúc hệ thống backend, tối ưu hiệu năng và khả năng mở rộng của ứng dụng.'
    },
    {
      name: 'Lê Văn C',
      role: 'Chuyên gia bảo mật',
      avatar: 'https://randomuser.me/api/portraits/men/23.jpg',
      description: 'Phụ trách bảo mật hệ thống, quản lý xác thực và quyền truy cập, đảm bảo an toàn dữ liệu.'
    },
    {
      name: 'Phạm Thị D',
      role: 'UI/UX Designer',
      avatar: 'https://randomuser.me/api/portraits/women/17.jpg',
      description: 'Thiết kế giao diện người dùng thân thiện, trải nghiệm mượt mà cho mọi đối tượng sử dụng.'
    }
  ];

  // Technologies data
  const technologies = [
    {
      name: 'Hyperledger Fabric',
      icon: <BlockchainIcon color="primary" />,
      description: 'Nền tảng blockchain doanh nghiệp đảm bảo tính riêng tư và hiệu suất cao.'
    },
    {
      name: 'Zero-Knowledge Proofs',
      icon: <SecurityIcon color="primary" />,
      description: 'Công nghệ xác thực không để lộ thông tin, bảo vệ dữ liệu cá nhân.'
    },
    {
      name: 'ReactJS & Material UI',
      icon: <TechIcon color="primary" />,
      description: 'Xây dựng giao diện người dùng hiện đại, đáp ứng và dễ sử dụng.'
    },
    {
      name: 'Django & RESTful APIs',
      icon: <SpeedIcon color="primary" />,
      description: 'Backend mạnh mẽ với khả năng xử lý lớn và API tiêu chuẩn.'
    },
    {
      name: 'Cryptographic Security',
      icon: <VerifiedIcon color="primary" />,
      description: 'Đảm bảo tính toàn vẹn của dữ liệu và xác thực nguồn gốc tài liệu.'
    }
  ];

  return (
    <Box className={styles.aboutPage}>
      {/* Header Section */}
      <Box className={styles.aboutPage__header}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h1" gutterBottom className={styles.aboutPage__title}>
            Về chúng tôi
          </Typography>
          <Typography variant="body1" className={styles.aboutPage__subtitle}>
            Tìm hiểu về hệ thống Quản lý Hành chính Blockchain của chúng tôi
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" className={styles.aboutPage__container}>
        {/* Mission Section */}
        <Box className={styles.aboutPage__section}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h5" component="h2" gutterBottom className={styles.aboutPage__sectionTitle}>
                Sứ mệnh của chúng tôi
              </Typography>
              <Typography variant="body1" paragraph>
                Chúng tôi cam kết cải thiện hiệu quả và tính minh bạch trong quản lý hành chính cấp xã thông qua việc ứng dụng công nghệ blockchain. Mục tiêu của chúng tôi là giảm thiểu thủ tục hành chính, nâng cao tính xác thực của giấy tờ và tạo môi trường số hóa an toàn cho người dân.
              </Typography>
              <Typography variant="body1" paragraph>
                Bằng cách kết hợp công nghệ blockchain với quy trình quản lý hành chính truyền thống, chúng tôi tạo ra một hệ thống đáng tin cậy, minh bạch và hiệu quả, đồng thời bảo vệ quyền riêng tư của người dân.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} className={styles.aboutPage__missionPaper}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <SecurityIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Bảo mật & Minh bạch" 
                      secondary="Đảm bảo thông tin được bảo mật và mọi giao dịch đều minh bạch, có thể kiểm chứng"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SpeedIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Hiệu quả & Tiết kiệm" 
                      secondary="Giảm thiểu thời gian xử lý và chi phí hành chính"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <EducationIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Đổi mới & Giáo dục" 
                      secondary="Thúc đẩy chuyển đổi số và nâng cao nhận thức về công nghệ blockchain"
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Divider className={styles.aboutPage__divider} />

        {/* Team Section */}
        <Box className={styles.aboutPage__section}>
          <Typography variant="h5" component="h2" gutterBottom className={styles.aboutPage__sectionTitle}>
            <TeamIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Đội ngũ phát triển
          </Typography>
          <Typography variant="body1" paragraph>
            Dự án được phát triển bởi đội ngũ chuyên gia công nghệ và quản lý hành chính với sự tham vấn từ các cơ quan nhà nước.
          </Typography>

          <Grid container spacing={3} className={styles.aboutPage__teamGrid}>
            {teamMembers.map((member, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card className={styles.aboutPage__teamCard}>
                  <CardContent>
                    <Box className={styles.aboutPage__teamMember}>
                      <Avatar 
                        src={member.avatar} 
                        alt={member.name}
                        className={styles.aboutPage__teamAvatar}
                        sx={{ width: 80, height: 80 }}
                      />
                      <Typography variant="h6" component="h3" className={styles.aboutPage__teamName}>
                        {member.name}
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary" className={styles.aboutPage__teamRole}>
                        {member.role}
                      </Typography>
                      <Typography variant="body2" className={styles.aboutPage__teamDescription}>
                        {member.description}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider className={styles.aboutPage__divider} />

        {/* Technologies Section */}
        <Box className={styles.aboutPage__section}>
          <Typography variant="h5" component="h2" gutterBottom className={styles.aboutPage__sectionTitle}>
            <TechIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Công nghệ sử dụng
          </Typography>
          <Typography variant="body1" paragraph>
            Hệ thống của chúng tôi được xây dựng dựa trên các công nghệ hiện đại nhất, đảm bảo tính bảo mật, hiệu suất và khả năng mở rộng.
          </Typography>

          <Grid container spacing={3}>
            {technologies.map((tech, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card className={styles.aboutPage__techCard}>
                  <CardContent>
                    <Box className={styles.aboutPage__techIcon}>
                      {tech.icon}
                    </Box>
                    <Typography variant="h6" component="h3" className={styles.aboutPage__techName}>
                      {tech.name}
                    </Typography>
                    <Typography variant="body2" className={styles.aboutPage__techDescription}>
                      {tech.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default AboutPage; 