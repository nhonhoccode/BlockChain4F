// Danh mục thủ tục hành chính
export const procedureCategories = {
  civil: {
    id: 'civil',
    name: 'Hộ tịch - Dân sự',
    description: 'Các thủ tục liên quan đến khai sinh, khai tử, kết hôn và các vấn đề dân sự khác'
  },
  residence: {
    id: 'residence',
    name: 'Cư trú',
    description: 'Đăng ký thường trú, tạm trú và các vấn đề liên quan đến cư trú'
  },
  identity: {
    id: 'identity',
    name: 'CCCD - CMND',
    description: 'Cấp mới, đổi, cấp lại CCCD, CMND và các giấy tờ tùy thân'
  },
  land: {
    id: 'land',
    name: 'Đất đai - Nhà ở',
    description: 'Cấp giấy chứng nhận quyền sử dụng đất, đăng ký quyền sở hữu nhà ở'
  },
  business: {
    id: 'business',
    name: 'Kinh doanh',
    description: 'Đăng ký kinh doanh hộ cá thể, giấy phép kinh doanh'
  },
  education: {
    id: 'education',
    name: 'Giáo dục',
    description: 'Các thủ tục liên quan đến giáo dục, đào tạo'
  },
  transportation: {
    id: 'transportation',
    name: 'Giao thông',
    description: 'Đăng ký phương tiện, giấy phép lái xe'
  },
  health: {
    id: 'health',
    name: 'Y tế - Bảo hiểm',
    description: 'Bảo hiểm y tế, bảo hiểm xã hội và các vấn đề y tế'
  },
  other: {
    id: 'other',
    name: 'Thủ tục khác',
    description: 'Các thủ tục hành chính khác'
  }
};

// Dữ liệu thủ tục hành chính theo danh mục
export const procedures = {
  civil: [
    {
      id: 'birth_registration',
      name: 'Đăng ký khai sinh',
      description: 'Đăng ký khai sinh cho trẻ em mới sinh hoặc chưa đăng ký khai sinh',
      processingTime: '3-5 ngày làm việc',
      requiredDocuments: [
        'Giấy chứng sinh do cơ sở y tế cấp',
        'CMND/CCCD của cha/mẹ',
        'Sổ hộ khẩu/Giấy đăng ký thường trú',
        'Giấy chứng nhận kết hôn của cha mẹ (nếu có)',
        'Văn bản ủy quyền (nếu ủy quyền cho người khác đăng ký)'
      ],
      fee: 'Miễn phí',
      blockchainVerified: true,
      detailedDescription: 'Đăng ký khai sinh là thủ tục hành chính cơ bản, xác lập quyền công dân cho trẻ em mới sinh. Thủ tục này được thực hiện tại UBND cấp xã nơi cư trú của người cha hoặc người mẹ. Sau khi đăng ký khai sinh, trẻ sẽ được cấp giấy khai sinh, là cơ sở để thực hiện các quyền công dân khác như đăng ký thường trú, cấp thẻ bảo hiểm y tế, đi học, v.v.'
    },
    {
      id: 'marriage_registration',
      name: 'Đăng ký kết hôn',
      description: 'Đăng ký kết hôn cho công dân Việt Nam',
      processingTime: '7 ngày làm việc',
      requiredDocuments: [
        'CMND/CCCD của cả hai bên',
        'Giấy xác nhận tình trạng hôn nhân của cả hai bên',
        'Giấy khám sức khỏe tiền hôn nhân (nếu có)',
        'Sổ hộ khẩu/Giấy đăng ký thường trú của cả hai bên'
      ],
      fee: '30.000 VNĐ',
      blockchainVerified: true,
      detailedDescription: 'Đăng ký kết hôn là thủ tục pháp lý bắt buộc để xác lập quan hệ vợ chồng được pháp luật công nhận. Việc đăng ký kết hôn phải tuân thủ các điều kiện về độ tuổi, tình trạng hôn nhân và mối quan hệ họ hàng theo quy định của Luật Hôn nhân và Gia đình. Sau khi đăng ký, cặp vợ chồng sẽ được cấp Giấy chứng nhận kết hôn.'
    },
    {
      id: 'death_registration',
      name: 'Đăng ký khai tử',
      description: 'Đăng ký khai tử cho người đã mất',
      processingTime: '3 ngày làm việc',
      requiredDocuments: [
        'Giấy báo tử/Giấy chứng tử do cơ sở y tế cấp',
        'CMND/CCCD của người đi đăng ký',
        'CMND/CCCD của người mất',
        'Sổ hộ khẩu/Giấy đăng ký thường trú có tên người mất',
        'Giấy tờ chứng minh quan hệ với người mất (nếu người đăng ký không phải là thân nhân)'
      ],
      fee: 'Miễn phí',
      blockchainVerified: true,
      detailedDescription: 'Đăng ký khai tử là thủ tục pháp lý bắt buộc khi có người qua đời, nhằm xác nhận sự kiện chết của một người và làm cơ sở cho việc giải quyết các vấn đề liên quan đến di sản, bảo hiểm, trợ cấp và các quyền lợi khác. Việc đăng ký khai tử phải được thực hiện trong vòng 15 ngày kể từ ngày người đó chết.'
    }
  ],
  residence: [
    {
      id: 'permanent_residence',
      name: 'Đăng ký thường trú',
      description: 'Đăng ký thường trú cho công dân chuyển đến nơi ở mới',
      processingTime: '7 ngày làm việc',
      requiredDocuments: [
        'Đơn đăng ký thường trú (theo mẫu)',
        'CMND/CCCD',
        'Giấy chứng nhận chỗ ở hợp pháp (Giấy chứng nhận quyền sử dụng đất, hợp đồng mua bán nhà, hợp đồng thuê nhà...)',
        'Sổ hộ khẩu (nếu chuyển từ nơi khác đến)',
        'Giấy tờ chứng minh quan hệ với chủ hộ (nếu đăng ký nhập vào hộ khác)'
      ],
      fee: '15.000 VNĐ',
      blockchainVerified: true,
      detailedDescription: 'Đăng ký thường trú là thủ tục hành chính xác nhận nơi cư trú chính thức, ổn định lâu dài của công dân. Việc đăng ký thường trú giúp công dân thực hiện các quyền và nghĩa vụ công dân tại nơi cư trú, như tham gia bầu cử, hưởng các chính sách an sinh xã hội, đăng ký học cho con em, v.v.'
    },
    {
      id: 'temporary_residence',
      name: 'Đăng ký tạm trú',
      description: 'Đăng ký tạm trú cho công dân tạm thời cư trú tại địa phương',
      processingTime: '2 ngày làm việc',
      requiredDocuments: [
        'Đơn đăng ký tạm trú (theo mẫu)',
        'CMND/CCCD',
        'Giấy tờ chứng minh chỗ ở (hợp đồng thuê nhà, giấy xác nhận của chủ nhà...)',
        'Giấy xác nhận của công an nơi thường trú (nếu cần)'
      ],
      fee: '10.000 VNĐ',
      blockchainVerified: true,
      detailedDescription: 'Đăng ký tạm trú là thủ tục hành chính xác nhận việc công dân tạm thời cư trú tại một địa điểm không phải nơi thường trú của họ. Thủ tục này áp dụng cho những người cư trú tạm thời tại một địa phương trong thời gian từ 30 ngày trở lên. Việc đăng ký tạm trú giúp công dân thực hiện các quyền và nghĩa vụ tại nơi tạm trú, đồng thời giúp cơ quan chức năng quản lý dân cư hiệu quả.'
    }
  ],
  identity: [
    {
      id: 'new_id_card',
      name: 'Cấp mới CCCD/CMND',
      description: 'Cấp mới Căn cước công dân hoặc Chứng minh nhân dân',
      processingTime: '7 ngày làm việc',
      requiredDocuments: [
        'Đơn đề nghị cấp CCCD/CMND (theo mẫu)',
        'Sổ hộ khẩu/Giấy đăng ký thường trú',
        'Giấy khai sinh (bản sao có chứng thực)',
        '02 ảnh 3x4cm nền trắng, chụp trong vòng 6 tháng'
      ],
      fee: '70.000 VNĐ',
      blockchainVerified: true,
      detailedDescription: 'Cấp mới CCCD/CMND là thủ tục hành chính cơ bản để cấp giấy tờ tùy thân cho công dân từ đủ 14 tuổi trở lên. Căn cước công dân là giấy tờ tùy thân chứa đựng thông tin cơ bản về nhân thân của công dân, được sử dụng để chứng minh và xác định danh tính trong các giao dịch hành chính, dân sự và các hoạt động khác theo quy định của pháp luật.'
    },
    {
      id: 'renew_id_card',
      name: 'Cấp đổi CCCD/CMND',
      description: 'Cấp đổi Căn cước công dân hoặc Chứng minh nhân dân do hết hạn hoặc thay đổi thông tin',
      processingTime: '7 ngày làm việc',
      requiredDocuments: [
        'Đơn đề nghị cấp đổi CCCD/CMND (theo mẫu)',
        'CCCD/CMND cũ',
        'Sổ hộ khẩu/Giấy đăng ký thường trú',
        'Giấy tờ chứng minh thay đổi thông tin (nếu có)',
        '02 ảnh 3x4cm nền trắng, chụp trong vòng 6 tháng'
      ],
      fee: '50.000 VNĐ',
      blockchainVerified: true,
      detailedDescription: 'Cấp đổi CCCD/CMND là thủ tục áp dụng khi công dân cần thay đổi thông tin trên CCCD/CMND, khi CCCD/CMND bị hư hỏng không sử dụng được, hoặc khi CCCD/CMND hết hạn sử dụng. Việc cấp đổi CCCD/CMND đảm bảo thông tin nhân thân của công dân luôn được cập nhật chính xác và giấy tờ tùy thân luôn trong tình trạng sử dụng tốt.'
    },
    {
      id: 'citizen_update',
      name: 'Cập nhật thông tin công dân',
      description: 'Cập nhật, thay đổi thông tin cá nhân trong Cơ sở dữ liệu quốc gia về dân cư',
      processingTime: '3-5 ngày làm việc',
      requiredDocuments: [
        'Đơn cập nhật thông tin công dân',
        'CCCD/CMND hiện tại',
        'Các giấy tờ chứng minh thông tin thay đổi',
        'Sổ hộ khẩu/Giấy đăng ký thường trú (nếu có)'
      ],
      fee: 'Miễn phí (cập nhật thông tin cư trú), 50.000 VNĐ (cấp đổi CCCD khi thay đổi thông tin)',
      blockchainVerified: true,
      detailedDescription: 'Cập nhật thông tin công dân là thủ tục hành chính để thay đổi, cập nhật thông tin cá nhân trong Cơ sở dữ liệu quốc gia về dân cư. Thủ tục này áp dụng khi công dân có sự thay đổi về họ tên, ngày tháng năm sinh, địa chỉ thường trú, hoặc các thông tin nhân thân khác. Việc cập nhật thông tin kịp thời giúp đảm bảo tính chính xác của dữ liệu công dân và thuận lợi trong các giao dịch hành chính sau này.'
    },
    {
      id: 'passport_application',
      name: 'Cấp hộ chiếu phổ thông',
      description: 'Cấp mới, cấp đổi, gia hạn hộ chiếu phổ thông cho công dân',
      processingTime: '8 ngày làm việc',
      requiredDocuments: [
        'Tờ khai đề nghị cấp hộ chiếu phổ thông',
        'CCCD/CMND',
        'Ảnh 4x6cm nền trắng',
        'Hộ chiếu cũ (đối với trường hợp cấp đổi, gia hạn)',
        'Giấy tờ chứng minh thay đổi thông tin (nếu có)'
      ],
      fee: '200.000 VNĐ - 400.000 VNĐ',
      blockchainVerified: true,
      detailedDescription: 'Hộ chiếu phổ thông là giấy tờ quan trọng để công dân xuất cảnh, nhập cảnh qua biên giới các quốc gia. Thủ tục cấp hộ chiếu được thực hiện tại Cơ quan Công an cấp tỉnh/thành phố hoặc tại Cục Quản lý xuất nhập cảnh (Bộ Công an). Hộ chiếu phổ thông có thời hạn 10 năm kể từ ngày cấp đối với người từ 14 tuổi trở lên, và 5 năm đối với trẻ em dưới 14 tuổi.'
    }
  ],
  land: [
    {
      id: 'land_certificate',
      name: 'Cấp GCN quyền sử dụng đất',
      description: 'Cấp Giấy chứng nhận quyền sử dụng đất, quyền sở hữu nhà ở và tài sản khác gắn liền với đất',
      processingTime: '30 ngày làm việc',
      requiredDocuments: [
        'Đơn đăng ký cấp GCN (theo mẫu)',
        'Giấy tờ chứng minh nguồn gốc sử dụng đất (hợp đồng mua bán, tặng cho, thừa kế...)',
        'Bản đồ hiện trạng sử dụng đất',
        'Giấy tờ về tài sản gắn liền với đất (nếu có)',
        'Chứng từ đã nộp nghĩa vụ tài chính (nếu có)'
      ],
      fee: 'Theo quy định của địa phương',
      blockchainVerified: true,
      detailedDescription: 'Cấp Giấy chứng nhận quyền sử dụng đất (sổ đỏ) là thủ tục hành chính quan trọng nhằm xác lập quyền sử dụng đất hợp pháp cho người dân. Giấy chứng nhận này là cơ sở pháp lý để người dân thực hiện các quyền như chuyển nhượng, cho thuê, thế chấp, tặng cho, góp vốn bằng quyền sử dụng đất. Thủ tục này được thực hiện tại Văn phòng đăng ký đất đai cấp huyện hoặc Chi nhánh Văn phòng đăng ký đất đai.'
    },
    {
      id: 'land_transfer',
      name: 'Chuyển nhượng quyền sử dụng đất',
      description: 'Đăng ký biến động do chuyển nhượng quyền sử dụng đất, quyền sở hữu tài sản gắn liền với đất',
      processingTime: '10 ngày làm việc',
      requiredDocuments: [
        'Hợp đồng chuyển nhượng quyền sử dụng đất (công chứng)',
        'GCN quyền sử dụng đất (bản gốc)',
        'CMND/CCCD của các bên',
        'Đơn đăng ký biến động đất đai (theo mẫu)',
        'Chứng từ nộp thuế (nếu có)'
      ],
      fee: 'Theo quy định của địa phương',
      blockchainVerified: true,
      detailedDescription: 'Chuyển nhượng quyền sử dụng đất là thủ tục pháp lý để đăng ký việc chuyển giao quyền sử dụng đất từ người này sang người khác thông qua hợp đồng chuyển nhượng. Sau khi hoàn thành thủ tục, người nhận chuyển nhượng sẽ được cấp Giấy chứng nhận quyền sử dụng đất mới hoặc được cập nhật thông tin trên Giấy chứng nhận cũ. Thủ tục này đảm bảo tính pháp lý của việc chuyển nhượng và bảo vệ quyền lợi của các bên tham gia giao dịch.'
    }
  ],
  business: [
    {
      id: 'business_registration',
      name: 'Đăng ký kinh doanh hộ cá thể',
      description: 'Đăng ký kinh doanh cho hộ kinh doanh cá thể',
      processingTime: '3 ngày làm việc',
      requiredDocuments: [
        'Đơn đăng ký kinh doanh (theo mẫu)',
        'CMND/CCCD của chủ hộ kinh doanh',
        'Giấy tờ chứng minh quyền sử dụng địa điểm kinh doanh',
        'Giấy chứng nhận đủ điều kiện kinh doanh (đối với ngành nghề có điều kiện)',
        'Bản sao hộ khẩu của chủ hộ kinh doanh'
      ],
      fee: '100.000 VNĐ',
      blockchainVerified: true,
      detailedDescription: 'Đăng ký kinh doanh hộ cá thể là thủ tục hành chính dành cho cá nhân, nhóm cá nhân hoặc hộ gia đình muốn thực hiện hoạt động kinh doanh quy mô nhỏ. Sau khi đăng ký, hộ kinh doanh sẽ được cấp Giấy chứng nhận đăng ký hộ kinh doanh, là cơ sở pháp lý để hoạt động kinh doanh hợp pháp, kê khai và nộp thuế theo quy định. Thủ tục này được thực hiện tại Phòng Tài chính - Kế hoạch cấp huyện.'
    }
  ],
  education: [
    {
      id: 'education_cert',
      name: 'Xác nhận văn bằng, chứng chỉ',
      description: 'Xác nhận văn bằng, chứng chỉ do cơ sở giáo dục cấp',
      processingTime: '5 ngày làm việc',
      requiredDocuments: [
        'Đơn đề nghị xác minh văn bằng (theo mẫu)',
        'Bản sao văn bằng cần xác minh',
        'CMND/CCCD của người yêu cầu xác minh',
        'Giấy ủy quyền (nếu người yêu cầu không phải là người có văn bằng)'
      ],
      fee: '30.000 VNĐ',
      blockchainVerified: true,
      detailedDescription: 'Xác nhận văn bằng, chứng chỉ là thủ tục hành chính nhằm xác minh tính chính xác và hợp pháp của văn bằng, chứng chỉ do các cơ sở giáo dục cấp. Thủ tục này thường được thực hiện khi người có văn bằng cần sử dụng văn bằng để xin việc, du học, hoặc các mục đích khác mà bên tiếp nhận yêu cầu xác minh. Việc xác nhận văn bằng giúp ngăn chặn tình trạng sử dụng văn bằng giả hoặc không hợp pháp.'
    }
  ],
  transportation: [
    {
      id: 'vehicle_registration',
      name: 'Đăng ký xe máy',
      description: 'Đăng ký, cấp biển số xe máy mới',
      processingTime: '2 ngày làm việc',
      requiredDocuments: [
        'Đơn đề nghị đăng ký xe (theo mẫu)',
        'Hóa đơn mua xe',
        'CMND/CCCD',
        'Giấy tờ nguồn gốc xe (phiếu kiểm tra chất lượng xuất xưởng, tờ khai hải quan...)',
        'Giấy chứng nhận thu hồi đăng ký, biển số xe (nếu là xe đã qua sử dụng)'
      ],
      fee: '50.000 VNĐ',
      blockchainVerified: true,
      detailedDescription: 'Đăng ký xe máy là thủ tục hành chính bắt buộc đối với tất cả các phương tiện xe máy tham gia giao thông. Sau khi đăng ký, chủ xe sẽ được cấp Giấy chứng nhận đăng ký xe và biển số xe. Việc đăng ký xe giúp xác lập quyền sở hữu hợp pháp đối với phương tiện, đồng thời giúp cơ quan chức năng quản lý phương tiện giao thông, đảm bảo an toàn giao thông và an ninh trật tự.'
    },
    {
      id: 'driving_license',
      name: 'Cấp giấy phép lái xe',
      description: 'Cấp mới giấy phép lái xe các hạng A1, A2, A3, B1, B2, C',
      processingTime: '10 ngày làm việc',
      requiredDocuments: [
        'Đơn đề nghị học, sát hạch để cấp GPLX',
        'CMND/CCCD',
        'Giấy khám sức khỏe của người lái xe',
        'Chứng chỉ tốt nghiệp khoá đào tạo',
        '04 ảnh 3x4cm nền màu xanh'
      ],
      fee: '135.000 VNĐ - 590.000 VNĐ (tùy theo hạng xe)',
      blockchainVerified: true,
      detailedDescription: 'Giấy phép lái xe là giấy tờ pháp lý bắt buộc để điều khiển phương tiện giao thông đường bộ. Việc cấp GPLX nhằm đảm bảo người điều khiển phương tiện đã được đào tạo và có đủ kiến thức, kỹ năng về luật giao thông đường bộ, có đủ sức khỏe và khả năng điều khiển phương tiện tham gia giao thông an toàn.'
    }
  ],
  health: [
    {
      id: 'health_insurance',
      name: 'Cấp thẻ bảo hiểm y tế',
      description: 'Cấp mới hoặc cấp lại thẻ bảo hiểm y tế',
      processingTime: '7 ngày làm việc',
      requiredDocuments: [
        'Đơn đề nghị cấp thẻ BHYT (theo mẫu)',
        'CMND/CCCD',
        'Ảnh 3x4',
        'Giấy tờ chứng minh thuộc đối tượng được hưởng BHYT (nếu có)',
        'Biên lai đóng tiền BHYT (đối với trường hợp tự đóng)'
      ],
      fee: 'Theo quy định hiện hành',
      blockchainVerified: true,
      detailedDescription: 'Cấp thẻ bảo hiểm y tế là thủ tục hành chính để cấp mới hoặc cấp lại thẻ BHYT cho người tham gia bảo hiểm y tế. Thẻ BHYT là giấy tờ quan trọng để người dân được hưởng các quyền lợi khám chữa bệnh theo quy định của pháp luật về bảo hiểm y tế. Việc cấp thẻ BHYT được thực hiện tại cơ quan Bảo hiểm xã hội các cấp hoặc đại lý thu BHXH, BHYT.'
    }
  ],
  other: [
    {
      id: 'criminal_record',
      name: 'Cấp phiếu lý lịch tư pháp',
      description: 'Cấp phiếu lý lịch tư pháp cho cá nhân có nhu cầu',
      processingTime: '10-15 ngày làm việc',
      requiredDocuments: [
        'Tờ khai yêu cầu cấp Phiếu lý lịch tư pháp (theo mẫu)',
        'CMND/CCCD hoặc hộ chiếu',
        'Giấy tờ chứng minh nơi cư trú',
        'Văn bản ủy quyền (nếu thực hiện thông qua người được ủy quyền)',
        'Các giấy tờ chứng minh là cha, mẹ, vợ, chồng, con của người được cấp Phiếu lý lịch tư pháp (nếu người yêu cầu là người thân)'
      ],
      fee: '200.000 VNĐ',
      blockchainVerified: true,
      detailedDescription: 'Phiếu lý lịch tư pháp là giấy tờ do cơ quan quản lý cơ sở dữ liệu lý lịch tư pháp cấp để chứng minh một người có hay không có án tích, không bị cấm đảm nhiệm chức vụ, thành lập, quản lý doanh nghiệp, hợp tác xã trong trường hợp doanh nghiệp, hợp tác xã bị thu hồi Giấy chứng nhận đăng ký vì lý do an ninh, trật tự.'
    },
    {
      id: 'notarization',
      name: 'Công chứng, chứng thực',
      description: 'Công chứng, chứng thực các loại giấy tờ, văn bản theo quy định',
      processingTime: '1-2 ngày làm việc',
      requiredDocuments: [
        'Văn bản/giấy tờ cần công chứng, chứng thực',
        'CMND/CCCD của người yêu cầu',
        'Giấy tờ chứng minh quyền sở hữu/sử dụng đối với tài sản (nếu công chứng giao dịch về tài sản)',
        'Các giấy tờ khác theo quy định của pháp luật tùy thuộc loại việc công chứng'
      ],
      fee: 'Theo quy định cho từng loại việc',
      blockchainVerified: true,
      detailedDescription: 'Công chứng là việc công chứng viên của một tổ chức hành nghề công chứng chứng nhận tính xác thực, hợp pháp của hợp đồng, giao dịch hoặc các loại giấy tờ, văn bản khác theo quy định của pháp luật. Chứng thực là việc cơ quan có thẩm quyền chứng thực bản sao từ bản chính, chứng thực chữ ký trong giấy tờ, văn bản.'
    },
    {
      id: 'building_permit',
      name: 'Cấp giấy phép xây dựng',
      description: 'Cấp giấy phép xây dựng nhà ở, công trình theo quy định',
      processingTime: '20 ngày làm việc',
      requiredDocuments: [
        'Đơn đề nghị cấp giấy phép xây dựng (theo mẫu)',
        'Bản sao giấy tờ chứng minh quyền sử dụng đất',
        'Bản vẽ thiết kế xây dựng',
        'Bản kê khai năng lực của tổ chức thiết kế',
        'Bản cam kết bảo đảm an toàn với công trình lân cận'
      ],
      fee: '100.000 VNĐ',
      blockchainVerified: true,
      detailedDescription: 'Giấy phép xây dựng là giấy tờ pháp lý do cơ quan nhà nước có thẩm quyền cấp cho chủ đầu tư để xây dựng mới, sửa chữa, cải tạo, di dời công trình. Việc cấp giấy phép xây dựng nhằm quản lý trật tự xây dựng, đảm bảo công trình được xây dựng tuân thủ quy hoạch, thiết kế và các quy định pháp luật liên quan.'
    },
    {
      id: 'social_insurance',
      name: 'Đăng ký tham gia BHXH tự nguyện',
      description: 'Đăng ký tham gia bảo hiểm xã hội tự nguyện cho người dân',
      processingTime: '5 ngày làm việc',
      requiredDocuments: [
        'Tờ khai tham gia BHXH tự nguyện (theo mẫu)',
        'CMND/CCCD',
        'Sổ BHXH (nếu đã tham gia BHXH bắt buộc trước đó)',
        'Giấy ủy quyền (nếu thực hiện thông qua người được ủy quyền)'
      ],
      fee: 'Theo mức đóng BHXH tự nguyện',
      blockchainVerified: true,
      detailedDescription: 'Bảo hiểm xã hội tự nguyện là loại hình bảo hiểm xã hội do người tham gia đóng phí, được lựa chọn mức đóng và phương thức đóng phù hợp với thu nhập của mình để hưởng BHXH. Người tham gia BHXH tự nguyện sẽ được hưởng các chế độ hưu trí và tử tuất theo quy định của pháp luật về BHXH.'
    },
    {
      id: 'disability_certificate',
      name: 'Cấp giấy xác nhận khuyết tật',
      description: 'Cấp giấy xác nhận khuyết tật cho người khuyết tật',
      processingTime: '25 ngày làm việc',
      requiredDocuments: [
        'Đơn đề nghị xác định, xác định lại mức độ khuyết tật (theo mẫu)',
        'CMND/CCCD hoặc Giấy khai sinh',
        'Bản sao các giấy tờ y tế chứng minh về khuyết tật (nếu có)',
        'Các giấy tờ khác có liên quan'
      ],
      fee: 'Miễn phí',
      blockchainVerified: true,
      detailedDescription: 'Giấy xác nhận khuyết tật là giấy tờ chứng nhận một người bị khuyết tật, xác định dạng khuyết tật và mức độ khuyết tật. Giấy xác nhận khuyết tật là cơ sở để người khuyết tật được hưởng các chính sách, quyền lợi, chế độ ưu đãi của Nhà nước dành cho người khuyết tật.'
    },
    {
      id: 'environmental_license',
      name: 'Cấp giấy phép môi trường',
      description: 'Cấp giấy phép môi trường cho dự án, cơ sở sản xuất kinh doanh',
      processingTime: '15-30 ngày làm việc',
      requiredDocuments: [
        'Văn bản đề nghị cấp giấy phép môi trường (theo mẫu)',
        'Báo cáo đề xuất cấp giấy phép môi trường',
        'Bản sao Giấy chứng nhận đăng ký doanh nghiệp',
        'Bản sao quyết định phê duyệt kết quả thẩm định báo cáo đánh giá tác động môi trường (nếu có)',
        'Các giấy tờ, tài liệu khác liên quan'
      ],
      fee: 'Theo quy định hiện hành',
      blockchainVerified: true,
      detailedDescription: 'Giấy phép môi trường là văn bản do cơ quan quản lý nhà nước có thẩm quyền cấp cho tổ chức, cá nhân để xả thải vào môi trường, thực hiện dịch vụ xử lý chất thải, nhập khẩu phế liệu từ nước ngoài làm nguyên liệu sản xuất hoặc thực hiện các hoạt động khác về môi trường theo quy định của Luật Bảo vệ Môi trường.'
    },
    {
      id: 'business_license',
      name: 'Cấp giấy phép kinh doanh',
      description: 'Cấp giấy phép kinh doanh cho các loại hình doanh nghiệp',
      processingTime: '3-5 ngày làm việc',
      requiredDocuments: [
        'Giấy đề nghị đăng ký doanh nghiệp (theo mẫu)',
        'Điều lệ công ty (đối với công ty TNHH, công ty cổ phần)',
        'Danh sách thành viên/cổ đông sáng lập (theo mẫu)',
        'CMND/CCCD của người đại diện pháp luật',
        'Giấy tờ chứng minh vốn pháp định (đối với ngành nghề có yêu cầu)',
        'Giấy chứng nhận đăng ký đầu tư (đối với doanh nghiệp có vốn đầu tư nước ngoài)'
      ],
      fee: '100.000 VNĐ - 300.000 VNĐ (tùy loại hình doanh nghiệp)',
      blockchainVerified: true,
      detailedDescription: 'Giấy phép kinh doanh/Giấy chứng nhận đăng ký doanh nghiệp là giấy tờ pháp lý chứng nhận việc đăng ký thành lập doanh nghiệp, có giá trị pháp lý về tư cách pháp nhân của doanh nghiệp. Đây là giấy tờ bắt buộc để doanh nghiệp hoạt động hợp pháp trên thị trường.'
    },
    {
      id: 'tourist_visa',
      name: 'Cấp thị thực du lịch',
      description: 'Cấp thị thực (visa) cho người nước ngoài vào du lịch tại Việt Nam',
      processingTime: '5-7 ngày làm việc',
      requiredDocuments: [
        'Đơn xin cấp thị thực (theo mẫu)',
        'Hộ chiếu gốc còn hạn ít nhất 6 tháng',
        'Ảnh 4x6cm nền trắng (chụp không quá 6 tháng)',
        'Lệ phí xin thị thực',
        'Giấy tờ chứng minh mục đích du lịch (đặt phòng khách sạn, lịch trình du lịch...)',
        'Xác nhận của công ty du lịch (nếu đi theo tour)'
      ],
      fee: '25 USD - 95 USD (tùy loại thị thực)',
      blockchainVerified: true,
      detailedDescription: 'Thị thực du lịch (Tourist Visa) là loại giấy phép nhập cảnh cấp cho người nước ngoài có nhu cầu vào Việt Nam với mục đích tham quan, du lịch, thăm thân. Thị thực du lịch thường có thời hạn từ 30 ngày đến 3 tháng tùy theo yêu cầu của người xin cấp.'
    },
    {
      id: 'vaccination_certificate',
      name: 'Cấp giấy chứng nhận tiêm chủng',
      description: 'Cấp giấy chứng nhận tiêm chủng vắc-xin cho người dân',
      processingTime: '1-3 ngày làm việc',
      requiredDocuments: [
        'Đơn đề nghị cấp giấy chứng nhận tiêm chủng (theo mẫu)',
        'CMND/CCCD',
        'Sổ tiêm chủng cá nhân (nếu có)',
        'Hộ chiếu (nếu cấp giấy chứng nhận quốc tế)'
      ],
      fee: 'Miễn phí (đối với tiêm chủng trong chương trình quốc gia)/200.000 VNĐ (đối với chứng nhận quốc tế)',
      blockchainVerified: true,
      detailedDescription: 'Giấy chứng nhận tiêm chủng là giấy tờ xác nhận việc một người đã được tiêm vắc-xin phòng bệnh. Giấy chứng nhận này có thể được yêu cầu khi đi du lịch, học tập, làm việc ở nước ngoài hoặc trong các trường hợp cần chứng minh tình trạng tiêm chủng.'
    },
    {
      id: 'property_registration',
      name: 'Đăng ký tài sản thế chấp',
      description: 'Đăng ký tài sản thế chấp (nhà đất, ô tô, máy móc thiết bị...)',
      processingTime: '3-5 ngày làm việc',
      requiredDocuments: [
        'Phiếu yêu cầu đăng ký tài sản thế chấp (theo mẫu)',
        'Hợp đồng thế chấp (công chứng/chứng thực)',
        'Giấy tờ chứng minh quyền sở hữu tài sản thế chấp',
        'CMND/CCCD của bên thế chấp và bên nhận thế chấp',
        'Các giấy tờ khác theo quy định'
      ],
      fee: '80.000 VNĐ - 150.000 VNĐ',
      blockchainVerified: true,
      detailedDescription: 'Đăng ký tài sản thế chấp là thủ tục pháp lý để ghi nhận việc một tài sản đang được dùng để bảo đảm thực hiện nghĩa vụ dân sự (thường là khoản vay). Việc đăng ký thế chấp giúp công khai hóa thông tin về tình trạng pháp lý của tài sản, tránh tranh chấp và bảo vệ quyền lợi của các bên liên quan.'
    },
    {
      id: 'trademark_registration',
      name: 'Đăng ký nhãn hiệu',
      description: 'Đăng ký bảo hộ nhãn hiệu, thương hiệu cho cá nhân, tổ chức',
      processingTime: '12-24 tháng',
      requiredDocuments: [
        'Tờ khai đăng ký nhãn hiệu (theo mẫu)',
        'Mẫu nhãn hiệu (10 mẫu kích thước không quá 80x80mm)',
        'Danh mục hàng hóa, dịch vụ mang nhãn hiệu cần bảo hộ',
        'Quy chế sử dụng nhãn hiệu (đối với nhãn hiệu tập thể, nhãn hiệu chứng nhận)',
        'Giấy ủy quyền (nếu nộp đơn thông qua đại diện)',
        'Chứng từ nộp phí'
      ],
      fee: '1.000.000 VNĐ - 3.500.000 VNĐ (tùy số lượng nhóm sản phẩm)',
      blockchainVerified: true,
      detailedDescription: 'Đăng ký nhãn hiệu là thủ tục pháp lý để bảo hộ quyền sở hữu trí tuệ đối với nhãn hiệu hàng hóa, dịch vụ. Việc đăng ký nhãn hiệu giúp chủ sở hữu có độc quyền sử dụng nhãn hiệu đó và có quyền ngăn cấm người khác sử dụng trái phép nhãn hiệu của mình trong hoạt động kinh doanh.'
    },
    {
      id: 'scholarship_application',
      name: 'Đăng ký học bổng chính phủ',
      description: 'Đăng ký xét duyệt học bổng chính phủ trong và ngoài nước',
      processingTime: '30-90 ngày',
      requiredDocuments: [
        'Đơn xin học bổng (theo mẫu)',
        'Lý lịch cá nhân có xác nhận của địa phương',
        'Bảng điểm, văn bằng, chứng chỉ học tập',
        'Giấy chứng nhận sức khỏe',
        'Chứng chỉ ngoại ngữ (đối với học bổng nước ngoài)',
        'Thư giới thiệu của giáo viên/giảng viên',
        'Kế hoạch học tập, nghiên cứu',
        'Chứng minh hoàn cảnh khó khăn (nếu có)'
      ],
      fee: 'Miễn phí',
      blockchainVerified: true,
      detailedDescription: 'Đăng ký học bổng chính phủ là thủ tục để xét duyệt cấp học bổng từ ngân sách nhà nước cho học sinh, sinh viên có thành tích học tập xuất sắc hoặc thuộc diện chính sách. Học bổng có thể là học bổng trong nước hoặc học bổng du học tại các nước theo hiệp định giữa Việt Nam và nước ngoài.'
    },
    {
      id: 'pension_application',
      name: 'Đăng ký hưởng chế độ hưu trí',
      description: 'Đăng ký hưởng chế độ hưu trí cho người lao động đủ điều kiện',
      processingTime: '20 ngày làm việc',
      requiredDocuments: [
        'Đơn đề nghị hưởng chế độ hưu trí (theo mẫu)',
        'Sổ bảo hiểm xã hội',
        'CMND/CCCD',
        'Quyết định nghỉ việc để hưởng chế độ hưu trí',
        'Giấy ủy quyền (nếu có người đại diện)',
        'Biên bản giám định mức suy giảm khả năng lao động (đối với trường hợp nghỉ hưu trước tuổi do suy giảm khả năng lao động)',
        'Các giấy tờ chứng minh điều kiện về thời gian làm việc trong điều kiện đặc biệt (nếu có)'
      ],
      fee: 'Miễn phí',
      blockchainVerified: true,
      detailedDescription: 'Đăng ký hưởng chế độ hưu trí là thủ tục để người lao động đã tham gia bảo hiểm xã hội đủ điều kiện về tuổi đời và thời gian đóng BHXH được nhận lương hưu hàng tháng. Để được hưởng chế độ hưu trí, người lao động phải đáp ứng điều kiện về tuổi nghỉ hưu và thời gian đóng BHXH tối thiểu theo quy định của Luật Bảo hiểm xã hội.'
    }
  ]
}; 