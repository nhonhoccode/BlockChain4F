// Chi tiết thủ tục hành chính bổ sung
export const procedureDetails = {
  // CCCD - CMND
  new_id_card: {
    steps: [
      {
        label: 'Chuẩn bị hồ sơ',
        description: 'Chuẩn bị đầy đủ các giấy tờ cần thiết như Đơn đề nghị cấp CCCD/CMND, Sổ hộ khẩu, Giấy khai sinh và ảnh thẻ theo quy định.',
      },
      {
        label: 'Nộp hồ sơ trực tuyến',
        description: 'Điền đầy đủ thông tin vào biểu mẫu đăng ký trực tuyến và tải lên các giấy tờ đã chuẩn bị.',
      },
      {
        label: 'Thu nhận thông tin sinh trắc học',
        description: 'Đến cơ quan công an theo lịch hẹn để chụp ảnh, lấy vân tay và các thông tin sinh trắc học khác.',
      },
      {
        label: 'Thanh toán lệ phí',
        description: 'Thanh toán lệ phí cấp CCCD/CMND theo quy định hiện hành.',
      },
      {
        label: 'Nhận kết quả',
        description: 'Nhận CCCD/CMND tại cơ quan công an hoặc qua dịch vụ bưu chính công ích theo đăng ký.',
      },
    ],
    legalBasis: [
      'Luật Căn cước công dân số 59/2014/QH13 ngày 20/11/2014',
      'Nghị định số 137/2015/NĐ-CP ngày 31/12/2015 quy định chi tiết một số điều và biện pháp thi hành Luật Căn cước công dân',
      'Thông tư số 66/2015/TT-BCA ngày 15/12/2015 quy định về biểu mẫu sử dụng trong công tác cấp, quản lý thẻ Căn cước công dân'
    ],
    forms: [
      { name: 'Tờ khai cấp CCCD', code: 'CC01', downloadUrl: '/assets/forms/cccd_application_form.html' },
      { name: 'Phiếu thu nhận thông tin CCCD', code: 'CC02', downloadUrl: '/assets/forms/cccd_info_form.html' }
    ],
    locations: [
      'Cơ quan Công an cấp huyện nơi công dân đăng ký thường trú',
      'Cơ quan Công an cấp tỉnh (trong một số trường hợp đặc biệt)'
    ],
    results: 'Thẻ Căn cước công dân/Chứng minh nhân dân',
    notes: 'Công dân từ đủ 14 tuổi trở lên phải làm thủ tục cấp CCCD. Thẻ CCCD gắn chip có giá trị sử dụng 10 năm kể từ ngày cấp.',
    faq: [
      {
        question: 'Tôi có thể làm CCCD ở nơi tạm trú không?',
        answer: 'Có thể, trong trường hợp đặc biệt, công dân có thể làm thủ tục cấp CCCD tại nơi tạm trú. Tuy nhiên, cần có giấy xác nhận của công an nơi thường trú và được sự đồng ý của cơ quan công an nơi tạm trú.'
      },
      {
        question: 'Thời gian cấp CCCD gắn chip mất bao lâu?',
        answer: 'Thông thường, thời gian cấp CCCD gắn chip là 7 ngày làm việc kể từ ngày thu nhận thông tin. Trong một số trường hợp cần xác minh, thời gian có thể kéo dài hơn nhưng không quá 15 ngày làm việc.'
      },
      {
        question: 'Tôi đã đăng ký trực tuyến, có phải đến trực tiếp không?',
        answer: 'Sau khi đăng ký trực tuyến thành công, bạn vẫn cần đến cơ quan công an theo lịch hẹn để thu nhận thông tin sinh trắc học (ảnh, vân tay). Đây là bước bắt buộc không thể thực hiện trực tuyến.'
      }
    ],
    additionalInfo: {
      validityPeriod: '10 năm kể từ ngày cấp',
      replacementConditions: 'Bị mất, bị hỏng, thay đổi thông tin nhân thân, hết hạn',
      importantNotes: 'CCCD gắn chip có thể sử dụng để xác thực điện tử và thực hiện các giao dịch điện tử theo quy định của pháp luật'
    }
  },
  renew_id_card: {
    steps: [
      {
        label: 'Chuẩn bị hồ sơ',
        description: 'Chuẩn bị đầy đủ các giấy tờ cần thiết như Đơn đề nghị cấp đổi CCCD/CMND, CCCD/CMND cũ, và các giấy tờ chứng minh thay đổi thông tin (nếu có).',
      },
      {
        label: 'Nộp hồ sơ trực tuyến',
        description: 'Điền đầy đủ thông tin vào biểu mẫu đăng ký trực tuyến và tải lên các giấy tờ đã chuẩn bị.',
      },
      {
        label: 'Thu nhận thông tin sinh trắc học',
        description: 'Đến cơ quan công an theo lịch hẹn để chụp ảnh, lấy vân tay và cập nhật các thông tin sinh trắc học.',
      },
      {
        label: 'Thanh toán lệ phí',
        description: 'Thanh toán lệ phí cấp đổi CCCD/CMND theo quy định hiện hành.',
      },
      {
        label: 'Nhận kết quả',
        description: 'Nhận CCCD/CMND mới tại cơ quan công an hoặc qua dịch vụ bưu chính công ích theo đăng ký.',
      },
    ],
    legalBasis: [
      'Luật Căn cước công dân số 59/2014/QH13 ngày 20/11/2014',
      'Nghị định số 137/2015/NĐ-CP ngày 31/12/2015 quy định chi tiết một số điều và biện pháp thi hành Luật Căn cước công dân',
      'Thông tư số 07/2016/TT-BCA ngày 01/02/2016 quy định chi tiết một số điều của Luật Căn cước công dân và Nghị định số 137/2015/NĐ-CP'
    ],
    forms: [
      { name: 'Tờ khai cấp đổi CCCD', code: 'CC03', downloadUrl: '/assets/forms/cccd_application_form.html' }
    ],
    locations: [
      'Cơ quan Công an cấp huyện nơi công dân đăng ký thường trú',
      'Cơ quan Công an cấp tỉnh (trong một số trường hợp đặc biệt)'
    ],
    results: 'Thẻ Căn cước công dân/Chứng minh nhân dân mới',
    notes: 'Công dân cần đổi CCCD/CMND khi thẻ bị hư hỏng, thay đổi thông tin nhân thân hoặc hết thời hạn sử dụng. CCCD/CMND cũ sẽ bị thu hồi khi nhận thẻ mới.',
    faq: [
      {
        question: 'Khi nào tôi cần đổi CCCD?',
        answer: 'Bạn cần đổi CCCD trong các trường hợp sau: thẻ bị hư hỏng không sử dụng được; thay đổi thông tin nhân thân (họ, tên, ngày tháng năm sinh...); thay đổi đặc điểm nhận dạng; xác định lại giới tính, quê quán; thẻ hết thời hạn sử dụng; hoặc khi chuyển từ CMND sang CCCD gắn chip.'
      },
      {
        question: 'Tôi đổi từ CMND 9 số sang CCCD gắn chip có mất phí không?',
        answer: 'Có, việc chuyển đổi từ CMND 9 số sang CCCD gắn chip vẫn phải nộp lệ phí theo quy định hiện hành (50.000 VNĐ). Tuy nhiên, một số đối tượng đặc biệt có thể được miễn lệ phí theo quy định.'
      },
      {
        question: 'CCCD/CMND cũ của tôi có còn giá trị sử dụng không?',
        answer: 'CCCD/CMND cũ vẫn có giá trị sử dụng cho đến khi bạn nhận được thẻ mới. Khi nhận thẻ mới, CCCD/CMND cũ sẽ bị thu hồi. Trong trường hợp CMND 9 số còn thời hạn, bạn vẫn có thể tiếp tục sử dụng cho đến khi hết hạn, nhưng khuyến khích chuyển đổi sang CCCD gắn chip.'
      }
    ],
    additionalInfo: {
      validityPeriod: '10 năm kể từ ngày cấp',
      replacementFee: '50.000 VNĐ',
      importantNotes: 'Khi thay đổi nơi thường trú, công dân không cần đổi CCCD nhưng phải thực hiện thủ tục cập nhật thông tin trong Cơ sở dữ liệu quốc gia về dân cư'
    }
  },

  // Thêm các thủ tục khác
  permanent_residence: {
    steps: [
      {
        label: 'Chuẩn bị hồ sơ',
        description: 'Chuẩn bị đầy đủ các giấy tờ cần thiết như Đơn đăng ký thường trú, CCCD/CMND, Giấy chứng nhận chỗ ở hợp pháp và các giấy tờ liên quan khác.',
      },
      {
        label: 'Nộp hồ sơ trực tuyến',
        description: 'Điền đầy đủ thông tin vào biểu mẫu đăng ký trực tuyến và tải lên các giấy tờ đã chuẩn bị.',
      },
      {
        label: 'Xác minh thông tin',
        description: 'Cơ quan công an sẽ tiến hành xác minh thông tin và chỗ ở hợp pháp của công dân.',
      },
      {
        label: 'Thanh toán lệ phí',
        description: 'Thanh toán lệ phí đăng ký thường trú theo quy định hiện hành.',
      },
      {
        label: 'Nhận kết quả',
        description: 'Nhận kết quả đăng ký thường trú và cập nhật thông tin trong sổ hộ khẩu/hệ thống cư trú điện tử.',
      },
    ],
    legalBasis: [
      'Luật Cư trú số 68/2020/QH14 ngày 13/11/2020',
      'Nghị định số 62/2021/NĐ-CP ngày 29/6/2021 quy định chi tiết một số điều của Luật Cư trú',
      'Thông tư số 55/2021/TT-BCA ngày 15/5/2021 quy định chi tiết một số điều và biện pháp thi hành Luật Cư trú'
    ],
    forms: [
      { name: 'Phiếu báo thay đổi hộ khẩu, nhân khẩu (HK02)', code: 'HK02', downloadUrl: '/assets/forms/permanent_residence_form.html' }
    ],
    locations: [
      'Công an cấp xã nơi công dân đăng ký thường trú',
      'Cổng Dịch vụ công quốc gia hoặc Cổng Dịch vụ công Bộ Công an'
    ],
    results: 'Thông tin thường trú được cập nhật trong Cơ sở dữ liệu về cư trú',
    notes: 'Từ ngày 01/07/2021, sổ hộ khẩu giấy không còn được cấp mới. Thông tin cư trú của công dân được quản lý bằng phương thức điện tử.',
    faq: [
      {
        question: 'Tôi có cần mang theo sổ hộ khẩu khi đi làm thủ tục không?',
        answer: 'Từ ngày 01/01/2023, công dân không cần phải xuất trình sổ hộ khẩu khi thực hiện thủ tục hành chính, dịch vụ công. Thay vào đó, bạn chỉ cần cung cấp thông tin số định danh cá nhân.'
      },
      {
        question: 'Tôi có thể đăng ký thường trú tại nơi tôi đang thuê nhà không?',
        answer: 'Có thể, nếu bạn có giấy tờ chứng minh chỗ ở hợp pháp như hợp đồng thuê nhà có công chứng và được chủ nhà đồng ý cho đăng ký thường trú.'
      },
      {
        question: 'Sau khi đăng ký thường trú thành công, tôi có được cấp giấy xác nhận không?',
        answer: 'Có, sau khi đăng ký thường trú thành công, bạn sẽ được cấp giấy xác nhận thông tin cư trú. Thông tin này cũng được cập nhật trong Cơ sở dữ liệu quốc gia về dân cư và có thể tra cứu trực tuyến.'
      }
    ]
  },
  
  birth_registration: {
    steps: [
      {
        label: 'Chuẩn bị hồ sơ',
        description: 'Chuẩn bị đầy đủ các giấy tờ cần thiết như Giấy chứng sinh, CMND/CCCD của cha/mẹ, Sổ hộ khẩu/Giấy đăng ký thường trú và các giấy tờ liên quan khác.',
      },
      {
        label: 'Nộp hồ sơ trực tuyến',
        description: 'Điền đầy đủ thông tin vào biểu mẫu đăng ký khai sinh trực tuyến và tải lên các giấy tờ đã chuẩn bị.',
      },
      {
        label: 'Xác thực thông tin',
        description: 'Hệ thống blockchain sẽ xác thực tính hợp lệ của các giấy tờ đã nộp và thông tin khai báo.',
      },
      {
        label: 'Nhận kết quả',
        description: 'Nhận Giấy khai sinh điện tử có xác thực blockchain hoặc đến cơ quan có thẩm quyền để nhận bản giấy chính thức.',
      },
    ],
    legalBasis: [
      'Luật Hộ tịch số 60/2014/QH13 ngày 20/11/2014',
      'Nghị định số 123/2015/NĐ-CP ngày 15/11/2015 của Chính phủ quy định chi tiết một số điều và biện pháp thi hành Luật Hộ tịch',
      'Thông tư số 04/2020/TT-BTP ngày 28/5/2020 của Bộ Tư pháp quy định chi tiết thi hành một số điều của Luật Hộ tịch và Nghị định số 123/2015/NĐ-CP'
    ],
    forms: [
      { name: 'Tờ khai đăng ký khai sinh', code: 'TP/HT-2020-KS', downloadUrl: '/assets/forms/birth_registration_form.html' }
    ],
    locations: [
      'Ủy ban nhân dân cấp xã nơi cư trú của người cha hoặc người mẹ',
      'Cơ quan đăng ký hộ tịch có thẩm quyền tại Việt Nam nơi người cha hoặc người mẹ cư trú'
    ],
    results: 'Giấy khai sinh (bản chính)',
    notes: 'Việc đăng ký khai sinh cho trẻ em phải được thực hiện trong thời hạn 60 ngày kể từ ngày sinh con. Nếu quá thời hạn này, người đi đăng ký khai sinh có thể bị xử phạt hành chính theo quy định.',
    faq: [
      {
        question: 'Tôi có thể đăng ký khai sinh cho con tôi khi chưa có giấy chứng sinh không?',
        answer: 'Có thể, nhưng sẽ cần thêm thủ tục xác định quan hệ cha mẹ con. Bạn cần cung cấp các giấy tờ chứng minh việc sinh con và mối quan hệ cha mẹ con.'
      },
      {
        question: 'Tôi có thể ủy quyền cho người khác đi đăng ký khai sinh cho con tôi không?',
        answer: 'Có thể. Người được ủy quyền cần mang theo giấy ủy quyền có xác nhận của chính quyền địa phương, cùng với các giấy tờ cần thiết khác.'
      }
    ]
  },

  // Thêm thủ tục đăng ký kết hôn
  marriage_registration: {
    steps: [
      {
        label: 'Chuẩn bị hồ sơ',
        description: 'Chuẩn bị đầy đủ các giấy tờ cần thiết như Tờ khai đăng ký kết hôn, CCCD/CMND của hai bên, Giấy xác nhận tình trạng hôn nhân và các giấy tờ liên quan khác.',
      },
      {
        label: 'Nộp hồ sơ trực tuyến',
        description: 'Điền đầy đủ thông tin vào biểu mẫu đăng ký kết hôn trực tuyến và tải lên các giấy tờ đã chuẩn bị.',
      },
      {
        label: 'Xác thực thông tin',
        description: 'Hệ thống blockchain sẽ xác thực tính hợp lệ của các giấy tờ đã nộp và thông tin khai báo.',
      },
      {
        label: 'Tổ chức đăng ký kết hôn',
        description: 'Hai bên nam nữ đến cơ quan đăng ký kết hôn để tham dự lễ đăng ký kết hôn theo lịch hẹn.',
      },
      {
        label: 'Nhận kết quả',
        description: 'Nhận Giấy chứng nhận kết hôn có xác thực blockchain.',
      },
    ],
    legalBasis: [
      'Luật Hôn nhân và Gia đình số 52/2014/QH13 ngày 19/6/2014',
      'Nghị định số 123/2015/NĐ-CP ngày 15/11/2015 của Chính phủ quy định chi tiết một số điều và biện pháp thi hành Luật Hộ tịch',
      'Thông tư số 04/2020/TT-BTP ngày 28/5/2020 của Bộ Tư pháp quy định chi tiết thi hành một số điều của Luật Hộ tịch và Nghị định số 123/2015/NĐ-CP'
    ],
    forms: [
      { name: 'Tờ khai đăng ký kết hôn', code: 'TP/HT-2020-KH', downloadUrl: '/assets/forms/marriage_registration_form.html' }
    ],
    locations: [
      'Ủy ban nhân dân cấp xã nơi cư trú của một trong hai bên nam nữ',
      'Ủy ban nhân dân cấp xã nơi đăng ký thường trú của một trong hai bên'
    ],
    results: 'Giấy chứng nhận kết hôn (02 bản chính)',
    notes: 'Nam từ đủ 20 tuổi, nữ từ đủ 18 tuổi trở lên mới đủ điều kiện đăng ký kết hôn. Cả hai bên phải tự nguyện kết hôn và không thuộc trường hợp cấm kết hôn theo quy định của pháp luật.',
    faq: [
      {
        question: 'Tôi đã ly hôn, khi đăng ký kết hôn lần hai cần thêm giấy tờ gì?',
        answer: 'Ngoài các giấy tờ thông thường, bạn cần nộp thêm bản sao trích lục ghi chú ly hôn hoặc bản sao trích lục hộ tịch đã ghi chú việc ly hôn.'
      },
      {
        question: 'Tôi và bạn gái tôi hiện đang sống tại hai địa phương khác nhau, chúng tôi có thể đăng ký kết hôn ở đâu?',
        answer: 'Hai bạn có thể chọn đăng ký kết hôn tại Ủy ban nhân dân cấp xã nơi cư trú của một trong hai người, tùy theo sự thuận tiện.'
      },
      {
        question: 'Việc đăng ký kết hôn có thể ủy quyền cho người khác không?',
        answer: 'Không. Cả hai bên nam nữ phải trực tiếp có mặt tại cơ quan đăng ký hộ tịch để ký vào Sổ đăng ký kết hôn và nhận Giấy chứng nhận kết hôn.'
      }
    ],
    additionalInfo: {
      fee: 'Miễn lệ phí đăng ký kết hôn',
      processTime: '3-5 ngày làm việc',
      validityPeriod: 'Vĩnh viễn'
    }
  },

  // Thêm thủ tục cấp giấy phép lái xe
  driving_license: {
    steps: [
      {
        label: 'Chuẩn bị hồ sơ',
        description: 'Chuẩn bị đầy đủ các giấy tờ cần thiết như Đơn đề nghị cấp GPLX, CCCD/CMND, Giấy khám sức khỏe và các giấy tờ liên quan khác.',
      },
      {
        label: 'Đăng ký học và thi sát hạch',
        description: 'Đăng ký khóa học lái xe phù hợp với hạng bằng lái mong muốn và tham gia kỳ thi sát hạch lý thuyết và thực hành.',
      },
      {
        label: 'Nộp hồ sơ trực tuyến',
        description: 'Sau khi đạt kỳ thi sát hạch, điền đầy đủ thông tin vào biểu mẫu đăng ký trực tuyến và tải lên các giấy tờ đã chuẩn bị.',
      },
      {
        label: 'Thanh toán lệ phí',
        description: 'Thanh toán lệ phí cấp GPLX theo quy định hiện hành.',
      },
      {
        label: 'Nhận kết quả',
        description: 'Nhận GPLX tại cơ quan có thẩm quyền hoặc qua dịch vụ bưu chính công ích theo đăng ký.',
      },
    ],
    legalBasis: [
      'Luật Giao thông đường bộ số 23/2008/QH12 ngày 13/11/2008',
      'Thông tư số 12/2017/TT-BGTVT ngày 15/4/2017 của Bộ Giao thông vận tải quy định về đào tạo, sát hạch, cấp giấy phép lái xe cơ giới đường bộ',
      'Thông tư số 38/2019/TT-BGTVT ngày 08/10/2019 sửa đổi, bổ sung một số điều Thông tư số 12/2017/TT-BGTVT'
    ],
    forms: [
      { name: 'Đơn đề nghị cấp giấy phép lái xe', code: '01/GPLX-2023', downloadUrl: '/assets/forms/driving_license_form.html' }
    ],
    locations: [
      'Sở Giao thông vận tải các tỉnh/thành phố',
      'Trung tâm sát hạch lái xe có thẩm quyền'
    ],
    results: 'Giấy phép lái xe',
    notes: 'Người đủ 18 tuổi trở lên và đáp ứng đủ điều kiện sức khỏe có thể đăng ký cấp GPLX. Thời hạn giấy phép lái xe phụ thuộc vào hạng bằng và độ tuổi của người lái xe.',
    faq: [
      {
        question: 'Tôi bị mất GPLX, làm thế nào để được cấp lại?',
        answer: 'Bạn cần nộp hồ sơ đề nghị cấp lại GPLX tại Sở GTVT nơi cư trú. Hồ sơ bao gồm: đơn đề nghị cấp lại, CMND/CCCD, giấy khám sức khỏe và các giấy tờ liên quan khác. Nếu GPLX còn trong hệ thống dữ liệu, bạn không cần thi lại.'
      },
      {
        question: 'GPLX hạng A1 có thời hạn bao lâu?',
        answer: 'GPLX hạng A1 có thời hạn không thời hạn (vĩnh viễn). Tuy nhiên, các hạng GPLX khác như B1, B2, C, D, E có thời hạn từ 5-10 năm tùy theo độ tuổi của người lái xe.'
      },
      {
        question: 'Tôi có thể đổi GPLX quốc tế khi đến Việt Nam không?',
        answer: 'Có, người nước ngoài có GPLX quốc tế hoặc GPLX của nước ngoài có thể đổi sang GPLX Việt Nam tương ứng. Tuy nhiên, GPLX nước ngoài phải còn giá trị sử dụng và phải được dịch sang tiếng Việt có chứng thực.'
      }
    ],
    additionalInfo: {
      fee: 'Từ 135.000 đến 600.000 VNĐ tùy theo hạng bằng',
      validityPeriod: 'Tùy theo hạng bằng và độ tuổi, từ 5 năm đến vĩnh viễn',
      trainingTime: 'Từ 1 đến 6 tháng tùy theo hạng bằng'
    }
  },

  // Thêm thủ tục cập nhật thông tin công dân
  citizen_update: {
    steps: [
      {
        label: 'Chuẩn bị hồ sơ',
        description: 'Chuẩn bị đầy đủ các giấy tờ cần thiết như Đơn cập nhật thông tin công dân, CCCD/CMND, và các giấy tờ chứng minh thông tin cần thay đổi.',
      },
      {
        label: 'Nộp hồ sơ trực tuyến',
        description: 'Điền đầy đủ thông tin vào biểu mẫu đăng ký trực tuyến và tải lên các giấy tờ đã chuẩn bị.',
      },
      {
        label: 'Xác minh thông tin',
        description: 'Hệ thống blockchain sẽ xác minh tính chính xác của các thông tin được cung cấp và các giấy tờ đã nộp.',
      },
      {
        label: 'Thanh toán lệ phí',
        description: 'Thanh toán lệ phí cập nhật thông tin theo quy định hiện hành (nếu có).',
      },
      {
        label: 'Nhận kết quả',
        description: 'Nhận thông báo xác nhận cập nhật thông tin thành công trên hệ thống và các giấy tờ có thông tin mới (nếu cần).',
      },
    ],
    legalBasis: [
      'Luật Cư trú số 68/2020/QH14 ngày 13/11/2020',
      'Luật Căn cước công dân số 59/2014/QH13 ngày 20/11/2014',
      'Nghị định số 104/2022/NĐ-CP ngày 21/12/2022 về việc sửa đổi, bổ sung một số điều của các Nghị định liên quan đến việc nộp, xuất trình sổ hộ khẩu, sổ tạm trú giấy khi thực hiện thủ tục hành chính, cung cấp dịch vụ công'
    ],
    forms: [
      { name: 'Đơn cập nhật thông tin công dân', code: 'CD01-CNTCD', downloadUrl: '/assets/forms/citizen_update_form.html' }
    ],
    locations: [
      'Cổng Dịch vụ công quốc gia',
      'Cơ quan Công an nơi công dân đăng ký thường trú',
      'Cơ quan hành chính cấp huyện/tỉnh theo phân cấp quản lý'
    ],
    results: 'Thông tin công dân được cập nhật trong Cơ sở dữ liệu quốc gia về dân cư',
    notes: 'Từ ngày 01/01/2023, việc cập nhật thông tin công dân được thực hiện trực tuyến, không yêu cầu người dân phải xuất trình sổ hộ khẩu, sổ tạm trú giấy.',
    faq: [
      {
        question: 'Tôi cần cập nhật nơi thường trú, cần những giấy tờ gì?',
        answer: 'Bạn cần chuẩn bị: CCCD/CMND, giấy tờ chứng minh chỗ ở hợp pháp tại nơi thường trú mới (sổ đỏ, hợp đồng thuê nhà công chứng, giấy đồng ý cho ở nhờ có xác nhận của địa phương), và đơn đề nghị cập nhật nơi thường trú.'
      },
      {
        question: 'Tôi có thể đề nghị cập nhật thông tin cho người khác không?',
        answer: 'Có thể, nhưng chỉ trong trường hợp bạn là người đại diện hợp pháp (cha mẹ, người giám hộ) hoặc được ủy quyền hợp pháp có xác nhận của cơ quan có thẩm quyền. Bạn cần mang theo giấy ủy quyền và CCCD/CMND của mình.'
      },
      {
        question: 'Sau khi cập nhật thông tin, các giấy tờ liên quan có bị ảnh hưởng không?',
        answer: 'Có, sau khi cập nhật thông tin cá nhân như họ tên, ngày sinh, hay nơi thường trú, bạn cần cập nhật thông tin trên các giấy tờ quan trọng khác như bằng lái xe, hộ chiếu, sổ BHXH, v.v. để đảm bảo tính thống nhất thông tin.'
      }
    ],
    additionalInfo: {
      fee: 'Miễn phí đối với cập nhật thông tin cư trú, phí cấp đổi CCCD khi thay đổi thông tin: 50.000 VNĐ',
      processTime: '3-5 ngày làm việc',
      note: 'Người dân có trách nhiệm cập nhật thông tin cá nhân khi có thay đổi trong thời hạn 15 ngày kể từ ngày có sự thay đổi'
    }
  },

  // Thêm thủ tục cấp hộ chiếu
  passport_application: {
    steps: [
      {
        label: 'Chuẩn bị hồ sơ',
        description: 'Chuẩn bị đầy đủ các giấy tờ cần thiết như Đơn xin cấp hộ chiếu, CCCD/CMND, ảnh thẻ và các giấy tờ liên quan khác.',
      },
      {
        label: 'Nộp hồ sơ trực tuyến',
        description: 'Điền đầy đủ thông tin vào biểu mẫu đăng ký trực tuyến và tải lên các giấy tờ đã chuẩn bị.',
      },
      {
        label: 'Xác minh thông tin',
        description: 'Hệ thống blockchain sẽ xác minh tính chính xác của các thông tin được cung cấp và các giấy tờ đã nộp.',
      },
      {
        label: 'Thanh toán lệ phí',
        description: 'Thanh toán lệ phí cấp hộ chiếu theo quy định hiện hành.',
      },
      {
        label: 'Nhận kết quả',
        description: 'Nhận hộ chiếu tại cơ quan có thẩm quyền hoặc qua dịch vụ bưu chính công ích theo đăng ký.',
      },
    ],
    legalBasis: [
      'Luật Xuất cảnh, nhập cảnh của công dân Việt Nam số 49/2019/QH14 ngày 22/11/2019',
      'Nghị định số 76/2023/NĐ-CP ngày 31/10/2023 quy định chi tiết một số điều của Luật Xuất cảnh, nhập cảnh của công dân Việt Nam',
      'Thông tư số 25/2021/TT-BCA ngày 12/3/2021 của Bộ Công an quy định về mẫu hộ chiếu, giấy thông hành và các biểu mẫu liên quan'
    ],
    forms: [
      { name: 'Tờ khai đề nghị cấp hộ chiếu phổ thông', code: 'X01', downloadUrl: '/assets/forms/passport_application_form.html' }
    ],
    locations: [
      'Cơ quan Công an cấp tỉnh/thành phố trực thuộc Trung ương (nơi công dân thường trú)',
      'Cục Quản lý xuất nhập cảnh (Bộ Công an)',
      'Các Cơ quan đại diện Việt Nam ở nước ngoài (đối với công dân đang ở nước ngoài)'
    ],
    results: 'Hộ chiếu phổ thông',
    notes: 'Thời hạn của hộ chiếu phổ thông là 10 năm kể từ ngày cấp và không được gia hạn. Riêng hộ chiếu cấp cho trẻ em dưới 14 tuổi có thời hạn 5 năm.',
    faq: [
      {
        question: 'Thời gian nhận hộ chiếu sau khi nộp hồ sơ là bao lâu?',
        answer: 'Thông thường, thời gian cấp hộ chiếu là 8 ngày làm việc kể từ ngày nhận đủ hồ sơ hợp lệ. Trong trường hợp cần xác minh nhân thân, thời gian có thể kéo dài hơn nhưng không quá 15 ngày làm việc.'
      },
      {
        question: 'Tôi có thể làm hộ chiếu cho con dưới 14 tuổi không?',
        answer: 'Có thể. Trẻ em dưới 14 tuổi được cấp hộ chiếu riêng. Cha, mẹ hoặc người giám hộ làm thủ tục đề nghị cấp hộ chiếu cho trẻ em. Hộ chiếu của trẻ em có thời hạn 5 năm.'
      },
      {
        question: 'Tôi đang ở nước ngoài, có thể làm hộ chiếu tại Đại sứ quán Việt Nam không?',
        answer: 'Có thể. Công dân Việt Nam đang ở nước ngoài có thể nộp hồ sơ đề nghị cấp hộ chiếu tại Cơ quan đại diện Việt Nam ở nước sở tại. Thủ tục và hồ sơ tương tự như trong nước, có thể có một số yêu cầu bổ sung tùy theo quy định của từng Cơ quan đại diện.'
      }
    ],
    additionalInfo: {
      fee: 'Từ 200.000 đến 400.000 VNĐ tùy loại hộ chiếu',
      validityPeriod: '10 năm đối với người từ 14 tuổi trở lên, 5 năm đối với trẻ em dưới 14 tuổi',
      documentDelivery: 'Trực tiếp tại cơ quan cấp hoặc qua dịch vụ bưu chính công ích'
    }
  }
};

export default procedureDetails;  