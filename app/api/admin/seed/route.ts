import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Random Vietnamese names for seed users
const VIETNAMESE_NAMES = [
  'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Hoàng Cường', 'Phạm Minh Đức',
  'Hoàng Thu Hà', 'Vũ Đình Hùng', 'Đặng Kim Liên', 'Bùi Quang Minh',
  'Đỗ Thị Nga', 'Ngô Thanh Phong', 'Dương Hải Quân', 'Trịnh Văn Sơn',
  'Lý Thúy Trang', 'Võ Anh Tuấn', 'Phan Thị Uyên',
];

// Generate deterministic UUIDs based on name (so they're consistent across runs)
function generateUUID(seed: string): string {
  // Create a simple hash-based UUID v4-like string
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex.slice(0, 8)}-${hex.slice(0, 4)}-4${hex.slice(1, 4)}-a${hex.slice(1, 4)}-${hex.padEnd(12, '0').slice(0, 12)}`;
}

// Generate seed users with proper UUIDs
const SEED_USERS = VIETNAMESE_NAMES.map((name, index) => ({
  id: generateUUID(`ideavault-seed-${name}-${index}`),
  name,
  email: `user${index + 1}@ideavault.demo`,
  image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s/g, '')}`,
  role: 'user' as const,
}));

// 50 seed problems across different categories
const SEED_PROBLEMS = [
  // Tools (8 problems)
  {
    title: 'Khó quản lý mật khẩu cho hàng chục tài khoản online',
    description: `## Vấn đề
Tôi có hơn 50 tài khoản online khác nhau và không thể nhớ hết mật khẩu. Dùng cùng một mật khẩu thì không an toàn.

## Giải pháp hiện tại
Đang ghi vào sổ tay nhưng sợ mất. Các app quản lý mật khẩu thì phức tạp quá.

## Ảnh hưởng
Mất thời gian reset mật khẩu liên tục, đôi khi bị khóa tài khoản.`,
    category: 'tools',
    tags: ['bảo-mật', 'mật-khẩu', 'productivity'],
  },
  {
    title: 'Không có công cụ đơn giản để chuyển đổi file PDF sang Word',
    description: `## Vấn đề
Thường xuyên cần chỉnh sửa file PDF nhưng các công cụ online thì giới hạn hoặc mất phí.

## Giải pháp hiện tại
Dùng các website free nhưng chất lượng kém, định dạng bị lỗi.

## Ảnh hưởng
Phải format lại từ đầu, mất 30-60 phút mỗi lần.`,
    category: 'tools',
    tags: ['pdf', 'converter', 'văn-phòng'],
  },
  {
    title: 'Cần công cụ tự động backup dữ liệu máy tính định kỳ',
    description: `## Vấn đề
Đã từng mất hết dữ liệu vì ổ cứng hỏng. Backup thủ công thì hay quên.

## Giải pháp hiện tại
Copy file vào USB nhưng không đều đặn.

## Ảnh hưởng
Lo lắng mất dữ liệu quan trọng, ảnh kỷ niệm.`,
    category: 'tools',
    tags: ['backup', 'dữ-liệu', 'tự-động'],
  },
  {
    title: 'Khó tìm và xóa file trùng lặp trên máy tính',
    description: `## Vấn đề
Máy tính có hàng nghìn file ảnh, video trùng lặp chiếm hết dung lượng.

## Giải pháp hiện tại
Xóa thủ công nhưng sợ xóa nhầm file gốc.

## Ảnh hưởng
Ổ cứng 500GB gần đầy, máy chạy chậm.`,
    category: 'tools',
    tags: ['dọn-dẹp', 'storage', 'file'],
  },
  {
    title: 'Cần công cụ ghi chú nhanh khi đang làm việc',
    description: `## Vấn đề
Hay có ý tưởng bất chợt khi đang code/làm việc, cần ghi lại ngay nhưng mở app khác thì mất flow.

## Giải pháp hiện tại
Ghi vào Notepad nhưng không sync được giữa các thiết bị.

## Ảnh hưởng
Quên mất những ý tưởng hay.`,
    category: 'tools',
    tags: ['ghi-chú', 'productivity', 'quick-note'],
  },
  {
    title: 'Không có cách dễ dàng để chia sẻ file lớn với đồng nghiệp',
    description: `## Vấn đề
File video, thiết kế thường 2-5GB, không gửi được qua email hay chat.

## Giải pháp hiện tại
Upload lên Google Drive nhưng chậm và hết dung lượng.

## Ảnh hưởng
Delay công việc, phải chia nhỏ file.`,
    category: 'tools',
    tags: ['chia-sẻ', 'file-lớn', 'cloud'],
  },
  {
    title: 'Cần extension trình duyệt để save bài viết đọc sau',
    description: `## Vấn đề
Thấy bài hay muốn đọc sau nhưng hay quên bookmark ở đâu.

## Giải pháp hiện tại
Bookmark nhưng có hàng trăm cái, không phân loại được.

## Ảnh hưởng
Không bao giờ quay lại đọc những bài đã save.`,
    category: 'tools',
    tags: ['bookmark', 'reading', 'browser'],
  },
  {
    title: 'Khó theo dõi thời gian làm việc trên từng project',
    description: `## Vấn đề
Freelancer cần track time cho khách hàng nhưng hay quên bấm timer.

## Giải pháp hiện tại
Ước lượng thời gian nhưng không chính xác.

## Ảnh hưởng
Không biết project nào profitable, tính bill không đúng.`,
    category: 'tools',
    tags: ['time-tracking', 'freelance', 'productivity'],
  },

  // Apps (9 problems)
  {
    title: 'Khó tìm quán ăn ngon gần đây với giá cả phù hợp',
    description: `## Vấn đề
Muốn ăn trưa ngon, giá sinh viên nhưng không biết chỗ nào.

## Giải pháp hiện tại
Hỏi bạn bè hoặc đi thử ngẫu nhiên.

## Ảnh hưởng
Hay ăn phải quán dở, tốn tiền.`,
    category: 'apps',
    tags: ['ẩm-thực', 'review', 'địa-điểm'],
  },
  {
    title: 'Không có app nhắc uống nước đủ mỗi ngày',
    description: `## Vấn đề
Làm việc quên uống nước, cuối ngày mới nhớ là chưa uống gì.

## Giải pháp hiện tại
Đặt alarm nhưng hay tắt đi và quên.

## Ảnh hưởng
Hay bị đau đầu, mệt mỏi do thiếu nước.`,
    category: 'apps',
    tags: ['sức-khỏe', 'reminder', 'thói-quen'],
  },
  {
    title: 'Cần app theo dõi chi tiêu hàng ngày đơn giản',
    description: `## Vấn đề
Không biết tiền đi đâu hết, cuối tháng hay thiếu tiền.

## Giải pháp hiện tại
Ghi vào Excel nhưng lười cập nhật.

## Ảnh hưởng
Chi tiêu vượt ngân sách, không tiết kiệm được.`,
    category: 'apps',
    tags: ['tài-chính', 'chi-tiêu', 'tiết-kiệm'],
  },
  {
    title: 'Khó tìm bạn cùng sở thích chơi thể thao',
    description: `## Vấn đề
Muốn chơi cầu lông, bóng đá nhưng không đủ người.

## Giải pháp hiện tại
Đăng Facebook nhưng ít người thấy.

## Ảnh hưởng
Hay hủy kèo vì thiếu người, lười vận động.`,
    category: 'apps',
    tags: ['thể-thao', 'kết-nối', 'cộng-đồng'],
  },
  {
    title: 'Không có app học tiếng Anh với người bản xứ miễn phí',
    description: `## Vấn đề
Muốn practice speaking với native speaker nhưng các app đều mất phí cao.

## Giải pháp hiện tại
Xem YouTube nhưng không tương tác được.

## Ảnh hưởng
Nói tiếng Anh không tự tin, phát âm sai.`,
    category: 'apps',
    tags: ['ngôn-ngữ', 'tiếng-anh', 'học-tập'],
  },
  {
    title: 'Cần app nhắc nhở uống thuốc cho người già',
    description: `## Vấn đề
Bố mẹ già hay quên uống thuốc huyết áp, tiểu đường.

## Giải pháp hiện tại
Gọi điện nhắc nhưng đi làm không gọi được.

## Ảnh hưởng
Lo lắng sức khỏe bố mẹ, đôi khi quên thuốc cả ngày.`,
    category: 'apps',
    tags: ['sức-khỏe', 'người-già', 'reminder'],
  },
  {
    title: 'Khó đặt lịch hẹn với nhiều người cùng lúc',
    description: `## Vấn đề
Muốn tổ chức họp nhóm, đi chơi nhưng mỗi người một lịch khác.

## Giải pháp hiện tại
Nhắn tin hỏi từng người rồi tổng hợp.

## Ảnh hưởng
Mất hàng giờ để chốt được lịch, hay bị conflict.`,
    category: 'apps',
    tags: ['lịch', 'nhóm', 'scheduling'],
  },
  {
    title: 'Không có app tìm đồ bị mất trong nhà',
    description: `## Vấn đề
Hay mất chìa khóa, remote TV, không nhớ để đâu.

## Giải pháp hiện tại
Tìm khắp nhà, đôi khi mất 30 phút.

## Ảnh hưởng
Trễ giờ đi làm, stress buổi sáng.`,
    category: 'apps',
    tags: ['smart-home', 'tracking', 'đồ-vật'],
  },
  {
    title: 'Cần app chia tiền nhóm khi đi ăn chung',
    description: `## Vấn đề
Đi ăn nhóm 10 người, mỗi người gọi món khác nhau, chia tiền rất khó.

## Giải pháp hiện tại
Chia đều nhưng không công bằng.

## Ảnh hưởng
Ngại rủ bạn đi ăn, sợ tính toán phức tạp.`,
    category: 'apps',
    tags: ['tài-chính', 'nhóm', 'chia-tiền'],
  },

  // Games (8 problems)
  {
    title: 'Thiếu game mobile giải trí nhẹ không cần internet',
    description: `## Vấn đề
Đi tàu xe không có wifi, các game hay đều cần mạng.

## Giải pháp hiện tại
Xem video đã download sẵn.

## Ảnh hưởng
Buồn chán khi di chuyển xa.`,
    category: 'games',
    tags: ['mobile', 'offline', 'giải-trí'],
  },
  {
    title: 'Khó tìm game multiplayer chơi cùng gia đình',
    description: `## Vấn đề
Muốn chơi game với con nhỏ nhưng đa số game quá khó hoặc bạo lực.

## Giải pháp hiện tại
Chơi các game cũ nhàm chán.

## Ảnh hưởng
Ít thời gian chất lượng cùng con.`,
    category: 'games',
    tags: ['gia-đình', 'multiplayer', 'trẻ-em'],
  },
  {
    title: 'Không có game luyện não cho người trung niên',
    description: `## Vấn đề
Bố mẹ muốn chơi game luyện trí nhớ nhưng không biết chọn cái nào.

## Giải pháp hiện tại
Chơi Sudoku trên báo giấy.

## Ảnh hưởng
Trí nhớ giảm sút, ít hoạt động não.`,
    category: 'games',
    tags: ['brain-training', 'người-lớn', 'trí-nhớ'],
  },
  {
    title: 'Cần platform stream game không bị lag ở Việt Nam',
    description: `## Vấn đề
Muốn chơi game AAA nhưng máy yếu, cloud gaming thì lag.

## Giải pháp hiện tại
Chỉ chơi được game nhẹ.

## Ảnh hưởng
Bỏ lỡ nhiều game hay, PC gaming đắt tiền.`,
    category: 'games',
    tags: ['cloud-gaming', 'streaming', 'lag'],
  },
  {
    title: 'Thiếu game học tiếng Anh qua gameplay thú vị',
    description: `## Vấn đề
Con muốn học tiếng Anh nhưng chán các app học truyền thống.

## Giải pháp hiện tại
Xem phim hoạt hình tiếng Anh.

## Ảnh hưởng
Học thụ động, không nhớ từ vựng.`,
    category: 'games',
    tags: ['giáo-dục', 'tiếng-anh', 'trẻ-em'],
  },
  {
    title: 'Không có game thể thao điện tử Việt Nam',
    description: `## Vấn đề
Muốn chơi game về bóng đá V-League, các CLB Việt Nam nhưng không có.

## Giải pháp hiện tại
Chơi FIFA với các đội nước ngoài.

## Ảnh hưởng
Không gắn bó với game vì thiếu yếu tố Việt.`,
    category: 'games',
    tags: ['thể-thao', 'việt-nam', 'bóng-đá'],
  },
  {
    title: 'Khó tìm đội để chơi game ranked cùng skill',
    description: `## Vấn đề
Chơi solo rank hay gặp đồng đội toxic hoặc skill chênh lệch.

## Giải pháp hiện tại
Random queue và cầu may.

## Ảnh hưởng
Thua nhiều, mất rank, stress.`,
    category: 'games',
    tags: ['esports', 'team', 'matchmaking'],
  },
  {
    title: 'Cần app quản lý thời gian chơi game cho con',
    description: `## Vấn đề
Con chơi game quá nhiều, không kiểm soát được.

## Giải pháp hiện tại
Thu điện thoại nhưng con phản đối.

## Ảnh hưởng
Học hành sa sút, mâu thuẫn gia đình.`,
    category: 'games',
    tags: ['parental-control', 'thời-gian', 'trẻ-em'],
  },

  // Business (9 problems)
  {
    title: 'Khó quản lý đơn hàng bán online trên nhiều sàn',
    description: `## Vấn đề
Bán trên Shopee, Lazada, TikTok Shop, mỗi nơi một app quản lý khác.

## Giải pháp hiện tại
Mở nhiều tab, dễ sót đơn.

## Ảnh hưởng
Giao hàng chậm, khách đánh giá 1 sao.`,
    category: 'business',
    tags: ['ecommerce', 'quản-lý', 'bán-hàng'],
  },
  {
    title: 'Không có công cụ tạo invoice chuyên nghiệp miễn phí',
    description: `## Vấn đề
Freelancer cần gửi invoice cho khách nhưng các tool đều mất phí.

## Giải pháp hiện tại
Dùng template Word nhưng không chuyên nghiệp.

## Ảnh hưởng
Khách hàng quốc tế đánh giá thiếu chuyên nghiệp.`,
    category: 'business',
    tags: ['invoice', 'freelance', 'tài-chính'],
  },
  {
    title: 'Cần tool quản lý nhân viên cho quán nhỏ',
    description: `## Vấn đề
Mở quán cafe có 5 nhân viên, không biết ai đi ca nào, lương thế nào.

## Giải pháp hiện tại
Ghi sổ tay, hay sai sót.

## Ảnh hưởng
Nhầm lương, nhân viên bất mãn.`,
    category: 'business',
    tags: ['hr', 'quản-lý', 'sme'],
  },
  {
    title: 'Khó theo dõi tồn kho hàng hóa chính xác',
    description: `## Vấn đề
Cửa hàng có 500 mặt hàng, không biết còn bao nhiêu trong kho.

## Giải pháp hiện tại
Kiểm kê thủ công mỗi tháng.

## Ảnh hưởng
Hết hàng hot không biết, tồn hàng ế nhiều.`,
    category: 'business',
    tags: ['inventory', 'kho', 'quản-lý'],
  },
  {
    title: 'Không có nền tảng tìm mentor khởi nghiệp',
    description: `## Vấn đề
Muốn startup nhưng không có ai chỉ dẫn, dễ mắc sai lầm.

## Giải pháp hiện tại
Đọc sách, xem YouTube.

## Ảnh hưởng
Tốn tiền học phí cuộc đời, thất bại nhiều lần.`,
    category: 'business',
    tags: ['startup', 'mentor', 'học-hỏi'],
  },
  {
    title: 'Cần tool tự động trả lời tin nhắn khách hàng',
    description: `## Vấn đề
Bán hàng online nhận 100+ tin nhắn/ngày, không trả lời kịp.

## Giải pháp hiện tại
Thuê người trực page nhưng tốn tiền.

## Ảnh hưởng
Mất khách vì reply chậm.`,
    category: 'business',
    tags: ['chatbot', 'bán-hàng', 'tự-động'],
  },
  {
    title: 'Khó tìm nguồn hàng giá sỉ uy tín',
    description: `## Vấn đề
Muốn kinh doanh nhưng không biết nhập hàng ở đâu, hay bị lừa.

## Giải pháp hiện tại
Hỏi người quen, tìm trên các group.

## Ảnh hưởng
Nhập phải hàng kém chất lượng, lỗ vốn.`,
    category: 'business',
    tags: ['nguồn-hàng', 'b2b', 'kinh-doanh'],
  },
  {
    title: 'Không có app quản lý công nợ đơn giản',
    description: `## Vấn đề
Bán sỉ cho 50 đại lý, mỗi người nợ khác nhau, không nhớ hết.

## Giải pháp hiện tại
Ghi sổ nợ giấy.

## Ảnh hưởng
Quên thu tiền, thất thoát doanh thu.`,
    category: 'business',
    tags: ['công-nợ', 'tài-chính', 'quản-lý'],
  },
  {
    title: 'Cần nền tảng đánh giá đối tác B2B uy tín',
    description: `## Vấn đề
Muốn hợp tác kinh doanh nhưng không biết đối tác có đáng tin không.

## Giải pháp hiện tại
Check thông tin công ty nhưng không đầy đủ.

## Ảnh hưởng
Hợp tác với đối tác xấu, mất tiền.`,
    category: 'business',
    tags: ['b2b', 'review', 'đối-tác'],
  },

  // Design (8 problems)
  {
    title: 'Khó tìm font chữ tiếng Việt đẹp và miễn phí',
    description: `## Vấn đề
Làm thiết kế cần font Việt hóa nhưng đa số bản quyền hoặc xấu.

## Giải pháp hiện tại
Dùng Google Fonts nhưng ít lựa chọn.

## Ảnh hưởng
Thiết kế không ấn tượng, vi phạm bản quyền.`,
    category: 'design',
    tags: ['font', 'tiếng-việt', 'typography'],
  },
  {
    title: 'Cần tool tạo mockup sản phẩm nhanh',
    description: `## Vấn đề
Cần show thiết kế lên áo, cốc, banner nhưng làm thủ công mất thời gian.

## Giải pháp hiện tại
Dùng Photoshop nhưng phức tạp.

## Ảnh hưởng
Mất 30 phút cho mỗi mockup, deadline gấp.`,
    category: 'design',
    tags: ['mockup', 'sản-phẩm', 'nhanh'],
  },
  {
    title: 'Không có nền tảng feedback thiết kế chuyên nghiệp',
    description: `## Vấn đề
Gửi file cho khách review nhưng feedback qua chat rất lộn xộn.

## Giải pháp hiện tại
Nhận feedback qua Zalo, khách nói không rõ.

## Ảnh hưởng
Hiểu sai ý khách, sửa đi sửa lại nhiều lần.`,
    category: 'design',
    tags: ['feedback', 'collaboration', 'client'],
  },
  {
    title: 'Khó tìm hình ảnh stock phù hợp văn hóa Việt',
    description: `## Vấn đề
Cần hình người Việt, cảnh Việt Nam nhưng stock toàn Tây.

## Giải pháp hiện tại
Dùng hình không liên quan hoặc tự chụp.

## Ảnh hưởng
Thiết kế thiếu bản sắc, không connect với khách Việt.`,
    category: 'design',
    tags: ['stock-image', 'việt-nam', 'hình-ảnh'],
  },
  {
    title: 'Cần tool nén ảnh không giảm chất lượng',
    description: `## Vấn đề
Ảnh thiết kế quá nặng, upload web chậm.

## Giải pháp hiện tại
Nén online nhưng ảnh bị mờ.

## Ảnh hưởng
Website load chậm, SEO kém.`,
    category: 'design',
    tags: ['nén-ảnh', 'optimization', 'web'],
  },
  {
    title: 'Không có app tạo color palette từ ảnh',
    description: `## Vấn đề
Khách gửi ảnh muốn thiết kế theo tone màu đó nhưng khó extract.

## Giải pháp hiện tại
Dùng eyedropper chọn thủ công.

## Ảnh hưởng
Màu sắc không harmonious, phải chỉnh nhiều lần.`,
    category: 'design',
    tags: ['color', 'palette', 'công-cụ'],
  },
  {
    title: 'Thiếu template thiết kế cho mạng xã hội Việt',
    description: `## Vấn đề
Cần template cho Zalo, Facebook Việt nhưng size khác nước ngoài.

## Giải pháp hiện tại
Resize từ template có sẵn.

## Ảnh hưởng
Tỷ lệ sai, bị crop mất nội dung.`,
    category: 'design',
    tags: ['template', 'social-media', 'việt-nam'],
  },
  {
    title: 'Cần platform showcase portfolio cho designer Việt',
    description: `## Vấn đề
Behance, Dribbble toàn designer nước ngoài, khách Việt khó tìm thấy mình.

## Giải pháp hiện tại
Đăng Facebook cá nhân.

## Ảnh hưởng
Ít khách hàng mới, không được đánh giá chuyên nghiệp.`,
    category: 'design',
    tags: ['portfolio', 'showcase', 'việt-nam'],
  },

  // Education (8 problems)
  {
    title: 'Khó tìm gia sư online phù hợp với con',
    description: `## Vấn đề
Con học yếu môn Toán cần gia sư nhưng không biết chọn ai.

## Giải pháp hiện tại
Hỏi qua hội phụ huynh nhưng ít review.

## Ảnh hưởng
Học thử nhiều gia sư mất tiền, con vẫn không tiến bộ.`,
    category: 'education',
    tags: ['gia-sư', 'online', 'học-tập'],
  },
  {
    title: 'Không có app ôn thi đại học có AI chấm điểm',
    description: `## Vấn đề
Con học lớp 12 cần luyện đề nhưng không ai chấm và giải thích.

## Giải pháp hiện tại
Mua sách có đáp án nhưng không hiểu bài.

## Ảnh hưởng
Làm sai vẫn không biết sai ở đâu.`,
    category: 'education',
    tags: ['thi-đại-học', 'AI', 'luyện-đề'],
  },
  {
    title: 'Cần platform học nghề online cho người đi làm',
    description: `## Vấn đề
Muốn học thêm nghề mới nhưng không có thời gian đi học.

## Giải pháp hiện tại
Xem tutorial YouTube nhưng không hệ thống.

## Ảnh hưởng
Học không tới đâu, bỏ cuộc giữa chừng.`,
    category: 'education',
    tags: ['học-nghề', 'online', 'người-đi-làm'],
  },
  {
    title: 'Thiếu app học lập trình cho trẻ em',
    description: `## Vấn đề
Con thích công nghệ nhưng không có khóa học phù hợp lứa tuổi.

## Giải pháp hiện tại
Cho con xem video coding nhưng khó theo.

## Ảnh hưởng
Con mất hứng thú, không phát triển được năng khiếu.`,
    category: 'education',
    tags: ['lập-trình', 'trẻ-em', 'coding'],
  },
  {
    title: 'Không có nền tảng kết nối sinh viên thực tập',
    description: `## Vấn đề
Sinh viên năm cuối cần thực tập nhưng khó tìm công ty nhận.

## Giải pháp hiện tại
Gửi CV qua email ngẫu nhiên.

## Ảnh hưởng
Không có kinh nghiệm thực tế khi ra trường.`,
    category: 'education',
    tags: ['thực-tập', 'sinh-viên', 'việc-làm'],
  },
  {
    title: 'Cần app quản lý bài tập về nhà cho giáo viên',
    description: `## Vấn đề
Giao bài và chấm bài 40 học sinh mỗi lớp rất vất vả.

## Giải pháp hiện tại
Thu vở chấm tay, mất hàng giờ.

## Ảnh hưởng
Không có thời gian cho gia đình, kiệt sức.`,
    category: 'education',
    tags: ['giáo-viên', 'bài-tập', 'quản-lý'],
  },
  {
    title: 'Khó tìm tài liệu học tập tiếng Việt chất lượng',
    description: `## Vấn đề
Học chuyên ngành nhưng sách đều tiếng Anh, không hiểu hết.

## Giải pháp hiện tại
Dịch bằng Google Translate nhưng sai nghĩa.

## Ảnh hưởng
Hiểu sai kiến thức, điểm thấp.`,
    category: 'education',
    tags: ['tài-liệu', 'tiếng-việt', 'chuyên-ngành'],
  },
  {
    title: 'Cần app flashcard thông minh học từ vựng',
    description: `## Vấn đề
Học từ vựng IELTS nhưng hay quên sau vài ngày.

## Giải pháp hiện tại
Viết ra giấy nhưng không review đúng lúc.

## Ảnh hưởng
Học 1000 từ chỉ nhớ 100.`,
    category: 'education',
    tags: ['từ-vựng', 'flashcard', 'IELTS'],
  },
];

export async function POST(request: Request) {
  try {
    // Check secret key for authorization (simpler than admin session)
    const { searchParams } = new URL(request.url);
    const secretKey = searchParams.get('key');
    const expectedKey = process.env.SEED_SECRET_KEY || 'ideavault-seed-2024';

    if (secretKey !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();

    // 1. Get or create seed users
    let usersCreatedCount = 0;
    const userErrors: string[] = [];

    for (const user of SEED_USERS) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingUser) {
        const { error: userError } = await supabase.from('users').insert(user);
        if (userError) {
          userErrors.push(`User ${user.name}: ${userError.message}`);
        } else {
          usersCreatedCount++;
        }
      }
    }

    // 2. Seed categories if not exist
    const SEED_CATEGORIES = [
      { name: 'Công cụ', slug: 'tools', icon: '🔧', color: '#3B82F6' },
      { name: 'Ứng dụng', slug: 'apps', icon: '📱', color: '#10B981' },
      { name: 'Trò chơi', slug: 'games', icon: '🎮', color: '#8B5CF6' },
      { name: 'Kinh doanh', slug: 'business', icon: '💼', color: '#F59E0B' },
      { name: 'Thiết kế', slug: 'design', icon: '🎨', color: '#EC4899' },
      { name: 'Giáo dục', slug: 'education', icon: '📚', color: '#06B6D4' },
    ];

    for (const cat of SEED_CATEGORIES) {
      const { data: existingCat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', cat.slug)
        .single();

      if (!existingCat) {
        await supabase.from('categories').insert(cat);
      } else {
        // Update existing category with new name and icon
        await supabase
          .from('categories')
          .update({ name: cat.name, icon: cat.icon, color: cat.color })
          .eq('slug', cat.slug);
      }
    }

    // 3. Get categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, slug');

    if (catError || !categories || categories.length === 0) {
      return NextResponse.json({
        error: 'Failed to fetch categories',
        details: catError?.message
      }, { status: 500 });
    }

    const categoryMap = new Map(categories.map(c => [c.slug, c.id]));

    // 4. Insert problems
    let successCount = 0;
    const errors: string[] = [];

    for (const problem of SEED_PROBLEMS) {
      const categoryId = categoryMap.get(problem.category);

      if (!categoryId) {
        errors.push(`Category not found: ${problem.category}`);
        continue;
      }

      // Check if problem already exists
      const { data: existing } = await supabase
        .from('ideas')
        .select('id')
        .eq('title', problem.title)
        .single();

      if (existing) {
        continue; // Skip existing
      }

      // Randomly assign to a seed user
      const randomUser = SEED_USERS[Math.floor(Math.random() * SEED_USERS.length)];

      // Insert idea
      const { data: idea, error: ideaError } = await supabase
        .from('ideas')
        .insert({
          title: problem.title,
          description: problem.description,
          category_id: categoryId,
          user_id: randomUser.id,
          status: 'approved',
          vote_count: Math.floor(Math.random() * 50) + 5,
          comment_count: Math.floor(Math.random() * 10),
        })
        .select('id')
        .single();

      if (ideaError) {
        errors.push(`Error inserting "${problem.title}": ${ideaError.message} (code: ${ideaError.code})`);
        continue;
      }

      // Insert tags
      if (problem.tags && problem.tags.length > 0 && idea) {
        for (const tagName of problem.tags) {
          let { data: tag } = await supabase
            .from('tags')
            .select('id')
            .eq('slug', tagName)
            .single();

          if (!tag) {
            const { data: newTag } = await supabase
              .from('tags')
              .insert({ name: tagName, slug: tagName })
              .select('id')
              .single();
            tag = newTag;
          }

          if (tag) {
            await supabase
              .from('idea_tags')
              .insert({ idea_id: idea.id, tag_id: tag.id });
          }
        }
      }

      successCount++;
    }

    return NextResponse.json({
      success: successCount > 0,
      message: `Seeded ${successCount} problems`,
      usersCreated: usersCreatedCount,
      categoriesCreated: SEED_CATEGORIES.length,
      userErrors: userErrors.length > 0 ? userErrors : undefined,
      problemErrors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
